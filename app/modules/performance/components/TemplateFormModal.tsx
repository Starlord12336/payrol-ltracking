/**
 * Template Form Modal Component
 * Create or edit appraisal templates
 * Updated to match backend schema structure
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import type { AppraisalTemplate, CreateAppraisalTemplateDto, RatingScaleDefinition, EvaluationCriterion } from '../types';
import { AppraisalTemplateType, AppraisalRatingScaleType } from '../types';
import { performanceApi } from '../api/performanceApi';
import styles from './TemplateFormModal.module.css';

interface TemplateFormModalProps {
  template: AppraisalTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TemplateFormModal({
  template,
  isOpen,
  onClose,
  onSuccess,
}: TemplateFormModalProps) {
  const isEdit = !!template;

  const [formData, setFormData] = useState<CreateAppraisalTemplateDto>({
    name: '',
    description: '',
    templateType: AppraisalTemplateType.ANNUAL,
    ratingScale: {
      type: AppraisalRatingScaleType.FIVE_POINT,
      min: 1,
      max: 5,
      step: 1.1,
      labels: [],
    },
    criteria: [],
    instructions: '',
    isActive: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        templateType: template.templateType,
        ratingScale: {
          type: template.ratingScale.type,
          min: template.ratingScale.min,
          max: template.ratingScale.max,
          step: template.ratingScale.step || 1.1,
          labels: template.ratingScale.labels || [],
        },
        criteria: template.criteria || [],
        instructions: template.instructions || '',
        applicableDepartmentIds: template.applicableDepartmentIds,
        applicablePositionIds: template.applicablePositionIds,
        isActive: template.isActive,
      });
    } else {
      // Reset to default for new template
      setFormData({
        name: '',
        description: '',
        templateType: AppraisalTemplateType.ANNUAL,
        ratingScale: {
          type: AppraisalRatingScaleType.FIVE_POINT,
          min: 1,
          max: 5,
          step: 1.1,
          labels: [],
        },
        criteria: [],
        instructions: '',
        isActive: true,
      });
    }
  }, [template, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!formData.ratingScale) {
      setError('Rating scale is required');
      return;
    }

    // Validate criteria weights if provided
    if (formData.criteria && formData.criteria.length > 0) {
      // Validate that all criteria have required fields
      for (const criterion of formData.criteria) {
        if (!criterion.key?.trim()) {
          setError('All criteria must have a key');
          return;
        }
        if (!criterion.title?.trim()) {
          setError('All criteria must have a title');
          return;
        }
      }

      // Validate weights if any criteria have weights
      const criteriaWithWeights = formData.criteria.filter(
        (c) => c.weight !== undefined && c.weight !== null && c.weight > 0,
      );
      if (criteriaWithWeights.length > 0) {
        const totalWeight = criteriaWithWeights.reduce(
          (sum, criterion) => sum + (criterion.weight || 0),
          0,
        );
        if (Math.abs(totalWeight - 100) > 0.01) {
          setError(`Criteria weights must sum to 100%. Current sum: ${totalWeight}%`);
          return;
        }
      }
    }

    try {
      setIsLoading(true);
      
      // Clean up the data - remove empty strings for optional fields
      const cleanedData: CreateAppraisalTemplateDto = {
        name: formData.name.trim(),
        templateType: formData.templateType,
        ratingScale: {
          type: formData.ratingScale.type,
          min: formData.ratingScale.min,
          max: formData.ratingScale.max,
          step: formData.ratingScale.step,
          labels: formData.ratingScale.labels,
        },
        description: formData.description?.trim() || undefined,
        instructions: formData.instructions?.trim() || undefined,
        criteria: (formData.criteria || []).map(c => ({
          key: c.key.trim(),
          title: c.title.trim(),
          details: c.details?.trim() || undefined,
          weight: c.weight,
          maxScore: c.maxScore,
          required: c.required,
        })),
        applicableDepartmentIds: formData.applicableDepartmentIds,
        applicablePositionIds: formData.applicablePositionIds,
        isActive: formData.isActive,
      };

      // Log the data being sent for debugging
      console.log('Sending template data:', cleanedData);

      if (isEdit && template?._id) {
        await performanceApi.updateTemplate(template._id, cleanedData);
      } else {
        await performanceApi.createTemplate(cleanedData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      // Extract error message from response
      let errorMessage = 'Failed to save template';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      console.error('Template creation error:', err.response?.data || err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingScaleChange = (field: keyof RatingScaleDefinition, value: any) => {
    setFormData({
      ...formData,
      ratingScale: {
        ...formData.ratingScale,
        [field]: value,
      },
    });
  };

  const addCriterion = () => {
    const newCriterion: EvaluationCriterion = {
      key: `criterion-${Date.now()}`,
      title: '',
      weight: 0,
      required: true,
    };
    setFormData({
      ...formData,
      criteria: [...(formData.criteria || []), newCriterion],
    });
  };

  const removeCriterion = (index: number) => {
    setFormData({
      ...formData,
      criteria: (formData.criteria || []).filter((_, i) => i !== index),
    });
  };

  const updateCriterion = (index: number, updates: Partial<EvaluationCriterion>) => {
    setFormData({
      ...formData,
      criteria: (formData.criteria || []).map((c, i) =>
        i === index ? { ...c, ...updates } : c
      ),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Appraisal Template' : 'Create Appraisal Template'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.formGrid}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
            disabled={isLoading}
            placeholder="e.g., Annual Performance Review 2024"
          />

          <div className={styles.selectWrapper}>
            <label htmlFor="templateType" className={styles.label}>
              Template Type <span className={styles.required}>*</span>
            </label>
            <select
              id="templateType"
              name="templateType"
              value={formData.templateType}
              onChange={(e) => setFormData({ ...formData, templateType: e.target.value as AppraisalTemplateType })}
              required
              disabled={isLoading}
              className={styles.select}
            >
              {Object.values(AppraisalTemplateType).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.textareaWrapper}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isLoading}
            rows={3}
            className={styles.textarea}
            placeholder="Template description..."
          />
        </div>

        {/* Rating Scale Section */}
        <div className={styles.section}>
          <h3>Rating Scale Configuration</h3>
          <div className={styles.formGrid}>
            <div className={styles.selectWrapper}>
              <label htmlFor="scaleType" className={styles.label}>
                Scale Type <span className={styles.required}>*</span>
              </label>
              <select
                id="scaleType"
                name="scaleType"
                value={formData.ratingScale.type}
                onChange={(e) => handleRatingScaleChange('type', e.target.value as AppraisalRatingScaleType)}
                required
                disabled={isLoading}
                className={styles.select}
              >
                {Object.values(AppraisalRatingScaleType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="min"
              name="min"
              type="number"
              label="Minimum Value"
              value={formData.ratingScale.min}
              onChange={(e) => handleRatingScaleChange('min', Number(e.target.value))}
              required
              disabled={isLoading}
              min={0}
            />

            <Input
              id="max"
              name="max"
              type="number"
              label="Maximum Value"
              value={formData.ratingScale.max}
              onChange={(e) => handleRatingScaleChange('max', Number(e.target.value))}
              required
              disabled={isLoading}
              min={formData.ratingScale.min}
            />

            <div className={styles.inputWrapper}>
              <label htmlFor="step" className={styles.label}>
                Step
              </label>
              <div className={styles.stepInputContainer}>
                <button
                  type="button"
                  className={styles.stepButton}
                  onClick={() => {
                    const currentStep = formData.ratingScale.step || 1.1;
                    const newStep = Math.max(0.1, currentStep - 1.0);
                    handleRatingScaleChange('step', newStep);
                  }}
                  disabled={isLoading}
                  aria-label="Decrease step"
                >
                  ↓
                </button>
                <input
                  id="step"
                  name="step"
                  type="number"
                  className={styles.stepInput}
                  value={formData.ratingScale.step || 1.1}
                  onChange={(e) => handleRatingScaleChange('step', Number(e.target.value) || 1.1)}
                  disabled={isLoading}
                  min={0.1}
                  step={0.1}
                />
                <button
                  type="button"
                  className={styles.stepButton}
                  onClick={() => {
                    const currentStep = formData.ratingScale.step || 1.1;
                    const newStep = currentStep + 1.0;
                    handleRatingScaleChange('step', newStep);
                  }}
                  disabled={isLoading}
                  aria-label="Increase step"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Criteria Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Evaluation Criteria</h3>
            <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
              + Add Criterion
            </Button>
          </div>

          {(formData.criteria || []).map((criterion, index) => (
            <div key={criterion.key || index} className={styles.criterionCard}>
              <div className={styles.criterionRow}>
                <Input
                  id={`criterion-key-${index}`}
                  name={`criterion-key-${index}`}
                  type="text"
                  label="Key"
                  value={criterion.key}
                  onChange={(e) => updateCriterion(index, { key: e.target.value })}
                  required
                  disabled={isLoading}
                  placeholder="e.g., code-quality"
                />
                <Input
                  id={`criterion-title-${index}`}
                  name={`criterion-title-${index}`}
                  type="text"
                  label="Title"
                  value={criterion.title}
                  onChange={(e) => updateCriterion(index, { title: e.target.value })}
                  required
                  disabled={isLoading}
                  placeholder="e.g., Code Quality"
                />
                <Input
                  id={`criterion-weight-${index}`}
                  name={`criterion-weight-${index}`}
                  type="number"
                  label="Weight (%)"
                  value={criterion.weight || 0}
                  onChange={(e) => updateCriterion(index, { weight: Number(e.target.value) })}
                  disabled={isLoading}
                  min={0}
                  max={100}
                />
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={criterion.required !== false}
                      onChange={(e) => updateCriterion(index, { required: e.target.checked })}
                      disabled={isLoading}
                    />
                    Required
                  </label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCriterion(index)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
              <div className={styles.textareaWrapper}>
                <label htmlFor={`criterion-details-${index}`} className={styles.label}>
                  Details
                </label>
                <textarea
                  id={`criterion-details-${index}`}
                  name={`criterion-details-${index}`}
                  value={criterion.details || ''}
                  onChange={(e) => updateCriterion(index, { details: e.target.value })}
                  disabled={isLoading}
                  rows={2}
                  className={styles.textarea}
                  placeholder="Criterion details..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.textareaWrapper}>
          <label htmlFor="instructions" className={styles.label}>
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            disabled={isLoading}
            rows={3}
            className={styles.textarea}
            placeholder="Instructions for using this template..."
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={isLoading}
            />
            Active
          </label>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {isEdit ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
