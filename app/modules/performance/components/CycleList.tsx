/**
 * CycleList Component
 * Displays a list of appraisal cycles with create/edit functionality
 */

'use client';

import { useState } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalCycle } from '../types';
import CycleFormModal from './CycleFormModal';
import styles from './CycleList.module.css';

interface CycleListProps {
  cycles: AppraisalCycle[];
  onRefresh: () => void;
}

export default function CycleList({ cycles, onRefresh }: CycleListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<AppraisalCycle | undefined>();

  const handleCreateNew = () => {
    setSelectedCycle(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (cycle: AppraisalCycle) => {
    setSelectedCycle(cycle);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCycle(undefined);
  };

  const handleSuccess = () => {
    onRefresh();
    handleModalClose();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'PLANNED':
        return styles.statusPlanned;
      case 'ACTIVE':
        return styles.statusActive;
      case 'CLOSED':
        return styles.statusClosed;
      case 'ARCHIVED':
        return styles.statusArchived;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <>
      <Card padding="lg" shadow="warm">
        <div className={styles.header}>
          <div>
            <h2>Appraisal Cycles</h2>
            <p>Manage performance appraisal cycles and their timelines</p>
          </div>
          <Button variant="primary" onClick={handleCreateNew}>
            + Create Cycle
          </Button>
        </div>

        {cycles.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No cycles found. Create your first appraisal cycle to get started.</p>
          </div>
        ) : (
          <div className={styles.cyclesGrid}>
            {cycles.map((cycle) => (
              <div key={cycle._id} className={styles.cycleCard}>
                <div className={styles.cycleHeader}>
                  <h3>{cycle.name}</h3>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(cycle.status)}`}>
                    {cycle.status || 'PLANNED'}
                  </span>
                </div>
                <div className={styles.cycleDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Type:</span>
                    <span>{cycle.cycleType?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Start Date:</span>
                    <span>{formatDate(cycle.startDate)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>End Date:</span>
                    <span>{formatDate(cycle.endDate)}</span>
                  </div>
                  {cycle.managerDueDate && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Manager Deadline:</span>
                      <span>{formatDate(cycle.managerDueDate)}</span>
                    </div>
                  )}
                  {cycle.description && (
                    <div className={styles.description}>
                      <span className={styles.label}>Description:</span>
                      <p>{cycle.description}</p>
                    </div>
                  )}
                </div>
                <div className={styles.cycleActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(cycle)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <CycleFormModal
        cycle={selectedCycle}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </>
  );
}

