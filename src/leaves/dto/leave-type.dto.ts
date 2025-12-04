import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';
import { RoundingRule } from '../enums/rounding-rule.enum';
import { AccrualMethod } from '../enums/accrual-method.enum';

export class CreateLeaveTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @IsOptional()
  @IsBoolean()
  deductible?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresAttachment?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minTenureMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDurationDays?: number;
}

export class ConfigureLeaveTypeDto {
  @IsString()
  leaveTypeId: string;

  @IsOptional()
  @IsEnum(AccrualMethod)
  accrualMethod?: AccrualMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  accrualRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  carryForwardLimit?: number;

  @IsOptional()
  @IsBoolean()
  allowCarryForward?: boolean;

  @IsOptional()
  @IsEnum(RoundingRule)
  roundingRule?: RoundingRule;

  @IsOptional()
  @IsNumber()
  @Min(0)
  noticePeriodDays?: number;
}

export class UpdateLeaveTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @IsOptional()
  @IsBoolean()
  deductible?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresAttachment?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minTenureMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDurationDays?: number;
}
