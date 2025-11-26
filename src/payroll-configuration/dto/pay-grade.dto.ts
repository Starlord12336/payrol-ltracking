////////////////////////# Core Config Module - Emad ##############

import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

/**
 * DTO for creating a new pay grade
 * Business Rules:
 * - BR-PG-001: Pay grade names must be unique across the organization
 * - BR-PG-002: Base salary must be ≥ 6000 EGP (minimum wage)
 * - BR-PG-003: Gross salary must be ≥ Base salary
 */
export class CreatePayGradeDto {
  @ApiProperty({
    description: 'Pay grade name (e.g., Junior TA, Mid TA, Senior TA)',
    example: 'Senior Developer',
  })
  @IsString()
  grade: string;

  @ApiProperty({
    description: 'Base salary in EGP (minimum 6000)',
    example: 8000,
    minimum: 6000,
  })
  @IsNumber()
  @Min(6000, {
    message: 'Base salary must be at least 6000 EGP (Egyptian minimum wage)',
  })
  baseSalary: number;

  @ApiProperty({
    description: 'Gross salary in EGP (must be >= base salary)',
    example: 10000,
    minimum: 6000,
  })
  @IsNumber()
  @Min(6000, { message: 'Gross salary must be at least 6000 EGP' })
  grossSalary: number;

  @ApiPropertyOptional({
    description: 'ID of the employee creating this record',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}

/**
 * DTO for updating an existing pay grade (only allowed in DRAFT status)
 */
export class UpdatePayGradeDto extends PartialType(CreatePayGradeDto) {}

/**
 * DTO for filtering pay grades
 */
export class FilterPayGradeDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConfigStatus,
  })
  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @ApiPropertyOptional({
    description: 'Filter by grade name (partial match)',
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({
    description: 'Minimum base salary',
  })
  @IsOptional()
  @IsNumber()
  minBaseSalary?: number;

  @ApiPropertyOptional({
    description: 'Maximum base salary',
  })
  @IsOptional()
  @IsNumber()
  maxBaseSalary?: number;
}
