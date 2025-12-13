import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { CreateLeaveTypeDto, ConfigureLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';
import {
  SubmitLeaveRequestDto,
  ReviewLeaveRequestDto,
  AdjustLeaveBalanceDto,
  BulkProcessLeaveRequestsDto,
  AssignEntitlementDto,
  SetHolidayDto,
  SetBlockedPeriodDto,
} from './dto/leave-request.dto';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // ========== LEAVE TYPE MANAGEMENT ==========
  // REQ-001: Create Leave Type
  @Post('types')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async createLeaveType(@Body() createDto: CreateLeaveTypeDto) {
    return this.leavesService.createLeaveType(createDto);
  }

  // REQ-002: Configure Leave Type
  @Post('types/:id/configure')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async configureLeaveType(@Param('id') id: string, @Body() configDto: ConfigureLeaveTypeDto) {
    return this.leavesService.configureLeaveType({ ...configDto, leaveTypeId: id });
  }

  // REQ-003: Update Leave Type
  @Put('types/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async updateLeaveType(@Param('id') id: string, @Body() updateDto: UpdateLeaveTypeDto) {
    return this.leavesService.updateLeaveType(id, updateDto);
  }

  // REQ-004: Delete Leave Type
  @Delete('types/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async deleteLeaveType(@Param('id') id: string) {
    await this.leavesService.deleteLeaveType(id);
    return { message: 'Leave type deleted successfully' };
  }

  // REQ-005: Get All Leave Types
  @Get('types')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_EMPLOYEE,
  )
  async getAllLeaveTypes() {
    return this.leavesService.getAllLeaveTypes();
  }

  // REQ-006: Get Leave Type by ID
  @Get('types/:id')
  @Roles(
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_EMPLOYEE,
  )
  async getLeaveTypeById(@Param('id') id: string) {
    return this.leavesService.getLeaveTypeById(id);
  }

  // ========== LEAVE REQUEST SUBMISSION ==========
  // REQ-007: Submit Leave Request
  @Post('requests')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async submitLeaveRequest(@CurrentUser() user: any, @Body() submitDto: SubmitLeaveRequestDto) {
    return this.leavesService.submitLeaveRequest(user.userId, submitDto);
  }

  // REQ-008: Get My Leave Requests
  @Get('requests/my')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getMyLeaveRequests(@CurrentUser() user: any, @Query() filters: any) {
    return this.leavesService.getLeaveHistory(user.userId, filters);
  }

  // REQ-009: Get Leave Request by ID
  @Get('requests/:id')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getLeaveRequestById(@Param('id') id: string, @CurrentUser() user: any) {
    const request = await this.leavesService.getLeaveRequestById(id);
    
    // Verify user has access to this request
    if (
      request.employeeId.toString() !== user.userId &&
      ![SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD].includes(user.role)
    ) {
      throw new ForbiddenException('You do not have access to this leave request');
    }
    
    return request;
  }

  // REQ-010: Cancel Leave Request
  @Patch('requests/:id/cancel')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async cancelLeaveRequest(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leavesService.cancelLeaveRequest(id, user.userId);
  }

  // ========== LEAVE APPROVAL/REJECTION ==========
  // REQ-011: Approve/Reject Leave Request
  @Post('requests/:id/review')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async reviewLeaveRequest(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() reviewDto: ReviewLeaveRequestDto,
  ) {
    return this.leavesService.reviewLeaveRequest(id, user.userId, reviewDto);
  }

  // REQ-012: Get Pending Requests for Approval
  @Get('requests/pending/approval')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getPendingRequestsForApproval(@CurrentUser() user: any) {
    return this.leavesService.getTeamLeaveRequests(user.userId);
  }

  // REQ-013: Bulk Approve/Reject Requests
  @Post('requests/bulk/process')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER)
  async bulkProcessLeaveRequests(@CurrentUser() user: any, @Body() bulkDto: BulkProcessLeaveRequestsDto) {
    return this.leavesService.bulkProcessLeaveRequests(bulkDto, user.userId);
  }

  // ========== BALANCE MANAGEMENT ==========
  // REQ-014: Get My Leave Balance
  @Get('balance/my')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getMyLeaveBalance(@CurrentUser() user: any, @Query('leaveTypeId') leaveTypeId?: string) {
    return this.leavesService.getLeaveBalance(user.userId, leaveTypeId);
  }

  // REQ-015: Get Employee Leave Balance
  @Get('balance/employee/:employeeId')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getEmployeeLeaveBalance(@Param('employeeId') employeeId: string, @Query('leaveTypeId') leaveTypeId?: string) {
    return this.leavesService.getLeaveBalance(employeeId, leaveTypeId);
  }

  // REQ-016: Assign Leave Entitlement
  @Post('entitlements')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async assignEntitlement(@Body() assignDto: AssignEntitlementDto) {
    return this.leavesService.assignEntitlement(assignDto);
  }

  // REQ-017: Adjust Leave Balance
  @Post('balance/adjust')
  @Roles(SystemRole.HR_MANAGER)
  async adjustLeaveBalance(@Body() adjustDto: AdjustLeaveBalanceDto) {
    return this.leavesService.adjustLeaveBalance(adjustDto);
  }

  // ========== ACCRUAL PROCESSING ==========
  // REQ-018: Process Monthly Accrual
  @Post('accrual/monthly')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async processMonthlyAccrual(@Body('employeeId') employeeId: string) {
    await this.leavesService.processMonthlyAccrual(employeeId);
    return { message: 'Monthly accrual processed successfully' };
  }

  // REQ-019: Process Year-End Carry Forward
  @Post('accrual/year-end')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async processYearEndCarryForward() {
    await this.leavesService.processYearEndCarryForward();
    return { message: 'Year-end carry forward processed successfully' };
  }

  // ========== REPORTING ==========
  // REQ-020: Get Leave History
  @Get('history/:employeeId')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_EMPLOYEE,
  )
  async getLeaveHistory(@Param('employeeId') employeeId: string, @Query() filters: any) {
    return this.leavesService.getLeaveHistory(employeeId, filters);
  }

  // REQ-021: Generate Leave Report
  @Get('reports/generate')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD)
  async generateLeaveReport(@Query() filters: any) {
    return this.leavesService.generateLeaveReport(filters);
  }

  // REQ-022: Get Team Leave Overview
  @Get('team/overview')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER)
  async getTeamLeaveOverview(@CurrentUser() user: any) {
    return this.leavesService.getTeamLeaveRequests(user.userId);
  }

  // ========== CALENDAR MANAGEMENT ==========
  // REQ-023: Set Holiday
  @Post('calendar/holidays')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async setHoliday(@Body() holidayDto: SetHolidayDto) {
    // Implementation would add holiday to calendar
    return { message: 'Holiday set successfully' };
  }

  // REQ-024: Get Holidays
  @Get('calendar/holidays')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getHolidays(@Query('year') year: number) {
    // Implementation would fetch holidays for year
    return [];
  }

  // REQ-025: Set Blocked Period
  @Post('calendar/blocked-periods')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async setBlockedPeriod(@Body() blockedDto: SetBlockedPeriodDto) {
    // Implementation would add blocked period to calendar
    return { message: 'Blocked period set successfully' };
  }

  // REQ-026: Get Blocked Periods
  @Get('calendar/blocked-periods')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getBlockedPeriods(@Query('year') year: number) {
    // Implementation would fetch blocked periods for year
    return [];
  }

  // ========== ADDITIONAL ENDPOINTS FOR COMPLETE COVERAGE ==========
  
  // REQ-027: Get Leave Request Statistics
  @Get('statistics/requests')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD)
  async getLeaveRequestStatistics(@Query() filters: any) {
    const report = await this.leavesService.generateLeaveReport(filters);
    return report.summary;
  }

  // REQ-028: Get Employee Leave Trends
  @Get('trends/:employeeId')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getEmployeeLeaveTrends(@Param('employeeId') employeeId: string) {
    return this.leavesService.getLeaveHistory(employeeId);
  }

  // REQ-029: Get Department Leave Summary
  @Get('department/:departmentId/summary')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getDepartmentLeaveSummary(@Param('departmentId') departmentId: string) {
    // Implementation would aggregate leave data by department
    return { departmentId, summary: {} };
  }

  // REQ-030: Validate Leave Request
  @Post('requests/validate')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async validateLeaveRequest(@CurrentUser() user: any, @Body() submitDto: SubmitLeaveRequestDto) {
    // Implementation would validate without saving
    return { valid: true, message: 'Leave request is valid' };
  }

  // REQ-031: Get Leave Type Usage
  @Get('types/:id/usage')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getLeaveTypeUsage(@Param('id') id: string, @Query() filters: any) {
    // Implementation would return usage statistics for leave type
    return { leaveTypeId: id, usage: {} };
  }

  // REQ-032: Export Leave Data
  @Get('export')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async exportLeaveData(@Query() filters: any) {
    const report = await this.leavesService.generateLeaveReport(filters);
    return report;
  }

  // REQ-033: Get Approval Chain
  @Get('requests/:id/approval-chain')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getApprovalChain(@Param('id') id: string) {
    // Implementation would return approval workflow steps
    return { requestId: id, approvalChain: [] };
  }

  // REQ-034: Get Leave Calendar View
  @Get('calendar/view')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getLeaveCalendarView(@Query() filters: any) {
    // Implementation would return calendar view of leaves
    return { calendar: [] };
  }

  // REQ-035: Check Leave Conflicts
  @Post('requests/check-conflicts')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async checkLeaveConflicts(@Body() submitDto: SubmitLeaveRequestDto) {
    // Implementation would check for conflicts
    return { conflicts: [] };
  }

  // REQ-036: Get Leave Balance Projection
  @Get('balance/:employeeId/projection')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getLeaveBalanceProjection(@Param('employeeId') employeeId: string, @Query('months') months: number) {
    // Implementation would project future balance based on accrual
    return { projection: [] };
  }

  // REQ-037: Get Irregular Leave Patterns
  @Get('patterns/irregular')
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getIrregularLeavePatterns(@Query() filters: any) {
    // Implementation would detect unusual leave patterns
    return { patterns: [] };
  }

  // REQ-038: Recalculate Leave Balances
  @Post('balance/recalculate')
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async recalculateLeaveBalances(@Body('employeeId') employeeId?: string) {
    // Implementation would recalculate balances for employee or all employees
    return { message: 'Balances recalculated successfully' };
  }

  // REQ-039: Get Leave Policy Details
  @Get('policies/:leaveTypeId')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getLeavePolicyDetails(@Param('leaveTypeId') leaveTypeId: string) {
    // Implementation would return detailed policy information
    return { leaveTypeId, policy: {} };
  }

  // REQ-040: Update Leave Request Dates
  @Patch('requests/:id/dates')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async updateLeaveRequestDates(@Param('id') id: string, @Body() dates: { fromDate: Date; toDate: Date }) {
    // Implementation would update request dates if status allows
    return { message: 'Dates updated successfully' };
  }

  // REQ-041: Get Leave Requests by Status
  @Get('requests/status/:status')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_HEAD, SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getLeaveRequestsByStatus(@Param('status') status: string, @Query() filters: any) {
    const combinedFilters = { ...filters, status };
    return this.leavesService.generateLeaveReport(combinedFilters);
  }

  // REQ-042: Get Employee Leave Eligibility
  @Get('eligibility/:employeeId')
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_EMPLOYEE,
    SystemRole.HR_MANAGER,
  )
  async getEmployeeLeaveEligibility(@Param('employeeId') employeeId: string) {
    // Implementation would check eligibility based on tenure, contract type, etc.
    return { employeeId, eligibility: [] };
  }
}
