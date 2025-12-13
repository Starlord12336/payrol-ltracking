import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RatingEntryDto {
  @IsString()
  key: string;

  @IsString()
  title: string;

  @IsNumber()
  @Min(0)
  ratingValue: number;

  @IsString()
  @IsOptional()
  ratingLabel?: string;

  @IsNumber()
  @IsOptional()
  weightedScore?: number;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class CreateAppraisalRecordDto {
  @IsString()
  assignmentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RatingEntryDto)
  ratings: RatingEntryDto[];

  @IsString()
  @IsOptional()
  managerSummary?: string;

  @IsString()
  @IsOptional()
  strengths?: string;

  @IsString()
  @IsOptional()
  improvementAreas?: string;
}
