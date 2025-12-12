/**
 * ManagerReviewsView Component
 * Displays direct reports' appraisal assignments for managers to review (REQ-AE-03)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalAssignment, AppraisalCycle } from '../types';
import { AppraisalAssignmentStatus } from '../types';
import ManagerReviewForm from './ManagerReviewForm';
import styles from './ManagerReviewsView.module.css';

interface ManagerReviewsViewProps {
  managerId: string;
}

export default function ManagerReviewsView({ managerId }: ManagerReviewsViewProps) {
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<AppraisalAssignment | null>(null);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentsData, cyclesData] = await Promise.all([
        performanceApi.getManagerAssignments(managerId),
        performanceApi.getCycles(),
      ]);
      setAssignments(assignmentsData);
      setCycles(cyclesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  const fetchAssignments = useCallback(async (cycleId?: string) => {
    try {
      setLoading(true);
      const data = await performanceApi.getManagerAssignments(managerId, cycleId);
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
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

  const handleReviewClick = (assignment: AppraisalAssignment) => {
    setSelectedAssignment(assignment);
    setIsReviewFormOpen(true);
  };

  const handleReviewSuccess = () => {
    setIsReviewFormOpen(false);
    setSelectedAssignment(null);
    fetchAssignments(selectedCycleId || undefined);
  };

  if (loading && assignments.length === 0) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading team reviews...</div>
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
          <h2>Team Reviews</h2>
          <p>Review and complete appraisals for your direct reports</p>
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
            <p>No team reviews found.</p>
            <p className={styles.note}>
              {selectedCycleId
                ? 'No assignments found for the selected cycle.'
                : 'You don\'t have any direct reports with appraisal assignments yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.assignmentsGrid}>
          {assignments.map((assignment) => {
            const employee = (assignment as any).employeeProfileId || assignment.employee;
            const template = (assignment as any).templateId || assignment.template;
            const cycle = (assignment as any).cycleId || assignment.cycle;
            
            return (
              <Card key={assignment._id} padding="md" shadow="warm" className={styles.assignmentCard}>
                <div className={styles.cardHeader}>
                  <h3>
                    {employee && typeof employee === 'object'
                      ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee'
                      : 'Employee'}
                  </h3>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(assignment.status)}`}>
                    {formatStatus(assignment.status)}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Template:</span>
                    <span className={styles.value}>
                      {template && typeof template === 'object'
                        ? template.name
                        : 'N/A'}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Cycle:</span>
                    <span className={styles.value}>
                      {cycle && typeof cycle === 'object'
                        ? cycle.name
                        : 'N/A'}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Due Date:</span>
                    <span className={styles.value}>{formatDate(assignment.dueDate)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Assigned:</span>
                    <span className={styles.value}>{formatDate(assignment.assignedAt)}</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  {(assignment.status === AppraisalAssignmentStatus.IN_PROGRESS ||
                    assignment.status === AppraisalAssignmentStatus.NOT_STARTED) && (
                    <Button
                      onClick={() => handleReviewClick(assignment)}
                      variant="primary"
                      size="sm"
                    >
                      Review
                    </Button>
                  )}
                  {assignment.status === AppraisalAssignmentStatus.SUBMITTED && (
                    <Button
                      onClick={() => handleReviewClick(assignment)}
                      variant="secondary"
                      size="sm"
                    >
                      View Review
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {isReviewFormOpen && selectedAssignment && (
        <ManagerReviewForm
          assignment={selectedAssignment}
          isOpen={isReviewFormOpen}
          onClose={() => {
            setIsReviewFormOpen(false);
            setSelectedAssignment(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}

