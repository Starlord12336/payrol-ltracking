import { PartialType } from '@nestjs/mapped-types';
import { CreatePerformanceGoalDto } from './create-performance-goal.dto';
import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { GoalStatus } from '../schemas/performance-goal.schema';

export class UpdatePerformanceGoalDto extends PartialType(
  CreatePerformanceGoalDto,
) {
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentValue?: number;

  @IsEnum(GoalStatus)
  @IsOptional()
  status?: GoalStatus;

  @IsString()
  @IsOptional()
  finalComments?: string;
}

