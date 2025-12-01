import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateAccessDto {
  @IsString()
  resource: string; // e.g., 'email', 'vpn', 'jira'

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsString()
  requestedBy?: string;

  @IsOptional()
  @IsString()
  department?: string;
}
