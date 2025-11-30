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
 * DTO for creating a new allowance
 * Business Rules:
 * - BR-AL-001: Allowance names must be unique
 * - BR-AL-002: Allowance amounts must be ≥ 0
 */
export class CreateAllowanceDto {
  @ApiProperty({
    description:
      'Allowance name (e.g., Housing Allowance, Transport Allowance)',
    example: 'Housing Allowance',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Allowance amount in EGP (minimum 0)',
    example: 2000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Allowance amount must be at least 0' })
  amount: number;

  @ApiPropertyOptional({
    description: 'ID of the employee creating this record',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}

/**
 * DTO for updating an existing allowance (only allowed in DRAFT status)
 */
export class UpdateAllowanceDto extends PartialType(CreateAllowanceDto) {}

/**
 * DTO for filtering allowances
 */
export class FilterAllowanceDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConfigStatus,
  })
  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @ApiPropertyOptional({
    description: 'Filter by allowance name (partial match)',
  })
  @IsOptional()
  @IsString()
  name?: string;

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
