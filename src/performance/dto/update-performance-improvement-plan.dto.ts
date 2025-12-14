import {
  IsString,
  IsDateString,
  IsArray,
  IsOptional,
  MinLength,
} from 'class-validator';

/**
 * DTO for updating a Performance Improvement Plan
 * REQ-OD-05: Line Manager initiates Performance Improvement Plans
 * Note: PIP data is stored in existing AppraisalRecord fields using special markers
 */
export class UpdatePerformanceImprovementPlanDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  reason?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  improvementAreas?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  actionItems?: string[];

  @IsString()
  @IsOptional()
  expectedOutcomes?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  targetCompletionDate?: string;

  @IsDateString()
  @IsOptional()
  actualCompletionDate?: string;

  @IsString()
  @IsOptional()
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

  @IsString()
  @IsOptional()
  progressNotes?: string;

  @IsString()
  @IsOptional()
  finalOutcome?: string;
}

