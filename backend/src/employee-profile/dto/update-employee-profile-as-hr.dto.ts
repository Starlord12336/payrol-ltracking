// src/employee-profile/dto/update-employee-profile-as-hr.dto.ts
import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsDateString,
  IsNumber,
} from 'class-validator';
import {
  EmployeeStatus,
  ContractType,
  WorkType,
} from '../enums/employee-profile.enums';
import { AppraisalRatingScaleType } from '../../performance/enums/performance.enums';

export class UpdateEmployeeProfileAsHrDto {
  // --- Core identity (from UserProfileBase) ---
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string; // ISO string

  // --- Contact info ---
  @IsOptional()
  @IsEmail()
  workEmail?: string;

  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @IsOptional()
  @IsString()
  homePhone?: string;

  // --- Address ---
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  country?: string;

  // --- Profile picture ---
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  // --- Employment / contract info ---
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfHire?: string;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsOptional()
  @IsDateString()
  statusEffectiveFrom?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  // --- Banking details ---
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  // --- Org Structure links ---
  @IsOptional()
  @IsMongoId()
  primaryPositionId?: string;

  @IsOptional()
  @IsMongoId()
  primaryDepartmentId?: string;

  @IsOptional()
  @IsMongoId()
  supervisorPositionId?: string;

  @IsOptional()
  @IsMongoId()
  payGradeId?: string;

  // --- Performance / appraisal links ---
  @IsOptional()
  @IsMongoId()
  lastAppraisalRecordId?: string;

  @IsOptional()
  @IsMongoId()
  lastAppraisalCycleId?: string;

  @IsOptional()
  @IsMongoId()
  lastAppraisalTemplateId?: string;

  @IsOptional()
  @IsDateString()
  lastAppraisalDate?: string;

  @IsOptional()
  @IsNumber()
  lastAppraisalScore?: number;

  @IsOptional()
  @IsString()
  lastAppraisalRatingLabel?: string;

  @IsOptional()
  @IsEnum(AppraisalRatingScaleType)
  lastAppraisalScaleType?: AppraisalRatingScaleType;

  @IsOptional()
  @IsString()
  lastDevelopmentPlanSummary?: string;
}
