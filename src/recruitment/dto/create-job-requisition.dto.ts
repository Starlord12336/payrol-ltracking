import { IsString, IsNumber, IsOptional, IsMongoId, Min } from 'class-validator';

export class CreateJobRequisitionDto {
  @IsOptional()
  @IsMongoId()
  templateId?: string; // Optional: reference to JobTemplate

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

