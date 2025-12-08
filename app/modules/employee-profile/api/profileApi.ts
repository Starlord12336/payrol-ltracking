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
}

/**
 * Get current user's profile
 * Backend returns: { success: true, message: string, data: ProfileData }
 */
export const getMyProfile = async (): Promise<ProfileData> => {
  const response = await apiClient.get<{ success: boolean; message: string; data: ProfileData }>('/employee-profile/me');
  // Backend wraps the data in a response object, so we need to extract the nested data
  return response.data.data;
};

/**
 * Update profile picture URL
 */
export const updateProfilePicture = async (profilePictureUrl: string): Promise<void> => {
  await apiClient.patch('/employee-profile/me/profile-picture', { profilePictureUrl });
};

/**
 * Upload profile picture file
 */
export const uploadProfilePicture = async (file: File): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${ENV.API_URL}/employee-profile/me/upload-picture`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(errorData.message || 'Upload failed');
  }

  return response.json();
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
 */
export const updateAddress = async (data: {
  streetAddress?: string;
  city?: string;
  country?: string;
}): Promise<void> => {
  await apiClient.patch('/employee-profile/me/address', data);
};

export const profileApi = {
  getMyProfile,
  updateProfilePicture,
  uploadProfilePicture,
  updateBiography,
  updateContactInfo,
  updateAddress,
};

// Type for backend response wrapper
export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

