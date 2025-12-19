import React from 'react';
import { Payslip } from '../utils/payslip';
import Link from 'next/link';
import styles from './PayslipTable.module.css';

interface Props {
  payslips: Payslip[];
  employeeId: string;
}

export const PayslipTable: React.FC<Props> = ({ payslips, employeeId }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Period</th>
          <th>Gross Salary</th>
          <th>Net Pay</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {payslips.length === 0 ? (
          <tr>
            <td colSpan={5} className={styles.noData}>
              No payslips found
            </td>
          </tr>
        ) : (
          payslips.map((payslip) => (
            <tr key={payslip._id}>
              <td>{formatDate(payslip.createdAt)}</td>
              <td>{payslip.totalGrossSalary?.toLocaleString() || 'N/A'}</td>
              <td>{payslip.netPay?.toLocaleString() || 'N/A'}</td>
              <td>{payslip.paymentStatus}</td>
              <td className={styles.actions}>
                <Link href={`/modules/payroll-tracking/payslips/${payslip._id}?employeeId=${employeeId}`}>
                  <button className={styles.viewBtn}>View Details</button>
                </Link>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
