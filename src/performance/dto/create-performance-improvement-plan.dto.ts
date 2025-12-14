import {
  IsString,
  IsDateString,
  IsArray,
  IsOptional,
  IsMongoId,
  ArrayMinSize,
  MinLength,
} from 'class-validator';

/**
 * DTO for creating a Performance Improvement Plan
 * REQ-OD-05: Line Manager initiates Performance Improvement Plans
 * Note: PIP data is stored in existing AppraisalRecord fields using special markers
 */
export class CreatePerformanceImprovementPlanDto {
  @IsString()
  @IsMongoId()
  appraisalRecordId: string; // The appraisal record to attach PIP to

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @MinLength(10)
  reason: string; // Why the PIP was initiated

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  improvementAreas: string[]; // Specific areas that need improvement

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  actionItems: string[]; // Specific actions/objectives for improvement

  @IsString()
  @IsOptional()
  expectedOutcomes?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  targetCompletionDate: string;
}

