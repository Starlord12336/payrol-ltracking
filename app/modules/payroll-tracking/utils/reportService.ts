/**
 * Report Service
 * All API calls for report generation endpoints
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type { GenerateReportRequest, Report } from './report';

/**
 * Generate various reports
 * POST /payroll-tracking/reports/generate
 */
export const generateReport = async (
  reportData: GenerateReportRequest
): Promise<Report> => {
  const response = await apiClient.post<{ data: Report }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/reports/generate`,
    reportData
  );
  return response.data.data;
};

/**
 * Generate payroll report by department
 * GET /payroll-tracking/reports/department/:departmentId
 */
export const generateDepartmentReport = async (
  departmentId: string,
  startDate?: string,
  endDate?: string
): Promise<Report> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/reports/department/${departmentId}${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<{ data: Report }>(url);
  return response.data.data;
};

/**
 * Generate month-end summary
 * GET /payroll-tracking/reports/month-end
 */
export const generateMonthEndSummary = async (
  year: number,
  month: number
): Promise<Report> => {
  const params = new URLSearchParams();
  params.append('year', year.toString());
  params.append('month', month.toString());

  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/reports/month-end?${params.toString()}`;
  
  const response = await apiClient.get<{ data: Report }>(url);
  return response.data.data;
};

/**
 * Generate year-end summary
 * GET /payroll-tracking/reports/year-end
 */
export const generateYearEndSummary = async (year: number): Promise<Report> => {
  const params = new URLSearchParams();
  params.append('year', year.toString());

  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/reports/year-end?${params.toString()}`;
  
  const response = await apiClient.get<{ data: Report }>(url);
  return response.data.data;
};

/**
 * Generate tax report
 * GET /payroll-tracking/reports/tax
 */
export const generateTaxReport = async (
  startDate?: string,
  endDate?: string
): Promise<Report> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/reports/tax${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<{ data: Report }>(url);
  return response.data.data;
};

/**
 * Generate insurance report
 * GET /payroll-tracking/reports/insurance
 */
export const generateInsuranceReport = async (
  startDate?: string,
  endDate?: string
): Promise<Report> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/reports/insurance${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<{ data: Report }>(url);
  return response.data.data;
};

/**
 * Generate benefits report
 * GET /payroll-tracking/reports/benefits
 */
export const generateBenefitsReport = async (
  startDate?: string,
  endDate?: string
): Promise<Report> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/reports/benefits${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<{ data: Report }>(url);
  return response.data.data;
};

