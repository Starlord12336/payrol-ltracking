import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePayslipDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsMongoId()
  @IsNotEmpty()
  payrollRunId: string;

  @IsNumber()
  @IsNotEmpty()
  grossSalary: number;

  @IsNumber()
  @IsNotEmpty()
  netSalary: number;

  @IsNumber()
  @IsNotEmpty()
  taxes: number;

  @IsNumber()
  @IsNotEmpty()
  insurance: number;

  @IsNumber()
  @IsNotEmpty()
  penalties: number;

  @IsNumber()
  @IsNotEmpty()
  finalSalary: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  period: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePayslipDto extends PartialType(CreatePayslipDto) {}

export class DeletePayslipDto {
  @IsMongoId()
  @IsNotEmpty()
  payslipId: string;
}
