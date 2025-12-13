import { IsString, IsOptional, IsISO8601 } from 'class-validator';

export class CreateProvisionDto {
  @IsString()
  resourceType: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  requestedBy?: string;

  @IsOptional()
  @IsISO8601()
  deadline?: string;
}
