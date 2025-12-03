import { IsEnum, IsOptional, IsMongoId, IsDateString } from 'class-validator';
import { Types } from 'mongoose';

export enum ReportType {
  PAYROLL_BY_DEPARTMENT = 'payroll_by_department',
  MONTH_END_SUMMARY = 'month_end_summary',
  YEAR_END_SUMMARY = 'year_end_summary',
  TAX_REPORT = 'tax_report',
  INSURANCE_REPORT = 'insurance_report',
  BENEFITS_REPORT = 'benefits_report',
}

export class GenerateReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsMongoId()
  @IsOptional()
  departmentId?: Types.ObjectId;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
