import { IsString, IsOptional, IsNumber } from 'class-validator';
import { AppraisalDisputeStatus } from '../enums/performance.enums';

export class ResolveAppraisalDisputeDto {
  @IsString()
  status: string; // 'RESOLVED' or 'REJECTED' - mapped to AppraisalDisputeStatus in service

  @IsString()
  @IsOptional()
  resolutionType?: string; // ResolutionType enum doesn't exist in schema

  @IsNumber()
  @IsOptional()
  adjustedRating?: number;

  @IsString()
  @IsOptional()
  resolutionNotes?: string;

  @IsString()
  @IsOptional()
  reviewComments?: string;
}
