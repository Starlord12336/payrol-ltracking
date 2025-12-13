import { Types } from 'mongoose';

export class DepartmentClearanceDto {
  terminationId: Types.ObjectId;
  department: string;
  status: string;
  comments?: string;
  updatedBy: Types.ObjectId;
}

export class ClearanceStatusUpdateDto {
  terminationId: Types.ObjectId;
  department: string;
  status: string;
  comments?: string;
  updatedBy: Types.ObjectId;
  updatedAt?: Date;
}

export class ClearanceStatusResponseDto {
  _id: string;
  terminationId: string;
  department: string;
  status: string;
  comments?: string;
  updatedBy: string;
  updatedAt: Date;
  message: string;
}

export class FullClearanceStatusDto {
  terminationId: string;
  employeeId: string;
  fullyClearedStatus: boolean;
  clearanceCompletion: number;
  departmentStatuses: {
    department: string;
    status: string;
    comments?: string;
    updatedBy?: string;
    updatedAt?: Date;
  }[];
  allApproved: boolean;
  pendingDepartments: string[];
  rejectedDepartments: string[];
  approvedDepartments: string[];
  lastUpdateTime?: Date;
}

export class BulkClearanceStatusDto {
  terminationId: Types.ObjectId;
  updates: Array<{
    department: string;
    status: string;
    comments?: string;
    updatedBy: Types.ObjectId;
  }>;
}

export class ClearanceHistoryDto {
  terminationId: string;
  department: string;
  statuses: Array<{
    status: string;
    updatedAt: Date;
    updatedBy: string;
    comments?: string;
  }>;
  currentStatus: string;
  lastUpdated: Date;
}
