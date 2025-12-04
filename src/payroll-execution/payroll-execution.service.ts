import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Schemas
import { payrollRuns, payrollRunsDocument } from './models/payrollRuns.schema';
import { paySlip } from './models/payslip.schema';
import {
  employeePayrollDetails,
  employeePayrollDetailsDocument,
} from './models/employeePayrollDetails.schema';
import {
  employeeSigningBonus,
  employeeSigningBonusDocument,
} from './models/EmployeeSigningBonus.schema';
import {
  EmployeeTerminationResignation,
  EmployeeTerminationResignationDocument,
} from './models/EmployeeTerminationResignation.schema';
import { employeePenalties } from './models/employeePenalties.schema';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';

// DTOs
import {
  CreatePayrollRunDto,
  ApprovePayrollDto,
  RejectPayrollDto,
  UnfreezePayrollDto,
  ReviewBonusDto,
  ReviewBenefitDto,
  EditPayrollPeriodDto,
  BonusReviewAction,
  BenefitReviewAction,
} from './dto';

// Enums
import {
  PayRollStatus,
  PayRollPaymentStatus,
  PaySlipPaymentStatus,
  BankStatus,
  BonusStatus,
  BenefitStatus,
} from './enums/payroll-execution-enum';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import { ConfigStatus } from '../payroll-configuration/enums/payroll-configuration-enums';

// External Services
import { PayrollConfigurationService } from '../payroll-configuration/payroll-configuration.service';
import { LeavesService } from '../leaves/leaves.service';
import { TimeManagementService } from '../time-management/time-management.service';

/**
 * PayrollExecutionService
 *
 * Handles payroll execution workflow:
 * - Payroll run initiation and draft generation (REQ-PY-23 to REQ-PY-26)
 * - Signing bonus processing (REQ-PY-27 to REQ-PY-29)
 * - Termination/Resignation benefits (REQ-PY-30 to REQ-PY-33)
 * - Salary calculations with deductions and taxes (REQ-PY-1 to REQ-PY-4)
 * - Multi-level approval workflow (REQ-PY-6, REQ-PY-12, REQ-PY-15, REQ-PY-20, REQ-PY-22)
 * - Payslip generation and distribution (REQ-PY-8)
 * - Exception handling and irregularity detection (REQ-PY-5)
 * - Payroll freeze/unfreeze management (REQ-PY-7, REQ-PY-19)
 *
 * Business Rules:
 * - BR 1-8: Contract validation, salary calculation, tax/insurance compliance
 * - BR 18, 30: Multi-step approval workflow
 * - BR 24-29: Signing bonus processing with authorization
 * - BR 56, 59: Termination/resignation benefits processing
 * - BR 63, 66: Validation checks before processing
 */
@Injectable()
export class PayrollExecutionService {
  constructor(
    @InjectModel(payrollRuns.name)
    private payrollRunsModel: Model<payrollRunsDocument>,
    @InjectModel(paySlip.name)
    private paySlipModel: Model<paySlip>,
    @InjectModel(employeePayrollDetails.name)
    private employeePayrollDetailsModel: Model<employeePayrollDetailsDocument>,
    @InjectModel(employeeSigningBonus.name)
    private employeeSigningBonusModel: Model<employeeSigningBonusDocument>,
    @InjectModel(EmployeeTerminationResignation.name)
    private terminationBenefitModel: Model<EmployeeTerminationResignationDocument>,
    @InjectModel(employeePenalties.name)
    private penaltiesModel: Model<employeePenalties>,
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfile>,
    private payrollConfigService: PayrollConfigurationService,
    private leavesService: LeavesService,
    private timeManagementService: TimeManagementService,
  ) {}

  // ==========================================
  // PAYROLL RUN INITIATION
  // ==========================================

  /**
   * REQ-PY-23: Start automatic processing of payroll initiation
   * REQ-PY-24: Review payroll period
   * Creates a new payroll run in DRAFT status
   * BR 3: Payroll must be processed within defined cycles
   */
  async initiatePayrollRun(
    createDto: CreatePayrollRunDto,
  ): Promise<payrollRunsDocument> {
    // Validate payroll period format
    const payrollPeriodDate = new Date(createDto.payrollPeriod);
    if (isNaN(payrollPeriodDate.getTime())) {
      throw new BadRequestException('Invalid payroll period date');
    }

    // Check for duplicate payroll run for same period and entity
    const existingRun = await this.payrollRunsModel
      .findOne({
        entity: createDto.entity,
        payrollPeriod: payrollPeriodDate,
        status: { $ne: PayRollStatus.REJECTED },
      })
      .exec();

    if (existingRun) {
      throw new BadRequestException(
        `Payroll run already exists for entity "${createDto.entity}" for period ${createDto.payrollPeriod}`,
      );
    }

    // Generate unique run ID (e.g., PR-2025-0001)
    const runId = await this.generateRunId(payrollPeriodDate);

    // Create payroll run in DRAFT status
    const payrollRun = new this.payrollRunsModel({
      runId,
      payrollPeriod: payrollPeriodDate,
      status: PayRollStatus.DRAFT,
      entity: createDto.entity,
      employees: 0,
      exceptions: 0,
      totalnetpay: 0,
      payrollSpecialistId: new Types.ObjectId(createDto.payrollSpecialistId),
      paymentStatus: PayRollPaymentStatus.PENDING,
    });

    return payrollRun.save();
  }

  /**
   * REQ-PY-26: Edit payroll initiation (period) if rejected
   */
  async editPayrollPeriod(
    runId: string,
    editDto: EditPayrollPeriodDto,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunById(runId);

    // Only REJECTED or DRAFT runs can be edited
    if (
      payrollRun.status !== PayRollStatus.REJECTED &&
      payrollRun.status !== PayRollStatus.DRAFT
    ) {
      throw new BadRequestException(
        `Cannot edit payroll run. Current status: ${payrollRun.status}`,
      );
    }

    const newPeriodDate = new Date(editDto.payrollPeriod);
    if (isNaN(newPeriodDate.getTime())) {
      throw new BadRequestException('Invalid payroll period date');
    }

    payrollRun.payrollPeriod = newPeriodDate;
    payrollRun.status = PayRollStatus.DRAFT;
    payrollRun.rejectionReason = undefined;

    return payrollRun.save();
  }

  /**
   * REQ-PY-1: Payroll Draft Generation
   * REQ-PY-2: Check HR Events (New hire, termination, resigned)
   * REQ-PY-3: Deductions calculations and salary calculation
   * REQ-PY-4: Draft generation
   * BR 63: Validation checks before processing
   * BR 66: Contract must be active
   */
  async generatePayrollDraft(runId: string): Promise<{
    payrollRun: payrollRunsDocument;
    employeeDetails: employeePayrollDetailsDocument[];
    exceptions: string[];
  }> {
    const payrollRun = await this.findPayrollRunById(runId);

    if (payrollRun.status !== PayRollStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot generate draft. Payroll run status must be DRAFT. Current: ${payrollRun.status}`,
      );
    }

    // Get all active employees (BR 66)
    const activeEmployees = await this.employeeModel
      .find({
        status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE] },
      })
      .populate('payGradeId')
      .exec();

    if (activeEmployees.length === 0) {
      throw new BadRequestException(
        'No active employees found for payroll processing',
      );
    }

    const employeeDetails: employeePayrollDetailsDocument[] = [];
    const exceptions: string[] = [];
    let totalNetPay = 0;
    let exceptionCount = 0;

    // Process each employee
    for (const employee of activeEmployees) {
      try {
        const details = await this.calculateEmployeePayroll(
          employee,
          payrollRun,
        );
        employeeDetails.push(details);
        totalNetPay += details.netPay;

        if (details.exceptions) {
          exceptionCount++;
          exceptions.push(
            `Employee ${employee.employeeNumber}: ${details.exceptions}`,
          );
        }
      } catch (error) {
        exceptionCount++;
        const errorMsg = `Employee ${employee.employeeNumber}: ${error.message}`;
        exceptions.push(errorMsg);
        console.error('Error processing employee payroll:', error);
      }
    }

    // Update payroll run summary
    payrollRun.employees = activeEmployees.length;
    payrollRun.exceptions = exceptionCount;
    payrollRun.totalnetpay = totalNetPay;
    await payrollRun.save();

    return {
      payrollRun,
      employeeDetails,
      exceptions,
    };
  }

  /**
   * Calculate payroll for a single employee
   * Implements BR 2, 8, 11, 31, 33-36, 38
   */
  private async calculateEmployeePayroll(
    employee: any,
    payrollRun: payrollRunsDocument,
  ): Promise<employeePayrollDetailsDocument> {
    const exceptions: string[] = [];

    // Validate employee has pay grade (BR 2)
    if (!employee.payGradeId) {
      throw new BadRequestException(
        `Employee ${employee.employeeNumber} has no pay grade assigned`,
      );
    }

    const payGrade = employee.payGradeId;
    const baseSalary = payGrade.baseSalary || 0;

    // Get approved allowances for this employee (BR 38)
    const allowances = await this.getEmployeeAllowances(employee._id);
    const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);

    // Calculate gross salary (BR 31)
    let grossSalary = baseSalary + totalAllowances;

    // Check for signing bonus (BR 24-28)
    let bonusAmount = 0;
    const signingBonus = await this.employeeSigningBonusModel
      .findOne({
        employeeId: employee._id,
        status: BonusStatus.APPROVED,
        disbursed: false,
      })
      .exec();

    if (signingBonus) {
      bonusAmount = signingBonus.bonusAmount;
    }

    // Check for termination/resignation benefits (BR 56, 59)
    let benefitAmount = 0;
    const terminationBenefit = await this.terminationBenefitModel
      .findOne({
        employeeId: employee._id,
        status: BenefitStatus.APPROVED,
        disbursed: false,
      })
      .exec();

    if (terminationBenefit) {
      benefitAmount = terminationBenefit.totalAmount;
    }

    // Get unpaid leave days (BR 11)
    const unpaidLeaveDays = await this.getUnpaidLeaveDays(
      employee._id,
      payrollRun.payrollPeriod,
    );

    // Calculate unpaid leave deduction (BR 11)
    const workDaysInMonth = await this.getWorkDaysInMonth(
      payrollRun.payrollPeriod,
    );
    const unpaidLeaveDeduction =
      unpaidLeaveDays > 0
        ? (baseSalary / workDaysInMonth) * unpaidLeaveDays
        : 0;

    // Adjust base salary for unpaid leave
    const adjustedBaseSalary = baseSalary - unpaidLeaveDeduction;
    grossSalary = adjustedBaseSalary + totalAllowances;

    // Calculate taxes (BR 5, 6)
    const taxAmount = await this.calculateTaxes(grossSalary, employee._id);

    // Calculate insurance (BR 7, 8)
    const insuranceAmount = await this.calculateInsurance(
      grossSalary,
      employee._id,
    );

    // Get misconduct penalties (BR 33, 60)
    const penalties = await this.getMisconductPenalties(
      employee._id,
      payrollRun.payrollPeriod,
    );
    const penaltyAmount = penalties.reduce((sum, p) => sum + p.amount, 0);

    // Calculate total deductions (BR 34)
    const totalDeductions = taxAmount + insuranceAmount + penaltyAmount;

    // Calculate net salary (BR 35)
    const netSalary = grossSalary - totalDeductions;

    // Calculate net pay (includes bonuses and benefits)
    const netPay = netSalary + bonusAmount + benefitAmount;

    // Check for minimum wage compliance (BR 4, 60)
    const minimumWage = 6000; // EGP as per Egyptian Labor Law 2025
    if (netPay < minimumWage && employee.status === EmployeeStatus.ACTIVE) {
      exceptions.push(
        `Net pay (${netPay} EGP) is below minimum wage (${minimumWage} EGP)`,
      );
    }

    // Check for bank details (BR 64)
    const bankStatus = employee.bankAccountNumber
      ? BankStatus.VALID
      : BankStatus.MISSING;

    if (bankStatus === BankStatus.MISSING) {
      exceptions.push('Missing bank account details');
    }

    // Save employee payroll details
    const payrollDetails = new this.employeePayrollDetailsModel({
      employeeId: employee._id,
      baseSalary: adjustedBaseSalary,
      allowances: totalAllowances,
      deductions: totalDeductions,
      netSalary,
      netPay,
      bankStatus,
      exceptions: exceptions.length > 0 ? exceptions.join('; ') : undefined,
      bonus: bonusAmount > 0 ? bonusAmount : undefined,
      benefit: benefitAmount > 0 ? benefitAmount : undefined,
      payrollRunId: payrollRun._id,
    });

    return payrollDetails.save();
  }

  // ==========================================
  // SIGNING BONUS MANAGEMENT
  // ==========================================

  /**
   * REQ-PY-28: Signing bonus review (Approve or Reject)
   * REQ-PY-29: Signing bonus edit
   * BR 24-25, 27-28: Signing bonus processing with authorization
   */
  async reviewSigningBonus(
    bonusId: string,
    reviewDto: ReviewBonusDto,
  ): Promise<employeeSigningBonusDocument> {
    if (!Types.ObjectId.isValid(bonusId)) {
      throw new BadRequestException('Invalid signing bonus ID');
    }

    const bonus = await this.employeeSigningBonusModel.findById(bonusId).exec();
    if (!bonus) {
      throw new NotFoundException('Signing bonus not found');
    }

    if (bonus.status !== BonusStatus.PENDING) {
      throw new BadRequestException(
        `Cannot review bonus. Current status: ${bonus.status}`,
      );
    }

    if (reviewDto.action === BonusReviewAction.APPROVE) {
      bonus.status = BonusStatus.APPROVED;
      bonus.approvedBy = new Types.ObjectId(reviewDto.reviewerId);
      bonus.approvedAt = new Date();
    } else {
      if (!reviewDto.rejectionReason) {
        throw new BadRequestException(
          'Rejection reason is required when rejecting a bonus',
        );
      }
      bonus.status = BonusStatus.REJECTED;
      bonus.rejectionReason = reviewDto.rejectionReason;
    }

    return bonus.save();
  }

  /**
   * REQ-PY-27: Auto processes signing bonus in case of new hire
   * This is triggered by event from onboarding module
   * BR 24: Only eligible employees receive signing bonus
   * BR 28: Bonus disbursed only once
   */
  async processSigningBonusForNewHire(employeeId: string): Promise<void> {
    // Check if employee already has a signing bonus record
    const existingBonus = await this.employeeSigningBonusModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();

    if (existingBonus) {
      console.log(`Signing bonus already exists for employee ${employeeId}`);
      return;
    }

    // Get employee details
    const employee = await this.employeeModel
      .findById(employeeId)
      .populate('payGradeId')
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if employee is eligible for signing bonus from configuration
    const signingBonusConfig =
      await this.payrollConfigService.getSigningBonusConfig(
        employee.payGradeId?._id?.toString() || '',
      );

    if (
      !signingBonusConfig ||
      signingBonusConfig.status !== ConfigStatus.APPROVED
    ) {
      console.log(
        `No approved signing bonus config for employee ${employeeId}`,
      );
      return;
    }

    // Create signing bonus record
    const bonus = new this.employeeSigningBonusModel({
      employeeId: employee._id,
      bonusAmount: signingBonusConfig.amount,
      bonusType: signingBonusConfig.bonusType,
      eligibilityCriteria: signingBonusConfig.eligibilityCriteria,
      status: BonusStatus.PENDING,
      disbursed: false,
    });

    await bonus.save();
    console.log(`Signing bonus created for employee ${employeeId}`);
  }

  // ==========================================
  // TERMINATION/RESIGNATION BENEFITS
  // ==========================================

  /**
   * REQ-PY-31: Termination and Resignation benefits review (Approve or Reject)
   * REQ-PY-32: Termination and Resignation benefits edit
   * BR 26, 29, 56: Termination benefits with clearance check
   */
  async reviewTerminationBenefit(
    benefitId: string,
    reviewDto: ReviewBenefitDto,
  ): Promise<EmployeeTerminationResignationDocument> {
    if (!Types.ObjectId.isValid(benefitId)) {
      throw new BadRequestException('Invalid termination benefit ID');
    }

    const benefit = await this.terminationBenefitModel
      .findById(benefitId)
      .exec();
    if (!benefit) {
      throw new NotFoundException('Termination benefit not found');
    }

    if (benefit.status !== BenefitStatus.PENDING) {
      throw new BadRequestException(
        `Cannot review benefit. Current status: ${benefit.status}`,
      );
    }

    if (reviewDto.action === BenefitReviewAction.APPROVE) {
      benefit.status = BenefitStatus.APPROVED;
      benefit.approvedBy = new Types.ObjectId(reviewDto.reviewerId);
      benefit.approvedAt = new Date();
    } else {
      if (!reviewDto.rejectionReason) {
        throw new BadRequestException(
          'Rejection reason is required when rejecting a benefit',
        );
      }
      benefit.status = BenefitStatus.REJECTED;
      benefit.rejectionReason = reviewDto.rejectionReason;
    }

    return benefit.save();
  }

  /**
   * REQ-PY-30: Auto process resignation and termination benefits
   * REQ-PY-33: Automatically process benefits upon termination
   * BR 29, 56: Calculate termination-related entitlements
   */
  async processTerminationBenefits(
    employeeId: string,
    terminationType: 'resignation' | 'termination',
  ): Promise<void> {
    const employee = await this.employeeModel
      .findById(employeeId)
      .populate('payGradeId')
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if benefit already exists
    const existingBenefit = await this.terminationBenefitModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();

    if (existingBenefit) {
      console.log(
        `Termination benefit already exists for employee ${employeeId}`,
      );
      return;
    }

    // Get unused leave balance for encashment
    const leaveBalance =
      await this.leavesService.getEmployeeLeaveBalance(employeeId);
    const unusedLeaveDays = leaveBalance?.available || 0;

    // Calculate leave encashment
    const payGrade = employee.payGradeId as any;
    const baseSalary = payGrade?.baseSalary || 0;
    const dailyRate = baseSalary / 30;
    const leaveEncashment = unusedLeaveDays * dailyRate;

    // Calculate severance pay based on years of service
    const yearsOfService = this.calculateYearsOfService(
      employee.dateOfHire,
      new Date(),
    );
    const severancePay = this.calculateSeverancePay(
      baseSalary,
      yearsOfService,
      terminationType,
    );

    // Calculate end-of-service gratuity
    const endOfServiceGratuity = this.calculateEndOfServiceGratuity(
      baseSalary,
      yearsOfService,
    );

    const totalAmount = leaveEncashment + severancePay + endOfServiceGratuity;

    // Create termination benefit record
    const benefit = new this.terminationBenefitModel({
      employeeId: employee._id,
      terminationType,
      leaveEncashment,
      severancePay,
      endOfServiceGratuity,
      totalAmount,
      status: BenefitStatus.PENDING,
      disbursed: false,
    });

    await benefit.save();
    console.log(
      `Termination benefit created for employee ${employeeId}: ${totalAmount} EGP`,
    );
  }

  // ==========================================
  // APPROVAL WORKFLOW
  // ==========================================

  /**
   * REQ-PY-12: Manager and finance send for approval (publish)
   * REQ-PY-6: Payroll specialist Review system-generated results
   * Moves payroll from DRAFT to UNDER_REVIEW
   */
  async submitForReview(
    runId: string,
    specialistId: string,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunById(runId);

    if (payrollRun.status !== PayRollStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit for review. Current status: ${payrollRun.status}`,
      );
    }

    // Verify specialist ID matches
    if (payrollRun.payrollSpecialistId.toString() !== specialistId) {
      throw new ForbiddenException(
        'Only the payroll specialist who created this run can submit it',
      );
    }

    payrollRun.status = PayRollStatus.UNDER_REVIEW;
    return payrollRun.save();
  }

  /**
   * REQ-PY-20, REQ-PY-22: Payroll Manager Review draft & Approval
   * BR 18, 30: Multi-step approval workflow
   */
  async approveByManager(
    runId: string,
    approveDto: ApprovePayrollDto,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunById(runId);

    if (payrollRun.status !== PayRollStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        `Cannot approve at this stage. Current status: ${payrollRun.status}`,
      );
    }

    payrollRun.payrollManagerId = new Types.ObjectId(
      approveDto.approverId,
    ) as any;
    payrollRun.managerApprovalDate = new Date();
    payrollRun.status = PayRollStatus.PENDING_FINANCE_APPROVAL;

    return payrollRun.save();
  }

  /**
   * REQ-PY-15: Finance staff Approval payroll distribution
   * Changes payment status to PAID
   * BR 18, 30: Final approval in multi-step workflow
   */
  async approveByFinance(
    runId: string,
    approveDto: ApprovePayrollDto,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunById(runId);

    if (payrollRun.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
      throw new BadRequestException(
        `Cannot approve at this stage. Current status: ${payrollRun.status}`,
      );
    }

    payrollRun.financeStaffId = new Types.ObjectId(
      approveDto.approverId,
    ) as any;
    payrollRun.financeApprovalDate = new Date();
    payrollRun.status = PayRollStatus.APPROVED;
    payrollRun.paymentStatus = PayRollPaymentStatus.PAID;

    await payrollRun.save();

    // Trigger payslip generation
    await this.generatePayslips(runId);

    // Mark bonuses and benefits as disbursed
    await this.markBonusesAsDisbursed(payrollRun._id);
    await this.markBenefitsAsDisbursed(payrollRun._id);

    return payrollRun;
  }

  /**
   * Reject payroll run
   * Can be done by Manager or Finance
   */
  async rejectPayrollRun(
    runId: string,
    rejectDto: RejectPayrollDto,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunById(runId);

    if (
      payrollRun.status !== PayRollStatus.UNDER_REVIEW &&
      payrollRun.status !== PayRollStatus.PENDING_FINANCE_APPROVAL
    ) {
      throw new BadRequestException(
        `Cannot reject at this stage. Current status: ${payrollRun.status}`,
      );
    }

    payrollRun.status = PayRollStatus.REJECTED;
    payrollRun.rejectionReason = rejectDto.rejectionReason;

    return payrollRun.save();
  }

  // ==========================================
  // PAYSLIP GENERATION
  // ==========================================

  /**
   * REQ-PY-8: System automatically generate and distribute employee payslips
   * BR 17: Auto-generated payslip with clear breakdown
   */
  async generatePayslips(runId: string): Promise<void> {
    const payrollRun = await this.findPayrollRunById(runId);

    // Get all employee payroll details for this run
    const employeeDetails = await this.employeePayrollDetailsModel
      .find({ payrollRunId: payrollRun._id })
      .populate('employeeId')
      .exec();

    for (const detail of employeeDetails) {
      // Get detailed earnings and deductions
      const employee: any = detail.employeeId;

      // Get allowances
      const allowances = await this.getEmployeeAllowances(employee._id);

      // Get signing bonus
      const bonus = await this.employeeSigningBonusModel
        .findOne({
          employeeId: employee._id,
          status: BonusStatus.APPROVED,
          disbursed: false,
        })
        .exec();

      // Get termination benefit
      const benefit = await this.terminationBenefitModel
        .findOne({
          employeeId: employee._id,
          status: BenefitStatus.APPROVED,
          disbursed: false,
        })
        .exec();

      // Get taxes
      const taxes = await this.getTaxBreakdown(
        detail.baseSalary + detail.allowances,
        employee._id,
      );

      // Get insurance
      const insurances = await this.getInsuranceBreakdown(
        detail.baseSalary + detail.allowances,
        employee._id,
      );

      // Get penalties
      const penalties = await this.penaltiesModel
        .findOne({ employeeId: employee._id })
        .exec();

      // Create payslip
      const payslip = new this.paySlipModel({
        employeeId: employee._id,
        payrollRunId: payrollRun._id,
        earningsDetails: {
          baseSalary: detail.baseSalary,
          allowances,
          bonuses: bonus ? [bonus] : [],
          benefits: benefit ? [benefit] : [],
        },
        deductionsDetails: {
          taxes,
          insurances,
          penalties,
        },
        totalGrossSalary: detail.baseSalary + detail.allowances,
        totaDeductions: detail.deductions,
        netPay: detail.netPay,
        paymentStatus: PaySlipPaymentStatus.PAID,
      });

      await payslip.save();
    }

    console.log(
      `Generated ${employeeDetails.length} payslips for payroll run ${runId}`,
    );
  }

  // ==========================================
  // FREEZE/UNFREEZE MANAGEMENT
  // ==========================================

  /**
   * REQ-PY-7: Payroll Manager view, lock and freeze finalized payroll
   */
  async freezePayroll(
    runId: string,
    managerId: string,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunById(runId);

    if (payrollRun.status !== PayRollStatus.APPROVED) {
      throw new BadRequestException('Can only freeze approved payroll runs');
    }

    // Verify manager has permission
    if (payrollRun.payrollManagerId?.toString() !== managerId) {
      throw new ForbiddenException(
        'Only the approving manager can freeze this payroll',
      );
    }

    payrollRun.status = PayRollStatus.LOCKED;
    return payrollRun.save();
  }

  /**
   * REQ-PY-19: Payroll Manager unfreeze payrolls after entering reason
   */
  async unfreezePayroll(
    runId: string,
    unfreezeDto: UnfreezePayrollDto,
  ): Promise<payrollRunsDocument> {
    const payrollRun = await this.findPayrollRunById(runId);

    if (payrollRun.status !== PayRollStatus.LOCKED) {
      throw new BadRequestException('Payroll run is not frozen');
    }

    // Verify manager has permission
    if (payrollRun.payrollManagerId?.toString() !== unfreezeDto.managerId) {
      throw new ForbiddenException(
        'Only the approving manager can unfreeze this payroll',
      );
    }

    if (!unfreezeDto.unlockReason) {
      throw new BadRequestException('Unlock reason is required');
    }

    payrollRun.status = PayRollStatus.UNLOCKED;
    payrollRun.unlockReason = unfreezeDto.unlockReason;

    return payrollRun.save();
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private async findPayrollRunById(id: string): Promise<payrollRunsDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payroll run ID');
    }

    const payrollRun = await this.payrollRunsModel.findById(id).exec();
    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    return payrollRun;
  }

  private async generateRunId(periodDate: Date): Promise<string> {
    const year = periodDate.getFullYear();
    const count = await this.payrollRunsModel.countDocuments({
      payrollPeriod: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`),
      },
    });

    return `PR-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async getEmployeeAllowances(
    employeeId: Types.ObjectId,
  ): Promise<any[]> {
    // Get approved allowances from configuration
    const allowances = await this.payrollConfigService.getApprovedAllowances();
    // Filter for this employee based on eligibility
    return allowances.filter((a: any) =>
      this.isEligibleForAllowance(employeeId, a),
    );
  }

  private isEligibleForAllowance(
    employeeId: Types.ObjectId,
    allowance: any,
  ): boolean {
    // Implementation depends on allowance eligibility criteria
    // For now, return all allowances
    return true;
  }

  private async getUnpaidLeaveDays(
    employeeId: Types.ObjectId,
    periodDate: Date,
  ): Promise<number> {
    // Integration with Leaves module
    // Get unpaid leave days for the payroll period
    try {
      const unpaidLeaves = await this.leavesService.getUnpaidLeaveDays(
        employeeId.toString(),
        periodDate,
      );
      return unpaidLeaves || 0;
    } catch (error) {
      console.error('Error fetching unpaid leave days:', error);
      return 0;
    }
  }

  private async getWorkDaysInMonth(periodDate: Date): Promise<number> {
    // Integration with Time Management module
    try {
      const workDays =
        await this.timeManagementService.getWorkDaysInMonth(periodDate);
      return workDays || 22; // Default to 22 if service fails
    } catch (error) {
      console.error('Error fetching work days:', error);
      return 22; // Default working days per month
    }
  }

  private async calculateTaxes(
    grossSalary: number,
    employeeId: Types.ObjectId,
  ): Promise<number> {
    // Get approved tax rules
    const taxRules = await this.payrollConfigService.getApprovedTaxRules();

    // Apply progressive tax rates (BR 5, 6)
    let taxAmount = 0;
    for (const rule of taxRules) {
      if (grossSalary >= rule.minSalary && grossSalary <= rule.maxSalary) {
        taxAmount = (grossSalary * rule.taxRate) / 100;
        break;
      }
    }

    return taxAmount;
  }

  private async calculateInsurance(
    grossSalary: number,
    employeeId: Types.ObjectId,
  ): Promise<number> {
    // Get approved insurance brackets (BR 7, 8)
    const insuranceBrackets =
      await this.payrollConfigService.getApprovedInsuranceBrackets();

    let insuranceAmount = 0;
    for (const bracket of insuranceBrackets) {
      if (
        grossSalary >= bracket.minSalary &&
        grossSalary <= bracket.maxSalary
      ) {
        insuranceAmount = (grossSalary * bracket.employeePercentage) / 100;
        break;
      }
    }

    return insuranceAmount;
  }

  private async getMisconductPenalties(
    employeeId: Types.ObjectId,
    periodDate: Date,
  ): Promise<any[]> {
    // Get penalties for this employee in the payroll period
    const penalties = await this.penaltiesModel
      .find({
        employeeId,
        appliedInPayrollPeriod: periodDate,
      })
      .exec();

    return penalties.flatMap((p) => p.penalties || []);
  }

  private async getTaxBreakdown(
    grossSalary: number,
    employeeId: Types.ObjectId,
  ): Promise<any[]> {
    const taxRules = await this.payrollConfigService.getApprovedTaxRules();
    return taxRules.filter(
      (rule: any) =>
        grossSalary >= rule.minSalary && grossSalary <= rule.maxSalary,
    );
  }

  private async getInsuranceBreakdown(
    grossSalary: number,
    employeeId: Types.ObjectId,
  ): Promise<any[]> {
    const insuranceBrackets =
      await this.payrollConfigService.getApprovedInsuranceBrackets();
    return insuranceBrackets.filter(
      (bracket: any) =>
        grossSalary >= bracket.minSalary && grossSalary <= bracket.maxSalary,
    );
  }

  private calculateYearsOfService(hireDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - hireDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
  }

  private calculateSeverancePay(
    baseSalary: number,
    yearsOfService: number,
    terminationType: string,
  ): number {
    // Egyptian Labor Law 2025: Different calculations for termination vs resignation
    if (terminationType === 'termination') {
      // 1 month salary per year of service
      return baseSalary * yearsOfService;
    } else {
      // Resignation: 0.5 month salary per year
      return (baseSalary * yearsOfService) / 2;
    }
  }

  private calculateEndOfServiceGratuity(
    baseSalary: number,
    yearsOfService: number,
  ): number {
    // Egyptian Labor Law: 21 days per year for first 5 years, then 30 days per year
    let gratuityDays = 0;

    if (yearsOfService <= 5) {
      gratuityDays = yearsOfService * 21;
    } else {
      gratuityDays = 5 * 21 + (yearsOfService - 5) * 30;
    }

    const dailyRate = baseSalary / 30;
    return dailyRate * gratuityDays;
  }

  private async markBonusesAsDisbursed(
    payrollRunId: Types.ObjectId,
  ): Promise<void> {
    const employeeDetails = await this.employeePayrollDetailsModel
      .find({ payrollRunId })
      .exec();

    for (const detail of employeeDetails) {
      await this.employeeSigningBonusModel
        .updateMany(
          {
            employeeId: detail.employeeId,
            status: BonusStatus.APPROVED,
            disbursed: false,
          },
          {
            $set: { disbursed: true, disbursedAt: new Date() },
          },
        )
        .exec();
    }
  }

  private async markBenefitsAsDisbursed(
    payrollRunId: Types.ObjectId,
  ): Promise<void> {
    const employeeDetails = await this.employeePayrollDetailsModel
      .find({ payrollRunId })
      .exec();

    for (const detail of employeeDetails) {
      await this.terminationBenefitModel
        .updateMany(
          {
            employeeId: detail.employeeId,
            status: BenefitStatus.APPROVED,
            disbursed: false,
          },
          {
            $set: { disbursed: true, disbursedAt: new Date() },
          },
        )
        .exec();
    }
  }

  // ==========================================
  // QUERY METHODS
  // ==========================================

  async getAllPayrollRuns(): Promise<payrollRunsDocument[]> {
    return this.payrollRunsModel.find().sort({ createdAt: -1 }).exec();
  }

  async getPayrollRunById(id: string): Promise<payrollRunsDocument> {
    return this.findPayrollRunById(id);
  }

  async getEmployeePayrollDetails(
    runId: string,
    employeeId?: string,
  ): Promise<employeePayrollDetailsDocument[]> {
    const query: any = { payrollRunId: new Types.ObjectId(runId) };

    if (employeeId) {
      query.employeeId = new Types.ObjectId(employeeId);
    }

    return this.employeePayrollDetailsModel
      .find(query)
      .populate('employeeId')
      .exec();
  }
}
