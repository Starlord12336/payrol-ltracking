import { IsString, IsNotEmpty } from 'class-validator';

export class ReviewPayrollDto {
  @IsString()
  @IsNotEmpty()
  runId: string;
}

export class ReviewPayrollResponseDto {
  runId: string;
  status: string;
  exceptions: number;
  exceptionDetails: ExceptionDetail[];
  employees: number;
  totalNetPay: number;
}

export class ExceptionDetail {
  employeeId: string;
  employeeName?: string;
  issue: string;
  severity: 'critical' | 'warning';
}
