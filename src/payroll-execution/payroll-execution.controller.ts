import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PayrollExecutionService } from './payroll-execution.service';

// Auth Guards & Decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

// DTOs
import {
  CreatePayrollRunDto,
  ApprovePayrollDto,
  RejectPayrollDto,
  UnfreezePayrollDto,
  ReviewBonusDto,
  ReviewBenefitDto,
  EditPayrollPeriodDto,
} from './dto';

/**
 * PayrollExecutionController
 *
 * REST API endpoints for Payroll Execution:
 * - Payroll Run Initiation & Draft Generation
 * - Signing Bonus Management
 * - Termination/Resignation Benefits Management
 * - Multi-level Approval Workflow
 * - Payslip Generation
 * - Freeze/Unfreeze Management
 *
 * Implements requirements REQ-PY-1 to REQ-PY-33
 */
@ApiTags('Payroll Execution')
@ApiBearerAuth()
@Controller('payroll-execution')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollExecutionController {
  constructor(
    private readonly payrollExecutionService: PayrollExecutionService,
  ) {}

  // ==========================================
  // PAYROLL RUN MANAGEMENT
  // ==========================================

  @Post('runs')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'REQ-PY-23, REQ-PY-24: Initiate a new payroll run',
    description:
      'Creates a new payroll run in DRAFT status for a specific payroll period. Only Payroll Specialists can initiate payroll runs.',
  })
  @ApiBody({ type: CreatePayrollRunDto })
  @ApiResponse({ status: 201, description: 'Payroll run created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid payroll period or duplicate run',
  })
  async initiatePayrollRun(@Body() createDto: CreatePayrollRunDto) {
    return this.payrollExecutionService.initiatePayrollRun(createDto);
  }

  @Get('runs')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
  @ApiOperation({
    summary: 'Get all payroll runs',
    description: 'Retrieves all payroll runs with their current status',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll runs retrieved successfully',
  })
  async getAllPayrollRuns() {
    return this.payrollExecutionService.getAllPayrollRuns();
  }

  @Get('runs/:id')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
  @ApiOperation({
    summary: 'Get payroll run by ID',
    description: 'Retrieves details of a specific payroll run',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiResponse({
    status: 200,
    description: 'Payroll run retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Payroll run not found' })
  async getPayrollRunById(@Param('id') id: string) {
    return this.payrollExecutionService.getPayrollRunById(id);
  }

  @Patch('runs/:id/period')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'REQ-PY-26: Edit payroll period if rejected',
    description: 'Allows editing the payroll period for REJECTED or DRAFT runs',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiBody({ type: EditPayrollPeriodDto })
  @ApiResponse({
    status: 200,
    description: 'Payroll period updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot edit payroll run in current status',
  })
  async editPayrollPeriod(
    @Param('id') id: string,
    @Body() editDto: EditPayrollPeriodDto,
  ) {
    return this.payrollExecutionService.editPayrollPeriod(id, editDto);
  }

  @Post('runs/:id/generate-draft')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'REQ-PY-1 to REQ-PY-4: Generate payroll draft',
    description:
      'Generates payroll draft by processing all active employees, calculating salaries, taxes, deductions, and identifying exceptions',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiResponse({
    status: 200,
    description:
      'Payroll draft generated successfully with employee details and exceptions',
  })
  @ApiResponse({
    status: 400,
    description: 'Payroll run must be in DRAFT status',
  })
  async generatePayrollDraft(@Param('id') id: string) {
    return this.payrollExecutionService.generatePayrollDraft(id);
  }

  @Get('runs/:id/employee-details')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
  @ApiOperation({
    summary: 'REQ-PY-6: Get employee payroll details for a run',
    description:
      'Retrieves detailed payroll information for all employees in a specific payroll run',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee details retrieved successfully',
  })
  async getEmployeePayrollDetails(
    @Param('id') id: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.payrollExecutionService.getEmployeePayrollDetails(
      id,
      employeeId,
    );
  }

  // ==========================================
  // APPROVAL WORKFLOW
  // ==========================================

  @Post('runs/:id/submit-for-review')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'REQ-PY-12: Submit payroll for manager review',
    description:
      'Moves payroll from DRAFT to UNDER_REVIEW status for manager approval',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        specialistId: {
          type: 'string',
          description: 'ID of the payroll specialist',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll submitted for review successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async submitForReview(
    @Param('id') id: string,
    @Body('specialistId') specialistId: string,
  ) {
    return this.payrollExecutionService.submitForReview(id, specialistId);
  }

  @Post('runs/:id/approve-manager')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'REQ-PY-20, REQ-PY-22: Payroll Manager approval',
    description:
      'Payroll Manager approves the payroll run, moving it to PENDING_FINANCE_APPROVAL status',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiBody({ type: ApprovePayrollDto })
  @ApiResponse({
    status: 200,
    description: 'Payroll approved by manager successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status for manager approval',
  })
  async approveByManager(
    @Param('id') id: string,
    @Body() approveDto: ApprovePayrollDto,
  ) {
    return this.payrollExecutionService.approveByManager(id, approveDto);
  }

  @Post('runs/:id/approve-finance')
  @Roles(SystemRole.FINANCE_STAFF)
  @ApiOperation({
    summary: 'REQ-PY-15: Finance staff final approval',
    description:
      'Finance staff gives final approval, changes payment status to PAID, and triggers payslip generation',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiBody({ type: ApprovePayrollDto })
  @ApiResponse({
    status: 200,
    description: 'Payroll approved by finance and payslips generated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status for finance approval',
  })
  async approveByFinance(
    @Param('id') id: string,
    @Body() approveDto: ApprovePayrollDto,
  ) {
    return this.payrollExecutionService.approveByFinance(id, approveDto);
  }

  @Post('runs/:id/reject')
  @Roles(SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  @ApiOperation({
    summary: 'Reject payroll run',
    description:
      'Reject a payroll run with reason. Can be done by Manager or Finance at review stages',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiBody({ type: RejectPayrollDto })
  @ApiResponse({ status: 200, description: 'Payroll rejected successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reject at current stage' })
  async rejectPayrollRun(
    @Param('id') id: string,
    @Body() rejectDto: RejectPayrollDto,
  ) {
    return this.payrollExecutionService.rejectPayrollRun(id, rejectDto);
  }

  // ==========================================
  // FREEZE/UNFREEZE MANAGEMENT
  // ==========================================

  @Post('runs/:id/freeze')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'REQ-PY-7: Freeze/lock finalized payroll',
    description:
      'Payroll Manager locks an approved payroll run to prevent modifications',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        managerId: { type: 'string', description: 'Manager ID' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Payroll frozen successfully' })
  @ApiResponse({
    status: 400,
    description: 'Can only freeze approved payrolls',
  })
  async freezePayroll(
    @Param('id') id: string,
    @Body('managerId') managerId: string,
  ) {
    return this.payrollExecutionService.freezePayroll(id, managerId);
  }

  @Post('runs/:id/unfreeze')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'REQ-PY-19: Unfreeze payroll with reason',
    description:
      'Payroll Manager unfreezes a locked payroll run by providing a reason',
  })
  @ApiParam({ name: 'id', description: 'Payroll run ID' })
  @ApiBody({ type: UnfreezePayrollDto })
  @ApiResponse({ status: 200, description: 'Payroll unfrozen successfully' })
  @ApiResponse({ status: 400, description: 'Payroll is not frozen' })
  async unfreezePayroll(
    @Param('id') id: string,
    @Body() unfreezeDto: UnfreezePayrollDto,
  ) {
    return this.payrollExecutionService.unfreezePayroll(id, unfreezeDto);
  }

  // ==========================================
  // SIGNING BONUS MANAGEMENT
  // ==========================================

  @Post('signing-bonuses/:id/review')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'REQ-PY-28, REQ-PY-29: Review signing bonus',
    description:
      'Approve or reject a signing bonus with optional reason for rejection',
  })
  @ApiParam({ name: 'id', description: 'Signing bonus ID' })
  @ApiBody({ type: ReviewBonusDto })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus reviewed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid bonus status for review' })
  async reviewSigningBonus(
    @Param('id') id: string,
    @Body() reviewDto: ReviewBonusDto,
  ) {
    return this.payrollExecutionService.reviewSigningBonus(id, reviewDto);
  }

  @Post('signing-bonuses/process-new-hire/:employeeId')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_ADMIN)
  @ApiOperation({
    summary: 'REQ-PY-27: Auto-process signing bonus for new hire',
    description:
      'Automatically creates signing bonus record for newly hired employee if eligible',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus processed successfully',
  })
  async processSigningBonusForNewHire(@Param('employeeId') employeeId: string) {
    await this.payrollExecutionService.processSigningBonusForNewHire(
      employeeId,
    );
    return { message: 'Signing bonus processing completed' };
  }

  // ==========================================
  // TERMINATION/RESIGNATION BENEFITS
  // ==========================================

  @Post('termination-benefits/:id/review')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'REQ-PY-31, REQ-PY-32: Review termination/resignation benefits',
    description:
      'Approve or reject termination/resignation benefits with optional reason',
  })
  @ApiParam({ name: 'id', description: 'Termination benefit ID' })
  @ApiBody({ type: ReviewBenefitDto })
  @ApiResponse({
    status: 200,
    description: 'Termination benefit reviewed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid benefit status for review',
  })
  async reviewTerminationBenefit(
    @Param('id') id: string,
    @Body() reviewDto: ReviewBenefitDto,
  ) {
    return this.payrollExecutionService.reviewTerminationBenefit(id, reviewDto);
  }

  @Post('termination-benefits/process/:employeeId')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_ADMIN)
  @ApiOperation({
    summary: 'REQ-PY-30, REQ-PY-33: Process termination/resignation benefits',
    description:
      'Automatically calculates and creates termination/resignation benefits record',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        terminationType: {
          type: 'string',
          enum: ['resignation', 'termination'],
          description: 'Type of employment end',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Benefits processed successfully' })
  async processTerminationBenefits(
    @Param('employeeId') employeeId: string,
    @Body('terminationType') terminationType: 'resignation' | 'termination',
  ) {
    await this.payrollExecutionService.processTerminationBenefits(
      employeeId,
      terminationType,
    );
    return { message: 'Termination benefits processing completed' };
  }
}
