////////////////////////# Compliance & Benefits Module - Member 2 ##############

import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsMongoId,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

/**
 * DTO for creating a new insurance bracket
 * Business Rules:
 * - BR-IN-001: Insurance bracket names must be unique
 * - BR-IN-002: Salary ranges must not overlap for same insurance type
 * - BR-IN-003: Employee rate + Employer rate must be ≤ 100%
 * - BR-7: Must follow Social Insurance and Pensions Law
 * - BR-8: Configurable contribution percentages
 *
 * @author John Wasfy
 */
export class CreateInsuranceBracketDto {
  @ApiProperty({
    description:
      'Insurance bracket name (e.g., "Social Insurance", "Health Insurance")',
    example: 'Social Insurance',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Minimum salary for this bracket in EGP',
    example: 6000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Minimum salary must be at least 0' })
  minSalary: number;

  @ApiProperty({
    description: 'Maximum salary for this bracket in EGP',
    example: 15000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Maximum salary must be at least 0' })
  maxSalary: number;

  @ApiProperty({
    description: 'Employee contribution rate (percentage: 0-100)',
    example: 14,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0, { message: 'Employee rate must be at least 0%' })
  @Max(100, { message: 'Employee rate must not exceed 100%' })
  employeeRate: number;

  @ApiProperty({
    description: 'Employer contribution rate (percentage: 0-100)',
    example: 18.75,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0, { message: 'Employer rate must be at least 0%' })
  @Max(100, { message: 'Employer rate must not exceed 100%' })
  employerRate: number;

  @ApiPropertyOptional({
    description: 'ID of the employee creating this record',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}

/**
 * DTO for updating an existing insurance bracket (only allowed in DRAFT status)
 *
 * @author [Your Name] - Team Member 2
 */
export class UpdateInsuranceBracketDto extends PartialType(
  CreateInsuranceBracketDto,
) {}

/**
 * DTO for filtering insurance brackets
 *
 * @author [Your Name] - Team Member 2
 */
export class FilterInsuranceBracketDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConfigStatus,
  })
  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @ApiPropertyOptional({
    description: 'Filter by insurance bracket name (partial match)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum salary (greater than or equal)',
  })
  @IsOptional()
  @IsNumber()
  minSalaryFrom?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum salary (less than or equal)',
  })
  @IsOptional()
  @IsNumber()
  maxSalaryTo?: number;
}
