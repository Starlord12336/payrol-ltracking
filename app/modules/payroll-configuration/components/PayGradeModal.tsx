/**
 * ========================== EMAD ==========================
 * PayGradeModal Component
 * Modal for creating and editing pay grades
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { payGradeApi } from '../api/payrollConfigApi';
import type { PayGrade, CreatePayGradeDto, UpdatePayGradeDto } from '../types';
import styles from '../page.module.css';

interface PayGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  payGrade: PayGrade | null;
  readOnly?: boolean;
}

interface FormData {
  grade: string;
  description: string;
  baseSalary: string;
  grossSalary: string;
  currency: string;
}

interface FormErrors {
  grade?: string;
  baseSalary?: string;
  grossSalary?: string;
  general?: string;
}

const PayGradeModal: React.FC<PayGradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  payGrade,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    grade: '',
    description: '',
    baseSalary: '',
    grossSalary: '',
    currency: 'EGP',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!payGrade;

  useEffect(() => {
    if (payGrade) {
      setFormData({
        grade: payGrade.grade,
        description: payGrade.description || '',
        baseSalary: payGrade.baseSalary?.toString() || '',
        grossSalary: payGrade.grossSalary?.toString() || '',
        currency: payGrade.currency,
      });
    } else {
      setFormData({
        grade: '',
        description: '',
        baseSalary: '',
        grossSalary: '',
        currency: 'EGP',
      });
    }
    setErrors({});
  }, [payGrade, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.grade.trim()) {
      newErrors.grade = 'Grade is required';
    }

    if (!formData.baseSalary || isNaN(Number(formData.baseSalary))) {
      newErrors.baseSalary = 'Valid minimum salary is required';
    } else if (Number(formData.baseSalary) < 0) {
      newErrors.baseSalary = 'Minimum salary cannot be negative';
    }

    if (!formData.grossSalary || isNaN(Number(formData.grossSalary))) {
      newErrors.grossSalary = 'Valid maximum salary is required';
    } else if (Number(formData.grossSalary) < 0) {
      newErrors.grossSalary = 'Maximum salary cannot be negative';
    }

    if (
      formData.baseSalary &&
      formData.grossSalary &&
      Number(formData.baseSalary) > Number(formData.grossSalary)
    ) {
      newErrors.grossSalary = 'Maximum salary must be greater than minimum salary';
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

      const payload: CreatePayGradeDto | UpdatePayGradeDto = {
        grade: formData.grade.trim(),
        description: formData.description.trim() || undefined,
        baseSalary: Number(formData.baseSalary),
        grossSalary: Number(formData.grossSalary),
        currency: formData.currency,
      };

      if (isEditing && payGrade) {
        await payGradeApi.update(payGrade._id, payload as UpdatePayGradeDto);
      } else {
        await payGradeApi.create(payload as CreatePayGradeDto);
      }

      onSave();
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.message || 'Failed to save pay grade',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={readOnly ? 'View Pay Grade' : isEditing ? 'Edit Pay Grade' : 'Create Pay Grade'}
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
                name="grade"
                className={styles.formInput}
                value={formData.grade}
                onChange={handleChange}
                placeholder="e.g., Grade A, Senior Level"
                disabled={readOnly}
              />
              {errors.grade && <span className={styles.formError}>{errors.grade}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Currency</label>
              <select
                name="currency"
                className={styles.formSelect}
                value={formData.currency}
                onChange={handleChange}
                disabled={readOnly}
              >
                <option value="EGP">EGP - Egyptian Pound</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="SAR">SAR - Saudi Riyal</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Minimum Salary <span>*</span>
              </label>
              <input
                type="number"
                name="baseSalary"
                className={styles.formInput}
                value={formData.baseSalary}
                onChange={handleChange}
                placeholder="e.g., 5000"
                min="0"
                step="100"
                disabled={readOnly}
              />
              {errors.baseSalary && <span className={styles.formError}>{errors.baseSalary}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Maximum Salary <span>*</span>
              </label>
              <input
                type="number"
                name="grossSalary"
                className={styles.formInput}
                value={formData.grossSalary}
                onChange={handleChange}
                placeholder="e.g., 10000"
                min="0"
                step="100"
                disabled={readOnly}
              />
              {errors.grossSalary && <span className={styles.formError}>{errors.grossSalary}</span>}
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                name="description"
                className={styles.formTextarea}
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description for this pay grade..."
                disabled={readOnly}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={onClose}>
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
            {!readOnly && (
              <Button type="submit" variant="primary" isLoading={loading}>
                {isEditing ? 'Update' : 'Create'} Pay Grade
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PayGradeModal;
