import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LeaveEntitlement,
  LeaveEntitlementDocument,
} from './models/leave-entitlement.schema';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from './models/leave-request.schema';
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import { LeaveStatus } from './enums/leave-status.enum';

/**
 * LeavesService
 *
 * Provides leave management functionality with payroll integration support
 * Implements BR 11 (unpaid leave deductions) and BR 29 (leave encashment for terminations)
 */
@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveEntitlement.name)
    private leaveEntitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,
  ) {}

  /**
   * Get employee leave balance
   * Used by payroll execution for leave encashment calculations
   * REQ-PY-5: View compensation for unused leave days
   * BR 29: Calculate leave encashment for terminations
   */
  async getEmployeeLeaveBalance(employeeId: string): Promise<{
    available: number;
    taken: number;
    pending: number;
  } | null> {
    if (!Types.ObjectId.isValid(employeeId)) {
      return null;
    }

    // Get all leave entitlements for the employee
    const entitlements = await this.leaveEntitlementModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .exec();

    if (!entitlements || entitlements.length === 0) {
      return {
        available: 0,
        taken: 0,
        pending: 0,
      };
    }

    // Sum up all entitlements (different leave types)
    const totalAvailable = entitlements.reduce(
      (sum, e) => sum + (e.remaining || 0),
      0,
    );
    const totalTaken = entitlements.reduce((sum, e) => sum + (e.taken || 0), 0);
    const totalPending = entitlements.reduce(
      (sum, e) => sum + (e.pending || 0),
      0,
    );

    return {
      available: totalAvailable,
      taken: totalTaken,
      pending: totalPending,
    };
  }

  /**
   * Get unpaid leave days for a specific period
   * Used by payroll execution for salary deductions
   * REQ-PY-11: View deductions for unpaid leave day
   * BR 11: System must deduct pay for unpaid leave days
   */
  async getUnpaidLeaveDays(
    employeeId: string,
    periodDate: Date,
  ): Promise<number> {
    if (!Types.ObjectId.isValid(employeeId)) {
      return 0;
    }

    // Calculate period start and end dates
    const periodStart = new Date(
      periodDate.getFullYear(),
      periodDate.getMonth(),
      1,
    );
    const periodEnd = new Date(
      periodDate.getFullYear(),
      periodDate.getMonth() + 1,
      0,
    );

    // Get all approved leave requests for the employee in this period
    const leaveRequests = await this.leaveRequestModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        status: LeaveStatus.APPROVED,
        'dates.from': { $lte: periodEnd },
        'dates.to': { $gte: periodStart },
      })
      .populate('leaveTypeId')
      .exec();

    // Count only unpaid leave days (where leaveType.paid = false)
    let unpaidDays = 0;

    for (const request of leaveRequests) {
      const leaveType = request.leaveTypeId as any;

      // Skip if leave type is paid
      if (leaveType?.paid !== false) {
        continue;
      }

      // Calculate overlap between leave request and payroll period
      const leaveStart = new Date(request.dates.from);
      const leaveEnd = new Date(request.dates.to);

      const overlapStart =
        leaveStart > periodStart ? leaveStart : periodStart;
      const overlapEnd = leaveEnd < periodEnd ? leaveEnd : periodEnd;

      // Calculate days in overlap (inclusive)
      const daysDiff = Math.floor(
        (overlapEnd.getTime() - overlapStart.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      unpaidDays += daysDiff + 1; // +1 to make it inclusive
    }

    return unpaidDays;
  }

  /**
   * Calculate leave encashment value
   * Used by payroll execution for termination benefits
   * REQ-PY-30: Auto process resignation and termination benefits
   * BR 29: Calculate termination-related entitlements including leave encashment
   * BR 56: Calculate accrued leave payout upon resignation
   */
  async calculateLeaveEncashment(
    employeeId: string,
    dailyRate: number,
  ): Promise<number> {
    const balance = await this.getEmployeeLeaveBalance(employeeId);
    if (!balance || balance.available <= 0) {
      return 0;
    }

    // Egyptian Labor Law 2025: Unused annual leave is encashable upon termination
    // Calculate encashment value: available days * daily rate
    return balance.available * dailyRate;
  }

  /**
   * Get paid leave days taken in a period (for overtime calculations)
   * Used by time management to exclude paid leave days from absence counts
   */
  async getPaidLeaveDays(
    employeeId: string,
    periodDate: Date,
  ): Promise<number> {
    if (!Types.ObjectId.isValid(employeeId)) {
      return 0;
    }

    const periodStart = new Date(
      periodDate.getFullYear(),
      periodDate.getMonth(),
      1,
    );
    const periodEnd = new Date(
      periodDate.getFullYear(),
      periodDate.getMonth() + 1,
      0,
    );

    const leaveRequests = await this.leaveRequestModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        status: LeaveStatus.APPROVED,
        'dates.from': { $lte: periodEnd },
        'dates.to': { $gte: periodStart },
      })
      .populate('leaveTypeId')
      .exec();

    let paidDays = 0;

    for (const request of leaveRequests) {
      const leaveType = request.leaveTypeId as any;

      // Count only paid leave days
      if (leaveType?.paid === true) {
        const leaveStart = new Date(request.dates.from);
        const leaveEnd = new Date(request.dates.to);

        const overlapStart =
          leaveStart > periodStart ? leaveStart : periodStart;
        const overlapEnd = leaveEnd < periodEnd ? leaveEnd : periodEnd;

        const daysDiff = Math.floor(
          (overlapEnd.getTime() - overlapStart.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        paidDays += daysDiff + 1;
      }
    }

    return paidDays;
  }
}
