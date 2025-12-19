/**
 * Payroll Configuration API Service
 *
 * ========================== EMAD ==========================
 * API calls for: Pay Grades, Allowances, Tax Rules, Approval Workflow
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type {
  PayGrade,
  CreatePayGradeDto,
  UpdatePayGradeDto,
  FilterPayGradeDto,
  Allowance,
  CreateAllowanceDto,
  UpdateAllowanceDto,
  FilterAllowanceDto,
  TaxRule,
  CreateTaxRuleDto,
  UpdateTaxRuleDto,
  FilterTaxRuleDto,
  InsuranceBracket,
  CreateInsuranceBracketDto,
  UpdateInsuranceBracketDto,
  FilterInsuranceBracketDto,
  PayrollPolicy,
  CreatePayrollPolicyDto,
  UpdatePayrollPolicyDto,
  FilterPayrollPolicyDto,
  PolicyType,
  PolicyApplicability,
  SigningBonus,
  CreateSigningBonusDto,
  UpdateSigningBonusDto,
  FilterSigningBonusDto,
  PayType,
  CreatePayTypeDto,
  UpdatePayTypeDto,
  FilterPayTypeDto,
  TerminationBenefit,
  CreateTerminationBenefitDto,
  UpdateTerminationBenefitDto,
  FilterTerminationBenefitDto,
  CompanySettings,
  CreateCompanySettingsDto,
  UpdateCompanySettingsDto,
  FilterCompanySettingsDto,
  AuditLog,
  FilterAuditLogDto,
  EntityType,
  ApproveDto,
  PendingApprovalsDashboard,
  ApprovedConfigurations,
} from '../types';

const BASE_URL = API_ENDPOINTS.PAYROLL_CONFIGURATION;

// ==========================================
// PAY GRADE API
// ==========================================

export const payGradeApi = {
  /**
   * Create a new pay grade (DRAFT status)
   */
  create: async (data: CreatePayGradeDto): Promise<PayGrade> => {
    const response = await apiClient.post<PayGrade>(`${BASE_URL}/pay-grades`, data);
    return response.data;
  },

  /**
   * Get all pay grades with optional filtering
   */
  getAll: async (filter?: FilterPayGradeDto): Promise<PayGrade[]> => {
    const response = await apiClient.get<PayGrade[]>(`${BASE_URL}/pay-grades`, {
      params: filter,
    });
    return response.data;
  },

  /**
   * Get all approved pay grades
   */
  getApproved: async (): Promise<PayGrade[]> => {
    const response = await apiClient.get<PayGrade[]>(`${BASE_URL}/pay-grades/approved`);
    return response.data;
  },

  /**
   * Get a single pay grade by ID
   */
  getById: async (id: string): Promise<PayGrade> => {
    const response = await apiClient.get<PayGrade>(`${BASE_URL}/pay-grades/${id}`);
    return response.data;
  },

  /**
   * Update a pay grade (only DRAFT status)
   */
  update: async (id: string, data: UpdatePayGradeDto): Promise<PayGrade> => {
    const response = await apiClient.put<PayGrade>(`${BASE_URL}/pay-grades/${id}`, data);
    return response.data;
  },

  /**
   * Delete a pay grade (only DRAFT status)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/pay-grades/${id}`);
  },

  /**
   * Submit pay grade for approval
   */
  submit: async (id: string): Promise<PayGrade> => {
    const response = await apiClient.post<PayGrade>(`${BASE_URL}/pay-grades/${id}/submit`);
    return response.data;
  },

  /**
   * Approve a pay grade (Payroll Manager only)
   */
  approve: async (id: string, data?: ApproveDto): Promise<PayGrade> => {
    const response = await apiClient.post<PayGrade>(`${BASE_URL}/pay-grades/${id}/approve`, data);
    return response.data;
  },

  /**
   * Reject a pay grade (Payroll Manager only)
   */
  reject: async (id: string): Promise<PayGrade> => {
    const response = await apiClient.post<PayGrade>(`${BASE_URL}/pay-grades/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// ALLOWANCE API
// ==========================================

export const allowanceApi = {
  /**
   * Create a new allowance (DRAFT status)
   */
  create: async (data: CreateAllowanceDto): Promise<Allowance> => {
    const response = await apiClient.post<Allowance>(`${BASE_URL}/allowances`, data);
    return response.data;
  },

  /**
   * Get all allowances with optional filtering
   */
  getAll: async (filter?: FilterAllowanceDto): Promise<Allowance[]> => {
    const response = await apiClient.get<Allowance[]>(`${BASE_URL}/allowances`, {
      params: filter,
    });
    return response.data;
  },

  /**
   * Get all approved allowances
   */
  getApproved: async (): Promise<Allowance[]> => {
    const response = await apiClient.get<Allowance[]>(`${BASE_URL}/allowances/approved`);
    return response.data;
  },

  /**
   * Get a single allowance by ID
   */
  getById: async (id: string): Promise<Allowance> => {
    const response = await apiClient.get<Allowance>(`${BASE_URL}/allowances/${id}`);
    return response.data;
  },

  /**
   * Update an allowance (only DRAFT status)
   */
  update: async (id: string, data: UpdateAllowanceDto): Promise<Allowance> => {
    const response = await apiClient.put<Allowance>(`${BASE_URL}/allowances/${id}`, data);
    return response.data;
  },

  /**
   * Delete an allowance (only DRAFT status)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/allowances/${id}`);
  },

  /**
   * Submit allowance for approval
   */
  submit: async (id: string): Promise<Allowance> => {
    const response = await apiClient.post<Allowance>(`${BASE_URL}/allowances/${id}/submit`);
    return response.data;
  },

  /**
   * Approve an allowance (Payroll Manager only)
   */
  approve: async (id: string, data?: ApproveDto): Promise<Allowance> => {
    const response = await apiClient.post<Allowance>(`${BASE_URL}/allowances/${id}/approve`, data);
    return response.data;
  },

  /**
   * Reject an allowance (Payroll Manager only)
   */
  reject: async (id: string): Promise<Allowance> => {
    const response = await apiClient.post<Allowance>(`${BASE_URL}/allowances/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// TAX RULE API
// ==========================================

export const taxRuleApi = {
  /**
   * Create a new tax rule (DRAFT status)
   */
  create: async (data: CreateTaxRuleDto): Promise<TaxRule> => {
    const response = await apiClient.post<TaxRule>(`${BASE_URL}/tax-rules`, data);
    return response.data;
  },

  /**
   * Get all tax rules with optional filtering
   */
  getAll: async (filter?: FilterTaxRuleDto): Promise<TaxRule[]> => {
    const response = await apiClient.get<TaxRule[]>(`${BASE_URL}/tax-rules`, {
      params: filter,
    });
    return response.data;
  },

  /**
   * Get all approved tax rules
   */
  getApproved: async (): Promise<TaxRule[]> => {
    const response = await apiClient.get<TaxRule[]>(`${BASE_URL}/tax-rules/approved`);
    return response.data;
  },

  /**
   * Get a single tax rule by ID
   */
  getById: async (id: string): Promise<TaxRule> => {
    const response = await apiClient.get<TaxRule>(`${BASE_URL}/tax-rules/${id}`);
    return response.data;
  },

  /**
   * Update a tax rule (only DRAFT status)
   */
  update: async (id: string, data: UpdateTaxRuleDto): Promise<TaxRule> => {
    const response = await apiClient.put<TaxRule>(`${BASE_URL}/tax-rules/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tax rule (only DRAFT status)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/tax-rules/${id}`);
  },

  /**
   * Submit tax rule for approval
   */
  submit: async (id: string): Promise<TaxRule> => {
    const response = await apiClient.post<TaxRule>(`${BASE_URL}/tax-rules/${id}/submit`);
    return response.data;
  },

  /**
   * Approve a tax rule (Payroll Manager only)
   */
  approve: async (id: string, data?: ApproveDto): Promise<TaxRule> => {
    const response = await apiClient.post<TaxRule>(`${BASE_URL}/tax-rules/${id}/approve`, data);
    return response.data;
  },

  /**
   * Reject a tax rule (Payroll Manager only)
   */
  reject: async (id: string): Promise<TaxRule> => {
    const response = await apiClient.post<TaxRule>(`${BASE_URL}/tax-rules/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// APPROVAL WORKFLOW API
// ==========================================

export const approvalApi = {
  /**
   * Get pending approvals dashboard
   */
  getPendingDashboard: async (): Promise<PendingApprovalsDashboard> => {
    const response = await apiClient.get<PendingApprovalsDashboard>(
      `${BASE_URL}/approvals/pending`
    );
    return response.data;
  },

  /**
   * Get all approved configurations
   */
  getAllApproved: async (): Promise<ApprovedConfigurations> => {
    const response = await apiClient.get<ApprovedConfigurations>(
      `${BASE_URL}/configurations/approved`
    );
    return response.data;
  },
};

// ========================== END EMAD ==========================

// ========================== JOHN WASFY ==========================
// Insurance Brackets, Payroll Policies, Signing Bonuses API
// ========================== JOHN WASFY ==========================

// ==========================================
// INSURANCE BRACKET API
// ==========================================

export const insuranceBracketApi = {
  create: async (data: CreateInsuranceBracketDto): Promise<InsuranceBracket> => {
    const response = await apiClient.post<InsuranceBracket>(`${BASE_URL}/insurance-brackets`, data);
    return response.data;
  },

  getAll: async (filter?: FilterInsuranceBracketDto): Promise<InsuranceBracket[]> => {
    const response = await apiClient.get<InsuranceBracket[]>(`${BASE_URL}/insurance-brackets`, {
      params: filter,
    });
    return response.data;
  },

  getApproved: async (): Promise<InsuranceBracket[]> => {
    const response = await apiClient.get<InsuranceBracket[]>(`${BASE_URL}/insurance-brackets/approved`);
    return response.data;
  },

  getById: async (id: string): Promise<InsuranceBracket> => {
    const response = await apiClient.get<InsuranceBracket>(`${BASE_URL}/insurance-brackets/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateInsuranceBracketDto): Promise<InsuranceBracket> => {
    const response = await apiClient.put<InsuranceBracket>(`${BASE_URL}/insurance-brackets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/insurance-brackets/${id}`);
  },

  submit: async (id: string): Promise<InsuranceBracket> => {
    const response = await apiClient.post<InsuranceBracket>(`${BASE_URL}/insurance-brackets/${id}/submit`);
    return response.data;
  },

  approve: async (id: string, data?: ApproveDto): Promise<InsuranceBracket> => {
    const response = await apiClient.post<InsuranceBracket>(`${BASE_URL}/insurance-brackets/${id}/approve`, data);
    return response.data;
  },

  reject: async (id: string): Promise<InsuranceBracket> => {
    const response = await apiClient.post<InsuranceBracket>(`${BASE_URL}/insurance-brackets/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// PAYROLL POLICY API
// ==========================================

export const payrollPolicyApi = {
  create: async (data: CreatePayrollPolicyDto): Promise<PayrollPolicy> => {
    const response = await apiClient.post<PayrollPolicy>(`${BASE_URL}/payroll-policies`, data);
    return response.data;
  },

  getAll: async (filter?: FilterPayrollPolicyDto): Promise<PayrollPolicy[]> => {
    const response = await apiClient.get<PayrollPolicy[]>(`${BASE_URL}/payroll-policies`, {
      params: filter,
    });
    return response.data;
  },

  getApproved: async (): Promise<PayrollPolicy[]> => {
    const response = await apiClient.get<PayrollPolicy[]>(`${BASE_URL}/payroll-policies/approved`);
    return response.data;
  },

  getByType: async (type: PolicyType): Promise<PayrollPolicy[]> => {
    const response = await apiClient.get<PayrollPolicy[]>(`${BASE_URL}/payroll-policies/type/${type}`);
    return response.data;
  },

  getByApplicability: async (applicability: PolicyApplicability): Promise<PayrollPolicy[]> => {
    const response = await apiClient.get<PayrollPolicy[]>(`${BASE_URL}/payroll-policies/applicability/${applicability}`);
    return response.data;
  },

  getById: async (id: string): Promise<PayrollPolicy> => {
    const response = await apiClient.get<PayrollPolicy>(`${BASE_URL}/payroll-policies/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdatePayrollPolicyDto): Promise<PayrollPolicy> => {
    const response = await apiClient.put<PayrollPolicy>(`${BASE_URL}/payroll-policies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/payroll-policies/${id}`);
  },

  submit: async (id: string): Promise<PayrollPolicy> => {
    const response = await apiClient.post<PayrollPolicy>(`${BASE_URL}/payroll-policies/${id}/submit`);
    return response.data;
  },

  approve: async (id: string, data?: ApproveDto): Promise<PayrollPolicy> => {
    const response = await apiClient.post<PayrollPolicy>(`${BASE_URL}/payroll-policies/${id}/approve`, data);
    return response.data;
  },

  reject: async (id: string): Promise<PayrollPolicy> => {
    const response = await apiClient.post<PayrollPolicy>(`${BASE_URL}/payroll-policies/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// SIGNING BONUS API
// ==========================================

export const signingBonusApi = {
  create: async (data: CreateSigningBonusDto): Promise<SigningBonus> => {
    const response = await apiClient.post<SigningBonus>(`${BASE_URL}/signing-bonuses`, data);
    return response.data;
  },

  getAll: async (filter?: FilterSigningBonusDto): Promise<SigningBonus[]> => {
    const response = await apiClient.get<SigningBonus[]>(`${BASE_URL}/signing-bonuses`, {
      params: filter,
    });
    return response.data;
  },

  getApproved: async (): Promise<SigningBonus[]> => {
    const response = await apiClient.get<SigningBonus[]>(`${BASE_URL}/signing-bonuses/approved`);
    return response.data;
  },

  getByPosition: async (positionName: string): Promise<SigningBonus> => {
    const response = await apiClient.get<SigningBonus>(`${BASE_URL}/signing-bonuses/position/${encodeURIComponent(positionName)}`);
    return response.data;
  },

  getById: async (id: string): Promise<SigningBonus> => {
    const response = await apiClient.get<SigningBonus>(`${BASE_URL}/signing-bonuses/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateSigningBonusDto): Promise<SigningBonus> => {
    const response = await apiClient.put<SigningBonus>(`${BASE_URL}/signing-bonuses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/signing-bonuses/${id}`);
  },

  submit: async (id: string): Promise<SigningBonus> => {
    const response = await apiClient.post<SigningBonus>(`${BASE_URL}/signing-bonuses/${id}/submit`);
    return response.data;
  },

  approve: async (id: string, data?: ApproveDto): Promise<SigningBonus> => {
    const response = await apiClient.post<SigningBonus>(`${BASE_URL}/signing-bonuses/${id}/approve`, data);
    return response.data;
  },

  reject: async (id: string): Promise<SigningBonus> => {
    const response = await apiClient.post<SigningBonus>(`${BASE_URL}/signing-bonuses/${id}/reject`);
    return response.data;
  },
};

// ========================== END JOHN WASFY ==========================

// ========================== ESLAM ==========================
// Pay Types, Termination Benefits, Company Settings, Audit Logs API
// ========================== ESLAM ==========================

// ==========================================
// PAY TYPE API
// ==========================================

export const payTypeApi = {
  create: async (data: CreatePayTypeDto): Promise<PayType> => {
    const response = await apiClient.post<PayType>(`${BASE_URL}/pay-types`, data);
    return response.data;
  },

  getAll: async (filter?: FilterPayTypeDto): Promise<PayType[]> => {
    const response = await apiClient.get<PayType[]>(`${BASE_URL}/pay-types`, {
      params: filter,
    });
    return response.data;
  },

  getApproved: async (): Promise<PayType[]> => {
    const response = await apiClient.get<PayType[]>(`${BASE_URL}/pay-types/approved`);
    return response.data;
  },

  getById: async (id: string): Promise<PayType> => {
    const response = await apiClient.get<PayType>(`${BASE_URL}/pay-types/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdatePayTypeDto): Promise<PayType> => {
    const response = await apiClient.put<PayType>(`${BASE_URL}/pay-types/${id}`, data);
    return response.data;
  },

  delete: async (id: string, deletedBy?: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/pay-types/${id}`, {
      data: deletedBy ? { deletedBy } : undefined,
    });
  },

  submit: async (id: string): Promise<PayType> => {
    const response = await apiClient.post<PayType>(`${BASE_URL}/pay-types/${id}/submit`);
    return response.data;
  },

  approve: async (id: string, data?: ApproveDto): Promise<PayType> => {
    const response = await apiClient.post<PayType>(`${BASE_URL}/pay-types/${id}/approve`, data);
    return response.data;
  },

  reject: async (id: string): Promise<PayType> => {
    const response = await apiClient.post<PayType>(`${BASE_URL}/pay-types/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// TERMINATION BENEFIT API
// ==========================================

export const terminationBenefitApi = {
  create: async (data: CreateTerminationBenefitDto): Promise<TerminationBenefit> => {
    const response = await apiClient.post<TerminationBenefit>(`${BASE_URL}/termination-benefits`, data);
    return response.data;
  },

  getAll: async (filter?: FilterTerminationBenefitDto): Promise<TerminationBenefit[]> => {
    const response = await apiClient.get<TerminationBenefit[]>(`${BASE_URL}/termination-benefits`, {
      params: filter,
    });
    return response.data;
  },

  getApproved: async (): Promise<TerminationBenefit[]> => {
    const response = await apiClient.get<TerminationBenefit[]>(`${BASE_URL}/termination-benefits/approved`);
    return response.data;
  },

  getById: async (id: string): Promise<TerminationBenefit> => {
    const response = await apiClient.get<TerminationBenefit>(`${BASE_URL}/termination-benefits/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateTerminationBenefitDto): Promise<TerminationBenefit> => {
    const response = await apiClient.put<TerminationBenefit>(`${BASE_URL}/termination-benefits/${id}`, data);
    return response.data;
  },

  delete: async (id: string, deletedBy?: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/termination-benefits/${id}`, {
      data: deletedBy ? { deletedBy } : undefined,
    });
  },

  submit: async (id: string): Promise<TerminationBenefit> => {
    const response = await apiClient.post<TerminationBenefit>(`${BASE_URL}/termination-benefits/${id}/submit`);
    return response.data;
  },

  approve: async (id: string, data?: ApproveDto): Promise<TerminationBenefit> => {
    const response = await apiClient.post<TerminationBenefit>(`${BASE_URL}/termination-benefits/${id}/approve`, data);
    return response.data;
  },

  reject: async (id: string): Promise<TerminationBenefit> => {
    const response = await apiClient.post<TerminationBenefit>(`${BASE_URL}/termination-benefits/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// COMPANY SETTINGS API
// ==========================================

export const companySettingsApi = {
  create: async (data: CreateCompanySettingsDto): Promise<CompanySettings> => {
    const response = await apiClient.post<CompanySettings>(`${BASE_URL}/company-settings`, data);
    return response.data;
  },

  getAll: async (filter?: FilterCompanySettingsDto): Promise<CompanySettings[]> => {
    const response = await apiClient.get<CompanySettings[]>(`${BASE_URL}/company-settings`, {
      params: filter,
    });
    return response.data;
  },

  getActive: async (): Promise<CompanySettings> => {
    const response = await apiClient.get<CompanySettings>(`${BASE_URL}/company-settings/active`);
    return response.data;
  },

  getById: async (id: string): Promise<CompanySettings> => {
    const response = await apiClient.get<CompanySettings>(`${BASE_URL}/company-settings/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateCompanySettingsDto): Promise<CompanySettings> => {
    const response = await apiClient.put<CompanySettings>(`${BASE_URL}/company-settings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/company-settings/${id}`);
  },

  submit: async (id: string): Promise<CompanySettings> => {
    const response = await apiClient.post<CompanySettings>(`${BASE_URL}/company-settings/${id}/submit`);
    return response.data;
  },

  approve: async (id: string, data?: ApproveDto): Promise<CompanySettings> => {
    const response = await apiClient.post<CompanySettings>(`${BASE_URL}/company-settings/${id}/approve`, data);
    return response.data;
  },

  reject: async (id: string): Promise<CompanySettings> => {
    const response = await apiClient.post<CompanySettings>(`${BASE_URL}/company-settings/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// AUDIT LOG API
// ==========================================

export const auditLogApi = {
  getAll: async (filter?: FilterAuditLogDto): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>(`${BASE_URL}/audit-logs`, {
      params: filter,
    });
    return response.data;
  },

  getByEntity: async (entityType: EntityType, entityId: string): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>(`${BASE_URL}/audit-logs/entity/${entityType}/${entityId}`);
    return response.data;
  },
};

// ========================== END ESLAM ==========================

// ========================== MOHAMMED EMAD ==========================
