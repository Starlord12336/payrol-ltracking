// app/modules/payroll-tracking/components/PayslipTable.tsx

import React from 'react';
import { Payslip } from '../../../../shared/types/payslip';
import Link from 'next/link';
import styles from './PayslipTable.module.css';

interface Props {
  payslips: Payslip[];
}

export const PayslipTable: React.FC<Props> = ({ payslips }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Month</th>
          <th>Net Salary</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {payslips.map((payslip) => (
          <tr key={payslip._id}>
            <td>{payslip.month}</td>
            <td>{payslip.netPay}</td>
            <td>{payslip.paymentStatus}</td>
            <td className={styles.actions}>
              <Link href={`/modules/payroll-tracking/payslips/${payslip._id}`}>
                <button className={styles.viewBtn}>View Details</button>
              </Link>
              <a
                href={`/api/payroll-tracking/employee/me/payslips/${payslip._id}/download`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className={styles.downloadBtn}>Download</button>
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};