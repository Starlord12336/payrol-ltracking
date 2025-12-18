'use client';

import React from 'react';
import { Button } from '@/shared/components';
import { PayrollItem, PayrollStatus } from './PayrollItem';

export interface PayrollPeriod {
  id: string;
  label: string;
  status: PayrollStatus;
  notes?: string;
  runId?: string;
  employees?: number;
}

interface PendingPayrollsProps {
  periods: PayrollPeriod[];
  onMarkApproved: (id: string) => void;
  onRemove: (id: string) => void;
}

export const PendingPayrolls: React.FC<PendingPayrollsProps> = ({ periods, onMarkApproved, onRemove }) => {
  if (periods.length === 0) {
    return (
      <div style={{ padding: '16px 0', color: '#475569' }}>
        No pending payrolls yet. Add a payroll period to get started.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {periods.map((period) => (
        <PayrollItem
          key={period.id}
          title={period.label}
          subtitle={period.notes || 'Awaiting draft generation'}
          status={period.status}
          actions={
            <>
              {period.status === 'Pending' && (
                <Button size="sm" variant="success" onClick={() => onMarkApproved(period.id)}>
                  Approve Period
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onRemove(period.id)}>
                Remove
              </Button>
            </>
          }
        />
      ))}
    </div>
  );
};


