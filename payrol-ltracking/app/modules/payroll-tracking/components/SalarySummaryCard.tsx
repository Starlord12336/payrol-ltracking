
import React from 'react';
import { Payslip } from '../../../../shared/types/payslip';
import styles from './SalarySummaryCard.module.css';

interface Props {
  payslip: Payslip;
}

export const SalarySummaryCard: React.FC<Props> = ({ payslip }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Salary Summary</h2>
      <div className={styles.grid}>
        <div className={styles.item}>
          <strong>Net Pay</strong>
          <span>{payslip.netPay}</span>
        </div>
        <div className={styles.item}>
          <strong>Allowances</strong>
          <span>{payslip.allowances}</span>
        </div>
        <div className={styles.item}>
          <strong>Deductions</strong>
          <span>{payslip.deductions}</span>
        </div>
        <div className={styles.item}>
          <strong>Overtime</strong>
          <span>{payslip.overtime}</span>
        </div>
        <div className={styles.item}>
          <strong>Unpaid Leave</strong>
          <span>{payslip.unpaidLeave}</span>
        </div>
      </div>
    </div>
  );
};