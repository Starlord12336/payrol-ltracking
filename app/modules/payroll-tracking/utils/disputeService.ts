/**
 * Dispute Service
 * All API calls for dispute-related endpoints
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type { Dispute, CreateDisputeRequest, ReviewDisputeRequest } from './dispute';

/**
 * Create a dispute
 * POST /payroll-tracking/employee/:employeeId/disputes
 */
export const createDispute = async (
  employeeId: string,
  disputeData: CreateDisputeRequest
): Promise<Dispute> => {
  const response = await apiClient.post<{ data: Dispute }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/disputes`,
    disputeData
  );
  return response.data.data;
};

/**
 * Get all disputes for employee
 * GET /payroll-tracking/employee/:employeeId/disputes
 */
export const getEmployeeDisputes = async (employeeId: string): Promise<Dispute[]> => {
  const response = await apiClient.get<{ data: Dispute[] }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/disputes`
  );
  return response.data.data || [];
};

/**
 * Get specific dispute status
 * GET /payroll-tracking/employee/:employeeId/disputes/:disputeId
 */
export const getDisputeStatus = async (
  employeeId: string,
  disputeId: string
): Promise<Dispute> => {
  const response = await apiClient.get<{ data: Dispute }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/disputes/${disputeId}`
  );
  return response.data.data;
};

/**
 * Get dispute by ID (alias for getDisputeStatus)
 */
export const getDisputeById = async (
  employeeId: string,
  disputeId: string
): Promise<Dispute> => {
  return getDisputeStatus(employeeId, disputeId);
};

/**
 * Payroll Specialist reviews dispute
 * PATCH /payroll-tracking/specialist/:specialistId/disputes/:disputeId/review
 */
export const reviewDisputeBySpecialist = async (
  specialistId: string,
  disputeId: string,
  reviewData: ReviewDisputeRequest
): Promise<Dispute> => {
  const response = await apiClient.patch<{ data: Dispute }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/specialist/${specialistId}/disputes/${disputeId}/review`,
    reviewData
  );
  return response.data.data;
};

/**
 * Payroll Manager confirms dispute approval
 * PATCH /payroll-tracking/manager/:managerId/disputes/:disputeId/confirm
 */
export const confirmDisputeApprovalByManager = async (
  managerId: string,
  disputeId: string,
  reviewData: ReviewDisputeRequest
): Promise<Dispute> => {
  const response = await apiClient.patch<{ data: Dispute }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/manager/${managerId}/disputes/${disputeId}/confirm`,
    reviewData
  );
  return response.data.data;
};

/**
 * Finance staff views approved disputes
 * GET /payroll-tracking/finance/disputes/approved
 */
export const getApprovedDisputes = async (
  financeStaffId?: string
): Promise<Dispute[]> => {
  const params = new URLSearchParams();
  if (financeStaffId) params.append('financeStaffId', financeStaffId);

  const queryString = params.toString();
  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/finance/disputes/approved${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<{ data: Dispute[] }>(url);
  return response.data.data || [];
};
