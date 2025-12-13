import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class AssessmentCriteriaDto {
  @IsString()
  key: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class SaveAssessmentFormDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  positionCode?: string;

  @IsArray()
  criteria: AssessmentCriteriaDto[];
}
