import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import {
  Gender,
  MaritalStatus,
  EmployeeStatus,
  CandidateStatus,
} from '../../employee-profile/enums/employee-profile.enums';

export type UserType = 'employee' | 'candidate';

export class RegisterDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  lastName: string;

  @IsString()
  nationalId: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  mobilePhone?: string;

  // User type - determines if registering as Employee or Candidate
  @IsOptional()
  @IsEnum(['employee', 'candidate'])
  userType?: UserType;

  // Employee-specific fields
  @IsOptional()
  @IsString()
  employeeNumber?: string; // If provided, will be used; otherwise auto-generated

  @IsOptional()
  @IsDateString()
  dateOfHire?: string; // Required for employees

  @IsOptional()
  @IsString()
  workEmail?: string; // For employees

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus; // For employees

  // Candidate-specific fields
  @IsOptional()
  @IsString()
  candidateNumber?: string; // If provided, will be used; otherwise auto-generated

  @IsOptional()
  @IsDateString()
  applicationDate?: string; // For candidates

  @IsOptional()
  @IsEnum(CandidateStatus)
  candidateStatus?: CandidateStatus; // For candidates
}
