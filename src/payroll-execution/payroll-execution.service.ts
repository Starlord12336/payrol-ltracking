import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { payrollRuns } from './models/payrollRuns.schema';
import { employeePayrollDetails } from './models/employeePayrollDetails.schema';
import {
  PayRollStatus,
  BankStatus,
  PayRollPaymentStatus,
  PaySlipPaymentStatus,
} from './enums/payroll-execution-enum';
import { ReviewPayrollResponseDto, ExceptionDetail } from './dto';
// 🆕 PHASE 5 - Add these imports
import { paySlip } from './models/payslip.schema';

@Injectable()
export class PayrollExecutionService {
  constructor(
    @InjectModel(payrollRuns.name)
    private payrollRunsModel: Model<payrollRuns>,
    @InjectModel(employeePayrollDetails.name)
    private employeePayrollDetailsModel: Model<employeePayrollDetails>,
    @InjectModel(paySlip.name)
    private paySlipModel: Model<paySlip>,
  ) {}

  //phase 2

  async flagExceptions(runId: string): Promise<ExceptionDetail[]> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    const details = await this.employeePayrollDetailsModel
      .find({ payrollRunId: run._id })
      .populate('employeeId', 'name');

    const exceptions: ExceptionDetail[] = [];

    for (const detail of details) {
      const employeeName =
        typeof detail.employeeId === 'object' &&
        detail.employeeId !== null &&
        'name' in detail.employeeId
          ? String((detail.employeeId as { name?: string }).name || '')
          : '';

      //flag missing bank accounts
      if (detail.bankStatus === BankStatus.MISSING) {
        exceptions.push({
          employeeId: detail.employeeId.toString(),
          employeeName,
          issue: 'Missing bank account details',
          severity: 'critical',
        });
      }

      //flag negative net pay
      if (detail.netPay < 0) {
        exceptions.push({
          employeeId: detail.employeeId.toString(),
          employeeName,
          issue: `Negative net pay: ${detail.netPay}`,
          severity: 'critical',
        });
      }

      //for now, flagging if netPay is suspiciously high
      if (detail.netPay > 100000) {
        //example threshold
        exceptions.push({
          employeeId: detail.employeeId.toString(),
          employeeName,
          issue: `Unusually high salary: ${detail.netPay}`,
          severity: 'warning',
        });
      }
    }

    return exceptions;
  }

  async reviewPayrollRun(runId: string): Promise<ReviewPayrollResponseDto> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    if (run.status !== PayRollStatus.DRAFT) {
      throw new BadRequestException(
        `Only draft payrolls can be reviewed. Current status: ${run.status}`,
      );
    }

    const exceptionDetails = await this.flagExceptions(runId);

    run.exceptions = exceptionDetails.length;
    run.status = PayRollStatus.UNDER_REVIEW;
    await run.save();

    return {
      runId: run.runId,
      status: run.status,
      exceptions: run.exceptions,
      exceptionDetails,
      employees: run.employees,
      totalNetPay: run.totalnetpay,
    };
  }

  //phase 3 - manager approval

  async publishPayrollForApproval(runId: string): Promise<payrollRuns> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    if (run.status !== PayRollStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        `Cannot publish. Current status: ${run.status}`,
      );
    }

    run.status = PayRollStatus.PENDING_FINANCE_APPROVAL;
    await run.save();

    return run;
  }

  async approveByManager(
    runId: string,
    managerId: string,
  ): Promise<payrollRuns> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    if (run.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
      throw new BadRequestException(
        `Cannot approve. Current status: ${run.status}`,
      );
    }

    run.payrollManagerId = managerId as any;
    run.managerApprovalDate = new Date();

    await run.save();
    return run;
  }

  async rejectByManager(
    runId: string,
    managerId: string,
    reason: string,
  ): Promise<payrollRuns> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    if (run.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
      throw new BadRequestException(
        `Cannot reject. Current status: ${run.status}`,
      );
    }

    run.status = PayRollStatus.REJECTED;
    run.payrollManagerId = managerId as any;
    run.managerApprovalDate = new Date();
    run.rejectionReason = reason;

    await run.save();
    return run;
  }

  //phase 3 - finance approval

  async approveByFinance(
    runId: string,
    financeStaffId: string,
  ): Promise<payrollRuns> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    if (run.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
      throw new BadRequestException(
        `Cannot approve. Current status: ${run.status}`,
      );
    }

    run.status = PayRollStatus.APPROVED;
    run.paymentStatus = PayRollPaymentStatus.PAID;
    run.financeStaffId = financeStaffId as any;
    run.financeApprovalDate = new Date();

    await run.save();
    return run;
  }

  async rejectByFinance(
    runId: string,
    financeStaffId: string,
    reason: string,
  ): Promise<payrollRuns> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    if (run.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
      throw new BadRequestException(
        `Cannot reject. Current status: ${run.status}`,
      );
    }

    run.status = PayRollStatus.REJECTED;
    run.financeStaffId = financeStaffId as any;
    run.financeApprovalDate = new Date();
    run.rejectionReason = reason;

    await run.save();
    return run;
  }

  //phase 3 - lock/unlock

  async lockPayroll(runId: string, managerId: string): Promise<payrollRuns> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    if (run.status !== PayRollStatus.APPROVED) {
      throw new BadRequestException(
        `Can only lock approved payrolls. Current status: ${run.status}`,
      );
    }

    run.status = PayRollStatus.LOCKED;
    run.payrollManagerId = managerId as any;

    await run.save();
    return run;
  }

  async unlockPayroll(
    runId: string,
    managerId: string,
    reason: string,
  ): Promise<payrollRuns> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    if (run.status !== PayRollStatus.LOCKED) {
      throw new BadRequestException(
        `Can only unlock locked payrolls. Current status: ${run.status}`,
      );
    }

    run.status = PayRollStatus.UNLOCKED;
    run.unlockReason = reason;
    run.payrollManagerId = managerId as any;

    await run.save();
    return run;
  }

  async getPayrollRunDetails(runId: string): Promise<payrollRuns> {
    const run = await this.payrollRunsModel.findOne({ runId });
    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }
    return run;
  }

  // 🆕 PHASE 5 - NEW METHOD: Generate payslips after approval and lock
  async generatePayslips(runId: string) {
    // Fetch the payroll run
    const run = await this.payrollRunsModel.findOne({ runId });

    if (!run) {
      throw new NotFoundException(`Payroll run ${runId} not found`);
    }

    // Validate run status: must be APPROVED or LOCKED and payment must be PAID
    if (
      (run.status !== PayRollStatus.APPROVED &&
        run.status !== PayRollStatus.LOCKED) ||
      run.paymentStatus !== PayRollPaymentStatus.PAID
    ) {
      throw new BadRequestException(
        `Cannot generate payslips for run ${runId}. ` +
          `Status must be APPROVED or LOCKED with PAID payment status. ` +
          `Current: ${run.status} / ${run.paymentStatus}`,
      );
    }

    // Fetch all employee payroll details for this run
    const employeeDetails = await this.employeePayrollDetailsModel.find({
      payrollRunId: run._id,
    });

    if (employeeDetails.length === 0) {
      throw new NotFoundException(
        `No employee payroll details found for run ${runId}`,
      );
    }

    // Generate payslips for each employee
    const payslips: any[] = [];
    for (const detail of employeeDetails) {
      // Check if payslip already exists
      const existingPayslip = await this.paySlipModel.findOne({
        employeeId: detail.employeeId,
        payrollRunId: run._id,
      });

      if (existingPayslip) {
        continue; // Skip if already generated
      }

      // Create new payslip with available data from employeePayrollDetails
      const payslip = new this.paySlipModel({
        employeeId: detail.employeeId,
        payrollRunId: run._id,
        earningsDetails: {
          baseSalary: detail.baseSalary,
          allowances: [], // Will be populated by Phase 0/1 teammate
          bonuses: detail.bonus ? [{ amount: detail.bonus }] : [],
          benefits: detail.benefit ? [{ amount: detail.benefit }] : [],
          refunds: [], // Will be populated by Payroll Tracking teammate
        },
        deductionsDetails: {
          taxes: [], // Will be populated by Phase 0/1 teammate
          insurances: [], // Will be populated by Phase 0/1 teammate
          penalties: null, // Will be populated by Phase 0/1 teammate
        },
        totalGrossSalary: detail.baseSalary + detail.allowances,
        totaDeductions: detail.deductions,
        netPay: detail.netPay,
        paymentStatus: PaySlipPaymentStatus.PAID, // Since run is PAID
      });

      await payslip.save();
      payslips.push(payslip);
    }

    return {
      runId: run.runId,
      payslipsGenerated: payslips.length,
      message: `Generated ${payslips.length} payslip(s) for run ${runId}`,
    };
  }
}
