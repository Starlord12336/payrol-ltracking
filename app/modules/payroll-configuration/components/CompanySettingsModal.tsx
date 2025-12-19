'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { companySettingsApi } from '../api/payrollConfigApi';
import { CompanySettings, CreateCompanySettingsDto, UpdateCompanySettingsDto } from '../types';
import styles from '../page.module.css';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  companySettings: CompanySettings | null;
}

export default function CompanySettingsModal({ isOpen, onClose, onSave, companySettings }: CompanySettingsModalProps) {
  const [formData, setFormData] = useState<CreateCompanySettingsDto>({
    payDate: new Date().toISOString().split('T')[0],
    timeZone: 'Africa/Cairo',
    currency: 'EGP',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companySettings) {
      setFormData({
        payDate: companySettings.payDate.split('T')[0],
        timeZone: companySettings.timeZone,
        currency: companySettings.currency,
      });
    } else {
      setFormData({
        payDate: new Date().toISOString().split('T')[0],
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
      });
    }
    setErrors({});
  }, [companySettings, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.payDate) {
      newErrors.payDate = 'Pay date is required';
    }

    if (!formData.timeZone?.trim()) {
      newErrors.timeZone = 'Timezone is required';
    }

    if (!formData.currency?.trim()) {
      newErrors.currency = 'Currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (companySettings && companySettings._id) {
        await companySettingsApi.update(companySettings._id, formData as UpdateCompanySettingsDto);
      } else {
        await companySettingsApi.create(formData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save company settings');
    } finally {
      setLoading(false);
    }
  };

  // Common timezones
  const commonTimezones = [
    'Africa/Cairo',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Dubai',
    'Asia/Riyadh',
    'UTC',
  ];

  // Common currencies
  const commonCurrencies = [
    'EGP',
    'USD',
    'EUR',
    'GBP',
    'SAR',
    'AED',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={companySettings && companySettings._id ? 'Edit Company Settings' : 'Create Company Settings'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="payDate" className={styles.label}>
              Pay Date (Day of Month) <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="payDate"
              type="date"
              value={formData.payDate}
              onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
              error={errors.payDate}
            />
            <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
              Date when salaries are paid each month
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="timeZone" className={styles.label}>
              Timezone <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <select
              id="timeZone"
              value={formData.timeZone}
              onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
              className={styles.select}
            >
              {commonTimezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="currency" className={styles.label}>
              Currency <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className={styles.select}
            >
              {commonCurrencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          {/* Info Box */}
          <div style={{
            gridColumn: '1 / -1',
            background: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '0.375rem',
            padding: '1rem',
            marginTop: '0.5rem',
          }}>
            <h4 style={{ color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
              ℹ️ About Company Settings
            </h4>
            <ul style={{ color: '#1e40af', fontSize: '0.875rem', paddingLeft: '1.25rem', margin: 0 }}>
              <li>Only one configuration can be active at a time</li>
              <li>Approving a new configuration will replace the currently active one</li>
              <li>Historical configurations are preserved for audit purposes</li>
              <li>Changes affect all future payroll runs</li>
            </ul>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : companySettings && companySettings._id ? 'Update Company Settings' : 'Create Company Settings'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
