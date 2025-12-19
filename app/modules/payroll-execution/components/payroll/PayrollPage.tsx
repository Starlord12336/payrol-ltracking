'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components';
import { DraftGeneration, Draft } from './DraftGeneration';
import { PendingPayrolls, PayrollPeriod } from './PendingPayrolls';
import { PayrollPeriodAdder } from './PayrollPeriodAdder';
import { PayrollItem } from './PayrollItem';
import { payrollrunApi } from '../../api/payrollExecutionAPI';
import type { CreatePayrollRunDto, PayrollRuns } from '../../types';

interface PayrollPageProps {
  onBack?: () => void;
  unlocked?: boolean;
}

export const PayrollPage: React.FC<PayrollPageProps> = ({ onBack, unlocked = true }) => {
  const [periodInput, setPeriodInput] = useState('');
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPayrollRuns = async () => {
      setLoading(true);
      setApiMessage(null);
      try {
        const runs = await payrollrunApi.getPayrollRuns();
        setPeriods(runsToPeriods(runs));
      } catch (error: any) {
        setApiMessage(error?.message || 'Failed to fetch payroll runs, using local state.');
        setPeriods([
          { id: '2025-Q3', label: '2025-Q3', status: 'Pending', notes: 'Needs overtime validation' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadPayrollRuns();
  }, []);

  const runsToPeriods = (runs: PayrollRuns[]): PayrollPeriod[] =>
    runs.map((run) => ({
      id: run.runId,
      label: run.payrollPeriod,
      status: run.status === 'approved' ? 'Approved' : 'Pending',
      notes: run.entity,
    }));

  const handleAddPeriod = async () => {
    const cleanValue = periodInput.trim();
    if (!cleanValue) return;
    if (periods.some((p) => p.label.toLowerCase() === cleanValue.toLowerCase())) {
      setPeriodInput('');
      return;
    }
    setLoading(true);
    setApiMessage(null);
    try {
      const payload: CreatePayrollRunDto = {
        payrollPeriod: cleanValue,
        entity: 'Demo Entity', // TODO: replace with selected entity from context
        payrollSpecialistId: 'demo-user', // TODO: replace with authenticated user id
      };
      const created = await payrollrunApi.createPayrollRun(payload);
      setPeriods((prev) => [{ id: created.runId, label: created.payrollPeriod, status: 'Pending', notes: created.entity }, ...prev]);
      setPeriodInput('');
      setApiMessage('Created payroll run via API');
    } catch (error: any) {
      setApiMessage(error?.message || 'Failed to create via API, keeping local state only.');
      setPeriods((prev) => [{ id: cleanValue, label: cleanValue, status: 'Pending' }, ...prev]);
      setPeriodInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async (id: string) => {
    setLoading(true);
    setApiMessage(null);
    try {
      await payrollrunApi.generatePayrollDraft(id);
      setPeriods((prev) =>
        prev.map((period) => (period.id === id ? { ...period, status: 'Approved', notes: 'Approved period' } : period))
      );
      setApiMessage('Draft generated via API');
    } catch (error: any) {
      setApiMessage(error?.message || 'Failed to generate draft via API, updating local state.');
      setPeriods((prev) =>
        prev.map((period) => (period.id === id ? { ...period, status: 'Approved', notes: 'Approved period' } : period))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    setPeriods((prev) => prev.filter((period) => period.id !== id));
  };

  const handleCreateDraft = (draft: Draft) => {
    setDrafts((prev) => [draft, ...prev]);
  };

  const summary = useMemo(() => {
    const pending = periods.filter((p) => p.status === 'Pending').length;
    const approved = periods.filter((p) => p.status === 'Approved').length;
    return { pending, approved };
  }, [periods]);

  if (!unlocked) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>Payroll Creation Locked</div>
        <div style={{ color: '#475569' }}>
          Clear all pending signing bonuses first, then return to create payroll periods.
        </div>
        <Button variant="secondary" onClick={onBack}>
          Back to Bonuses
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Payroll Creation</div>
          <div style={{ color: '#475569' }}>Add payroll periods, manage pending runs, and generate drafts.</div>
        </div>
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            Back to Bonuses
          </Button>
        )}
      </div>

      <PayrollPeriodAdder value={periodInput} onChange={setPeriodInput} onAdd={handleAddPeriod} disabled={loading} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Pending Payrolls</div>
          <PendingPayrolls periods={periods} onMarkApproved={handleMarkReady} onRemove={handleRemove} />
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Draft Generation</div>
          <DraftGeneration periods={periods} drafts={drafts} onCreateDraft={handleCreateDraft} />
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>At-a-glance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <PayrollItem title="Pending payroll runs" status="Pending" amountLabel={`${summary.pending} remaining`} />
          <PayrollItem title="Approved periods" status="Approved" amountLabel={`${summary.approved} approved`} />
          <PayrollItem title="API Integration" subtitle="Fetching & creating via payrollrunApi" />
        </div>
      </div>

      {apiMessage && (
        <div style={{ color: '#0f172a', background: '#ecfeff', border: '1px solid #bae6fd', padding: 12, borderRadius: 8 }}>
          {apiMessage}
        </div>
      )}
    </div>
  );
};



