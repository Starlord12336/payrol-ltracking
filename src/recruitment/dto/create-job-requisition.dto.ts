import { IsString, IsNumber, IsOptional, IsMongoId, Min, ValidateIf, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class SalaryRangeDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateJobRequisitionDto {
  @IsOptional()
  @ValidateIf((o) => o.templateId !== undefined && o.templateId !== null && o.templateId !== '')
  @IsMongoId()
  templateId?: string; // Optional: reference to JobTemplate

  @IsString()
  jobTitle: string; // Required: job title

  @IsString()
  department: string; // Required: department

  @IsOptional()
  @IsString()
  description?: string; // Optional: job description

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualifications?: string[]; // Optional: list of qualifications

  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryRangeDto)
  salary?: SalaryRangeDto; // Optional: salary range

  @IsOptional()
  @IsString()
  location?: string; // Optional: job location

  @IsOptional()
  @IsString()
  employmentType?: string; // Optional: Full-Time, Part-Time, etc.

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  numberOfPositions?: number; // Optional: number of positions (defaults to 1)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  openings?: number; // Legacy: number of positions to fill (alias for numberOfPositions)

  @IsOptional()
  @IsString()
  urgency?: string; // Optional: LOW, MEDIUM, HIGH

  @IsOptional()
  @IsString()
  requisitionId?: string; // Optional: custom requisition ID, otherwise auto-generated
}

