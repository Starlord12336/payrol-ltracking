import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import mongoose from 'mongoose';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

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
import { PayrollExecutionService } from './payroll-execution.service';

@Controller('payroll-execution')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollExecutionController {
  constructor(private readonly payrollExecutionService: PayrollExecutionService) {}

  // 1. Payroll Runs Endpoints

  @Post('runs')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async createPayrollRun(@Body() body: CreatePayrollRunsDto) {
    return this.payrollExecutionService.CreatePayrollRunsDto(body);
  }

  @Put('runs/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async updatePayrollRun(@Param('id') id: string, @Body() body: UpdatePayrollRunsDto) {
    return this.payrollExecutionService.UpdatePayrollRunsDto(id, body);
  }

  @Delete('runs')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async deletePayrollRun(@Body() body: DeletePayrollRunsDto) {
    return this.payrollExecutionService.deletePayrollRun(body);
  }

  // 2. Payslip Endpoints

  @Post('payslips')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async createPayslip(@Body() body: CreatePayslipDto) {
    return this.payrollExecutionService.createPayslip(body);
  }

  @Put('payslips/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async updatePayslip(@Param('id') id: string, @Body() body: UpdatePayslipDto) {
    return this.payrollExecutionService.updatePayslip(id, body);
  }

  @Delete('payslips')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async deletePayslip(@Body() body: DeletePayslipDto) {
    return this.payrollExecutionService.deletePayslip(body);
  }

  // 3. Employee Signing Bonus Endpoints

  @Post('signing-bonus')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async createEmployeeSigningBonus(@Body() body: CreateEmployeeSigningBonusDto) {
    return this.payrollExecutionService.createEmployeeSigningBonus(body);
  }

  @Put('signing-bonus/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async updateEmployeeSigningBonus(
    @Param('id') id: string,
    @Param('signingBonusId') signingBonusId: string,
    @Body() updateDto: UpdateEmployeeSigningBonusDto
  ) {
    return this.payrollExecutionService.updateEmployeeSigningBonus(id, signingBonusId, updateDto);
  }

  @Delete('signing-bonus')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async deleteEmployeeSigningBonus(@Body() body: DeleteEmployeeSigningBonusDto) {
    return this.payrollExecutionService.deleteEmployeeSigningBonus(body);
  }

  // 4. Employee Termination/Resignation Benefits Endpoints

  @Post('termination-benefits')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async createEmployeeTerminationBenefit(
    @Body() body: CreateEmployeeTerminationResignationBenefitsDto
  ) {
    return this.payrollExecutionService.createEmployeeTerminationResignationBenefits(body);
  }

  @Put('termination-benefits/:id')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async updateEmployeeTerminationBenefit(
    @Param('id') id: string,
    @Param('benefitId') benefitId: string,
    @Param('terminationId') terminationId: string,
    @Body() body: UpdateEmployeeTerminationResignationBenefitsDto
  ) {
    return this.payrollExecutionService.updateEmployeeTerminationResignationBenefits(
      id,
      benefitId,
      terminationId,
      body
    );
  }

  @Delete('termination-benefits')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async deleteEmployeeTerminationBenefit(
    @Body() body: DeleteEmployeeTerminationResignationBenefitsDto
  ) {
    return this.payrollExecutionService.deleteEmployeeTerminationResignationBenefits(body);
  }

  // 5. Generate Payroll Draft

  @Post('generate-draft')
  @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST)
  async generatePayrollDraft(
    @Body('generatedRunId') generatedRunId: string,
    @Body('period') period: string,
    @Body('payrollSpecialistId') payrollSpecialistId: mongoose.Schema.Types.ObjectId
  ) {
    // Convert string to mongoose.Types.ObjectId if needed
    return this.payrollExecutionService.generatePayrollDraft(
      generatedRunId,
      period,
      payrollSpecialistId
    );
  }
}
