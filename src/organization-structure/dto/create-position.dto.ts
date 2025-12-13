import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsMongoId()
  @IsNotEmpty()
  departmentId: string;

  @IsMongoId()
  @IsOptional()
  reportsToPositionId?: string;
}
