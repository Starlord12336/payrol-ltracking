/**
 * Refund Types
 * Based on backend refunds schema
 */

export enum RefundStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

export interface RefundDetails {
  description: string;
  amount: number;
}

export interface Refund {
  _id: string;
  claimId?: string;
  disputeId?: string;
  refundDetails: RefundDetails;
  employeeId: string;
  financeStaffId?: string;
  status: RefundStatus;
  paidInPayrollRunId?: string;
  createdAt?: string;
  updatedAt?: string;
}

