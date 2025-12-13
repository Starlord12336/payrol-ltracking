import { IsString, IsNumber, IsOptional, IsMongoId, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobRequisitionDto {
  @IsOptional()
  @ValidateIf((o) => o.templateId !== undefined && o.templateId !== null && o.templateId !== '')
  @IsMongoId()
  templateId?: string; // Optional: reference to JobTemplate

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  openings: number; // Required: number of positions to fill

  @IsOptional()
  @IsString()
  location?: string; // Optional: job location

  @IsOptional()
  @IsString()
  requisitionId?: string; // Optional: custom requisition ID, otherwise auto-generated
}

