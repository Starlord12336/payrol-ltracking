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

/**
 * RatingScaleDefinition DTO - matches schema exactly
 */
export class RatingScaleDefinitionDto {
  @IsEnum(AppraisalRatingScaleType)
  type: AppraisalRatingScaleType;

  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(0)
  max: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  step?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];
}

/**
 * EvaluationCriterion DTO - matches schema exactly
 */
export class EvaluationCriterionDto {
  @IsString()
  key: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  weight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxScore?: number;

  @IsBoolean()
  @IsOptional()
  required?: boolean;
}

/**
 * CreateAppraisalTemplateDto - matches AppraisalTemplate schema exactly
 */
export class CreateAppraisalTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AppraisalTemplateType)
  templateType: AppraisalTemplateType;

  @ValidateNested()
  @Type(() => RatingScaleDefinitionDto)
  ratingScale: RatingScaleDefinitionDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationCriterionDto)
  @IsOptional()
  criteria?: EvaluationCriterionDto[];

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableDepartmentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicablePositionIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
