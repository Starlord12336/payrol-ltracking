////////////////////////# Core Config Module - Emad ##############

import { IsString, IsOptional, IsMongoId, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Entity types that support approval workflow
 */
export enum ApprovalEntityType {
  PAY_GRADE = 'PayGrade',
  ALLOWANCE = 'Allowance',
  TAX_RULE = 'TaxRule',
  INSURANCE_BRACKET = 'InsuranceBracket',
  PAYROLL_POLICY = 'PayrollPolicy',
  PAY_TYPE = 'PayType',
  SIGNING_BONUS = 'SigningBonus',
  TERMINATION_BENEFIT = 'TerminationBenefit',
  COMPANY_SETTINGS = 'CompanySettings',
}

/**
 * DTO for submitting an entity for approval
 */
export class SubmitForApprovalDto {
  @ApiPropertyOptional({
    description: 'Optional comment when submitting for approval',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

/**
 * DTO for approving an entity
 * Business Rules:
 * - BR-AW-003: Approval requires specific roles per configuration type
 */
export class ApproveDto {
  @ApiProperty({
    description: 'ID of the employee approving this record (Payroll Manager)',
  })
  @IsMongoId()
  approvedBy: string;

  @ApiPropertyOptional({
    description: 'Optional comment when approving',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

/**
 * DTO for filtering pending approvals
 */
export class FilterPendingApprovalsDto {
  @ApiPropertyOptional({
    description: 'Filter by entity type',
    enum: ApprovalEntityType,
  })
  @IsOptional()
  @IsEnum(ApprovalEntityType)
  entityType?: ApprovalEntityType;

  @ApiPropertyOptional({
    description: 'Filter by creator ID',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}
