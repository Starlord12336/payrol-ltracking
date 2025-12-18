'use client';

import React, { useEffect, useState } from 'react';
import { Button, Input } from '@/shared/components';
import { PayrollItem } from './PayrollItem';
import type { PayrollPeriod } from './PendingPayrolls';
import { payrollrunApi } from '../../api/payrollExecutionAPI';

export interface Draft {
  id: string;
  name: string;
  period: string;
  notes?: string;
}

interface DraftGenerationProps {
  periods: PayrollPeriod[];
  drafts: Draft[];
  onCreateDraft: (draft: Draft) => void;
}

export const DraftGeneration: React.FC<DraftGenerationProps> = ({ periods, drafts, onCreateDraft }) => {
  const [draftNotes, setDraftNotes] = useState('Include bonuses, overtime, and deductions.');
  // Filter to only show approved periods with zero employees
  const approvedPeriods = periods.filter((p) => p.status === 'Approved' && (p as any).employees === 0);
  const [periodId, setPeriodId] = useState<string>(approvedPeriods[0]?.id || '');
  const [message, setMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (approvedPeriods.length > 0 && (!periodId || !approvedPeriods.some((p) => p.id === periodId))) {
      setPeriodId(approvedPeriods[0].id);
    }
  }, [periodId, approvedPeriods]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const selectedPeriod = approvedPeriods.find((p) => p.id === periodId);
    if (!selectedPeriod) return;

    try {
      setProcessing(true);
      setMessage(null);
      // period.id here is the real payroll run id (wired from PayrollInitiationPage)
      await payrollrunApi.generatePayrollDraft(selectedPeriod.id);

      // Get the runId from the selected period
      const runId = (selectedPeriod as any).runId || selectedPeriod.id;
      
      onCreateDraft({
        id: `${Date.now()}`,
        name: runId, // Use runId as the name
        period: selectedPeriod.label,
        notes: draftNotes.trim(),
      });

      setDraftNotes('Include bonuses, overtime, and deductions.');
      setMessage('Payroll draft generated successfully.');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to generate payroll draft');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {message && (
        <div
          style={{
            color: message.includes('success') || message.includes('generated') ? '#047857' : '#dc2626',
            background: message.includes('success') || message.includes('generated') ? '#ecfdf3' : '#fef2f2',
            border: `1px solid ${
              message.includes('success') || message.includes('generated') ? '#bbf7d0' : '#fecaca'
            }`,
            padding: 10,
            borderRadius: 8,
          }}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          alignItems: 'end',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="draft-period" style={{ fontWeight: 600, color: '#0f172a' }}>
            Payroll Run (Run ID)
          </label>
          <select
            id="draft-period"
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 14,
              color: '#0f172a',
            }}
          >
            {approvedPeriods.length === 0 ? (
              <option value="">No payroll runs with zero employees available</option>
            ) : (
              approvedPeriods.map((period) => {
                const runId = (period as any).runId || period.id;
                return (
                  <option key={period.id} value={period.id}>
                    {runId} - {period.label}
                  </option>
                );
              })
            )}
          </select>
          {approvedPeriods.length === 0 && (
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Only payroll runs with zero employees can be used for draft generation.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
          <label htmlFor="draft-notes" style={{ fontWeight: 600, color: '#0f172a' }}>
            Notes
          </label>
          <textarea
            id="draft-notes"
            value={draftNotes}
            onChange={(e) => setDraftNotes(e.target.value)}
            placeholder="Key considerations for this payroll run..."
            rows={3}
            style={{
              padding: 12,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 14,
              color: '#0f172a',
              resize: 'vertical',
              minHeight: 96,
            }}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={!periodId || !approvedPeriods.length || processing}
          isLoading={processing}
        >
          Generate Draft
        </Button>
      </form>

      <div style={{ display: 'grid', gap: 10 }}>
        {drafts.length === 0 ? (
          <div style={{ color: '#475569' }}>No drafts yet. Generate one to see it here.</div>
        ) : (
          drafts.map((draft) => (
            <PayrollItem
              key={draft.id}
              title={draft.name}
              subtitle={draft.notes}
              status="Drafted"
              footer={`Period: ${draft.period}`}
            />
          ))
        )}
      </div>
    </div>
  );
};


