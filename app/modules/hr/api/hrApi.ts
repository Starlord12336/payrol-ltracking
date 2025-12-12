/**
 * HR API functions
 * Handles HR Admin and HR Manager operations
 */

import { apiClient } from '@/shared/utils/api';

export interface EmployeeProfile {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  employeeNumber?: string;
  candidateNumber?: string;
  nationalId: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  personalEmail?: string;
  workEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
  streetAddress?: string;
  city?: string;
  country?: string;
  biography?: string;
  profilePictureUrl?: string;
  status?: string;
  contractType?: string;
  workType?: string;
  dateOfHire?: string;
  department?: string;
  position?: string;
  payGrade?: string;
}

export interface ChangeRequest {
  _id: string;
  requestId?: string; // Backend returns this
  employeeProfileId: string;
  employeeName?: string;
  requestType?: string; // May not be in backend response
  fieldName?: string; // Not stored separately, parsed from requestDescription
  oldValue?: any; // Not stored separately, parsed from requestDescription
  newValue?: any; // Not stored separately, parsed from requestDescription
  reason?: string;
  requestDescription?: string; // Contains: Field, Current Value, Corrected Value, Additional Details
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
  submittedAt: string;
  processedAt?: string; // Backend uses processedAt instead of reviewedAt
  reviewedBy?: string;
  reviewedAt?: string; // May not be in backend response
  comments?: string;
}

export interface SearchFilters {
  fullName?: string;
  nationalId?: string;
  email?: string;
  phone?: string;
  status?: string;
  contractType?: string;
  workType?: string;
  department?: string;
  position?: string;
  payGrade?: string;
}

/**
 * Get all employees
 */
export const getAllEmployees = async (): Promise<EmployeeProfile[]> => {
  const response = await apiClient.get<{ success: boolean; message: string; data: EmployeeProfile[] }>('/employee-profile');
  return response.data.data;
};

/**
 * Search employees with filters
 */
export const searchEmployees = async (filters: SearchFilters): Promise<EmployeeProfile[]> => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value.toString());
    }
  });
  
  const response = await apiClient.get<{ success: boolean; message: string; data: EmployeeProfile[] }>(
    `/employee-profile/search?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id: string): Promise<EmployeeProfile> => {
  const response = await apiClient.get<{ success: boolean; message: string; data: EmployeeProfile }>(`/employee-profile/${id}`);
  return response.data.data;
};

/**
 * Update employee profile (HR edit)
 */
export const updateEmployeeAsHr = async (id: string, data: Partial<EmployeeProfile>): Promise<EmployeeProfile> => {
  const response = await apiClient.patch<{ success: boolean; message: string; data: EmployeeProfile }>(
    `/employee-profile/${id}/hr`,
    data
  );
  return response.data.data;
};

/**
 * Get team profiles (Manager/HR)
 */
export const getTeamProfiles = async (): Promise<EmployeeProfile[]> => {
  const response = await apiClient.get<{ success: boolean; message: string; data: EmployeeProfile[] }>(
    '/employee-profile/team'
  );
  return response.data.data;
};

/**
 * Get pending change requests
 * Backend returns requests with requestDescription that needs parsing
 */
export const getPendingChangeRequests = async (): Promise<ChangeRequest[]> => {
  const response = await apiClient.get<{ success: boolean; message: string; data: ChangeRequest[] }>(
    '/employee-profile/hr/change-requests/pending'
  );
  return response.data.data;
};

/**
 * Update change request status (approve/reject)
 */
export const updateChangeRequestStatus = async (
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
  comments?: string
): Promise<ChangeRequest> => {
  const response = await apiClient.patch<{ success: boolean; message: string; data: ChangeRequest }>(
    `/employee-profile/hr/change-requests/${requestId}/status`,
    { status, comments }
  );
  return response.data.data;
};

export const hrApi = {
  getAllEmployees,
  searchEmployees,
  getEmployeeById,
  updateEmployeeAsHr,
  getTeamProfiles,
  getPendingChangeRequests,
  updateChangeRequestStatus,
};

