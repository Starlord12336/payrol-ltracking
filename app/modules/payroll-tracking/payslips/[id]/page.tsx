'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { getEmployeePayslip } from '../../utils/payslipService';
import { Payslip } from '../../utils/payslip';
import styles from './payslipDetails.module.css';

export default function PayslipDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const employeeId = searchParams.get('employeeId') || user?.userid;
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !employeeId) return;

    getEmployeePayslip(employeeId as string, id as string)
      .then(setPayslip)
      .catch((err) => {
        console.error('Error fetching payslip:', err);
        setError('Failed to load payslip details');
      })
      .finally(() => setLoading(false));
  }, [id, employeeId]);

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}><div className={styles.error}>{error}</div></div>;
  if (!payslip) return null;

  const totalAllowances = payslip.earningsDetails?.allowances?.reduce(
    (sum, allowance) => sum + (allowance.amount || 0),
    0
  ) || 0;

  const totalBonuses = payslip.earningsDetails?.bonuses?.reduce(
    (sum, bonus) => sum + (bonus.amount || 0),
    0
  ) || 0;

  const totalDeductions = payslip.totaDeductions || 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Payslip Details</h1>
        <p>Period: {payslip.createdAt ? new Date(payslip.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}</p>
      </div>

      <div className={styles.section}>
        <h2>Earnings</h2>
        <div className={styles.details}>
          <div className={styles.row}>
            <span>Base Salary:</span>
            <span>{payslip.earningsDetails?.baseSalary?.toLocaleString() || 'N/A'}</span>
          </div>
          {payslip.earningsDetails?.allowances && payslip.earningsDetails.allowances.length > 0 && (
            <>
              <div className={styles.subsection}>
                <h3>Allowances</h3>
                {payslip.earningsDetails.allowances.map((allowance, idx) => (
                  <div key={idx} className={styles.row}>
                    <span>{allowance.name}:</span>
                    <span>{allowance.amount?.toLocaleString() || 'N/A'}</span>
                  </div>
                ))}
              </div>
              <div className={styles.row}>
                <span><strong>Total Allowances:</strong></span>
                <span><strong>{totalAllowances.toLocaleString()}</strong></span>
              </div>
            </>
          )}
          {payslip.earningsDetails?.bonuses && payslip.earningsDetails.bonuses.length > 0 && (
            <>
              <div className={styles.subsection}>
                <h3>Bonuses</h3>
                {payslip.earningsDetails.bonuses.map((bonus, idx) => (
                  <div key={idx} className={styles.row}>
                    <span>{bonus.name}:</span>
                    <span>{bonus.amount?.toLocaleString() || 'N/A'}</span>
                  </div>
                ))}
              </div>
              <div className={styles.row}>
                <span><strong>Total Bonuses:</strong></span>
                <span><strong>{totalBonuses.toLocaleString()}</strong></span>
              </div>
            </>
          )}
          <div className={styles.row}>
            <span><strong>Total Gross Salary:</strong></span>
            <span><strong>{payslip.totalGrossSalary?.toLocaleString() || 'N/A'}</strong></span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Deductions</h2>
        <div className={styles.details}>
          {payslip.deductionsDetails?.taxes && payslip.deductionsDetails.taxes.length > 0 && (
            <>
              <div className={styles.subsection}>
                <h3>Taxes</h3>
                {payslip.deductionsDetails.taxes.map((tax, idx) => (
                  <div key={idx} className={styles.row}>
                    <span>{tax.name}:</span>
                    <span>{tax.amount?.toLocaleString() || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {payslip.deductionsDetails?.insurances && payslip.deductionsDetails.insurances.length > 0 && (
            <>
              <div className={styles.subsection}>
                <h3>Insurance</h3>
                {payslip.deductionsDetails.insurances.map((insurance, idx) => (
                  <div key={idx} className={styles.row}>
                    <span>{insurance.name}:</span>
                    <span>{insurance.amount?.toLocaleString() || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {payslip.deductionsDetails?.penalties && (
            <div className={styles.row}>
              <span>Penalties:</span>
              <span>{payslip.deductionsDetails.penalties.amount?.toLocaleString() || 'N/A'}</span>
            </div>
          )}
          <div className={styles.row}>
            <span><strong>Total Deductions:</strong></span>
            <span><strong>{totalDeductions.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Summary</h2>
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Gross Salary:</span>
            <span>{payslip.totalGrossSalary?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Total Deductions:</span>
            <span>{totalDeductions.toLocaleString()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span><strong>Net Pay:</strong></span>
            <span><strong>{payslip.netPay?.toLocaleString() || 'N/A'}</strong></span>
          </div>
          <div className={styles.summaryRow}>
            <span>Payment Status:</span>
            <span className={styles.status}>{payslip.paymentStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

