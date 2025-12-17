'use client';

import { useEffect, useState } from 'react';
import { getPayslipList } from '@/shared/utils/payslipService';
import { Payslip } from '@/shared/types/payslip';
import { PayslipTable } from '../components/PayslipTable';
import styles from './Payslips.module.css';

export default function PayslipListingPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPayslipList()
      .then(setPayslips)
      .catch(() => setError('Failed to load payslips'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Payslip Listing</h1>
        <p>View all your monthly payslips</p>
      </div>
      <PayslipTable payslips={payslips} />
    </div>
  );
}