'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { payrollPolicyApi } from '../api/payrollConfigApi';
import { PayrollPolicy, CreatePayrollPolicyDto, UpdatePayrollPolicyDto, PolicyType, PolicyApplicability } from '../types';
import styles from '../page.module.css';

interface PayrollPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  policy: PayrollPolicy | null;
}

export default function PayrollPolicyModal({ isOpen, onClose, onSave, policy }: PayrollPolicyModalProps) {
  const [formData, setFormData] = useState<CreatePayrollPolicyDto>({
    policyName: '',
    policyType: PolicyType.ALLOWANCE,
    applicability: PolicyApplicability.ALL,
    effectiveDate: new Date().toISOString().split('T')[0],
    ruleDefinition: {
      percentage: 0,
      fixedAmount: 0,
      thresholdAmount: 0,
    },
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (policy) {
      setFormData({
        policyName: policy.policyName,
        policyType: policy.policyType,
        applicability: policy.applicability,
        effectiveDate: policy.effectiveDate.split('T')[0],
        ruleDefinition: policy.ruleDefinition || {
          percentage: 0,
          fixedAmount: 0,
          thresholdAmount: 0,
        },
        description: policy.description || '',
      });
    } else {
      setFormData({
        policyName: '',
        policyType: PolicyType.ALLOWANCE,
        applicability: PolicyApplicability.ALL,
        effectiveDate: new Date().toISOString().split('T')[0],
        ruleDefinition: {
          percentage: 0,
          fixedAmount: 0,
          thresholdAmount: 0,
        },
        description: '',
      });
    }
    setErrors({});
  }, [policy, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.policyName?.trim()) {
      newErrors.policyName = 'Name is required';
    }

    const effectiveDate = new Date(formData.effectiveDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (effectiveDate < today) {
      newErrors.effectiveDate = 'Effective date must be today or in the future (BR-PP-006)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      
      if (policy) {
        await payrollPolicyApi.update(policy._id, formData as UpdatePayrollPolicyDto);
      } else {
        await payrollPolicyApi.create(formData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save payroll policy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={policy ? 'Edit Payroll Policy' : 'Create Payroll Policy'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="policyName"
              value={formData.policyName}
              onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
              placeholder="e.g., Transportation Allowance"
              error={errors.policyName}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="policyType" className={styles.label}>
              Policy Type <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <select
              id="policyType"
              value={formData.policyType}
              onChange={(e) => setFormData({ ...formData, policyType: e.target.value as PolicyType })}
              className={styles.select}
            >
              <option value={PolicyType.DEDUCTION}>Deduction</option>
              <option value={PolicyType.ALLOWANCE}>Allowance</option>
              <option value={PolicyType.BONUS}>Bonus</option>
              <option value={PolicyType.PENALTY}>Penalty</option>
              <option value={PolicyType.LEAVE}>Leave</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="applicability" className={styles.label}>
              Applicability <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <select
              id="applicability"
              value={formData.applicability}
              onChange={(e) => setFormData({ ...formData, applicability: e.target.value as PolicyApplicability })}
              className={styles.select}
            >
              <option value={PolicyApplicability.ALL}>All Employees</option>
              <option value={PolicyApplicability.DEPARTMENT}>Specific Departments</option>
              <option value={PolicyApplicability.POSITION}>Specific Positions</option>
              <option value={PolicyApplicability.INDIVIDUAL}>Specific Employees</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="effectiveDate" className={styles.label}>
              Effective Date <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              error={errors.effectiveDate}
            />
            <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
              Must be today or future date (BR-PP-006)
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="percentage" className={styles.label}>
              Percentage
            </label>
            <Input
              id="percentage"
              type="number"
              step="0.01"
              value={formData.ruleDefinition.percentage}
              onChange={(e) => setFormData({ 
                ...formData, 
                ruleDefinition: { ...formData.ruleDefinition, percentage: parseFloat(e.target.value) || 0 }
              })}
              placeholder="0.00"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fixedAmount" className={styles.label}>
              Fixed Amount (EGP)
            </label>
            <Input
              id="fixedAmount"
              type="number"
              step="0.01"
              value={formData.ruleDefinition.fixedAmount}
              onChange={(e) => setFormData({ 
                ...formData, 
                ruleDefinition: { ...formData.ruleDefinition, fixedAmount: parseFloat(e.target.value) || 0 }
              })}
              placeholder="0.00"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="thresholdAmount" className={styles.label}>
              Threshold Amount (EGP)
            </label>
            <Input
              id="thresholdAmount"
              type="number"
              step="0.01"
              value={formData.ruleDefinition.thresholdAmount}
              onChange={(e) => setFormData({ 
                ...formData, 
                ruleDefinition: { ...formData.ruleDefinition, thresholdAmount: parseFloat(e.target.value) || 0 }
              })}
              placeholder="0.00"
            />
          </div>

          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description of this policy"
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : policy ? 'Update Payroll Policy' : 'Create Payroll Policy'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
