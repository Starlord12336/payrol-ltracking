'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { payTypeApi } from '../api/payrollConfigApi';
import { PayType, CreatePayTypeDto, UpdatePayTypeDto, PaySchedule } from '../types';
import styles from '../page.module.css';

interface PayTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  payType: PayType | null;
}

export default function PayTypeModal({ isOpen, onClose, onSave, payType }: PayTypeModalProps) {
  const [formData, setFormData] = useState<CreatePayTypeDto>({
    type: '',
    amount: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Valid pay types as per backend validation
  const validPayTypes = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'contract-based', label: 'Contract-based' },
  ];

  useEffect(() => {
    if (payType) {
      setFormData({
        type: payType.type,
        amount: payType.amount,
      });
    } else {
      setFormData({
        type: '',
        amount: 0,
      });
    }
    setErrors({});
  }, [payType, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type?.trim()) {
      newErrors.type = 'Type is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (payType) {
        await payTypeApi.update(payType._id, formData as UpdatePayTypeDto);
      } else {
        await payTypeApi.create(formData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save pay type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={payType ? 'Edit Pay Type' : 'Create Pay Type'}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>
              Type <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={styles.select}
              style={errors.type ? { borderColor: '#e76f51' } : {}}
            >
              <option value="">Select Pay Type</option>
              {validPayTypes.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <span style={{ color: '#e76f51', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {errors.type}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>
              Amount (EGP) <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              error={errors.amount}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : payType ? 'Update Pay Type' : 'Create Pay Type'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}