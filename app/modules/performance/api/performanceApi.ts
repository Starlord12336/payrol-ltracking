/**
 * Performance API functions
 * Handles performance appraisal operations
 * Module-specific API - only used within performance module
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type {
  AppraisalTemplate,
  CreateAppraisalTemplateDto,
  UpdateAppraisalTemplateDto,
  AppraisalAssignment,
  CreateAppraisalAssignmentDto,
  BulkAssignTemplateDto,
  UpdateAppraisalAssignmentDto,
  AppraisalCycle,
  CreateAppraisalCycleDto,
} from '../types';

/**
 * Get all appraisal templates
 * Backend returns data directly (not wrapped)
 */
export const getTemplates = async (isActive?: boolean): Promise<AppraisalTemplate[]> => {
  const params = isActive !== undefined ? { isActive: String(isActive) } : {};
  const response = await apiClient.get<AppraisalTemplate[] | { success: boolean; message: string; data: AppraisalTemplate[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/templates`,
    { params }
  );
  // Handle both wrapped and unwrapped responses
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get a single template by ID
 * Backend returns data directly (not wrapped)
 */
export const getTemplateById = async (id: string): Promise<AppraisalTemplate> => {
  const response = await apiClient.get<AppraisalTemplate | { success: boolean; message: string; data: AppraisalTemplate }>(
    `${API_ENDPOINTS.PERFORMANCE}/templates/${id}`
  );
  // Handle both wrapped and unwrapped responses
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalTemplate;
  }
  return (response.data as any).data;
};

/**
 * Create a new appraisal template
 * Backend returns data directly (not wrapped)
 */
export const createTemplate = async (data: CreateAppraisalTemplateDto): Promise<AppraisalTemplate> => {
  const response = await apiClient.post<AppraisalTemplate | { success: boolean; message: string; data: AppraisalTemplate }>(
    `${API_ENDPOINTS.PERFORMANCE}/templates`,
    data
  );
  // Handle both wrapped and unwrapped responses
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalTemplate;
  }
  return (response.data as any).data;
};

/**
 * Update an existing template
 * Backend returns data directly (not wrapped)
 */
export const updateTemplate = async (
  id: string,
  data: UpdateAppraisalTemplateDto
): Promise<AppraisalTemplate> => {
  const response = await apiClient.put<AppraisalTemplate | { success: boolean; message: string; data: AppraisalTemplate }>(
    `${API_ENDPOINTS.PERFORMANCE}/templates/${id}`,
    data
  );
  // Handle both wrapped and unwrapped responses
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalTemplate;
  }
  return (response.data as any).data;
};

/**
 * Delete a template
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.PERFORMANCE}/templates/${id}`);
};

/**
 * Get all appraisal cycles
 */
export const getCycles = async (status?: string): Promise<AppraisalCycle[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get<AppraisalCycle[] | { success: boolean; message: string; data: AppraisalCycle[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles`,
    { params }
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Create a new appraisal cycle
 */
export const createCycle = async (data: CreateAppraisalCycleDto): Promise<AppraisalCycle> => {
  const response = await apiClient.post<AppraisalCycle | { success: boolean; message: string; data: AppraisalCycle }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles`,
    data
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalCycle;
  }
  return (response.data as any).data;
};

/**
 * Get all assignments with optional filters
 */
export const getAssignments = async (filters?: {
  cycleId?: string;
  templateId?: string;
  employeeProfileId?: string;
  managerProfileId?: string;
  departmentId?: string;
  status?: string;
}): Promise<AppraisalAssignment[]> => {
  const params: any = {};
  if (filters?.cycleId) params.cycleId = filters.cycleId;
  if (filters?.templateId) params.templateId = filters.templateId;
  if (filters?.employeeProfileId) params.employeeProfileId = filters.employeeProfileId;
  if (filters?.managerProfileId) params.managerProfileId = filters.managerProfileId;
  if (filters?.departmentId) params.departmentId = filters.departmentId;
  if (filters?.status) params.status = filters.status;

  const response = await apiClient.get<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments`,
    { params }
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get a single assignment by ID
 */
export const getAssignmentById = async (id: string): Promise<AppraisalAssignment> => {
  const response = await apiClient.get<AppraisalAssignment | { success: boolean; message: string; data: AppraisalAssignment }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments/${id}`
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalAssignment;
  }
  return (response.data as any).data;
};

/**
 * Manually assign template to employee(s)
 */
export const assignTemplateToEmployees = async (data: CreateAppraisalAssignmentDto): Promise<AppraisalAssignment[]> => {
  const response = await apiClient.post<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments`,
    data
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Bulk assign template
 */
export const bulkAssignTemplate = async (data: BulkAssignTemplateDto): Promise<AppraisalAssignment[]> => {
  const response = await apiClient.post<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments/bulk`,
    data
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Update an assignment
 */
export const updateAssignment = async (
  id: string,
  data: UpdateAppraisalAssignmentDto
): Promise<AppraisalAssignment> => {
  const response = await apiClient.put<AppraisalAssignment | { success: boolean; message: string; data: AppraisalAssignment }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments/${id}`,
    data
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalAssignment;
  }
  return (response.data as any).data;
};

/**
 * Remove an assignment
 */
export const removeAssignment = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.PERFORMANCE}/assignments/${id}`);
};

/**
 * Get assignments for an employee
 */
export const getEmployeeAssignments = async (employeeId: string, cycleId?: string): Promise<AppraisalAssignment[]> => {
  const params: any = {};
  if (cycleId) params.cycleId = cycleId;
  
  console.log('API: getEmployeeAssignments called with:', { employeeId, cycleId, params });
  
  const response = await apiClient.get<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/employees/${employeeId}/assignments`,
    { params }
  );
  
  console.log('API: getEmployeeAssignments response:', response.data);
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get assignments for a manager (their direct reports)
 */
export const getManagerAssignments = async (managerId: string, cycleId?: string): Promise<AppraisalAssignment[]> => {
  const params: any = {};
  if (cycleId) params.cycleId = cycleId;
  
  console.log('API: getManagerAssignments called with:', { managerId, cycleId, params });
  
  const response = await apiClient.get<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/managers/${managerId}/assignments`,
    { params }
  );
  
  console.log('API: getManagerAssignments response:', response.data);
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get assignment by employee and cycle
 */
export const getEmployeeAssignmentByCycle = async (cycleId: string, employeeId: string): Promise<AppraisalAssignment> => {
  const response = await apiClient.get<AppraisalAssignment | { success: boolean; message: string; data: AppraisalAssignment }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/employees/${employeeId}/assignment`
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalAssignment;
  }
  return (response.data as any).data;
};

/**
 * Submit self-assessment
 */
export const submitSelfAssessment = async (
  cycleId: string,
  employeeId: string,
  data: {
    sections: Array<{
      sectionId: string;
      sectionScore?: number;
      criteria: Array<{
        criteriaId: string;
        rating?: number;
        comments?: string;
      }>;
    }>;
    overallComments?: string;
  }
): Promise<any> => {
  const response = await apiClient.post(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/employees/${employeeId}/self-assessment`,
    data
  );
  return response.data;
};

/**
 * Get evaluation by cycle and employee
 */
export const getEvaluationByCycleAndEmployee = async (
  cycleId: string,
  employeeId: string
): Promise<any> => {
  const response = await apiClient.get(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/employees/${employeeId}/evaluation`
  );
  return response.data;
};

/**
 * Submit manager evaluation
 */
export const submitManagerEvaluation = async (
  cycleId: string,
  employeeId: string,
  data: {
    cycleId: string;
    templateId: string;
    employeeId: string;
    reviewerId: string;
    managerEvaluation: {
      sections: Array<{
        sectionId: string;
        sectionScore?: number;
        criteria: Array<{
          criteriaId: string;
          rating?: number;
          comments?: string;
        }>;
      }>;
      overallRating?: number;
      strengths?: string;
      areasForImprovement?: string;
      developmentRecommendations?: string;
      attendanceScore?: number;
      punctualityScore?: number;
      attendanceComments?: string;
    };
    finalRating: number;
  }
): Promise<any> => {
  const response = await apiClient.post(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/employees/${employeeId}/evaluation`,
    data
  );
  return response.data;
};

export const performanceApi = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getCycles,
  createCycle,
  getAssignments,
  getAssignmentById,
  assignTemplateToEmployees,
  bulkAssignTemplate,
  updateAssignment,
  removeAssignment,
  getEmployeeAssignments,
  getEmployeeAssignmentByCycle,
  getManagerAssignments,
  submitSelfAssessment,
  getEvaluationByCycleAndEmployee,
  submitManagerEvaluation,
};

