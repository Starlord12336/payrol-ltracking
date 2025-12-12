'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/shared/components';
import { updateDepartment, getDepartments, getPositionsByDepartment, assignDepartmentHead } from '../api/orgStructureApi';
import type { UpdateDepartmentDto, Department, Position } from '../types';
import styles from './CreateDepartmentForm.module.css';

interface EditDepartmentFormProps {
  department: Department;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditDepartmentForm({ department, onSuccess, onCancel }: EditDepartmentFormProps) {
  const [formData, setFormData] = useState<UpdateDepartmentDto>({
    code: department.code,
    name: department.name,
    description: department.description || '',
    costCenter: department.costCenter || '',
  });
  const [existingDepartments, setExistingDepartments] = useState<Department[]>([]);
  const [existingCodes, setExistingCodes] = useState<string[]>([]);
  const [existingCostCenters, setExistingCostCenters] = useState<string[]>([]);
  const [departmentPositions, setDepartmentPositions] = useState<Position[]>([]);
  const [selectedHeadPositionId, setSelectedHeadPositionId] = useState<string | null>(
    department.headPositionId || null
  );

  // Update selectedHeadPositionId when department changes
  useEffect(() => {
    setSelectedHeadPositionId(department.headPositionId || null);
  }, [department.headPositionId]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [costCenterError, setCostCenterError] = useState<string | null>(null);

  // Fetch existing departments and positions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsResponse, positionsResponse] = await Promise.all([
          getDepartments({ limit: 100, isActive: true }),
          getPositionsByDepartment(department._id)
        ]);
        
        setExistingDepartments(departmentsResponse.data);
        // Exclude current department code from existing codes
        setExistingCodes(
          departmentsResponse.data
            .filter(dept => dept._id !== department._id)
            .map(dept => dept.code.toUpperCase())
        );
        const costCenters = departmentsResponse.data
          .filter(dept => dept._id !== department._id)
          .map(dept => dept.costCenter?.trim().toUpperCase())
          .filter((cc): cc is string => Boolean(cc));
        setExistingCostCenters(costCenters);
        
        // Filter only active positions
        setDepartmentPositions(positionsResponse.data.filter(p => p.isActive));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [department._id]);

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

    if (codeUpper.length > 10) {
      setCodeError('Code must be 10 characters or less');
      return;
    }

    // Check if code exists (excluding current department)
    if (existingCodes.includes(codeUpper)) {
      setCodeError(`Code "${codeUpper}" already exists`);
      return;
    }

    setCodeError(null);
  }, [formData.code, existingCodes]);

  // Validate cost center in real-time
  useEffect(() => {
    if (!formData.costCenter) {
      setCostCenterError(null);
      return;
    }

    const costCenterUpper = formData.costCenter.trim().toUpperCase();
    
    if (costCenterUpper.length > 50) {
      setCostCenterError('Cost Center must be 50 characters or less');
      return;
    }

    if (existingCostCenters.includes(costCenterUpper)) {
      setCostCenterError(`Cost Center "${costCenterUpper}" already exists`);
      return;
    }

    setCostCenterError(null);
  }, [formData.costCenter, existingCostCenters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.code || !formData.name) {
      setError('Code and Name are required fields.');
      return;
    }

    const codeUpper = formData.code.trim().toUpperCase();
    
    if (codeUpper.length < 2 || codeUpper.length > 10) {
      setError('Code must be between 2 and 10 characters.');
      return;
    }

    if (existingCodes.includes(codeUpper)) {
      setError(`Department code "${codeUpper}" already exists. Please choose a different code.`);
      return;
    }

    if (codeError) {
      setError(codeError);
      return;
    }

    if (formData.name && (formData.name.length < 2 || formData.name.length > 100)) {
      setError('Name must be between 2 and 100 characters.');
      return;
    }

    if (formData.description && formData.description.length > 500) {
      setError('Description must be less than 500 characters.');
      return;
    }

    if (formData.costCenter) {
      const costCenterUpper = formData.costCenter.trim().toUpperCase();
      
      if (costCenterUpper.length > 50) {
        setError('Cost Center must be less than 50 characters.');
        return;
      }

      if (existingCostCenters.includes(costCenterUpper)) {
        setError(`Cost Center "${costCenterUpper}" already exists. Please choose a different cost center.`);
        return;
      }
    }

    if (costCenterError) {
      setError(costCenterError);
      return;
    }

    setIsLoading(true);

    try {
      const dataToSend: UpdateDepartmentDto = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        ...(formData.description?.trim() && { description: formData.description.trim() }),
        ...(formData.costCenter?.trim() && { costCenter: formData.costCenter.trim() }),
      };

      await updateDepartment(department._id, dataToSend);
      
      // Update head position if it changed
      if (selectedHeadPositionId !== (department.headPositionId || null)) {
        await assignDepartmentHead(department._id, selectedHeadPositionId);
      }
      
      onSuccess();
    } catch (err: any) {
      console.error('Error updating department:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to update department. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) setError(null);
    if (name === 'costCenter' && costCenterError) setCostCenterError(null);
    if (name === 'code' && codeError) setCodeError(null);
  };

  const handleCostCenterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setFormData((prev) => ({
        ...prev,
        costCenter: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        costCenter: value,
      }));
      setCostCenterError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
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
          label="Department Code"
          value={formData.code}
          onChange={handleChange}
          required
          fullWidth
          placeholder="e.g., IT, HR, FIN"
          helperText={codeError ? undefined : "2-10 characters, must be unique"}
          error={codeError || undefined}
          maxLength={10}
        />
        {existingCodes.length > 0 && (
          <div className={styles.existingCodes}>
            <span className={styles.existingCodesLabel}>Existing codes:</span>
            <div className={styles.codeList}>
              {existingCodes.map((code) => (
                <span key={code} className={styles.codeBadge}>
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.formRow}>
        <Input
          id="name"
          name="name"
          type="text"
          label="Department Name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          placeholder="e.g., Information Technology"
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
          placeholder="Brief description of the department..."
          maxLength={500}
          rows={4}
        />
        <span className={styles.helperText}>
          Max 500 characters ({formData.description?.length || 0}/500)
        </span>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="costCenter" className={styles.label}>
          Cost Center
          <span className={styles.optional}>(Optional)</span>
        </label>
        
        {existingCostCenters.length > 0 && (
          <div className={styles.selectWrapper}>
            <select
              id="costCenterSelect"
              value=""
              onChange={handleCostCenterSelect}
              className={styles.select}
            >
              <option value="">Select existing cost center...</option>
              {existingCostCenters.map((cc) => (
                <option key={cc} value={cc}>
                  {cc}
                </option>
              ))}
            </select>
            <span className={styles.selectDivider}>or</span>
          </div>
        )}

        <Input
          id="costCenter"
          name="costCenter"
          type="text"
          value={formData.costCenter}
          onChange={handleChange}
          fullWidth
          placeholder="e.g., CC-IT-001"
          helperText={costCenterError ? undefined : "Optional, max 50 characters, must be unique"}
          error={costCenterError || undefined}
          maxLength={50}
        />
        
        {existingCostCenters.length > 0 && (
          <div className={styles.existingCodes}>
            <span className={styles.existingCodesLabel}>Existing cost centers:</span>
            <div className={styles.codeList}>
              {existingCostCenters.map((cc) => (
                <span key={cc} className={styles.codeBadge}>
                  {cc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.formRow}>
        <label htmlFor="headPositionId" className={styles.label}>
          Department Head Position
          <span className={styles.optional}>(Optional)</span>
        </label>
        <select
          id="headPositionId"
          value={selectedHeadPositionId || ''}
          onChange={(e) => setSelectedHeadPositionId(e.target.value || null)}
          className={styles.select}
        >
          <option value="">No head position assigned</option>
          {departmentPositions.map((position) => (
            <option key={position._id} value={position._id}>
              {position.code} - {position.title}
            </option>
          ))}
        </select>
        {departmentPositions.length === 0 && (
          <span className={styles.helperText}>
            No active positions in this department. Create a position first.
          </span>
        )}
        {departmentPositions.length > 0 && (
          <span className={styles.helperText}>
            Select a position to serve as the department head. This position will be the default reporting position for other positions in this department.
          </span>
        )}
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
          Update Department
        </Button>
      </div>
    </form>
  );
}

