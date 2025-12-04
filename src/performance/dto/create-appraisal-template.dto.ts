import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AppraisalTemplateType,
  AppraisalRatingScaleType,
} from '../enums/performance.enums';

export class RatingLabelDto {
  @IsNumber()
  value: number;

  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class RatingScaleDto {
  @IsEnum(AppraisalRatingScaleType)
  scaleType: AppraisalRatingScaleType;

  @IsNumber()
  @Min(0)
  minValue: number;

  @IsNumber()
  @Min(0)
  maxValue: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingLabelDto)
  @IsOptional()
  labels?: RatingLabelDto[];
}

export class CriterionDto {
  @IsString()
  criteriaId: string;

  @IsString()
  criteriaName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsBoolean()
  isRequired: boolean;

  @IsBoolean()
  allowComments: boolean;
}

export class TemplateSectionDto {
  @IsString()
  sectionId: string;

  @IsString()
  sectionName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsNumber()
  @Min(0)
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionDto)
  @ArrayMinSize(1)
  criteria: CriterionDto[];
}

export class CreateAppraisalTemplateDto {
  @IsString()
  templateCode: string;

  @IsString()
  templateName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AppraisalTemplateType)
  appraisalType: AppraisalTemplateType;

  @ValidateNested()
  @Type(() => RatingScaleDto)
  ratingScale: RatingScaleDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateSectionDto)
  @ArrayMinSize(1)
  sections: TemplateSectionDto[];

  @IsString()
  @IsOptional()
  calculationMethod?: string; // CalculationMethod enum doesn't exist in schema

  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @IsBoolean()
  requiresSelfAssessment: boolean;

  @IsBoolean()
  @IsOptional()
  requiresPeerReview?: boolean;

  @IsBoolean()
  @IsOptional()
  allowEmployeeFeedback?: boolean;

  @IsNumber()
  @IsOptional()
  disputePeriodDays?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableDepartmentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicablePositionIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableLevels?: string[];
}
