import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FeedbackCategoryDto {
  @IsString()
  categoryName: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class CreatePerformanceFeedbackDto {
  @IsString()
  recipientId: string; // Employee ID

  @IsString()
  providerId: string; // Employee ID

  @IsString()
  @IsOptional()
  feedbackType?: string; // FeedbackType enum doesn't exist in schema

  @IsString()
  @IsOptional()
  cycleId?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  strengths?: string;

  @IsString()
  @IsOptional()
  areasForImprovement?: string;

  @IsString()
  @IsOptional()
  specificExamples?: string;

  @IsString()
  @IsOptional()
  recommendations?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackCategoryDto)
  @IsOptional()
  categories?: FeedbackCategoryDto[];

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sharedWith?: string[]; // User IDs
}
