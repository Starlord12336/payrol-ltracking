import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateHeadcountDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentHeadcount?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  headcountBudget?: number;
}
