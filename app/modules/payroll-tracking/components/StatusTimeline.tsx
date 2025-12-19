import React from 'react';
import styles from './StatusTimeline.module.css';

interface StatusTimelineProps {
  status: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ status }) => {
  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case 'approved':
        return '#2ecc71';
      case 'rejected':
        return '#e74c3c';
      case 'pending payroll manager approval':
      case 'pending_manager_approval':
        return '#f39c12';
      case 'under review':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className={styles.timeline}>
      <h3>Status</h3>
      <div className={styles.statusBadge} style={{ backgroundColor: getStatusColor(status) }}>
        {status}
      </div>
    </div>
  );
};
