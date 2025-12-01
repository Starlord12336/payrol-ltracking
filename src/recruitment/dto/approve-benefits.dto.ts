import { IsString, IsOptional } from 'class-validator';

export class ApproveBenefitsDto {
  @IsString()
  approvedBy: string;

  @IsOptional()
  @IsString()
  enrollmentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
