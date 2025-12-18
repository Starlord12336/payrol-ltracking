import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';

import type {
  EmployeePayrollDetails,
  Penalty,
  EmployeePenalties,
  EmployeeSigningBonus,
  ReviewBonusDto,
  EmployeeTerminationResignation,
  ReviewBenefitDto,
  PayrollRuns,
  CreatePayrollRunDto,
  EditPayrollPeriodDto,
  UnfreezePayrollDto,
  RejectPayrollDto,
  ApprovePayrollDto,
  EditEmployeePayrollDetailDto,
  Earnings,
  Deductions,
  PaySlip
} from '../types';


const BASE_URL = API_ENDPOINTS.PAYROLL_EXECUTION;

export const payrollrunApi = {
  /**
   * Get all payroll runs with optional filtering *
   */
  getPayrollRuns: async (): Promise<PayrollRuns[]> => {
    const response = await apiClient.get<PayrollRuns[]>(`${BASE_URL}/runs`);
    return response.data;
  },

  /**
   * Get a single payroll run by ID *
   */
  getPayrollRunById: async (id: string): Promise<PayrollRuns> => {
    const response = await apiClient.get<PayrollRuns>(`${BASE_URL}/runs/${id}`);
    return response.data;
  },

  /**
   * Create a new payroll run * 
   */
  createPayrollRun: async (data: CreatePayrollRunDto): Promise<PayrollRuns> => {
    const response = await apiClient.post<PayrollRuns>(`${BASE_URL}/runs`, data);
    return response.data;
  },

  /**
   * Edit payroll period for a payroll run *
   */
  editPayrollPeriod: async (id: string, data: EditPayrollPeriodDto): Promise<PayrollRuns> => {
    const response = await apiClient.patch<PayrollRuns>(`${BASE_URL}/runs/${id}/period`, data);
    return response.data;
  },

  /**
   * Unfreeze a payroll run *
   */
  unfreezePayroll: async (id: string, data: UnfreezePayrollDto): Promise<any> => {
    const response = await apiClient.post(`${BASE_URL}/runs/${id}/unfreeze`, data);
    return response.data;
  },

  /**
   * Reject a payroll run *
   */
  rejectPayroll: async (id: string, data: RejectPayrollDto): Promise<any> => {
    const response = await apiClient.post(`${BASE_URL}/runs/${id}/reject`, data);
    return response.data;
  },


  /**
   * Generate payroll draft for a run *
   */
  generatePayrollDraft: async (id: string): Promise<any> => {
    const response = await apiClient.post(`${BASE_URL}/runs/${id}/generate-draft`);
    return response.data;
  },

  /**
   * Get all employee payroll details for a run (optionally filtered by employeeId) *
   */
  getEmployeePayrollDetails: async (
    id: string,
    employeeId?: string
  ): Promise<EmployeePayrollDetails[] | EmployeePayrollDetails> => {
    const params = employeeId ? { employeeId } : undefined;
    const response = await apiClient.get<EmployeePayrollDetails[] | EmployeePayrollDetails>(
      `${BASE_URL}/runs/${id}/employee-details`,
      params ? { params } : undefined
    );
    return response.data;
  },


  /**
   * Get all employee signing bonuses
   */
  getAllSigningBonuses: async (): Promise<EmployeeSigningBonus[]> => {
    const response = await apiClient.get<EmployeeSigningBonus[]>(
      `${BASE_URL}/signing-bonuses`
    );
    return response.data;
  },

  /**
   * Review a signing bonus (by bonus ID)
   */
  reviewSigningBonus: async (
    id: string,
    data: ReviewBonusDto
  ): Promise<any> => {
    const response = await apiClient.post(
      `${BASE_URL}/signing-bonuses/${id}/review`,
      data
    );
    return response.data;
  },

  /**
   * Edit the given amount of a signing bonus
   */
  editSigningBonusAmount: async (
    id: string,
    newAmount: number
  ): Promise<any> => {
    const response = await apiClient.patch(
      `${BASE_URL}/signing-bonuses/${id}/given-amount`,
      { newAmount }
    );
    return response.data;
  },

  /**
   * Process signing bonus for new hire (by employeeId)
   */
  processSigningBonusForNewHire: async (
    employeeId: string
  ): Promise<any> => {
    const response = await apiClient.post(
      `${BASE_URL}/signing-bonuses/process-new-hire/${employeeId}`
    );
    return response.data;
  },


  /**
   * Get all employee termination benefits
   */
  getAllTerminationBenefits: async (): Promise<EmployeeTerminationResignation[]> => {
    const response = await apiClient.get<EmployeeTerminationResignation[]>(
      `${BASE_URL}/termination-benefits`
    );
    return response.data;
  },

  /**
   * Review a termination or resignation benefit (by benefit ID)
   */
  reviewTerminationBenefit: async (
    id: string,
    data: ReviewBenefitDto
  ): Promise<any> => {
    const response = await apiClient.post(
      `${BASE_URL}/termination-benefits/${id}/review`,
      data
    );
    return response.data;
  },

  /**
   * Edit the given amount of a termination/resignation benefit
   */
  editTerminationBenefitAmount: async (
    id: string,
    newAmount: number
  ): Promise<any> => {
    const response = await apiClient.patch(
      `${BASE_URL}/termination-benefits/${id}/given-amount`,
      { newAmount }
    );
    return response.data;
  },

  /**
   * Process termination/resignation benefits for an employee (auto-calculate and create)
   */
  processTerminationBenefits: async (
    employeeId: string,
    terminationType: 'resignation' | 'termination'
  ): Promise<any> => {
    const response = await apiClient.post(
      `${BASE_URL}/termination-benefits/process/${employeeId}`,
      { terminationType }
    );
    return response.data;
  },

  /**
   * Freeze a payroll run
   */
  freezePayroll: async (
    id: string,
    managerId: string
  ): Promise<any> => {
    const response = await apiClient.post(
      `${BASE_URL}/runs/${id}/freeze`,
      { managerId }
    );
    return response.data;
  },

  /**
   * Submit payroll run for review
   */
  submitForReview: async (id: string, specialistId: string): Promise<any> => {
    const response = await apiClient.post(
      `${BASE_URL}/runs/${id}/submit-for-review`,
      { specialistId }
    );
    return response.data;
  },

  /**
   * Approve payroll run by manager
   */
  approveByManager: async (id: string, approveDto: ApprovePayrollDto): Promise<any> => {
    const response = await apiClient.post(
      `${BASE_URL}/runs/${id}/approve-manager`,
      approveDto
    );
    return response.data;
  },

  /**
   * Approve payroll run by finance staff (final approval)
   */
  approveByFinance: async (id: string, approveDto: ApprovePayrollDto): Promise<any> => {
    const response = await apiClient.post(
      `${BASE_URL}/runs/${id}/approve-finance`,
      approveDto
    );
    return response.data;
  },

  /**
   * Edit employee payroll detail to resolve exceptions
   */
  editEmployeePayrollDetail: async (
    detailId: string,
    editDto: EditEmployeePayrollDetailDto
  ): Promise<EmployeePayrollDetails> => {
    const response = await apiClient.patch<EmployeePayrollDetails>(
      `${BASE_URL}/employee-payroll-details/${detailId}/resolve-exceptions`,
      editDto
    );
    return response.data;
  },


};
