/**
 * Authentication types matching backend implementation
 */

export type UserType = 'employee' | 'candidate';

export enum SystemRole {
  DEPARTMENT_EMPLOYEE = 'department employee',
  DEPARTMENT_HEAD = 'department head',
  HR_MANAGER = 'HR Manager',
  HR_EMPLOYEE = 'HR Employee',
  PAYROLL_SPECIALIST = 'Payroll Specialist',
  PAYROLL_MANAGER = 'Payroll Manager',
  SYSTEM_ADMIN = 'System Admin',
  LEGAL_POLICY_ADMIN = 'Legal & Policy Admin',
  RECRUITER = 'Recruiter',
  FINANCE_STAFF = 'Finance Staff',
  JOB_CANDIDATE = 'Job Candidate',
  HR_ADMIN = 'HR Admin',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  RETIRED = 'RETIRED',
  PROBATION = 'PROBATION',
  TERMINATED = 'TERMINATED',
}

export enum CandidateStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFER_SENT = 'OFFER_SENT',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

// DTOs matching backend
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nationalId: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  dateOfBirth?: string;
  mobilePhone?: string;
  userType?: UserType;
  // Employee-specific
  employeeNumber?: string;
  dateOfHire?: string;
  workEmail?: string;
  status?: EmployeeStatus;
  // Candidate-specific
  candidateNumber?: string;
  applicationDate?: string;
  candidateStatus?: CandidateStatus;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Response types
export interface AuthUser {
  userid: string;
  email: string;
  userType: UserType;
  roles: SystemRole[];
  employeeNumber?: string;
  candidateNumber?: string;
  nationalId: string;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  user: AuthUser;
}

export interface RegisterResponse {
  statusCode: number;
  message: string;
  userType: UserType;
}

export interface ChangePasswordResponse {
  statusCode: number;
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: string[];
}

