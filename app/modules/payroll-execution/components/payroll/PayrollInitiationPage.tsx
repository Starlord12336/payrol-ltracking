'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input } from '@/shared/components';
import { PayrollItem, PayrollStatus } from './PayrollItem';
import { DraftGeneration, Draft } from './DraftGeneration';
import { PayrollPeriodAdder } from './PayrollPeriodAdder';
import { payrollrunApi } from '../../api/payrollExecutionAPI';
import { PayRollStatus, PayrollRuns, BonusStatus, BenefitStatus } from '../../types';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';

interface PeriodEntry {
  id: string; // local UI id
  runId?: string; // only set after approval (API call)
  label: string;
  status: PayrollStatus;
  notes?: string;
  employees?: number;
  entity?: string; // stored locally for API call on approval
}

export const PayrollInitiationPage: React.FC = () => {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [newPeriodLabel, setNewPeriodLabel] = useState('');
  const [newPeriodEntity, setNewPeriodEntity] = useState('');
  const [newPeriodNotes, setNewPeriodNotes] = useState('');
  const [editBuffer, setEditBuffer] = useState<Record<string, { label: string; notes: string; entity?: string }>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [checkingPending, setCheckingPending] = useState(true);
  const [hasPendingItems, setHasPendingItems] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const roles = user?.roles || [];
  const hasPayrollSpecialistAccess =
    roles.includes(SystemRole.PAYROLL_SPECIALIST);

  // Check for pending signing bonuses and termination benefits
  useEffect(() => {
    const checkPendingItems = async () => {
      if (!hasPayrollSpecialistAccess) {
        setCheckingPending(false);
        return;
      }

      try {
        setCheckingPending(true);
        const [signingBonuses, terminationBenefits] = await Promise.all([
          payrollrunApi.getAllSigningBonuses(),
          payrollrunApi.getAllTerminationBenefits(),
        ]);

        const pendingBonuses = signingBonuses.filter(
          (bonus) => bonus.status === BonusStatus.PENDING,
        );
        const pendingBenefits = terminationBenefits.filter(
          (benefit) => benefit.status === BenefitStatus.PENDING,
        );

        if (pendingBonuses.length > 0 || pendingBenefits.length > 0) {
          setHasPendingItems(true);
          const messages: string[] = [];
          if (pendingBonuses.length > 0) {
            messages.push(`${pendingBonuses.length} pending signing bonus(es)`);
          }
          if (pendingBenefits.length > 0) {
            messages.push(`${pendingBenefits.length} pending termination benefit(s)`);
          }
          setPendingMessage(
            `Cannot access payroll initiation. Please review and approve all pending items: ${messages.join(', ')}.`,
          );
        } else {
          setHasPendingItems(false);
          setPendingMessage(null);
        }
      } catch (error: any) {
        console.error('Error checking pending items:', error);
        // Don't block access on error, but log it
        setHasPendingItems(false);
        setPendingMessage(null);
      } finally {
        setCheckingPending(false);
      }
    };

    checkPendingItems();
  }, [hasPayrollSpecialistAccess]);

  const mapRunToPeriod = (run: PayrollRuns): PeriodEntry => ({
    id: run._id,
    runId: run.runId || run._id,
    label: run.payrollPeriod,
    status: run.status === PayRollStatus.REJECTED ? 'Rejected' : 'Pending',
    notes: undefined,
    employees: run.employees,
  });

  // Removed loadInitialRuns - periods are now only local until approved

  const addPeriod = () => {
    const trimmed = newPeriodLabel.trim();
    const entity = newPeriodEntity.trim();
    if (!trimmed || !entity) return;

    // Add period locally without API call
    const newPeriod: PeriodEntry = {
      id: `local-${Date.now()}`,
      label: trimmed,
      status: 'Pending',
      notes: newPeriodNotes.trim() || undefined,
      entity: entity,
      employees: 0,
    };

    setPeriods((prev) => [...prev, newPeriod]);
    setNewPeriodLabel('');
    setNewPeriodEntity('');
    setNewPeriodNotes('');
    setMessage('Payroll period added locally. Approve to create via API.');
  };

  const approvePeriod = async (id: string) => {
    const period = periods.find((p) => p.id === id);
    if (!period) return;

    if (!user?.userid) {
      setMessage('User not authenticated. Please log in again.');
      return;
    }

    if (!period.entity) {
      setMessage('Entity is required. Please edit the period to add an entity.');
      return;
    }

    try {
      setProcessingId(id);
      setMessage(null);
      // Call createPayrollRun API on approval
      const created = await payrollrunApi.createPayrollRun({
        payrollPeriod: period.label,
        entity: period.entity,
        payrollSpecialistId: user.userid,
      });

      // Update the period with the API response data
      setPeriods((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: 'Approved',
                runId: created.runId || created._id,
                id: created._id, // Update to use the real ID from API
                employees: created.employees || 0,
              }
            : p,
        ),
      );
      setMessage('Payroll period created and approved. Draft generation enabled.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create payroll period';
      setMessage(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPeriod = (id: string) => {
    // Pure frontend rejection: mark as Rejected so it can be edited and re-approved.
    setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p)));
    setRejectReason((prev) => {
      const clone = { ...prev };
      delete clone[id];
      return clone;
    });
    setMessage('Payroll period marked as rejected. Edit and resubmit for approval.');
  };

  const startEdit = (period: PeriodEntry) => {
    setEditBuffer((prev) => ({
      ...prev,
      [period.id]: {
        label: period.label,
        notes: period.notes || '',
        entity: period.entity || '',
      },
    }));
  };

  const saveEdit = (id: string) => {
    const edits = editBuffer[id];
    if (!edits) return;
    const updatedLabel = edits.label.trim();
    if (!updatedLabel) {
      setMessage('Label cannot be empty.');
      return;
    }
    // Update locally without API call
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              label: updatedLabel,
              notes: edits.notes?.trim() || undefined,
              entity: edits.entity?.trim() || p.entity,
              status: 'Pending', // Reset to Pending after edit
            }
          : p,
      ),
    );
    setEditBuffer((prev) => {
      const clone = { ...prev };
      delete clone[id];
      return clone;
    });
    setMessage('Period updated locally. Approve to create via API.');
  };

  const cancelEdit = (id: string) => {
    setEditBuffer((prev) => {
      const clone = { ...prev };
      delete clone[id];
      return clone;
    });
  };

  const removePeriod = (id: string) => {
    setPeriods((prev) => prev.filter((p) => p.id !== id));
    setEditBuffer((prev) => {
      const clone = { ...prev };
      delete clone[id];
      return clone;
    });
  };

  const createDraft = (draft: Draft) => {
    setDrafts((prev) => [draft, ...prev]);
    setMessage('Draft generated successfully.');
  };

  const approvedPeriods = useMemo(
    () => periods.filter((p) => p.status === 'Approved').map((p) => ({ ...p, status: 'Approved' as const, runId: p.runId, employees: p.employees })),
    [periods],
  );

  if (!hasPayrollSpecialistAccess) {
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
          Only Payroll Specialists or Payroll Managers can initiate payroll periods.
        </p>
      </div>
    );
  }

  // Show loading state while checking for pending items
  if (checkingPending) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        Checking for pending items...
      </div>
    );
  }

  // Block access if there are pending items
  if (hasPendingItems) {
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
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Access Restricted
        </h2>
        <p style={{ fontSize: 16, marginBottom: 16 }}>
          {pendingMessage}
        </p>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Please review and approve all pending signing bonuses and termination benefits before initiating new payroll runs.
        </p>
      </div>
    );
  }

  // Removed loading check since we're not loading from API initially

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          Payroll Initiation
        </h2>
        <p style={{ color: '#475569' }}>
          Create payroll periods, have the payroll specialist approve or reject, and generate drafts for approved periods.
        </p>
      </div>

      {message && (
        <div
          style={{
            color: message.includes('reject') ? '#dc2626' : '#047857',
            background: message.includes('reject') ? '#fef2f2' : '#ecfdf3',
            border: `1px solid ${message.includes('reject') ? '#fecaca' : '#bbf7d0'}`,
            padding: 12,
            borderRadius: 8,
          }}
        >
          {message}
        </div>
      )}

      <Card padding="md" shadow="md">
        <div style={{ display: 'grid', gap: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Create Payroll Period</h3>
          <PayrollPeriodAdder
            value={newPeriodLabel}
            onChange={setNewPeriodLabel}
            onAdd={addPeriod}
            disabled={!!processingId}
          />
          <Input
            label="Entity"
            placeholder="Company or business unit name"
            value={newPeriodEntity}
            onChange={(e) => setNewPeriodEntity(e.target.value)}
            fullWidth
            required
          />
          <Input
            label="Notes (optional)"
            placeholder="Include reminders, cut-off dates, or scope."
            value={newPeriodNotes}
            onChange={(e) => setNewPeriodNotes(e.target.value)}
            fullWidth
          />
        </div>
      </Card>

      <Card padding="md" shadow="md">
        <div style={{ display: 'grid', gap: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Pending Review</h3>
          {periods.length === 0 ? (
            <div style={{ color: '#475569' }}>No periods yet. Add one above to get started.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {periods.map((period) => {
                const editing = !!editBuffer[period.id];
                return (
                  <PayrollItem
                    key={period.id}
                    title={period.label}
                    subtitle={period.entity ? `${period.entity}${period.notes ? ` - ${period.notes}` : ''}` : period.notes || 'Awaiting draft generation'}
                    status={period.status}
                    actions={
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {period.status !== 'Approved' && !editing && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => approvePeriod(period.id)}
                              isLoading={processingId === period.id}
                              disabled={processingId !== null}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="error"
                              onClick={() => {
                                setRejectReason((prev) => ({
                                  ...prev,
                                  [period.id]: prev[period.id] ?? '',
                                }));
                              }}
                              disabled={processingId !== null}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(period)}
                              disabled={processingId !== null}
                            >
                              Edit
                            </Button>
                          </>
                        )}
                        {editing && (
                          <>
                            <Input
                              label="Period Label"
                              value={editBuffer[period.id]?.label || ''}
                              onChange={(e) =>
                                setEditBuffer((prev) => ({
                                  ...prev,
                                  [period.id]: {
                                    label: e.target.value,
                                    notes: prev[period.id]?.notes || '',
                                    entity: prev[period.id]?.entity || '',
                                  },
                                }))
                              }
                              fullWidth
                            />
                            <Input
                              label="Entity"
                              value={editBuffer[period.id]?.entity || ''}
                              onChange={(e) =>
                                setEditBuffer((prev) => ({
                                  ...prev,
                                  [period.id]: {
                                    label: prev[period.id]?.label || '',
                                    notes: prev[period.id]?.notes || '',
                                    entity: e.target.value,
                                  },
                                }))
                              }
                              fullWidth
                              required
                            />
                            <Input
                              label="Notes"
                              value={editBuffer[period.id]?.notes || ''}
                              onChange={(e) =>
                                setEditBuffer((prev) => ({
                                  ...prev,
                                  [period.id]: {
                                    label: prev[period.id]?.label || '',
                                    notes: e.target.value,
                                    entity: prev[period.id]?.entity || '',
                                  },
                                }))
                              }
                              fullWidth
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => saveEdit(period.id)}
                                disabled={processingId !== null}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelEdit(period.id)}
                                disabled={processingId !== null}
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        )}
                        {rejectReason[period.id] !== undefined && !editing && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 240 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                              Rejection Reason
                            </label>
                            <textarea
                              value={rejectReason[period.id] || ''}
                              onChange={(e) =>
                                setRejectReason((prev) => ({
                                  ...prev,
                                  [period.id]: e.target.value,
                                }))
                              }
                              placeholder="Explain why this period is rejected..."
                              style={{
                                padding: 8,
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                minHeight: 60,
                              }}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <Button
                                size="sm"
                                variant="error"
                                onClick={() => rejectPeriod(period.id)}
                              >
                                Confirm Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const clone = { ...rejectReason };
                                  delete clone[period.id];
                                  setRejectReason(clone);
                                }}
                                disabled={processingId !== null}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removePeriod(period.id)}
                          disabled={processingId !== null}
                        >
                          Remove
                        </Button>
                      </div>
                    }
                    footer={
                      period.status === 'Approved'
                        ? 'Approved and ready for draft generation.'
                        : period.status === 'Rejected'
                        ? 'Rejected. Edit and resubmit for approval.'
                        : 'Awaiting specialist decision.'
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Card padding="md" shadow="md">
        <div style={{ display: 'grid', gap: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Draft Generation</h3>
          <DraftGeneration periods={approvedPeriods} drafts={drafts} onCreateDraft={createDraft} />
        </div>
      </Card>
    </div>
  );
};

