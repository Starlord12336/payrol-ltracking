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
  employeeProfileId: string;
  employeeName?: string;
  requestType: string;
  fieldName: string;
  oldValue: any;
  newValue: any;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
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
 * Get pending change requests
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
  getPendingChangeRequests,
  updateChangeRequestStatus,
};

