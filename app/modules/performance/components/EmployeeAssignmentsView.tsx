/**
 * EmployeeAssignmentsView Component
 * Displays assigned appraisal forms for employees (REQ-AE-01)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalAssignment, AppraisalCycle } from '../types';
import { AppraisalAssignmentStatus } from '../types';
import SelfAssessmentForm from './SelfAssessmentForm';
import styles from './EmployeeAssignmentsView.module.css';

interface EmployeeAssignmentsViewProps {
  employeeId: string;
}

export default function EmployeeAssignmentsView({ employeeId }: EmployeeAssignmentsViewProps) {
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<AppraisalAssignment | null>(null);
  const [isSelfAssessmentOpen, setIsSelfAssessmentOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching assignments for employeeId:', employeeId);
      const [assignmentsData, cyclesData] = await Promise.all([
        performanceApi.getEmployeeAssignments(employeeId),
        performanceApi.getCycles(),
      ]);
      console.log('Fetched assignments:', assignmentsData);
      console.log('Fetched cycles:', cyclesData);
      setAssignments(assignmentsData);
      setCycles(cyclesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

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
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setIsSelfAssessmentOpen(true);
                    }}
                  >
                    {assignment.status === AppraisalAssignmentStatus.NOT_STARTED
                      ? 'Start Assessment'
                      : 'View/Edit Assessment'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedAssignment && (
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
      )}
    </div>
  );
}

