/**
 * Common types used across all modules
 */

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

