'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { insuranceBracketApi } from '../api/payrollConfigApi';
import { InsuranceBracket, CreateInsuranceBracketDto, UpdateInsuranceBracketDto } from '../types';
import styles from '../page.module.css';

interface InsuranceBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  bracket: InsuranceBracket | null;
}

export default function InsuranceBracketModal({ isOpen, onClose, onSave, bracket }: InsuranceBracketModalProps) {
  const [formData, setFormData] = useState<CreateInsuranceBracketDto>({
    name: '',
    minSalary: 0,
    maxSalary: 0,
    employeeRate: 0,
    employeePercentage: 0,
    employerRate: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bracket) {
      setFormData({
        name: bracket.name,
        minSalary: bracket.minSalary,
        maxSalary: bracket.maxSalary,
        employeeRate: bracket.employeeRate,
        employeePercentage: bracket.employeePercentage,
        employerRate: bracket.employerRate,
      });
    } else {
      setFormData({
        name: '',
        minSalary: 0,
        maxSalary: 0,
        employeeRate: 0,
        employeePercentage: 0,
        employerRate: 0,
      });
    }
    setErrors({});
  }, [bracket, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.minSalary < 0) {
      newErrors.minSalary = 'Minimum salary cannot be negative';
    }

    if (formData.maxSalary <= 0) {
      newErrors.maxSalary = 'Maximum salary must be greater than 0';
    }

    if (formData.minSalary >= formData.maxSalary) {
      newErrors.maxSalary = 'Maximum salary must be greater than minimum salary';
    }

    if (formData.employeePercentage < 0 || formData.employeePercentage > 100) {
      newErrors.employeePercentage = 'Employee percentage must be between 0 and 100';
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (bracket) {
        await insuranceBracketApi.update(bracket._id, formData as UpdateInsuranceBracketDto);
      } else {
        await insuranceBracketApi.create(formData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save insurance bracket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bracket ? 'Edit Insurance Bracket' : 'Create Insurance Bracket'}
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
              placeholder="e.g., Standard Social Insurance"
              error={errors.name}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="minSalary" className={styles.label}>
              Minimum Salary (EGP) <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="minSalary"
              type="number"
              step="0.01"
              value={formData.minSalary}
              onChange={(e) => setFormData({ ...formData, minSalary: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              error={errors.minSalary}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxSalary" className={styles.label}>
              Maximum Salary (EGP) <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="maxSalary"
              type="number"
              step="0.01"
              value={formData.maxSalary}
              onChange={(e) => setFormData({ ...formData, maxSalary: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              error={errors.maxSalary}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="employeeRate" className={styles.label}>
              Employee Rate (EGP) <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="employeeRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.employeeRate}
              onChange={(e) => setFormData({ ...formData, employeeRate: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              error={errors.employeeRate}
            />
            <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
              Fixed amount deducted from employee salary
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="employerRate" className={styles.label}>
              Employer Rate (EGP) <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="employerRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.employerRate}
              onChange={(e) => setFormData({ ...formData, employerRate: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              error={errors.employerRate}
            />
            <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
              Fixed amount contributed by employer
            </small>
          </div>

        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : bracket ? 'Update Insurance Bracket' : 'Create Insurance Bracket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
