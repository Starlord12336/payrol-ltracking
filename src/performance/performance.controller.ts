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
} from '@nestjs/common';
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
import { AppraisalCycleStatus } from './enums/performance.enums';
import { AppraisalDisputeStatus } from './enums/performance.enums';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
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
   * Roles: HR_MANAGER, HR_ADMIN
   */
  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
   * Roles: HR_MANAGER, HR_ADMIN
   */
  @Put('templates/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateDto: UpdateAppraisalTemplateDto,
  ) {
    return this.performanceService.updateTemplate(id, updateDto);
  }

  /**
   * Delete a template
   * DELETE /performance/templates/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async deleteTemplate(@Param('id') id: string) {
    await this.performanceService.deleteTemplate(id);
  }

  // ==================== APPRAISAL CYCLE ENDPOINTS ====================

  /**
   * Create a new appraisal cycle
   * POST /performance/cycles
   * Roles: HR_MANAGER, HR_ADMIN
   */
  @Post('cycles')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
   * Roles: HR_MANAGER, HR_ADMIN
   */
  @Put('cycles/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateCycle(
    @Param('id') id: string,
    @Body() updateDto: UpdateAppraisalCycleDto,
  ) {
    return this.performanceService.updateCycle(id, updateDto);
  }

  /**
   * Activate a cycle (starts the appraisal process)
   * POST /performance/cycles/:id/activate
   * Roles: HR_MANAGER, HR_ADMIN
   */
  @Post('cycles/:id/activate')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async activateCycle(@Param('id') id: string) {
    return this.performanceService.activateCycle(id);
  }

  /**
   * Publish cycle results to employees
   * POST /performance/cycles/:id/publish
   * Roles: HR_MANAGER, HR_ADMIN
   */
  @Post('cycles/:id/publish')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async publishCycle(@Param('id') id: string) {
    return this.performanceService.publishCycle(id);
  }

  /**
   * Close a cycle
   * POST /performance/cycles/:id/close
   * Roles: HR_MANAGER, HR_ADMIN
   */
  @Post('cycles/:id/close')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async closeCycle(@Param('id') id: string) {
    return this.performanceService.closeCycle(id);
  }

  /**
   * Get cycle progress dashboard
   * GET /performance/cycles/:id/progress
   */
  @Get('cycles/:id/progress')
  async getCycleProgress(@Param('id') id: string) {
    return this.performanceService.getCycleProgress(id);
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
   */
  @Get('managers/:managerId/assignments')
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

  // ==================== APPRAISAL EVALUATION ENDPOINTS ====================

  /**
   * Create or update an appraisal evaluation
   * POST /performance/cycles/:cycleId/employees/:employeeId/evaluation
   * Roles: DEPARTMENT_MANAGER, HR_MANAGER, HR_ADMIN
   */
  @Post('cycles/:cycleId/employees/:employeeId/evaluation')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async createOrUpdateEvaluation(
    @Param('cycleId') cycleId: string,
    @Param('employeeId') employeeId: string,
    @Body() createDto: CreateAppraisalEvaluationDto,
  ) {
    return this.performanceService.createOrUpdateEvaluation(
      cycleId,
      employeeId,
      createDto,
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
   */
  @Get('evaluations/:id')
  async findEvaluationById(@Param('id') id: string) {
    return this.performanceService.findEvaluationById(id);
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
   * Roles: DEPARTMENT_MANAGER, HR_MANAGER, HR_ADMIN
   */
  @Put('evaluations/:id')
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
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
   * Roles: EMPLOYEE, DEPARTMENT_MANAGER, HR_MANAGER, HR_ADMIN
   */
  @Post('disputes')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.DEPARTMENT_EMPLOYEE,
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
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
   * Roles: HR_MANAGER, HR_ADMIN
   */
  @Post('disputes/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
   * Roles: HR_MANAGER, HR_ADMIN
   */
  @Post('evaluations/:id/hr-review')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
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
   */
  @Post('goals')
  @HttpCode(HttpStatus.CREATED)
  async createGoal(@Body() createDto: CreatePerformanceGoalDto) {
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
   */
  @Put('goals/:id')
  async updateGoal(
    @Param('id') id: string,
    @Body() updateDto: UpdatePerformanceGoalDto,
  ) {
    return this.performanceService.updateGoal(id, updateDto);
  }

  /**
   * Delete a performance goal
   * DELETE /performance/goals/:id
   */
  @Delete('goals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGoal(@Param('id') id: string) {
    await this.performanceService.deleteGoal(id);
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
   */
  @Get('employees/:employeeId/history')
  async getEmployeePerformanceHistory(@Param('employeeId') employeeId: string) {
    return this.performanceService.getEmployeePerformanceHistory(employeeId);
  }
}
