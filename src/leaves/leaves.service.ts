import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import { LeaveRequest, LeaveRequestDocument } from './models/leave-request.schema';
import { LeaveEntitlement, LeaveEntitlementDocument } from './models/leave-entitlement.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import { LeaveCategory, LeaveCategoryDocument } from './models/leave-category.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { CreateLeaveTypeDto, ConfigureLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';
import {
  SubmitLeaveRequestDto,
  ReviewLeaveRequestDto,
  AdjustLeaveBalanceDto,
  BulkProcessLeaveRequestsDto,
  AssignEntitlementDto,
} from './dto/leave-request.dto';
import { LeaveStatus } from './enums/leave-status.enum';
import { AccrualMethod } from './enums/accrual-method.enum';
import { RoundingRule } from './enums/rounding-rule.enum';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveTypeDocument>,
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveEntitlement.name) private leaveEntitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeavePolicy.name) private leavePolicyModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveCategory.name) private leaveCategoryModel: Model<LeaveCategoryDocument>,
    @InjectModel(Calendar.name) private calendarModel: Model<CalendarDocument>,
  ) {}

  // ========== LEAVE TYPE MANAGEMENT ==========

  async createLeaveType(createDto: CreateLeaveTypeDto): Promise<LeaveType> {
    const existingType = await this.leaveTypeModel.findOne({ code: createDto.code });
    if (existingType) {
      throw new ConflictException(`Leave type with code ${createDto.code} already exists`);
    }

    const category = await this.leaveCategoryModel.findById(createDto.categoryId);
    if (!category) {
      throw new NotFoundException(`Leave category not found`);
    }

    const leaveType = new this.leaveTypeModel(createDto);
    return leaveType.save();
  }

  async configureLeaveType(configDto: ConfigureLeaveTypeDto): Promise<LeavePolicy> {
    const leaveType = await this.leaveTypeModel.findById(configDto.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException(`Leave type not found`);
    }

    let policy = await this.leavePolicyModel.findOne({ leaveTypeId: configDto.leaveTypeId });

    if (!policy) {
      policy = new this.leavePolicyModel({
        leaveTypeId: configDto.leaveTypeId,
        accrualMethod: configDto.accrualMethod || AccrualMethod.MONTHLY,
        monthlyRate: configDto.accrualRate || 0,
        yearlyRate: configDto.accrualRate ? configDto.accrualRate * 12 : 0,
        carryForwardAllowed: configDto.allowCarryForward || false,
        maxCarryForward: configDto.carryForwardLimit || 0,
        roundingRule: configDto.roundingRule || RoundingRule.NONE,
        minNoticeDays: configDto.noticePeriodDays || 0,
      });
    } else {
      if (configDto.accrualMethod !== undefined) policy.accrualMethod = configDto.accrualMethod;
      if (configDto.accrualRate !== undefined) {
        policy.monthlyRate = configDto.accrualRate;
        policy.yearlyRate = configDto.accrualRate * 12;
      }
      if (configDto.allowCarryForward !== undefined) policy.carryForwardAllowed = configDto.allowCarryForward;
      if (configDto.carryForwardLimit !== undefined) policy.maxCarryForward = configDto.carryForwardLimit;
      if (configDto.roundingRule !== undefined) policy.roundingRule = configDto.roundingRule;
      if (configDto.noticePeriodDays !== undefined) policy.minNoticeDays = configDto.noticePeriodDays;
    }

    return policy.save();
  }

  async updateLeaveType(leaveTypeId: string, updateDto: UpdateLeaveTypeDto): Promise<LeaveType> {
    const leaveType = await this.leaveTypeModel.findByIdAndUpdate(leaveTypeId, updateDto, { new: true });
    if (!leaveType) {
      throw new NotFoundException(`Leave type not found`);
    }
    return leaveType;
  }

  async deleteLeaveType(leaveTypeId: string): Promise<void> {
    const hasRequests = await this.leaveRequestModel.findOne({ leaveTypeId });
    if (hasRequests) {
      throw new BadRequestException('Cannot delete leave type with existing requests');
    }

    await this.leaveTypeModel.findByIdAndDelete(leaveTypeId);
  }

  async getAllLeaveTypes(): Promise<LeaveType[]> {
    return this.leaveTypeModel.find().populate('categoryId').exec();
  }

  async getLeaveTypeById(leaveTypeId: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeModel.findById(leaveTypeId).populate('categoryId').exec();
    if (!leaveType) {
      throw new NotFoundException(`Leave type not found`);
    }
    return leaveType;
  }

  // ========== LEAVE REQUEST SUBMISSION ==========

  async submitLeaveRequest(employeeId: string, submitDto: SubmitLeaveRequestDto): Promise<LeaveRequest> {
    const leaveType = await this.leaveTypeModel.findById(submitDto.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const policy = await this.leavePolicyModel.findOne({ leaveTypeId: submitDto.leaveTypeId });

    // BR 3: Validate attachment requirement
    if (leaveType.requiresAttachment && !submitDto.attachmentId) {
      throw new BadRequestException(`Attachment required for leave type ${leaveType.name}`);
    }

    // BR 4: Calculate duration in days
    const durationDays = this.calculateBusinessDays(submitDto.fromDate, submitDto.toDate);

    // BR 5: Validate max duration
    if (leaveType.maxDurationDays && durationDays > leaveType.maxDurationDays) {
      throw new BadRequestException(`Duration exceeds maximum allowed ${leaveType.maxDurationDays} days`);
    }

    // BR 6: Validate notice period
    if (policy && policy.minNoticeDays) {
      const daysDiff = Math.ceil((submitDto.fromDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysDiff < policy.minNoticeDays) {
        throw new BadRequestException(`Minimum notice period of ${policy.minNoticeDays} days required`);
      }
    }

    // BR 7: Check blocked periods
    await this.validateAgainstBlockedPeriods(submitDto.fromDate, submitDto.toDate);

    // BR 8: Check balance sufficiency
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId,
      leaveTypeId: submitDto.leaveTypeId,
    });

    if (!entitlement || entitlement.remaining < durationDays) {
      throw new BadRequestException('Insufficient leave balance');
    }

    // BR 9: Detect overlapping requests
    const overlapping = await this.leaveRequestModel.findOne({
      employeeId,
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      $or: [
        { 'dates.from': { $lte: submitDto.toDate }, 'dates.to': { $gte: submitDto.fromDate } },
      ],
    });

    if (overlapping) {
      throw new ConflictException('Overlapping leave request exists');
    }

    // Create leave request
    const leaveRequest = new this.leaveRequestModel({
      employeeId,
      leaveTypeId: submitDto.leaveTypeId,
      dates: { from: submitDto.fromDate, to: submitDto.toDate },
      durationDays,
      justification: submitDto.justification,
      attachmentId: submitDto.attachmentId,
      status: LeaveStatus.PENDING,
    });

    await leaveRequest.save();

    // BR 11: Update pending balance
    entitlement.pending += durationDays;
    entitlement.remaining -= durationDays;
    await entitlement.save();

    return leaveRequest;
  }

  // ========== LEAVE APPROVAL/REJECTION ==========

  async reviewLeaveRequest(
    requestId: string,
    reviewerId: string,
    reviewDto: ReviewLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Request already processed');
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
    });

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    // Update request status
    request.status = reviewDto.status as LeaveStatus;
    request.approvalFlow.push({
      role: 'Reviewer',
      status: reviewDto.status,
      decidedBy: new Types.ObjectId(reviewerId),
      decidedAt: new Date(),
    });

    await request.save();

    // BR 13: Update balances based on decision
    if (reviewDto.status === LeaveStatus.APPROVED) {
      entitlement.pending -= request.durationDays;
      entitlement.taken += request.durationDays;
    } else if (reviewDto.status === LeaveStatus.REJECTED) {
      entitlement.pending -= request.durationDays;
      entitlement.remaining += request.durationDays;
    }

    await entitlement.save();

    return request;
  }

  async cancelLeaveRequest(requestId: string, employeeId: string): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel.findOne({ _id: requestId, employeeId });
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== LeaveStatus.PENDING && request.status !== LeaveStatus.APPROVED) {
      throw new BadRequestException('Only pending or approved requests can be cancelled');
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
    });

    if (entitlement) {
      if (request.status === LeaveStatus.PENDING) {
        entitlement.pending -= request.durationDays;
        entitlement.remaining += request.durationDays;
      } else if (request.status === LeaveStatus.APPROVED) {
        entitlement.taken -= request.durationDays;
        entitlement.remaining += request.durationDays;
      }
      await entitlement.save();
    }

    request.status = LeaveStatus.CANCELLED;
    await request.save();

    return request;
  }

  // ========== BALANCE MANAGEMENT ==========

  async getLeaveBalance(employeeId: string, leaveTypeId?: string): Promise<LeaveEntitlement[]> {
    const filter: any = { employeeId };
    if (leaveTypeId) {
      filter.leaveTypeId = leaveTypeId;
    }
    return this.leaveEntitlementModel.find(filter).populate('leaveTypeId').exec();
  }

  async assignEntitlement(assignDto: AssignEntitlementDto): Promise<LeaveEntitlement> {
    let entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: assignDto.employeeId,
      leaveTypeId: assignDto.leaveTypeId,
    });

    if (!entitlement) {
      entitlement = new this.leaveEntitlementModel({
        employeeId: assignDto.employeeId,
        leaveTypeId: assignDto.leaveTypeId,
        yearlyEntitlement: assignDto.yearlyEntitlement,
        remaining: assignDto.yearlyEntitlement,
      });
    } else {
      entitlement.yearlyEntitlement = assignDto.yearlyEntitlement;
      entitlement.remaining = assignDto.yearlyEntitlement - entitlement.taken - entitlement.pending;
    }

    return entitlement.save();
  }

  async adjustLeaveBalance(adjustDto: AdjustLeaveBalanceDto): Promise<LeaveEntitlement> {
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: adjustDto.employeeId,
      leaveTypeId: adjustDto.leaveTypeId,
    });

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    entitlement.remaining += adjustDto.adjustmentDays;
    if (entitlement.remaining < 0) {
      throw new BadRequestException('Adjustment would result in negative balance');
    }

    return entitlement.save();
  }

  // ========== ACCRUAL PROCESSING ==========

  async processMonthlyAccrual(employeeId: string): Promise<void> {
    const entitlements = await this.leaveEntitlementModel.find({ employeeId });

    for (const entitlement of entitlements) {
      const policy = await this.leavePolicyModel.findOne({ leaveTypeId: entitlement.leaveTypeId });
      if (!policy || policy.accrualMethod !== AccrualMethod.MONTHLY) continue;

      // BR 24: Calculate accrual
      const monthsSinceLastAccrual = entitlement.lastAccrualDate
        ? this.getMonthsDifference(entitlement.lastAccrualDate, new Date())
        : 1;

      const actualAccrual = monthsSinceLastAccrual * policy.monthlyRate;
      entitlement.accruedActual += actualAccrual;

      // BR 25: Apply rounding
      entitlement.accruedRounded = this.applyRounding(entitlement.accruedActual, policy.roundingRule);

      // BR 26: Update remaining balance
      entitlement.remaining += entitlement.accruedRounded - entitlement.accruedActual;

      entitlement.lastAccrualDate = new Date();
      await entitlement.save();
    }
  }

  async processYearEndCarryForward(): Promise<void> {
    const entitlements = await this.leaveEntitlementModel.find();

    for (const entitlement of entitlements) {
      const policy = await this.leavePolicyModel.findOne({ leaveTypeId: entitlement.leaveTypeId });
      if (!policy) continue;

      // BR 28: Process carry forward
      if (policy.carryForwardAllowed) {
        const carryForwardAmount = Math.min(entitlement.remaining, policy.maxCarryForward);
        entitlement.carryForward = carryForwardAmount;
      } else {
        entitlement.carryForward = 0;
      }

      // BR 29: Reset yearly balances
      entitlement.accruedActual = 0;
      entitlement.accruedRounded = 0;
      entitlement.taken = 0;
      entitlement.pending = 0;
      entitlement.remaining = entitlement.yearlyEntitlement + entitlement.carryForward;
      entitlement.nextResetDate = new Date(new Date().getFullYear() + 1, 0, 1);

      await entitlement.save();
    }
  }

  // ========== REPORTING ==========

  async getLeaveHistory(employeeId: string, filters?: any): Promise<LeaveRequest[]> {
    const query: any = { employeeId };
    if (filters?.leaveTypeId) query.leaveTypeId = filters.leaveTypeId;
    if (filters?.status) query.status = filters.status;
    if (filters?.fromDate) query['dates.from'] = { $gte: filters.fromDate };
    if (filters?.toDate) query['dates.to'] = { $lte: filters.toDate };

    return this.leaveRequestModel.find(query).populate('leaveTypeId').sort({ createdAt: -1 }).exec();
  }

  async getLeaveRequestById(requestId: string): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel
      .findById(requestId)
      .populate('employeeId leaveTypeId')
      .exec();
    
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    
    return request;
  }

  async getTeamLeaveRequests(managerId: string): Promise<LeaveRequest[]> {
    // This would require employee-manager relationship lookup
    // For now, return pending requests
    return this.leaveRequestModel.find({ status: LeaveStatus.PENDING }).populate('employeeId leaveTypeId').exec();
  }

  async generateLeaveReport(filters: any): Promise<any> {
    const requests = await this.leaveRequestModel.find(filters).populate('employeeId leaveTypeId').exec();
    
    const summary = {
      totalRequests: requests.length,
      approved: requests.filter(r => r.status === LeaveStatus.APPROVED).length,
      pending: requests.filter(r => r.status === LeaveStatus.PENDING).length,
      rejected: requests.filter(r => r.status === LeaveStatus.REJECTED).length,
      totalDays: requests.reduce((sum, r) => sum + r.durationDays, 0),
    };

    return { requests, summary };
  }

  // ========== BULK OPERATIONS ==========

  async bulkProcessLeaveRequests(bulkDto: BulkProcessLeaveRequestsDto, reviewerId: string): Promise<any> {
    const results = [];

    for (const requestId of bulkDto.requestIds) {
      try {
        const result = await this.reviewLeaveRequest(requestId, reviewerId, {
          status: bulkDto.action === 'approve' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED,
          comments: bulkDto.comments,
        });
        results.push({ requestId, success: true, result });
      } catch (error) {
        results.push({ requestId, success: false, error: error.message });
      }
    }

    return results;
  }

  // ========== UTILITY METHODS ==========

  private calculateBusinessDays(fromDate: Date, toDate: Date): number {
    let count = 0;
    const current = new Date(fromDate);

    while (current <= toDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  private async validateAgainstBlockedPeriods(fromDate: Date, toDate: Date): Promise<void> {
    const year = fromDate.getFullYear();
    const calendar = await this.calendarModel.findOne({ year });

    if (calendar && calendar.blockedPeriods) {
      for (const blocked of calendar.blockedPeriods) {
        if (
          (fromDate >= blocked.from && fromDate <= blocked.to) ||
          (toDate >= blocked.from && toDate <= blocked.to) ||
          (fromDate <= blocked.from && toDate >= blocked.to)
        ) {
          throw new BadRequestException(`Leave dates overlap with blocked period: ${blocked.reason}`);
        }
      }
    }
  }

  private applyRounding(value: number, rule: RoundingRule): number {
    switch (rule) {
      case RoundingRule.ROUND_UP:
        return Math.ceil(value);
      case RoundingRule.ROUND_DOWN:
        return Math.floor(value);
      case RoundingRule.ROUND:
        return Math.round(value);
      case RoundingRule.NONE:
      default:
        return value;
    }
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    return months - startDate.getMonth() + endDate.getMonth();
  }

  // ========== PAYROLL INTEGRATION STUBS ==========
  // These methods are called by payroll-execution service
  // TODO: Implement full logic when payroll integration is completed

  /**
   * Get the number of unpaid leave days for an employee in a payroll period
   * Used by payroll-execution to calculate salary deductions
   */
  async getUnpaidLeaveDays(employeeId: string, periodDate: Date): Promise<number> {
    try {
      const startOfMonth = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
      const endOfMonth = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);

      const unpaidLeaves = await this.leaveRequestModel.find({
        employeeId: new Types.ObjectId(employeeId),
        status: LeaveStatus.APPROVED,
        'dates.from': { $lte: endOfMonth },
        'dates.to': { $gte: startOfMonth },
      }).populate('leaveTypeId');

      let totalUnpaidDays = 0;
      for (const leave of unpaidLeaves) {
        const leaveType = leave.leaveTypeId as any;
        if (leaveType && !leaveType.isPaid) {
          // Calculate overlapping days within the period
          const overlapStart = new Date(Math.max(leave.dates.from.getTime(), startOfMonth.getTime()));
          const overlapEnd = new Date(Math.min(leave.dates.to.getTime(), endOfMonth.getTime()));
          const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          totalUnpaidDays += days;
        }
      }

      return totalUnpaidDays;
    } catch (error) {
      console.error('Error calculating unpaid leave days:', error);
      return 0;
    }
  }

  /**
   * Get employee leave balance for leave encashment calculation
   * Used by payroll-execution for end-of-year leave encashment
   */
  async getEmployeeLeaveBalance(employeeId: Types.ObjectId | string): Promise<{ available: number; used: number; total: number } | null> {
    try {
      const empId = typeof employeeId === 'string' ? new Types.ObjectId(employeeId) : employeeId;
      const entitlements = await this.leaveEntitlementModel.find({
        employeeId: empId,
      });

      if (!entitlements || entitlements.length === 0) {
        return null;
      }

      let totalAvailable = 0;
      let totalUsed = 0;
      let totalEntitled = 0;

      for (const entitlement of entitlements) {
        totalAvailable += entitlement.remaining || 0;
        totalUsed += entitlement.taken || 0;
        totalEntitled += entitlement.yearlyEntitlement || 0;
      }

      return {
        available: totalAvailable,
        used: totalUsed,
        total: totalEntitled,
      };
    } catch (error) {
      console.error('Error fetching employee leave balance:', error);
      return null;
    }
  }
}
