import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BenefitReviewAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ReviewBenefitDto {
  @ApiProperty({
    description: 'ID of the reviewer (Payroll Specialist or Manager)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiProperty({
    description: 'Action to take on the termination/resignation benefit',
    enum: BenefitReviewAction,
    example: BenefitReviewAction.APPROVE,
  })
  @IsNotEmpty()
  @IsEnum(BenefitReviewAction)
  action: BenefitReviewAction;

  @ApiPropertyOptional({
    description: 'Reason for rejection (required if action is REJECT)',
    example: 'Clearance process not completed',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
