'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { payrollrunApi } from '../../api/payrollExecutionAPI';
import { PayrollRuns, PayRollStatus, PayRollPaymentStatus } from '../../types';
import { Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';

const statusColorMap: Record<PayRollStatus, string> = {
  [PayRollStatus.DRAFT]: '#f59e0b',
  [PayRollStatus.UNDER_REVIEW]: '#3b82f6',
  [PayRollStatus.PENDING_FINANCE_APPROVAL]: '#2563eb',
  [PayRollStatus.REJECTED]: '#dc2626',
  [PayRollStatus.APPROVED]: '#16a34a',
  [PayRollStatus.LOCKED]: '#0f172a',
  [PayRollStatus.UNLOCKED]: '#6b7280',
};

const paymentBadgeColor: Record<PayRollPaymentStatus, string> = {
  [PayRollPaymentStatus.PAID]: '#16a34a',
  [PayRollPaymentStatus.PENDING]: '#f59e0b',
};

export const PayrollDashboard: React.FC = () => {
  const { user } = useAuth();
  const [runs, setRuns] = useState<PayrollRuns[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const data = await payrollrunApi.getPayrollRuns();
      setRuns(data);
    } catch (error: any) {
      setMessage(error?.message || 'Failed to load payroll runs');
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const totals = useMemo(() => {
    if (!runs.length) return null;
    const totalEmployees = runs.reduce((sum, r) => sum + (r.employees || 0), 0);
    const totalNet = runs.reduce((sum, r) => sum + (r.totalnetpay || 0), 0);
    const totalExceptions = runs.reduce((sum, r) => sum + (r.exceptions || 0), 0);
    return { totalEmployees, totalNet, totalExceptions };
  }, [runs]);

  const handleSubmitForReview = async (runId: string) => {
    if (!user?.userid) {
      setMessage('User not authenticated');
      return;
    }

    try {
      setSubmittingId(runId);
      setMessage(null);
      await payrollrunApi.submitForReview(runId, user.userid);
      setMessage('Payroll run submitted for review successfully');
      // Refresh the data
      await loadRuns();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || error?.message || 'Failed to submit payroll run for review');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading payroll runs...</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
            Payroll Dashboard
          </h2>
          <p style={{ color: '#475569' }}>Overview of all payroll runs.</p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={async () => {
            setRefreshing(true);
            await loadRuns();
            setRefreshing(false);
          }}
          isLoading={refreshing}
        >
          Refresh
        </Button>
      </div>

      {message && (
        <div
          style={{
            color: message.includes('successfully') ? '#16a34a' : '#dc2626',
            background: message.includes('successfully') ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.includes('successfully') ? '#bbf7d0' : '#fecaca'}`,
            padding: 12,
            borderRadius: 8,
          }}
        >
          {message}
        </div>
      )}

      {totals && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <SummaryCard label="Total Runs" value={runs.length.toString()} />
          <SummaryCard label="Total Employees" value={totals.totalEmployees.toLocaleString()} />
          <SummaryCard label="Total Net Pay" value={`$${totals.totalNet.toLocaleString()}`} />
          <SummaryCard label="Total Exceptions" value={totals.totalExceptions.toLocaleString()} />
        </div>
      )}

      {runs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
          No payroll runs found.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#0f172a', textAlign: 'left' }}>
                {['Run ID', 'Period', 'Entity', 'Status', 'Payment', 'Employees', 'Exceptions', 'Total Net Pay', 'Actions'].map(
                  (header) => (
                    <th key={header} style={{ padding: '12px 10px', fontSize: 14, fontWeight: 700 }}>
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#0f172a' }}>{run.runId}</td>
                  <td style={{ padding: '12px 10px', color: '#475569' }}>
                    {new Date(run.payrollPeriod).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#475569' }}>{run.entity}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <Badge label={run.status} color={statusColorMap[run.status] ?? '#475569'} />
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <Badge label={run.paymentStatus} color={paymentBadgeColor[run.paymentStatus]} />
                  </td>
                  <td style={{ padding: '12px 10px', color: '#0f172a' }}>{run.employees}</td>
                  <td style={{ padding: '12px 10px', color: '#0f172a' }}>{run.exceptions}</td>
                  <td style={{ padding: '12px 10px', color: '#0f172a' }}>
                    ${run.totalnetpay?.toLocaleString() ?? '0'}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {run.status === PayRollStatus.DRAFT && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitForReview(run._id)}
                        isLoading={submittingId === run._id}
                        disabled={submittingId !== null}
                      >
                        Submit for Review
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Badge: React.FC<{ label: string; color?: string }> = ({ label, color = '#475569' }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 999,
      background: `${color}15`,
      color,
      fontSize: 12,
      fontWeight: 700,
      textTransform: 'capitalize',
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        background: color,
        borderRadius: 999,
        display: 'inline-block',
      }}
    />
    {label}
  </span>
);

const SummaryCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      padding: 16,
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      background: '#fff',
      display: 'grid',
      gap: 6,
    }}
  >
    <div style={{ color: '#475569', fontSize: 14 }}>{label}</div>
    <div style={{ color: '#0f172a', fontSize: 22, fontWeight: 800 }}>{value}</div>
  </div>
);

