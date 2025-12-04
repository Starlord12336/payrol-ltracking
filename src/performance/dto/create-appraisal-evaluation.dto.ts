import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsBoolean,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppraisalRecordStatus } from '../enums/performance.enums';

export class CriterionRatingDto {
  @IsString()
  criteriaId: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class SectionRatingDto {
  @IsString()
  sectionId: string;

  @IsNumber()
  @IsOptional()
  sectionScore?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionRatingDto)
  @ArrayMinSize(1)
  criteria: CriterionRatingDto[];
}

export class SelfAssessmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionRatingDto)
  @ArrayMinSize(1)
  sections: SectionRatingDto[];

  @IsString()
  @IsOptional()
  overallComments?: string;
}

export class ManagerEvaluationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionRatingDto)
  @ArrayMinSize(1)
  sections: SectionRatingDto[];

  @IsNumber()
  @IsOptional()
  overallRating?: number;

  @IsString()
  @IsOptional()
  strengths?: string;

  @IsString()
  @IsOptional()
  areasForImprovement?: string;

  @IsString()
  @IsOptional()
  developmentRecommendations?: string;

  @IsNumber()
  @IsOptional()
  attendanceScore?: number;

  @IsNumber()
  @IsOptional()
  punctualityScore?: number;

  @IsString()
  @IsOptional()
  attendanceComments?: string;
}

export class CreateAppraisalEvaluationDto {
  @IsString()
  cycleId: string;

  @IsString()
  templateId: string;

  @IsString()
  employeeId: string;

  @IsString()
  reviewerId: string;

  @ValidateNested()
  @Type(() => SelfAssessmentDto)
  @IsOptional()
  selfAssessment?: SelfAssessmentDto;

  @ValidateNested()
  @Type(() => ManagerEvaluationDto)
  managerEvaluation: ManagerEvaluationDto;

  @IsNumber()
  finalRating: number;

  @IsEnum(AppraisalRecordStatus)
  @IsOptional()
  status?: AppraisalRecordStatus;
}
