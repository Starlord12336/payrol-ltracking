import { BaseEntity } from '@/shared/types';
import type {
  Allowance,
  SigningBonus,
  TerminationBenefit,
  TaxRule,
  InsuranceBracket,
} from '@/modules/payroll-configuration/types';


//enums for payroll execution
export enum BankStatus {
    VALID = 'valid',
    MISSING = 'missing',
}
export enum BonusStatus {
    PENDING = 'pending',
    PAID = 'paid',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}
export enum BenefitStatus {
    PENDING = 'pending',
    PAID = 'paid',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}
  
export enum PayRollStatus {
    DRAFT = 'draft',
    UNDER_REVIEW = 'under review', // pending manager Approval
    PENDING_FINANCE_APPROVAL = 'pending finance approval',
    REJECTED = 'rejected',
    APPROVED = 'approved', // when both manager and finance approved
    LOCKED = 'locked',
    UNLOCKED = 'unlocked',
}
export enum PayRollPaymentStatus {
    PAID = 'paid', // when finace approved
    PENDING = 'pending',
}
export enum PaySlipPaymentStatus {
    PENDING = 'pending', // until bank response  which is not our case
    PAID = 'paid', // when bank responds
}
export enum BenefitReviewAction {
    APPROVE = 'approve',
    REJECT = 'reject',
}
export enum BonusReviewAction {
    APPROVE = 'approve',
    REJECT = 'reject',
}
  
//interfaces for payroll execution

//employeepayrolldetails interfaces
export interface EmployeePayrollDetails extends BaseEntity {
    employeeId: string;
    baseSalary: number;
    allowances: number;
    deductions: number;     // including penalties
    netSalary: number;
    netPay: number;         // final amount to be paid
    bankStatus: BankStatus; // valid, missing
    exceptions?: string;    // issues while calculating payroll or missing bank details
    bonus?: number;
    benefit?: number;
    payrollRunId: string;
  }


//employee penalties interfaces
export interface Penalty {
    reason: string;
    amount: number;
  }
  
export interface EmployeePenalties extends BaseEntity {
    employeeId: string;
    penalties?: Penalty[];
  }
  
//employee bonuses interfaces
export interface EmployeeSigningBonus extends BaseEntity {
    employeeId: string;
    signingBonusId: string;
    givenAmount?: number;
    paymentDate?: string;
    status: BonusStatus;          // pending, paid, approved, rejected
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    disbursed: boolean;
    disbursedAt?: string;
  }

export interface ReviewBonusDto {
    reviewerId: string;
    action: BonusReviewAction;
    rejectionReason?: string;
  }



//employee benefits interfaces
export interface EmployeeTerminationResignation extends BaseEntity {
    employeeId: string;
    benefitId: string;
    terminationId: string;
    terminationType: 'termination' | 'resignation';
    leaveEncashment: number;
    severancePay: number;
    endOfServiceGratuity: number;
    givenAmount?: number;
    status: BenefitStatus;        // pending, paid, approved, rejected
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
    disbursed: boolean;
    disbursedAt?: string;
  }

export interface ReviewBenefitDto {
    reviewerId: string;
    action: BenefitReviewAction;
    rejectionReason?: string;
  }

export interface ProcessTerminationBenefitsDto {
    terminationId: string;
    benefitId: string;
    givenAmount: number;
  }

export interface ProcessSigningBonusDto {
    employeeId: string;
    signingBonusId: string;
    givenAmount: number;
  }

//payrollrun interfaces
export interface PayrollRuns extends BaseEntity {
    runId: string;                 // ex: PR-2025-0001
    payrollPeriod: string;         // ISO string for Date
    status: PayRollStatus;
    entity: string;                // company name
    employees: number;
    exceptions: number;
    totalnetpay: number;
    payrollSpecialistId: string;   // createdBy
    paymentStatus: PayRollPaymentStatus;
    payrollManagerId?: string;
    financeStaffId?: string;
    rejectionReason?: string;
    unlockReason?: string;
    managerApprovalDate?: string;
    financeApprovalDate?: string;
  }

export interface CreatePayrollRunDto {
    payrollPeriod: string;     // ISO date string like '2025-01-31'
    entity: string;            // company name
    payrollSpecialistId: string;
  }

export interface EditPayrollPeriodDto{
    payrollPeriod: string;     // ISO date string like '2025-01-31'
}

export interface UnfreezePayrollDto {
    managerId: string;
    unlockReason: string;
  }
export interface RejectPayrollDto {
    reviewerId: string;
    rejectionReason: string;
  }
export interface ApprovePayrollDto {
    approverId: string;
    comments?: string;
  }

export interface EditEmployeePayrollDetailDto {
    bankAccountNumber?: string;
    netPay?: number;
  }
  
  
  
//payslip interfaces
// VERY IMPORTANT: These interfaces will be imported from payroll-configuration and payroll-tracking modules

export interface Earnings {
    baseSalary: number;
    allowances: Allowance[]; 
    bonuses?: SigningBonus[];
    benefits?: TerminationBenefit[];
    refunds?: any[];
  }
  
export interface Deductions {
    taxes: TaxRule[];
    insurances?: InsuranceBracket[];
    penalties?: EmployeePenalties;
  }
  
export interface PaySlip extends BaseEntity {
    employeeId: string;
    payrollRunId: string;
    earningsDetails: Earnings;
    deductionsDetails: Deductions;
    totalGrossSalary: number;
    totaDeductions?: number;
    netPay: number;
    paymentStatus: PaySlipPaymentStatus;
  }