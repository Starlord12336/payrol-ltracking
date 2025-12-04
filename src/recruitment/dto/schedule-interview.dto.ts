import {
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  IsIn,
  IsNumber,
  IsMongoId,
} from 'class-validator';

export class ScheduleInterviewDto {
  @IsMongoId()
  applicationId: string;

  @IsString()
  stage: string;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsString()
  method?: string; // 'IN_PERSON' | 'VIDEO' | 'PHONE'

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  panelIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  panelEmails?: string[];

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  videoLink?: string;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  @IsOptional()
  @IsString()
  templateKey?: string;
}
