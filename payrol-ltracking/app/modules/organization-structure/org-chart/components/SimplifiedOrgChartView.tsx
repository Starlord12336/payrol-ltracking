'use client';

import React from 'react';
import type { SimplifiedDepartmentChart } from '../../types';
import styles from './SimplifiedOrgChartView.module.css';

interface SimplifiedOrgChartViewProps {
  departments: SimplifiedDepartmentChart[];
}

export function SimplifiedOrgChartView({ departments }: SimplifiedOrgChartViewProps) {
  if (!departments || departments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No organization chart data available</p>
      </div>
    );
  }

  return (
    <div className={styles.simplifiedContainer}>
      {departments.map((deptChart) => (
        <div key={deptChart.department.id} className={styles.departmentCard}>
          <div className={styles.departmentHeader}>
            <h3 className={styles.departmentName}>{deptChart.department.name}</h3>
            <div className={styles.departmentCode}>{deptChart.department.code}</div>
          </div>

          {deptChart.positions.length === 0 ? (
            <div className={styles.emptyPositions}>
              <p>No positions in this department</p>
            </div>
          ) : (
            <div className={styles.positionsList}>
              {deptChart.positions.map((position) => (
                <div key={position.id} className={styles.positionItem}>
                  <div className={styles.positionInfo}>
                    <span className={styles.positionCode}>{position.code}</span>
                    <span className={styles.positionTitle}>{position.title}</span>
                  </div>
                  {position.reportsToPositionId && (
                    <div className={styles.reportsTo}>
                      Reports to: {position.reportsToPositionId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

