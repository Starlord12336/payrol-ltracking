import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectPayrollDto {
  @ApiProperty({
    description: 'ID of the reviewer rejecting the payroll',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  reviewerId: string;

  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Salary calculation errors detected for 3 employees',
  })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
