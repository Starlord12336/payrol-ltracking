import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateBenefitsDto {
  @IsString()
  planType: string; // e.g., 'health', 'pension'

  @IsOptional()
  @IsArray()
  options?: string[]; // selected benefits options

  @IsOptional()
  @IsString()
  initiatedBy?: string;
}
