import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateChecklistDto {
  @IsString()
  templateName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsArray()
  taskNames?: string[];
}
