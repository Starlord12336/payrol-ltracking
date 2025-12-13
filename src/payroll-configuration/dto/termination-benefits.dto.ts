////////////////////////# Termination & Resignation Benefits - Eslam ##############

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
 * DTO for creating a new termination/resignation benefit
 * Business Rules:
 * - REQ-PY-20: Benefits must be unique by name
 * - Must include terms and conditions
 */
export class CreateTerminationBenefitDto {
  @ApiProperty({
    description: 'Benefit name (e.g., End of Service Gratuity, Severance Pay)',
    example: 'End of Service Gratuity',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Benefit amount in EGP (minimum 0)',
    example: 5000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, {
    message: 'Amount must be at least 0 EGP',
  })
  amount: number;

  @ApiPropertyOptional({
    description: 'Terms and conditions for this benefit',
    example: 'Applicable after 1 year of service',
  })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({
    description: 'ID of the employee creating this record',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}

/**
 * DTO for updating an existing termination/resignation benefit (only allowed in DRAFT status)
 */
export class UpdateTerminationBenefitDto extends PartialType(
  CreateTerminationBenefitDto,
) {}

/**
 * DTO for filtering termination/resignation benefits
 */
export class FilterTerminationBenefitDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConfigStatus,
  })
  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @ApiPropertyOptional({
    description: 'Filter by benefit name (partial match)',
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
