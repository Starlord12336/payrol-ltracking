'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { terminationBenefitApi } from '../api/payrollConfigApi';
import { TerminationBenefit, CreateTerminationBenefitDto, UpdateTerminationBenefitDto, BenefitType, CalculationType } from '../types';
import styles from '../page.module.css';

interface TerminationBenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  benefit: TerminationBenefit | null;
}

export default function TerminationBenefitModal({ isOpen, onClose, onSave, benefit }: TerminationBenefitModalProps) {
  const [formData, setFormData] = useState<CreateTerminationBenefitDto>({
    name: '',
    amount: 0,
    terms: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (benefit) {
      setFormData({
        name: benefit.name,
        amount: benefit.amount,
        terms: benefit.terms || '',
      });
    } else {
      setFormData({
        name: '',
        amount: 0,
        terms: '',
      });
    }
    setErrors({});
  }, [benefit, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
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
      
      if (benefit) {
        await terminationBenefitApi.update(benefit._id, formData as UpdateTerminationBenefitDto);
      } else {
        await terminationBenefitApi.create(formData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save termination benefit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={benefit ? 'Edit Termination Benefit' : 'Create Termination Benefit'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Standard Severance Package"
              error={errors.name}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>
              Amount (EGP) <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              error={errors.amount}
            />
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="terms" className={styles.label}>
              Terms
            </label>
            <textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              placeholder="Terms and conditions for this termination benefit"
              className={styles.textarea}
              rows={4}
            />
            <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
              Describe when this benefit applies and any conditions or requirements
            </small>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : benefit ? 'Update Termination Benefit' : 'Create Termination Benefit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
