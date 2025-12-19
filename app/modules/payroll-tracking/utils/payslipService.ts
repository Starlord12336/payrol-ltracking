/**
 * Payslip Service
 * All API calls for payslip-related endpoints
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type {
  Payslip,
  BaseSalary,
  LeaveCompensation,
  TransportationAllowance,
  TaxDeduction,
  InsuranceDeduction,
  MisconductPenalty,
  UnpaidLeaveDeduction,
  EmployerContribution,
  SalaryHistoryEntry,
} from './payslip';

/**
 * Get specific payslip for employee
 * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId
 */
export const getEmployeePayslip = async (
  employeeId: string,
  payslipId: string
): Promise<Payslip> => {
  const response = await apiClient.get<{ data: Payslip }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/payslips/${payslipId}`
  );
  return response.data.data;
};

/**
 * Get all payslips for employee
 * GET /payroll-tracking/employee/:employeeId/payslips
 */
export const getEmployeePayslips = async (
  employeeId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }
): Promise<Payslip[]> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.status) params.append('status', filters.status);

  const queryString = params.toString();
  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/payslips${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<{ data: Payslip[] }>(url);
  return response.data.data || [];
};

/**
 * Get current/most recent payslip
 */
export const getCurrentPayslip = async (employeeId: string): Promise<Payslip | null> => {
  try {
    const payslips = await getEmployeePayslips(employeeId);
    return payslips.length > 0 ? payslips[0] : null;
  } catch (error) {
    console.error('Error fetching current payslip:', error);
    return null;
  }
};

/**
 * Get employee base salary
 * GET /payroll-tracking/employee/:employeeId/base-salary
 */
export const getEmployeeBaseSalary = async (
  employeeId: string
): Promise<BaseSalary> => {
  const response = await apiClient.get<{ data: BaseSalary }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/base-salary`
  );
  return response.data.data;
};

/**
 * Get leave compensation for payslip
 * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/leave-compensation
 */
export const getLeaveCompensation = async (
  employeeId: string,
  payslipId: string
): Promise<LeaveCompensation> => {
  const response = await apiClient.get<{ data: LeaveCompensation }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/payslips/${payslipId}/leave-compensation`
  );
  return response.data.data;
};

/**
 * Get transportation allowance
 * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/transportation
 */
export const getTransportationAllowance = async (
  employeeId: string,
  payslipId: string
): Promise<TransportationAllowance> => {
  const response = await apiClient.get<{ data: TransportationAllowance }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/payslips/${payslipId}/transportation`
  );
  return response.data.data;
};

/**
 * Get tax deductions
 * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/tax-deductions
 */
export const getTaxDeductions = async (
  employeeId: string,
  payslipId: string
): Promise<TaxDeduction[]> => {
  const response = await apiClient.get<{ data: TaxDeduction[] }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/payslips/${payslipId}/tax-deductions`
  );
  return response.data.data || [];
};

/**
 * Get insurance deductions
 * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/insurance-deductions
 */
export const getInsuranceDeductions = async (
  employeeId: string,
  payslipId: string
): Promise<InsuranceDeduction[]> => {
  const response = await apiClient.get<{ data: InsuranceDeduction[] }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/payslips/${payslipId}/insurance-deductions`
  );
  return response.data.data || [];
};

/**
 * Get misconduct penalties
 * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/penalties
 */
export const getMisconductPenalties = async (
  employeeId: string,
  payslipId: string
): Promise<MisconductPenalty[]> => {
  const response = await apiClient.get<{ data: MisconductPenalty[] }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/payslips/${payslipId}/penalties`
  );
  return response.data.data || [];
};

/**
 * Get unpaid leave deductions
 * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/unpaid-leave
 */
export const getUnpaidLeaveDeductions = async (
  employeeId: string,
  payslipId: string
): Promise<UnpaidLeaveDeduction[]> => {
  const response = await apiClient.get<{ data: UnpaidLeaveDeduction[] }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/payslips/${payslipId}/unpaid-leave`
  );
  return response.data.data || [];
};

/**
 * Get salary history
 * GET /payroll-tracking/employee/:employeeId/salary-history
 */
export const getSalaryHistory = async (
  employeeId: string,
  limit?: number
): Promise<SalaryHistoryEntry[]> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());

  const queryString = params.toString();
  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/salary-history${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<{ data: SalaryHistoryEntry[] }>(url);
  return response.data.data || [];
};

/**
 * Get employer contributions
 * GET /payroll-tracking/employee/:employeeId/payslips/:payslipId/employer-contributions
 */
export const getEmployerContributions = async (
  employeeId: string,
  payslipId: string
): Promise<EmployerContribution[]> => {
  const response = await apiClient.get<{ data: EmployerContribution[] }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/payslips/${payslipId}/employer-contributions`
  );
  return response.data.data || [];
};

// Backward compatibility aliases
export const getPayslipList = getEmployeePayslips;
