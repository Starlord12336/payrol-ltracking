/**
 * CycleFormModal Component
 * Modal for creating and editing appraisal cycles
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { hrApi } from '@/app/modules/hr/api/hrApi';
import { getDepartments, getPositions } from '@/app/modules/organization-structure/api/orgStructureApi';
import type { AppraisalCycle, CreateAppraisalCycleDto, AppraisalTemplate } from '../types';
import { AppraisalTemplateType } from '../types';
import styles from './CycleFormModal.module.css';

interface CycleFormModalProps {
  cycle?: AppraisalCycle;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CycleFormModal({
  cycle,
  isOpen,
  onClose,
  onSuccess,
}: CycleFormModalProps) {
  const isEdit = !!cycle;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Options
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<CreateAppraisalCycleDto>({
    cycleName: '',
    description: '',
    appraisalType: AppraisalTemplateType.ANNUAL,
    templateId: '',
    startDate: '',
    endDate: '',
    managerReviewDeadline: '',
    selfAssessmentDeadline: '',
    hrReviewDeadline: '',
    disputeDeadline: '',
    targetDepartmentIds: [],
    targetPositionIds: [],
    targetEmployeeIds: [],
    excludeEmployeeIds: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (isEdit && cycle) {
        // Populate edit form
        setFormData({
          cycleName: cycle.name || '',
          description: cycle.description || '',
          appraisalType: cycle.cycleType || AppraisalTemplateType.ANNUAL,
          templateId: '', // Would need to get from templateAssignments
          startDate: cycle.startDate ? new Date(cycle.startDate).toISOString().split('T')[0] : '',
          endDate: cycle.endDate ? new Date(cycle.endDate).toISOString().split('T')[0] : '',
          managerReviewDeadline: cycle.managerDueDate ? new Date(cycle.managerDueDate).toISOString().split('T')[0] : '',
          selfAssessmentDeadline: '',
          hrReviewDeadline: '',
          disputeDeadline: '',
          targetDepartmentIds: [],
          targetPositionIds: [],
          targetEmployeeIds: [],
          excludeEmployeeIds: [],
        });
      } else {
        // Reset form
        setFormData({
          cycleName: '',
          description: '',
          appraisalType: AppraisalTemplateType.ANNUAL,
          templateId: '',
          startDate: '',
          endDate: '',
          managerReviewDeadline: '',
          selfAssessmentDeadline: '',
          hrReviewDeadline: '',
          disputeDeadline: '',
          targetDepartmentIds: [],
          targetPositionIds: [],
          targetEmployeeIds: [],
          excludeEmployeeIds: [],
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cycle]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [templatesData, departmentsData, positionsData, employeesData] = await Promise.all([
        performanceApi.getTemplates(true), // Only active templates
        getDepartments({ limit: 100, isActive: true }),
        getPositions({ limit: 100, isActive: true }),
        hrApi.getAllEmployees(),
      ]);
      setTemplates(templatesData);
      setDepartments(departmentsData.data || []);
      setPositions(positionsData.data || []);
      setEmployees(employeesData);
    } catch (err: any) {
      console.error('Error fetching options:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.cycleName) {
      setError('Cycle name is required');
      return;
    }
    if (!formData.templateId) {
      setError('Template is required');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Start date and end date are required');
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }
    if (!formData.managerReviewDeadline) {
      setError('Manager review deadline is required');
      return;
    }

    try {
      setIsLoading(true);
      
      // Clean up the data
      const cleanedData: CreateAppraisalCycleDto = {
        cycleName: formData.cycleName.trim(),
        description: formData.description?.trim() || undefined,
        appraisalType: formData.appraisalType,
        templateId: formData.templateId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        managerReviewDeadline: formData.managerReviewDeadline,
        selfAssessmentDeadline: formData.selfAssessmentDeadline || undefined,
        hrReviewDeadline: formData.hrReviewDeadline || undefined,
        disputeDeadline: formData.disputeDeadline || undefined,
        targetDepartmentIds: formData.targetDepartmentIds && formData.targetDepartmentIds.length > 0 ? formData.targetDepartmentIds : undefined,
        targetPositionIds: formData.targetPositionIds && formData.targetPositionIds.length > 0 ? formData.targetPositionIds : undefined,
        targetEmployeeIds: formData.targetEmployeeIds && formData.targetEmployeeIds.length > 0 ? formData.targetEmployeeIds : undefined,
        excludeEmployeeIds: formData.excludeEmployeeIds && formData.excludeEmployeeIds.length > 0 ? formData.excludeEmployeeIds : undefined,
      };

      await performanceApi.createCycle(cleanedData);
      onSuccess();
      onClose();
    } catch (err: any) {
      let errorMessage = 'Failed to save cycle';
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error saving cycle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Appraisal Cycle' : 'Create Appraisal Cycle'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loadingOptions ? (
          <div className={styles.loading}>Loading options...</div>
        ) : (
          <div className={styles.formGrid}>
            <div className={styles.inputWrapper}>
              <Input
                id="cycleName"
                name="cycleName"
                type="text"
                label="Cycle Name *"
                value={formData.cycleName}
                onChange={(e) => setFormData({ ...formData, cycleName: e.target.value })}
                required
                disabled={isLoading}
                placeholder="e.g., Q1 2024 Performance Review"
              />
            </div>

            <div className={styles.inputWrapper}>
              <label htmlFor="appraisalType" className={styles.label}>
                Appraisal Type * <span className={styles.required}>*</span>
              </label>
              <select
                id="appraisalType"
                name="appraisalType"
                value={formData.appraisalType}
                onChange={(e) => setFormData({ ...formData, appraisalType: e.target.value })}
                required
                disabled={isLoading}
                className={styles.select}
              >
                {Object.values(AppraisalTemplateType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.selectWrapper}>
              <label htmlFor="templateId" className={styles.label}>
                Template <span className={styles.required}>*</span>
              </label>
              <select
                id="templateId"
                name="templateId"
                value={formData.templateId}
                onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                required
                disabled={isLoading}
                className={styles.select}
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputWrapper}>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                label="Start Date *"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                label="End Date *"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input
                id="managerReviewDeadline"
                name="managerReviewDeadline"
                type="date"
                label="Manager Review Deadline *"
                value={formData.managerReviewDeadline}
                onChange={(e) => setFormData({ ...formData, managerReviewDeadline: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input
                id="selfAssessmentDeadline"
                name="selfAssessmentDeadline"
                type="date"
                label="Self Assessment Deadline"
                value={formData.selfAssessmentDeadline || ''}
                onChange={(e) => setFormData({ ...formData, selfAssessmentDeadline: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input
                id="hrReviewDeadline"
                name="hrReviewDeadline"
                type="date"
                label="HR Review Deadline"
                value={formData.hrReviewDeadline || ''}
                onChange={(e) => setFormData({ ...formData, hrReviewDeadline: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputWrapper}>
              <Input
                id="disputeDeadline"
                name="disputeDeadline"
                type="date"
                label="Dispute Deadline"
                value={formData.disputeDeadline || ''}
                onChange={(e) => setFormData({ ...formData, disputeDeadline: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className={styles.textareaWrapper}>
              <label htmlFor="description" className={styles.label}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || loadingOptions}
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update Cycle' : 'Create Cycle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

