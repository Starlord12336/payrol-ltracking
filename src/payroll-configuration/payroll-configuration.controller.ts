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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { PayrollConfigurationService } from './payroll-configuration.service';

// Guards - John Wasfy
import {
  PayrollSpecialistGuard,
  PayrollManagerGuard,
  HRManagerGuard,
} from './guards';

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
  CreateInsuranceBracketDto,
  UpdateInsuranceBracketDto,
  FilterInsuranceBracketDto,
  CreatePayrollPolicyDto,
  UpdatePayrollPolicyDto,
  FilterPayrollPolicyDto,
  CreateSigningBonusDto,
  UpdateSigningBonusDto,
  FilterSigningBonusDto,
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
  ) { }

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

  //################################## Core Config Module - Emad #######################################

  //################################## Compliance & Benefits Module - John Wasfy #######################

  // ==========================================
  // INSURANCE BRACKETS ENDPOINTS
  // ==========================================

  @Post('insurance-brackets')
  @UseGuards(PayrollSpecialistGuard)
  @ApiOperation({
    summary: 'Create a new insurance bracket',
    description:
      'Creates a new insurance bracket in DRAFT status. Business Rules: BR-IN-001, BR-IN-002, BR-IN-003, BR-7, BR-8',
  })
  @ApiBody({ type: CreateInsuranceBracketDto })
  @ApiResponse({
    status: 201,
    description: 'Insurance bracket created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Insurance bracket with this name already exists or salary range overlaps',
  })
  async createInsuranceBracket(
    @Body() createInsuranceBracketDto: CreateInsuranceBracketDto,
  ) {
    return this.payrollConfigService.createInsuranceBracket(
      createInsuranceBracketDto,
    );
  }

  @Get('insurance-brackets')
  @ApiOperation({
    summary: 'Get all insurance brackets',
    description:
      'Retrieves all insurance brackets with optional filtering by status, name, or salary range',
  })
  @ApiResponse({
    status: 200,
    description: 'Insurance brackets retrieved successfully',
  })
  async findAllInsuranceBrackets(@Query() filter: FilterInsuranceBracketDto) {
    return this.payrollConfigService.findAllInsuranceBrackets(filter);
  }

  @Get('insurance-brackets/approved')
  @ApiOperation({
    summary: 'Get all approved insurance brackets',
    description:
      'Retrieves only approved insurance brackets for use in payroll execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved insurance brackets retrieved successfully',
  })
  async getApprovedInsuranceBrackets() {
    return this.payrollConfigService.getApprovedInsuranceBrackets();
  }

  @Get('insurance-brackets/:id')
  @ApiOperation({ summary: 'Get a single insurance bracket by ID' })
  @ApiParam({ name: 'id', description: 'Insurance bracket ID' })
  @ApiResponse({
    status: 200,
    description: 'Insurance bracket retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Insurance bracket not found' })
  async findInsuranceBracketById(@Param('id') id: string) {
    return this.payrollConfigService.findInsuranceBracketById(id);
  }

  @Put('insurance-brackets/:id')
  @UseGuards(PayrollSpecialistGuard)
  @ApiOperation({
    summary: 'Update an insurance bracket',
    description:
      'Updates an insurance bracket. Only items in DRAFT status can be edited (BR-AW-002)',
  })
  @ApiParam({ name: 'id', description: 'Insurance bracket ID' })
  @ApiBody({ type: UpdateInsuranceBracketDto })
  @ApiResponse({
    status: 200,
    description: 'Insurance bracket updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update non-DRAFT insurance bracket',
  })
  @ApiResponse({ status: 404, description: 'Insurance bracket not found' })
  async updateInsuranceBracket(
    @Param('id') id: string,
    @Body() updateInsuranceBracketDto: UpdateInsuranceBracketDto,
  ) {
    return this.payrollConfigService.updateInsuranceBracket(
      id,
      updateInsuranceBracketDto,
    );
  }

  @Delete('insurance-brackets/:id')
  @UseGuards(HRManagerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an insurance bracket',
    description:
      'Deletes an insurance bracket. Only items in DRAFT status can be deleted. Requires HR Manager role (BR-AW-002)',
  })
  @ApiParam({ name: 'id', description: 'Insurance bracket ID' })
  @ApiResponse({
    status: 200,
    description: 'Insurance bracket deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete non-DRAFT insurance bracket',
  })
  @ApiResponse({ status: 404, description: 'Insurance bracket not found' })
  async deleteInsuranceBracket(@Param('id') id: string) {
    return this.payrollConfigService.deleteInsuranceBracket(id);
  }

  @Post('insurance-brackets/:id/submit')
  @UseGuards(PayrollSpecialistGuard)
  @ApiOperation({
    summary: 'Submit insurance bracket for approval',
    description: 'Submits an insurance bracket for HR Manager approval',
  })
  @ApiParam({ name: 'id', description: 'Insurance bracket ID' })
  @ApiResponse({
    status: 200,
    description: 'Insurance bracket submitted for approval',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot submit non-DRAFT insurance bracket',
  })
  async submitInsuranceBracketForApproval(@Param('id') id: string) {
    return this.payrollConfigService.submitInsuranceBracketForApproval(id);
  }

  @Post('insurance-brackets/:id/approve')
  @UseGuards(HRManagerGuard)
  @ApiOperation({
    summary: 'Approve an insurance bracket',
    description:
      'Approves an insurance bracket. Requires HR Manager role (unique approval authority)',
  })
  @ApiParam({ name: 'id', description: 'Insurance bracket ID' })
  @ApiBody({ type: ApproveDto })
  @ApiResponse({
    status: 200,
    description: 'Insurance bracket approved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Insurance bracket is already approved',
  })
  async approveInsuranceBracket(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
  ) {
    return this.payrollConfigService.approveInsuranceBracket(id, approveDto);
  }

  @Post('insurance-brackets/:id/reject')
  @UseGuards(HRManagerGuard)
  @ApiOperation({
    summary: 'Reject an insurance bracket',
    description: 'Rejects an insurance bracket. Requires HR Manager role',
  })
  @ApiParam({ name: 'id', description: 'Insurance bracket ID' })
  @ApiResponse({ status: 200, description: 'Insurance bracket rejected' })
  @ApiResponse({
    status: 400,
    description: 'Insurance bracket is already rejected',
  })
  async rejectInsuranceBracket(@Param('id') id: string) {
    return this.payrollConfigService.rejectInsuranceBracket(id);
  }

  // ==========================================
  // PAYROLL POLICIES ENDPOINTS
  // ==========================================

  @Post('payroll-policies')
  @UseGuards(PayrollSpecialistGuard)
  @ApiOperation({
    summary: 'Create a new payroll policy',
    description:
      'Creates a new payroll policy in DRAFT status. Business Rules: BR-PP-001 to BR-PP-006, BR-1, BR-9',
  })
  @ApiBody({ type: CreatePayrollPolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Payroll policy created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Payroll policy with this name already exists',
  })
  async createPayrollPolicy(
    @Body() createPayrollPolicyDto: CreatePayrollPolicyDto,
  ) {
    return this.payrollConfigService.createPayrollPolicy(
      createPayrollPolicyDto,
    );
  }

  @Get('payroll-policies')
  @ApiOperation({
    summary: 'Get all payroll policies',
    description:
      'Retrieves all payroll policies with optional filtering by status, name, type, or applicability',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll policies retrieved successfully',
  })
  async findAllPayrollPolicies(@Query() filter: FilterPayrollPolicyDto) {
    return this.payrollConfigService.findAllPayrollPolicies(filter);
  }

  @Get('payroll-policies/approved')
  @ApiOperation({
    summary: 'Get all approved payroll policies',
    description:
      'Retrieves only approved payroll policies for use in payroll execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved payroll policies retrieved successfully',
  })
  async getApprovedPayrollPolicies() {
    return this.payrollConfigService.getApprovedPayrollPolicies();
  }

  @Get('payroll-policies/type/:type')
  @ApiOperation({
    summary: 'Get payroll policies by type',
    description:
      'Retrieves approved payroll policies filtered by policy type (BR-PP-002)',
  })
  @ApiParam({
    name: 'type',
    description: 'Policy type (DEDUCTION, ALLOWANCE, BONUS, PENALTY, LEAVE)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll policies retrieved successfully',
  })
  async getPoliciesByType(@Param('type') type: string) {
    return this.payrollConfigService.getPoliciesByType(type as any);
  }

  @Get('payroll-policies/applicability/:applicability')
  @ApiOperation({
    summary: 'Get payroll policies by applicability',
    description:
      'Retrieves approved payroll policies filtered by applicability (BR-PP-004)',
  })
  @ApiParam({
    name: 'applicability',
    description: 'Applicability (ALL, DEPARTMENT, POSITION, INDIVIDUAL)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll policies retrieved successfully',
  })
  async getPoliciesByApplicability(@Param('applicability') applicability: string) {
    return this.payrollConfigService.getPoliciesByApplicability(
      applicability as any,
    );
  }

  @Get('payroll-policies/:id')
  @ApiOperation({ summary: 'Get a single payroll policy by ID' })
  @ApiParam({ name: 'id', description: 'Payroll policy ID' })
  @ApiResponse({
    status: 200,
    description: 'Payroll policy retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Payroll policy not found' })
  async findPayrollPolicyById(@Param('id') id: string) {
    return this.payrollConfigService.findPayrollPolicyById(id);
  }

  @Put('payroll-policies/:id')
  @UseGuards(PayrollSpecialistGuard)
  @ApiOperation({
    summary: 'Update a payroll policy',
    description:
      'Updates a payroll policy. Only items in DRAFT status can be edited. Validates effective date (BR-PP-006)',
  })
  @ApiParam({ name: 'id', description: 'Payroll policy ID' })
  @ApiBody({ type: UpdatePayrollPolicyDto })
  @ApiResponse({
    status: 200,
    description: 'Payroll policy updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update non-DRAFT payroll policy or invalid effective date',
  })
  @ApiResponse({ status: 404, description: 'Payroll policy not found' })
  async updatePayrollPolicy(
    @Param('id') id: string,
    @Body() updatePayrollPolicyDto: UpdatePayrollPolicyDto,
  ) {
    return this.payrollConfigService.updatePayrollPolicy(
      id,
      updatePayrollPolicyDto,
    );
  }

  @Delete('payroll-policies/:id')
  @UseGuards(PayrollSpecialistGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a payroll policy',
    description:
      'Deletes a payroll policy. Only items in DRAFT status can be deleted',
  })
  @ApiParam({ name: 'id', description: 'Payroll policy ID' })
  @ApiResponse({
    status: 200,
    description: 'Payroll policy deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete non-DRAFT payroll policy',
  })
  @ApiResponse({ status: 404, description: 'Payroll policy not found' })
  async deletePayrollPolicy(@Param('id') id: string) {
    return this.payrollConfigService.deletePayrollPolicy(id);
  }

  @Post('payroll-policies/:id/submit')
  @UseGuards(PayrollSpecialistGuard)
  @ApiOperation({
    summary: 'Submit payroll policy for approval',
    description: 'Submits a payroll policy for Payroll Manager approval',
  })
  @ApiParam({ name: 'id', description: 'Payroll policy ID' })
  @ApiResponse({
    status: 200,
    description: 'Payroll policy submitted for approval',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot submit non-DRAFT payroll policy',
  })
  async submitPayrollPolicyForApproval(@Param('id') id: string) {
    return this.payrollConfigService.submitPayrollPolicyForApproval(id);
  }

  @Post('payroll-policies/:id/approve')
  @UseGuards(PayrollManagerGuard)
  @ApiOperation({
    summary: 'Approve a payroll policy',
    description:
      'Approves a payroll policy. Requires Payroll Manager role (BR-AW-003)',
  })
  @ApiParam({ name: 'id', description: 'Payroll policy ID' })
  @ApiBody({ type: ApproveDto })
  @ApiResponse({
    status: 200,
    description: 'Payroll policy approved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Payroll policy is already approved',
  })
  async approvePayrollPolicy(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
  ) {
    return this.payrollConfigService.approvePayrollPolicy(id, approveDto);
  }

  @Post('payroll-policies/:id/reject')
  @UseGuards(PayrollManagerGuard)
  @ApiOperation({
    summary: 'Reject a payroll policy',
    description: 'Rejects a payroll policy. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Payroll policy ID' })
  @ApiResponse({ status: 200, description: 'Payroll policy rejected' })
  @ApiResponse({
    status: 400,
    description: 'Payroll policy is already rejected',
  })
  async rejectPayrollPolicy(@Param('id') id: string) {
    return this.payrollConfigService.rejectPayrollPolicy(id);
  }

  // ==========================================
  // SIGNING BONUSES ENDPOINTS
  // ==========================================

  @Post('signing-bonuses')
  @UseGuards(PayrollSpecialistGuard)
  @ApiOperation({
    summary: 'Create a new signing bonus',
    description:
      'Creates a new signing bonus in DRAFT status. Business Rules: BR-SB-001 to BR-SB-003, BR-24, BR-25, BR-56',
  })
  @ApiBody({ type: CreateSigningBonusDto })
  @ApiResponse({
    status: 201,
    description: 'Signing bonus created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Signing bonus for this position already exists',
  })
  async createSigningBonus(
    @Body() createSigningBonusDto: CreateSigningBonusDto,
  ) {
    return this.payrollConfigService.createSigningBonus(createSigningBonusDto);
  }

  @Get('signing-bonuses')
  @ApiOperation({
    summary: 'Get all signing bonuses',
    description:
      'Retrieves all signing bonuses with optional filtering by status, position, or amount',
  })
  @ApiResponse({
    status: 200,
    description: 'Signing bonuses retrieved successfully',
  })
  async findAllSigningBonuses(@Query() filter: FilterSigningBonusDto) {
    return this.payrollConfigService.findAllSigningBonuses(filter);
  }

  @Get('signing-bonuses/approved')
  @ApiOperation({
    summary: 'Get all approved signing bonuses',
    description:
      'Retrieves only approved signing bonuses for use in payroll execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved signing bonuses retrieved successfully',
  })
  async getApprovedSigningBonuses() {
    return this.payrollConfigService.getApprovedSigningBonuses();
  }

  @Get('signing-bonuses/position/:name')
  @ApiOperation({
    summary: 'Get signing bonus by position name',
    description:
      'Retrieves approved signing bonus for a specific position. Used for ONB-019 integration (onboarding events)',
  })
  @ApiParam({ name: 'name', description: 'Position name' })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'No signing bonus found for this position',
  })
  async findSigningBonusByPosition(@Param('name') name: string) {
    return this.payrollConfigService.findSigningBonusByPosition(name);
  }

  @Get('signing-bonuses/:id')
  @ApiOperation({ summary: 'Get a single signing bonus by ID' })
  @ApiParam({ name: 'id', description: 'Signing bonus ID' })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Signing bonus not found' })
  async findSigningBonusById(@Param('id') id: string) {
    return this.payrollConfigService.findSigningBonusById(id);
  }

  @Put('signing-bonuses/:id')
  @UseGuards(PayrollSpecialistGuard)
  @ApiOperation({
    summary: 'Update a signing bonus',
    description:
      'Updates a signing bonus. Only items in DRAFT status can be edited',
  })
  @ApiParam({ name: 'id', description: 'Signing bonus ID' })
  @ApiBody({ type: UpdateSigningBonusDto })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update non-DRAFT signing bonus',
  })
  @ApiResponse({ status: 404, description: 'Signing bonus not found' })
  async updateSigningBonus(
    @Param('id') id: string,
    @Body() updateSigningBonusDto: UpdateSigningBonusDto,
  ) {
    return this.payrollConfigService.updateSigningBonus(
      id,
      updateSigningBonusDto,
    );
  }

  @Delete('signing-bonuses/:id')
  @UseGuards(PayrollSpecialistGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a signing bonus',
    description:
      'Deletes a signing bonus. Only items in DRAFT status can be deleted',
  })
  @ApiParam({ name: 'id', description: 'Signing bonus ID' })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete non-DRAFT signing bonus',
  })
  @ApiResponse({ status: 404, description: 'Signing bonus not found' })
  async deleteSigningBonus(@Param('id') id: string) {
    return this.payrollConfigService.deleteSigningBonus(id);
  }

  @Post('signing-bonuses/:id/submit')
  @UseGuards(PayrollSpecialistGuard)
  @ApiOperation({
    summary: 'Submit signing bonus for approval',
    description: 'Submits a signing bonus for Payroll Manager approval',
  })
  @ApiParam({ name: 'id', description: 'Signing bonus ID' })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus submitted for approval',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot submit non-DRAFT signing bonus',
  })
  async submitSigningBonusForApproval(@Param('id') id: string) {
    return this.payrollConfigService.submitSigningBonusForApproval(id);
  }

  @Post('signing-bonuses/:id/approve')
  @UseGuards(PayrollManagerGuard)
  @ApiOperation({
    summary: 'Approve a signing bonus',
    description:
      'Approves a signing bonus. Requires Payroll Manager role (BR-AW-003)',
  })
  @ApiParam({ name: 'id', description: 'Signing bonus ID' })
  @ApiBody({ type: ApproveDto })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus approved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Signing bonus is already approved',
  })
  async approveSigningBonus(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
  ) {
    return this.payrollConfigService.approveSigningBonus(id, approveDto);
  }

  @Post('signing-bonuses/:id/reject')
  @UseGuards(PayrollManagerGuard)
  @ApiOperation({
    summary: 'Reject a signing bonus',
    description: 'Rejects a signing bonus. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Signing bonus ID' })
  @ApiResponse({ status: 200, description: 'Signing bonus rejected' })
  @ApiResponse({
    status: 400,
    description: 'Signing bonus is already rejected',
  })
  async rejectSigningBonus(@Param('id') id: string) {
    return this.payrollConfigService.rejectSigningBonus(id);
  }
}

//################################## Compliance & Benefits Module - John Wasfy #######################
