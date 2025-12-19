/**
 * ========================== EMAD ==========================
 * AllowanceModal Component
 * Modal for creating and editing allowances
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/shared/components';
import { allowanceApi } from '../api/payrollConfigApi';
import {
  AllowanceType,
  AllowanceFrequency,
} from '../types';
import type {
  Allowance,
  CreateAllowanceDto,
  UpdateAllowanceDto,
} from '../types';
import styles from '../page.module.css';

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  allowance: Allowance | null;
  readOnly?: boolean;
}

interface FormData {
  name: string;
  amount: string;
}

interface FormErrors {
  name?: string;
  amount?: string;
  general?: string;
}

const AllowanceModal: React.FC<AllowanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  allowance,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    amount: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!allowance;

  useEffect(() => {
    if (allowance) {
      setFormData({
        name: allowance.name,
        amount: allowance.amount.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        amount: '',
      });
    }
    setErrors({});
  }, [allowance, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.amount || isNaN(Number(formData.amount))) {
      newErrors.amount = 'Valid amount is required';
    } else if (Number(formData.amount) < 0) {
      newErrors.amount = 'Amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (readOnly) return;
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      const payload: CreateAllowanceDto | UpdateAllowanceDto = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
      };

      if (isEditing && allowance) {
        await allowanceApi.update(allowance._id, payload as UpdateAllowanceDto);
      } else {
        await allowanceApi.create(payload as CreateAllowanceDto);
      }

      onSave();
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.message || 'Failed to save allowance',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={readOnly ? 'View Allowance' : isEditing ? 'Edit Allowance' : 'Create Allowance'}
      size="md"
    >
      <div className={styles.modalContent}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {errors.general && (
            <div className={styles.formError} style={{ marginBottom: '1rem' }}>
              {errors.general}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Name <span>*</span>
              </label>
              <input
                type="text"
                name="name"
                className={styles.formInput}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Housing Allowance, Transport Allowance"
                disabled={readOnly}
              />
              {errors.name && <span className={styles.formError}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Amount (EGP) <span>*</span>
              </label>
              <input
                type="number"
                name="amount"
                className={styles.formInput}
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g., 1000"
                min="0"
                step="0.01"
                disabled={readOnly}
              />
              {errors.amount && <span className={styles.formError}>{errors.amount}</span>}
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={onClose}>
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
            {!readOnly && (
              <Button type="submit" variant="primary" isLoading={loading}>
                {isEditing ? 'Update' : 'Create'} Allowance
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AllowanceModal;
