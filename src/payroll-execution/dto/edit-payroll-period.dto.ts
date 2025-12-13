import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditPayrollPeriodDto {
  @ApiProperty({
    description: 'New payroll period end date (e.g., 2025-02-28)',
    example: '2025-02-28',
  })
  @IsNotEmpty()
  @IsDateString()
  payrollPeriod: string;
}
