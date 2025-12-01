import { IsString, IsOptional, IsNumber, IsArray, IsIn } from 'class-validator';

export class PreboardingTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['candidate', 'hr'])
  assignee?: 'candidate' | 'hr';

  @IsOptional()
  @IsNumber()
  dueDays?: number;
}

export class TriggerPreboardingDto {
  @IsOptional()
  @IsString()
  startDate?: string; // ISO date string

  @IsOptional()
  @IsArray()
  tasks?: PreboardingTaskDto[];
}
