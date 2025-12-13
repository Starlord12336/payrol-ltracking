import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateInterviewDto {
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  videoLink?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
