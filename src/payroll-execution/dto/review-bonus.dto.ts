import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BonusReviewAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ReviewBonusDto {
  @ApiProperty({
    description: 'ID of the reviewer (Payroll Specialist or Manager)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiProperty({
    description: 'Action to take on the signing bonus',
    enum: BonusReviewAction,
    example: BonusReviewAction.APPROVE,
  })
  @IsNotEmpty()
  @IsEnum(BonusReviewAction)
  action: BonusReviewAction;

  @ApiPropertyOptional({
    description: 'Reason for rejection (required if action is REJECT)',
    example: 'Employee does not meet eligibility criteria',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
