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
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PayrollConfigurationService } from './payroll-configuration.service';

// Auth Module - Guards & Decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

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
  CreatePayTypeDto,
  UpdatePayTypeDto,
  FilterPayTypeDto,
  CreateTerminationBenefitDto,
  UpdateTerminationBenefitDto,
  FilterTerminationBenefitDto,
  CreateCompanySettingsDto,
  UpdateCompanySettingsDto,
  FilterCompanySettingsDto,
  FilterAuditLogDto,
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
@ApiBearerAuth()
@Controller('payroll-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollConfigurationController {
  constructor(
    private readonly payrollConfigService: PayrollConfigurationService,
  ) {}

  // ==========================================
  // PAY GRADE ENDPOINTS
  // ==========================================

  @Post('pay-grades')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
  @ApiOperation({ summary: 'Get a single pay grade by ID' })
  @ApiParam({ name: 'id', description: 'Pay grade ID' })
  @ApiResponse({ status: 200, description: 'Pay grade retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pay grade not found' })
  async findPayGradeById(@Param('id') id: string) {
    return this.payrollConfigService.findPayGradeById(id);
  }

  @Put('pay-grades/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
  @ApiOperation({ summary: 'Get a single allowance by ID' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiResponse({ status: 200, description: 'Allowance retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Allowance not found' })
  async findAllowanceById(@Param('id') id: string) {
    return this.payrollConfigService.findAllowanceById(id);
  }

  @Put('allowances/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({ summary: 'Submit allowance for approval' })
  @ApiParam({ name: 'id', description: 'Allowance ID' })
  @ApiResponse({ status: 200, description: 'Allowance submitted for approval' })
  async submitAllowanceForApproval(@Param('id') id: string) {
    return this.payrollConfigService.submitAllowanceForApproval(id);
  }

  @Post('allowances/:id/approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.LEGAL_POLICY_ADMIN)
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.LEGAL_POLICY_ADMIN,
  )
  @ApiOperation({
    summary: 'Get all tax rules',
    description: 'Retrieves all tax rules with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Tax rules retrieved successfully' })
  async findAllTaxRules(@Query() filter: FilterTaxRuleDto) {
    return this.payrollConfigService.findAllTaxRules(filter);
  }

  @Get('tax-rules/approved')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.LEGAL_POLICY_ADMIN,
    SystemRole.FINANCE_STAFF,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.LEGAL_POLICY_ADMIN,
  )
  @ApiOperation({ summary: 'Get a single tax rule by ID' })
  @ApiParam({ name: 'id', description: 'Tax rule ID' })
  @ApiResponse({ status: 200, description: 'Tax rule retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tax rule not found' })
  async findTaxRuleById(@Param('id') id: string) {
    return this.payrollConfigService.findTaxRuleById(id);
  }

  @Put('tax-rules/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.LEGAL_POLICY_ADMIN)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.LEGAL_POLICY_ADMIN)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.LEGAL_POLICY_ADMIN)
  @ApiOperation({ summary: 'Submit tax rule for approval' })
  @ApiParam({ name: 'id', description: 'Tax rule ID' })
  @ApiResponse({ status: 200, description: 'Tax rule submitted for approval' })
  async submitTaxRuleForApproval(@Param('id') id: string) {
    return this.payrollConfigService.submitTaxRuleForApproval(id);
  }

  @Post('tax-rules/:id/approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_MANAGER, SystemRole.HR_MANAGER)
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
    description:
      'Insurance bracket with this name already exists or salary range overlaps',
  })
  async createInsuranceBracket(
    @Body() createInsuranceBracketDto: CreateInsuranceBracketDto,
  ) {
    return this.payrollConfigService.createInsuranceBracket(
      createInsuranceBracketDto,
    );
  }

  @Get('insurance-brackets')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_MANAGER)
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.HR_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
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
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_MANAGER)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.HR_MANAGER)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.HR_MANAGER)
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
  @Roles(SystemRole.HR_MANAGER)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
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
  async getPoliciesByApplicability(
    @Param('applicability') applicability: string,
  ) {
    return this.payrollConfigService.getPoliciesByApplicability(
      applicability as any,
    );
  }

  @Get('payroll-policies/:id')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
    description:
      'Cannot update non-DRAFT payroll policy or invalid effective date',
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
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
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_MANAGER)
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

  // ==========================================
  // PAY TYPE ENDPOINTS - Eslam
  // ==========================================

  @Post('pay-types')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'Create a new pay type',
    description:
      'Creates a new pay type in DRAFT status. Business Rules: REQ-PY-5, BR-1',
  })
  @ApiBody({ type: CreatePayTypeDto })
  @ApiResponse({ status: 201, description: 'Pay type created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Pay type with this name already exists',
  })
  async createPayType(@Body() createPayTypeDto: CreatePayTypeDto) {
    return this.payrollConfigService.createPayType(createPayTypeDto);
  }

  @Get('pay-types')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
  @ApiOperation({
    summary: 'Get all pay types',
    description: 'Retrieves all pay types with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Pay types retrieved successfully',
  })
  async findAllPayTypes(@Query() filter: FilterPayTypeDto) {
    return this.payrollConfigService.findAllPayTypes(filter);
  }

  @Get('pay-types/approved')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
  @ApiOperation({
    summary: 'Get all approved pay types',
    description:
      'Retrieves only approved pay types for use in payroll execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved pay types retrieved successfully',
  })
  async getApprovedPayTypes() {
    return this.payrollConfigService.getApprovedPayTypes();
  }

  @Get('pay-types/:id')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
  @ApiOperation({ summary: 'Get a single pay type by ID' })
  @ApiParam({ name: 'id', description: 'Pay type ID' })
  @ApiResponse({ status: 200, description: 'Pay type retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pay type not found' })
  async findPayTypeById(@Param('id') id: string) {
    return this.payrollConfigService.findPayTypeById(id);
  }

  @Put('pay-types/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'Update a pay type',
    description: 'Updates a pay type. Only items in DRAFT status can be edited',
  })
  @ApiParam({ name: 'id', description: 'Pay type ID' })
  @ApiBody({ type: UpdatePayTypeDto })
  @ApiResponse({ status: 200, description: 'Pay type updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot update non-DRAFT pay type',
  })
  async updatePayType(
    @Param('id') id: string,
    @Body() updatePayTypeDto: UpdatePayTypeDto,
  ) {
    return this.payrollConfigService.updatePayType(id, updatePayTypeDto);
  }

  @Delete('pay-types/:id')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a pay type',
    description:
      'Deletes a pay type. Payroll Manager can delete both DRAFT and APPROVED items. For approved items, deletion is the only way to make changes (REQ-PY-18)',
  })
  @ApiParam({ name: 'id', description: 'Pay type ID' })
  @ApiBody({
    schema: { type: 'object', properties: { deletedBy: { type: 'string' } } },
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Pay type deleted successfully' })
  async deletePayType(
    @Param('id') id: string,
    @Body() body?: { deletedBy?: string },
  ) {
    return this.payrollConfigService.deletePayType(id, body?.deletedBy);
  }

  @Post('pay-types/:id/approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'Approve a pay type',
    description: 'Approves a pay type. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Pay type ID' })
  @ApiBody({ type: ApproveDto })
  @ApiResponse({ status: 200, description: 'Pay type approved successfully' })
  async approvePayType(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
  ) {
    return this.payrollConfigService.approvePayType(id, approveDto);
  }

  @Post('pay-types/:id/reject')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'Reject a pay type',
    description: 'Rejects a pay type. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Pay type ID' })
  @ApiResponse({ status: 200, description: 'Pay type rejected' })
  async rejectPayType(@Param('id') id: string) {
    return this.payrollConfigService.rejectPayType(id);
  }

  // ==========================================
  // TERMINATION & RESIGNATION BENEFITS ENDPOINTS - Eslam
  // ==========================================

  @Post('termination-benefits')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'Create a new termination/resignation benefit',
    description:
      'Creates a new termination/resignation benefit in DRAFT status. Business Rules: REQ-PY-20',
  })
  @ApiBody({ type: CreateTerminationBenefitDto })
  @ApiResponse({
    status: 201,
    description: 'Termination benefit created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Termination benefit with this name already exists',
  })
  async createTerminationBenefit(
    @Body() createTerminationBenefitDto: CreateTerminationBenefitDto,
  ) {
    return this.payrollConfigService.createTerminationBenefit(
      createTerminationBenefitDto,
    );
  }

  @Get('termination-benefits')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
  @ApiOperation({
    summary: 'Get all termination/resignation benefits',
    description:
      'Retrieves all termination/resignation benefits with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Termination benefits retrieved successfully',
  })
  async findAllTerminationBenefits(
    @Query() filter: FilterTerminationBenefitDto,
  ) {
    return this.payrollConfigService.findAllTerminationBenefits(filter);
  }

  @Get('termination-benefits/approved')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.FINANCE_STAFF,
  )
  @ApiOperation({
    summary: 'Get all approved termination/resignation benefits',
    description:
      'Retrieves only approved termination/resignation benefits for use in payroll execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Approved termination benefits retrieved successfully',
  })
  async getApprovedTerminationBenefits() {
    return this.payrollConfigService.getApprovedTerminationBenefits();
  }

  @Get('termination-benefits/:id')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
  )
  @ApiOperation({
    summary: 'Get a single termination/resignation benefit by ID',
  })
  @ApiParam({ name: 'id', description: 'Termination benefit ID' })
  @ApiResponse({
    status: 200,
    description: 'Termination benefit retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Termination benefit not found' })
  async findTerminationBenefitById(@Param('id') id: string) {
    return this.payrollConfigService.findTerminationBenefitById(id);
  }

  @Put('termination-benefits/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'Update a termination/resignation benefit',
    description:
      'Updates a termination/resignation benefit. Only items in DRAFT status can be edited',
  })
  @ApiParam({ name: 'id', description: 'Termination benefit ID' })
  @ApiBody({ type: UpdateTerminationBenefitDto })
  @ApiResponse({
    status: 200,
    description: 'Termination benefit updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update non-DRAFT termination benefit',
  })
  async updateTerminationBenefit(
    @Param('id') id: string,
    @Body() updateTerminationBenefitDto: UpdateTerminationBenefitDto,
  ) {
    return this.payrollConfigService.updateTerminationBenefit(
      id,
      updateTerminationBenefitDto,
    );
  }

  @Delete('termination-benefits/:id')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a termination/resignation benefit',
    description:
      'Deletes a termination/resignation benefit. Payroll Manager can delete both DRAFT and APPROVED items. For approved items, deletion is the only way to make changes (REQ-PY-18)',
  })
  @ApiParam({ name: 'id', description: 'Termination benefit ID' })
  @ApiBody({
    schema: { type: 'object', properties: { deletedBy: { type: 'string' } } },
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Termination benefit deleted successfully',
  })
  async deleteTerminationBenefit(
    @Param('id') id: string,
    @Body() body?: { deletedBy?: string },
  ) {
    return this.payrollConfigService.deleteTerminationBenefit(
      id,
      body?.deletedBy,
    );
  }

  @Post('termination-benefits/:id/approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'Approve a termination/resignation benefit',
    description:
      'Approves a termination/resignation benefit. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Termination benefit ID' })
  @ApiBody({ type: ApproveDto })
  @ApiResponse({
    status: 200,
    description: 'Termination benefit approved successfully',
  })
  async approveTerminationBenefit(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
  ) {
    return this.payrollConfigService.approveTerminationBenefit(id, approveDto);
  }

  @Post('termination-benefits/:id/reject')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'Reject a termination/resignation benefit',
    description:
      'Rejects a termination/resignation benefit. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Termination benefit ID' })
  @ApiResponse({ status: 200, description: 'Termination benefit rejected' })
  async rejectTerminationBenefit(@Param('id') id: string) {
    return this.payrollConfigService.rejectTerminationBenefit(id);
  }

  // ==========================================
  // COMPANY WIDE SETTINGS ENDPOINTS - Eslam
  // ==========================================

  @Post('company-settings')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'Create company-wide settings',
    description:
      'Creates new company-wide settings in DRAFT status. Business Rules: REQ-PY-15',
  })
  @ApiBody({ type: CreateCompanySettingsDto })
  @ApiResponse({
    status: 201,
    description: 'Company settings created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createCompanySettings(
    @Body() createCompanySettingsDto: CreateCompanySettingsDto,
  ) {
    return this.payrollConfigService.createCompanySettings(
      createCompanySettingsDto,
    );
  }

  @Get('company-settings')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  @ApiOperation({
    summary: 'Get all company-wide settings',
    description: 'Retrieves all company-wide settings with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Company settings retrieved successfully',
  })
  async findAllCompanySettings(@Query() filter: FilterCompanySettingsDto) {
    return this.payrollConfigService.findAllCompanySettings(filter);
  }

  @Get('company-settings/active')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.FINANCE_STAFF,
  )
  @ApiOperation({
    summary: 'Get active company-wide settings',
    description:
      'Retrieves the currently active (approved) company-wide settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Active company settings retrieved successfully',
  })
  async getActiveCompanySettings() {
    return this.payrollConfigService.getActiveCompanySettings();
  }

  @Get('company-settings/:id')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  @ApiOperation({ summary: 'Get a single company-wide setting by ID' })
  @ApiParam({ name: 'id', description: 'Company settings ID' })
  @ApiResponse({
    status: 200,
    description: 'Company settings retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Company settings not found' })
  async findCompanySettingsById(@Param('id') id: string) {
    return this.payrollConfigService.findCompanySettingsById(id);
  }

  @Put('company-settings/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @ApiOperation({
    summary: 'Update company-wide settings',
    description:
      'Updates company-wide settings. Only items in DRAFT status can be edited',
  })
  @ApiParam({ name: 'id', description: 'Company settings ID' })
  @ApiBody({ type: UpdateCompanySettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Company settings updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update non-DRAFT company settings',
  })
  async updateCompanySettings(
    @Param('id') id: string,
    @Body() updateCompanySettingsDto: UpdateCompanySettingsDto,
  ) {
    return this.payrollConfigService.updateCompanySettings(
      id,
      updateCompanySettingsDto,
    );
  }

  @Delete('company-settings/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete company-wide settings',
    description:
      'Deletes company-wide settings. Only items in DRAFT status can be deleted',
  })
  @ApiParam({ name: 'id', description: 'Company settings ID' })
  @ApiResponse({
    status: 200,
    description: 'Company settings deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete non-DRAFT company settings',
  })
  async deleteCompanySettings(@Param('id') id: string) {
    return this.payrollConfigService.deleteCompanySettings(id);
  }

  @Post('company-settings/:id/approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'Approve company-wide settings',
    description:
      'Approves company-wide settings. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Company settings ID' })
  @ApiBody({ type: ApproveDto })
  @ApiResponse({
    status: 200,
    description: 'Company settings approved successfully',
  })
  async approveCompanySettings(
    @Param('id') id: string,
    @Body() approveDto: ApproveDto,
  ) {
    return this.payrollConfigService.approveCompanySettings(id, approveDto);
  }

  @Post('company-settings/:id/reject')
  @Roles(SystemRole.PAYROLL_MANAGER)
  @ApiOperation({
    summary: 'Reject company-wide settings',
    description: 'Rejects company-wide settings. Requires Payroll Manager role',
  })
  @ApiParam({ name: 'id', description: 'Company settings ID' })
  @ApiResponse({ status: 200, description: 'Company settings rejected' })
  async rejectCompanySettings(@Param('id') id: string) {
    return this.payrollConfigService.rejectCompanySettings(id);
  }

  // ==========================================
  // AUDIT TRAIL ENDPOINTS - Eslam
  // ==========================================

  @Get('audit-logs')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  @ApiOperation({
    summary: 'Get audit logs',
    description:
      'Retrieves audit logs with optional filtering. Business Rules: BR-AT-004',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  async getAuditLogs(@Query() filter: FilterAuditLogDto) {
    return this.payrollConfigService.getAuditLogs(filter);
  }

  @Get('audit-logs/entity/:entityType/:entityId')
  @Roles(
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.HR_MANAGER,
    SystemRole.SYSTEM_ADMIN,
  )
  @ApiOperation({
    summary: 'Get audit logs for a specific entity',
    description: 'Retrieves all audit logs for a specific configuration entity',
  })
  @ApiParam({
    name: 'entityType',
    description: 'Entity type',
    enum: [
      'PayType',
      'TerminationBenefit',
      'CompanySettings',
      'PayGrade',
      'Allowance',
      'TaxRule',
      'InsuranceBracket',
      'PayrollPolicy',
      'SigningBonus',
    ],
  })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  async getAuditLogsByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.payrollConfigService.getAuditLogsByEntity(
      entityType as any,
      entityId,
    );
  }
}

//################################## Compliance & Benefits Module - John Wasfy #######################
//################################## Pay Type, Termination Benefits, Company Settings & Audit Trail - Eslam #######################
