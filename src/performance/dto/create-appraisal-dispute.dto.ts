import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { DisputeStatus } from '../schemas/appraisal-dispute.schema';

export class CreateAppraisalDisputeDto {
  @IsString()
  evaluationId: string;

  @IsString()
  disputeReason: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  disputedSections?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  disputedCriteria?: string[];

  @IsNumber()
  @IsOptional()
  proposedRating?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supportingDocumentIds?: string[];

  @IsString()
  @IsOptional()
  additionalComments?: string;
}
