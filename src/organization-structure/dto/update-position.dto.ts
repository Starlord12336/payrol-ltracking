import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionDto } from './create-position.dto';
import { IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdatePositionDto extends PartialType(CreatePositionDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  headcountBudget?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  currentHeadcount?: number;
}
