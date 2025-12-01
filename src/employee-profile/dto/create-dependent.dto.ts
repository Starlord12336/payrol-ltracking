import { IsString, IsOptional, IsEnum, IsEmail, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { DependentRelationship, InsuranceStatus } from '../models/dependent.schema';

export class CreateDependentDto {
  @IsString()
  fullName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(DependentRelationship)
  relationship: DependentRelationship;

  @IsString()
  @IsOptional()
  nationalId?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(InsuranceStatus)
  @IsOptional()
  insuranceStatus?: InsuranceStatus;

  @IsDateString()
  @IsOptional()
  insuranceStartDate?: string;

  @IsDateString()
  @IsOptional()
  insuranceEndDate?: string;

  @IsString()
  @IsOptional()
  insurancePolicyNumber?: string;

  @IsString()
  @IsOptional()
  insuranceProvider?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentUrls?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

