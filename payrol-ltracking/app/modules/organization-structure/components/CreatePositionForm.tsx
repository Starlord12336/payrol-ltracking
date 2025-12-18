'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/shared/components';
import { createPosition, getPositions } from '../api/orgStructureApi';
import type { CreatePositionDto, Position } from '../types';
import styles from './CreatePositionForm.module.css';

interface CreatePositionFormProps {
  departmentId: string;
  departmentName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreatePositionForm({
  departmentId,
  departmentName,
  onSuccess,
  onCancel,
}: CreatePositionFormProps) {
  const [formData, setFormData] = useState<CreatePositionDto>({
    code: '',
    title: '',
    description: '',
    departmentId: departmentId || '', // Ensure it's always set
  });

  // Update departmentId when prop changes
  useEffect(() => {
    if (departmentId) {
      setFormData((prev) => ({
        ...prev,
        departmentId: departmentId,
      }));
    }
  }, [departmentId]);
  const [existingPositions, setExistingPositions] = useState<Position[]>([]);
  const [existingCodes, setExistingCodes] = useState<string[]>([]);
  const [availableReportingPositions, setAvailableReportingPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  // Fetch existing positions to check for duplicates
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await getPositions({ limit: 1000, isActive: true });
        setExistingPositions(response.data);
        setExistingCodes(response.data.map(pos => pos.code.toUpperCase()));
        
        // Get positions in the same department for reporting hierarchy
        const deptPositions = response.data.filter(
          pos => pos.departmentId === departmentId && pos._id !== formData.reportsToPositionId
        );
        setAvailableReportingPositions(deptPositions);
      } catch (err) {
        console.error('Error fetching positions:', err);
      }
    };

    fetchPositions();
  }, [departmentId, formData.reportsToPositionId]);

  // Validate code in real-time
  useEffect(() => {
    if (!formData.code) {
      setCodeError(null);
      return;
    }

    const codeUpper = formData.code.trim().toUpperCase();
    
    if (codeUpper.length < 2) {
      setCodeError('Code must be at least 2 characters');
      return;
    }

    if (codeUpper.length > 20) {
      setCodeError('Code must be 20 characters or less');
      return;
    }

    if (existingCodes.includes(codeUpper)) {
      setCodeError(`Code "${codeUpper}" already exists`);
      return;
    }

    setCodeError(null);
  }, [formData.code, existingCodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.code || !formData.title) {
      setError('Code and Title are required fields.');
      return;
    }

    const codeUpper = formData.code.trim().toUpperCase();
    
    if (codeUpper.length < 2 || codeUpper.length > 20) {
      setError('Code must be between 2 and 20 characters.');
      return;
    }

    if (existingCodes.includes(codeUpper)) {
      setError(`Position code "${codeUpper}" already exists. Please choose a different code.`);
      return;
    }

    if (codeError) {
      setError(codeError);
      return;
    }

    if (formData.title.length < 2 || formData.title.length > 100) {
      setError('Title must be between 2 and 100 characters.');
      return;
    }

    if (formData.description && formData.description.length > 1000) {
      setError('Description must be less than 1000 characters.');
      return;
    }

    // Validate departmentId is present (use prop directly to ensure it's current)
    const currentDepartmentId = departmentId || formData.departmentId;
    if (!currentDepartmentId || currentDepartmentId.trim() === '') {
      setError('Department ID is missing. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Build the payload exactly as the backend DTO expects
      const dataToSend: CreatePositionDto = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        departmentId: currentDepartmentId.trim(),
      };

      // Only add optional fields if they have valid values
      if (formData.description?.trim()) {
        dataToSend.description = formData.description.trim();
      }

      // Only include reportsToPositionId if it's a valid non-empty string
      // Note: The schema has a pre-save hook that may override this based on department head
      if (formData.reportsToPositionId && formData.reportsToPositionId.trim() && formData.reportsToPositionId.trim().length > 0) {
        dataToSend.reportsToPositionId = formData.reportsToPositionId.trim();
      }

      console.log('Sending position data:', JSON.stringify(dataToSend, null, 2)); // Debug log
      console.log('Department ID being sent:', currentDepartmentId); // Debug log
      await createPosition(dataToSend);
      onSuccess();
    } catch (err: any) {
      console.error('Error creating position:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Try to extract detailed error message
      let errorMessage = 'Failed to create position. Please try again.';
      
      if (err.response?.data) {
        // Check for validation errors
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (Array.isArray(err.response.data.message)) {
          // Handle validation error array
          errorMessage = err.response.data.message.join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value, // Convert empty string to undefined for optional fields
    }));
    
    if (error) setError(null);
    if (name === 'code' && codeError) setCodeError(null);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.departmentInfo}>
        <strong>Department:</strong> {departmentName}
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className={styles.formRow}>
        <Input
          id="code"
          name="code"
          type="text"
          label="Position Code"
          value={formData.code}
          onChange={handleChange}
          required
          fullWidth
          placeholder="e.g., IT-DEV-001"
          helperText={codeError ? undefined : "2-20 characters, must be unique"}
          error={codeError || undefined}
          maxLength={20}
        />
        {existingCodes.length > 0 && (
          <div className={styles.existingCodes}>
            <span className={styles.existingCodesLabel}>Existing codes:</span>
            <div className={styles.codeList}>
              {existingCodes.slice(0, 10).map((code) => (
                <span key={code} className={styles.codeBadge}>
                  {code}
                </span>
              ))}
              {existingCodes.length > 10 && (
                <span className={styles.moreCodes}>+{existingCodes.length - 10} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.formRow}>
        <Input
          id="title"
          name="title"
          type="text"
          label="Position Title"
          value={formData.title}
          onChange={handleChange}
          required
          fullWidth
          placeholder="e.g., Senior Software Developer"
          helperText="2-100 characters"
          maxLength={100}
        />
      </div>

      <div className={styles.formRow}>
        <label htmlFor="description" className={styles.textAreaLabel}>
          Description
          <span className={styles.optional}>(Optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="Brief description of the position..."
          maxLength={1000}
          rows={4}
        />
        <span className={styles.helperText}>
          Max 1000 characters ({formData.description?.length || 0}/1000)
        </span>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="reportsToPositionId" className={styles.label}>
          Reports To Position
          <span className={styles.optional}>(Optional)</span>
        </label>
        <select
          id="reportsToPositionId"
          name="reportsToPositionId"
          value={formData.reportsToPositionId || ''}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">No reporting position (Top level)</option>
          {availableReportingPositions.map((position) => (
            <option key={position._id} value={position._id}>
              {position.code} - {position.title}
            </option>
          ))}
        </select>
        <span className={styles.helperText}>
          Select a position this position reports to (optional)
        </span>
      </div>

      <div className={styles.formActions}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create Position
        </Button>
      </div>
    </form>
  );
}

