import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Auth Guards & Decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

import { PayrollTrackingService } from './payroll-tracking.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ReviewDisputeDto } from './dto/review-dispute.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { GenerateReportDto } from './dto/generate-report.dto';

/**
 * PayrollTrackingController
 *
 * REST API endpoints for Payroll Tracking:
 * - Employee Self-Service (ESS) - View payslips, salary history, tax documents
 * - Disputes Management - Create and track payroll disputes
 * - Expense Claims - Submit and track reimbursement claims
 * - Reports Generation - Various payroll reports for management
 *
 * Implements requirements REQ-PY-1 to REQ-PY-46 (Tracking module)
 */
@ApiTags('Payroll Tracking')
@ApiBearerAuth()
@Controller('payroll-tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollTrackingController {
  constructor(
    private readonly payrollTrackingService: PayrollTrackingService,
  ) {}

  // ============================================
  // ESS - Employee Self Service Endpoints
  // ============================================

  /**
   * REQ-PY-1, REQ-PY-2: Get specific payslip for employee
   * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId
   */
  @Get('employee/:employeeId/payslips/:payslipId')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
  )
  @ApiOperation({ summary: 'Get specific payslip for employee' })
  @ApiResponse({ status: 200, description: 'Payslip retrieved successfully' })
  async getEmployeePayslip(
    @Param('employeeId') employeeId: string,
    @Param('payslipId') payslipId: string,
  ) {
    return await this.payrollTrackingService.getEmployeePayslip(
      employeeId,
      payslipId,
    );
  }

  /**
   * REQ-PY-1, REQ-PY-2: Get all payslips for employee
   * GET /payroll-tracking/employee/:employeeId/payslips
   */
  @Get('employee/:employeeId/payslips')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
  )
  @ApiOperation({ summary: 'Get all payslips for employee' })
  @ApiResponse({ status: 200, description: 'Payslips retrieved successfully' })
  async getEmployeePayslips(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (status) filters.status = status;

    return await this.payrollTrackingService.getEmployeePayslips(
      employeeId,
      filters,
    );
  }

  /**
   * REQ-PY-3: Get employee base salary info
   * GET /payroll-tracking/employee/:employeeId/base-salary
   */
  @Get('employee/:employeeId/base-salary')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
  )
  @ApiOperation({
    summary: 'Get employee base salary according to employment contract',
  })
  @ApiResponse({
    status: 200,
    description: 'Base salary retrieved successfully',
  })
  async getEmployeeBaseSalary(@Param('employeeId') employeeId: string) {
    return await this.payrollTrackingService.getEmployeeBaseSalary(employeeId);
  }

  /**
   * REQ-PY-5: Get leave compensation
   * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/leave-compensation
   */
  @Get('employee/:employeeId/payslips/:payslipId/leave-compensation')
  async getLeaveCompensation(
    @Param('employeeId') employeeId: string,
    @Param('payslipId') payslipId: string,
  ) {
    return await this.payrollTrackingService.getLeaveCompensation(
      employeeId,
      payslipId,
    );
  }

  /**
   * REQ-PY-7: Get transportation allowance
   * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/transportation
   */
  @Get('employee/:employeeId/payslips/:payslipId/transportation')
  async getTransportationAllowance(
    @Param('employeeId') employeeId: string,
    @Param('payslipId') payslipId: string,
  ) {
    return await this.payrollTrackingService.getTransportationAllowance(
      employeeId,
      payslipId,
    );
  }

  /**
   * REQ-PY-8: Get tax deductions with rules
   * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/tax-deductions
   */
  @Get('employee/:employeeId/payslips/:payslipId/tax-deductions')
  async getTaxDeductions(
    @Param('employeeId') employeeId: string,
    @Param('payslipId') payslipId: string,
  ) {
    return await this.payrollTrackingService.getTaxDeductions(
      employeeId,
      payslipId,
    );
  }

  /**
   * REQ-PY-9: Get insurance deductions
   * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/insurance-deductions
   */
  @Get('employee/:employeeId/payslips/:payslipId/insurance-deductions')
  async getInsuranceDeductions(
    @Param('employeeId') employeeId: string,
    @Param('payslipId') payslipId: string,
  ) {
    return await this.payrollTrackingService.getInsuranceDeductions(
      employeeId,
      payslipId,
    );
  }

  /**
   * REQ-PY-10: Get misconduct penalties
   * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/penalties
   */
  @Get('employee/:employeeId/payslips/:payslipId/penalties')
  async getMisconductPenalties(
    @Param('employeeId') employeeId: string,
    @Param('payslipId') payslipId: string,
  ) {
    return await this.payrollTrackingService.getMisconductPenalties(
      employeeId,
      payslipId,
    );
  }

  /**
   * REQ-PY-11: Get unpaid leave deductions
   * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/unpaid-leave
   */
  @Get('employee/:employeeId/payslips/:payslipId/unpaid-leave')
  async getUnpaidLeaveDeductions(
    @Param('employeeId') employeeId: string,
    @Param('payslipId') payslipId: string,
  ) {
    return await this.payrollTrackingService.getUnpaidLeaveDeductions(
      employeeId,
      payslipId,
    );
  }

  /**
   * REQ-PY-13: Get salary history
   * GET /payroll-tracking/employee/:employeeId/salary-history
   */
  @Get('employee/:employeeId/salary-history')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
  )
  @ApiOperation({ summary: 'View salary history for employee' })
  @ApiResponse({
    status: 200,
    description: 'Salary history retrieved successfully',
  })
  async getSalaryHistory(
    @Param('employeeId') employeeId: string,
    @Query('limit') limit?: number,
  ) {
    return await this.payrollTrackingService.getSalaryHistory(
      employeeId,
      limit || 12,
    );
  }

  /**
   * REQ-PY-14: Get employer contributions
   * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/employer-contributions
   */
  @Get('employee/:employeeId/payslips/:payslipId/employer-contributions')
  async getEmployerContributions(
    @Param('employeeId') employeeId: string,
    @Param('payslipId') payslipId: string,
  ) {
    return await this.payrollTrackingService.getEmployerContributions(
      employeeId,
      payslipId,
    );
  }

  /**
   * REQ-PY-15: Get tax documents
   * GET /payroll-tracking/employee/:employeeId/tax-documents
   */
  @Get('employee/:employeeId/tax-documents')
  async getTaxDocuments(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: number,
  ) {
    return await this.payrollTrackingService.getTaxDocuments(employeeId, year);
  }

  // ============================================
  // Disputes Management Endpoints
  // ============================================

  /**
   * REQ-PY-16: Employee creates dispute
   * POST /payroll-tracking/employee/:employeeId/disputes
   */
  @Post('employee/:employeeId/disputes')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  @ApiOperation({ summary: 'Employee disputes payroll errors' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  async createDispute(
    @Param('employeeId') employeeId: string,
    @Body() createDisputeDto: CreateDisputeDto,
  ) {
    return await this.payrollTrackingService.createDispute(
      employeeId,
      createDisputeDto,
    );
  }

  /**
   * REQ-PY-18: Get all disputes for employee
   * GET /payroll-tracking/employee/:employeeId/disputes
   */
  @Get('employee/:employeeId/disputes')
  async getEmployeeDisputes(@Param('employeeId') employeeId: string) {
    return await this.payrollTrackingService.getEmployeeDisputes(employeeId);
  }

  /**
   * REQ-PY-18: Get specific dispute status
   * GET /payroll-tracking/employee/:employeeId/disputes/:disputeId
   */
  @Get('employee/:employeeId/disputes/:disputeId')
  async getDisputeStatus(
    @Param('employeeId') employeeId: string,
    @Param('disputeId') disputeId: string,
  ) {
    return await this.payrollTrackingService.getDisputeStatus(
      employeeId,
      disputeId,
    );
  }

  /**
   * REQ-PY-39: Payroll Specialist reviews dispute
   * PATCH /payroll-tracking/specialist/:specialistId/disputes/:disputeId/review
   */
  @Patch('specialist/:specialistId/disputes/:disputeId/review')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'Payroll Specialist reviews and approves/rejects dispute',
  })
  @ApiResponse({ status: 200, description: 'Dispute reviewed successfully' })
  async reviewDisputeBySpecialist(
    @Param('specialistId') specialistId: string,
    @Param('disputeId') disputeId: string,
    @Body() reviewDto: ReviewDisputeDto,
  ) {
    return await this.payrollTrackingService.reviewDisputeBySpecialist(
      disputeId,
      specialistId,
      reviewDto,
    );
  }

  /**
   * REQ-PY-40: Payroll Manager confirms dispute approval
   * PATCH /payroll-tracking/manager/:managerId/disputes/:disputeId/confirm
   */
  @Patch('manager/:managerId/disputes/:disputeId/confirm')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'Payroll Manager confirms dispute approval (multi-step)',
  })
  @ApiResponse({ status: 200, description: 'Dispute approval confirmed' })
  async confirmDisputeApprovalByManager(
    @Param('managerId') managerId: string,
    @Param('disputeId') disputeId: string,
    @Body() reviewDto: ReviewDisputeDto,
  ) {
    return await this.payrollTrackingService.confirmDisputeApprovalByManager(
      disputeId,
      managerId,
      reviewDto,
    );
  }

  /**
   * REQ-PY-41: Finance staff views approved disputes
   * GET /payroll-tracking/finance/disputes/approved
   */
  @Get('finance/disputes/approved')
  @Roles(SystemRole.FINANCE_STAFF)
  @ApiOperation({ summary: 'Finance staff notification of approved disputes' })
  @ApiResponse({
    status: 200,
    description: 'Approved disputes retrieved successfully',
  })
  async getApprovedDisputes(@Query('financeStaffId') financeStaffId?: string) {
    return await this.payrollTrackingService.getApprovedDisputes(
      financeStaffId,
    );
  }

  // ============================================
  // Claims Management Endpoints
  // ============================================

  /**
   * REQ-PY-17: Employee creates expense claim
   * POST /payroll-tracking/employee/:employeeId/claims
   */
  @Post('employee/:employeeId/claims')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  @ApiOperation({ summary: 'Employee submits expense reimbursement claims' })
  @ApiResponse({ status: 201, description: 'Claim created successfully' })
  async createClaim(
    @Param('employeeId') employeeId: string,
    @Body() createClaimDto: CreateClaimDto,
  ) {
    return await this.payrollTrackingService.createClaim(
      employeeId,
      createClaimDto,
    );
  }

  /**
   * REQ-PY-18: Get all claims for employee
   * GET /payroll-tracking/employee/:employeeId/claims
   */
  @Get('employee/:employeeId/claims')
  async getEmployeeClaims(@Param('employeeId') employeeId: string) {
    return await this.payrollTrackingService.getEmployeeClaims(employeeId);
  }

  /**
   * REQ-PY-18: Get specific claim status
   * GET /payroll-tracking/employee/:employeeId/claims/:claimId
   */
  @Get('employee/:employeeId/claims/:claimId')
  async getClaimStatus(
    @Param('employeeId') employeeId: string,
    @Param('claimId') claimId: string,
  ) {
    return await this.payrollTrackingService.getClaimStatus(
      employeeId,
      claimId,
    );
  }

  /**
   * REQ-PY-42: Payroll Specialist reviews claim
   * PATCH /payroll-tracking/specialist/:specialistId/claims/:claimId/review
   */
  @Patch('specialist/:specialistId/claims/:claimId/review')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({ summary: 'Payroll Specialist reviews expense claim' })
  @ApiResponse({ status: 200, description: 'Claim reviewed successfully' })
  async reviewClaimBySpecialist(
    @Param('specialistId') specialistId: string,
    @Param('claimId') claimId: string,
    @Body() reviewDto: ReviewClaimDto,
  ) {
    return await this.payrollTrackingService.reviewClaimBySpecialist(
      claimId,
      specialistId,
      reviewDto,
    );
  }

  /**
   * REQ-PY-43: Payroll Manager confirms claim approval
   * PATCH /payroll-tracking/manager/:managerId/claims/:claimId/confirm
   */
  @Patch('manager/:managerId/claims/:claimId/confirm')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({ summary: 'Payroll Manager confirms expense claim approval' })
  @ApiResponse({ status: 200, description: 'Claim approval confirmed' })
  async confirmClaimApprovalByManager(
    @Param('managerId') managerId: string,
    @Param('claimId') claimId: string,
    @Body() reviewDto: ReviewClaimDto,
  ) {
    return await this.payrollTrackingService.confirmClaimApprovalByManager(
      claimId,
      managerId,
      reviewDto,
    );
  }

  /**
   * REQ-PY-44: Finance staff views approved claims
   * GET /payroll-tracking/finance/claims/approved
   */
  @Get('finance/claims/approved')
  async getApprovedClaims(@Query('financeStaffId') financeStaffId?: string) {
    return await this.payrollTrackingService.getApprovedClaims(financeStaffId);
  }

  // ============================================
  // Refunds Management Endpoints
  // ============================================

  /**
   * Get employee refunds
   * GET /payroll-tracking/employee/:employeeId/refunds
   */
  @Get('employee/:employeeId/refunds')
  async getEmployeeRefunds(@Param('employeeId') employeeId: string) {
    return await this.payrollTrackingService.getEmployeeRefunds(employeeId);
  }

  /**
   * Get pending refunds (for payroll execution)
   * GET /payroll-tracking/refunds/pending
   */
  @Get('refunds/pending')
  async getPendingRefunds() {
    return await this.payrollTrackingService.getPendingRefunds();
  }

  /**
   * Mark refund as paid (called by payroll execution)
   * PATCH /payroll-tracking/refunds/:refundId/mark-paid
   */
  @Patch('refunds/:refundId/mark-paid')
  async markRefundAsPaid(
    @Param('refundId') refundId: string,
    @Body('payrollRunId') payrollRunId: string,
  ) {
    return await this.payrollTrackingService.markRefundAsPaid(
      refundId,
      payrollRunId,
    );
  }

  // ============================================
  // Reports Generation Endpoints
  // ============================================

  /**
   * REQ-PY-38, REQ-PY-25, REQ-PY-29: Generate various reports
   * POST /payroll-tracking/reports/generate
   */
  @Post('reports/generate')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
  @ApiOperation({
    summary:
      'Generate payroll reports (payroll summary, tax, insurance, benefits)',
  })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async generateReport(@Body() reportDto: GenerateReportDto) {
    return await this.payrollTrackingService.generateReport(reportDto);
  }

  /**
   * REQ-PY-38: Generate payroll report by department
   * GET /payroll-tracking/reports/department/:departmentId
   */
  @Get('reports/department/:departmentId')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
  @ApiOperation({ summary: 'Generate payroll report by department' })
  @ApiResponse({
    status: 200,
    description: 'Department report generated successfully',
  })
  async generateDepartmentReport(
    @Param('departmentId') departmentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.payrollTrackingService.generatePayrollReportByDepartment(
      departmentId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * REQ-PY-29: Generate month-end summary
   * GET /payroll-tracking/reports/month-end
   */
  @Get('reports/month-end')
  async generateMonthEndSummary(
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return await this.payrollTrackingService.generateMonthEndSummary(
      year,
      month,
    );
  }

  /**
   * REQ-PY-29: Generate year-end summary
   * GET /payroll-tracking/reports/year-end
   */
  @Get('reports/year-end')
  async generateYearEndSummary(@Query('year') year: number) {
    return await this.payrollTrackingService.generateYearEndSummary(year);
  }

  /**
   * REQ-PY-25: Generate tax report
   * GET /payroll-tracking/reports/tax
   */
  @Get('reports/tax')
  async generateTaxReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.payrollTrackingService.generateTaxReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * REQ-PY-25: Generate insurance report
   * GET /payroll-tracking/reports/insurance
   */
  @Get('reports/insurance')
  async generateInsuranceReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.payrollTrackingService.generateInsuranceReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * REQ-PY-25: Generate benefits report
   * GET /payroll-tracking/reports/benefits
   */
  @Get('reports/benefits')
  async generateBenefitsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.payrollTrackingService.generateBenefitsReport(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
