import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AddHrReviewDto {
  @IsString()
  reviewedBy: string; // User ID

  @IsNumber()
  @IsOptional()
  adjustedRating?: number;

  @IsString()
  @IsOptional()
  adjustmentReason?: string;

  @IsString()
  @IsOptional()
  hrComments?: string;
}
