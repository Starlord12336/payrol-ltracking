'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { getEmployeePayslips } from '../utils/payslipService';
import { Payslip } from '../utils/payslip';
import { PayslipTable } from '../components/PayslipTable';
import styles from './payslips.module.css';

export default function PayslipListingPage() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.userid) {
      getEmployeePayslips(user.userid)
        .then(setPayslips)
        .catch((err) => {
          console.error('Error fetching payslips:', err);
          setError('Failed to load payslips');
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Payslip Listing</h1>
        <p>View all your monthly payslips</p>
      </div>
      {user?.userid && <PayslipTable payslips={payslips} employeeId={user.userid} />}
    </div>
  );
}
