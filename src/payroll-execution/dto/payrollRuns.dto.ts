import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePayrollRunsDto {
  @IsString()
  @IsNotEmpty()
  runType: string; // Example: 'monthly', 'bonus', etc.

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  periodStart: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  periodEnd: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  processedDate?: Date;

  @IsMongoId()
  @IsNotEmpty()
  payrollConfigId: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  includedEmployeeIds?: string[];

  @IsNumber()
  @IsOptional()
  totalGrossPay?: number;

  @IsNumber()
  @IsOptional()
  totalNetPay?: number;

  @IsString()
  @IsOptional()
  status?: string; // Example: 'pending', 'completed', etc.
}

export class UpdatePayrollRunsDto extends PartialType(CreatePayrollRunsDto) {}

export class DeletePayrollRunsDto {
  @IsMongoId()
  @IsNotEmpty()
  payrollRunId: string;
}
