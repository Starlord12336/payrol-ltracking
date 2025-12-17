import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EditEmployeePayrollDetailDto {
  @ApiPropertyOptional({
    description: 'Bank account number to update if bank status is missing',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'New net pay amount if current net pay is below minimum wage or negative',
    example: 6000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  netPay?: number;
}

