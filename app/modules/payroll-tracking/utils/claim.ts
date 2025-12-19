/**
 * Claim Types
 * Based on backend claims schema
 */

export enum ClaimStatus {
  UNDER_REVIEW = 'under review',
  PENDING_MANAGER_APPROVAL = 'pending payroll Manager approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Claim {
  _id: string;
  claimId: string; // e.g., CLAIM-0001
  description: string;
  claimType: string;
  employeeId: string;
  amount: number;
  approvedAmount?: number;
  status: ClaimStatus;
  rejectionReason?: string;
  resolutionComment?: string;
  payrollSpecialistId?: string;
  payrollManagerId?: string;
  financeStaffId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaimRequest {
  description: string;
  claimType: string;
  amount: number;
}

export interface ReviewClaimRequest {
  action: 'approve' | 'reject';
  comment?: string;
  approvedAmount?: number;
  rejectionReason?: string;
}

