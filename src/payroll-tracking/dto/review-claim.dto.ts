import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
} from 'class-validator';

export enum ReviewAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ReviewClaimDto {
  @IsEnum(ReviewAction)
  action: ReviewAction;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  approvedAmount?: number;

  @IsString()
  @IsOptional()
  resolutionComment?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
