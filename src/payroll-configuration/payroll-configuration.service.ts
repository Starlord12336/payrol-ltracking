////////////////////////# Core Config Module - Emad ##############

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Schemas
import { payGrade, payGradeDocument } from './models/payGrades.schema';
import { allowance, allowanceDocument } from './models/allowance.schema';
import { taxRules, taxRulesDocument } from './models/taxRules.schema';
import {
  insuranceBrackets,
  insuranceBracketsDocument,
} from './models/insuranceBrackets.schema';

import {
  payrollPolicies,
  payrollPoliciesDocument,
} from './models/payrollPolicies.schema';

import {
  signingBonus,
  signingBonusDocument,
} from './models/signingBonus.schema';
import { payType, payTypeDocument } from './models/payType.schema';
import {
  terminationAndResignationBenefits,
  terminationAndResignationBenefitsDocument,
} from './models/terminationAndResignationBenefits';
import {
  CompanyWideSettings,
  CompanyWideSettingsDocument,
} from './models/CompanyWideSettings.schema';
import {
  AuditLog,
  AuditLogDocument,
  AuditAction,
  AuditEntityType,
} from './models/audit-log.schema';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';

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

// Enums
import {
  ConfigStatus,
  PolicyType,
  Applicability,
} from './enums/payroll-configuration-enums';

/**
 * PayrollConfigurationService
 *
 * Handles all business logic for Core Configuration entities:
 * - Pay Grades Management
 * - Allowances Management
 * - Tax Rules Management
 * - Approval Workflow Engine
 *
 * @author Mohammed Emad
 */
@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(payGrade.name) private payGradeModel: Model<payGradeDocument>,
    @InjectModel(allowance.name)
    private allowanceModel: Model<allowanceDocument>,
    @InjectModel(taxRules.name) private taxRulesModel: Model<taxRulesDocument>,
    @InjectModel(insuranceBrackets.name)
    private insuranceBracketsModel: Model<insuranceBracketsDocument>,
    @InjectModel(payrollPolicies.name)
    private payrollPoliciesModel: Model<payrollPoliciesDocument>,
    @InjectModel(signingBonus.name)
    private signingBonusModel: Model<signingBonusDocument>,
    @InjectModel(payType.name)
    private payTypeModel: Model<payTypeDocument>,
    @InjectModel(terminationAndResignationBenefits.name)
    private terminationBenefitModel: Model<terminationAndResignationBenefitsDocument>,
    @InjectModel(CompanyWideSettings.name)
    private companySettingsModel: Model<CompanyWideSettingsDocument>,
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  // ==========================================
  // PAY GRADE MANAGEMENT
  // ==========================================

  /**
   * Create a new pay grade
   * - Grade names must be unique
   * - Base salary must be ≥ 6000 EGP
   * - Gross salary must be ≥ Base salary
   * - Starts in DRAFT status
   */
  async createPayGrade(
    createPayGradeDto: CreatePayGradeDto,
  ): Promise<payGradeDocument> {
    // Validate gross salary >= base salary (BR-PG-003)
    if (createPayGradeDto.grossSalary < createPayGradeDto.baseSalary) {
      throw new BadRequestException(
        'Gross salary must be greater than or equal to base salary',
      );
    }

    // Check for duplicate grade name (BR-PG-001)
    const existingGrade = await this.payGradeModel.findOne({
      grade: createPayGradeDto.grade,
    });
    if (existingGrade) {
      throw new ConflictException(
        `Pay grade with name "${createPayGradeDto.grade}" already exists`,
      );
    }

    const payGrade = new this.payGradeModel({
      ...createPayGradeDto,
      status: ConfigStatus.DRAFT, // BR-AW-001
      createdBy: createPayGradeDto.createdBy
        ? new Types.ObjectId(createPayGradeDto.createdBy)
        : undefined,
    });

    return payGrade.save();
  }

  /**
   * Get all pay grades with optional filtering
   */
  async findAllPayGrades(
    filter?: FilterPayGradeDto,
  ): Promise<payGradeDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.grade) {
      query.grade = { $regex: filter.grade, $options: 'i' };
    }
    if (filter?.minBaseSalary !== undefined) {
      query.baseSalary = {
        ...((query.baseSalary as object) || {}),
        $gte: filter.minBaseSalary,
      };
    }
    if (filter?.maxBaseSalary !== undefined) {
      query.baseSalary = {
        ...((query.baseSalary as object) || {}),
        $lte: filter.maxBaseSalary,
      };
    }

    return this.payGradeModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get a single pay grade by ID
   */
  async findPayGradeById(id: string): Promise<payGradeDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid pay grade ID');
    }

    const payGrade = await this.payGradeModel.findById(id).exec();
    if (!payGrade) {
      throw new NotFoundException(`Pay grade with ID "${id}" not found`);
    }

    return payGrade;
  }

  /**
   * Update a pay grade (only DRAFT status can be edited)
   */
  async updatePayGrade(
    id: string,
    updatePayGradeDto: UpdatePayGradeDto,
  ): Promise<payGradeDocument> {
    const payGrade = await this.findPayGradeById(id);

    // Check if in DRAFT status (BR-AW-002)
    if (payGrade.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update pay grade. Only items in DRAFT status can be edited. Current status: ${payGrade.status}`,
      );
    }

    // Validate gross >= base if both are being updated
    const newBaseSalary = updatePayGradeDto.baseSalary ?? payGrade.baseSalary;
    const newGrossSalary =
      updatePayGradeDto.grossSalary ?? payGrade.grossSalary;

    if (newGrossSalary < newBaseSalary) {
      throw new BadRequestException(
        'Gross salary must be greater than or equal to base salary',
      );
    }

    // Check for duplicate grade name if being updated (BR-PG-001)
    if (updatePayGradeDto.grade && updatePayGradeDto.grade !== payGrade.grade) {
      const existingGrade = await this.payGradeModel.findOne({
        grade: updatePayGradeDto.grade,
      });
      if (existingGrade) {
        throw new ConflictException(
          `Pay grade with name "${updatePayGradeDto.grade}" already exists`,
        );
      }
    }

    Object.assign(payGrade, updatePayGradeDto);
    return payGrade.save();
  }

  /**
   * Delete a pay grade (only DRAFT status can be deleted)
   */
  async deletePayGrade(
    id: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const payGrade = await this.findPayGradeById(id);

    // Check if in DRAFT status (BR-AW-002)
    if (payGrade.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete pay grade. Only items in DRAFT status can be deleted. Current status: ${payGrade.status}`,
      );
    }

    // TODO: Check if assigned to active positions (BR-PG-005) - requires integration with Organization Structure

    await this.payGradeModel.findByIdAndDelete(id).exec();
    return {
      deleted: true,
      message: `Pay grade "${payGrade.grade}" has been deleted`,
    };
  }

  /**
   * Submit pay grade for approval
   */
  async submitPayGradeForApproval(id: string): Promise<payGradeDocument> {
    const payGrade = await this.findPayGradeById(id);

    if (payGrade.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit for approval. Only items in DRAFT status can be submitted. Current status: ${payGrade.status}`,
      );
    }

    // For now, we keep it in DRAFT until explicitly approved
    // This method serves as a validation check before approval
    return payGrade;
  }

  /**
   * Approve a pay grade
   */
  async approvePayGrade(
    id: string,
    approveDto: ApproveDto,
  ): Promise<payGradeDocument> {
    const payGrade = await this.findPayGradeById(id);

    if (payGrade.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Pay grade is already approved');
    }

    payGrade.status = ConfigStatus.APPROVED;
    payGrade.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    payGrade.approvedAt = new Date();

    return payGrade.save();
  }

  /**
   * Reject a pay grade
   */
  async rejectPayGrade(id: string): Promise<payGradeDocument> {
    const payGrade = await this.findPayGradeById(id);

    if (payGrade.status === ConfigStatus.REJECTED) {
      throw new BadRequestException('Pay grade is already rejected');
    }

    payGrade.status = ConfigStatus.REJECTED;
    return payGrade.save();
  }

  /**
   * Get all approved pay grades (for use in payroll execution)
   */
  async getApprovedPayGrades(): Promise<payGradeDocument[]> {
    return this.payGradeModel.find({ status: ConfigStatus.APPROVED }).exec();
  }

  // ==========================================
  // ALLOWANCE MANAGEMENT
  // ==========================================

  /**
   * Create a new allowance
   * - Allowance names must be unique
   * - Starts in DRAFT status
   */
  async createAllowance(
    createAllowanceDto: CreateAllowanceDto,
  ): Promise<allowanceDocument> {
    // Check for duplicate allowance name (BR-AL-001)
    const existingAllowance = await this.allowanceModel.findOne({
      name: createAllowanceDto.name,
    });
    if (existingAllowance) {
      throw new ConflictException(
        `Allowance with name "${createAllowanceDto.name}" already exists`,
      );
    }

    const allowance = new this.allowanceModel({
      ...createAllowanceDto,
      status: ConfigStatus.DRAFT, // BR-AW-001
      createdBy: createAllowanceDto.createdBy
        ? new Types.ObjectId(createAllowanceDto.createdBy)
        : undefined,
    });

    return allowance.save();
  }

  /**
   * Get all allowances with optional filtering
   */
  async findAllAllowances(
    filter?: FilterAllowanceDto,
  ): Promise<allowanceDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.name) {
      query.name = { $regex: filter.name, $options: 'i' };
    }

    return this.allowanceModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get a single allowance by ID
   */
  async findAllowanceById(id: string): Promise<allowanceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid allowance ID');
    }

    const allowance = await this.allowanceModel.findById(id).exec();
    if (!allowance) {
      throw new NotFoundException(`Allowance with ID "${id}" not found`);
    }

    return allowance;
  }

  /**
   * Update an allowance (only DRAFT status can be edited)
   */
  async updateAllowance(
    id: string,
    updateAllowanceDto: UpdateAllowanceDto,
  ): Promise<allowanceDocument> {
    const allowance = await this.findAllowanceById(id);

    // Check if in DRAFT status (BR-AW-002)
    if (allowance.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update allowance. Only items in DRAFT status can be edited. Current status: ${allowance.status}`,
      );
    }

    // Check for duplicate name if being updated (BR-AL-001)
    if (updateAllowanceDto.name && updateAllowanceDto.name !== allowance.name) {
      const existingAllowance = await this.allowanceModel.findOne({
        name: updateAllowanceDto.name,
      });
      if (existingAllowance) {
        throw new ConflictException(
          `Allowance with name "${updateAllowanceDto.name}" already exists`,
        );
      }
    }

    Object.assign(allowance, updateAllowanceDto);
    return allowance.save();
  }

  /**
   * Delete an allowance (only DRAFT status can be deleted)
   */
  async deleteAllowance(
    id: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const allowance = await this.findAllowanceById(id);

    // Check if in DRAFT status (BR-AW-002)
    if (allowance.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete allowance. Only items in DRAFT status can be deleted. Current status: ${allowance.status}`,
      );
    }

    await this.allowanceModel.findByIdAndDelete(id).exec();
    return {
      deleted: true,
      message: `Allowance "${allowance.name}" has been deleted`,
    };
  }

  /**
   * Submit allowance for approval
   */
  async submitAllowanceForApproval(id: string): Promise<allowanceDocument> {
    const allowance = await this.findAllowanceById(id);

    if (allowance.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit for approval. Only items in DRAFT status can be submitted. Current status: ${allowance.status}`,
      );
    }

    return allowance;
  }

  /**
   * Approve an allowance
   */
  async approveAllowance(
    id: string,
    approveDto: ApproveDto,
  ): Promise<allowanceDocument> {
    const allowance = await this.findAllowanceById(id);

    if (allowance.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Allowance is already approved');
    }

    allowance.status = ConfigStatus.APPROVED;
    allowance.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    allowance.approvedAt = new Date();

    return allowance.save();
  }

  /**
   * Reject an allowance
   */
  async rejectAllowance(id: string): Promise<allowanceDocument> {
    const allowance = await this.findAllowanceById(id);

    if (allowance.status === ConfigStatus.REJECTED) {
      throw new BadRequestException('Allowance is already rejected');
    }

    allowance.status = ConfigStatus.REJECTED;
    return allowance.save();
  }

  /**
   * Get all approved allowances (for use in payroll execution)
   */
  async getApprovedAllowances(): Promise<allowanceDocument[]> {
    return this.allowanceModel.find({ status: ConfigStatus.APPROVED }).exec();
  }

  // ==========================================
  // TAX RULES MANAGEMENT
  // ==========================================

  /**
   * Create a new tax rule
   * - Tax rule names must be unique
   * - Starts in DRAFT status
   */
  async createTaxRule(
    createTaxRuleDto: CreateTaxRuleDto,
  ): Promise<taxRulesDocument> {
    // Check for duplicate tax rule name (BR-TX-001)
    const existingTaxRule = await this.taxRulesModel.findOne({
      name: createTaxRuleDto.name,
    });
    if (existingTaxRule) {
      throw new ConflictException(
        `Tax rule with name "${createTaxRuleDto.name}" already exists`,
      );
    }

    const taxRule = new this.taxRulesModel({
      ...createTaxRuleDto,
      status: ConfigStatus.DRAFT, // BR-AW-001
      createdBy: createTaxRuleDto.createdBy
        ? new Types.ObjectId(createTaxRuleDto.createdBy)
        : undefined,
    });

    return taxRule.save();
  }

  /**
   * Get all tax rules with optional filtering
   */
  async findAllTaxRules(
    filter?: FilterTaxRuleDto,
  ): Promise<taxRulesDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.name) {
      query.name = { $regex: filter.name, $options: 'i' };
    }
    if (filter?.minRate !== undefined) {
      query.rate = { ...((query.rate as object) || {}), $gte: filter.minRate };
    }
    if (filter?.maxRate !== undefined) {
      query.rate = { ...((query.rate as object) || {}), $lte: filter.maxRate };
    }

    return this.taxRulesModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get a single tax rule by ID
   */
  async findTaxRuleById(id: string): Promise<taxRulesDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid tax rule ID');
    }

    const taxRule = await this.taxRulesModel.findById(id).exec();
    if (!taxRule) {
      throw new NotFoundException(`Tax rule with ID "${id}" not found`);
    }

    return taxRule;
  }

  /**
   * Update a tax rule (only DRAFT status can be edited)
   */
  async updateTaxRule(
    id: string,
    updateTaxRuleDto: UpdateTaxRuleDto,
  ): Promise<taxRulesDocument> {
    const taxRule = await this.findTaxRuleById(id);

    // Check if in DRAFT status (BR-AW-002)
    if (taxRule.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update tax rule. Only items in DRAFT status can be edited. Current status: ${taxRule.status}`,
      );
    }

    // Check for duplicate name if being updated (BR-TX-001)
    if (updateTaxRuleDto.name && updateTaxRuleDto.name !== taxRule.name) {
      const existingTaxRule = await this.taxRulesModel.findOne({
        name: updateTaxRuleDto.name,
      });
      if (existingTaxRule) {
        throw new ConflictException(
          `Tax rule with name "${updateTaxRuleDto.name}" already exists`,
        );
      }
    }

    Object.assign(taxRule, updateTaxRuleDto);
    return taxRule.save();
  }

  /**
   * Delete a tax rule (only DRAFT status can be deleted)
   */
  async deleteTaxRule(
    id: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const taxRule = await this.findTaxRuleById(id);

    // Check if in DRAFT status (BR-AW-002)
    if (taxRule.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete tax rule. Only items in DRAFT status can be deleted. Current status: ${taxRule.status}`,
      );
    }

    await this.taxRulesModel.findByIdAndDelete(id).exec();
    return {
      deleted: true,
      message: `Tax rule "${taxRule.name}" has been deleted`,
    };
  }

  /**
   * Submit tax rule for approval
   */
  async submitTaxRuleForApproval(id: string): Promise<taxRulesDocument> {
    const taxRule = await this.findTaxRuleById(id);

    if (taxRule.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit for approval. Only items in DRAFT status can be submitted. Current status: ${taxRule.status}`,
      );
    }

    return taxRule;
  }

  /**
   * Approve a tax rule
   */
  async approveTaxRule(
    id: string,
    approveDto: ApproveDto,
  ): Promise<taxRulesDocument> {
    const taxRule = await this.findTaxRuleById(id);

    if (taxRule.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Tax rule is already approved');
    }

    taxRule.status = ConfigStatus.APPROVED;
    taxRule.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    taxRule.approvedAt = new Date();

    return taxRule.save();
  }

  /**
   * Reject a tax rule
   */
  async rejectTaxRule(id: string): Promise<taxRulesDocument> {
    const taxRule = await this.findTaxRuleById(id);

    if (taxRule.status === ConfigStatus.REJECTED) {
      throw new BadRequestException('Tax rule is already rejected');
    }

    taxRule.status = ConfigStatus.REJECTED;
    return taxRule.save();
  }

  /**
   * Get all approved tax rules (for use in payroll execution)
   */
  async getApprovedTaxRules(): Promise<taxRulesDocument[]> {
    return this.taxRulesModel.find({ status: ConfigStatus.APPROVED }).exec();
  }

  // ==========================================
  // APPROVAL WORKFLOW ENGINE (Cross-cutting)
  // ==========================================

  /**
   * Get all pending approvals dashboard
   * Returns counts and lists of items pending approval across all entity types
   */
  async getPendingApprovalsDashboard(): Promise<{
    payGrades: { count: number; items: payGradeDocument[] };
    allowances: { count: number; items: allowanceDocument[] };
    taxRules: { count: number; items: taxRulesDocument[] };
    insuranceBrackets: { count: number; items: insuranceBracketsDocument[] };
    payrollPolicies: { count: number; items: payrollPoliciesDocument[] };
    signingBonuses: { count: number; items: signingBonusDocument[] };
    payTypes: { count: number; items: payTypeDocument[] };
    terminationBenefits: {
      count: number;
      items: terminationAndResignationBenefitsDocument[];
    };
    companySettings: { count: number; items: CompanyWideSettingsDocument[] };
    totalPending: number;
  }> {
    const [
      payGrades,
      allowances,
      taxRules,
      insuranceBrackets,
      payrollPolicies,
      signingBonuses,
      payTypes,
      terminationBenefits,
      companySettings,
    ] = await Promise.all([
      this.payGradeModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.allowanceModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.taxRulesModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.insuranceBracketsModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.payrollPoliciesModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.signingBonusModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.payTypeModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.terminationBenefitModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.companySettingsModel.find({ status: ConfigStatus.DRAFT }).exec(),
    ]);

    return {
      payGrades: { count: payGrades.length, items: payGrades },
      allowances: { count: allowances.length, items: allowances },
      taxRules: { count: taxRules.length, items: taxRules },
      insuranceBrackets: {
        count: insuranceBrackets.length,
        items: insuranceBrackets,
      },
      payrollPolicies: {
        count: payrollPolicies.length,
        items: payrollPolicies,
      },
      signingBonuses: { count: signingBonuses.length, items: signingBonuses },
      payTypes: { count: payTypes.length, items: payTypes },
      terminationBenefits: {
        count: terminationBenefits.length,
        items: terminationBenefits,
      },
      companySettings: {
        count: companySettings.length,
        items: companySettings,
      },
      totalPending:
        payGrades.length +
        allowances.length +
        taxRules.length +
        insuranceBrackets.length +
        payrollPolicies.length +
        signingBonuses.length +
        payTypes.length +
        terminationBenefits.length +
        companySettings.length,
    };
  }

  /**
   * Get all approved configurations for payroll execution
   */
  async getAllApprovedConfigurations(): Promise<{
    payGrades: payGradeDocument[];
    allowances: allowanceDocument[];
    taxRules: taxRulesDocument[];
    insuranceBrackets: insuranceBracketsDocument[];
    payrollPolicies: payrollPoliciesDocument[];
    signingBonuses: signingBonusDocument[];
    payTypes: payTypeDocument[];
    terminationBenefits: terminationAndResignationBenefitsDocument[];
    companySettings: CompanyWideSettingsDocument[];
  }> {
    const [
      payGrades,
      allowances,
      taxRules,
      insuranceBrackets,
      payrollPolicies,
      signingBonuses,
      payTypes,
      terminationBenefits,
      companySettings,
    ] = await Promise.all([
      this.getApprovedPayGrades(),
      this.getApprovedAllowances(),
      this.getApprovedTaxRules(),
      this.getApprovedInsuranceBrackets(),
      this.getApprovedPayrollPolicies(),
      this.getApprovedSigningBonuses(),
      this.getApprovedPayTypes(),
      this.getApprovedTerminationBenefits(),
      this.companySettingsModel.find({ status: ConfigStatus.APPROVED }).exec(),
    ]);

    return {
      payGrades,
      allowances,
      taxRules,
      insuranceBrackets,
      payrollPolicies,
      signingBonuses,
      payTypes,
      terminationBenefits,
      companySettings,
    };
  }
  //################################################## Core Config Module - Emad #############################################

  // ==========================================
  // INSURANCE BRACKETS MANAGEMENT - John Wasfy
  // ==========================================

  /**
   * Create a new insurance bracket
   * - Insurance bracket names must be unique (BR-IN-001)
   * - Salary ranges must not overlap for same insurance type (BR-IN-002)
   * - Employee rate + Employer rate validation (BR-IN-003)
   * - Starts in DRAFT status
   * - Must follow Social Insurance and Pensions Law (BR-7)
   *
   * @author John Wasfy
   */
  async createInsuranceBracket(
    createInsuranceBracketDto: CreateInsuranceBracketDto,
  ): Promise<insuranceBracketsDocument> {
    // Validate contribution percentages (BR-IN-003)
    const totalRate =
      createInsuranceBracketDto.employeeRate +
      createInsuranceBracketDto.employerRate;
    if (totalRate > 100) {
      throw new BadRequestException(
        `Total contribution rate (${totalRate}%) exceeds 100%. Employee rate: ${createInsuranceBracketDto.employeeRate}%, Employer rate: ${createInsuranceBracketDto.employerRate}%`,
      );
    }

    // Validate minSalary <= maxSalary
    if (
      createInsuranceBracketDto.minSalary > createInsuranceBracketDto.maxSalary
    ) {
      throw new BadRequestException(
        'Minimum salary must be less than or equal to maximum salary',
      );
    }

    // Check for duplicate insurance bracket name (BR-IN-001)
    const existingBracket = await this.insuranceBracketsModel.findOne({
      name: createInsuranceBracketDto.name,
    });
    if (existingBracket) {
      throw new ConflictException(
        `Insurance bracket with name "${createInsuranceBracketDto.name}" already exists`,
      );
    }

    // Check for salary range overlap (BR-IN-002)
    await this.validateSalaryRangeOverlap(
      createInsuranceBracketDto.name,
      createInsuranceBracketDto.minSalary,
      createInsuranceBracketDto.maxSalary,
    );

    const insuranceBracket = new this.insuranceBracketsModel({
      ...createInsuranceBracketDto,
      status: ConfigStatus.DRAFT, // BR-AW-001
      createdBy: createInsuranceBracketDto.createdBy
        ? new Types.ObjectId(createInsuranceBracketDto.createdBy)
        : undefined,
    });

    return insuranceBracket.save();
  }

  /**
   * Validate that salary ranges don't overlap for same insurance type (BR-IN-002)
   *
   * @author John Wasfy
   */
  private async validateSalaryRangeOverlap(
    insuranceName: string,
    minSalary: number,
    maxSalary: number,
    excludeId?: string,
  ): Promise<void> {
    const query: any = {
      name: insuranceName,
      $or: [
        // New range starts within existing range
        { minSalary: { $lte: minSalary }, maxSalary: { $gte: minSalary } },
        // New range ends within existing range
        { minSalary: { $lte: maxSalary }, maxSalary: { $gte: maxSalary } },
        // New range completely contains existing range
        { minSalary: { $gte: minSalary }, maxSalary: { $lte: maxSalary } },
      ],
    };

    // Exclude current document when updating
    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const overlappingBracket = await this.insuranceBracketsModel.findOne(query);

    if (overlappingBracket) {
      throw new ConflictException(
        `Salary range ${minSalary}-${maxSalary} overlaps with existing bracket for "${insuranceName}" (${overlappingBracket.minSalary}-${overlappingBracket.maxSalary})`,
      );
    }
  }

  /**
   * Get all insurance brackets with optional filtering
   *
   * @author John Wasfy
   */
  async findAllInsuranceBrackets(
    filter?: FilterInsuranceBracketDto,
  ): Promise<insuranceBracketsDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.name) {
      query.name = { $regex: filter.name, $options: 'i' };
    }
    if (filter?.minSalaryFrom !== undefined) {
      query.minSalary = {
        ...((query.minSalary as object) || {}),
        $gte: filter.minSalaryFrom,
      };
    }
    if (filter?.maxSalaryTo !== undefined) {
      query.maxSalary = {
        ...((query.maxSalary as object) || {}),
        $lte: filter.maxSalaryTo,
      };
    }

    return this.insuranceBracketsModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a single insurance bracket by ID
   *
   * @author John Wasfy
   */
  async findInsuranceBracketById(
    id: string,
  ): Promise<insuranceBracketsDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid insurance bracket ID');
    }

    const insuranceBracket = await this.insuranceBracketsModel
      .findById(id)
      .exec();
    if (!insuranceBracket) {
      throw new NotFoundException(
        `Insurance bracket with ID "${id}" not found`,
      );
    }

    return insuranceBracket;
  }

  /**
   * Update an insurance bracket (only DRAFT status can be edited)
   *
   * @author John Wasfy
   */
  async updateInsuranceBracket(
    id: string,
    updateInsuranceBracketDto: UpdateInsuranceBracketDto,
  ): Promise<insuranceBracketsDocument> {
    const insuranceBracket = await this.findInsuranceBracketById(id);

    // Check if in DRAFT status (BR-AW-002)
    if (insuranceBracket.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update insurance bracket. Only items in DRAFT status can be edited. Current status: ${insuranceBracket.status}`,
      );
    }

    // Validate contribution percentages if being updated (BR-IN-003)
    const newEmployeeRate =
      updateInsuranceBracketDto.employeeRate ?? insuranceBracket.employeeRate;
    const newEmployerRate =
      updateInsuranceBracketDto.employerRate ?? insuranceBracket.employerRate;
    const totalRate = newEmployeeRate + newEmployerRate;

    if (totalRate > 100) {
      throw new BadRequestException(
        `Total contribution rate (${totalRate}%) exceeds 100%. Employee rate: ${newEmployeeRate}%, Employer rate: ${newEmployerRate}%`,
      );
    }

    // Validate salary range if being updated
    const newMinSalary =
      updateInsuranceBracketDto.minSalary ?? insuranceBracket.minSalary;
    const newMaxSalary =
      updateInsuranceBracketDto.maxSalary ?? insuranceBracket.maxSalary;

    if (newMinSalary > newMaxSalary) {
      throw new BadRequestException(
        'Minimum salary must be less than or equal to maximum salary',
      );
    }

    // Check for duplicate name if being updated (BR-IN-001)
    if (
      updateInsuranceBracketDto.name &&
      updateInsuranceBracketDto.name !== insuranceBracket.name
    ) {
      const existingBracket = await this.insuranceBracketsModel.findOne({
        name: updateInsuranceBracketDto.name,
      });
      if (existingBracket) {
        throw new ConflictException(
          `Insurance bracket with name "${updateInsuranceBracketDto.name}" already exists`,
        );
      }
    }

    // Check for salary range overlap if being updated (BR-IN-002)
    const insuranceName =
      updateInsuranceBracketDto.name ?? insuranceBracket.name;
    if (
      updateInsuranceBracketDto.minSalary !== undefined ||
      updateInsuranceBracketDto.maxSalary !== undefined
    ) {
      await this.validateSalaryRangeOverlap(
        insuranceName,
        newMinSalary,
        newMaxSalary,
        id,
      );
    }

    Object.assign(insuranceBracket, updateInsuranceBracketDto);
    return insuranceBracket.save();
  }

  /**
   * Delete an insurance bracket (only DRAFT status can be deleted)
   * NOTE: Only HR Manager can delete insurance brackets (REQ-PY-22)
   *
   * @author John Wasfy
   */
  async deleteInsuranceBracket(
    id: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const insuranceBracket = await this.findInsuranceBracketById(id);

    // Check if in DRAFT status (BR-AW-002)
    if (insuranceBracket.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete insurance bracket. Only items in DRAFT status can be deleted. Current status: ${insuranceBracket.status}`,
      );
    }

    await this.insuranceBracketsModel.findByIdAndDelete(id).exec();
    return {
      deleted: true,
      message: `Insurance bracket "${insuranceBracket.name}" has been deleted`,
    };
  }

  /**
   * Submit insurance bracket for approval
   *
   * @author John Wasfy
   */
  async submitInsuranceBracketForApproval(
    id: string,
  ): Promise<insuranceBracketsDocument> {
    const insuranceBracket = await this.findInsuranceBracketById(id);

    if (insuranceBracket.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit for approval. Only items in DRAFT status can be submitted. Current status: ${insuranceBracket.status}`,
      );
    }

    return insuranceBracket;
  }

  /**
   * Approve an insurance bracket
   * NOTE: Only HR Manager can approve insurance brackets (REQ-PY-22)
   * This is DIFFERENT from other configurations which require Payroll Manager approval
   *
   * @author John Wasfy
   */
  async approveInsuranceBracket(
    id: string,
    approveDto: ApproveDto,
  ): Promise<insuranceBracketsDocument> {
    const insuranceBracket = await this.findInsuranceBracketById(id);

    if (insuranceBracket.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Insurance bracket is already approved');
    }

    insuranceBracket.status = ConfigStatus.APPROVED;
    insuranceBracket.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    insuranceBracket.approvedAt = new Date();

    return insuranceBracket.save();
  }

  /**
   * Reject an insurance bracket
   * NOTE: Only HR Manager can reject insurance brackets (REQ-PY-22)
   *
   * @author John Wasfy
   */
  async rejectInsuranceBracket(id: string): Promise<insuranceBracketsDocument> {
    const insuranceBracket = await this.findInsuranceBracketById(id);

    if (insuranceBracket.status === ConfigStatus.REJECTED) {
      throw new BadRequestException('Insurance bracket is already rejected');
    }

    insuranceBracket.status = ConfigStatus.REJECTED;
    return insuranceBracket.save();
  }

  /**
   * Get all approved insurance brackets (for use in payroll execution)
   *
   * @author John Wasfy
   */
  async getApprovedInsuranceBrackets(): Promise<insuranceBracketsDocument[]> {
    return this.insuranceBracketsModel
      .find({ status: ConfigStatus.APPROVED })
      .exec();
  }

  /**
   * Calculate employee insurance contribution based on salary (BR-8)
   * Formula: Employee Insurance = salary × employee_percentage
   *
   * @author John Wasfy
   */
  async calculateEmployeeInsurance(
    salary: number,
    insuranceName: string,
  ): Promise<number> {
    // Find applicable insurance bracket
    const bracket = await this.insuranceBracketsModel.findOne({
      name: insuranceName,
      status: ConfigStatus.APPROVED,
      minSalary: { $lte: salary },
      maxSalary: { $gte: salary },
    });

    if (!bracket) {
      throw new NotFoundException(
        `No approved insurance bracket found for "${insuranceName}" with salary ${salary}`,
      );
    }

    // BR-8: Employee Insurance = salary × employee_percentage
    return (salary * bracket.employeeRate) / 100;
  }

  /**
   * Calculate employer insurance contribution based on salary (BR-8)
   * Formula: Employer Insurance = salary × employer_percentage
   *
   * @author John Wasfy
   */
  async calculateEmployerInsurance(
    salary: number,
    insuranceName: string,
  ): Promise<number> {
    // Find applicable insurance bracket
    const bracket = await this.insuranceBracketsModel.findOne({
      name: insuranceName,
      status: ConfigStatus.APPROVED,
      minSalary: { $lte: salary },
      maxSalary: { $gte: salary },
    });

    if (!bracket) {
      throw new NotFoundException(
        `No approved insurance bracket found for "${insuranceName}" with salary ${salary}`,
      );
    }

    // BR-8: Employer Insurance = salary × employer_percentage
    return (salary * bracket.employerRate) / 100;
  }

  /**
   * Get insurance bracket applicable for a specific salary
   *
   * @author John Wasfy
   */
  async getInsuranceBracketBySalary(
    salary: number,
    insuranceName: string,
  ): Promise<insuranceBracketsDocument> {
    const bracket = await this.insuranceBracketsModel.findOne({
      name: insuranceName,
      status: ConfigStatus.APPROVED,
      minSalary: { $lte: salary },
      maxSalary: { $gte: salary },
    });

    if (!bracket) {
      throw new NotFoundException(
        `No approved insurance bracket found for "${insuranceName}" with salary ${salary}`,
      );
    }

    return bracket;
  }

  // ==========================================
  // PAYROLL POLICIES MANAGEMENT - John Wasfy
  // ==========================================

  /**
   * Create a new payroll policy
   * - Policy names must be unique (BR-PP-001)
   * - Starts in DRAFT status
   * - Must follow Egyptian labor law 2025 (BR-1)
   * - Supports base pay, allowances, deductions, variable pay elements (BR-9)
   *
   * @author John Wasfy
   */
  async createPayrollPolicy(
    createPayrollPolicyDto: CreatePayrollPolicyDto,
  ): Promise<payrollPoliciesDocument> {
    // Validate effective date (BR-PP-006)
    if (createPayrollPolicyDto.effectiveDate < new Date()) {
      throw new BadRequestException('Effective date must be in the future');
    }

    // Check for duplicate policy name
    const existingPolicy = await this.payrollPoliciesModel.findOne({
      policyName: createPayrollPolicyDto.policyName,
    });
    if (existingPolicy) {
      throw new ConflictException(
        `Payroll policy with name "${createPayrollPolicyDto.policyName}" already exists`,
      );
    }

    const payrollPolicy = new this.payrollPoliciesModel({
      ...createPayrollPolicyDto,
      status: ConfigStatus.DRAFT,
      createdBy: createPayrollPolicyDto.createdBy
        ? new Types.ObjectId(createPayrollPolicyDto.createdBy)
        : undefined,
    });

    return payrollPolicy.save();
  }

  /**
   * Get all payroll policies with optional filtering
   *
   * @author John Wasfy
   */
  async findAllPayrollPolicies(
    filter?: FilterPayrollPolicyDto,
  ): Promise<payrollPoliciesDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.policyName) {
      query.policyName = { $regex: filter.policyName, $options: 'i' };
    }
    if (filter?.policyType) {
      query.policyType = filter.policyType;
    }
    if (filter?.applicability) {
      query.applicability = filter.applicability;
    }

    return this.payrollPoliciesModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get a single payroll policy by ID
   *
   * @author John Wasfy
   */
  async findPayrollPolicyById(id: string): Promise<payrollPoliciesDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payroll policy ID');
    }

    const payrollPolicy = await this.payrollPoliciesModel.findById(id).exec();
    if (!payrollPolicy) {
      throw new NotFoundException(`Payroll policy with ID "${id}" not found`);
    }

    return payrollPolicy;
  }

  /**
   * Update a payroll policy (only DRAFT status can be edited)
   *
   * @author John Wasfy
   */
  async updatePayrollPolicy(
    id: string,
    updatePayrollPolicyDto: UpdatePayrollPolicyDto,
  ): Promise<payrollPoliciesDocument> {
    const payrollPolicy = await this.findPayrollPolicyById(id);

    // Check if in DRAFT status
    if (payrollPolicy.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update payroll policy. Only items in DRAFT status can be edited. Current status: ${payrollPolicy.status}`,
      );
    }

    // Validate effective date if being updated (BR-PP-006)
    if (
      updatePayrollPolicyDto.effectiveDate &&
      updatePayrollPolicyDto.effectiveDate < new Date()
    ) {
      throw new BadRequestException('Effective date must be in the future');
    }

    // Check for duplicate name if being updated
    if (
      updatePayrollPolicyDto.policyName &&
      updatePayrollPolicyDto.policyName !== payrollPolicy.policyName
    ) {
      const existingPolicy = await this.payrollPoliciesModel.findOne({
        policyName: updatePayrollPolicyDto.policyName,
      });
      if (existingPolicy) {
        throw new ConflictException(
          `Payroll policy with name "${updatePayrollPolicyDto.policyName}" already exists`,
        );
      }
    }

    Object.assign(payrollPolicy, updatePayrollPolicyDto);
    return payrollPolicy.save();
  }

  /**
   * Delete a payroll policy (only DRAFT status can be deleted)
   *
   * @author John Wasfy
   */
  async deletePayrollPolicy(
    id: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const payrollPolicy = await this.findPayrollPolicyById(id);

    // Check if in DRAFT status
    if (payrollPolicy.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete payroll policy. Only items in DRAFT status can be deleted. Current status: ${payrollPolicy.status}`,
      );
    }

    await this.payrollPoliciesModel.findByIdAndDelete(id).exec();
    return {
      deleted: true,
      message: `Payroll policy "${payrollPolicy.policyName}" has been deleted`,
    };
  }

  /**
   * Submit payroll policy for approval
   *
   * @author John Wasfy
   */
  async submitPayrollPolicyForApproval(
    id: string,
  ): Promise<payrollPoliciesDocument> {
    const payrollPolicy = await this.findPayrollPolicyById(id);

    if (payrollPolicy.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit for approval. Only items in DRAFT status can be submitted. Current status: ${payrollPolicy.status}`,
      );
    }

    return payrollPolicy;
  }

  /**
   * Approve a payroll policy
   * NOTE: Only Payroll Manager can approve payroll policies (REQ-PY-1)
   *
   * @author John Wasfy
   */
  async approvePayrollPolicy(
    id: string,
    approveDto: ApproveDto,
  ): Promise<payrollPoliciesDocument> {
    const payrollPolicy = await this.findPayrollPolicyById(id);

    if (payrollPolicy.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Payroll policy is already approved');
    }

    payrollPolicy.status = ConfigStatus.APPROVED;
    payrollPolicy.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    payrollPolicy.approvedAt = new Date();

    return payrollPolicy.save();
  }

  /**
   * Reject a payroll policy
   * NOTE: Only Payroll Manager can reject payroll policies (REQ-PY-1)
   *
   * @author John Wasfy
   */
  async rejectPayrollPolicy(id: string): Promise<payrollPoliciesDocument> {
    const payrollPolicy = await this.findPayrollPolicyById(id);

    if (payrollPolicy.status === ConfigStatus.REJECTED) {
      throw new BadRequestException('Payroll policy is already rejected');
    }

    payrollPolicy.status = ConfigStatus.REJECTED;
    return payrollPolicy.save();
  }

  /**
   * Get all approved payroll policies (for use in payroll execution)
   *
   * @author John Wasfy
   */
  async getApprovedPayrollPolicies(): Promise<payrollPoliciesDocument[]> {
    return this.payrollPoliciesModel
      .find({ status: ConfigStatus.APPROVED })
      .exec();
  }

  /**
   * Get payroll policies by type (BR-PP-002)
   * Policy types: DEDUCTION | ALLOWANCE | BENEFIT | MISCONDUCT | LEAVE
   *
   * @author John Wasfy
   */
  async getPoliciesByType(
    policyType: PolicyType,
  ): Promise<payrollPoliciesDocument[]> {
    return this.payrollPoliciesModel
      .find({
        policyType,
        status: ConfigStatus.APPROVED,
      })
      .exec();
  }

  /**
   * Get payroll policies by applicability (BR-PP-004)
   * Applicability: All Employees | Full-Time | Part-Time | Contractors
   *
   * @author John Wasfy
   */
  async getPoliciesByApplicability(
    applicability: Applicability,
  ): Promise<payrollPoliciesDocument[]> {
    return this.payrollPoliciesModel
      .find({
        applicability,
        status: ConfigStatus.APPROVED,
      })
      .exec();
  }

  // ==========================================
  // SIGNING BONUS MANAGEMENT - John Wasfy
  // ==========================================

  /**
   * Create a new signing bonus
   * - Position names must be unique (BR-SB-001)
   * - Starts in DRAFT status
   * - Amount validation (BR-SB-002)
   *
   * @author John Wasfy
   */
  async createSigningBonus(
    createSigningBonusDto: CreateSigningBonusDto,
  ): Promise<signingBonusDocument> {
    // Check for duplicate position name
    const existingBonus = await this.signingBonusModel.findOne({
      positionName: createSigningBonusDto.positionName,
    });
    if (existingBonus) {
      throw new ConflictException(
        `Signing bonus for position "${createSigningBonusDto.positionName}" already exists`,
      );
    }

    const signingBonus = new this.signingBonusModel({
      ...createSigningBonusDto,
      status: ConfigStatus.DRAFT,
      createdBy: createSigningBonusDto.createdBy
        ? new Types.ObjectId(createSigningBonusDto.createdBy)
        : undefined,
    });

    return signingBonus.save();
  }

  /**
   * Get all signing bonuses with optional filtering
   *
   * @author John Wasfy
   */
  async findAllSigningBonuses(
    filter?: FilterSigningBonusDto,
  ): Promise<signingBonusDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.positionName) {
      query.positionName = { $regex: filter.positionName, $options: 'i' };
    }
    if (filter?.minAmount !== undefined) {
      query.amount = {
        ...((query.amount as object) || {}),
        $gte: filter.minAmount,
      };
    }
    if (filter?.maxAmount !== undefined) {
      query.amount = {
        ...((query.amount as object) || {}),
        $lte: filter.maxAmount,
      };
    }

    return this.signingBonusModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get a single signing bonus by ID
   *
   * @author John Wasfy
   */
  async findSigningBonusById(id: string): Promise<signingBonusDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid signing bonus ID');
    }

    const signingBonus = await this.signingBonusModel.findById(id).exec();
    if (!signingBonus) {
      throw new NotFoundException(`Signing bonus with ID "${id}" not found`);
    }

    return signingBonus;
  }

  /**
   * Update a signing bonus (only DRAFT status can be edited)
   *
   * @author John Wasfy
   */
  async updateSigningBonus(
    id: string,
    updateSigningBonusDto: UpdateSigningBonusDto,
  ): Promise<signingBonusDocument> {
    const signingBonus = await this.findSigningBonusById(id);

    // Check if in DRAFT status
    if (signingBonus.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update signing bonus. Only items in DRAFT status can be edited. Current status: ${signingBonus.status}`,
      );
    }

    // Check for duplicate position name if being updated
    if (
      updateSigningBonusDto.positionName &&
      updateSigningBonusDto.positionName !== signingBonus.positionName
    ) {
      const existingBonus = await this.signingBonusModel.findOne({
        positionName: updateSigningBonusDto.positionName,
      });
      if (existingBonus) {
        throw new ConflictException(
          `Signing bonus for position "${updateSigningBonusDto.positionName}" already exists`,
        );
      }
    }

    Object.assign(signingBonus, updateSigningBonusDto);
    return signingBonus.save();
  }

  /**
   * Delete a signing bonus (only DRAFT status can be deleted)
   *
   * @author John Wasfy
   */
  async deleteSigningBonus(
    id: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const signingBonus = await this.findSigningBonusById(id);

    // Check if in DRAFT status
    if (signingBonus.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete signing bonus. Only items in DRAFT status can be deleted. Current status: ${signingBonus.status}`,
      );
    }

    await this.signingBonusModel.findByIdAndDelete(id).exec();
    return {
      deleted: true,
      message: `Signing bonus for position "${signingBonus.positionName}" has been deleted`,
    };
  }

  /**
   * Submit signing bonus for approval
   *
   * @author John Wasfy
   */
  async submitSigningBonusForApproval(
    id: string,
  ): Promise<signingBonusDocument> {
    const signingBonus = await this.findSigningBonusById(id);

    if (signingBonus.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit for approval. Only items in DRAFT status can be submitted. Current status: ${signingBonus.status}`,
      );
    }

    return signingBonus;
  }

  /**
   * Approve a signing bonus
   * NOTE: Only Payroll Manager can approve signing bonuses (REQ-PY-19)
   *
   * @author John Wasfy
   */
  async approveSigningBonus(
    id: string,
    approveDto: ApproveDto,
  ): Promise<signingBonusDocument> {
    const signingBonus = await this.findSigningBonusById(id);

    if (signingBonus.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Signing bonus is already approved');
    }

    signingBonus.status = ConfigStatus.APPROVED;
    signingBonus.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    signingBonus.approvedAt = new Date();

    return signingBonus.save();
  }

  /**
   * Get signing bonus configuration for a specific pay grade
   * Used by payroll execution to determine bonus eligibility
   *
   * @author John Wasfy
   */
  async getSigningBonusConfig(
    payGradeId: string,
  ): Promise<signingBonusDocument | null> {
    // This assumes signing bonus is linked to pay grade
    // If it's linked by position name, adjust accordingly
    const bonus = await this.signingBonusModel
      .findOne({
        status: ConfigStatus.APPROVED,
        // Add your linking logic here based on your schema
      })
      .exec();

    return bonus;
  }

  /**
   * Get all approved signing bonuses
   *
   * @author John Wasfy
   */
  async getApprovedSigningBonuses(): Promise<signingBonusDocument[]> {
    return this.signingBonusModel
      .find({ status: ConfigStatus.APPROVED })
      .exec();
  }

  /**
   * Reject a signing bonus
   * NOTE: Only Payroll Manager can reject signing bonuses (REQ-PY-19)
   *
   * @author John Wasfy
   */
  async rejectSigningBonus(id: string): Promise<signingBonusDocument> {
    const signingBonus = await this.findSigningBonusById(id);

    if (signingBonus.status === ConfigStatus.REJECTED) {
      throw new BadRequestException('Signing bonus is already rejected');
    }

    signingBonus.status = ConfigStatus.REJECTED;
    return signingBonus.save();
  }

  /**
   * Find signing bonus by position (for ONB-019 integration)
   *
   * @author John Wasfy
   */
  async findSigningBonusByPosition(
    positionName: string,
  ): Promise<signingBonusDocument | null> {
    return this.signingBonusModel
      .findOne({
        positionName: { $regex: new RegExp(`^${positionName}$`, 'i') },
        status: ConfigStatus.APPROVED,
      })
      .exec();
  }

  /**
   * Validate eligibility for signing bonus (BR-24)
   * - Must be full-time employee
   * - Must be in eligible position
   *
   * @author John Wasfy
   */
  async validateEligibility(
    positionName: string,
    workType: string,
  ): Promise<boolean> {
    // BR-24: Signing bonuses must be processed only for full-time employees
    // Accept both enum value 'FULL_TIME' and legacy string 'Full Time Employees' for backward compatibility
    const isFullTime =
      workType === 'FULL_TIME' || workType === 'Full Time Employees';

    if (!isFullTime) {
      return false;
    }

    const bonus = await this.findSigningBonusByPosition(positionName);
    return !!bonus;
  }

  // ==========================================
  // VALIDATION HELPERS - John Wasfy
  // ==========================================

  /**
   * Validate manual override limit (BR-25)
   */
  validateManualOverride(amount: number, limit: number): void {
    if (amount > limit) {
      throw new BadRequestException(
        `Manual override amount ${amount} exceeds limit ${limit}`,
      );
    }
  }

  /**
   * Validate that an entity is in DRAFT status
   * Used before update/delete/submit operations
   */
  validateDraftStatus(status: string, entityName: string): void {
    if (status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot modify ${entityName}. Only items in DRAFT status can be modified. Current status: ${status}`,
      );
    }
  }

  /**
   * Validate salary range
   * minSalary must be <= maxSalary
   */
  validateSalaryRange(minSalary: number, maxSalary: number): void {
    if (minSalary > maxSalary) {
      throw new BadRequestException(
        'Minimum salary must be less than or equal to maximum salary',
      );
    }
  }

  /**
   * Validate contribution percentages (BR-IN-003)
   * Sum of rates must not exceed 100%
   */
  validateContributionPercentages(
    employeeRate: number,
    employerRate: number,
  ): void {
    const total = employeeRate + employerRate;
    if (total > 100) {
      throw new BadRequestException(
        `Total contribution rate (${total}%) exceeds 100%. Employee: ${employeeRate}%, Employer: ${employerRate}%`,
      );
    }
  }

  /**
   * Validate effective date (BR-PP-006)
   * Date must be in the future
   */
  validateEffectiveDate(date: Date): void {
    if (new Date(date) < new Date()) {
      throw new BadRequestException('Effective date must be in the future');
    }
  }

  /**
   * Validate approval workflow transition
   * Ensures entity is not already approved/rejected
   */
  validateApprovalStatus(
    currentStatus: string,
    action: 'approve' | 'reject',
  ): void {
    if (currentStatus === ConfigStatus.APPROVED) {
      throw new BadRequestException(
        `Cannot ${action}. Entity is already approved.`,
      );
    }
    if (currentStatus === ConfigStatus.REJECTED && action === 'reject') {
      throw new BadRequestException(
        `Cannot ${action}. Entity is already rejected.`,
      );
    }
  }

  /**
   * Cross-module validation placeholder
   * Can be expanded to check conflicts between different configuration types
   */
  async validateCrossModuleConflicts(): Promise<void> {
    // TODO: Implement cross-module checks based on Requirements and Business Rules
    // Examples of potential future validations:
    // - BR-60: Misconduct penalties must not reduce salary below statutory minimum wages (requires CompanySettings/LegalRules)
    // - BR-24: Signing bonuses linked to Employee Profile eligibility (requires EmployeeProfileService)
    // - BR-10: Pay scales configurable by grade/department (requires OrgStructureService)
    // Currently, these require external service injection which is not yet available.
    return;
  }

  // ==========================================
  // VALIDATION HELPERS - Eslam
  // ==========================================

  /**
   * Validate that an employee ID exists in the system
   */
  async validateEmployeeId(employeeId: string): Promise<void> {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException(
        `Invalid employee ID format: ${employeeId}`,
      );
    }

    const employee = await this.employeeProfileModel
      .findById(employeeId)
      .exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${employeeId}" not found`);
    }
  }

  /**
   * Validate pay type enum value
   */
  validatePayTypeEnum(type: string): void {
    const validTypes = [
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'contract-based',
    ];
    if (!validTypes.includes(type.toLowerCase())) {
      throw new BadRequestException(
        `Invalid pay type "${type}". Valid types are: ${validTypes.join(', ')}`,
      );
    }
  }

  /**
   * Validate timezone string (basic validation)
   */
  validateTimezone(timeZone: string): void {
    // Basic validation - check if it's a valid IANA timezone format
    // This is a simple check; for production, use a library like moment-timezone
    const timezonePattern = /^[A-Za-z_]+\/[A-Za-z_]+$/;
    if (!timezonePattern.test(timeZone)) {
      throw new BadRequestException(
        `Invalid timezone format: "${timeZone}". Expected format: Area/Location (e.g., Africa/Cairo)`,
      );
    }
  }

  /**
   * Validate date range
   */
  validateDateRange(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }
  }

  // ==========================================
  // PAY TYPE MANAGEMENT - Eslam
  // ==========================================

  /**
   * Create a new pay type
   * - Pay type names must be unique
   * - Amount must be ≥ 6000 EGP
   * - Starts in DRAFT status
   * - Validates employee ID if provided
   * - Validates pay type enum value
   */
  async createPayType(
    createPayTypeDto: CreatePayTypeDto,
  ): Promise<payTypeDocument> {
    // Validate pay type enum value
    this.validatePayTypeEnum(createPayTypeDto.type);

    // Validate employee ID if provided
    if (createPayTypeDto.createdBy) {
      await this.validateEmployeeId(createPayTypeDto.createdBy);
    }

    // Check for duplicate pay type (REQ-PY-5)
    const existingPayType = await this.payTypeModel.findOne({
      type: createPayTypeDto.type.toLowerCase(),
    });
    if (existingPayType) {
      throw new ConflictException(
        `Pay type "${createPayTypeDto.type}" already exists`,
      );
    }

    const payType = new this.payTypeModel({
      ...createPayTypeDto,
      type: createPayTypeDto.type.toLowerCase(), // Normalize to lowercase
      status: ConfigStatus.DRAFT,
      createdBy: createPayTypeDto.createdBy
        ? new Types.ObjectId(createPayTypeDto.createdBy)
        : undefined,
    });

    const saved = await payType.save();
    await this.logAudit(
      AuditEntityType.PAY_TYPE,
      saved._id,
      AuditAction.CREATE,
      createPayTypeDto.createdBy
        ? new Types.ObjectId(createPayTypeDto.createdBy)
        : undefined,
      undefined,
      saved.toObject() as unknown as Record<string, unknown>,
    );
    return saved;
  }

  /**
   * Get all pay types with optional filtering
   */
  async findAllPayTypes(filter?: FilterPayTypeDto): Promise<payTypeDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.type) {
      query.type = { $regex: filter.type, $options: 'i' };
    }
    if (filter?.minAmount !== undefined) {
      query.amount = {
        ...((query.amount as object) || {}),
        $gte: filter.minAmount,
      };
    }
    if (filter?.maxAmount !== undefined) {
      query.amount = {
        ...((query.amount as object) || {}),
        $lte: filter.maxAmount,
      };
    }

    return this.payTypeModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get a single pay type by ID
   */
  async findPayTypeById(id: string): Promise<payTypeDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid pay type ID');
    }

    const payType = await this.payTypeModel.findById(id).exec();
    if (!payType) {
      throw new NotFoundException(`Pay type with ID "${id}" not found`);
    }

    return payType;
  }

  /**
   * Update a pay type (only DRAFT status can be edited)
   */
  async updatePayType(
    id: string,
    updatePayTypeDto: UpdatePayTypeDto,
  ): Promise<payTypeDocument> {
    const payType = await this.findPayTypeById(id);

    // Check if in DRAFT status
    if (payType.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update pay type. Only items in DRAFT status can be edited. Current status: ${payType.status}`,
      );
    }

    const before = payType.toObject() as unknown as Record<string, unknown>;

    // Check for duplicate type if being updated
    if (updatePayTypeDto.type && updatePayTypeDto.type !== payType.type) {
      const existingPayType = await this.payTypeModel.findOne({
        type: updatePayTypeDto.type,
      });
      if (existingPayType) {
        throw new ConflictException(
          `Pay type "${updatePayTypeDto.type}" already exists`,
        );
      }
    }

    Object.assign(payType, updatePayTypeDto);
    const saved = await payType.save();

    await this.logAudit(
      AuditEntityType.PAY_TYPE,
      saved._id,
      AuditAction.UPDATE,
      undefined,
      before,
      saved.toObject() as unknown as Record<string, unknown>,
    );

    return saved;
  }

  /**
   * Delete a pay type
   * - DRAFT items can be deleted by Payroll Specialist
   * - APPROVED items can be deleted by Payroll Manager (REQ-PY-18)
   */
  async deletePayType(
    id: string,
    deletedBy?: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const payType = await this.findPayTypeById(id);

    // Approved items can only be deleted by Payroll Manager (REQ-PY-18)
    if (payType.status === ConfigStatus.APPROVED && !deletedBy) {
      throw new BadRequestException(
        'Approved pay types can only be deleted by Payroll Manager',
      );
    }

    // DRAFT items can be deleted by anyone with access
    // APPROVED items require Payroll Manager approval (checked via guard in controller)

    const before = payType.toObject() as unknown as Record<string, unknown>;
    await this.payTypeModel.findByIdAndDelete(id).exec();

    await this.logAudit(
      AuditEntityType.PAY_TYPE,
      new Types.ObjectId(id),
      AuditAction.DELETE,
      deletedBy ? new Types.ObjectId(deletedBy) : undefined,
      before,
      undefined,
    );

    return {
      deleted: true,
      message: `Pay type "${payType.type}" has been deleted`,
    };
  }

  /**
   * Approve a pay type
   */
  async approvePayType(
    id: string,
    approveDto: ApproveDto,
  ): Promise<payTypeDocument> {
    const payType = await this.findPayTypeById(id);

    if (payType.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Pay type is already approved');
    }

    const before = payType.toObject() as unknown as Record<string, unknown>;
    payType.status = ConfigStatus.APPROVED;
    payType.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    payType.approvedAt = new Date();

    const saved = await payType.save();

    await this.logAudit(
      AuditEntityType.PAY_TYPE,
      saved._id,
      AuditAction.APPROVE,
      new Types.ObjectId(approveDto.approvedBy),
      before,
      saved.toObject() as unknown as Record<string, unknown>,
      approveDto.comment,
    );

    return saved;
  }

  /**
   * Reject a pay type
   */
  async rejectPayType(id: string, reason?: string): Promise<payTypeDocument> {
    const payType = await this.findPayTypeById(id);

    if (payType.status === ConfigStatus.REJECTED) {
      throw new BadRequestException('Pay type is already rejected');
    }

    const before = payType.toObject() as unknown as Record<string, unknown>;
    payType.status = ConfigStatus.REJECTED;
    const saved = await payType.save();

    await this.logAudit(
      AuditEntityType.PAY_TYPE,
      saved._id,
      AuditAction.REJECT,
      undefined,
      before,
      saved.toObject() as unknown as Record<string, unknown>,
      reason,
    );

    return saved;
  }

  /**
   * Get all approved pay types (for use in payroll execution)
   */
  async getApprovedPayTypes(): Promise<payTypeDocument[]> {
    return this.payTypeModel.find({ status: ConfigStatus.APPROVED }).exec();
  }

  // ==========================================
  // TERMINATION & RESIGNATION BENEFITS MANAGEMENT - Eslam
  // ==========================================

  /**
   * Create a new termination/resignation benefit
   * - Benefit names must be unique
   * - Starts in DRAFT status
   * - Validates employee ID if provided
   * - Validates amount is non-negative
   */
  async createTerminationBenefit(
    createTerminationBenefitDto: CreateTerminationBenefitDto,
  ): Promise<terminationAndResignationBenefitsDocument> {
    // Validate employee ID if provided
    if (createTerminationBenefitDto.createdBy) {
      await this.validateEmployeeId(createTerminationBenefitDto.createdBy);
    }

    // Validate amount is non-negative
    if (createTerminationBenefitDto.amount < 0) {
      throw new BadRequestException(
        'Termination benefit amount cannot be negative',
      );
    }

    // Validate name is not empty
    if (
      !createTerminationBenefitDto.name ||
      createTerminationBenefitDto.name.trim().length === 0
    ) {
      throw new BadRequestException('Termination benefit name cannot be empty');
    }

    // Check for duplicate benefit name (case-insensitive)
    const existingBenefit = await this.terminationBenefitModel.findOne({
      name: {
        $regex: new RegExp(`^${createTerminationBenefitDto.name.trim()}$`, 'i'),
      },
    });
    if (existingBenefit) {
      throw new ConflictException(
        `Termination benefit "${createTerminationBenefitDto.name}" already exists`,
      );
    }

    const benefit = new this.terminationBenefitModel({
      ...createTerminationBenefitDto,
      name: createTerminationBenefitDto.name.trim(), // Trim whitespace
      status: ConfigStatus.DRAFT,
      createdBy: createTerminationBenefitDto.createdBy
        ? new Types.ObjectId(createTerminationBenefitDto.createdBy)
        : undefined,
    });

    const saved = await benefit.save();
    await this.logAudit(
      AuditEntityType.TERMINATION_BENEFIT,
      saved._id,
      AuditAction.CREATE,
      createTerminationBenefitDto.createdBy
        ? new Types.ObjectId(createTerminationBenefitDto.createdBy)
        : undefined,
      undefined,
      saved.toObject() as unknown as Record<string, unknown>,
    );
    return saved;
  }

  /**
   * Get all termination/resignation benefits with optional filtering
   */
  async findAllTerminationBenefits(
    filter?: FilterTerminationBenefitDto,
  ): Promise<terminationAndResignationBenefitsDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.name) {
      query.name = { $regex: filter.name, $options: 'i' };
    }
    if (filter?.minAmount !== undefined) {
      query.amount = {
        ...((query.amount as object) || {}),
        $gte: filter.minAmount,
      };
    }
    if (filter?.maxAmount !== undefined) {
      query.amount = {
        ...((query.amount as object) || {}),
        $lte: filter.maxAmount,
      };
    }

    return this.terminationBenefitModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a single termination/resignation benefit by ID
   */
  async findTerminationBenefitById(
    id: string,
  ): Promise<terminationAndResignationBenefitsDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid termination benefit ID');
    }

    const benefit = await this.terminationBenefitModel.findById(id).exec();
    if (!benefit) {
      throw new NotFoundException(
        `Termination benefit with ID "${id}" not found`,
      );
    }

    return benefit;
  }

  /**
   * Update a termination/resignation benefit (only DRAFT status can be edited)
   */
  async updateTerminationBenefit(
    id: string,
    updateTerminationBenefitDto: UpdateTerminationBenefitDto,
  ): Promise<terminationAndResignationBenefitsDocument> {
    const benefit = await this.findTerminationBenefitById(id);

    // Check if in DRAFT status
    if (benefit.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update termination benefit. Only items in DRAFT status can be edited. Current status: ${benefit.status}`,
      );
    }

    const before = benefit.toObject() as unknown as Record<string, unknown>;

    // Check for duplicate name if being updated
    if (
      updateTerminationBenefitDto.name &&
      updateTerminationBenefitDto.name !== benefit.name
    ) {
      const existingBenefit = await this.terminationBenefitModel.findOne({
        name: updateTerminationBenefitDto.name,
      });
      if (existingBenefit) {
        throw new ConflictException(
          `Termination benefit "${updateTerminationBenefitDto.name}" already exists`,
        );
      }
    }

    Object.assign(benefit, updateTerminationBenefitDto);
    const saved = await benefit.save();

    await this.logAudit(
      AuditEntityType.TERMINATION_BENEFIT,
      saved._id,
      AuditAction.UPDATE,
      undefined,
      before,
      saved.toObject() as unknown as Record<string, unknown>,
    );

    return saved;
  }

  /**
   * Delete a termination/resignation benefit
   * - DRAFT items can be deleted by Payroll Specialist
   * - APPROVED items can be deleted by Payroll Manager (REQ-PY-18)
   */
  async deleteTerminationBenefit(
    id: string,
    deletedBy?: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const benefit = await this.findTerminationBenefitById(id);

    // Approved items can only be deleted by Payroll Manager (REQ-PY-18)
    if (benefit.status === ConfigStatus.APPROVED && !deletedBy) {
      throw new BadRequestException(
        'Approved termination benefits can only be deleted by Payroll Manager',
      );
    }

    // DRAFT items can be deleted by anyone with access
    // APPROVED items require Payroll Manager approval (checked via guard in controller)

    const before = benefit.toObject() as unknown as Record<string, unknown>;
    await this.terminationBenefitModel.findByIdAndDelete(id).exec();

    await this.logAudit(
      AuditEntityType.TERMINATION_BENEFIT,
      new Types.ObjectId(id),
      AuditAction.DELETE,
      deletedBy ? new Types.ObjectId(deletedBy) : undefined,
      before,
      undefined,
    );

    return {
      deleted: true,
      message: `Termination benefit "${benefit.name}" has been deleted`,
    };
  }

  /**
   * Approve a termination/resignation benefit
   */
  async approveTerminationBenefit(
    id: string,
    approveDto: ApproveDto,
  ): Promise<terminationAndResignationBenefitsDocument> {
    const benefit = await this.findTerminationBenefitById(id);

    if (benefit.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Termination benefit is already approved');
    }

    const before = benefit.toObject() as unknown as Record<string, unknown>;
    benefit.status = ConfigStatus.APPROVED;
    benefit.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    benefit.approvedAt = new Date();

    const saved = await benefit.save();

    await this.logAudit(
      AuditEntityType.TERMINATION_BENEFIT,
      saved._id,
      AuditAction.APPROVE,
      new Types.ObjectId(approveDto.approvedBy),
      before,
      saved.toObject() as unknown as Record<string, unknown>,
      approveDto.comment,
    );

    return saved;
  }

  /**
   * Reject a termination/resignation benefit
   */
  async rejectTerminationBenefit(
    id: string,
    reason?: string,
  ): Promise<terminationAndResignationBenefitsDocument> {
    const benefit = await this.findTerminationBenefitById(id);

    if (benefit.status === ConfigStatus.REJECTED) {
      throw new BadRequestException('Termination benefit is already rejected');
    }

    const before = benefit.toObject() as unknown as Record<string, unknown>;
    benefit.status = ConfigStatus.REJECTED;
    const saved = await benefit.save();

    await this.logAudit(
      AuditEntityType.TERMINATION_BENEFIT,
      saved._id,
      AuditAction.REJECT,
      undefined,
      before,
      saved.toObject() as unknown as Record<string, unknown>,
      reason,
    );

    return saved;
  }

  /**
   * Get all approved termination/resignation benefits (for use in payroll execution)
   */
  async getApprovedTerminationBenefits(): Promise<
    terminationAndResignationBenefitsDocument[]
  > {
    return this.terminationBenefitModel
      .find({ status: ConfigStatus.APPROVED })
      .exec();
  }

  // ==========================================
  // COMPANY WIDE SETTINGS MANAGEMENT - Eslam
  // ==========================================

  /**
   * Create company-wide settings
   * - Only one active (approved) setting should exist
   * - Starts in DRAFT status
   * - Validates employee ID if provided
   * - Validates timezone format
   * - Validates payDate is a valid date
   * - Validates currency is EGP
   */
  async createCompanySettings(
    createCompanySettingsDto: CreateCompanySettingsDto,
  ): Promise<CompanyWideSettingsDocument> {
    // Validate employee ID if provided
    if (createCompanySettingsDto.createdBy) {
      await this.validateEmployeeId(createCompanySettingsDto.createdBy);
    }

    // Validate timezone format
    this.validateTimezone(createCompanySettingsDto.timeZone);

    // Validate payDate is a valid date and not in the past (optional business rule)
    const payDate = new Date(createCompanySettingsDto.payDate);
    if (isNaN(payDate.getTime())) {
      throw new BadRequestException('Invalid pay date format');
    }

    const settings = new this.companySettingsModel({
      ...createCompanySettingsDto,
      currency: createCompanySettingsDto.currency?.toUpperCase() || 'EGP',
      status: ConfigStatus.DRAFT,
      createdBy: createCompanySettingsDto.createdBy
        ? new Types.ObjectId(createCompanySettingsDto.createdBy)
        : undefined,
    });

    const saved = await settings.save();
    await this.logAudit(
      AuditEntityType.COMPANY_SETTINGS,
      saved._id,
      AuditAction.CREATE,
      createCompanySettingsDto.createdBy
        ? new Types.ObjectId(createCompanySettingsDto.createdBy)
        : undefined,
      undefined,
      saved.toObject() as unknown as Record<string, unknown>,
    );
    return saved;
  }

  /**
   * Get all company-wide settings with optional filtering
   */
  async findAllCompanySettings(
    filter?: FilterCompanySettingsDto,
  ): Promise<CompanyWideSettingsDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.currency) {
      query.currency = filter.currency;
    }

    return this.companySettingsModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get the active (approved) company-wide settings
   */
  async getActiveCompanySettings(): Promise<CompanyWideSettingsDocument | null> {
    return this.companySettingsModel
      .findOne({ status: ConfigStatus.APPROVED })
      .sort({ approvedAt: -1 })
      .exec();
  }

  /**
   * Get a single company-wide setting by ID
   */
  async findCompanySettingsById(
    id: string,
  ): Promise<CompanyWideSettingsDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid company settings ID');
    }

    const settings = await this.companySettingsModel.findById(id).exec();
    if (!settings) {
      throw new NotFoundException(`Company settings with ID "${id}" not found`);
    }

    return settings;
  }

  /**
   * Update company-wide settings (only DRAFT status can be edited)
   */
  async updateCompanySettings(
    id: string,
    updateCompanySettingsDto: UpdateCompanySettingsDto,
  ): Promise<CompanyWideSettingsDocument> {
    const settings = await this.findCompanySettingsById(id);

    // Check if in DRAFT status
    if (settings.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update company settings. Only items in DRAFT status can be edited. Current status: ${settings.status}`,
      );
    }

    const before = settings.toObject() as unknown as Record<string, unknown>;
    Object.assign(settings, updateCompanySettingsDto);
    const saved = await settings.save();

    await this.logAudit(
      AuditEntityType.COMPANY_SETTINGS,
      saved._id,
      AuditAction.UPDATE,
      undefined,
      before,
      saved.toObject() as unknown as Record<string, unknown>,
    );

    return saved;
  }

  /**
   * Delete company-wide settings (only DRAFT status can be deleted)
   */
  async deleteCompanySettings(
    id: string,
  ): Promise<{ deleted: boolean; message: string }> {
    const settings = await this.findCompanySettingsById(id);

    // Check if in DRAFT status
    if (settings.status !== ConfigStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete company settings. Only items in DRAFT status can be deleted. Current status: ${settings.status}`,
      );
    }

    const before = settings.toObject() as unknown as Record<string, unknown>;
    await this.companySettingsModel.findByIdAndDelete(id).exec();

    await this.logAudit(
      AuditEntityType.COMPANY_SETTINGS,
      new Types.ObjectId(id),
      AuditAction.DELETE,
      undefined,
      before,
      undefined,
    );

    return {
      deleted: true,
      message: 'Company settings have been deleted',
    };
  }

  /**
   * Approve company-wide settings
   */
  async approveCompanySettings(
    id: string,
    approveDto: ApproveDto,
  ): Promise<CompanyWideSettingsDocument> {
    const settings = await this.findCompanySettingsById(id);

    if (settings.status === ConfigStatus.APPROVED) {
      throw new BadRequestException('Company settings are already approved');
    }

    const before = settings.toObject() as unknown as Record<string, unknown>;
    settings.status = ConfigStatus.APPROVED;
    settings.approvedBy = new Types.ObjectId(approveDto.approvedBy);
    settings.approvedAt = new Date();

    const saved = await settings.save();

    await this.logAudit(
      AuditEntityType.COMPANY_SETTINGS,
      saved._id,
      AuditAction.APPROVE,
      new Types.ObjectId(approveDto.approvedBy),
      before,
      saved.toObject() as unknown as Record<string, unknown>,
      approveDto.comment,
    );

    return saved;
  }

  /**
   * Reject company-wide settings
   */
  async rejectCompanySettings(
    id: string,
    reason?: string,
  ): Promise<CompanyWideSettingsDocument> {
    const settings = await this.findCompanySettingsById(id);

    if (settings.status === ConfigStatus.REJECTED) {
      throw new BadRequestException('Company settings are already rejected');
    }

    const before = settings.toObject() as unknown as Record<string, unknown>;
    settings.status = ConfigStatus.REJECTED;
    const saved = await settings.save();

    await this.logAudit(
      AuditEntityType.COMPANY_SETTINGS,
      saved._id,
      AuditAction.REJECT,
      undefined,
      before,
      saved.toObject() as unknown as Record<string, unknown>,
      reason,
    );

    return saved;
  }

  // ==========================================
  // AUDIT TRAIL SERVICE - Eslam
  // ==========================================

  /**
   * Log an audit event
   * Business Rules:
   * - BR-AT-001: All configuration changes must be logged
   * - BR-AT-002: Logs must include: who, what, when, why
   * - BR-AT-003: Logs are immutable
   */
  async logAudit(
    entityType: AuditEntityType,
    entityId: Types.ObjectId,
    action: AuditAction,
    actorId?: Types.ObjectId,
    before?: Record<string, unknown>,
    after?: Record<string, unknown>,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLogDocument> {
    const auditLog = new this.auditLogModel({
      entityType,
      entityId,
      action,
      actorId,
      timestamp: new Date(),
      changes: before || after ? { before, after } : undefined,
      reason,
      ipAddress,
      userAgent,
    });

    return auditLog.save();
  }

  /**
   * Get audit logs with optional filtering
   * Business Rules:
   * - BR-AT-004: Logs must be queryable by entity, user, date range
   * - Validates entityId format if provided
   * - Validates actorId format and existence if provided
   * - Validates date range (startDate <= endDate)
   */
  async getAuditLogs(filter?: FilterAuditLogDto): Promise<AuditLogDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.entityType) {
      query.entityType = filter.entityType;
    }
    if (filter?.entityId) {
      query.entityId = new Types.ObjectId(filter.entityId);
    }
    if (filter?.action) {
      query.action = filter.action;
    }

    // Validate actorId format and existence if provided
    if (filter?.actorId) {
      if (!Types.ObjectId.isValid(filter.actorId)) {
        throw new BadRequestException(
          `Invalid actor ID format: ${filter.actorId}`,
        );
      }
      // Optionally validate that the actor exists
      const actorExists = await this.employeeProfileModel
        .findById(filter.actorId)
        .exec();
      if (!actorExists) {
        throw new NotFoundException(
          `Actor with ID "${filter.actorId}" not found`,
        );
      }
      query.actorId = new Types.ObjectId(filter.actorId);
    }

    // Validate date range
    if (filter?.startDate || filter?.endDate) {
      this.validateDateRange(filter.startDate, filter.endDate);

      query.timestamp = {};
      if (filter.startDate) {
        const startDate = new Date(filter.startDate);
        if (isNaN(startDate.getTime())) {
          throw new BadRequestException('Invalid start date format');
        }
        query.timestamp = {
          ...((query.timestamp as object) || {}),
          $gte: startDate,
        };
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        if (isNaN(endDate.getTime())) {
          throw new BadRequestException('Invalid end date format');
        }
        // Add one day to include the entire end date
        endDate.setHours(23, 59, 59, 999);
        query.timestamp = {
          ...((query.timestamp as object) || {}),
          $lte: endDate,
        };
      }
    }

    return this.auditLogModel.find(query).sort({ timestamp: -1 }).exec();
  }

  /**
   * Get audit logs for a specific entity
   */
  async getAuditLogsByEntity(
    entityType: AuditEntityType,
    entityId: string,
  ): Promise<AuditLogDocument[]> {
    if (!Types.ObjectId.isValid(entityId)) {
      throw new BadRequestException('Invalid entity ID');
    }

    return this.auditLogModel
      .find({
        entityType,
        entityId: new Types.ObjectId(entityId),
      })
      .sort({ timestamp: -1 })
      .exec();
  }
}
//##########################################################################################################################
//################################################## Compliance & Benefits Module - John Wasfy #############################
