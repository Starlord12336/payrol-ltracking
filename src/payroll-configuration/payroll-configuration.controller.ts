////////////////////////# Core Config Module - Emad #######################################

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { PayrollConfigurationService } from './payroll-configuration.service';

// DTOs
import {
  CreatePayGradeDto,
  UpdatePayGradeDto,
  FilterPayGradeDto,
  CreateAllowanceDto,
  UpdateAllowanceDto,
  FilterAllowanceDto,
  CreateTaxRuleDto,
  UpdateTaxRuleDto,
  FilterTaxRuleDto,
  ApproveDto,
} from './dto';

/**
 * PayrollConfigurationController
 *
 * REST API endpoints for Core Configuration entities:
 * - Pay Grades Management (/api/payroll-config/pay-grades)
 * - Allowances Management (/api/payroll-config/allowances)
 * - Tax Rules Management (/api/payroll-config/tax-rules)
 * - Approval Workflow Dashboard (/api/payroll-config/approvals)
 *
 * @author Mohammed Emad
 */
@ApiTags('Payroll Configuration - Core Config Module')
@Controller('payroll-config')
export class PayrollConfigurationController {
  constructor(
    private readonly payrollConfigService: PayrollConfigurationService,
  ) {}

  // ==========================================
  // PAY GRADE ENDPOINTS
  // ==========================================

  @Post('pay-grades')
  @ApiOperation({
    summary: 'Create a new pay grade',
    description:
      'Creates a new pay grade in DRAFT status. Business Rules: BR-PG-001 to BR-PG-003',
  })
  @ApiBody({ type: CreatePayGradeDto })
  @ApiResponse({ status: 201, description: 'Pay grade created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Pay grade with this name already exists',
  })
  async createPayGrade(@Body() createPayGradeDto: CreatePayGradeDto) {
    return this.payrollConfigService.createPayGrade(createPayGradeDto);
  }

  @Get('pay-grades')
  @ApiOperation({
    summary: 'Get all pay grades',
    description:
      'Retrieves all pay grades with optional filtering by status, grade name, or salary range',
  })
  @ApiResponse({
    status: 200,
    description: 'Pay grades retrieved successfully',
  })
  async findAllPayGrades(@Query() filter: FilterPayGradeDto) {
    return this.payrollConfigService.findAllPayGrades(filter);
  }

  @Get('pay-grades/approved')
  @ApiOperation({
    summary: 'Get all approved pay grades',
    description:
      'Retrieves only approved pay grades for use in payroll execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved pay grades retrieved successfully',
  })
  async getApprovedPayGrades() {
    return this.payrollConfigService.getApprovedPayGrades();
  }

  @Get('pay-grades/:id')
  @ApiOperation({ summary: 'Get a single pay grade by ID' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiResponse({ status: 200, description: 'Pay grade retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async findPayGradeById(@Param('id') id: string) {
    return this.payrollConfigService.findPayGradeById(id);
  }

  @Put('pay-grades/:id')
  @ApiOperation({
    summary: 'Update a pay grade',
    description:
      'Updates a pay grade. Only items in DRAFT status can be edited (BR-AW-002)',
  })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiBody({ type: UpdatePayGradeDto })
  @ApiResponse({ status: 200, description: 'Pay grade updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot update non-DRAFT pay grade',
  })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async updatePayGrade(
    @Param('id') id: string,
    @Body() updatePayGradeDto: UpdatePayGradeDto,
  ) {
    return this.payrollConfigService.updatePayGrade(id, updatePayGradeDto);
  }

  @Delete('pay-grades/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a pay grade',
    description:
      'Deletes a pay grade. Only items in DRAFT status can be deleted (BR-AW-002)',
  })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiResponse({ status: 200, description: 'Pay grade deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete non-DRAFT pay grade',
  })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async deletePayGrade(@Param('id') id: string) {
    return this.payrollConfigService.deletePayGrade(id);
  }

  @Post('pay-grades/:id/submit')
  @ApiOperation({
    summary: 'Submit pay grade for approval',
    description: 'Submits a pay grade for manager approval',
  })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiResponse({ status: 200, description: 'Pay grade submitted for approval' })
  @ApiResponse({
    status: 400,
    description: 'Cannot submit non-DRAFT pay grade',
  })
  async submitPayGradeForApproval(@Param('id') id: string) {
    return this.payrollConfigService.submitPayGradeForApproval(id);
  }

  @Post('pay-grades/:id/approve')
  @ApiOperation({
    summary: 'Approve a pay grade',
    description:
      'Approves a pay grade. Requires Payroll Manager role (BR-AW-003)',
  })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiBody({ type: ApproveDto })
  @ApiResponse({ status: 200, description: 'Pay grade approved successfully' })
  @ApiResponse({ status: 400, description: 'Pay grade is already approved' })
  async approvePayGrade(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
  ) {
    return this.payrollConfigService.approvePayGrade(id, approveDto);
  }

  @Post('pay-grades/:id/reject')
  @ApiOperation({
    summary: 'Reject a pay grade',
    description: 'Rejects a pay grade. Returns to DRAFT status',
  })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiResponse({ status: 200, description: 'Pay grade rejected' })
  @ApiResponse({ status: 400, description: 'Pay grade is already rejected' })
  async rejectPayGrade(@Param('id') id: string) {
    return this.payrollConfigService.rejectPayGrade(id);
  }

  // ==========================================
  // ALLOWANCE ENDPOINTS
  // ==========================================

  @Post('allowances')
  @ApiOperation({
    summary: 'Create a new allowance',
    description:
      'Creates a new allowance in DRAFT status. Business Rules: BR-AL-001, BR-AL-002',
  })
  @ApiBody({ type: CreateAllowanceDto })
  @ApiResponse({ status: 201, description: 'Allowance created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Allowance with this name already exists',
  })
  async createAllowance(@Body() createAllowanceDto: CreateAllowanceDto) {
    return this.payrollConfigService.createAllowance(createAllowanceDto);
  }

  @Get('allowances')
  @ApiOperation({
    summary: 'Get all allowances',
    description: 'Retrieves all allowances with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Allowances retrieved successfully',
  })
  async findAllAllowances(@Query() filter: FilterAllowanceDto) {
    return this.payrollConfigService.findAllAllowances(filter);
  }

  @Get('allowances/approved')
  @ApiOperation({
    summary: 'Get all approved allowances',
    description:
      'Retrieves only approved allowances for use in payroll execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved allowances retrieved successfully',
  })
  async getApprovedAllowances() {
    return this.payrollConfigService.getApprovedAllowances();
  }

  @Get('allowances/:id')
  @ApiOperation({ summary: 'Get a single allowance by ID' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiResponse({ status: 200, description: 'Allowance retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Allowance not found' })
  async findAllowanceById(@Param('id') id: string) {
    return this.payrollConfigService.findAllowanceById(id);
  }

  @Put('allowances/:id')
  @ApiOperation({
    summary: 'Update an allowance',
    description:
      'Updates an allowance. Only items in DRAFT status can be edited',
  })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiBody({ type: UpdateAllowanceDto })
  @ApiResponse({ status: 200, description: 'Allowance updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot update non-DRAFT allowance',
  })
  async updateAllowance(
    @Param('id') id: string,
    @Body() updateAllowanceDto: UpdateAllowanceDto,
  ) {
    return this.payrollConfigService.updateAllowance(id, updateAllowanceDto);
  }

  @Delete('allowances/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an allowance',
    description:
      'Deletes an allowance. Only items in DRAFT status can be deleted',
  })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiResponse({ status: 200, description: 'Allowance deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete non-DRAFT allowance',
  })
  async deleteAllowance(@Param('id') id: string) {
    return this.payrollConfigService.deleteAllowance(id);
  }

  @Post('allowances/:id/submit')
  @ApiOperation({ summary: 'Submit allowance for approval' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiResponse({ status: 200, description: 'Allowance submitted for approval' })
  async submitAllowanceForApproval(@Param('id') id: string) {
    return this.payrollConfigService.submitAllowanceForApproval(id);
  }

  @Post('allowances/:id/approve')
  @ApiOperation({
    summary: 'Approve an allowance',
    description: 'Approves an allowance. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiBody({ type: ApproveDto })
  @ApiResponse({ status: 200, description: 'Allowance approved successfully' })
  async approveAllowance(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
  ) {
    return this.payrollConfigService.approveAllowance(id, approveDto);
  }

  @Post('allowances/:id/reject')
  @ApiOperation({
    summary: 'Reject an allowance',
    description: 'Rejects an allowance',
  })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiResponse({ status: 200, description: 'Allowance rejected' })
  async rejectAllowance(@Param('id') id: string) {
    return this.payrollConfigService.rejectAllowance(id);
  }

  // ==========================================
  // TAX RULES ENDPOINTS
  // ==========================================

  @Post('tax-rules')
  @ApiOperation({
    summary: 'Create a new tax rule',
    description:
      'Creates a new tax rule in DRAFT status. Business Rules: BR-TX-001, BR-TX-002',
  })
  @ApiBody({ type: CreateTaxRuleDto })
  @ApiResponse({ status: 201, description: 'Tax rule created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Tax rule with this name already exists',
  })
  async createTaxRule(@Body() createTaxRuleDto: CreateTaxRuleDto) {
    return this.payrollConfigService.createTaxRule(createTaxRuleDto);
  }

  @Get('tax-rules')
  @ApiOperation({
    summary: 'Get all tax rules',
    description: 'Retrieves all tax rules with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Tax rules retrieved successfully' })
  async findAllTaxRules(@Query() filter: FilterTaxRuleDto) {
    return this.payrollConfigService.findAllTaxRules(filter);
  }

  @Get('tax-rules/approved')
  @ApiOperation({
    summary: 'Get all approved tax rules',
    description:
      'Retrieves only approved tax rules for use in payroll execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved tax rules retrieved successfully',
  })
  async getApprovedTaxRules() {
    return this.payrollConfigService.getApprovedTaxRules();
  }

  @Get('tax-rules/:id')
  @ApiOperation({ summary: 'Get a single tax rule by ID' })
  @ApiParam({ name: 'id', description: 'Tax rule ID' })
  @ApiResponse({ status: 200, description: 'Tax rule retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tax rule not found' })
  async findTaxRuleById(@Param('id') id: string) {
    return this.payrollConfigService.findTaxRuleById(id);
  }

  @Put('tax-rules/:id')
  @ApiOperation({
    summary: 'Update a tax rule',
    description: 'Updates a tax rule. Only items in DRAFT status can be edited',
  })
  @ApiParam({ name: 'id', description: 'Tax rule ID' })
  @ApiBody({ type: UpdateTaxRuleDto })
  @ApiResponse({ status: 200, description: 'Tax rule updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update non-DRAFT tax rule' })
  async updateTaxRule(
    @Param('id') id: string,
    @Body() updateTaxRuleDto: UpdateTaxRuleDto,
  ) {
    return this.payrollConfigService.updateTaxRule(id, updateTaxRuleDto);
  }

  @Delete('tax-rules/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a tax rule',
    description:
      'Deletes a tax rule. Only items in DRAFT status can be deleted',
  })
  @ApiParam({ name: 'id', description: 'Tax rule ID' })
  @ApiResponse({ status: 200, description: 'Tax rule deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete non-DRAFT tax rule' })
  async deleteTaxRule(@Param('id') id: string) {
    return this.payrollConfigService.deleteTaxRule(id);
  }

  @Post('tax-rules/:id/submit')
  @ApiOperation({ summary: 'Submit tax rule for approval' })
  @ApiParam({ name: 'id', description: 'Tax rule ID' })
  @ApiResponse({ status: 200, description: 'Tax rule submitted for approval' })
  async submitTaxRuleForApproval(@Param('id') id: string) {
    return this.payrollConfigService.submitTaxRuleForApproval(id);
  }

  @Post('tax-rules/:id/approve')
  @ApiOperation({
    summary: 'Approve a tax rule',
    description: 'Approves a tax rule. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Tax rule ID' })
  @ApiBody({ type: ApproveDto })
  @ApiResponse({ status: 200, description: 'Tax rule approved successfully' })
  async approveTaxRule(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
  ) {
    return this.payrollConfigService.approveTaxRule(id, approveDto);
  }

  @Post('tax-rules/:id/reject')
  @ApiOperation({
    summary: 'Reject a tax rule',
    description: 'Rejects a tax rule',
  })
  @ApiParam({ name: 'id', description: 'Tax rule ID' })
  @ApiResponse({ status: 200, description: 'Tax rule rejected' })
  async rejectTaxRule(@Param('id') id: string) {
    return this.payrollConfigService.rejectTaxRule(id);
  }

  // ==========================================
  // APPROVAL WORKFLOW DASHBOARD ENDPOINTS
  // ==========================================

  @Get('approvals/pending')
  @ApiOperation({
    summary: 'Get pending approvals dashboard',
    description:
      'Returns counts and lists of all items pending approval across entity types',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending approvals retrieved successfully',
  })
  async getPendingApprovalsDashboard() {
    return this.payrollConfigService.getPendingApprovalsDashboard();
  }

  @Get('configurations/approved')
  @ApiOperation({
    summary: 'Get all approved configurations',
    description:
      'Returns all approved configurations for use in payroll execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved configurations retrieved successfully',
  })
  async getAllApprovedConfigurations() {
    return this.payrollConfigService.getAllApprovedConfigurations();
  }
}

//################################## Core Config Module - Emad #######################################
