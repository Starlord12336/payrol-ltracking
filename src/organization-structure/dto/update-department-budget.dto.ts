import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentBudgetDto } from './create-department-budget.dto';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDepartmentBudgetDto extends PartialType(
  CreateDepartmentBudgetDto,
) {
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

  @IsString()
  @IsOptional()
  status?: string; // BudgetStatus enum doesn't exist in schema
}
