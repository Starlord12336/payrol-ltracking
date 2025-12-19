/**
 * Payroll Configuration Module Types
 * Define types specific to this module
 * 
 * ========================== EMAD ==========================
 * Types for: Pay Grades, Allowances, Tax Rules, Approval Workflow
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

import { BaseEntity } from '@/shared/types';

// ==========================================
// ENUMS
// ==========================================

export enum ApprovalStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum AllowanceType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum AllowanceFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  ONE_TIME = 'ONE_TIME',
}

// ==========================================
// PAY GRADE TYPES
// ==========================================

export interface PayGrade extends BaseEntity {
  grade: string;
  description?: string;
  baseSalary: number;
  grossSalary: number;
  currency: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface CreatePayGradeDto {
  grade: string;
  description?: string;
  baseSalary: number;
  grossSalary: number;
  currency?: string;
}

export interface UpdatePayGradeDto extends Partial<CreatePayGradeDto> {}

export interface FilterPayGradeDto {
  status?: ApprovalStatus;
  grade?: string;
  baseSalaryFrom?: number;
  baseSalaryTo?: number;
  grossSalaryFrom?: number;
  grossSalaryTo?: number;
  page?: number;
  limit?: number;
}

// ==========================================
// ALLOWANCE TYPES
// ==========================================

export interface Allowance extends BaseEntity {
  name: string;
  amount: number;
  status: ApprovalStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CreateAllowanceDto {
  name: string;
  amount: number;
}

export interface UpdateAllowanceDto extends Partial<CreateAllowanceDto> {}

export interface FilterAllowanceDto {
  status?: ApprovalStatus;
  name?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// TAX RULE TYPES
// ==========================================

export interface TaxRule extends BaseEntity {
  name: string;
  description?: string;
  rate: number;
  minSalary: number;
  maxSalary?: number;
  taxRate: number;
  status: ApprovalStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CreateTaxRuleDto {
  name: string;
  description?: string;
  rate: number;
  minSalary?: number;
  maxSalary?: number;
  taxRate: number;
}

export interface UpdateTaxRuleDto extends Partial<CreateTaxRuleDto> {}

export interface FilterTaxRuleDto {
  status?: ApprovalStatus;
  name?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// APPROVAL WORKFLOW TYPES
// ==========================================

export interface ApproveDto {
  approvedBy: string;
  comment?: string;
}

export interface PendingApproval {
  id: string;
  entityType: EntityType;
  name: string;
  submittedAt: string;
  submittedBy?: string;
}

export interface PendingApprovalsDashboard {
  payGrades: { count: number; items: PayGrade[] };
  allowances: { count: number; items: Allowance[] };
  taxRules: { count: number; items: TaxRule[] };
  insuranceBrackets: { count: number; items: InsuranceBracket[] };
  payrollPolicies: { count: number; items: PayrollPolicy[] };
  signingBonuses: { count: number; items: SigningBonus[] };
  payTypes: { count: number; items: PayType[] };
  terminationBenefits: { count: number; items: TerminationBenefit[] };
  companySettings: { count: number; items: CompanySettings[] };
  totalPending: number;
}

export interface ApprovedConfigurations {
  payGrades: PayGrade[];
  allowances: Allowance[];
  taxRules: TaxRule[];
  insuranceBrackets: InsuranceBracket[];
  payrollPolicies: PayrollPolicy[];
  signingBonuses: SigningBonus[];
  payTypes: PayType[];
  terminationBenefits: TerminationBenefit[];
  companySettings: CompanySettings[];
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface PayGradeResponse {
  data: PayGrade;
  message?: string;
}

export interface PayGradesListResponse {
  data: PayGrade[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface AllowanceResponse {
  data: Allowance;
  message?: string;
}

export interface AllowancesListResponse {
  data: Allowance[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface TaxRuleResponse {
  data: TaxRule;
  message?: string;
}

export interface TaxRulesListResponse {
  data: TaxRule[];
  total?: number;
  page?: number;
  limit?: number;
}

// ========================== END EMAD ==========================

// ========================== JOHN WASFY ==========================
// Insurance Brackets, Payroll Policies, Signing Bonuses
// ========================== JOHN WASFY ==========================

// ==========================================
// INSURANCE BRACKET TYPES
// ==========================================

export interface InsuranceBracket extends BaseEntity {
  name: string;
  minSalary: number;
  maxSalary: number;
  employeeRate: number;
  employeePercentage: number;
  employerRate: number;
  status: ApprovalStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CreateInsuranceBracketDto {
  name: string;
  minSalary: number;
  maxSalary: number;
  employeeRate: number;
  employeePercentage: number;
  employerRate: number;
}

export interface UpdateInsuranceBracketDto extends Partial<CreateInsuranceBracketDto> {}

export interface FilterInsuranceBracketDto {
  status?: ApprovalStatus;
  name?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// PAYROLL POLICY TYPES
// ==========================================

export enum PolicyType {
  DEDUCTION = 'DEDUCTION',
  ALLOWANCE = 'ALLOWANCE',
  BONUS = 'BONUS',
  PENALTY = 'PENALTY',
  LEAVE = 'LEAVE',
}

export enum PolicyApplicability {
  ALL = 'ALL',
  DEPARTMENT = 'DEPARTMENT',
  POSITION = 'POSITION',
  INDIVIDUAL = 'INDIVIDUAL',
}

export interface RuleDefinition {
  percentage: number;
  fixedAmount: number;
  thresholdAmount: number;
}

export interface PayrollPolicy extends BaseEntity {
  policyName: string;
  policyType: PolicyType;
  description: string;
  effectiveDate: string;
  ruleDefinition: RuleDefinition;
  applicability: PolicyApplicability;
  status: ApprovalStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CreatePayrollPolicyDto {
  policyName: string;
  policyType: PolicyType;
  description: string;
  effectiveDate: string;
  ruleDefinition: RuleDefinition;
  applicability: PolicyApplicability;
}

export interface UpdatePayrollPolicyDto extends Partial<CreatePayrollPolicyDto> {}

export interface FilterPayrollPolicyDto {
  status?: ApprovalStatus;
  policyName?: string;
  policyType?: PolicyType;
  applicability?: PolicyApplicability;
  page?: number;
  limit?: number;
}

// ==========================================
// SIGNING BONUS TYPES
// ==========================================

export interface SigningBonus extends BaseEntity {
  positionName: string;
  amount: number;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface CreateSigningBonusDto {
  positionName: string;
  amount: number;
}

export interface UpdateSigningBonusDto extends Partial<CreateSigningBonusDto> {}

export interface FilterSigningBonusDto {
  status?: ApprovalStatus;
  positionName?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

// ========================== END JOHN WASFY ==========================

// ========================== ESLAM ==========================
// Pay Types, Termination Benefits, Company Settings, Audit Logs
// ========================== ESLAM ==========================

// ==========================================
// PAY TYPE TYPES
// ==========================================

export enum PaySchedule {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CONTRACT_BASED = 'CONTRACT_BASED',
}

export interface PayType extends BaseEntity {
  type: string;
  amount: number;
  status: ApprovalStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CreatePayTypeDto {
  type: string;
  amount: number;
}

export interface UpdatePayTypeDto extends Partial<CreatePayTypeDto> {}

export interface FilterPayTypeDto {
  status?: ApprovalStatus;
  type?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// TERMINATION BENEFIT TYPES
// ==========================================

export enum BenefitType {
  SEVERANCE = 'SEVERANCE',
  GRATUITY = 'GRATUITY',
  LEAVE_ENCASHMENT = 'LEAVE_ENCASHMENT',
}

export enum CalculationType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
  FORMULA = 'FORMULA',
}

export interface TerminationBenefit extends BaseEntity {
  name: string;
  amount: number;
  terms?: string;
  status: ApprovalStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CreateTerminationBenefitDto {
  name: string;
  amount: number;
  terms?: string;
}

export interface UpdateTerminationBenefitDto extends Partial<CreateTerminationBenefitDto> {}

export interface FilterTerminationBenefitDto {
  status?: ApprovalStatus;
  name?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// COMPANY SETTINGS TYPES
// ==========================================

export interface CompanySettings extends BaseEntity {
  payDate: string; // Date
  timeZone: string;
  currency: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CreateCompanySettingsDto {
  payDate: string;
  timeZone: string;
  currency: string;
}

export interface UpdateCompanySettingsDto extends Partial<CreateCompanySettingsDto> {}

export interface FilterCompanySettingsDto {
  status?: ApprovalStatus;
  page?: number;
  limit?: number;
}

// ==========================================
// AUDIT LOG TYPES
// ==========================================

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum EntityType {
  PAY_GRADE = 'PayGrade',
  ALLOWANCE = 'Allowance',
  TAX_RULE = 'TaxRule',
  INSURANCE_BRACKET = 'InsuranceBracket',
  PAYROLL_POLICY = 'PayrollPolicy',
  SIGNING_BONUS = 'SigningBonus',
  PAY_TYPE = 'PayType',
  TERMINATION_BENEFIT = 'TerminationBenefit',
  COMPANY_SETTINGS = 'CompanySettings',
}

export interface AuditLog extends BaseEntity {
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  performedAt: string;
  changes?: Record<string, any>;
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
}

export interface FilterAuditLogDto {
  entityType?: EntityType;
  entityId?: string;
  action?: AuditAction;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ========================== END ESLAM ==========================

// ========================== MOHAMMED EMAD ==========================
// Payroll Period Approval – Frontend-Only Workflow Types
// REQ-PY-24: Review Payroll period (Approve or Reject)
// REQ-PY-26: Edit payroll initiation (period) if rejected
//
// This is a FRONTEND-ONLY workflow:
// - Period data is generated on the frontend based on current date
// - Approval state is managed in React state (with localStorage persistence)
// - NO backend storage for payroll periods
// - Only status values: draft, approved, rejected (NO pending_approval)
// ========================== MOHAMMED EMAD ==========================

/**
 * Payroll Period Status (Frontend-Only)
 * Only three statuses: draft, approved, rejected
 */
export enum PayrollPeriodStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Payroll Period data structure (Frontend-Only)
 * Generated on the frontend based on current month/year
 */
export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  paymentDate: string;
  year: number;
  month: number;
  status: PayrollPeriodStatus;
  currency: string;
  workingDays: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

/**
 * Frontend workflow state for the Payroll Period Approval
 * Manages the entire approval flow on the frontend
 */
export interface PayrollPeriodWorkflowState {
  currentPeriod: PayrollPeriod | null;
  isApproved: boolean;
  isRejected: boolean;
  canCreatePayrollRun: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

/**
 * Initial workflow state
 */
export const INITIAL_WORKFLOW_STATE: PayrollPeriodWorkflowState = {
  currentPeriod: null,
  isApproved: false,
  isRejected: false,
  canCreatePayrollRun: false,
};

/**
 * LocalStorage key for persisting workflow state
 */
export const PAYROLL_PERIOD_STORAGE_KEY = 'payroll_period_workflow_state';

// ========================== END MOHAMMED EMAD ==========================
