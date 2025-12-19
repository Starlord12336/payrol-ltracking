/**
 * FinalRatingView Component
 * REQ-OD-01: Employee views final ratings, feedback, and development notes
 * Displays comprehensive final appraisal results for employees
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Card } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalAssignment } from '../types';
import { AppraisalAssignmentStatus } from '../types';
import styles from './FinalRatingView.module.css';

interface FinalRatingViewProps {
  assignment: AppraisalAssignment | null;
  evaluationId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AppraisalEvaluation {
  _id?: string;
  ratings?: Array<{
    key: string;
    title: string;
    ratingValue: number;
    ratingLabel?: string;
    weightedScore?: number;
    comments?: string;
  }>;
  totalScore?: number;
  overallRatingLabel?: string;
  managerSummary?: string;
  strengths?: string;
  improvementAreas?: string;
  employeeAcknowledgedAt?: string;
  employeeAcknowledgementComment?: string;
  hrPublishedAt?: string;
  managerSubmittedAt?: string;
  templateId?: any;
  cycleId?: any;
  managerProfileId?: any;
}

export default function FinalRatingView({
  assignment,
  evaluationId,
  isOpen,
  onClose,
}: FinalRatingViewProps) {
  const [evaluation, setEvaluation] = useState<AppraisalEvaluation | null>(null);
  const [template, setTemplate] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get evaluation ID
      let evalId = evaluationId;
      if (!evalId && (assignment as any).latestAppraisalId) {
        evalId = (assignment as any).latestAppraisalId;
      }

      if (!evalId) {
        throw new Error('Evaluation not found. Please ensure the appraisal has been published.');
      }

      // Fetch evaluation data
      const evalData = await performanceApi.getEvaluationById(evalId);
      setEvaluation(evalData);

      // Fetch template if needed
      const templateId = evalData.templateId?._id || evalData.templateId || (assignment as any)?.templateId;
      if (templateId) {
        try {
          const templateIdStr = typeof templateId === 'object' 
            ? (templateId._id || templateId.id || String(templateId))
            : String(templateId);
          const templateData = await performanceApi.getTemplateById(templateIdStr);
          setTemplate(templateData);
        } catch (err) {
          console.warn('Could not fetch template:', err);
        }
      }

      // Fetch manager info if needed
      const managerId = evalData.managerProfileId?._id || evalData.managerProfileId || (assignment as any)?.managerProfileId;
      if (managerId && typeof managerId === 'string') {
        try {
          // Note: This assumes there's an API to get employee profile
          // If not available, we'll just show the manager ID
          setManager({ _id: managerId });
        } catch (err) {
          console.warn('Could not fetch manager:', err);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load final rating';
      setError(errorMessage);
      console.error('Error fetching evaluation data:', err);
    } finally {
      setLoading(false);
    }
  }, [assignment, evaluationId]);

  useEffect(() => {
    if (isOpen && (assignment || evaluationId)) {
      fetchEvaluationData();
    } else {
      // Reset state when modal closes
      setEvaluation(null);
      setTemplate(null);
      setManager(null);
      setError(null);
    }
  }, [isOpen, assignment, evaluationId, fetchEvaluationData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRatingColor = (score?: number, maxScore?: number) => {
    if (!score || !maxScore) return '#666';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '#28a745'; // Green
    if (percentage >= 60) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const getOverallRatingColor = (totalScore?: number) => {
    if (!totalScore) return '#666';
    if (totalScore >= 80) return '#28a745'; // Green
    if (totalScore >= 60) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Final Appraisal Rating"
      size="xl"
    >
      <div className={styles.container}>
        {loading && (
          <div className={styles.loading}>
            <p>Loading final rating...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && evaluation && (
          <>
            {/* Overall Rating Section */}
            <Card padding="lg" shadow="warm" className={styles.overallRatingCard}>
              <div className={styles.overallRatingHeader}>
                <h2>Overall Performance Rating</h2>
                {evaluation.totalScore !== undefined && (
                  <div
                    className={styles.overallScore}
                    style={{ color: getOverallRatingColor(evaluation.totalScore) }}
                  >
                    <span className={styles.scoreValue}>{evaluation.totalScore.toFixed(1)}%</span>
                    {evaluation.overallRatingLabel && (
                      <span className={styles.ratingLabel}>({evaluation.overallRatingLabel})</span>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.metaInfo}>
                {evaluation.hrPublishedAt && (
                  <div className={styles.metaItem}>
                    <strong>Published:</strong> {formatDate(evaluation.hrPublishedAt)}
                  </div>
                )}
                {evaluation.employeeAcknowledgedAt && (
                  <div className={styles.metaItem}>
                    <strong>Acknowledged:</strong> {formatDate(evaluation.employeeAcknowledgedAt)}
                  </div>
                )}
              </div>
            </Card>

            {/* Detailed Ratings Section */}
            {evaluation.ratings && evaluation.ratings.length > 0 && (
              <Card padding="lg" shadow="warm" className={styles.ratingsCard}>
                <h3>Detailed Performance Ratings</h3>
                <div className={styles.ratingsList}>
                  {evaluation.ratings.map((rating, index) => {
                    const criterion = template?.criteria?.find((c: any) => c.key === rating.key);
                    const maxScore = criterion?.maxScore || template?.ratingScale?.max || 5;
                    return (
                      <div key={index} className={styles.ratingItem}>
                        <div className={styles.ratingHeader}>
                          <h4>{rating.title || criterion?.title || 'Unknown Criterion'}</h4>
                          <div
                            className={styles.ratingValue}
                            style={{ color: getRatingColor(rating.ratingValue, maxScore) }}
                          >
                            <span className={styles.value}>{rating.ratingValue}</span>
                            <span className={styles.max}>/ {maxScore}</span>
                            {rating.ratingLabel && (
                              <span className={styles.label}>({rating.ratingLabel})</span>
                            )}
                          </div>
                        </div>
                        {criterion?.weight && (
                          <div className={styles.weightInfo}>
                            Weight: {criterion.weight}%
                            {rating.weightedScore !== undefined && (
                              <span className={styles.weightedScore}>
                                {' '}→ Weighted: {rating.weightedScore.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}
                        {rating.comments && (
                          <div className={styles.ratingComments}>
                            <strong>Manager Comments:</strong>
                            <p>{rating.comments}</p>
                          </div>
                        )}
                        {criterion?.details && (
                          <div className={styles.criterionDetails}>
                            <em>{criterion.details}</em>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Manager Summary */}
            {evaluation.managerSummary && (
              <Card padding="lg" shadow="warm" className={styles.summaryCard}>
                <h3>Manager Summary</h3>
                <div className={styles.summaryContent}>
                  <p>{evaluation.managerSummary}</p>
                </div>
              </Card>
            )}

            {/* Strengths */}
            {evaluation.strengths && (
              <Card padding="lg" shadow="warm" className={styles.strengthsCard}>
                <h3>Strengths</h3>
                <div className={styles.strengthsContent}>
                  <p>{evaluation.strengths}</p>
                </div>
              </Card>
            )}

            {/* Improvement Areas */}
            {evaluation.improvementAreas && (
              <Card padding="lg" shadow="warm" className={styles.improvementCard}>
                <h3>Areas for Improvement</h3>
                <div className={styles.improvementContent}>
                  <p>{evaluation.improvementAreas}</p>
                </div>
              </Card>
            )}

            {/* Acknowledgment Comment */}
            {evaluation.employeeAcknowledgementComment && (
              <Card padding="lg" shadow="warm" className={styles.acknowledgmentCard}>
                <h3>Your Acknowledgment Comment</h3>
                <div className={styles.acknowledgmentContent}>
                  <p>{evaluation.employeeAcknowledgementComment}</p>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className={styles.actions}>
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

