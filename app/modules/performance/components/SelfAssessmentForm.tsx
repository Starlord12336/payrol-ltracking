/**
 * SelfAssessmentForm Component
 * Form for employees to submit self-assessment (REQ-AE-02)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalAssignment, AppraisalTemplate } from '../types';
import styles from './SelfAssessmentForm.module.css';

interface SelfAssessmentFormProps {
  assignment: AppraisalAssignment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SelfAssessmentForm({
  assignment,
  isOpen,
  onClose,
  onSuccess,
}: SelfAssessmentFormProps) {
  const [template, setTemplate] = useState<AppraisalTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - map criteria to ratings
  const [ratings, setRatings] = useState<Record<string, { rating: number; comments: string }>>({});
  const [overallComments, setOverallComments] = useState('');

  const fetchTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const templateId = typeof (assignment as any).templateId === 'object'
        ? (assignment as any).templateId?._id || (assignment as any).templateId?.id
        : assignment.templateId;
      
      if (templateId) {
        const templateData = await performanceApi.getTemplateById(templateId);
        setTemplate(templateData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
      console.error('Error fetching template:', err);
    } finally {
      setLoading(false);
    }
  }, [assignment]);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchTemplate();
    }
  }, [isOpen, assignment, fetchTemplate]);

  useEffect(() => {
    // Initialize form when template is loaded
    if (template && template.criteria) {
      const initialRatings: Record<string, { rating: number; comments: string }> = {};
      template.criteria.forEach((criterion) => {
        initialRatings[criterion.key] = {
          rating: template.ratingScale.min,
          comments: '',
        };
      });
      setRatings(initialRatings);
    }
  }, [template]);

  const handleRatingChange = (criterionKey: string, rating: string | number) => {
    const ratingNum = typeof rating === 'string' ? parseFloat(rating) : rating;
    setRatings((prev) => ({
      ...prev,
      [criterionKey]: {
        ...prev[criterionKey],
        rating: ratingNum,
      },
    }));
  };

  const handleCommentsChange = (criterionKey: string, comments: string) => {
    setRatings((prev) => ({
      ...prev,
      [criterionKey]: {
        ...prev[criterionKey],
        comments,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!template || !template.criteria) {
      setError('Template not loaded');
      return;
    }

    // Validate required criteria
    const requiredCriteria = template.criteria.filter((c) => c.required);
    const missingRatings = requiredCriteria.filter(
      (c) => !ratings[c.key] || ratings[c.key].rating === undefined
    );

    if (missingRatings.length > 0) {
      setError(`Please provide ratings for all required criteria: ${missingRatings.map((c) => c.title).join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      
      const cycleId = typeof (assignment as any).cycleId === 'object'
        ? (assignment as any).cycleId?._id || (assignment as any).cycleId?.id
        : assignment.cycleId;
      
      const employeeId = typeof (assignment as any).employeeProfileId === 'object'
        ? (assignment as any).employeeProfileId?._id || (assignment as any).employeeProfileId?.id
        : assignment.employeeProfileId;

      if (!cycleId || !employeeId) {
        setError('Missing cycle or employee ID');
        return;
      }

      // Convert flat criteria to sections format (backend expects sections)
      // Since template has flat criteria, we create a single section
      const sections = [{
        sectionId: 'main',
        criteria: template.criteria.map((criterion) => {
          const ratingData = ratings[criterion.key];
          return {
            criteriaId: criterion.key,
            rating: ratingData?.rating !== undefined ? Number(ratingData.rating) : template.ratingScale.min,
            comments: ratingData?.comments && ratingData.comments.trim() ? ratingData.comments.trim() : undefined,
          };
        }),
      }];

      const payload = {
        sections,
        overallComments: overallComments.trim() || undefined,
      };

      console.log('Submitting self-assessment payload:', JSON.stringify(payload, null, 2));

      await performanceApi.submitSelfAssessment(cycleId, employeeId, payload);

      onSuccess();
      onClose();
    } catch (err: any) {
      let errorMessage = 'Failed to submit self-assessment';
      console.error('Error submitting self-assessment:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.response?.data?.error) {
        // NestJS validation errors
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else if (typeof err.response.data.message === 'string') {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = err.response.data.error || 'Validation failed';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const generateRatingOptions = () => {
    if (!template?.ratingScale) return [];
    
    const { min, max, step = 1 } = template.ratingScale;
    const options: number[] = [];
    for (let i = min; i <= max; i += step) {
      options.push(Math.round(i * 100) / 100); // Round to 2 decimal places
    }
    return options;
  };

  const getRatingLabel = (rating: number): string => {
    if (!template?.ratingScale?.labels || template.ratingScale.labels.length === 0) {
      return rating.toString();
    }
    
    const { min, max, labels } = template.ratingScale;
    const index = Math.round(((rating - min) / (max - min)) * (labels.length - 1));
    return labels[index] || rating.toString();
  };

  if (!template) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Self-Assessment" size="xl">
        {loading ? (
          <div className={styles.loading}>Loading template...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : null}
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Self-Assessment"
      size="xl"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {template.description && (
          <div className={styles.description}>
            <p>{template.description}</p>
          </div>
        )}

        {template.instructions && (
          <div className={styles.instructions}>
            <h4>Instructions:</h4>
            <p>{template.instructions}</p>
          </div>
        )}

        <div className={styles.ratingScaleInfo}>
          <h4>Rating Scale:</h4>
          <p>
            {template.ratingScale.min} - {template.ratingScale.max}
            {template.ratingScale.step && template.ratingScale.step !== 1 && ` (step: ${template.ratingScale.step})`}
          </p>
        </div>

        <div className={styles.criteriaList}>
          <h3>Evaluation Criteria</h3>
          {template.criteria && template.criteria.length > 0 ? (
            template.criteria.map((criterion) => (
              <div key={criterion.key} className={styles.criterionCard}>
                <div className={styles.criterionHeader}>
                  <div>
                    <h4>{criterion.title}</h4>
                    {criterion.details && (
                      <p className={styles.criterionDetails}>{criterion.details}</p>
                    )}
                    <div className={styles.criterionMeta}>
                      {criterion.weight && (
                        <span className={styles.weight}>Weight: {criterion.weight}%</span>
                      )}
                      {criterion.maxScore && (
                        <span className={styles.maxScore}>Max Score: {criterion.maxScore}</span>
                      )}
                      {criterion.required && (
                        <span className={styles.required}>Required</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.criterionInputs}>
                  <div className={styles.ratingInput}>
                    <label htmlFor={`rating-${criterion.key}`}>
                      Rating {criterion.required && <span className={styles.required}>*</span>}
                    </label>
                    <select
                      id={`rating-${criterion.key}`}
                      value={ratings[criterion.key]?.rating ?? template.ratingScale.min}
                      onChange={(e) => handleRatingChange(criterion.key, parseFloat(e.target.value))}
                      required={criterion.required}
                      className={styles.select}
                    >
                      {generateRatingOptions().map((value) => (
                        <option key={value} value={value}>
                          {value} {template.ratingScale.labels && `- ${getRatingLabel(value)}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.commentsInput}>
                    <label htmlFor={`comments-${criterion.key}`}>
                      Comments
                    </label>
                    <textarea
                      id={`comments-${criterion.key}`}
                      value={ratings[criterion.key]?.comments || ''}
                      onChange={(e) => handleCommentsChange(criterion.key, e.target.value)}
                      className={styles.textarea}
                      rows={3}
                      placeholder="Provide examples or evidence for your rating..."
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noCriteria}>No criteria defined for this template.</p>
          )}
        </div>

        <div className={styles.overallComments}>
          <label htmlFor="overallComments">
            Overall Comments
          </label>
          <textarea
            id="overallComments"
            value={overallComments}
            onChange={(e) => setOverallComments(e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="Any additional comments about your performance..."
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || loading}
          >
            {submitting ? 'Submitting...' : 'Submit Self-Assessment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

