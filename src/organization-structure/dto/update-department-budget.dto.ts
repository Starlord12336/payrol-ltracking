import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentBudgetDto } from './create-department-budget.dto';
import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BudgetStatus } from '../schemas/department-budget.schema';

export class UpdateDepartmentBudgetDto extends PartialType(CreateDepartmentBudgetDto) {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentHeadcount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualSpent?: number;

  @IsEnum(BudgetStatus)
  @IsOptional()
  status?: BudgetStatus;
}

