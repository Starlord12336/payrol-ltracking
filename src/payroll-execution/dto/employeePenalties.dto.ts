import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Penalty DTOs

export class CreatePenaltyDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class UpdatePenaltyDto extends PartialType(CreatePenaltyDto) {}

export class DeletePenaltyDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

// EmployeePenalties DTOs

export class CreateEmployeePenaltiesDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePenaltyDto)
  @IsOptional()
  penalties?: CreatePenaltyDto[];
}

export class UpdateEmployeePenaltiesDto extends PartialType(CreateEmployeePenaltiesDto) {}

export class DeleteEmployeePenaltiesDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;
}
