'use client';

import React from 'react';
import { Card } from '@/shared/components';

export type PayrollStatus = 'Pending' | 'Approved' | 'Drafted' | 'Rejected' | 'Under Review' | 'Locked' | 'Unlocked' | 'Pending Finance Approval';

const badgeStyles: Record<string, React.CSSProperties> = {
  Pending: {
    backgroundColor: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa',
  },
  Approved: {
    backgroundColor: '#ecfdf3',
    color: '#047857',
    border: '1px solid #bbf7d0',
  },
  Drafted: {
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    border: '1px solid #c7d2fe',
  },
  Rejected: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  'Under Review': {
    backgroundColor: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa',
  },
  Locked: {
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    border: '1px solid #c7d2fe',
  },
  Unlocked: {
    backgroundColor: '#ecfdf3',
    color: '#047857',
    border: '1px solid #bbf7d0',
  },
  'Pending Finance Approval': {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a',
  },
};

export interface PayrollItemProps {
  title: string;
  subtitle?: string;
  amountLabel?: string;
  status?: PayrollStatus | string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const PayrollItem: React.FC<PayrollItemProps> = ({
  title,
  subtitle,
  amountLabel,
  status,
  actions,
  footer,
  children,
}) => {
  return (
    <Card className="payroll-item-card" padding="md" shadow="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{title}</div>
          {subtitle && <div style={{ color: '#475569', marginTop: 4 }}>{subtitle}</div>}
          {amountLabel && <div style={{ color: '#0f172a', marginTop: 6, fontWeight: 600 }}>{amountLabel}</div>}
        </div>
        {status && (
          <span
            style={{
              ...(badgeStyles[status] || {
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
              }),
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {status}
          </span>
        )}
      </div>

      {children && <div style={{ marginTop: 12 }}>{children}</div>}

      {actions && <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}

      {footer && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0', color: '#475569' }}>{footer}</div>
      )}
    </Card>
  );
};


