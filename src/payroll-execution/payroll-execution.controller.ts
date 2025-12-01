import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';
import {
  PayrollSpecialistGuard,
  PayrollManagerGuard,
  FinanceStaffGuard,  // 🆕 ADD THIS
} from './guards';
import {
  ReviewPayrollResponseDto,
  ApprovePayrollDto,
  RejectPayrollDto,
  FinanceApproveDto,
  FinanceRejectDto,
  PublishPayrollDto,
  LockPayrollDto,
  UnlockPayrollDto,
  ApprovalResponseDto,
  LockResponseDto,
} from './dto';

@Controller('payroll-execution')
export class PayrollExecutionController {
  constructor(
    private readonly payrollExecutionService: PayrollExecutionService,
  ) {}

  //phase 2

  @Post('runs/:runId/review')
  @UseGuards(PayrollSpecialistGuard)
  @HttpCode(HttpStatus.OK)
  async reviewPayroll(
    @Param('runId') runId: string,
  ): Promise<ReviewPayrollResponseDto> {
    return this.payrollExecutionService.reviewPayrollRun(runId);
  }

  //phase 3 - manager approval

  @Post('runs/:runId/publish')
  @UseGuards(PayrollSpecialistGuard)
  @HttpCode(HttpStatus.OK)
  async publishPayroll(
    @Param('runId') runId: string,
    @Body() dto: PublishPayrollDto,
  ): Promise<ApprovalResponseDto> {
    const run = await this.payrollExecutionService.publishPayrollForApproval(
      runId,
    );
    return {
      runId: run.runId,
      status: run.status,
      message: 'Payroll published for manager approval',
    };
  }

  @Patch('runs/:runId/manager-approve')
  @UseGuards(PayrollManagerGuard)
  @HttpCode(HttpStatus.OK)
  async managerApprove(
    @Param('runId') runId: string,
    @Body() dto: ApprovePayrollDto,
  ): Promise<ApprovalResponseDto> {
    const run = await this.payrollExecutionService.approveByManager(
      runId,
      dto.managerId,
    );
    return {
      runId: run.runId,
      status: run.status,
      approvedBy: dto.managerId,
      approvalDate: run.managerApprovalDate,
      message: 'Payroll approved by manager',
    };
  }

  @Patch('runs/:runId/manager-reject')
  @UseGuards(PayrollManagerGuard)
  @HttpCode(HttpStatus.OK)
  async managerReject(
    @Param('runId') runId: string,
    @Body() dto: RejectPayrollDto,
  ): Promise<ApprovalResponseDto> {
    const run = await this.payrollExecutionService.rejectByManager(
      runId,
      dto.managerId,
      dto.rejectionReason,
    );
    return {
      runId: run.runId,
      status: run.status,
      message: `Payroll rejected by manager: ${dto.rejectionReason}`,
    };
  }

  //phase 3 - finance approval

  @Patch('runs/:runId/finance-approve')
  @UseGuards(FinanceStaffGuard)  // 🆕 ADD THIS GUARD
  @HttpCode(HttpStatus.OK)
  async financeApprove(
    @Param('runId') runId: string,
    @Body() dto: FinanceApproveDto,
  ): Promise<ApprovalResponseDto> {
    const run = await this.payrollExecutionService.approveByFinance(
      runId,
      dto.financeStaffId,
    );
    return {
      runId: run.runId,
      status: run.status,
      approvedBy: dto.financeStaffId,
      approvalDate: run.financeApprovalDate,
      message: 'Payroll approved by finance',
    };
  }

  @Patch('runs/:runId/finance-reject')
  @UseGuards(FinanceStaffGuard)  // 🆕 ADD THIS GUARD
  @HttpCode(HttpStatus.OK)
  async financeReject(
    @Param('runId') runId: string,
    @Body() dto: FinanceRejectDto,
  ): Promise<ApprovalResponseDto> {
    const run = await this.payrollExecutionService.rejectByFinance(
      runId,
      dto.financeStaffId,
      dto.rejectionReason,
    );
    return {
      runId: run.runId,
      status: run.status,
      message: `Payroll rejected by finance: ${dto.rejectionReason}`,
    };
  }

  //phase 3 - lock/unlock

  @Patch('runs/:runId/lock')
  @UseGuards(PayrollManagerGuard)
  @HttpCode(HttpStatus.OK)
  async lockPayroll(
    @Param('runId') runId: string,
    @Body() dto: LockPayrollDto,
  ): Promise<LockResponseDto> {
    const run = await this.payrollExecutionService.lockPayroll(
      runId,
      dto.managerId,
    );
    return {
      runId: run.runId,
      status: run.status,
      message: 'Payroll locked successfully',
    };
  }

  @Patch('runs/:runId/unlock')
  @UseGuards(PayrollManagerGuard)
  @HttpCode(HttpStatus.OK)
  async unlockPayroll(
    @Param('runId') runId: string,
    @Body() dto: UnlockPayrollDto,
  ): Promise<LockResponseDto> {
    const run = await this.payrollExecutionService.unlockPayroll(
      runId,
      dto.managerId,
      dto.unlockReason,
    );
    return {
      runId: run.runId,
      status: run.status,
      message: 'Payroll unlocked',
      reason: dto.unlockReason,
    };
  }

  @Get('runs/:runId')
  async getPayrollRunDetails(@Param('runId') runId: string) {
    return this.payrollExecutionService.getPayrollRunDetails(runId);
  }

  // 🆕 PHASE 5 - NEW ENDPOINT WITH GUARD
  @Post('runs/:runId/generate-payslips')
  @UseGuards(PayrollSpecialistGuard)  // 🆕 ADD THIS GUARD (Payslip generation is specialist's job after finance approves)
  @HttpCode(HttpStatus.CREATED)
  async generatePayslips(@Param('runId') runId: string) {
    const result = await this.payrollExecutionService.generatePayslips(runId);
    return {
      runId,
      payslipsGenerated: result.payslipsGenerated,
      message: `Successfully generated ${result.payslipsGenerated} payslip(s)`,
    };
  }
}