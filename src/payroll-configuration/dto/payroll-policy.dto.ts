////////////////////////# Compliance & Benefits Module - Member 2 ##############

import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsMongoId,
  IsDate,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ConfigStatus,
  PolicyType,
  Applicability,
} from '../enums/payroll-configuration-enums';

/**
 * DTO for nested Rule Definition within Payroll Policy
 * Business Rules:
 * - BR-PP-003: Policies can be percentage-based, fixed amount, or threshold-based
 *
 * @author John Wasfy
 */
export class RuleDefinitionDto {
  @ApiProperty({
    description: 'Percentage value (0-100)',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0, { message: 'Percentage must be at least 0%' })
  @Max(100, { message: 'Percentage must not exceed 100%' })
  percentage: number;

  @ApiProperty({
    description: 'Fixed amount in EGP',
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Fixed amount must be at least 0' })
  fixedAmount: number;

  @ApiProperty({
    description: 'Threshold amount in EGP',
    example: 1000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Threshold amount must be at least 1' })
  thresholdAmount: number;
}

/**
 * DTO for creating a new payroll policy
 * Business Rules:
 * - BR-PP-001: Policy names must be unique
 * - BR-PP-002: Policy types: DEDUCTION | ALLOWANCE | BENEFIT | MISCONDUCT | LEAVE
 * - BR-PP-004: Applicability: All Employees | Full-Time | Part-Time | Contractors
 * - BR-PP-006: Effective date must be in the future for new policies
 * - BR-1: Must follow Egyptian labor law 2025
 * - BR-9: Support base pay, allowances, deductions, variable pay elements
 *
 * @author [Your Name] - Team Member 2
 */
export class CreatePayrollPolicyDto {
  @ApiProperty({
    description: 'Policy name (e.g., "Transportation Allowance Policy")',
    example: 'Overtime Policy',
  })
  @IsString()
  policyName: string;

  @ApiProperty({
    description: 'Type of policy',
    enum: PolicyType,
    example: PolicyType.DEDUCTION,
  })
  @IsEnum(PolicyType)
  policyType: PolicyType;

  @ApiProperty({
    description: 'Detailed description of the policy',
    example: 'Policy for calculating overtime pay based on hourly rate',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Effective date when policy becomes active',
    example: '2025-01-01',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @ApiProperty({
    description: 'Rule definition for policy calculation',
    type: RuleDefinitionDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RuleDefinitionDto)
  ruleDefinition: RuleDefinitionDto;

  @ApiProperty({
    description: 'Who this policy applies to',
    enum: Applicability,
    example: Applicability.FULL_TIME,
  })
  @IsEnum(Applicability)
  applicability: Applicability;

  @ApiPropertyOptional({
    description: 'ID of the employee creating this record',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}

/**
 * DTO for updating an existing payroll policy (only allowed in DRAFT status)
 *
 * @author [Your Name] - Team Member 2
 */
export class UpdatePayrollPolicyDto extends PartialType(
  CreatePayrollPolicyDto,
) {}

/**
 * DTO for filtering payroll policies
 *
 * @author [Your Name] - Team Member 2
 */
export class FilterPayrollPolicyDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConfigStatus,
  })
  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @ApiPropertyOptional({
    description: 'Filter by policy name (partial match)',
  })
  @IsOptional()
  @IsString()
  policyName?: string;

  @ApiPropertyOptional({
    description: 'Filter by policy type',
    enum: PolicyType,
  })
  @IsOptional()
  @IsEnum(PolicyType)
  policyType?: PolicyType;

  @ApiPropertyOptional({
    description: 'Filter by applicability',
    enum: Applicability,
  })
  @IsOptional()
  @IsEnum(Applicability)
  applicability?: Applicability;
}
