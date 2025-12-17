export interface Payslip {
  deductions: ReactNode;
  _id: string;
  month: string;
  netPay: number;
  totalDeductions: number;
  allowances: number;
  overtime?: number;
  unpaidLeave?: number;
  paymentStatus: 'Paid' | 'Under Review' | 'Pending';
}