import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ReviewAction } from './review-claim.dto';

export class ReviewDisputeDto {
  @IsEnum(ReviewAction)
  action: ReviewAction;

  @IsString()
  @IsOptional()
  resolutionComment?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
