import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum ReviewAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

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
