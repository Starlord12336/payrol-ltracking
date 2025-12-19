/**
 * Refund Service
 * All API calls for refund-related endpoints
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type { Refund } from './refund';

/**
 * Get employee refunds
 * GET /payroll-tracking/employee/:employeeId/refunds
 */
export const getEmployeeRefunds = async (employeeId: string): Promise<Refund[]> => {
  const response = await apiClient.get<{ data: Refund[] }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/refunds`
  );
  return response.data.data || [];
};

/**
 * Get pending refunds (for payroll execution)
 * GET /payroll-tracking/refunds/pending
 */
export const getPendingRefunds = async (): Promise<Refund[]> => {
  const response = await apiClient.get<{ data: Refund[] }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/refunds/pending`
  );
  return response.data.data || [];
};

/**
 * Mark refund as paid (called by payroll execution)
 * PATCH /payroll-tracking/refunds/:refundId/mark-paid
 */
export const markRefundAsPaid = async (
  refundId: string,
  payrollRunId: string
): Promise<Refund> => {
  const response = await apiClient.patch<{ data: Refund }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/refunds/${refundId}/mark-paid`,
    { payrollRunId }
  );
  return response.data.data;
};

