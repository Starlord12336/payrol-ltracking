/**
 * Profile API functions
 * Handles employee/candidate profile operations
 * Module-specific API - only used within employee-profile module
 */

import { apiClient } from '@/shared/utils/api';
import { ENV } from '@/shared/constants';

export interface ProfileData {
  _id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  employeeNumber?: string;
  candidateNumber?: string;
  nationalId?: string;
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
  cvDocumentId?: string; // GridFS document ID for CV (candidates only)
  // Additional fields that may require change requests
  jobTitle?: string;
  department?: string;
  primaryPositionId?: string;
  primaryDepartmentId?: string;
  dateOfHire?: string;
  contractType?: string;
  status?: string;
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  processedAt?: string; // Backend uses processedAt instead of reviewedAt
  reviewedBy?: string;
  reviewedAt?: string; // May not be in backend response
  comments?: string;
}

export interface CreateChangeRequestDto {
  fieldName: string;
  oldValue: any;
  newValue: any;
  reason: string;
  requestDescription: string; // Required by backend
}

/**
 * Get current user's profile
 * Backend returns: { success: true, message: string, data: ProfileData }
 * Address might be nested as { address: { streetAddress, city, country } } or flat
 * fullName might need to be computed from firstName and lastName
 */
export const getMyProfile = async (): Promise<ProfileData> => {
  const response = await apiClient.get<{ success: boolean; message: string; data: ProfileData & { address?: { streetAddress?: string; city?: string; country?: string } } }>('/employee-profile/me');
  const profileData = response.data.data;
  
  // Handle nested address structure - flatten it to top level if needed
  if (profileData.address && !profileData.streetAddress) {
    profileData.streetAddress = profileData.address.streetAddress;
    profileData.city = profileData.address.city;
    profileData.country = profileData.address.country;
  }
  
  // Compute fullName from firstName and lastName if fullName is not provided
  if (!profileData.fullName && (profileData.firstName || profileData.lastName)) {
    const parts = [profileData.firstName, profileData.middleName, profileData.lastName].filter(Boolean);
    profileData.fullName = parts.length > 0 ? parts.join(' ') : undefined;
  }
  
  return profileData;
};

/**
 * Update profile picture
 * Accepts either GridFS file ID (24 hex characters) or external URL
 */
export const updateProfilePicture = async (profilePictureUrl: string): Promise<void> => {
  await apiClient.patch('/employee-profile/me/profile-picture', { profilePictureUrl });
};

/**
 * Upload profile picture file to GridFS
 * Returns GridFS file ID (24 hex characters)
 * Endpoint: POST /employee-profile/me/profile-picture/upload
 */
export const uploadProfilePicture = async (file: File): Promise<{ _id: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${ENV.API_URL}/employee-profile/me/profile-picture/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(errorData.message || 'Upload failed');
  }

  const result = await response.json();
  // Backend returns { _id: string } for GridFS file ID (24 hex characters)
  return result;
};

/**
 * Get GridFS file URL for display
 * If profilePictureUrl is a GridFS ID (24 hex), returns the GridFS download URL
 * Otherwise returns the URL as-is (external URL)
 * 
 * Backend endpoint: GET /employee-profile/me/profile-picture
 * This endpoint serves the current user's profile picture from their profile
 */
export const getProfilePictureUrl = (profilePictureUrl?: string): string | null => {
  if (!profilePictureUrl) return null;
  
  // Check if it's a GridFS ID (24 hex characters)
  const gridfsIdPattern = /^[0-9a-fA-F]{24}$/;
  if (gridfsIdPattern.test(profilePictureUrl)) {
    // Backend serves profile picture at /employee-profile/me/profile-picture
    // It looks up the GridFS ID from the user's profile automatically
    return `${ENV.API_URL}/employee-profile/me/profile-picture`;
  }
  
  // Otherwise it's an external URL
  return profilePictureUrl;
};

/**
 * Update biography
 * Backend returns: { success: true, message: string, data: ProfileData }
 */
export const updateBiography = async (biography: string): Promise<ProfileData> => {
  const response = await apiClient.patch<{ success: boolean; message: string; data: ProfileData }>(
    '/employee-profile/me',
    { biography }
  );
  // Return the updated profile data so components can use it
  return response.data.data;
};

/**
 * Update contact information
 */
export const updateContactInfo = async (data: {
  personalEmail?: string;
  workEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
}): Promise<void> => {
  await apiClient.patch('/employee-profile/me/contact', data);
};

/**
 * Update address
 * Backend returns: { success: true, message: string, data: { address: { streetAddress, city, country } } }
 */
export const updateAddress = async (data: {
  streetAddress?: string;
  city?: string;
  country?: string;
}): Promise<{ streetAddress?: string; city?: string; country?: string }> => {
  const response = await apiClient.patch<{ 
    success: boolean; 
    message: string; 
    data: { address: { streetAddress?: string; city?: string; country?: string } } 
  }>('/employee-profile/me/address', data);
  // Backend returns address in nested structure: { address: { streetAddress, city, country } }
  return response.data.data.address;
};

/**
 * Submit a change request for profile correction
 */
export const submitChangeRequest = async (data: CreateChangeRequestDto): Promise<ChangeRequest> => {
  const response = await apiClient.post<{ success: boolean; message: string; data: ChangeRequest }>(
    '/employee-profile/me/change-requests',
    data
  );
  return response.data.data;
};

/**
 * Get all change requests for current user
 */
export const getMyChangeRequests = async (): Promise<ChangeRequest[]> => {
  const response = await apiClient.get<{ success: boolean; message: string; data: ChangeRequest[] }>(
    '/employee-profile/me/change-requests'
  );
  return response.data.data;
};

export const profileApi = {
  getMyProfile,
  updateProfilePicture,
  uploadProfilePicture,
  getProfilePictureUrl,
  updateBiography,
  updateContactInfo,
  updateAddress,
  submitChangeRequest,
  getMyChangeRequests,
};

// Type for backend response wrapper
export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

