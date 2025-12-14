/**
 * Organization Structure API functions
 * Handles all API calls for organization structure module
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type {
  CreateDepartmentDto,
  CreateDepartmentResponse,
  UpdateDepartmentDto,
  UpdateDepartmentResponse,
  DeleteDepartmentResponse,
  CreatePositionDto,
  CreatePositionResponse,
  UpdatePositionDto,
  UpdatePositionResponse,
  DeletePositionResponse,
  Department,
  Position,
  CreateChangeRequestDto,
  UpdateChangeRequestDto,
  ChangeRequest,
  CreateChangeRequestResponse,
  UpdateChangeRequestResponse,
  ChangeRequestsListResponse,
  OrgChartResponse,
  SimplifiedOrgChartResponse,
  ChangeLog,
  ChangeLogsListResponse,
} from '../types';
import { ChangeLogAction } from '../types';

/**
 * Create a new department
 */
export async function createDepartment(
  data: CreateDepartmentDto
): Promise<CreateDepartmentResponse> {
  const response = await apiClient.post<CreateDepartmentResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments`,
    data
  );
  return response.data;
}

/**
 * Get all departments
 */
export async function getDepartments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments`,
    { params }
  );
  return response.data;
}

/**
 * Get department by ID
 */
export async function getDepartmentById(id: string): Promise<{
  success: boolean;
  message: string;
  data: Department;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments/${id}`
  );
  return response.data;
}

/**
 * Get position by ID
 */
export async function getPositionById(id: string): Promise<{
  success: boolean;
  message: string;
  data: Position;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/${id}`
  );
  return response.data;
}

/**
 * Update a department
 */
export async function updateDepartment(
  id: string,
  data: UpdateDepartmentDto
): Promise<UpdateDepartmentResponse> {
  const response = await apiClient.put<UpdateDepartmentResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments/${id}`,
    data
  );
  return response.data;
}

/**
 * Get positions by department ID
 */
export async function getPositionsByDepartment(departmentId: string): Promise<{
  success: boolean;
  message: string;
  data: Position[];
  count: number;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/department/${departmentId}`
  );
  return response.data;
}

/**
 * Create a new position
 */
export async function createPosition(
  data: CreatePositionDto
): Promise<CreatePositionResponse> {
  const response = await apiClient.post<CreatePositionResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions`,
    data
  );
  return response.data;
}

/**
 * Get all positions
 */
export async function getPositions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  isActive?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  data: Position[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions`,
    { params }
  );
  return response.data;
}

/**
 * Update a position
 */
export async function updatePosition(
  id: string,
  data: UpdatePositionDto
): Promise<UpdatePositionResponse> {
  const response = await apiClient.put<UpdatePositionResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/${id}`,
    data
  );
  return response.data;
}

/**
 * Delete (deactivate) a position
 */
export async function deletePosition(
  id: string
): Promise<DeletePositionResponse> {
  const response = await apiClient.delete<DeletePositionResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/${id}`
  );
  return response.data;
}

/**
 * Delete (deactivate) a department
 */
export async function deleteDepartment(
  id: string
): Promise<DeleteDepartmentResponse> {
  const response = await apiClient.delete<DeleteDepartmentResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments/${id}`
  );
  return response.data;
}

/**
 * Assign department head position
 */
export async function assignDepartmentHead(
  departmentId: string,
  headPositionId: string | null
): Promise<UpdateDepartmentResponse> {
  const response = await apiClient.put<UpdateDepartmentResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments/${departmentId}/head`,
    { headPositionId }
  );
  return response.data;
}

/**
 * Assign reporting position
 */
/**
 * Check if an employee is a department head based on their position
 */
export async function checkIsDepartmentHead(
  employeeId: string
): Promise<{ success: boolean; isDepartmentHead: boolean }> {
  const response = await apiClient.get<{ success: boolean; isDepartmentHead: boolean }>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/employees/${employeeId}/is-department-head`
  );
  return response.data;
}

export async function assignReportingPosition(
  positionId: string,
  reportsToPositionId: string | null
): Promise<UpdatePositionResponse> {
  const response = await apiClient.put<UpdatePositionResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/${positionId}/reporting-position`,
    { reportsToPositionId }
  );
  return response.data;
}

/**
 * Get position hierarchy
 */
export async function getPositionHierarchy(positionId?: string): Promise<{
  success: boolean;
  message: string;
  data: any[];
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/hierarchy`,
    { params: positionId ? { positionId } : {} }
  );
  return response.data;
}

// =====================================
// CHANGE REQUEST ENDPOINTS
// =====================================

/**
 * Create a new change request
 */
export async function createChangeRequest(
  data: CreateChangeRequestDto
): Promise<CreateChangeRequestResponse> {
  console.log('API: Creating change request with payload:', JSON.stringify(data, null, 2));
  const response = await apiClient.post<CreateChangeRequestResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests`,
    data
  );
  return response.data;
}

/**
 * Get all change requests
 */
export async function getChangeRequests(params?: {
  page?: number;
  limit?: number;
  requestNumber?: string;
  requestType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ChangeRequestsListResponse> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests`,
    { params }
  );
  return response.data;
}

/**
 * Get change request by ID
 */
export async function getChangeRequestById(id: string): Promise<{
  success: boolean;
  message: string;
  data: ChangeRequest;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests/${id}`
  );
  return response.data;
}

/**
 * Get change request by request number
 */
export async function getChangeRequestByNumber(requestNumber: string): Promise<{
  success: boolean;
  message: string;
  data: ChangeRequest;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests/number/${requestNumber}`
  );
  return response.data;
}

/**
 * Update change request (draft only)
 */
export async function updateChangeRequest(
  id: string,
  data: UpdateChangeRequestDto
): Promise<UpdateChangeRequestResponse> {
  const response = await apiClient.put<UpdateChangeRequestResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests/${id}`,
    data
  );
  return response.data;
}

/**
 * Submit change request for review
 */
export async function submitChangeRequest(id: string): Promise<{
  success: boolean;
  message: string;
  data: ChangeRequest;
}> {
  const response = await apiClient.post(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests/${id}/submit`
  );
  return response.data;
}

/**
 * Review change request (approve or reject)
 */
export async function reviewChangeRequest(
  id: string,
  approved: boolean,
  comments?: string
): Promise<{
  success: boolean;
  message: string;
  data: ChangeRequest;
}> {
  const response = await apiClient.post(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests/${id}/review`,
    { approved, comments }
  );
  return response.data;
}

/**
 * Approve change request (System Admin only)
 */
export async function approveChangeRequest(
  id: string,
  comments?: string
): Promise<{
  success: boolean;
  message: string;
  data: ChangeRequest;
}> {
  const response = await apiClient.post(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests/${id}/approve`,
    { comments }
  );
  return response.data;
}

/**
 * Reject change request
 */
export async function rejectChangeRequest(
  id: string,
  reason: string
): Promise<{
  success: boolean;
  message: string;
  data: ChangeRequest;
}> {
  const response = await apiClient.post(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests/${id}/reject`,
    { reason }
  );
  return response.data;
}

/**
 * Cancel change request
 */
export async function cancelChangeRequest(id: string): Promise<{
  success: boolean;
  message: string;
  data: ChangeRequest;
}> {
  const response = await apiClient.delete(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/change-requests/${id}`
  );
  return response.data;
}

// =====================================
// ORGANIZATION CHART ENDPOINTS
// =====================================

/**
 * Get full organization chart
 */
export async function getOrgChart(): Promise<OrgChartResponse> {
  const response = await apiClient.get<OrgChartResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/org-chart`
  );
  return response.data;
}

/**
 * Get department-specific organization chart
 */
export async function getDepartmentOrgChart(departmentId: string): Promise<OrgChartResponse> {
  const response = await apiClient.get<OrgChartResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/org-chart/department/${departmentId}`
  );
  return response.data;
}

/**
 * Get simplified organization chart
 */
export async function getSimplifiedOrgChart(): Promise<SimplifiedOrgChartResponse> {
  const response = await apiClient.get<SimplifiedOrgChartResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/org-chart/simplified`
  );
  return response.data;
}

/**
 * Export organization chart as JSON
 */
export async function exportOrgChartJson(departmentId?: string): Promise<void> {
  const url = departmentId
    ? `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/org-chart/export/json?departmentId=${departmentId}`
    : `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/org-chart/export/json`;
  
  const response = await apiClient.get(url, {
    responseType: 'blob',
  });

  // Create download link
  const blob = new Blob([response.data], { type: 'application/json' });
  const url_blob = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url_blob;
  link.download = `org-chart-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url_blob);
}

/**
 * Export organization chart as CSV
 */
export async function exportOrgChartCsv(departmentId?: string): Promise<void> {
  const url = departmentId
    ? `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/org-chart/export/csv?departmentId=${departmentId}`
    : `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/org-chart/export/csv`;
  
  const response = await apiClient.get(url, {
    responseType: 'blob',
  });

  // Create download link
  const blob = new Blob([response.data], { type: 'text/csv' });
  const url_blob = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url_blob;
  link.download = `org-chart-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url_blob);
}

/**
 * Get audit logs (change history)
 */
export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  action?: ChangeLogAction;
  entityType?: 'Department' | 'Position';
  entityId?: string;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ChangeLogsListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.action) queryParams.append('action', params.action);
  if (params?.entityType) queryParams.append('entityType', params.entityType);
  if (params?.entityId) queryParams.append('entityId', params.entityId);
  if (params?.performedBy) queryParams.append('performedBy', params.performedBy);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const response = await apiClient.get<ChangeLogsListResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/audit-logs?${queryParams.toString()}`
  );
  return response.data;
}

