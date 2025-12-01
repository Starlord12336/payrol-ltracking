import { Types } from 'mongoose';

/**
 * DTO for submitting a resignation request
 * OFF-018: Employee submits resignation with reasoning
 */
export class SubmitResignationRequestDto {
  employeeId: Types.ObjectId;
  resignationReason: string;
  lastWorkingDay?: Date;
  noticePeriodinDays?: number;
  additionalComments?: string;
  attachments?: string[];
}

/**
 * DTO for resignation request response
 */
export class ResignationRequestResponseDto {
  _id: string;
  employeeId: string;
  resignationReason: string;
  lastWorkingDay?: Date;
  noticePeriodinDays?: number;
  additionalComments?: string;
  attachments?: string[];
  status: string;
  submittedAt: Date;
  submittedBy: string;
  message?: string;
}

/**
 * DTO for tracking resignation status
 * OFF-019: Employee tracks resignation request status
 */
export class ResignationStatusDto {
  _id: string;
  employeeId: string;
  resignationId: string;
  status: string; // pending, under_review, approved, rejected
  currentStage: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  approvalDate?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  rejectionDate?: Date;
  rejectedBy?: string;
  message?: string;
}

/**
 * DTO for resignation history and audit trail
 */
export class ResignationHistoryDto {
  resignationId: string;
  employeeId: string;
  resignationReason: string;
  lastWorkingDay?: Date;
  noticePeriodinDays?: number;
  statusTimeline: Array<{
    status: string;
    changedAt: Date;
    changedBy: string;
    comments?: string;
  }>;
  currentStatus: string;
  submittedAt: Date;
  finalizedAt?: Date;
  totalDaysInProcess?: number;
}

/**
 * DTO for update resignation status
 */
export class UpdateResignationStatusDto {
  resignationId: Types.ObjectId;
  status: string;
  comments?: string;
  updatedBy: Types.ObjectId;
  approvalDate?: Date;
  rejectionReason?: string;
}

/**
 * DTO for resignation request summary
 */
export class ResignationSummaryDto {
  _id: string;
  employeeId: string;
  employeeName?: string;
  resignationReason: string;
  lastWorkingDay?: Date;
  status: string;
  submittedAt: Date;
  daysInProcess: number;
}

/**
 * DTO for bulk resignation tracking
 */
export class BulkResignationStatusDto {
  resignationIds: Types.ObjectId[];
  status: string;
  comments?: string;
  updatedBy: Types.ObjectId;
}

/**
 * DTO for employee resignation list
 */
export class EmployeeResignationListDto {
  employeeId: string;
  resignations: Array<{
    _id: string;
    resignationReason: string;
    status: string;
    submittedAt: Date;
    lastWorkingDay?: Date;
    approvalDate?: Date;
  }>;
  totalResignations: number;
  pendingResignations: number;
  approvedResignations: number;
  rejectedResignations: number;
}

/**
 * DTO for resignation request with full details
 */
export class ResignationRequestFullDto {
  _id: string;
  employeeId: string;
  resignationReason: string;
  lastWorkingDay?: Date;
  noticePeriodinDays?: number;
  additionalComments?: string;
  attachments?: string[];
  status: string;
  currentStage: string;
  submittedAt: Date;
  submittedBy: string;
  reviewedAt?: Date;
  reviewedBy?: string;
  approvalDate?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  rejectionDate?: Date;
  rejectedBy?: string;
  statusHistory: Array<{
    status: string;
    changedAt: Date;
    changedBy: string;
    comments?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
