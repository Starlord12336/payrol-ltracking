/**
 * Claim Service
 * All API calls for expense claim-related endpoints
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type { Claim, CreateClaimRequest, ReviewClaimRequest } from './claim';

/**
 * Create an expense claim
 * POST /payroll-tracking/employee/:employeeId/claims
 */
export const createClaim = async (
  employeeId: string,
  claimData: CreateClaimRequest
): Promise<Claim> => {
  const response = await apiClient.post<{ data: Claim }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/claims`,
    claimData
  );
  return response.data.data;
};

/**
 * Get all claims for employee
 * GET /payroll-tracking/employee/:employeeId/claims
 */
export const getEmployeeClaims = async (employeeId: string): Promise<Claim[]> => {
  const response = await apiClient.get<{ data: Claim[] }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/claims`
  );
  return response.data.data || [];
};

/**
 * Get specific claim status
 * GET /payroll-tracking/employee/:employeeId/claims/:claimId
 */
export const getClaimStatus = async (
  employeeId: string,
  claimId: string
): Promise<Claim> => {
  const response = await apiClient.get<{ data: Claim }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/claims/${claimId}`
  );
  return response.data.data;
};

/**
 * Get claim by ID (alias for getClaimStatus)
 */
export const getClaimById = async (
  employeeId: string,
  claimId: string
): Promise<Claim> => {
  return getClaimStatus(employeeId, claimId);
};

/**
 * Payroll Specialist reviews claim
 * PATCH /payroll-tracking/specialist/:specialistId/claims/:claimId/review
 */
export const reviewClaimBySpecialist = async (
  specialistId: string,
  claimId: string,
  reviewData: ReviewClaimRequest
): Promise<Claim> => {
  const response = await apiClient.patch<{ data: Claim }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/specialist/${specialistId}/claims/${claimId}/review`,
    reviewData
  );
  return response.data.data;
};

/**
 * Payroll Manager confirms claim approval
 * PATCH /payroll-tracking/manager/:managerId/claims/:claimId/confirm
 */
export const confirmClaimApprovalByManager = async (
  managerId: string,
  claimId: string,
  reviewData: ReviewClaimRequest
): Promise<Claim> => {
  const response = await apiClient.patch<{ data: Claim }>(
    `${API_ENDPOINTS.PAYROLL_TRACKING}/manager/${managerId}/claims/${claimId}/confirm`,
    reviewData
  );
  return response.data.data;
};

/**
 * Finance staff views approved claims
 * GET /payroll-tracking/finance/claims/approved
 */
export const getApprovedClaims = async (
  financeStaffId?: string
): Promise<Claim[]> => {
  const params = new URLSearchParams();
  if (financeStaffId) params.append('financeStaffId', financeStaffId);

  const queryString = params.toString();
  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/finance/claims/approved${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<{ data: Claim[] }>(url);
  return response.data.data || [];
};

