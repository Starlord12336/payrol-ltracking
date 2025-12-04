import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnfreezePayrollDto {
  @ApiProperty({
    description: 'ID of the Payroll Manager requesting unfreeze',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  managerId: string;

  @ApiProperty({
    description: 'Reason for unfreezing the payroll',
    example: 'Critical correction needed for tax calculations',
  })
  @IsNotEmpty()
  @IsString()
  unlockReason: string;
}
