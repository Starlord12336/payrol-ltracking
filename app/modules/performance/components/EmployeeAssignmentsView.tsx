/**
 * EmployeeAssignmentsView Component
 * Displays assigned appraisal forms for employees (REQ-AE-01)
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalAssignment, AppraisalCycle } from '../types';
import { AppraisalAssignmentStatus } from '../types';
import SelfAssessmentForm from './SelfAssessmentForm';
import CreateDisputeModal from './CreateDisputeModal';
import AcknowledgmentModal from './AcknowledgmentModal';
import FinalRatingView from './FinalRatingView';
import PIPViewModal from './PIPViewModal';
import { useNotification } from '@/shared/hooks';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import type { PerformanceImprovementPlan } from '../types';
import styles from './EmployeeAssignmentsView.module.css';

interface EmployeeAssignmentsViewProps {
  employeeId: string;
}

export default function EmployeeAssignmentsView({ employeeId }: EmployeeAssignmentsViewProps) {
  const { user } = useAuth();
  const isHrManager = user?.roles?.includes(SystemRole.HR_MANAGER);
  // REQ-OD-07: HR Manager resolves disputes, does NOT create them
  // Even if HR Manager has DEPARTMENT_EMPLOYEE role, they should not create disputes
  const canCreateDispute = !isHrManager;
  
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<AppraisalAssignment | null>(null);
  const [isSelfAssessmentOpen, setIsSelfAssessmentOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeEvaluationId, setDisputeEvaluationId] = useState<string | undefined>(undefined);
  const [isAcknowledgmentModalOpen, setIsAcknowledgmentModalOpen] = useState(false);
  const [acknowledgmentEvaluationId, setAcknowledgmentEvaluationId] = useState<string | undefined>(undefined);
  const [isFinalRatingViewOpen, setIsFinalRatingViewOpen] = useState(false);
  const [finalRatingEvaluationId, setFinalRatingEvaluationId] = useState<string | undefined>(undefined);
  const [pips, setPips] = useState<PerformanceImprovementPlan[]>([]);
  const [selectedPIP, setSelectedPIP] = useState<PerformanceImprovementPlan | null>(null);
  const [isPIPViewOpen, setIsPIPViewOpen] = useState(false);
  const { showInfo, showSuccess, showError } = useNotification('performance');
  const hasShownNotificationRef = useRef(false); // Track if we've already shown the notification

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching assignments for employeeId:', employeeId);
      const [assignmentsData, cyclesData, pipsData] = await Promise.all([
        performanceApi.getEmployeeAssignments(employeeId),
        performanceApi.getCycles(),
        performanceApi.getPIPsByEmployee(employeeId).catch(() => []), // Fetch PIPs, but don't fail if endpoint doesn't work
      ]);
      console.log('Fetched assignments:', assignmentsData);
      console.log('Fetched cycles:', cyclesData);
      console.log('Fetched PIPs:', pipsData);
      setAssignments(assignmentsData);
      setCycles(cyclesData);
      setPips(pipsData || []);
      
      // Show notification for published appraisals that need acknowledgment
      // Only show once per component mount, not on every fetch
      const publishedAssignments = assignmentsData.filter(
        (a: AppraisalAssignment) => a.status === AppraisalAssignmentStatus.PUBLISHED
      );
      if (publishedAssignments.length > 0 && !hasShownNotificationRef.current) {
        hasShownNotificationRef.current = true; // Mark as shown
        showInfo(
          `You have ${publishedAssignments.length} published appraisal${publishedAssignments.length > 1 ? 's' : ''} ready for acknowledgment`,
          {
            title: 'New Appraisal Results',
            duration: 7000,
          }
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId, showInfo]);

  const fetchAssignments = useCallback(async (cycleId?: string) => {
    try {
      setLoading(true);
      console.log('Fetching assignments for employeeId:', employeeId, 'cycleId:', cycleId);
      const data = await performanceApi.getEmployeeAssignments(employeeId, cycleId);
      console.log('Fetched assignments (filtered):', data);
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    // Reset notification flag when component mounts or employeeId changes
    hasShownNotificationRef.current = false;
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Always fetch all assignments first, then filter by cycle if selected
    if (selectedCycleId) {
      fetchAssignments(selectedCycleId);
    } else {
      fetchAssignments();
    }
  }, [selectedCycleId, fetchAssignments]);

  const formatStatus = (status: AppraisalAssignmentStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: AppraisalAssignmentStatus) => {
    switch (status) {
      case AppraisalAssignmentStatus.NOT_STARTED:
        return styles.statusNotStarted;
      case AppraisalAssignmentStatus.IN_PROGRESS:
        return styles.statusInProgress;
      case AppraisalAssignmentStatus.SUBMITTED:
        return styles.statusSubmitted;
      case AppraisalAssignmentStatus.PUBLISHED:
        return styles.statusPublished;
      case AppraisalAssignmentStatus.ACKNOWLEDGED:
        return styles.statusAcknowledged;
      default:
        return styles.statusDefault;
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading your assignments...</div>
      </Card>
    );
  }

  if (error && assignments.length === 0) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>My Appraisal Assignments</h2>
          <p>View and complete your assigned performance appraisals</p>
        </div>
        {cycles.length > 0 && (
          <div className={styles.filter}>
            <label htmlFor="cycleFilter">Filter by Cycle:</label>
            <select
              id="cycleFilter"
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className={styles.select}
            >
              <option value="">All Cycles</option>
              {cycles.map((cycle) => (
                <option key={cycle._id} value={cycle._id}>
                  {cycle.name} ({cycle.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {assignments.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No appraisal assignments found.</p>
            <p className={styles.note}>
              {selectedCycleId
                ? `No assignments found for the selected cycle. Try selecting "All Cycles" to see all your assignments, or contact HR if you believe you should have assignments for this cycle.`
                : 'You don\'t have any appraisal assignments yet. Contact HR if you believe you should have assignments.'}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                Debug: Employee ID: {employeeId}{selectedCycleId ? `, Cycle ID: ${selectedCycleId}` : ''}
              </p>
            )}
          </div>
        </Card>
      ) : (
        <div className={styles.assignmentsGrid}>
          {assignments.map((assignment) => {
            const template = (assignment as any).templateId || assignment.template;
            const cycle = (assignment as any).cycleId || assignment.cycle;
            
            return (
              <Card key={assignment._id} padding="md" shadow="warm" className={styles.assignmentCard}>
                <div className={styles.cardHeader}>
                  <h3>
                    {template && typeof template === 'object'
                      ? template.name
                      : 'Appraisal Form'}
                  </h3>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(assignment.status)}`}>
                    {formatStatus(assignment.status)}
                  </span>
                </div>

                <div className={styles.cardDetails}>
                  {cycle && typeof cycle === 'object' && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Cycle:</span>
                      <span>{cycle.name}</span>
                    </div>
                  )}
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Assigned Date:</span>
                    <span>{formatDate(assignment.assignedAt)}</span>
                  </div>
                  {assignment.dueDate && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Due Date:</span>
                      <span>{formatDate(assignment.dueDate)}</span>
                    </div>
                  )}
                  {template && typeof template === 'object' && template.description && (
                    <div className={styles.description}>
                      <span className={styles.label}>Description:</span>
                      <p>{template.description}</p>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {/* REQ-PP-07: Employee acknowledges assignment first (NOT_STARTED → ACKNOWLEDGED) */}
                  {assignment.status === AppraisalAssignmentStatus.NOT_STARTED && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={async () => {
                        try {
                          await performanceApi.acknowledgeAssignment(assignment._id!);
                          showSuccess('Assignment acknowledged successfully');
                          fetchAssignments(selectedCycleId || undefined);
                        } catch (err: any) {
                          showError(err.response?.data?.message || err.message || 'Failed to acknowledge assignment');
                        }
                      }}
                    >
                      Acknowledge Assignment
                    </Button>
                  )}
                  
                  {/* After acknowledgment, employee can start self-assessment */}
                  {/* But NOT if assignment is PUBLISHED - once published, it's final */}
                  {(assignment.status === AppraisalAssignmentStatus.ACKNOWLEDGED ||
                    assignment.status === AppraisalAssignmentStatus.IN_PROGRESS ||
                    (assignment.status === AppraisalAssignmentStatus.SUBMITTED && 
                     !(assignment as any).latestAppraisalId)) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setIsSelfAssessmentOpen(true);
                      }}
                    >
                      {assignment.status === AppraisalAssignmentStatus.SUBMITTED
                        ? 'View/Edit Assessment'
                        : 'Start Assessment'}
                    </Button>
                  )}
                  
                  {/* View submitted assessment (read-only) if manager has reviewed */}
                  {assignment.status === AppraisalAssignmentStatus.SUBMITTED &&
                   (assignment as any).latestAppraisalId && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setIsSelfAssessmentOpen(true);
                      }}
                    >
                      View Assessment
                    </Button>
                  )}
                  
                  {/* View Final Rating only shows when published AND evaluation exists */}
                  {assignment.status === AppraisalAssignmentStatus.PUBLISHED &&
                    (assignment as any).latestAppraisalId && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setFinalRatingEvaluationId((assignment as any).latestAppraisalId);
                        setIsFinalRatingViewOpen(true);
                      }}
                    >
                      View Final Rating
                    </Button>
                  )}
                  
                  {/* Final acknowledgment after publishing (REQ-OD-01) */}
                  {assignment.status === AppraisalAssignmentStatus.PUBLISHED && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setAcknowledgmentEvaluationId((assignment as any).latestAppraisalId);
                        setIsAcknowledgmentModalOpen(true);
                      }}
                    >
                      Acknowledge Final Rating
                    </Button>
                  )}
                  {/* REQ-AE-07: Employee or HR Employee can create disputes */}
                  {/* REQ-OD-07: HR Manager resolves disputes, does NOT create them */}
                  {canCreateDispute && (assignment.status === AppraisalAssignmentStatus.SUBMITTED ||
                    assignment.status === AppraisalAssignmentStatus.PUBLISHED) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setDisputeEvaluationId((assignment as any).latestAppraisalId);
                        setIsDisputeModalOpen(true);
                      }}
                    >
                      Flag Concern
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedAssignment && (
        <>
          <SelfAssessmentForm
            assignment={selectedAssignment}
            isOpen={isSelfAssessmentOpen}
            onClose={() => {
              setIsSelfAssessmentOpen(false);
              setSelectedAssignment(null);
            }}
            onSuccess={() => {
              setIsSelfAssessmentOpen(false);
              setSelectedAssignment(null);
              fetchAssignments(selectedCycleId || undefined);
            }}
          />
          <AcknowledgmentModal
            assignment={selectedAssignment}
            evaluationId={acknowledgmentEvaluationId}
            isOpen={isAcknowledgmentModalOpen}
            onClose={() => {
              setIsAcknowledgmentModalOpen(false);
              setSelectedAssignment(null);
              setAcknowledgmentEvaluationId(undefined);
            }}
            onSuccess={() => {
              setIsAcknowledgmentModalOpen(false);
              setSelectedAssignment(null);
              setAcknowledgmentEvaluationId(undefined);
              fetchAssignments(selectedCycleId || undefined);
            }}
          />
          <CreateDisputeModal
            assignment={selectedAssignment}
            evaluationId={disputeEvaluationId}
            employeeId={employeeId}
            isOpen={isDisputeModalOpen}
            onClose={() => {
              setIsDisputeModalOpen(false);
              setSelectedAssignment(null);
              setDisputeEvaluationId(undefined);
            }}
            onSuccess={() => {
              setIsDisputeModalOpen(false);
              setSelectedAssignment(null);
              setDisputeEvaluationId(undefined);
              fetchAssignments(selectedCycleId || undefined);
            }}
          />
          <FinalRatingView
            assignment={selectedAssignment}
            evaluationId={finalRatingEvaluationId}
            isOpen={isFinalRatingViewOpen}
            onClose={() => {
              setIsFinalRatingViewOpen(false);
              setSelectedAssignment(null);
              setFinalRatingEvaluationId(undefined);
            }}
          />
        </>
      )}

      {/* Performance Improvement Plans Section */}
      {pips.length > 0 && (
        <div className={styles.pipsSection}>
          <div className={styles.sectionHeader}>
            <h3>Performance Improvement Plans</h3>
            <p>View your active and completed performance improvement plans</p>
          </div>
          <div className={styles.pipsGrid}>
            {pips.map((pip) => {
              const getStatusBadgeClass = (status: string) => {
                switch (status) {
                  case 'DRAFT':
                    return styles.pipStatusDraft;
                  case 'ACTIVE':
                    return styles.pipStatusActive;
                  case 'COMPLETED':
                    return styles.pipStatusCompleted;
                  case 'CANCELLED':
                    return styles.pipStatusCancelled;
                  default:
                    return styles.pipStatusDefault;
                }
              };

              return (
                <Card key={pip.appraisalRecordId} padding="md" shadow="warm" className={styles.pipCard}>
                  <div className={styles.cardHeader}>
                    <h4>{pip.title}</h4>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(pip.status)}`}>
                      {pip.status}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    {pip.description && (
                      <div className={styles.infoRow}>
                        <span className={styles.label}>Description:</span>
                        <span className={styles.value}>{pip.description}</span>
                      </div>
                    )}
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Start Date:</span>
                      <span className={styles.value}>{formatDate(pip.startDate)}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Target Completion:</span>
                      <span className={styles.value}>{formatDate(pip.targetCompletionDate)}</span>
                    </div>
                    {pip.actualCompletionDate && (
                      <div className={styles.infoRow}>
                        <span className={styles.label}>Completed:</span>
                        <span className={styles.value}>{formatDate(pip.actualCompletionDate)}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardActions}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedPIP(pip);
                        setIsPIPViewOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {isPIPViewOpen && selectedPIP && (
        <PIPViewModal
          pip={selectedPIP}
          isOpen={isPIPViewOpen}
          onClose={() => {
            setIsPIPViewOpen(false);
            setSelectedPIP(null);
          }}
        />
      )}
    </div>
  );
}

