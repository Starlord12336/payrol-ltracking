import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayrollRunDto {
  @ApiProperty({
    description: 'Payroll period end date (e.g., 2025-01-31)',
    example: '2025-01-31',
  })
  @IsNotEmpty()
  @IsDateString()
  payrollPeriod: string;

  @ApiProperty({
    description: 'Company/Entity name for this payroll run',
    example: 'TechCorp Egypt',
  })
  @IsNotEmpty()
  @IsString()
  entity: string;

  @ApiProperty({
    description: 'ID of the Payroll Specialist initiating this run',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  payrollSpecialistId: string;
}
