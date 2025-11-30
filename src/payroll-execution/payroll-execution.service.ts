import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { payrollRuns } from './models/payrollRuns.schema';
import { employeePayrollDetails } from './models/employeePayrollDetails.schema';
import { PayRollStatus, BankStatus } from './enums/payroll-execution-enum';
import { ReviewPayrollResponseDto, ExceptionDetail } from './dto';

@Injectable()
export class PayrollExecutionService {
  constructor(
    @InjectModel(payrollRuns.name)
    private payrollRunsModel: Model<payrollRuns>,
    @InjectModel(employeePayrollDetails.name)
    private employeePayrollDetailsModel: Model<employeePayrollDetails>,
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
}
