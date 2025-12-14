/**
 * Organization Structure Module Types
 * Define types specific to this module
 */

// Department Types
export interface CreateDepartmentDto {
  code: string; // Required, 2-10 characters, unique
  name: string; // Required, 2-100 characters
  description?: string; // Optional, max 500 characters
  headPositionId?: string; // Optional, MongoDB ObjectId
  costCenter?: string; // Optional, max 50 characters
}

export interface UpdateDepartmentDto {
  code?: string;
  name?: string;
  description?: string;
  headPositionId?: string;
  costCenter?: string;
  isActive?: boolean;
}

export interface Department {
  _id: string;
  code: string;
  name: string;
  description?: string;
  headPositionId?: string;
  costCenter?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Position Types
export interface CreatePositionDto {
  code: string; // Required, 2-20 characters, unique
  title: string; // Required, 2-100 characters
  description?: string; // Optional, max 1000 characters
  departmentId: string; // Required, MongoDB ObjectId
  reportsToPositionId?: string; // Optional, MongoDB ObjectId
}

export interface Position {
  _id: string;
  code: string;
  title: string;
  description?: string;
  departmentId: string;
  reportsToPositionId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface CreateDepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

export interface UpdateDepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

export interface UpdatePositionDto {
  code?: string;
  title?: string;
  description?: string;
  departmentId?: string;
  reportsToPositionId?: string;
  isActive?: boolean;
  headcountBudget?: number;
  currentHeadcount?: number;
}

export interface CreatePositionResponse {
  success: boolean;
  message: string;
  data: Position;
}

export interface UpdatePositionResponse {
  success: boolean;
  message: string;
  data: Position;
}

export interface DeletePositionResponse {
  success: boolean;
  message: string;
  data: Position;
}

export interface DeleteDepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

// Change Request Types
export enum ChangeRequestType {
  NEW_DEPARTMENT = 'NEW_DEPARTMENT',
  UPDATE_DEPARTMENT = 'UPDATE_DEPARTMENT',
  NEW_POSITION = 'NEW_POSITION',
  UPDATE_POSITION = 'UPDATE_POSITION',
  CLOSE_POSITION = 'CLOSE_POSITION',
}

export enum ChangeRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  IMPLEMENTED = 'IMPLEMENTED',
}

export interface CreateChangeRequestDto {
  requestType: ChangeRequestType;
  targetDepartmentId?: string;
  targetPositionId?: string;
  details?: string;
  reason?: string;
}

export interface UpdateChangeRequestDto {
  requestType?: ChangeRequestType;
  targetDepartmentId?: string;
  targetPositionId?: string;
  details?: string;
  reason?: string;
  status?: ChangeRequestStatus;
}

export interface ChangeRequest {
  _id: string;
  requestNumber: string;
  requestType: ChangeRequestType;
  status: ChangeRequestStatus;
  targetDepartmentId?: string;
  targetPositionId?: string;
  details?: string;
  reason?: string;
  requestedByEmployeeId: string;
  requestedByEmployee?: {
    firstName?: string;
    lastName?: string;
  };
  submittedByEmployeeId?: string;
  submittedByEmployee?: {
    firstName?: string;
    lastName?: string;
  };
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChangeRequestResponse {
  success: boolean;
  message: string;
  data: ChangeRequest;
}

export interface UpdateChangeRequestResponse {
  success: boolean;
  message: string;
  data: ChangeRequest;
}

export interface ChangeRequestsListResponse {
  success: boolean;
  message: string;
  data: ChangeRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Organization Chart Types
export interface PositionNode {
  id: string;
  code: string;
  title: string;
  description?: string;
  departmentId: string;
  reportsToPositionId?: string;
  isActive: boolean;
  children?: PositionNode[];
}

export interface DepartmentChart {
  department: {
    id: string;
    code: string;
    name: string;
    description?: string;
    headPositionId?: string;
    isActive: boolean;
  };
  positions: PositionNode[];
  statistics: {
    totalPositions: number;
    filledPositions: number;
    vacantPositions: number;
  };
}

export interface OrgChartResponse {
  success: boolean;
  data: {
    generatedAt: string;
    departments: DepartmentChart[];
    totalDepartments: number;
  };
}

export interface SimplifiedPosition {
  id: string;
  code: string;
  title: string;
  reportsToPositionId?: string;
}

export interface SimplifiedDepartmentChart {
  department: {
    id: string;
    code: string;
    name: string;
    headPositionId?: string;
  };
  positions: SimplifiedPosition[];
}

export interface SimplifiedOrgChartResponse {
  success: boolean;
  data: {
    generatedAt: string;
    departments: SimplifiedDepartmentChart[];
  };
}

// Audit Log Types
export enum ChangeLogAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DEACTIVATED = 'DEACTIVATED',
  REASSIGNED = 'REASSIGNED',
}

export interface ChangeLog {
  _id: string;
  action: ChangeLogAction;
  entityType: 'Department' | 'Position';
  entityId: string;
  performedByEmployeeId?: string;
  performedByEmployee?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  summary?: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeLogsListResponse {
  success: boolean;
  message: string;
  data: ChangeLog[];
  total: number;
  page: number;
  totalPages: number;
}
