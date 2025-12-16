import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PerformanceService } from './performance.service';
import { CreateAppraisalTemplateDto } from './dto/create-appraisal-template.dto';
import { UpdateAppraisalTemplateDto } from './dto/update-appraisal-template.dto';
import { CreateAppraisalCycleDto } from './dto/create-appraisal-cycle.dto';
import { UpdateAppraisalCycleDto } from './dto/update-appraisal-cycle.dto';
import { CreateAppraisalEvaluationDto } from './dto/create-appraisal-evaluation.dto';
import { UpdateAppraisalEvaluationDto } from './dto/update-appraisal-evaluation.dto';
import { CreateAppraisalDisputeDto } from './dto/create-appraisal-dispute.dto';
import { ResolveAppraisalDisputeDto } from './dto/resolve-appraisal-dispute.dto';
import { AddHrReviewDto } from './dto/add-hr-review.dto';
import { SubmitSelfAssessmentDto } from './dto/submit-self-assessment.dto';
import { CreatePerformanceGoalDto } from './dto/create-performance-goal.dto';
import { UpdatePerformanceGoalDto } from './dto/update-performance-goal.dto';
import { CreatePerformanceFeedbackDto } from './dto/create-performance-feedback.dto';
import { UpdatePerformanceFeedbackDto } from './dto/update-performance-feedback.dto';
import { CreateAppraisalAssignmentDto } from './dto/create-appraisal-assignment.dto';
import { BulkAssignTemplateDto } from './dto/create-appraisal-assignment.dto';
import { UpdateAppraisalAssignmentDto } from './dto/update-appraisal-assignment.dto';
import { ExportAppraisalSummaryDto } from './dto/export-appraisal-summary.dto';
import { ExportOutcomeReportDto } from './dto/export-outcome-report.dto';
import { FlagHighPerformerDto } from './dto/flag-high-performer.dto';
import { CreatePerformanceImprovementPlanDto } from './dto/create-performance-improvement-plan.dto';
import { UpdatePerformanceImprovementPlanDto } from './dto/update-performance-improvement-plan.dto';
import {
  CreateVisibilityRuleDto,
  UpdateVisibilityRuleDto,
} from './dto/visibility-rule.dto';
import {
  CreateOneOnOneMeetingDto,
  UpdateOneOnOneMeetingDto,
} from './dto/one-on-one-meeting.dto';
import { AppraisalCycleStatus } from './enums/performance.enums';
import { AppraisalDisputeStatus } from './enums/performance.enums';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

@Controller('performance')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ==================== APPRAISAL TEMPLATE ENDPOINTS ====================

  /**
   * Create a new appraisal template
   * POST /performance/templates
   * REQ-PP-01: HR Manager configures standardized appraisal templates and rating scales.
   * Roles: HR_MANAGER ONLY
   */
  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async createTemplate(@Body() createDto: CreateAppraisalTemplateDto) {
    return this.performanceService.createTemplate(createDto);
  }

  /**
   * Get all templates
   * GET /performance/templates?isActive=true
   */
  @Get('templates')
  async findAllTemplates(@Query('isActive') isActive?: string) {
    const isActiveBool =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.performanceService.findAllTemplates(isActiveBool);
  }

  /**
   * Get a single template by ID
   * GET /performance/templates/:id
   */
  @Get('templates/:id')
  async findTemplateById(@Param('id') id: string) {
    return this.performanceService.findTemplateById(id);
  }

  /**
   * Update a template
   * PUT /performance/templates/:id
   * REQ-PP-01: HR Manager configures standardized appraisal templates and rating scales.
   * Roles: HR_MANAGER ONLY
   */
  @Put('templates/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateDto: UpdateAppraisalTemplateDto,
  ) {
    return this.performanceService.updateTemplate(id, updateDto);
  }

  /**
   * Delete a template
   * DELETE /performance/templates/:id
   * REQ-PP-01: HR Manager configures standardized appraisal templates and rating scales.
   * Since "configures" implies full CRUD, HR Manager should be able to delete templates.
   * Roles: HR_MANAGER ONLY
   */
  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async deleteTemplate(@Param('id') id: string) {
    await this.performanceService.deleteTemplate(id);
  }

  // ==================== APPRAISAL CYCLE ENDPOINTS ====================

  /**
   * Create a new appraisal cycle
   * POST /performance/cycles
   * REQ-PP-02: HR Manager defines and schedules appraisal cycles (Annual, Probationary).
   * Roles: HR_MANAGER ONLY
   */
  @Post('cycles')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async createCycle(@Body() createDto: CreateAppraisalCycleDto) {
    return this.performanceService.createCycle(createDto);
  }

  /**
   * Get all cycles
   * GET /performance/cycles?status=ACTIVE
   */
  @Get('cycles')
  async findAllCycles(@Query('status') status?: string) {
    return this.performanceService.findAllCycles(status as any);
  }

  /**
   * Get a single cycle by ID
   * GET /performance/cycles/:id
   */
  @Get('cycles/:id')
  async findCycleById(@Param('id') id: string) {
    return this.performanceService.findCycleById(id);
  }

  /**
   * Update a cycle
   * PUT /performance/cycles/:id
   * REQ-PP-02: HR Manager defines and schedules appraisal cycles.
   * Roles: HR_MANAGER ONLY
   */
  @Put('cycles/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async updateCycle(
    @Param('id') id: string,
    @Body() updateDto: UpdateAppraisalCycleDto,
  ) {
    return this.performanceService.updateCycle(id, updateDto);
  }

  /**
   * Activate a cycle (starts the appraisal process)
   * POST /performance/cycles/:id/activate
   * REQ-PP-02: HR Manager defines and schedules appraisal cycles.
   * Roles: HR_MANAGER ONLY
   */
  @Post('cycles/:id/activate')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async activateCycle(@Param('id') id: string) {
    return this.performanceService.activateCycle(id);
  }

  /**
   * Publish cycle results to employees
   * POST /performance/cycles/:id/publish
   * REQ-PP-02: HR Manager defines and schedules appraisal cycles.
   * Roles: HR_MANAGER ONLY
   */
  @Post('cycles/:id/publish')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async publishCycle(@Param('id') id: string) {
    return this.performanceService.publishCycle(id);
  }

  /**
   * Close a cycle
   * POST /performance/cycles/:id/close
   * REQ-PP-02: HR Manager defines and schedules appraisal cycles.
   * Roles: HR_MANAGER ONLY
   */
  @Post('cycles/:id/close')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async closeCycle(@Param('id') id: string) {
    return this.performanceService.closeCycle(id);
  }

  /**
   * Delete a cycle
   * DELETE /performance/cycles/:id
   * REQ-PP-02: HR Manager defines and schedules appraisal cycles.
   * Roles: HR_MANAGER ONLY
   */
  @Delete('cycles/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async deleteCycle(@Param('id') id: string) {
    await this.performanceService.deleteCycle(id);
    return { message: 'Cycle deleted successfully' };
  }

  /**
   * Get cycle progress dashboard
   * GET /performance/cycles/:id/progress
   * REQ-AE-06: HR Employee monitors appraisal progress
   * REQ-AE-10: HR Manager tracks appraisal completion via consolidated dashboard
   * Roles: HR_EMPLOYEE, HR_MANAGER
   */
  @Get('cycles/:id/progress')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  async getCycleProgress(@Param('id') id: string) {
    return this.performanceService.getCycleProgress(id);
  }

  /**
   * Export appraisal summaries
   * GET /performance/export/summaries
   * REQ-AE-11: HR Employee exports ad-hoc appraisal summaries.
   * Roles: HR_EMPLOYEE ONLY
   */
  @Get('export/summaries')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE)
  async exportAppraisalSummaries(
    @Query() query: ExportAppraisalSummaryDto,
    @Res() res: Response,
  ) {
    const { data, filename, contentType } =
      await this.performanceService.exportAppraisalSummaries(
        query.cycleId,
        query.departmentId,
        query.employeeId,
        query.format || 'csv',
        query.status,
      );

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  }

  /**
   * Generate outcome report
   * GET /performance/export/outcome-report
   * REQ-OD-06: HR Employee generates outcome reports.
   * Roles: HR_EMPLOYEE ONLY
   */
  @Get('export/outcome-report')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE)
  async generateOutcomeReport(
    @Query() query: ExportOutcomeReportDto,
    @Res() res: Response,
  ) {
    const { data, filename, contentType } =
      await this.performanceService.generateOutcomeReport(
        query.cycleId,
        query.departmentId,
        query.format || 'csv',
        query.includeHighPerformers === 'true' || query.includeHighPerformers === undefined,
        query.includePIPs === 'true' || query.includePIPs === undefined,
        query.includeDisputes === 'true' || query.includeDisputes === undefined,
      );

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  }

  // ==================== APPRAISAL ASSIGNMENT ENDPOINTS ====================

  /**
   * Get all assignments for a cycle
   * GET /performance/cycles/:cycleId/assignments
   */
  @Get('cycles/:cycleId/assignments')
  async findAssignmentsByCycle(@Param('cycleId') cycleId: string) {
    return this.performanceService.findAssignmentsByCycle(cycleId);
  }

  /**
   * Get assignments for a manager
   * GET /performance/managers/:managerId/assignments?cycleId=xxx
   * REQ-PP-13: Line Manager views assigned appraisal forms.
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Get('managers/:managerId/assignments')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async findAssignmentsByManager(
    @Param('managerId') managerId: string,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.performanceService.findAssignmentsByManager(managerId, cycleId);
  }

  /**
   * Get assignments for an employee
   * GET /performance/employees/:employeeId/assignments?cycleId=xxx
   */
  @Get('employees/:employeeId/assignments')
  async findAssignmentsByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.performanceService.findAssignmentsByEmployee(
      employeeId,
      cycleId,
    );
  }

  /**
   * Get assignment by employee and cycle
   * GET /performance/cycles/:cycleId/employees/:employeeId/assignment
   */
  @Get('cycles/:cycleId/employees/:employeeId/assignment')
  async findAssignmentByEmployeeAndCycle(
    @Param('cycleId') cycleId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.performanceService.findAssignmentByEmployeeAndCycle(
      employeeId,
      cycleId,
    );
  }

  /**
   * Get all assignments with optional filters
   * GET /performance/assignments?cycleId=xxx&templateId=xxx&employeeProfileId=xxx&managerProfileId=xxx&departmentId=xxx&status=xxx
   * REQ-PP-05: HR Employee assigns appraisal forms/templates.
   * Roles: HR_EMPLOYEE ONLY
   */
  @Get('assignments')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  async findAllAssignments(
    @Query('cycleId') cycleId?: string,
    @Query('templateId') templateId?: string,
    @Query('employeeProfileId') employeeProfileId?: string,
    @Query('managerProfileId') managerProfileId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    return this.performanceService.findAllAssignments({
      cycleId,
      templateId,
      employeeProfileId,
      managerProfileId,
      departmentId,
      status: status as any,
    });
  }

  /**
   * Get a single assignment by ID
   * GET /performance/assignments/:id
   */
  @Get('assignments/:id')
  async findAssignmentById(@Param('id') id: string) {
    return this.performanceService.findAssignmentById(id);
  }

  /**
   * Manually assign template to employee(s)
   * POST /performance/assignments
   * REQ-PP-05: HR Employee assigns appraisal forms/templates to employees and managers.
   * Roles: HR_EMPLOYEE ONLY
   */
  @Post('assignments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE)
  async assignTemplateToEmployees(@Body() createDto: CreateAppraisalAssignmentDto) {
    return this.performanceService.assignTemplateToEmployees(createDto);
  }

  /**
   * Bulk assign template to departments, positions, or employees
   * POST /performance/assignments/bulk
   * REQ-PP-05: HR Employee assigns appraisal forms/templates to employees and managers.
   * Roles: HR_EMPLOYEE ONLY
   */
  @Post('assignments/bulk')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE)
  async bulkAssignTemplate(@Body() bulkDto: BulkAssignTemplateDto) {
    return this.performanceService.bulkAssignTemplate(bulkDto);
  }

  /**
   * Update an assignment
   * PUT /performance/assignments/:id
   * REQ-PP-05: HR Employee assigns appraisal forms/templates.
   * Roles: HR_EMPLOYEE ONLY
   */
  @Put('assignments/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE)
  async updateAssignment(
    @Param('id') id: string,
    @Body() updateDto: UpdateAppraisalAssignmentDto,
  ) {
    return this.performanceService.updateAssignment(id, updateDto);
  }

  /**
   * Employee acknowledges assignment
   * POST /performance/assignments/:id/acknowledge
   * REQ-PP-07: Employee receives notification of assigned objectives and acknowledges them.
   * Roles: DEPARTMENT_EMPLOYEE (any authenticated employee can acknowledge their own assignment)
   */
  /**
   * Employee acknowledges assignment
   * POST /performance/assignments/:id/acknowledge
   * REQ-PP-07: Employee receives notification of assigned objectives and acknowledges them.
   * Roles: Any authenticated employee (validates ownership)
   */
  @Post('assignments/:id/acknowledge')
  @HttpCode(HttpStatus.OK)
  async acknowledgeAssignment(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.performanceService.acknowledgeAssignment(id, user.userid.toString());
  }

  /**
   * Remove an assignment
   * DELETE /performance/assignments/:id
   * REQ-PP-05: HR Employee assigns appraisal forms/templates.
   * Roles: HR_EMPLOYEE ONLY
   */
  @Delete('assignments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE)
  async removeAssignment(@Param('id') id: string) {
    await this.performanceService.removeAssignment(id);
  }

  // ==================== APPRAISAL EVALUATION ENDPOINTS ====================

  /**
   * Create or update an appraisal evaluation
   * POST /performance/cycles/:cycleId/employees/:employeeId/evaluation
   * REQ-AE-03: Line Manager completes structured appraisal ratings for direct reports.
   * REQ-AE-04: Line Manager adds comments, examples, and development recommendations.
   * Roles: DEPARTMENT_HEAD (Line Manager) - Service will verify they're the assigned manager
   */
  @Post('cycles/:cycleId/employees/:employeeId/evaluation')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async createOrUpdateEvaluation(
    @Param('cycleId') cycleId: string,
    @Param('employeeId') employeeId: string,
    @Body() createDto: CreateAppraisalEvaluationDto,
    @CurrentUser() user: any,
  ) {
    return this.performanceService.createOrUpdateEvaluation(
      cycleId,
      employeeId,
      createDto,
      user?.userid || user?._id,
    );
  }

  /**
   * Get evaluation by cycle and employee
   * GET /performance/cycles/:cycleId/employees/:employeeId/evaluation
   */
  @Get('cycles/:cycleId/employees/:employeeId/evaluation')
  async findEvaluationByCycleAndEmployee(
    @Param('cycleId') cycleId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.performanceService.findEvaluationByCycleAndEmployee(
      cycleId,
      employeeId,
    );
  }

  /**
   * Get evaluation by ID
   * GET /performance/evaluations/:id
   * Applies visibility rules based on current user's role
   */
  @Get('evaluations/:id')
  async findEvaluationById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // Pass all user roles - user may have multiple roles (e.g., HR_EMPLOYEE and DEPARTMENT_EMPLOYEE)
    // Visibility rules will check if ANY of the user's roles can view the field
    const userRoles = user.roles && user.roles.length > 0 
      ? (user.roles as SystemRole[])
      : undefined;
    
    return this.performanceService.findEvaluationById(id, userRoles);
  }

  /**
   * Employee acknowledges appraisal
   * POST /performance/evaluations/:id/acknowledge
   */
  @Post('evaluations/:id/acknowledge')
  async acknowledgeEvaluation(
    @Param('id') id: string,
    @Body('comment') comment?: string,
  ) {
    return this.performanceService.acknowledgeEvaluation(id, comment);
  }

  /**
   * Update evaluation
   * PUT /performance/evaluations/:id
   * REQ-AE-03: Line Manager completes structured appraisal ratings for direct reports.
   * REQ-AE-04: Line Manager adds comments, examples, and development recommendations.
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Put('evaluations/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async updateEvaluation(
    @Param('id') id: string,
    @Body() updateDto: UpdateAppraisalEvaluationDto,
  ) {
    const evaluation = await this.performanceService.findEvaluationById(id);
    return this.performanceService.createOrUpdateEvaluation(
      evaluation.cycleId?.toString(),
      (evaluation as any).employeeId?.toString(),
      updateDto as any,
    );
  }

  // ==================== APPRAISAL DISPUTE ENDPOINTS ====================

  /**
   * Create a dispute for an appraisal evaluation
   * POST /performance/disputes
   * REQ-AE-07: Employee or HR Employee flags or raises a concern about a rating.
   * Roles: DEPARTMENT_EMPLOYEE, HR_EMPLOYEE ONLY
   */
  @Post('disputes')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_EMPLOYEE,
  )
  async createDispute(
    @Body('employeeId') employeeId: string,
    @Body() createDto: CreateAppraisalDisputeDto,
  ) {
    return this.performanceService.createDispute(employeeId, createDto);
  }

  /**
   * Get all disputes
   * GET /performance/disputes?status=SUBMITTED
   */
  @Get('disputes')
  async findAllDisputes(@Query('status') status?: string) {
    return this.performanceService.findAllDisputes(status as any);
  }

  /**
   * Get disputes for a specific employee
   * GET /performance/employees/:employeeId/disputes
   */
  @Get('employees/:employeeId/disputes')
  async findDisputesByEmployee(@Param('employeeId') employeeId: string) {
    return this.performanceService.findDisputesByEmployee(employeeId);
  }

  /**
   * Get a single dispute by ID
   * GET /performance/disputes/:id
   */
  @Get('disputes/:id')
  async findDisputeById(@Param('id') id: string) {
    return this.performanceService.findDisputeById(id);
  }

  /**
   * Resolve a dispute (HR Manager action)
   * POST /performance/disputes/:id/resolve
   * REQ-OD-07: HR Manager resolves disputes between employees and managers.
   * Roles: HR_MANAGER ONLY
   */
  @Post('disputes/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async resolveDispute(
    @Param('id') id: string,
    @Body('reviewerId') reviewerId: string,
    @Body() resolveDto: ResolveAppraisalDisputeDto,
  ) {
    return this.performanceService.resolveDispute(id, reviewerId, resolveDto);
  }

  // ==================== SELF-ASSESSMENT ENDPOINTS ====================

  /**
   * Submit self-assessment
   * POST /performance/cycles/:cycleId/employees/:employeeId/self-assessment
   */
  @Post('cycles/:cycleId/employees/:employeeId/self-assessment')
  @HttpCode(HttpStatus.CREATED)
  async submitSelfAssessment(
    @Param('cycleId') cycleId: string,
    @Param('employeeId') employeeId: string,
    @Body() selfAssessmentDto: SubmitSelfAssessmentDto,
  ) {
    return this.performanceService.submitSelfAssessment(
      cycleId,
      employeeId,
      selfAssessmentDto,
    );
  }

  // ==================== HR REVIEW ENDPOINTS ====================

  /**
   * Add HR review to an evaluation
   * POST /performance/evaluations/:id/hr-review
   * Note: Not explicitly in user stories, but HR Manager should be able to add reviews.
   * Roles: HR_MANAGER ONLY (keeping HR_MANAGER as it's HR review functionality)
   */
  @Post('evaluations/:id/hr-review')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async addHrReview(
    @Param('id') id: string,
    @Body() hrReviewDto: AddHrReviewDto,
  ) {
    return this.performanceService.addHrReview(id, hrReviewDto);
  }

  // ==================== PERFORMANCE GOAL ENDPOINTS ====================

  /**
   * Create a performance goal
   * POST /performance/goals
   * REQ-PP-12: Line Manager sets and reviews employee objectives.
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Post('goals')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async createGoal(
    @Body() createDto: CreatePerformanceGoalDto,
    @CurrentUser() user: any,
  ) {
    // Set setBy to current user ID
    createDto.setBy = user.userid.toString();
    return this.performanceService.createGoal(createDto);
  }

  /**
   * Get goals for an employee
   * GET /performance/employees/:employeeId/goals?status=IN_PROGRESS
   */
  @Get('employees/:employeeId/goals')
  async findGoalsByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('status') status?: string,
  ) {
    return this.performanceService.findGoalsByEmployee(
      employeeId,
      status as any,
    );
  }

  /**
   * Get goal by ID
   * GET /performance/goals/:id
   */
  @Get('goals/:id')
  async findGoalById(@Param('id') id: string) {
    return this.performanceService.findGoalById(id);
  }

  /**
   * Update a performance goal
   * PUT /performance/goals/:id
   * REQ-PP-12: Line Manager sets and reviews employee objectives.
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Put('goals/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async updateGoal(
    @Param('id') id: string,
    @Body() updateDto: UpdatePerformanceGoalDto,
    @CurrentUser() user: any,
  ) {
    return this.performanceService.updateGoal(id, updateDto, user.userid.toString());
  }

  /**
   * Delete a performance goal
   * DELETE /performance/goals/:id
   * REQ-PP-12: Line Manager sets and reviews employee objectives.
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Delete('goals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async deleteGoal(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    await this.performanceService.deleteGoal(id, user.userid.toString());
  }

  // ==================== PERFORMANCE FEEDBACK ENDPOINTS ====================

  /**
   * Create performance feedback
   * POST /performance/feedback
   */
  @Post('feedback')
  @HttpCode(HttpStatus.CREATED)
  async createFeedback(@Body() createDto: CreatePerformanceFeedbackDto) {
    return this.performanceService.createFeedback(createDto);
  }

  /**
   * Get feedback for an employee (as recipient)
   * GET /performance/employees/:employeeId/feedback?status=SUBMITTED
   */
  @Get('employees/:employeeId/feedback')
  async findFeedbackByRecipient(
    @Param('employeeId') employeeId: string,
    @Query('status') status?: string,
  ) {
    return this.performanceService.findFeedbackByRecipient(
      employeeId,
      status as any,
    );
  }

  /**
   * Get feedback by ID
   * GET /performance/feedback/:id
   */
  @Get('feedback/:id')
  async findFeedbackById(@Param('id') id: string) {
    return this.performanceService.findFeedbackById(id);
  }

  /**
   * Update feedback (acknowledge, respond)
   * PUT /performance/feedback/:id
   */
  @Put('feedback/:id')
  async updateFeedback(
    @Param('id') id: string,
    @Body() updateDto: UpdatePerformanceFeedbackDto,
  ) {
    return this.performanceService.updateFeedback(id, updateDto);
  }

  /**
   * Delete feedback
   * DELETE /performance/feedback/:id
   */
  @Delete('feedback/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFeedback(@Param('id') id: string) {
    await this.performanceService.deleteFeedback(id);
  }

  // ==================== PERFORMANCE HISTORY ENDPOINTS ====================

  /**
   * Get performance history for an employee
   * GET /performance/employees/:employeeId/history
   * REQ-OD-08: Employee / Line Manager access past appraisal history
   * Authorization: Employee can see own history, Manager can see direct reports, HR/Admin can see any
   */
  @Get('employees/:employeeId/history')
  @UseGuards(RolesGuard)
  async getEmployeePerformanceHistory(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: any,
  ) {
    return this.performanceService.getEmployeePerformanceHistory(
      employeeId,
      user.userid?.toString(),
      user.roles || [],
    );
  }

  // ==================== HIGH-PERFORMER FLAGGING ENDPOINTS ====================
  // Note: Uses existing AppraisalRecord fields (managerSummary, strengths) to store flags

  /**
   * Flag an employee as a high-performer
   * POST /performance/high-performers/flag
   * REQ-OD-03: Line Manager flags high-performers for promotion consideration.
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Post('high-performers/flag')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async flagHighPerformer(
    @CurrentUser() user: any,
    @Body() flagDto: FlagHighPerformerDto,
  ) {
    const managerId = user.userid || user._id;
    return this.performanceService.flagHighPerformer(
      flagDto.appraisalRecordId,
      managerId,
      {
        isHighPerformer: flagDto.isHighPerformer ?? true,
        notes: flagDto.notes,
        promotionRecommendation: flagDto.promotionRecommendation,
      },
    );
  }

  /**
   * Unflag a high-performer
   * POST /performance/high-performers/unflag/:appraisalRecordId
   * REQ-OD-03: Line Manager flags high-performers for promotion consideration.
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Post('high-performers/unflag/:appraisalRecordId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async unflagHighPerformer(
    @CurrentUser() user: any,
    @Param('appraisalRecordId') appraisalRecordId: string,
  ) {
    const managerId = user.userid || user._id;
    await this.performanceService.unflagHighPerformer(
      appraisalRecordId,
      managerId,
    );
    return { message: 'High-performer flag removed successfully' };
  }

  /**
   * Get high-performer flag for an appraisal
   * GET /performance/high-performers/flag/:appraisalRecordId
   */
  @Get('high-performers/flag/:appraisalRecordId')
  async getHighPerformerFlag(
    @Param('appraisalRecordId') appraisalRecordId: string,
  ) {
    return this.performanceService.getHighPerformerFlag(appraisalRecordId);
  }

  /**
   * Get all high-performers flagged by a manager
   * GET /performance/high-performers/manager/:managerId
   */
  @Get('high-performers/manager/:managerId')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async getHighPerformersByManager(@Param('managerId') managerId: string) {
    return this.performanceService.getHighPerformersByManager(managerId);
  }

  /**
   * Get all high-performers (HR view)
   * GET /performance/high-performers
   * REQ-OD-06: HR Employee generates outcome reports (includes high performers)
   * Also needed for HR Employee to display high performer status in assignments table
   */
  @Get('high-performers')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async getAllHighPerformers() {
    return this.performanceService.getAllHighPerformers();
  }

  // ==================== PERFORMANCE IMPROVEMENT PLAN (PIP) ENDPOINTS ====================
  // REQ-OD-05: Line Manager initiates Performance Improvement Plans
  // Note: PIP data is stored in existing AppraisalRecord fields using special markers

  /**
   * Create a Performance Improvement Plan
   * POST /performance/improvement-plans
   * REQ-OD-05: Line Manager initiates Performance Improvement Plans (PIPs).
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Post('improvement-plans')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async createPerformanceImprovementPlan(
    @CurrentUser() user: any,
    @Body() createDto: CreatePerformanceImprovementPlanDto,
  ) {
    const managerId = user.userid || user._id;
    return this.performanceService.createPerformanceImprovementPlan(managerId, createDto);
  }

  /**
   * Get all PIPs for an employee
   * GET /performance/employees/:employeeId/improvement-plans
   */
  @Get('employees/:employeeId/improvement-plans')
  async getPIPsByEmployee(@Param('employeeId') employeeId: string) {
    return this.performanceService.getPIPsByEmployee(employeeId);
  }

  /**
   * Get all PIPs created by a manager
   * GET /performance/managers/:managerId/improvement-plans
   * REQ-OD-05: Line Manager initiates Performance Improvement Plans (PIPs).
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Get('managers/:managerId/improvement-plans')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async getPIPsByManager(@Param('managerId') managerId: string) {
    return this.performanceService.getPIPsByManager(managerId);
  }

  /**
   * Get all PIPs (HR/Admin view)
   * GET /performance/improvement-plans?status=ACTIVE
   * REQ-AE-10: HR Manager tracks appraisal completion via consolidated dashboard.
   * Roles: HR_MANAGER ONLY
   */
  @Get('improvement-plans')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER)
  async getAllPIPs(@Query('status') status?: string) {
    return this.performanceService.getAllPIPs(status);
  }

  /**
   * Get a single PIP by appraisal record ID
   * GET /performance/improvement-plans/appraisal/:appraisalRecordId
   */
  @Get('improvement-plans/appraisal/:appraisalRecordId')
  async getPIPByAppraisalId(@Param('appraisalRecordId') appraisalRecordId: string) {
    return this.performanceService.getPIPByAppraisalId(appraisalRecordId);
  }

  /**
   * Update a PIP
   * PUT /performance/improvement-plans/appraisal/:appraisalRecordId
   * REQ-OD-05: Line Manager initiates Performance Improvement Plans (PIPs).
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Put('improvement-plans/appraisal/:appraisalRecordId')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async updatePIP(
    @CurrentUser() user: any,
    @Param('appraisalRecordId') appraisalRecordId: string,
    @Body() updateDto: UpdatePerformanceImprovementPlanDto,
  ) {
    const managerId = user.userid || user._id;
    return this.performanceService.updatePIP(appraisalRecordId, managerId, updateDto);
  }

  /**
   * Delete a PIP
   * DELETE /performance/improvement-plans/appraisal/:appraisalRecordId
   * REQ-OD-05: Line Manager initiates Performance Improvement Plans (PIPs).
   * Roles: DEPARTMENT_HEAD (Line Manager) ONLY
   */
  @Delete('improvement-plans/appraisal/:appraisalRecordId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async deletePIP(
    @CurrentUser() user: any,
    @Param('appraisalRecordId') appraisalRecordId: string,
  ) {
    const managerId = user.userid || user._id;
    await this.performanceService.deletePIP(appraisalRecordId, managerId);
  }

  /**
   * REQ-OD-16: System Admin configures visibility rules
   * Roles: SYSTEM_ADMIN only
   */

  @Get('visibility-rules')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async getAllVisibilityRules() {
    return this.performanceService.getAllVisibilityRules();
  }

  @Get('visibility-rules/active')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async getActiveVisibilityRules() {
    return this.performanceService.getActiveVisibilityRules();
  }

  @Get('visibility-rules/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async getVisibilityRuleById(@Param('id') id: string) {
    return this.performanceService.getVisibilityRuleById(id);
  }

  @Post('visibility-rules')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async createVisibilityRule(@Body() createDto: CreateVisibilityRuleDto) {
    return this.performanceService.createVisibilityRule(createDto);
  }

  @Put('visibility-rules/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async updateVisibilityRule(
    @Param('id') id: string,
    @Body() updateDto: UpdateVisibilityRuleDto,
  ) {
    return this.performanceService.updateVisibilityRule(id, updateDto);
  }

  @Delete('visibility-rules/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVisibilityRule(@Param('id') id: string) {
    await this.performanceService.deleteVisibilityRule(id);
  }

  /**
   * REQ-OD-14: Line Manager schedules 1-on-1 meetings
   * Roles: DEPARTMENT_HEAD (Line Manager)
   */

  @Post('meetings')
  @UseGuards(JwtAuthGuard)
  async createOneOnOneMeeting(
    @CurrentUser() user: any,
    @Body() createDto: CreateOneOnOneMeetingDto,
  ) {
    const managerId = user.userid || user._id;
    // Service will check if manager is department head by position
    return this.performanceService.createOneOnOneMeeting(managerId, createDto);
  }

  @Get('managers/:managerId/meetings')
  @UseGuards(JwtAuthGuard)
  async getMeetingsByManager(@Param('managerId') managerId: string) {
    // Service will check if manager is department head by position
    return this.performanceService.getMeetingsByManager(managerId);
  }

  @Get('employees/:employeeId/meetings')
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  async getMeetingsByEmployee(@Param('employeeId') employeeId: string) {
    return this.performanceService.getMeetingsByEmployee(employeeId);
  }

  @Get('meetings/:id')
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  async getMeetingById(@Param('id') id: string) {
    return this.performanceService.getMeetingById(id);
  }

  @Put('meetings/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async updateOneOnOneMeeting(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateOneOnOneMeetingDto,
  ) {
    const managerId = user.userid || user._id;
    return this.performanceService.updateOneOnOneMeeting(
      id,
      managerId,
      updateDto,
    );
  }

  @Delete('meetings/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_HEAD)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOneOnOneMeeting(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const managerId = user.userid || user._id;
    await this.performanceService.deleteOneOnOneMeeting(id, managerId);
  }
}
