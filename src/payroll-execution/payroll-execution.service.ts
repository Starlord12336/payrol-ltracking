import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';

import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import {
  insuranceBrackets,
  insuranceBracketsDocument,
} from '../payroll-configuration/models/insuranceBrackets.schema';
import { payGrade, payGradeDocument } from '../payroll-configuration/models/payGrades.schema';
import {
  signingBonus,
  signingBonusDocument,
} from '../payroll-configuration/models/signingBonus.schema';
import { taxRules, taxRulesDocument } from '../payroll-configuration/models/taxRules.schema';
import {
  terminationAndResignationBenefits,
  terminationAndResignationBenefitsDocument,
} from '../payroll-configuration/models/terminationAndResignationBenefits';

import {
  CreateEmployeeSigningBonusDto,
  DeleteEmployeeSigningBonusDto,
  UpdateEmployeeSigningBonusDto,
} from './dto/EmployeeSigningBonus.dto';
import {
  CreateEmployeeTerminationResignationBenefitsDto,
  DeleteEmployeeTerminationResignationBenefitsDto,
  UpdateEmployeeTerminationResignationBenefitsDto,
} from './dto/EmployeeTerminationResignationBenefits.dto';
import {
  CreatePayrollRunsDto,
  DeletePayrollRunsDto,
  UpdatePayrollRunsDto,
} from './dto/payrollRuns.dto';
import { CreatePayslipDto, DeletePayslipDto, UpdatePayslipDto } from './dto/payslip.dto';
import { BenefitStatus, BonusStatus } from './enums/payroll-execution-enum';
import {
  employeePayrollDetails,
  employeePayrollDetailsDocument,
} from './models/employeePayrollDetails.schema';
import { employeePenalties, employeePenaltiesDocument } from './models/employeePenalties.schema';
import {
  employeeSigningBonus,
  employeeSigningBonusDocument,
} from './models/EmployeeSigningBonus.schema';
import {
  EmployeeTerminationResignation,
  EmployeeTerminationResignationDocument,
} from './models/EmployeeTerminationResignation.schema';
import { payrollRuns, payrollRunsDocument } from './models/payrollRuns.schema';
import { paySlip, PayslipDocument } from './models/payslip.schema';

@Injectable()
export class PayrollExecutionService {
  constructor(
    @InjectModel(payrollRuns.name)
    private readonly payrollRunsModel: Model<payrollRunsDocument>,
    @InjectModel(employeeSigningBonus.name)
    private readonly signingBonusModel: Model<employeeSigningBonusDocument>,
    @InjectModel(EmployeeTerminationResignation.name)
    private readonly terminationResignationModel: Model<EmployeeTerminationResignationDocument>,
    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<EmployeeProfileDocument>,
    @InjectModel(payGrade.name)
    private readonly payGradeModel: Model<payGradeDocument>,
    @InjectModel(signingBonus.name)
    private readonly signingBonusConfigModel: Model<signingBonusDocument>,
    @InjectModel(taxRules.name)
    private readonly taxRulesModel: Model<taxRulesDocument>,
    @InjectModel(terminationAndResignationBenefits.name)
    private readonly terminationAndResignationBenefitsModel: Model<terminationAndResignationBenefitsDocument>,
    @InjectModel(employeePenalties.name)
    private readonly employeePenaltiesModel: Model<employeePenaltiesDocument>,
    @InjectModel(insuranceBrackets.name)
    private readonly insuranceModel: Model<insuranceBracketsDocument>,
    @InjectModel(paySlip.name)
    private readonly payslipModel: Model<PayslipDocument>,
    @InjectModel(employeePayrollDetails.name)
    private readonly employeePayrollDetailsModel: Model<employeePayrollDetailsDocument>
  ) {}

  /**
   * Edit a pending signing bonus by id. Will only allow update if status is pending.
   * @param _id Signing bonus document id
   * @param updateData Fields to update (excluding status)
   */
  async editPendingSigningBonus(
    _id: string,
    updateData: Partial<Omit<employeeSigningBonus, 'status' | '_id'>>
  ) {
    const bonus = await this.signingBonusModel.findOne({ _id, status: BonusStatus.PENDING });
    if (!bonus) {
      throw new Error('Signing bonus is not pending or does not exist.');
    }
    Object.assign(bonus, updateData);
    await bonus.save();
    return bonus;
  }

  /**
   * Edit a pending resignation or termination benefit by id.
   * Will only allow update if status is pending.
   * @param _id Benefit document id
   * @param updateData Fields to update (excluding status)
   */
  async editPendingResignationOrTerminationBenefit(
    _id: string,
    updateData: Partial<Omit<EmployeeTerminationResignation, 'status' | '_id'>>
  ) {
    const benefit = await this.terminationResignationModel.findOne({
      _id,
      status: BenefitStatus.PENDING,
    });
    if (!benefit) {
      throw new Error('Benefit is not pending or does not exist.');
    }
    Object.assign(benefit, updateData);
    await benefit.save();
    return benefit;
  }

  /**
   * Edit an unlocked payroll period by id.
   * Will only allow update if payroll period status is UNLOCKED.
   * @param _id Payroll period document id
   * @param updateData Fields to update (excluding status)
   */
  async editPayrollPeriod(
    _id: string,
    updateData: Partial<Omit<payrollRunsDocument, 'status' | '_id'>>
  ) {
    const payrollPeriod = await this.payrollRunsModel.findOne({ _id, status: 'unlocked' });
    if (!payrollPeriod) {
      throw new Error('Payroll period is not unlocked or does not exist.');
    }
    Object.assign(payrollPeriod, updateData);
    await payrollPeriod.save();
    return payrollPeriod;
  }

  /**
   * @param generatedRunId
   * @param period Payroll period string (e.g., pay month)
   * @param departmentId
   * @param payrollSpecialistId id, if null, process company-wide
   */
  async generatePayrollDraft(
    generatedRunId: string,
    period: string,
    payrollSpecialistId: mongoose.Schema.Types.ObjectId
  ) {
    // Only find employees that are not inactive and not suspended
    const employeeQuery: FilterQuery<EmployeeProfileDocument> = {
      status: { $nin: ['INACTIVE', 'SUSPENDED'] },
    };

    // Use a narrowed, non-generic model reference to avoid complex union inference
    const employeeModelAny = this.employeeModel as any;
    const employees = (await employeeModelAny.find(employeeQuery).lean().exec()) as any[];

    const payrollDraftEntries: any[] = [];
    let exceptionsCount = 0;

    for (const employee of employees) {
      const hrEvent = employee.status ?? 'ACTIVE';

      let signingBonusAmount: number | null = null;
      let benefitAmount: number | null = null;

      // Signing Bonus Amount (lookup via linking table, then config)
      if (hrEvent === 'PROBATION') {
        // Use a narrowed, non-generic model reference to avoid complex union inference
        const signingBonusModelAny = this.signingBonusModel as any;
        const signingBonusLink = (await signingBonusModelAny
          .findOne({
            employeeId: employee._id,
            status: BonusStatus.APPROVED,
          })
          .lean()) as any;
        if (signingBonusLink && signingBonusLink.signingBonusId) {
          // Use a narrowed, non-generic model reference to avoid complex union inference
          const signingBonusConfigModelAny = this.signingBonusConfigModel as any;
          const signingBonusConfig = (await signingBonusConfigModelAny
            .findById(signingBonusLink.signingBonusId)
            .lean()) as any;
          if (signingBonusConfig && typeof signingBonusConfig.amount === 'number') {
            signingBonusAmount = signingBonusConfig.amount;
          }
        }
      }

      // Termination or Resignation Benefit Amount (lookup via linking table, then config)
      if (hrEvent === 'RETIRED' || hrEvent === 'TERMINATED') {
        // Use a narrowed, non-generic model reference to avoid complex union inference
        const terminationResignationModelAny = this.terminationResignationModel as any;
        const benefitLink = (await terminationResignationModelAny
          .findOne({
            employeeId: employee._id,
            status: BenefitStatus.APPROVED,
          })
          .lean()) as any;
        if (benefitLink && benefitLink.benefitId) {
          // Use a narrowed, non-generic model reference to avoid complex union inference
          const terminationAndResignationBenefitsModelAny = this
            .terminationAndResignationBenefitsModel as any;
          const benefitConfig = (await terminationAndResignationBenefitsModelAny
            .findById(benefitLink.benefitId)
            .lean()) as any;
          if (benefitConfig && typeof benefitConfig.amount === 'number') {
            benefitAmount = benefitConfig.amount;
          }
        }
      }

      // PHASE 1.1.B – Salary Calculations
      // ---------------------------------
      // Assume pay grade id is available.
      // Use a narrowed, non-generic model reference to avoid complex union inference
      const payGradeModelAny = this.payGradeModel as any;
      const payGrade = (await payGradeModelAny.findById(employee.payGradeId).lean()) as any;

      const gross = payGrade ? payGrade.grossSalary : 0;
      // These fields may not exist; fallback to 0
      // Calculate taxes by summing all tax amounts for the employee using taxRulesModel
      let taxes = 0;
      // Use a narrowed, non-generic model reference to avoid complex union inference
      const taxRulesModelAny = this.taxRulesModel as any;
      const employeeTaxes = (await taxRulesModelAny.find().lean()) as any[];
      if (Array.isArray(employeeTaxes)) {
        taxes = employeeTaxes.reduce<number>((sum, tax: { rate?: number }) => {
          const rate = tax.rate;
          return sum + (typeof rate === 'number' ? rate : 0);
        }, 0);
      }

      taxes = gross * taxes;

      let insurance = 0;
      // Use a narrowed, non-generic model reference to avoid complex union inference
      const insuranceModelAny = this.insuranceModel as any;
      const employeeinsurance = (await insuranceModelAny.find().lean()) as any[];
      if (Array.isArray(employeeinsurance)) {
        insurance = employeeinsurance.reduce<number>((sum, insurance: { amount?: number }) => {
          const amount = insurance.amount;
          return sum + (typeof amount === 'number' ? amount : 0);
        }, 0);
      }

      // Penalties must be calculated via employeePenalties collection
      let penalties = 0;
      // Use a narrowed, non-generic model reference to avoid complex union inference
      const employeePenaltiesModelAny = this.employeePenaltiesModel as any;
      const employeePenalties = (await employeePenaltiesModelAny
        .findOne({ employeeId: employee._id })
        .lean()) as any;
      if (employeePenalties && Array.isArray(employeePenalties.penalties)) {
        const penaltiesArray = employeePenalties.penalties as { amount?: number }[];
        penalties = penaltiesArray.reduce<number>(
          (sum: number, p: { amount?: number }) =>
            typeof p.amount === 'number' ? sum + p.amount : sum,
          0
        );
      }

      const netSalary = gross - taxes - insurance;
      const finalSalary = netSalary - penalties;

      if (finalSalary < 0) {
        exceptionsCount++;
      }

      //  Draft Generation

      const entry = {
        employee: employee._id,
        period,
        grossSalary: gross,
        netSalary,
        taxes,
        insurance,
        penalties,
        finalSalary,
        hrEvent,
        signingBonus: signingBonusAmount,
        terminationOrResignationBenefit: benefitAmount,
        breakdown: {
          base: gross,
          net: netSalary,
          taxes,
          insurance,
          penalties,
          signingBonus: signingBonusAmount !== null ? signingBonusAmount : undefined,
          terminationOrResignationBenefit: benefitAmount !== null ? benefitAmount : undefined,
        },
      };
      payrollDraftEntries.push(entry);
    }

    // Schange to match schema
    const payrollRunDraft = await this.payrollRunsModel.create({
      runId: generatedRunId,
      payrollPeriod: period,
      status: 'draft',
      entity: 'companyName',
      employees: payrollDraftEntries.length,
      exceptions: exceptionsCount,
      totalnetpay: payrollDraftEntries.reduce((sum, entry) => sum + (entry.finalSalary || 0), 0),
      payrollSpecialistId: payrollSpecialistId,
      paymentStatus: 'pending',
      payrollManagerId: null,
      financeStaffId: null,
    });

    for (const entry of payrollDraftEntries) {
      await this.employeePayrollDetailsModel.create({
        payrollRunId: payrollRunDraft._id,
        employee: entry.employee,
        period: entry.period || period,
        grossSalary: entry.grossSalary,
        netSalary: entry.netSalary,
        taxes: entry.taxes,
        insurance: entry.insurance,
        penalties: entry.penalties,
        finalSalary: entry.finalSalary,
        hrEvent: entry.hrEvent,
        signingBonus: entry.signingBonus,
        terminationOrResignationBenefit: entry.terminationOrResignationBenefit,
        breakdown: entry.breakdown,
      });
    }

    return payrollRunDraft;
  }

  // Create Payroll Run
  async CreatePayrollRunsDto(CreatePayrollRunsDto: CreatePayrollRunsDto) {
    const created = new this.payrollRunsModel(CreatePayrollRunsDto);
    return created.save();
  }

  // Update Payroll Run
  async UpdatePayrollRunsDto(payrollRuns: string, updatePayrollRunsDto: UpdatePayrollRunsDto) {
    return this.payrollRunsModel.findByIdAndUpdate(payrollRuns, updatePayrollRunsDto, {
      new: true,
    });
  }

  // Delete Payroll Run
  async deletePayrollRun(deletePayrollRunsDto: DeletePayrollRunsDto) {
    return this.payrollRunsModel.findByIdAndDelete(deletePayrollRunsDto.payrollRunId);
  }

  // Create Payslip
  async createPayslip(createPayslipDto: CreatePayslipDto) {
    const created = new this.payslipModel(createPayslipDto);
    return created.save();
  }

  // Update Payslip
  async updatePayslip(payslipId: string, updatePayslipDto: UpdatePayslipDto) {
    return this.payslipModel.findByIdAndUpdate(payslipId, updatePayslipDto, { new: true });
  }

  // Delete Payslip
  async deletePayslip(deletePayslipDto: DeletePayslipDto) {
    return this.payslipModel.findByIdAndDelete(deletePayslipDto.payslipId);
  }

  // Create Employee Signing Bonus
  async createEmployeeSigningBonus(createEmployeeSigningBonusDto: CreateEmployeeSigningBonusDto) {
    const created = new this.signingBonusModel(createEmployeeSigningBonusDto);
    return created.save();
  }

  // Update Employee Signing Bonus
  async updateEmployeeSigningBonus(
    employeeId: string,
    signingBonusId: string,
    updateDto: UpdateEmployeeSigningBonusDto
  ) {
    return this.signingBonusModel.findOneAndUpdate({ employeeId, signingBonusId }, updateDto, {
      new: true,
    });
  }

  // Delete Employee Signing Bonus
  async deleteEmployeeSigningBonus(deleteDto: DeleteEmployeeSigningBonusDto) {
    return this.signingBonusModel.findOneAndDelete({
      employeeId: deleteDto.employeeId,
      signingBonusId: deleteDto.signingBonusId,
    });
  }

  // Create Employee Termination/Resignation Benefit
  async createEmployeeTerminationResignationBenefits(
    createDto: CreateEmployeeTerminationResignationBenefitsDto
  ) {
    const created = new this.terminationResignationModel(createDto);
    return created.save();
  }

  // Update Employee Termination/Resignation Benefit
  async updateEmployeeTerminationResignationBenefits(
    employeeId: string,
    benefitId: string,
    terminationId: string,
    updateDto: UpdateEmployeeTerminationResignationBenefitsDto
  ) {
    return this.terminationResignationModel.findOneAndUpdate(
      { employeeId, benefitId, terminationId },
      updateDto,
      { new: true }
    );
  }

  // Delete Employee Termination/Resignation Benefit
  async deleteEmployeeTerminationResignationBenefits(
    deleteDto: DeleteEmployeeTerminationResignationBenefitsDto
  ) {
    return this.terminationResignationModel.findOneAndDelete({
      employeeId: deleteDto.employeeId,
      benefitId: deleteDto.benefitId,
      terminationId: deleteDto.terminationId,
    });
  }
}
