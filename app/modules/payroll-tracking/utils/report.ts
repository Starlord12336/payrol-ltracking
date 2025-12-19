/**
 * Report Types
 * Based on backend GenerateReportDto
 */

export enum ReportType {
  PAYROLL_BY_DEPARTMENT = 'payroll_by_department',
  MONTH_END_SUMMARY = 'month_end_summary',
  YEAR_END_SUMMARY = 'year_end_summary',
  TAX_REPORT = 'tax_report',
  INSURANCE_REPORT = 'insurance_report',
  BENEFITS_REPORT = 'benefits_report',
}

export interface GenerateReportRequest {
  reportType: ReportType;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}

export interface Report {
  reportType: ReportType;
  data: any;
  generatedAt: string;
  period?: {
    startDate?: string;
    endDate?: string;
    year?: number;
    month?: number;
  };
}

