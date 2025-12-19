/**
 * Dispute Types
 * Based on backend disputes schema
 */

export enum DisputeStatus {
  UNDER_REVIEW = 'under review',
  PENDING_MANAGER_APPROVAL = 'pending payroll Manager approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Dispute {
  _id: string;
  disputeId: string; // e.g., DISP-0001
  description: string;
  employeeId: string;
  payslipId: string;
  status: DisputeStatus;
  rejectionReason?: string;
  resolutionComment?: string;
  payrollSpecialistId?: string;
  payrollManagerId?: string;
  financeStaffId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {
  description: string;
  payslipId: string;
}

export interface ReviewDisputeRequest {
  action: 'approve' | 'reject';
  comment?: string;
  rejectionReason?: string;
}
