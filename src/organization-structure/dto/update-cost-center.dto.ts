import { IsString, IsOptional, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCostCenterDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  costCenter?: string; // null or empty string to remove cost center
}
