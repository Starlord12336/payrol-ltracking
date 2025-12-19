'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { payrollrunApi } from '../../api/payrollExecutionAPI';
import { PayrollRuns, PayRollStatus } from '../../types';

export const FinanceApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const [runs, setRuns] = useState<PayrollRuns[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const roles = user?.roles || [];
  const hasFinanceAccess = roles.includes(SystemRole.FINANCE_STAFF);

  useEffect(() => {
    if (hasFinanceAccess) {
      loadRuns();
    }
  }, [hasFinanceAccess]);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const data = await payrollrunApi.getPayrollRuns();
      setRuns(data.filter((r) => r.status === PayRollStatus.PENDING_FINANCE_APPROVAL));
    } catch (error: any) {
      setMessage(error?.message || 'Failed to load payroll runs');
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setMessage(null);
    try {
      await payrollrunApi.approveByFinance(id, {
        approverId: user?.userid || 'finance-reviewer',
      });
      await loadRuns();
      setMessage('Payroll run approved by finance');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to approve payroll run');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason[id]?.trim()) {
      setMessage('Please provide a rejection reason');
      return;
    }
    setProcessingId(id);
    setMessage(null);
    try {
      await payrollrunApi.rejectPayroll(id, {
        reviewerId: user?.userid || 'finance-reviewer',
        rejectionReason: rejectReason[id],
      });
      await loadRuns();
      setMessage('Payroll run rejected');
      setRejectReason({ ...rejectReason, [id]: '' });
    } catch (error: any) {
      setMessage(error?.message || 'Failed to reject payroll run');
    } finally {
      setProcessingId(null);
    }
  };

  if (!hasFinanceAccess) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: 'center',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          color: '#dc2626',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Access Denied</h2>
        <p style={{ fontSize: 16 }}>
          Only Finance Staff can approve or reject payroll runs pending finance approval.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading payroll runs...</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
          Finance Approvals
        </h2>
        <p style={{ color: '#475569' }}>
          Approve or reject payroll runs that are pending finance approval.
        </p>
      </div>

      {message && (
        <div
          style={{
            color: message.includes('approve') || message.includes('approved') ? '#047857' : '#dc2626',
            background: message.includes('approve') || message.includes('approved') ? '#ecfdf3' : '#fef2f2',
            border: `1px solid ${
              message.includes('approve') || message.includes('approved') ? '#bbf7d0' : '#fecaca'
            }`,
            padding: 12,
            borderRadius: 8,
          }}
        >
          {message}
        </div>
      )}

      {runs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
          No payroll runs pending finance approval.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {runs.map((run) => (
            <Card key={run._id} padding="md" shadow="md">
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{run.runId}</div>
                    <div style={{ color: '#475569' }}>
                      Period: {new Date(run.payrollPeriod).toLocaleDateString()}
                    </div>
                    <div style={{ color: '#475569' }}>Entity: {run.entity}</div>
                  </div>
                  <div style={{ textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>
                    ${run.totalnetpay?.toLocaleString() ?? '0'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, color: '#475569' }}>
                  <div>Employees: {run.employees}</div>
                  <div>Exceptions: {run.exceptions}</div>
                  <div>Status: {run.status}</div>
                  <div>Payment: {run.paymentStatus}</div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(run._id)}
                    isLoading={processingId === run._id}
                    disabled={processingId !== null}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() =>
                      setRejectReason((prev) => ({
                        ...prev,
                        [run._id]: prev[run._id] ?? '',
                      }))
                    }
                    disabled={processingId !== null}
                  >
                    Reject
                  </Button>
                  {rejectReason[run._id] !== undefined && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                      <textarea
                        placeholder="Enter rejection reason..."
                        value={rejectReason[run._id] || ''}
                        onChange={(e) =>
                          setRejectReason({
                            ...rejectReason,
                            [run._id]: e.target.value,
                          })
                        }
                        style={{
                          flex: 1,
                          minWidth: 240,
                          padding: 8,
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          minHeight: 64,
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => handleReject(run._id)}
                          isLoading={processingId === run._id}
                          disabled={processingId !== null}
                        >
                          Confirm Reject
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const clone = { ...rejectReason };
                            delete clone[run._id];
                            setRejectReason(clone);
                          }}
                          disabled={processingId !== null}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

