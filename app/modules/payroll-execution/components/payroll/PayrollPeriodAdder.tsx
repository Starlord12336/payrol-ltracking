'use client';

import React from 'react';
import { Button, Input } from '@/shared/components';

interface PayrollPeriodAdderProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PayrollPeriodAdder: React.FC<PayrollPeriodAdderProps> = ({
  value,
  onChange,
  onAdd,
  placeholder = 'date format: YYYY-MM-DD',
  disabled = false,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!disabled && value.trim()) {
      onAdd();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ minWidth: 240, flex: '1 1 200px' }}>
        <Input
          id="payroll-period"
          label="Payroll Period"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          required
        />
      </div>
      <Button type="submit" variant="primary" disabled={disabled || !value.trim()}>
        Add Period
      </Button>
    </form>
  );
};


