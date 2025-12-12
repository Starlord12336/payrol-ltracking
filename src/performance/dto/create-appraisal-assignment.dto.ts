import {
  IsString,
  IsArray,
  IsOptional,
  IsDateString,
  IsMongoId,
  ArrayMinSize,
} from 'class-validator';

/**
 * DTO for manually assigning an appraisal template to employee(s)
 */
export class CreateAppraisalAssignmentDto {
  @IsString()
  @IsMongoId()
  templateId: string;

  @IsString()
  @IsMongoId()
  cycleId: string;

  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  employeeProfileIds: string[];

  @IsString()
  @IsMongoId()
  @IsOptional()
  managerProfileId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

/**
 * DTO for bulk assigning template to departments or positions
 */
export class BulkAssignTemplateDto {
  @IsString()
  @IsMongoId()
  templateId: string;

  @IsString()
  @IsMongoId()
  cycleId: string;

  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  @IsOptional()
  departmentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  @IsOptional()
  positionIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  @IsOptional()
  employeeProfileIds?: string[];

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsMongoId()
  @IsOptional()
  managerProfileId?: string;
}

