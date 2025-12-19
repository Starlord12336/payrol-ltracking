

import React from 'react';
import styles from './PayrollStatusCard.module.css';

interface Props {
  status: 'Paid' | 'Pending' | 'Under Review';
}

export const PayrollStatusCard: React.FC<Props> = ({ status }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Payroll Status</h2>
      <p className={styles.status}>{status}</p>
    </div>
  );
};