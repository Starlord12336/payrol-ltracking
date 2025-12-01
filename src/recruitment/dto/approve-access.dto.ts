import { IsString, IsOptional } from 'class-validator';

export class ApproveAccessDto {
  @IsString()
  approvedBy: string;

  @IsOptional()
  @IsString()
  grantedTo?: string; // username or account assigned

  @IsOptional()
  @IsString()
  notes?: string;
}
