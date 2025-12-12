/**
 * Assignment List Component
 * Displays and manages appraisal assignments
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalAssignment } from '../types';
import { AppraisalAssignmentStatus } from '../types';
import AssignmentModal from './AssignmentModal';
import styles from './AssignmentList.module.css';

interface AssignmentListProps {
  filters?: {
    cycleId?: string;
    templateId?: string;
    employeeProfileId?: string;
    managerProfileId?: string;
    departmentId?: string;
    status?: string;
  };
}

export default function AssignmentList({ filters }: AssignmentListProps) {
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AppraisalAssignment | null>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceApi.getAssignments(filters);
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCreateNew = () => {
    setSelectedAssignment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (assignment: AppraisalAssignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      await performanceApi.removeAssignment(id);
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to remove assignment');
    }
  };

  const formatStatus = (status: AppraisalAssignmentStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading assignments...</div>
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
    <>
      <div className={styles.header}>
        <h2>Appraisal Assignments</h2>
        <Button variant="primary" size="md" onClick={handleCreateNew}>
          + Assign Template
        </Button>
      </div>

      {assignments.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No assignments found.</p>
            <Button variant="outline" size="sm" onClick={handleCreateNew}>
              Create First Assignment
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="lg" shadow="warm">
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Template</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Assigned Date</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => {
                  // Handle populated fields - backend returns employeeProfileId, templateId, managerProfileId as populated objects
                  const employee = (assignment as any).employeeProfileId || assignment.employee;
                  const template = (assignment as any).templateId || assignment.template;
                  const manager = (assignment as any).managerProfileId || assignment.manager;
                  
                  return (
                  <tr key={assignment._id}>
                    <td>
                      {employee
                        ? typeof employee === 'object' 
                          ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || 'N/A'
                          : 'N/A'
                        : 'N/A'}
                    </td>
                    <td>
                      {template
                        ? typeof template === 'object'
                          ? template.name || 'N/A'
                          : 'N/A'
                        : 'N/A'}
                    </td>
                    <td>
                      {manager
                        ? typeof manager === 'object'
                          ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.fullName || 'N/A'
                          : 'N/A'
                        : 'N/A'}
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[assignment.status.toLowerCase()]}`}>
                        {formatStatus(assignment.status)}
                      </span>
                    </td>
                    <td>{formatDate(assignment.assignedAt)}</td>
                    <td>{formatDate(assignment.dueDate)}</td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(assignment)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => assignment._id && handleDelete(assignment._id)}
                          disabled={
                            assignment.status === AppraisalAssignmentStatus.SUBMITTED ||
                            assignment.status === AppraisalAssignmentStatus.PUBLISHED ||
                            assignment.status === AppraisalAssignmentStatus.ACKNOWLEDGED
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AssignmentModal
        assignment={selectedAssignment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
          fetchAssignments();
        }}
      />
    </>
  );
}

