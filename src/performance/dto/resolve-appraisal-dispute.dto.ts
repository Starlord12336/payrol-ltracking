import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { DisputeStatus, ResolutionType } from '../schemas/appraisal-dispute.schema';

export class ResolveAppraisalDisputeDto {
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @IsEnum(ResolutionType)
  @IsOptional()
  resolutionType?: ResolutionType;

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
