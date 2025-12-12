/**
 * Change Request Modal Component
 * Allows employees to submit change requests for profile corrections
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { profileApi, type CreateChangeRequestDto } from '../api/profileApi';
import {
  Gender,
  MaritalStatus,
  EmployeeStatus,
  ContractType,
} from '@/shared/types/auth';
import {
  formatEnumValue,
  getEnumValues,
} from '@/shared/types/enums';
import styles from './ChangeRequestModal.module.css';

interface ChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fieldName: string;
  fieldLabel: string;
  currentValue: any;
  fieldType: 'text' | 'gender' | 'maritalStatus' | 'employeeStatus' | 'contractType' | 'date';
}

export default function ChangeRequestModal({
  isOpen,
  onClose,
  onSuccess,
  fieldName,
  fieldLabel,
  currentValue,
  fieldType,
}: ChangeRequestModalProps) {
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrentValue = (value: any): string => {
    if (!value) return 'N/A';
    if (fieldType === 'date') {
      try {
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return String(value);
      }
    }
    // Format enum values
    if (fieldType === 'gender' || fieldType === 'maritalStatus' || fieldType === 'employeeStatus' || fieldType === 'contractType') {
      return formatEnumValue(String(value));
    }
    if (typeof value === 'string') {
      return value;
    }
    return String(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newValue.trim()) {
      setError('Please enter the corrected value.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for this change request.');
      return;
    }

    // Validate date format if fieldType is date
    if (fieldType === 'date') {
      const date = new Date(newValue);
      if (isNaN(date.getTime())) {
        setError('Please enter a valid date.');
        return;
      }
    }

    try {
      setIsLoading(true);
      
      // Format the new value for display in description
      let formattedNewValue = newValue;
      if (fieldType === 'date') {
        try {
          formattedNewValue = new Date(newValue).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } catch {
          formattedNewValue = newValue;
        }
      } else if (fieldType === 'gender' || fieldType === 'maritalStatus' || fieldType === 'employeeStatus' || fieldType === 'contractType') {
        formattedNewValue = formatEnumValue(newValue);
      }
      
      // Build request description matching the format shown in ChangeRequestsList
      const requestDescription = `Field: ${fieldLabel}\nCurrent Value: ${formatCurrentValue(currentValue)}\nCorrected Value: ${formattedNewValue}\nAdditional Details: ${reason}`;

      const data: CreateChangeRequestDto = {
        fieldName,
        oldValue: currentValue || 'N/A',
        newValue,
        reason,
        requestDescription,
      };

      await profileApi.submitChangeRequest(data);
      
      // Reset form
      setNewValue('');
      setReason('');
      setError(null);
      
      // Call success callback
      onSuccess();
      
      // Close modal
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit change request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNewValue('');
      setReason('');
      setError(null);
      onClose();
    }
  };

  const getEnumOptions = () => {
    switch (fieldType) {
      case 'gender':
        return getEnumValues(Gender);
      case 'maritalStatus':
        return getEnumValues(MaritalStatus);
      case 'employeeStatus':
        return getEnumValues(EmployeeStatus);
      case 'contractType':
        return getEnumValues(ContractType);
      default:
        return [];
    }
  };

  const isEnumField = () => {
    return fieldType === 'gender' || fieldType === 'maritalStatus' || fieldType === 'employeeStatus' || fieldType === 'contractType';
  };

  // Reset form when modal opens or field changes
  useEffect(() => {
    if (isOpen) {
      setNewValue('');
      setReason('');
      setError(null);
    }
  }, [isOpen, fieldName]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Request Correction: ${fieldLabel}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.currentValue}>
          <strong>Current Value:</strong>
          <span>{formatCurrentValue(currentValue)}</span>
        </div>

        {isEnumField() ? (
          <div className={styles.selectWrapper}>
            <label htmlFor="newValue" className={styles.label}>
              Corrected Value <span className={styles.required}>*</span>
            </label>
            <select
              id="newValue"
              name="newValue"
              value={newValue}
              onChange={(e) => {
                setNewValue(e.target.value);
                if (error) setError(null);
              }}
              required
              disabled={isLoading}
              className={styles.select}
            >
              <option value="">Select a value...</option>
              {getEnumOptions().map((option) => (
                <option key={option} value={option}>
                  {formatEnumValue(option)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <Input
            id="newValue"
            name="newValue"
            type={fieldType === 'date' ? 'date' : 'text'}
            label="Corrected Value"
            value={newValue}
            onChange={(e) => {
              setNewValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder={fieldType === 'date' ? 'YYYY-MM-DD' : 'Enter corrected value'}
            required
            fullWidth
            disabled={isLoading}
          />
        )}

        <div className={styles.textareaWrapper}>
          <label htmlFor="reason" className={styles.label}>
            Reason for Change <span className={styles.required}>*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Please explain why this correction is needed..."
            required
            disabled={isLoading}
            rows={4}
            className={styles.textarea}
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}

