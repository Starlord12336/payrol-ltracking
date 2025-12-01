import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import {
  GoalCategory,
  GoalType,
  GoalPriority,
} from '../schemas/performance-goal.schema';

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

  @IsEnum(GoalCategory)
  category: GoalCategory;

  @IsEnum(GoalType)
  type: GoalType;

  @IsEnum(GoalPriority)
  priority: GoalPriority;

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

