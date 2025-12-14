import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class FlagHighPerformerDto {
  @IsString()
  appraisalRecordId: string;

  @IsBoolean()
  @IsOptional()
  isHighPerformer?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  promotionRecommendation?: string;
}

