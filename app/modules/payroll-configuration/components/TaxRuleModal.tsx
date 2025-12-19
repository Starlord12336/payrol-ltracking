/**
 * ========================== EMAD ==========================
 * TaxRuleModal Component
 * Modal for creating and editing tax rules
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { taxRuleApi } from '../api/payrollConfigApi';
import type {
  TaxRule,
  CreateTaxRuleDto,
  UpdateTaxRuleDto,
} from '../types';
import styles from '../page.module.css';

interface TaxRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  taxRule: TaxRule | null;
  readOnly?: boolean;
}

interface FormData {
  name: string;
  description: string;
  rate: string;
  minSalary: string;
  maxSalary: string;
  taxRate: string;
}

interface FormErrors {
  name?: string;
  rate?: string;
  minSalary?: string;
  maxSalary?: string;
  taxRate?: string;
  general?: string;
}

const TaxRuleModal: React.FC<TaxRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taxRule,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    rate: '',
    minSalary: '0',
    maxSalary: '',
    taxRate: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!taxRule;

  useEffect(() => {
    if (taxRule) {
      setFormData({
        name: taxRule.name,
        description: taxRule.description || '',
        rate: taxRule.rate?.toString() || '',
        minSalary: taxRule.minSalary?.toString() || '0',
        maxSalary: taxRule.maxSalary?.toString() || '',
        taxRate: taxRule.taxRate?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        rate: '',
        minSalary: '0',
        maxSalary: '',
        taxRate: '',
      });
    }
    setErrors({});
  }, [taxRule, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.rate || isNaN(Number(formData.rate))) {
      newErrors.rate = 'Valid rate is required';
    } else if (Number(formData.rate) < 0 || Number(formData.rate) > 100) {
      newErrors.rate = 'Rate must be between 0 and 100';
    }

    if (!formData.taxRate || isNaN(Number(formData.taxRate))) {
      newErrors.taxRate = 'Valid tax rate is required';
    } else if (Number(formData.taxRate) < 0 || Number(formData.taxRate) > 100) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100';
    }

    if (formData.minSalary && isNaN(Number(formData.minSalary))) {
      newErrors.minSalary = 'Min salary must be a valid number';
    }

    if (formData.maxSalary && isNaN(Number(formData.maxSalary))) {
      newErrors.maxSalary = 'Max salary must be a valid number';
    }

    if (
      formData.minSalary &&
      formData.maxSalary &&
      Number(formData.minSalary) >= Number(formData.maxSalary)
    ) {
      newErrors.maxSalary = 'Max salary must be greater than min salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: CreateTaxRuleDto | UpdateTaxRuleDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        rate: Number(formData.rate),
        minSalary: Number(formData.minSalary) || 0,
        maxSalary: formData.maxSalary ? Number(formData.maxSalary) : undefined,
        taxRate: Number(formData.taxRate),
      };

      if (isEditing && taxRule) {
        await taxRuleApi.update(taxRule._id, payload as UpdateTaxRuleDto);
      } else {
        await taxRuleApi.create(payload as CreateTaxRuleDto);
      }

      onSave();
      onClose();
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || 'Failed to save tax rule',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        readOnly
          ? 'View Tax Rule'
          : isEditing
          ? 'Edit Tax Rule'
          : 'Create Tax Rule'
      }
    >
      <div className={styles.modalContent}>
        {errors.general && (
          <div className={styles.errorBanner}>{errors.general}</div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="name">Name *</label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter tax rule name"
            disabled={readOnly}
          />
          {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter description (optional)"
            disabled={readOnly}
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="rate">Rate (%) *</label>
            <Input
              id="rate"
              type="number"
              value={formData.rate}
              onChange={(e) => handleChange('rate', e.target.value)}
              placeholder="e.g., 10"
              disabled={readOnly}
              min="0"
              max="100"
              step="0.01"
            />
            {errors.rate && <span className={styles.fieldError}>{errors.rate}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="taxRate">Tax Rate (%) *</label>
            <Input
              id="taxRate"
              type="number"
              value={formData.taxRate}
              onChange={(e) => handleChange('taxRate', e.target.value)}
              placeholder="e.g., 15"
              disabled={readOnly}
              min="0"
              max="100"
              step="0.01"
            />
            {errors.taxRate && (
              <span className={styles.fieldError}>{errors.taxRate}</span>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="minSalary">Min Salary (EGP)</label>
            <Input
              id="minSalary"
              type="number"
              value={formData.minSalary}
              onChange={(e) => handleChange('minSalary', e.target.value)}
              placeholder="e.g., 0"
              disabled={readOnly}
              min="0"
            />
            {errors.minSalary && (
              <span className={styles.fieldError}>{errors.minSalary}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxSalary">Max Salary (EGP)</label>
            <Input
              id="maxSalary"
              type="number"
              value={formData.maxSalary}
              onChange={(e) => handleChange('maxSalary', e.target.value)}
              placeholder="No limit"
              disabled={readOnly}
              min="0"
            />
            {errors.maxSalary && (
              <span className={styles.fieldError}>{errors.maxSalary}</span>
            )}
          </div>
        </div>

        {!readOnly && (
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        )}

        {readOnly && (
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaxRuleModal;
