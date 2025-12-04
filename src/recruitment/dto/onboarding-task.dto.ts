import {
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';

export class CreateOnboardingTaskDto {
  @IsString()
  employeeId: string;

  @IsString()
  name: string;

  @IsString()
  department: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  status?: OnboardingTaskStatus;

  // Enriched metadata for task tracking
  @IsOptional()
  @IsNumber()
  sequence?: number; // Order in workflow

  @IsOptional()
  @IsString()
  description?: string; // What to do

  @IsOptional()
  @IsString()
  owner?: string; // Who is responsible (e.g., 'HR', 'IT')

  @IsOptional()
  @IsNumber()
  estimatedHours?: number; // How long it takes

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean; // Cannot start until prerequisite done

  @IsOptional()
  @IsNumber()
  prerequisiteTaskIndex?: number; // Index of blocking task
}

export class UpdateTaskStatusDto {
  status: OnboardingTaskStatus;
  @IsOptional()
  notes?: string;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date;
}
