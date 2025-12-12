import { IsString, IsOptional, IsDateString, IsMongoId, IsEnum } from 'class-validator';
import { AppraisalAssignmentStatus } from '../enums/performance.enums';

/**
 * DTO for updating an appraisal assignment
 */
export class UpdateAppraisalAssignmentDto {
  @IsString()
  @IsMongoId()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsMongoId()
  @IsOptional()
  managerProfileId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(AppraisalAssignmentStatus)
  @IsOptional()
  status?: AppraisalAssignmentStatus;
}

