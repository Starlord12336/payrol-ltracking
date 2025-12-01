import { IsString, IsOptional } from 'class-validator';

export class ApproveProvisionDto {
  @IsString()
  approvedBy: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  assignmentDetails?: string;
}
