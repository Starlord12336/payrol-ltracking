/**
 * ManagerReviewForm Component
 * Form for managers to review and complete appraisals for their direct reports (REQ-AE-03, REQ-AE-04)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { useAuth } from '@/shared/hooks/useAuth';
import type { AppraisalAssignment, AppraisalTemplate } from '../types';
import styles from './ManagerReviewForm.module.css';

interface ManagerReviewFormProps {
  assignment: AppraisalAssignment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManagerReviewForm({
  assignment,
  isOpen,
  onClose,
  onSuccess,
}: ManagerReviewFormProps) {
  const { user } = useAuth();
  const [template, setTemplate] = useState<AppraisalTemplate | null>(null);
  const [employeeEvaluation, setEmployeeEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - manager ratings
  const [ratings, setRatings] = useState<Record<string, { rating: number; comments: string }>>({});
  const [strengths, setStrengths] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [developmentRecommendations, setDevelopmentRecommendations] = useState('');
  const [overallRating, setOverallRating] = useState<number>(0);
  
  // Calculate overall rating function
  const calculateOverallRating = useCallback((): number => {
    if (!template || !template.criteria || !template.ratingScale) return 0;
    
    const { min, max } = template.ratingScale;
    const scaleRange = max - min;
    
    if (scaleRange === 0) return 0; // Avoid division by zero
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    template.criteria.forEach((criterion) => {
      const rating = ratings[criterion.key]?.rating || min;
      const weight = criterion.weight || 0;
      
      // Normalize rating to 0-100% based on the rating scale
      // Example: rating 4.1 on scale 1-5 = (4.1 - 1) / (5 - 1) * 100 = 77.5%
      const normalizedPercentage = ((rating - min) / scaleRange) * 100;
      
      // Apply weight: normalizedPercentage * (weight / 100)
      totalWeightedScore += (normalizedPercentage * weight) / 100;
      totalWeight += weight;
    });
    
    // Final score is already a percentage (0-100)
    return totalWeight > 0 ? totalWeightedScore : 0;
  }, [template, ratings]);
  
  // Update overall rating when ratings change
  useEffect(() => {
    if (template) {
      const calculated = calculateOverallRating();
      setOverallRating(calculated);
    }
  }, [ratings, template, calculateOverallRating]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const templateId = typeof (assignment as any).templateId === 'object'
        ? (assignment as any).templateId?._id || (assignment as any).templateId?.id
        : assignment.templateId;
      
      const cycleId = typeof (assignment as any).cycleId === 'object'
        ? (assignment as any).cycleId?._id || (assignment as any).cycleId?.id
        : assignment.cycleId;
      
      const employeeId = typeof (assignment as any).employeeProfileId === 'object'
        ? (assignment as any).employeeProfileId?._id || (assignment as any).employeeProfileId?.id
        : assignment.employeeProfileId;
      
      // Fetch template and employee evaluation in parallel
      const [templateData, evaluationData] = await Promise.all([
        templateId ? performanceApi.getTemplateById(templateId) : null,
        cycleId && employeeId ? performanceApi.getEvaluationByCycleAndEmployee(cycleId, employeeId).catch(() => null) : null,
      ]);
      
      if (templateData) {
        setTemplate(templateData);
      }
      
      if (evaluationData) {
        setEmployeeEvaluation(evaluationData);
        // Pre-fill manager ratings if evaluation exists
        if (evaluationData.ratings && Array.isArray(evaluationData.ratings)) {
          const initialRatings: Record<string, { rating: number; comments: string }> = {};
          evaluationData.ratings.forEach((rating: any) => {
            initialRatings[rating.key] = {
              rating: rating.ratingValue || templateData?.ratingScale.min || 1,
              comments: rating.comments || '',
            };
          });
          setRatings(initialRatings);
          setOverallRating(evaluationData.totalScore || 0);
          setStrengths(evaluationData.strengths || '');
          setAreasForImprovement(evaluationData.improvementAreas || '');
        }
        } else if (templateData) {
        // Initialize empty ratings
        const initialRatings: Record<string, { rating: number; comments: string }> = {};
        templateData.criteria?.forEach((criterion) => {
          initialRatings[criterion.key] = {
            rating: templateData.ratingScale.min,
            comments: '',
          };
        });
        setRatings(initialRatings);
        // Calculate initial overall rating
        let totalWeightedScore = 0;
        let totalWeight = 0;
        templateData.criteria?.forEach((criterion) => {
          const rating = templateData.ratingScale.min;
          const weight = criterion.weight || 0;
          totalWeightedScore += (rating * weight) / 100;
          totalWeight += weight;
        });
        const initialOverall = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
        setOverallRating(initialOverall);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [assignment]);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchData();
    }
  }, [isOpen, assignment, fetchData]);

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

    if (!template || !user?.userid) {
      setError('Missing required data');
      return;
    }

    try {
      setSubmitting(true);

      const templateId = typeof (assignment as any).templateId === 'object'
        ? (assignment as any).templateId?._id || (assignment as any).templateId?.id
        : assignment.templateId;
      
      const cycleId = typeof (assignment as any).cycleId === 'object'
        ? (assignment as any).cycleId?._id || (assignment as any).cycleId?.id
        : assignment.cycleId;
      
      const employeeId = typeof (assignment as any).employeeProfileId === 'object'
        ? (assignment as any).employeeProfileId?._id || (assignment as any).employeeProfileId?.id
        : assignment.employeeProfileId;

      // Convert ratings to sections format
      const criteria = Object.entries(ratings)
        .filter(([key, value]) => value.rating !== undefined && value.rating !== null)
        .map(([key, value]) => ({
          criteriaId: key,
          rating: Number(value.rating), // Ensure it's a number
          comments: value.comments && value.comments.trim() ? value.comments.trim() : undefined,
        }));

      if (criteria.length === 0) {
        setError('Please provide at least one rating');
        return;
      }

      const sections = [{
        sectionId: 'main',
        criteria: criteria,
      }];

      const finalRating = overallRating; // Use the overallRating state value

      const payload = {
        cycleId: String(cycleId),
        templateId: String(templateId),
        employeeId: String(employeeId),
        reviewerId: String(user.userid),
        managerEvaluation: {
          sections: sections,
          overallRating: overallRating > 0 ? overallRating : undefined,
          strengths: strengths && strengths.trim() ? strengths.trim() : undefined,
          areasForImprovement: areasForImprovement && areasForImprovement.trim() ? areasForImprovement.trim() : undefined,
          developmentRecommendations: developmentRecommendations && developmentRecommendations.trim() ? developmentRecommendations.trim() : undefined,
        },
        finalRating: Number(finalRating), // Ensure it's a number
      };

      console.log('Submitting manager evaluation:', JSON.stringify(payload, null, 2));
      console.log('Payload details:', {
        sectionsCount: sections.length,
        criteriaCount: criteria.length,
        finalRating,
        overallRating,
      });

      await performanceApi.submitManagerEvaluation(cycleId, employeeId, payload);
      
      onSuccess();
    } catch (err: any) {
      console.error('Error submitting manager evaluation:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Failed to submit review';
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
    } finally {
      setSubmitting(false);
    }
  };

  if (!template) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Manager Review" size="xl">
        <div className={styles.loading}>Loading...</div>
      </Modal>
    );
  }

  const ratingScale = template.ratingScale;
  const ratingOptions: number[] = [];
  if (ratingScale) {
    const step = ratingScale.step || 1;
    for (let i = ratingScale.min; i <= ratingScale.max; i += step) {
      ratingOptions.push(parseFloat(i.toFixed(1)));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manager Review" size="xl">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Employee Self-Assessment Section */}
        {employeeEvaluation && employeeEvaluation.ratings && (
          <div className={styles.section}>
            <h3>Employee Self-Assessment</h3>
            <div className={styles.employeeRatings}>
              {employeeEvaluation.ratings.map((rating: any, index: number) => {
                const criterion = template.criteria?.find(c => c.key === rating.key);
                return (
                  <div key={index} className={styles.ratingRow}>
                    <div className={styles.criterionInfo}>
                      <strong>{criterion?.title || rating.title || 'Unknown'}</strong>
                      <span className={styles.employeeRating}>
                        Employee Rating: {rating.ratingValue} {rating.ratingLabel ? `(${rating.ratingLabel})` : ''}
                      </span>
                    </div>
                    {rating.comments && (
                      <div className={styles.employeeComments}>
                        <em>Employee Comments:</em> {rating.comments}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Manager Ratings Section */}
        <div className={styles.section}>
          <h3>Manager Ratings</h3>
          <div className={styles.criteriaList}>
            {template.criteria?.map((criterion) => {
              const rating = ratings[criterion.key] || { rating: ratingScale.min, comments: '' };
              return (
                <div key={criterion.key} className={styles.criterionCard}>
                  <div className={styles.criterionHeader}>
                    <div>
                      <strong>{criterion.title}</strong>
                      {criterion.weight && (
                        <span className={styles.weight}>Weight: {criterion.weight}%</span>
                      )}
                    </div>
                  </div>
                  {criterion.details && (
                    <p className={styles.criterionDetails}>{criterion.details}</p>
                  )}
                  <div className={styles.ratingInput}>
                    <label>Rating:</label>
                    <select
                      value={rating.rating}
                      onChange={(e) => handleRatingChange(criterion.key, e.target.value)}
                      className={styles.ratingSelect}
                    >
                      {ratingOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.commentsInput}>
                    <label>Comments:</label>
                    <textarea
                      value={rating.comments}
                      onChange={(e) => handleCommentsChange(criterion.key, e.target.value)}
                      placeholder="Add your comments about this criterion..."
                      rows={3}
                      className={styles.textarea}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Assessment Section */}
        <div className={styles.section}>
          <h3>Overall Assessment</h3>
          <div className={styles.overallFields}>
            <div className={styles.field}>
              <label htmlFor="strengths">Strengths *</label>
              <textarea
                id="strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="List the employee's key strengths..."
                rows={4}
                required
                className={styles.textarea}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="improvement">Areas for Improvement *</label>
              <textarea
                id="improvement"
                value={areasForImprovement}
                onChange={(e) => setAreasForImprovement(e.target.value)}
                placeholder="Identify areas where the employee can improve..."
                rows={4}
                required
                className={styles.textarea}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="recommendations">Development Recommendations</label>
              <textarea
                id="recommendations"
                value={developmentRecommendations}
                onChange={(e) => setDevelopmentRecommendations(e.target.value)}
                placeholder="Provide recommendations for employee development..."
                rows={4}
                className={styles.textarea}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="overallRating">
                Overall Rating: {overallRating.toFixed(1)}%
                <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '0.5rem' }}>
                  (Auto-calculated from criteria ratings. You can adjust manually if needed.)
                </span>
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  id="overallRating"
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={overallRating}
                  onChange={(e) => setOverallRating(parseFloat(e.target.value))}
                  className={styles.ratingSlider}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={overallRating}
                  onChange={(e) => setOverallRating(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '80px',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const calculated = calculateOverallRating();
                    setOverallRating(calculated);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    background: '#fff',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Reset to Auto
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" onClick={onClose} variant="secondary" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

