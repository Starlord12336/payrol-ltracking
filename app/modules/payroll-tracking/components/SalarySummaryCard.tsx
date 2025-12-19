import React from 'react';
import { Payslip } from '../utils/payslip';
import styles from './SalarySummaryCard.module.css';

interface Props {
  payslip: Payslip;
}

export const SalarySummaryCard: React.FC<Props> = ({ payslip }) => {
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
    <div className={styles.card}>
      <h2 className={styles.title}>Salary Summary</h2>
      <div className={styles.grid}>
        <div className={styles.item}>
          <strong>Gross Salary</strong>
          <span>{payslip.totalGrossSalary?.toLocaleString() || 'N/A'}</span>
        </div>
        <div className={styles.item}>
          <strong>Net Pay</strong>
          <span>{payslip.netPay?.toLocaleString() || 'N/A'}</span>
        </div>
        <div className={styles.item}>
          <strong>Base Salary</strong>
          <span>{payslip.earningsDetails?.baseSalary?.toLocaleString() || 'N/A'}</span>
        </div>
        <div className={styles.item}>
          <strong>Allowances</strong>
          <span>{totalAllowances.toLocaleString()}</span>
        </div>
        <div className={styles.item}>
          <strong>Bonuses</strong>
          <span>{totalBonuses.toLocaleString()}</span>
        </div>
        <div className={styles.item}>
          <strong>Total Deductions</strong>
          <span>{totalDeductions.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
