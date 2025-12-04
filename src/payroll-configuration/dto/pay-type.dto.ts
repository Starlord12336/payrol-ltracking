////////////////////////# Pay Type Management - Eslam ##############

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
 * DTO for creating a new pay type
 * Business Rules:
 * - REQ-PY-5: Pay types must be unique (hourly, daily, weekly, monthly, contract-based)
 * - BR-1: Minimum amount validation
 */
export class CreatePayTypeDto {
  @ApiProperty({
    description:
      'Pay type name (e.g., hourly, daily, weekly, monthly, contract-based)',
    example: 'monthly',
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'contract-based'],
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Default amount for this pay type in EGP (minimum 6000)',
    example: 8000,
    minimum: 6000,
  })
  @IsNumber()
  @Min(6000, {
    message: 'Amount must be at least 6000 EGP (Egyptian minimum wage)',
  })
  amount: number;

  @ApiPropertyOptional({
    description: 'ID of the employee creating this record',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}

/**
 * DTO for updating an existing pay type (only allowed in DRAFT status)
 */
export class UpdatePayTypeDto extends PartialType(CreatePayTypeDto) {}

/**
 * DTO for filtering pay types
 */
export class FilterPayTypeDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConfigStatus,
  })
  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @ApiPropertyOptional({
    description: 'Filter by pay type name (partial match)',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Minimum amount',
  })
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum amount',
  })
  @IsOptional()
  @IsNumber()
  maxAmount?: number;
}
