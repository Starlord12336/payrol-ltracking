import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(10)
  @Transform(({ value }) => value?.trim())
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsMongoId()
  @IsOptional()
  headPositionId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  costCenter?: string;
}
