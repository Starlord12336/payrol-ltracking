import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { claims, claimsDocument } from './models/claims.schema';
import { disputes, disputesDocument } from './models/disputes.schema';
import { refunds, refundsDocument } from './models/refunds.schema';
import { paySlip } from '../payroll-execution/models/payslip.schema';
import {
  ClaimStatus,
  DisputeStatus,
  RefundStatus,
} from './enums/payroll-tracking-enum';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ReviewDisputeDto } from './dto/review-dispute.dto';
import { ReviewClaimDto, ReviewAction } from './dto/review-claim.dto';
import { GenerateReportDto, ReportType } from './dto/generate-report.dto';
import { employeePayrollDetails } from '../payroll-execution/models/employeePayrollDetails.schema';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';

@Injectable()
export class PayrollTrackingService {
  constructor(
    @InjectModel(claims.name) private claimsModel: Model<claimsDocument>,
    @InjectModel(disputes.name) private disputesModel: Model<disputesDocument>,
    @InjectModel(refunds.name) private refundsModel: Model<refundsDocument>,
    @InjectModel(paySlip.name) private paySlipModel: Model<paySlip>,
    @InjectModel(employeePayrollDetails.name)
    private employeePayrollDetailsModel: Model<employeePayrollDetails>,
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfile>,
  ) {}

  // ============================================
  // ESS - Employee Self Service Methods
  // ============================================

  /**
   * REQ-PY-1: View and download payslip online
   * REQ-PY-2: View status and details of payslips
   */
  async getEmployeePayslip(employeeId: string, payslipId: string) {
    const payslip = await this.paySlipModel
      .findOne({
        _id: new Types.ObjectId(payslipId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .populate('payrollRunId')
      .lean()
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    return payslip;
  }

  /**
   * REQ-PY-1, REQ-PY-2: Get all payslips for an employee
   */
  async getEmployeePayslips(
    employeeId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: string;
    },
  ) {
    const query: any = { employeeId: new Types.ObjectId(employeeId) };

    if (filters?.status) {
      query.paymentStatus = filters.status;
    }

    const payslips = await this.paySlipModel
      .find(query)
      .populate('payrollRunId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return payslips;
  }

  /**
   * REQ-PY-3: View base salary according to employment contract
   */
  async getEmployeeBaseSalary(employeeId: string) {
    const employee = await this.employeeModel
      .findById(employeeId)
      .populate('payGradeId')
      .lean()
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return {
      employeeId: employee._id,
      employeeNumber: employee.employeeNumber,
      payGrade: (employee as any).payGradeId,
      contractType: employee.contractType,
      workType: employee.workType,
    };
  }

  /**
   * REQ-PY-5: View compensation for unused leave days
   */
  async getLeaveCompensation(employeeId: string, payslipId: string) {
    const payslip = await this.paySlipModel
      .findOne({
        _id: new Types.ObjectId(payslipId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .lean()
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    // Leave compensation is part of benefits in earnings
    const leaveCompensation = payslip.earningsDetails?.benefits?.filter(
      (b: any) => b.name?.toLowerCase().includes('leave'),
    );

    return {
      payslipId: payslip._id,
      leaveCompensation: leaveCompensation || [],
    };
  }

  /**
   * REQ-PY-7: View transportation or commuting compensation
   */
  async getTransportationAllowance(employeeId: string, payslipId: string) {
    const payslip = await this.paySlipModel
      .findOne({
        _id: new Types.ObjectId(payslipId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .lean()
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    const transportAllowances = payslip.earningsDetails?.allowances?.filter(
      (a: any) => a.name?.toLowerCase().includes('transport'),
    );

    return {
      payslipId: payslip._id,
      transportationAllowances: transportAllowances || [],
    };
  }

  /**
   * REQ-PY-8: View detailed tax deductions with rule applied
   */
  async getTaxDeductions(employeeId: string, payslipId: string) {
    const payslip = await this.paySlipModel
      .findOne({
        _id: new Types.ObjectId(payslipId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .lean()
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    return {
      payslipId: payslip._id,
      taxes: payslip.deductionsDetails?.taxes || [],
      totalTaxDeduction: payslip.deductionsDetails?.taxes?.reduce(
        (sum, tax: any) =>
          sum + ((tax.rate * payslip.totalGrossSalary) / 100 || 0),
        0,
      ),
    };
  }

  /**
   * REQ-PY-9: View insurance deductions itemized
   */
  async getInsuranceDeductions(employeeId: string, payslipId: string) {
    const payslip = await this.paySlipModel
      .findOne({
        _id: new Types.ObjectId(payslipId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .lean()
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    return {
      payslipId: payslip._id,
      insurances: payslip.deductionsDetails?.insurances || [],
      totalInsuranceDeduction: payslip.deductionsDetails?.insurances?.reduce(
        (sum, ins: any) =>
          sum + ((ins.employeeRate * payslip.totalGrossSalary) / 100 || 0),
        0,
      ),
    };
  }

  /**
   * REQ-PY-10: View salary deductions due to misconduct/absenteeism
   */
  async getMisconductPenalties(employeeId: string, payslipId: string) {
    const payslip = await this.paySlipModel
      .findOne({
        _id: new Types.ObjectId(payslipId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .lean()
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    return {
      payslipId: payslip._id,
      penalties: payslip.deductionsDetails?.penalties || null,
    };
  }

  /**
   * REQ-PY-11: View deductions for unpaid leave day
   */
  async getUnpaidLeaveDeductions(employeeId: string, payslipId: string) {
    const payslip = await this.paySlipModel
      .findOne({
        _id: new Types.ObjectId(payslipId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .lean()
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    // Unpaid leave deductions are part of penalties
    const unpaidLeaveDeduction =
      payslip.deductionsDetails?.penalties?.penalties?.reduce(
        (sum: number, p: any) =>
          sum + (p.reason?.toLowerCase().includes('unpaid') ? p.amount : 0),
        0,
      ) || 0;

    return {
      payslipId: payslip._id,
      unpaidLeaveDeduction,
      unpaidLeaveDetails: payslip.deductionsDetails?.penalties,
    };
  }

  /**
   * REQ-PY-13: View salary history
   */
  async getSalaryHistory(employeeId: string, limit: number = 12) {
    const payslips = await this.paySlipModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('payrollRunId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return {
      employeeId,
      history: payslips.map((p: any) => ({
        payslipId: p._id,
        payrollRunId: p.payrollRunId,
        totalGrossSalary: p.totalGrossSalary,
        totalDeductions: p.totaDeductions,
        netPay: p.netPay,
        paymentStatus: p.paymentStatus,
        createdAt: p.createdAt,
      })),
    };
  }

  /**
   * REQ-PY-14: View employer contributions
   */
  async getEmployerContributions(employeeId: string, payslipId: string) {
    const payslip = await this.paySlipModel
      .findOne({
        _id: new Types.ObjectId(payslipId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .lean()
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    const employerContributions = {
      insurances: payslip.deductionsDetails?.insurances?.map((ins: any) => ({
        insuranceName: ins.name,
        employerContribution:
          (ins.employerRate * payslip.totalGrossSalary) / 100 || 0,
      })),
      allowances: payslip.earningsDetails?.allowances || [],
    };

    return {
      payslipId: payslip._id,
      employerContributions,
    };
  }

  /**
   * REQ-PY-15: Download tax documents
   */
  async getTaxDocuments(employeeId: string, year?: number) {
    const startDate = new Date(year || new Date().getFullYear(), 0, 1);
    const endDate = new Date(year || new Date().getFullYear(), 11, 31);

    const payslips = await this.paySlipModel
      .find({
        employeeId: new Types.ObjectId(employeeId),
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .lean()
      .exec();

    const totalTaxes = payslips.reduce((sum, p: any) => {
      const taxAmount = p.deductionsDetails?.taxes?.reduce(
        (tSum: number, t: any) =>
          tSum + ((t.rate * p.totalGrossSalary) / 100 || 0),
        0,
      );
      return sum + (taxAmount || 0);
    }, 0);

    return {
      employeeId,
      year: year || new Date().getFullYear(),
      totalTaxDeducted: totalTaxes,
      monthlyBreakdown: payslips.map((p: any) => ({
        payslipId: p._id,
        month: p.createdAt,
        taxes: p.deductionsDetails?.taxes || [],
        totalTax: p.deductionsDetails?.taxes?.reduce(
          (sum: number, t: any) =>
            sum + ((t.rate * p.totalGrossSalary) / 100 || 0),
          0,
        ),
      })),
    };
  }

  // ============================================
  // Disputes Management (REQ-PY-16, REQ-PY-39, REQ-PY-40, REQ-PY-41, REQ-PY-45)
  // ============================================

  /**
   * REQ-PY-16: Employee submits dispute
   */
  async createDispute(employeeId: string, createDisputeDto: CreateDisputeDto) {
    // Verify payslip exists and belongs to employee
    const payslip = await this.paySlipModel
      .findOne({
        _id: createDisputeDto.payslipId,
        employeeId: new Types.ObjectId(employeeId),
      })
      .lean()
      .exec();

    if (!payslip) {
      throw new NotFoundException(
        'Payslip not found or does not belong to you',
      );
    }

    // Generate unique disputeId
    const count = await this.disputesModel.countDocuments();
    const disputeId = `DISP-${String(count + 1).padStart(4, '0')}`;

    const dispute = new this.disputesModel({
      disputeId,
      description: createDisputeDto.description,
      employeeId: new Types.ObjectId(employeeId),
      payslipId: createDisputeDto.payslipId,
      status: DisputeStatus.UNDER_REVIEW,
    });

    return await dispute.save();
  }

  /**
   * REQ-PY-18: Track dispute status
   */
  async getDisputeStatus(employeeId: string, disputeId: string) {
    const dispute = await this.disputesModel
      .findOne({
        _id: new Types.ObjectId(disputeId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .populate('payslipId')
      .populate('payrollSpecialistId')
      .populate('payrollManagerId')
      .lean()
      .exec();

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  /**
   * REQ-PY-18: Get all disputes for employee
   */
  async getEmployeeDisputes(employeeId: string) {
    return await this.disputesModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('payslipId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * REQ-PY-39: Payroll Specialist review dispute (Approve/Reject)
   */
  async reviewDisputeBySpecialist(
    disputeId: string,
    specialistId: string,
    reviewDto: ReviewDisputeDto,
  ) {
    const dispute = await this.disputesModel.findById(disputeId);

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        'Dispute is not in a state that can be reviewed',
      );
    }

    if (reviewDto.action === ReviewAction.APPROVE) {
      dispute.status = DisputeStatus.PENDING_MANAGER_APPROVAL;
      dispute.payrollSpecialistId = new Types.ObjectId(specialistId);
      if (reviewDto.resolutionComment) {
        dispute.resolutionComment = reviewDto.resolutionComment;
      }
    } else {
      dispute.status = DisputeStatus.REJECTED;
      dispute.payrollSpecialistId = new Types.ObjectId(specialistId);
      dispute.rejectionReason =
        reviewDto.rejectionReason || 'Rejected by specialist';
    }

    return await dispute.save();
  }

  /**
   * REQ-PY-40: Payroll Manager confirm dispute approval
   */
  async confirmDisputeApprovalByManager(
    disputeId: string,
    managerId: string,
    reviewDto: ReviewDisputeDto,
  ) {
    const dispute = await this.disputesModel.findById(disputeId);

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.PENDING_MANAGER_APPROVAL) {
      throw new BadRequestException('Dispute is not pending manager approval');
    }

    if (reviewDto.action === ReviewAction.APPROVE) {
      dispute.status = DisputeStatus.APPROVED;
      dispute.payrollManagerId = new Types.ObjectId(managerId);
      if (reviewDto.resolutionComment) {
        dispute.resolutionComment = reviewDto.resolutionComment;
      }

      // REQ-PY-45: Auto-generate refund when dispute is approved
      await this.generateDisputeRefund(dispute as any);
    } else {
      dispute.status = DisputeStatus.REJECTED;
      dispute.payrollManagerId = new Types.ObjectId(managerId);
      dispute.rejectionReason =
        reviewDto.rejectionReason || 'Rejected by manager';
    }

    return await dispute.save();
  }

  /**
   * REQ-PY-41: Finance staff view approved disputes
   */
  async getApprovedDisputes(financeStaffId?: string) {
    const disputes = await this.disputesModel
      .find({ status: DisputeStatus.APPROVED })
      .populate('employeeId')
      .populate('payslipId')
      .populate('payrollSpecialistId')
      .populate('payrollManagerId')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return disputes;
  }

  /**
   * REQ-PY-45: Generate refund for approved dispute
   */
  private async generateDisputeRefund(dispute: any) {
    // Check if refund already exists
    const existingRefund = await this.refundsModel.findOne({
      disputeId: dispute._id,
    });

    if (existingRefund) {
      return existingRefund;
    }

    // Get payslip to calculate refund amount
    const payslip = await this.paySlipModel.findById(dispute.payslipId);

    if (!payslip) {
      throw new NotFoundException('Payslip not found for dispute');
    }

    // Default refund logic - this should be customized based on business rules
    const refundAmount = 0; // To be determined by finance or based on dispute details

    const refund = new this.refundsModel({
      disputeId: dispute._id,
      employeeId: dispute.employeeId,
      refundDetails: {
        description: `Refund for dispute ${dispute.disputeId}: ${dispute.description}`,
        amount: refundAmount,
      },
      status: RefundStatus.PENDING,
    });

    return await refund.save();
  }

  // ============================================
  // Claims Management (REQ-PY-17, REQ-PY-42, REQ-PY-43, REQ-PY-44, REQ-PY-46)
  // ============================================

  /**
   * REQ-PY-17: Employee submits expense claim
   */
  async createClaim(employeeId: string, createClaimDto: CreateClaimDto) {
    // Generate unique claimId
    const count = await this.claimsModel.countDocuments();
    const claimId = `CLAIM-${String(count + 1).padStart(4, '0')}`;

    const claim = new this.claimsModel({
      claimId,
      description: createClaimDto.description,
      claimType: createClaimDto.claimType,
      amount: createClaimDto.amount,
      employeeId: new Types.ObjectId(employeeId),
      status: ClaimStatus.UNDER_REVIEW,
    });

    return await claim.save();
  }

  /**
   * REQ-PY-18: Track claim status
   */
  async getClaimStatus(employeeId: string, claimId: string) {
    const claim = await this.claimsModel
      .findOne({
        _id: new Types.ObjectId(claimId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .populate('payrollSpecialistId')
      .populate('payrollManagerId')
      .lean()
      .exec();

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return claim;
  }

  /**
   * REQ-PY-18: Get all claims for employee
   */
  async getEmployeeClaims(employeeId: string) {
    return await this.claimsModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * REQ-PY-42: Payroll Specialist review claim (Approve/Reject)
   */
  async reviewClaimBySpecialist(
    claimId: string,
    specialistId: string,
    reviewDto: ReviewClaimDto,
  ) {
    const claim = await this.claimsModel.findById(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.status !== ClaimStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        'Claim is not in a state that can be reviewed',
      );
    }

    if (reviewDto.action === ReviewAction.APPROVE) {
      claim.status = ClaimStatus.PENDING_MANAGER_APPROVAL;
      claim.payrollSpecialistId = new Types.ObjectId(specialistId);
      claim.approvedAmount = reviewDto.approvedAmount || claim.amount;
      if (reviewDto.resolutionComment) {
        claim.resolutionComment = reviewDto.resolutionComment;
      }
    } else {
      claim.status = ClaimStatus.REJECTED;
      claim.payrollSpecialistId = new Types.ObjectId(specialistId);
      claim.rejectionReason =
        reviewDto.rejectionReason || 'Rejected by specialist';
    }

    return await claim.save();
  }

  /**
   * REQ-PY-43: Payroll Manager confirm claim approval
   */
  async confirmClaimApprovalByManager(
    claimId: string,
    managerId: string,
    reviewDto: ReviewClaimDto,
  ) {
    const claim = await this.claimsModel.findById(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.status !== ClaimStatus.PENDING_MANAGER_APPROVAL) {
      throw new BadRequestException('Claim is not pending manager approval');
    }

    if (reviewDto.action === ReviewAction.APPROVE) {
      claim.status = ClaimStatus.APPROVED;
      claim.payrollManagerId = new Types.ObjectId(managerId);
      if (reviewDto.approvedAmount) {
        claim.approvedAmount = reviewDto.approvedAmount;
      }
      if (reviewDto.resolutionComment) {
        claim.resolutionComment = reviewDto.resolutionComment;
      }

      // REQ-PY-46: Auto-generate refund when claim is approved
      await this.generateClaimRefund(claim as any);
    } else {
      claim.status = ClaimStatus.REJECTED;
      claim.payrollManagerId = new Types.ObjectId(managerId);
      claim.rejectionReason =
        reviewDto.rejectionReason || 'Rejected by manager';
    }

    return await claim.save();
  }

  /**
   * REQ-PY-44: Finance staff view approved claims
   */
  async getApprovedClaims(financeStaffId?: string) {
    const claims = await this.claimsModel
      .find({ status: ClaimStatus.APPROVED })
      .populate('employeeId')
      .populate('payrollSpecialistId')
      .populate('payrollManagerId')
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return claims;
  }

  /**
   * REQ-PY-46: Generate refund for approved claim
   */
  private async generateClaimRefund(claim: any) {
    // Check if refund already exists
    const existingRefund = await this.refundsModel.findOne({
      claimId: claim._id,
    });

    if (existingRefund) {
      return existingRefund;
    }

    const refund = new this.refundsModel({
      claimId: claim._id,
      employeeId: claim.employeeId,
      refundDetails: {
        description: `Expense claim refund: ${claim.claimType} - ${claim.description}`,
        amount: claim.approvedAmount || claim.amount,
      },
      status: RefundStatus.PENDING,
    });

    return await refund.save();
  }

  // ============================================
  // Refunds Management
  // ============================================

  /**
   * Get pending refunds for an employee
   */
  async getEmployeeRefunds(employeeId: string) {
    return await this.refundsModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('claimId')
      .populate('disputeId')
      .populate('paidInPayrollRunId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Get all pending refunds (for payroll execution to process)
   */
  async getPendingRefunds() {
    return await this.refundsModel
      .find({ status: RefundStatus.PENDING })
      .populate('employeeId')
      .populate('claimId')
      .populate('disputeId')
      .lean()
      .exec();
  }

  /**
   * Mark refund as paid (called by payroll execution)
   */
  async markRefundAsPaid(refundId: string, payrollRunId: string) {
    const refund = await this.refundsModel.findById(refundId);

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    if (refund.status === RefundStatus.PAID) {
      throw new BadRequestException('Refund already marked as paid');
    }

    refund.status = RefundStatus.PAID;
    refund.paidInPayrollRunId = new Types.ObjectId(payrollRunId);

    return await refund.save();
  }

  // ============================================
  // Reports Generation (REQ-PY-25, REQ-PY-29, REQ-PY-38)
  // ============================================

  /**
   * REQ-PY-38: Generate payroll report by department
   */
  async generatePayrollReportByDepartment(
    departmentId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Get all employees in the department
    const employees = await this.employeeModel
      .find({ primaryDepartmentId: new Types.ObjectId(departmentId) })
      .lean()
      .exec();

    const employeeIds = employees.map((e) => e._id);

    // Get payroll details for these employees
    const payrollDetails = await this.employeePayrollDetailsModel
      .find({
        employeeId: { $in: employeeIds },
        ...query,
      })
      .populate('employeeId')
      .populate('payrollRunId')
      .lean()
      .exec();

    const totalGrossSalary = payrollDetails.reduce(
      (sum, p) => sum + (p.baseSalary + p.allowances),
      0,
    );
    const totalDeductions = payrollDetails.reduce(
      (sum, p) => sum + p.deductions,
      0,
    );
    const totalNetPay = payrollDetails.reduce((sum, p) => sum + p.netPay, 0);

    return {
      departmentId,
      period: { startDate, endDate },
      employeeCount: employees.length,
      totalGrossSalary,
      totalDeductions,
      totalNetPay,
      details: payrollDetails,
    };
  }

  /**
   * REQ-PY-29: Generate month-end payroll summary
   */
  async generateMonthEndSummary(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const payrollDetails = await this.employeePayrollDetailsModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate('employeeId')
      .populate('payrollRunId')
      .lean()
      .exec();

    const totalGrossSalary = payrollDetails.reduce(
      (sum, p) => sum + (p.baseSalary + p.allowances),
      0,
    );
    const totalDeductions = payrollDetails.reduce(
      (sum, p) => sum + p.deductions,
      0,
    );
    const totalNetPay = payrollDetails.reduce((sum, p) => sum + p.netPay, 0);
    const totalBonuses = payrollDetails.reduce(
      (sum, p) => sum + (p.bonus || 0),
      0,
    );
    const totalBenefits = payrollDetails.reduce(
      (sum, p) => sum + (p.benefit || 0),
      0,
    );

    return {
      period: { year, month, startDate, endDate },
      employeeCount: payrollDetails.length,
      totalGrossSalary,
      totalDeductions,
      totalNetPay,
      totalBonuses,
      totalBenefits,
      details: payrollDetails,
    };
  }

  /**
   * REQ-PY-29: Generate year-end payroll summary
   */
  async generateYearEndSummary(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const payrollDetails = await this.employeePayrollDetailsModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate('employeeId')
      .populate('payrollRunId')
      .lean()
      .exec();

    const totalGrossSalary = payrollDetails.reduce(
      (sum, p) => sum + (p.baseSalary + p.allowances),
      0,
    );
    const totalDeductions = payrollDetails.reduce(
      (sum, p) => sum + p.deductions,
      0,
    );
    const totalNetPay = payrollDetails.reduce((sum, p) => sum + p.netPay, 0);
    const totalBonuses = payrollDetails.reduce(
      (sum, p) => sum + (p.bonus || 0),
      0,
    );
    const totalBenefits = payrollDetails.reduce(
      (sum, p) => sum + (p.benefit || 0),
      0,
    );

    // Monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 1; month <= 12; month++) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);

      const monthData = payrollDetails.filter((p: any) => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      });

      monthlyBreakdown.push({
        month,
        employeeCount: monthData.length,
        totalGrossSalary: monthData.reduce(
          (sum, p) => sum + (p.baseSalary + p.allowances),
          0,
        ),
        totalDeductions: monthData.reduce((sum, p) => sum + p.deductions, 0),
        totalNetPay: monthData.reduce((sum, p) => sum + p.netPay, 0),
      });
    }

    return {
      year,
      period: { startDate, endDate },
      totalEmployees: new Set(
        payrollDetails.map((p) => p.employeeId.toString()),
      ).size,
      totalGrossSalary,
      totalDeductions,
      totalNetPay,
      totalBonuses,
      totalBenefits,
      monthlyBreakdown,
    };
  }

  /**
   * REQ-PY-25: Generate tax report
   */
  async generateTaxReport(startDate?: Date, endDate?: Date) {
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const payslips = await this.paySlipModel.find(query).lean().exec();

    const taxBreakdown = payslips.reduce((acc, payslip: any) => {
      const taxes = payslip.deductionsDetails?.taxes || [];
      taxes.forEach((tax: any) => {
        const key = tax.name || 'other';
        if (!acc[key]) {
          acc[key] = {
            taxType: key,
            totalAmount: 0,
            count: 0,
          };
        }
        acc[key].totalAmount +=
          (tax.rate * payslip.totalGrossSalary) / 100 || 0;
        acc[key].count += 1;
      });
      return acc;
    }, {} as any);

    return {
      period: { startDate, endDate },
      totalTaxCollected: Object.values(taxBreakdown).reduce(
        (sum: number, item: any) => sum + item.totalAmount,
        0,
      ),
      breakdown: Object.values(taxBreakdown),
      payslipCount: payslips.length,
    };
  }

  /**
   * REQ-PY-25: Generate insurance report
   */
  async generateInsuranceReport(startDate?: Date, endDate?: Date) {
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const payslips = await this.paySlipModel.find(query).lean().exec();

    const insuranceBreakdown = payslips.reduce((acc, payslip: any) => {
      const insurances = payslip.deductionsDetails?.insurances || [];
      insurances.forEach((ins: any) => {
        const key = ins.name || 'other';
        if (!acc[key]) {
          acc[key] = {
            insuranceType: key,
            totalEmployeeContribution: 0,
            totalEmployerContribution: 0,
            count: 0,
          };
        }
        acc[key].totalEmployeeContribution +=
          (ins.employeeRate * payslip.totalGrossSalary) / 100 || 0;
        acc[key].totalEmployerContribution +=
          (ins.employerRate * payslip.totalGrossSalary) / 100 || 0;
        acc[key].count += 1;
      });
      return acc;
    }, {} as any);

    return {
      period: { startDate, endDate },
      totalEmployeeContribution: Object.values(insuranceBreakdown).reduce(
        (sum: number, item: any) => sum + item.totalEmployeeContribution,
        0,
      ),
      totalEmployerContribution: Object.values(insuranceBreakdown).reduce(
        (sum: number, item: any) => sum + item.totalEmployerContribution,
        0,
      ),
      breakdown: Object.values(insuranceBreakdown),
      payslipCount: payslips.length,
    };
  }

  /**
   * REQ-PY-25: Generate benefits report
   */
  async generateBenefitsReport(startDate?: Date, endDate?: Date) {
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const payslips = await this.paySlipModel.find(query).lean().exec();

    const benefitsBreakdown = payslips.reduce((acc, payslip: any) => {
      const benefits = payslip.earningsDetails?.benefits || [];
      benefits.forEach((benefit: any) => {
        const key = benefit.name || 'other';
        if (!acc[key]) {
          acc[key] = {
            benefitType: key,
            totalAmount: 0,
            count: 0,
          };
        }
        acc[key].totalAmount += benefit.amount || 0;
        acc[key].count += 1;
      });
      return acc;
    }, {} as any);

    return {
      period: { startDate, endDate },
      totalBenefits: Object.values(benefitsBreakdown).reduce(
        (sum: number, item: any) => sum + item.totalAmount,
        0,
      ),
      breakdown: Object.values(benefitsBreakdown),
      payslipCount: payslips.length,
    };
  }

  /**
   * Generic report generator
   */
  async generateReport(reportDto: GenerateReportDto) {
    const startDate = reportDto.startDate
      ? new Date(reportDto.startDate)
      : undefined;
    const endDate = reportDto.endDate ? new Date(reportDto.endDate) : undefined;

    switch (reportDto.reportType) {
      case ReportType.PAYROLL_BY_DEPARTMENT:
        if (!reportDto.departmentId) {
          throw new BadRequestException(
            'Department ID required for department report',
          );
        }
        return await this.generatePayrollReportByDepartment(
          reportDto.departmentId.toString(),
          startDate,
          endDate,
        );

      case ReportType.MONTH_END_SUMMARY:
        const month = startDate
          ? startDate.getMonth() + 1
          : new Date().getMonth() + 1;
        const year = startDate
          ? startDate.getFullYear()
          : new Date().getFullYear();
        return await this.generateMonthEndSummary(year, month);

      case ReportType.YEAR_END_SUMMARY:
        const reportYear = startDate
          ? startDate.getFullYear()
          : new Date().getFullYear();
        return await this.generateYearEndSummary(reportYear);

      case ReportType.TAX_REPORT:
        return await this.generateTaxReport(startDate, endDate);

      case ReportType.INSURANCE_REPORT:
        return await this.generateInsuranceReport(startDate, endDate);

      case ReportType.BENEFITS_REPORT:
        return await this.generateBenefitsReport(startDate, endDate);

      default:
        throw new BadRequestException('Invalid report type');
    }
  }
}
