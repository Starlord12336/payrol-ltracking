import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { BankStatus } from '../enums/payroll-execution-enum';

// Create DTO - All required fields
export class CreateEmployeePayrollDetailsDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsNumber()
  @IsNotEmpty()
  baseSalary: number;

  @IsNumber()
  @IsNotEmpty()
  allowances: number;

  @IsNumber()
  @IsNotEmpty()
  deductions: number;

  @IsNumber()
  @IsNotEmpty()
  netSalary: number;

  @IsNumber()
  @IsNotEmpty()
  netPay: number;

  @IsEnum(BankStatus)
  @IsNotEmpty()
  bankStatus: BankStatus;

  @IsOptional()
  @IsString()
  exceptions?: string;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsOptional()
  @IsNumber()
  benefit?: number;

  @IsMongoId()
  @IsNotEmpty()
  payrollRunId: string;
}

export class UpdateEmployeePayrollDetailsDto extends PartialType(CreateEmployeePayrollDetailsDto) {}
