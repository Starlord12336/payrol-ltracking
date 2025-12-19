'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { signingBonusApi } from '../api/payrollConfigApi';
import { SigningBonus, CreateSigningBonusDto, UpdateSigningBonusDto } from '../types';
import { apiClient } from '@/shared/utils/api';
import styles from '../page.module.css';

interface SigningBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  bonus: SigningBonus | null;
}

export default function SigningBonusModal({ isOpen, onClose, onSave, bonus }: SigningBonusModalProps) {
  const [formData, setFormData] = useState<CreateSigningBonusDto>({
    positionName: '',
    amount: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [positionSuggestions, setPositionSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [positionSearchLoading, setPositionSearchLoading] = useState(false);

  useEffect(() => {
    if (bonus) {
      setFormData({
        positionName: bonus.positionName,
        amount: bonus.amount,
      });
    } else {
      setFormData({
        positionName: '',
        amount: 0,
      });
    }
    setErrors({});
    setPositionSuggestions([]);
    setShowSuggestions(false);
  }, [bonus, isOpen]);

  const fetchPositionSuggestions = async (query: string) => {
    if (!query.trim()) {
      setPositionSuggestions([]);
      return;
    }

    try {
      setPositionSearchLoading(true);
      // Try to fetch positions from organization structure API
      const response = await apiClient.get('/organization-structure/positions', {
        params: { search: query }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const positionNames = response.data
          .map((pos: any) => pos.title || pos.name)
          .filter((name: string) => name && name.toLowerCase().includes(query.toLowerCase()));
        setPositionSuggestions(positionNames.slice(0, 10)); // Limit to 10 suggestions
      }
    } catch (err) {
      // Gracefully fallback - organization structure API might not be available
      // Allow free text input without suggestions
      console.log('Position autocomplete not available, using free text input');
      setPositionSuggestions([]);
    } finally {
      setPositionSearchLoading(false);
    }
  };

  const handlePositionChange = (value: string) => {
    setFormData({ ...formData, positionName: value });
    setShowSuggestions(true);
    // Debounce position search
    const timeoutId = setTimeout(() => fetchPositionSuggestions(value), 300);
    return () => clearTimeout(timeoutId);
  };

  const selectPosition = (position: string) => {
    setFormData({ ...formData, positionName: position });
    setShowSuggestions(false);
    setPositionSuggestions([]);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.positionName?.trim()) {
      newErrors.positionName = 'Position name is required';
    }

    if (formData.amount < 0) {
      newErrors.amount = 'Amount cannot be negative';
    }

    if (formData.amount === 0) {
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
      if (bonus) {
        await signingBonusApi.update(bonus._id, formData as UpdateSigningBonusDto);
      } else {
        await signingBonusApi.create(formData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save signing bonus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bonus ? 'Edit Signing Bonus' : 'Create Signing Bonus'}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup} style={{ position: 'relative' }}>
            <label htmlFor="positionName" className={styles.label}>
              Position Name <span style={{ color: '#e76f51' }}>*</span>
            </label>
            <Input
              id="positionName"
              value={formData.positionName}
              onChange={(e) => handlePositionChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Start typing to search positions..."
              error={errors.positionName}
            />
            {positionSearchLoading && (
              <div style={{ 
                position: 'absolute', 
                right: '0.75rem', 
                top: '2.5rem', 
                fontSize: '0.875rem', 
                color: '#6b7280' 
              }}>
                Searching...
              </div>
            )}
            {showSuggestions && positionSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                marginTop: '0.25rem',
              }}>
                {positionSuggestions.map((position, index) => (
                  <div
                    key={index}
                    onClick={() => selectPosition(position)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      borderBottom: index < positionSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    {position}
                  </div>
                ))}
              </div>
            )}
            <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
              One signing bonus per position. Type to search or enter manually.
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>
              Bonus Amount (EGP) <span style={{ color: '#e76f51' }}>*</span>
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
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : bonus ? 'Update Signing Bonus' : 'Create Signing Bonus'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
