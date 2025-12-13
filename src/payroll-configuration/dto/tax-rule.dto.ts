////////////////////////# Core Config Module - Emad ##############

import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

/**
 * DTO for creating a new tax rule
 * Business Rules:
 * - BR-TX-001: Tax rule names must be unique
 * - BR-TX-002: Tax rates must be between 0 and 100 (percentage)
 */
export class CreateTaxRuleDto {
  @ApiProperty({
    description: 'Tax rule name (e.g., Income Tax Bracket 1)',
    example: 'Income Tax - Standard Rate',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the tax rule',
    example:
      'Standard income tax rate for employees earning above minimum wage',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tax rate as percentage (0-100)',
    example: 15,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0, { message: 'Tax rate must be at least 0%' })
  @Max(100, { message: 'Tax rate cannot exceed 100%' })
  rate: number;

  @ApiPropertyOptional({
    description: 'ID of the employee creating this record',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}

/**
 * DTO for updating an existing tax rule (only allowed in DRAFT status)
 */
export class UpdateTaxRuleDto extends PartialType(CreateTaxRuleDto) {}

/**
 * DTO for filtering tax rules
 */
export class FilterTaxRuleDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConfigStatus,
  })
  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @ApiPropertyOptional({
    description: 'Filter by name (partial match)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Minimum tax rate',
  })
  @IsOptional()
  @IsNumber()
  minRate?: number;

  @ApiPropertyOptional({
    description: 'Maximum tax rate',
  })
  @IsOptional()
  @IsNumber()
  maxRate?: number;
}
