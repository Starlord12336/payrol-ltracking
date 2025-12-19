/**
 * Payslip Types
 * Based on backend paySlip schema
 */

export interface Payslip {
  _id: string;
  employeeId: string;
  payrollRunId: string;
  earningsDetails: {
    baseSalary: number;
    allowances?: Array<{
      name: string;
      amount: number;
    }>;
    bonuses?: Array<{
      name: string;
      amount: number;
    }>;
    benefits?: Array<{
      name: string;
      amount: number;
    }>;
    refunds?: Array<{
      amount: number;
      description: string;
    }>;
  };
  deductionsDetails: {
    taxes?: Array<{
      name: string;
      amount: number;
    }>;
    insurances?: Array<{
      name: string;
      amount: number;
    }>;
    penalties?: {
      amount: number;
      description?: string;
    };
  };
  totalGrossSalary: number;
  totaDeductions?: number;
  netPay: number;
  paymentStatus: 'Paid' | 'Pending' | 'Under Review';
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseSalary {
  baseSalary: number;
  currency?: string;
  effectiveDate?: string;
}

export interface LeaveCompensation {
  amount: number;
  leaveType: string;
  days: number;
}

export interface TransportationAllowance {
  amount: number;
  description?: string;
}

export interface TaxDeduction {
  name: string;
  amount: number;
  rate?: number;
}

export interface InsuranceDeduction {
  name: string;
  amount: number;
  type?: string;
}

export interface MisconductPenalty {
  amount: number;
  description?: string;
  date?: string;
}

export interface UnpaidLeaveDeduction {
  amount: number;
  days: number;
  date?: string;
}

export interface EmployerContribution {
  name: string;
  amount: number;
  type?: string;
}

export interface SalaryHistoryEntry {
  month: string;
  year: number;
  netPay: number;
  grossSalary: number;
  totalDeductions: number;
  payslipId: string;
}
