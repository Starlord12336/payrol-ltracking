import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsString()
  @IsOptional()
  status?: string; // BudgetStatus enum doesn't exist in schema
}
