import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

import { BenefitStatus } from '../enums/payroll-execution-enum';

// Create DTO for EmployeeTerminationResignationBenefits
export class CreateEmployeeTerminationResignationBenefitsDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsMongoId()
  @IsNotEmpty()
  benefitId: string;

  @IsMongoId()
  @IsNotEmpty()
  terminationId: string;

  @IsNumber()
  @IsNotEmpty()
  givenAmount: number;

  @IsOptional()
  @IsEnum(BenefitStatus)
  status?: BenefitStatus;
}

// Update DTO (Partial)
export class UpdateEmployeeTerminationResignationBenefitsDto extends PartialType(
  CreateEmployeeTerminationResignationBenefitsDto
) {}

// Delete DTO
export class DeleteEmployeeTerminationResignationBenefitsDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsMongoId()
  @IsNotEmpty()
  benefitId: string;

  @IsMongoId()
  @IsNotEmpty()
  terminationId: string;
}
