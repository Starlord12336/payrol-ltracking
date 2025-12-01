import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

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
    const employees = await this.employeeModel
      .find({
        status: { $nin: ['INACTIVE', 'SUSPENDED'] },
      })
      .lean()
      .exec();

    const payrollDraftEntries: any[] = [];
    let exceptionsCount = 0;

    for (const employee of employees as EmployeeProfileDocument[]) {
      const hrEvent = employee.status ?? 'ACTIVE';

      let signingBonusAmount: number | null = null;
      let benefitAmount: number | null = null;

      // Signing Bonus Amount (lookup via linking table, then config)
      if (hrEvent === 'PROBATION') {
        const signingBonusLink = await this.signingBonusModel
          .findOne({
            employeeId: employee._id,
            status: BonusStatus.APPROVED,
          })
          .lean();
        if (signingBonusLink && signingBonusLink.signingBonusId) {
          const signingBonusConfig = await this.signingBonusConfigModel
            .findById(signingBonusLink.signingBonusId)
            .lean();
          if (signingBonusConfig && typeof signingBonusConfig.amount === 'number') {
            signingBonusAmount = signingBonusConfig.amount;
          }
        }
      }

      // Termination or Resignation Benefit Amount (lookup via linking table, then config)
      if (hrEvent === 'RETIRED' || hrEvent === 'TERMINATED') {
        const benefitLink = await this.terminationResignationModel
          .findOne({
            employeeId: employee._id,
            status: BenefitStatus.APPROVED,
          })
          .lean();
        if (benefitLink && benefitLink.benefitId) {
          const benefitConfig = await this.terminationAndResignationBenefitsModel
            .findById(benefitLink.benefitId)
            .lean();
          if (benefitConfig && typeof benefitConfig.amount === 'number') {
            benefitAmount = benefitConfig.amount;
          }
        }
      }

      // PHASE 1.1.B – Salary Calculations
      // ---------------------------------
      // Assume pay grade id is available.
      const payGrade = await this.payGradeModel.findById(employee.payGradeId).lean();

      const gross = payGrade ? payGrade.grossSalary : 0;
      // These fields may not exist; fallback to 0
      // Calculate taxes by summing all tax amounts for the employee using taxRulesModel
      let taxes = 0;
      const employeeTaxes = await this.taxRulesModel.find().lean();
      if (Array.isArray(employeeTaxes)) {
        taxes = employeeTaxes.reduce(
          (sum, tax) => (typeof tax.rate === 'number' ? sum + tax.rate : sum),
          0
        );
      }

      taxes = gross * taxes;

      let insurance = 0;
      const employeeinsurance = await this.insuranceModel.find().lean();
      if (Array.isArray(employeeTaxes)) {
        insurance = employeeinsurance.reduce(
          (sum, insurance) => (typeof insurance.amount === 'number' ? sum + insurance.amount : sum),
          0
        );
      }

      // Penalties must be calculated via employeePenalties collection
      let penalties = 0;
      const employeePenalties = await this.employeePenaltiesModel
        .findOne({ employeeId: employee._id })
        .lean();
      if (employeePenalties && Array.isArray(employeePenalties.penalties)) {
        penalties = employeePenalties.penalties.reduce(
          (sum, p) => (typeof p.amount === 'number' ? sum + p.amount : sum),
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
