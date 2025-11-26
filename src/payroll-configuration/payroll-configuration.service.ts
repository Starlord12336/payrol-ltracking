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

// Enums
import { ConfigStatus } from './enums/payroll-configuration-enums';

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
    totalPending: number;
  }> {
    const [payGrades, allowances, taxRules] = await Promise.all([
      this.payGradeModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.allowanceModel.find({ status: ConfigStatus.DRAFT }).exec(),
      this.taxRulesModel.find({ status: ConfigStatus.DRAFT }).exec(),
    ]);

    return {
      payGrades: { count: payGrades.length, items: payGrades },
      allowances: { count: allowances.length, items: allowances },
      taxRules: { count: taxRules.length, items: taxRules },
      totalPending: payGrades.length + allowances.length + taxRules.length,
    };
  }

  /**
   * Get all approved configurations for payroll execution
   */
  async getAllApprovedConfigurations(): Promise<{
    payGrades: payGradeDocument[];
    allowances: allowanceDocument[];
    taxRules: taxRulesDocument[];
  }> {
    const [payGrades, allowances, taxRules] = await Promise.all([
      this.getApprovedPayGrades(),
      this.getApprovedAllowances(),
      this.getApprovedTaxRules(),
    ]);

    return { payGrades, allowances, taxRules };
  }
}
//##########################################################################################################################
//################################################## Core Config Module - Emad #############################################
