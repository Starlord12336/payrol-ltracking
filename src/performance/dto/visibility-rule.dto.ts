import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

export enum FeedbackFieldType {
  MANAGER_SUMMARY = 'MANAGER_SUMMARY',
  STRENGTHS = 'STRENGTHS',
  IMPROVEMENT_AREAS = 'IMPROVEMENT_AREAS',
  RATINGS = 'RATINGS',
  COMMENTS = 'COMMENTS',
  SELF_ASSESSMENT = 'SELF_ASSESSMENT',
  OVERALL_SCORE = 'OVERALL_SCORE',
  FINAL_RATING = 'FINAL_RATING',
}

export class VisibilityRuleDto {
  id?: string;
  name: string;
  description?: string;
  fieldType: FeedbackFieldType;
  allowedRoles: SystemRole[];
  isActive: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreateVisibilityRuleDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FeedbackFieldType)
  fieldType: FeedbackFieldType;

  @IsArray()
  @IsEnum(SystemRole, { each: true })
  allowedRoles: SystemRole[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  effectiveFrom?: string;

  @IsString()
  @IsOptional()
  effectiveTo?: string;
}

export class UpdateVisibilityRuleDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FeedbackFieldType)
  @IsOptional()
  fieldType?: FeedbackFieldType;

  @IsArray()
  @IsEnum(SystemRole, { each: true })
  @IsOptional()
  allowedRoles?: SystemRole[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  effectiveFrom?: string;

  @IsString()
  @IsOptional()
  effectiveTo?: string;
}

