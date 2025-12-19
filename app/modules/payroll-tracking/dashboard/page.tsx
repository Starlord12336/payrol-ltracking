'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { getCurrentPayslip } from '../utils/payslipService';
import { PayrollStatusCard } from '../components/PayrollStatusCard';
import { SalarySummaryCard } from '../components/SalarySummaryCard';
import { Payslip } from '../utils/payslip';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayslip = async () => {
      if (user?.userid) {
        setLoading(true);
        setError(null);
        try {
          const currentPayslip = await getCurrentPayslip(user.userid);
          setPayslip(currentPayslip);
        } catch (err) {
          console.error('Error fetching payslip:', err);
          setError('Failed to load payslip');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPayslip();
  }, [user]);

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}><div className={styles.error}>{error}</div></div>;
  
  if (!payslip) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Employee Dashboard</h2>
        <p>No payslips found.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Employee Dashboard</h2>
      <PayrollStatusCard status={payslip.paymentStatus} />
      <SalarySummaryCard payslip={payslip} />
    </div>
  );
}
