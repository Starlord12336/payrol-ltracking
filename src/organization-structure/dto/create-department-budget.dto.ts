import { IsMongoId, IsNumber, IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BudgetStatus } from '../schemas/department-budget.schema';

export class CreateDepartmentBudgetDto {
  @IsMongoId()
  departmentId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(2000)
  @Max(2100)
  fiscalYear: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  fiscalQuarter?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetedHeadcount: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetedAmount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(BudgetStatus)
  @IsOptional()
  status?: BudgetStatus;
}

