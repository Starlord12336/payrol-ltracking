'use client';
import { useEffect, useState } from 'react';
import { getCurrentPayslip } from '@/shared/utils/payslipService';
import { PayrollStatusCard } from '@/app/modules/payroll-tracking/components/PayrollStatusCard';
import { SalarySummaryCard } from '@/app/modules/payroll-tracking/components/SalarySummaryCard';
import { Payslip } from '@/shared/types/payslip';

export default function DashboardPage() {
  const [payslip, setPayslip] = useState<Payslip | null>(null);

  useEffect(() => {
    getCurrentPayslip().then(setPayslip);
  }, []);

  if (!payslip) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Employee Dashboard</h2>
      <PayrollStatusCard status={payslip.paymentStatus} />
      <SalarySummaryCard payslip={payslip} />
    </div>
  );
}