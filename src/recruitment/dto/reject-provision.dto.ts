import { IsString, IsOptional } from 'class-validator';

export class RejectProvisionDto {
  @IsString()
  rejectedBy: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
