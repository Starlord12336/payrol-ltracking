import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

import { BonusStatus } from '../enums/payroll-execution-enum';

// Create DTO for EmployeeSigningBonus
export class CreateEmployeeSigningBonusDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsMongoId()
  @IsNotEmpty()
  signingBonusId: string;

  @IsNumber()
  @IsNotEmpty()
  givenAmount: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;

  @IsOptional()
  @IsEnum(BonusStatus)
  status?: BonusStatus;
}

// Update DTO (Partial)
export class UpdateEmployeeSigningBonusDto extends PartialType(CreateEmployeeSigningBonusDto) {}

// Delete DTO
export class DeleteEmployeeSigningBonusDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsMongoId()
  @IsNotEmpty()
  signingBonusId: string;
}
