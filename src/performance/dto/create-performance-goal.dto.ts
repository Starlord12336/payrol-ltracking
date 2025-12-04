import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreatePerformanceGoalDto {
  @IsString()
  goalTitle: string;

  @IsString()
  description: string;

  @IsString()
  employeeId: string;

  @IsString()
  setBy: string; // User ID

  @IsString()
  @IsOptional()
  cycleId?: string;

  @IsString()
  @IsOptional()
  category?: string; // GoalCategory enum doesn't exist in schema

  @IsString()
  @IsOptional()
  type?: string; // GoalType enum doesn't exist in schema

  @IsString()
  @IsOptional()
  priority?: string; // GoalPriority enum doesn't exist in schema

  @IsString()
  @IsOptional()
  targetMetric?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  targetValue?: number;

  @IsString()
  @IsOptional()
  targetUnit?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  dueDate: string;
}
