import { IsString, IsDateString, IsArray, IsOptional } from 'class-validator';

export class CreateAppraisalCycleDto {
  @IsString()
  cycleCode: string;

  @IsString()
  cycleName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  appraisalType: string; // AppraisalType as string

  @IsString()
  templateId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsDateString()
  @IsOptional()
  selfAssessmentDeadline?: string;

  @IsDateString()
  managerReviewDeadline: string;

  @IsDateString()
  @IsOptional()
  hrReviewDeadline?: string;

  @IsDateString()
  @IsOptional()
  disputeDeadline?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetEmployeeIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetDepartmentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetPositionIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excludeEmployeeIds?: string[];
}
