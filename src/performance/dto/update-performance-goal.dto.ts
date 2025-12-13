import { PartialType } from '@nestjs/mapped-types';
import { CreatePerformanceGoalDto } from './create-performance-goal.dto';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdatePerformanceGoalDto extends PartialType(
  CreatePerformanceGoalDto,
) {
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentValue?: number;

  @IsString()
  @IsOptional()
  status?: string; // GoalStatus enum doesn't exist in schema

  @IsString()
  @IsOptional()
  finalComments?: string;
}
