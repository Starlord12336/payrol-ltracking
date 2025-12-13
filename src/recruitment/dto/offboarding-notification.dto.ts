import { Types } from 'mongoose';

/**
 * DTO for sending offboarding notifications
 * Triggers benefits termination and final pay calculation
 */
export class SendOffboardingNotificationDto {
  terminationId: Types.ObjectId;
  employeeId: Types.ObjectId;
  terminationDate: Date;
  notificationType: string; // 'BENEFITS_TERMINATION', 'FINAL_PAY_CALCULATION', 'SETTLEMENT'
  recipientDepartments?: string[]; // HR, Payroll, Finance, etc.
  includedInNotification?: {
    leaveBalance?: boolean;
    benefits?: boolean;
    deductions?: boolean;
    finalPayCalculation?: boolean;
  };
}

/**
 * DTO for final pay calculation response
 * Includes leave balance, benefits, and deductions
 */
export class FinalPayCalculationDto {
  terminationId: string;
  employeeId: string;
  terminationDate: Date;
  baseSalary: number;
  leaveData: {
    totalLeaveDays: number;
    usedLeaveDays: number;
    balanceLeaveDays: number;
    leaveValuePerDay: number;
    leaveEncashmentAmount: number;
    leaveTypes: Array<{
      type: string;
      balance: number;
      value: number;
    }>;
  };
  benefitsTermination: {
    healthInsurance: {
      terminationDate: Date;
      balanceAmount?: number;
    };
    lifeInsurance: {
      terminationDate: Date;
      balanceAmount?: number;
    };
    otherBenefits: Array<{
      name: string;
      terminationDate: Date;
      balanceAmount?: number;
    }>;
  };
  deductions: {
    pendingLoans?: number;
    advanceSalary?: number;
    otherDeductions?: Array<{
      name: string;
      amount: number;
    }>;
    totalDeductions: number;
  };
  netFinalPayment: number;
  calculatedAt: Date;
  calculatedBy: string;
}

/**
 * DTO for benefits termination
 */
export class BenefitsTerminationDto {
  terminationId: string;
  employeeId: string;
  terminationDate: Date;
  benefits: Array<{
    benefitId: string;
    benefitType: string; // 'HEALTH_INSURANCE', 'LIFE_INSURANCE', 'PENSION', etc.
    benefitName: string;
    terminationDate: Date;
    balanceAmount?: number;
    remarks?: string;
  }>;
  notificationSent: boolean;
  sentAt?: Date;
  sentTo?: string;
}

/**
 * DTO for leave balance calculation
 */
export class LeaveBalanceCalculationDto {
  employeeId: string;
  totalLeaveDays: number;
  usedLeaveDays: number;
  balanceLeaveDays: number;
  leaveTypeBreakdown: Array<{
    leaveType: string;
    totalDays: number;
    usedDays: number;
    balanceDays: number;
    valuePerDay: number;
    totalValue: number;
  }>;
  leaveEncashmentAmount: number;
  encashmentRate: number;
  calculatedAt: Date;
}

/**
 * DTO for offboarding notification response
 */
export class OffboardingNotificationResponseDto {
  _id: string;
  terminationId: string;
  employeeId: string;
  notificationType: string;
  recipientDepartments: string[];
  finalPayCalculation?: FinalPayCalculationDto;
  benefitsTermination?: BenefitsTerminationDto;
  leaveBalance?: LeaveBalanceCalculationDto;
  notificationStatus: string; // 'PENDING', 'SENT', 'FAILED'
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for offboarding notification history
 */
export class OffboardingNotificationHistoryDto {
  terminationId: string;
  employeeId: string;
  notifications: Array<{
    _id: string;
    notificationType: string;
    recipientDepartments: string[];
    status: string;
    sentAt?: Date;
    failureReason?: string;
    createdAt: Date;
  }>;
  totalNotificationsSent: number;
  failedNotifications: number;
}

/**
 * DTO for bulk offboarding notifications
 */
export class BulkOffboardingNotificationDto {
  terminationIds: Types.ObjectId[];
  notificationType: string;
  recipientDepartments: string[];
  includedInNotification?: {
    leaveBalance?: boolean;
    benefits?: boolean;
    deductions?: boolean;
    finalPayCalculation?: boolean;
  };
}

/**
 * DTO for offboarding notification summary
 */
export class OffboardingNotificationSummaryDto {
  totalTerminations: number;
  notificationsSent: number;
  failedNotifications: number;
  pendingNotifications: number;
  totalLeaveEncashment: number;
  totalBenefitsTerminated: number;
  totalDeductions: number;
  summaryDate: Date;
}
