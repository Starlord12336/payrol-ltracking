import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePayrollDto {
  @IsString()
  payrollType: string; // e.g., 'first-payroll', 'signing-bonus'

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  frequency?: string; // e.g., 'monthly'

  @IsOptional()
  @IsString()
  initiatedBy?: string;
}
