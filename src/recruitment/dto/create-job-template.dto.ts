import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  openings: number;

  @IsArray()
  @ArrayNotEmpty()
  qualifications: string[];

  @IsArray()
  @ArrayNotEmpty()
  skills: string[];

  @IsOptional()
  @IsString()
  description?: string;

  // Optional organization position code to import from OS
  @IsOptional()
  @IsString()
  positionCode?: string;
}
