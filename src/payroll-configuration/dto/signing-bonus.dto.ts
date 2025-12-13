////////////////////////# Compliance & Benefits Module - Member 2 ##############

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
 * DTO for creating a new signing bonus
 * Business Rules:
 * - BR-SB-001: Signing bonuses are position-specific
 * - BR-SB-002: Only one signing bonus per position
 * - BR-SB-003: Signing bonus amounts must be ≥ 0
 * - BR-56: Support signing bonuses as distinct payroll component
 * - BR-24: Process only for employees flagged as eligible in contracts
 * - BR-28: Disbursed only once unless explicitly authorized
 * - BR-25: Manual overrides require authorization
 *
 * Integration: ONB-019 - Auto-process signing bonuses for new hires
 *
 * @author John Wasfy
 */
export class CreateSigningBonusDto {
  @ApiProperty({
    description:
      'Position name (e.g., "Junior TA", "Mid TA", "Senior TA") - must be unique',
    example: 'Senior Software Engineer',
  })
  @IsString()
  positionName: string;

  @ApiProperty({
    description: 'Signing bonus amount in EGP (minimum 0)',
    example: 5000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Signing bonus amount must be at least 0' })
  amount: number;

  @ApiPropertyOptional({
    description: 'ID of the employee creating this record',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}

/**
 * DTO for updating an existing signing bonus (only allowed in DRAFT status)
 *
 * @author [Your Name] - Team Member 2
 */
export class UpdateSigningBonusDto extends PartialType(CreateSigningBonusDto) {}

/**
 * DTO for filtering signing bonuses
 *
 * @author [Your Name] - Team Member 2
 */
export class FilterSigningBonusDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConfigStatus,
  })
  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @ApiPropertyOptional({
    description: 'Filter by position name (partial match)',
  })
  @IsOptional()
  @IsString()
  positionName?: string;

  @ApiPropertyOptional({
    description: 'Minimum bonus amount',
  })
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum bonus amount',
  })
  @IsOptional()
  @IsNumber()
  maxAmount?: number;
}
