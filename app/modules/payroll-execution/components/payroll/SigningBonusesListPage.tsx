'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/components';
import { PayrollItem } from './PayrollItem';
import { payrollrunApi } from '../../api/payrollExecutionAPI';
import { EmployeeSigningBonus, BonusReviewAction, BonusStatus } from '../../types';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';

export const SigningBonusesListPage: React.FC = () => {
  const { user } = useAuth();
  const [bonuses, setBonuses] = useState<EmployeeSigningBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});
  const [editAmount, setEditAmount] = useState<Record<string, string>>({});
  const [showEditInput, setShowEditInput] = useState<Record<string, boolean>>({});

  // Check if user has Payroll Specialist role
  const userRoles = user?.roles || [];
  const hasPayrollSpecialistRole = userRoles.includes(SystemRole.PAYROLL_SPECIALIST);

  useEffect(() => {
    if (hasPayrollSpecialistRole) {
      loadBonuses();
    }
  }, [hasPayrollSpecialistRole]);

  const loadBonuses = async () => {
    try {
      setLoading(true);
      const data = await payrollrunApi.getAllSigningBonuses();
      setBonuses(data);
    } catch (error: any) {
      setMessage(error?.message || 'Failed to load signing bonuses');
      // Fallback to empty array if API fails
      setBonuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setMessage(null);
    try {
      await payrollrunApi.reviewSigningBonus(id, {
        reviewerId: user?.userid || 'demo-reviewer',
        action: BonusReviewAction.APPROVE,
      });
      await loadBonuses();
      setMessage('Signing bonus approved successfully');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to approve signing bonus');
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
      await payrollrunApi.reviewSigningBonus(id, {
        reviewerId: user?.userid || 'demo-reviewer',
        action: BonusReviewAction.REJECT,
        rejectionReason: rejectReason[id],
      });
      await loadBonuses();
      setMessage('Signing bonus rejected successfully');
      setRejectReason({ ...rejectReason, [id]: '' });
      setShowRejectInput({ ...showRejectInput, [id]: false });
    } catch (error: any) {
      setMessage(error?.message || 'Failed to reject signing bonus');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditAmount = async (id: string) => {
    const amountValue = parseFloat(editAmount[id]);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setMessage('Please enter a valid bonus amount greater than 0');
      return;
    }

    setProcessingId(id);
    setMessage(null);
    try {
      await payrollrunApi.editSigningBonusAmount(id, amountValue);
      await loadBonuses();
      setMessage('Signing bonus amount updated successfully');
      setShowEditInput({ ...showEditInput, [id]: false });
    } catch (error: any) {
      setMessage(error?.message || 'Failed to update signing bonus amount');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusDisplay = (status: BonusStatus): 'Pending' | 'Approved' => {
    if (status === BonusStatus.APPROVED || status === BonusStatus.PAID) {
      return 'Approved';
    }
    return 'Pending';
  };

  // Early return if user doesn't have the required role
  if (!hasPayrollSpecialistRole) {
    return (
      <div style={{ 
        padding: 48, 
        textAlign: 'center',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 8,
        color: '#dc2626'
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ fontSize: 16 }}>
          You do not have permission to access this page. Only Payroll Specialists can view signing bonuses.
        </p>
      </div>
    );
  }

  const pendingBonuses = bonuses.filter(
    (b) => b.status === BonusStatus.PENDING
  );
  const approvedBonuses = bonuses.filter(
    (b) => b.status === BonusStatus.APPROVED || b.status === BonusStatus.PAID
  );
  const rejectedBonuses = bonuses.filter(
    (b) => b.status === BonusStatus.REJECTED
  );

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading signing bonuses...</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
          Signing Bonuses
        </div>
        <div style={{ color: '#475569' }}>
          Review and approve or reject signing bonuses for employees.
        </div>
      </div>

      {message && (
        <div
          style={{
            color: message.includes('success') ? '#047857' : '#dc2626',
            background: message.includes('success') ? '#ecfdf3' : '#fef2f2',
            border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`,
            padding: 12,
            borderRadius: 8,
          }}
        >
          {message}
        </div>
      )}

      {pendingBonuses.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Pending Approval ({pendingBonuses.length})
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {pendingBonuses.map((bonus) => (
              <PayrollItem
                key={bonus._id}
                title={`Employee ID: ${bonus.employeeId}`}
                subtitle="Signing Bonus"
                amountLabel={`$${(bonus.givenAmount ?? 0).toLocaleString()}`}
                status={getStatusDisplay(bonus.status)}
                actions={
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {!showRejectInput[bonus._id] && !showEditInput[bonus._id] && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(bonus._id)}
                          isLoading={processingId === bonus._id}
                          disabled={processingId !== null}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="error"
                          onClick={() =>
                            setShowRejectInput({ ...showRejectInput, [bonus._id]: true })
                          }
                          disabled={processingId !== null}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowEditInput({ ...showEditInput, [bonus._id]: true });
                            setEditAmount({
                              ...editAmount,
                              [bonus._id]: String(bonus.givenAmount ?? 0),
                            });
                          }}
                          disabled={processingId !== null}
                        >
                          Edit Amount
                        </Button>
                      </>
                    )}

                    {showRejectInput[bonus._id] && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 300 }}>
                        <textarea
                          placeholder="Enter rejection reason..."
                          value={rejectReason[bonus._id] || ''}
                          onChange={(e) =>
                            setRejectReason({ ...rejectReason, [bonus._id]: e.target.value })
                          }
                          style={{
                            padding: 8,
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            minHeight: 60,
                            resize: 'vertical',
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            size="sm"
                            variant="error"
                            onClick={() => handleReject(bonus._id)}
                            isLoading={processingId === bonus._id}
                            disabled={processingId !== null}
                          >
                            Confirm Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowRejectInput({ ...showRejectInput, [bonus._id]: false });
                              setRejectReason({ ...rejectReason, [bonus._id]: '' });
                            }}
                            disabled={processingId !== null}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {showEditInput[bonus._id] && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260 }}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editAmount[bonus._id] ?? ''}
                          onChange={(e) =>
                            setEditAmount({ ...editAmount, [bonus._id]: e.target.value })
                          }
                          style={{
                            padding: 8,
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleEditAmount(bonus._id)}
                            isLoading={processingId === bonus._id}
                            disabled={processingId !== null}
                          >
                            Save Amount
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowEditInput({ ...showEditInput, [bonus._id]: false });
                              setEditAmount({ ...editAmount, [bonus._id]: '' });
                            }}
                            disabled={processingId !== null}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                }
                footer={
                  bonus.status === BonusStatus.PENDING
                    ? 'Awaiting approval'
                    : bonus.approvedAt
                    ? `Approved on ${new Date(bonus.approvedAt).toLocaleDateString()}`
                    : ''
                }
              />
            ))}
          </div>
        </div>
      )}

      {approvedBonuses.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Approved ({approvedBonuses.length})
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {approvedBonuses.map((bonus) => (
              <PayrollItem
                key={bonus._id}
                title={`Employee ID: ${bonus.employeeId}`}
                subtitle="Signing Bonus"
                amountLabel={`$${(bonus.givenAmount ?? 0).toLocaleString()}`}
                status="Approved"
                footer={
                  bonus.approvedAt
                    ? `Approved on ${new Date(bonus.approvedAt).toLocaleDateString()}`
                    : bonus.disbursed
                    ? `Disbursed on ${bonus.disbursedAt ? new Date(bonus.disbursedAt).toLocaleDateString() : 'N/A'}`
                    : 'Approved and ready for disbursement'
                }
              />
            ))}
          </div>
        </div>
      )}

      {rejectedBonuses.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Rejected ({rejectedBonuses.length})
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {rejectedBonuses.map((bonus) => (
              <PayrollItem
                key={bonus._id}
                title={`Employee ID: ${bonus.employeeId}`}
                subtitle="Signing Bonus"
                amountLabel={`$${(bonus.givenAmount ?? 0).toLocaleString()}`}
                status="Pending"
                footer={
                  bonus.rejectionReason
                    ? `Rejected: ${bonus.rejectionReason}`
                    : 'Rejected'
                }
              />
            ))}
          </div>
        </div>
      )}

      {bonuses.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
          No signing bonuses found.
        </div>
      )}
    </div>
  );
};

