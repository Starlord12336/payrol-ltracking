'use client';

import React from 'react';
import { Modal } from '@/shared/components';
import type { ChangeLog } from '../types';
import styles from './ChangeDetailsModal.module.css';

interface ChangeDetailsModalProps {
  log: ChangeLog;
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeDetailsModal({ log, isOpen, onClose }: ChangeDetailsModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATED':
        return '🟢 Created';
      case 'UPDATED':
        return '🔵 Updated';
      case 'DEACTIVATED':
        return '🔴 Deactivated';
      case 'REASSIGNED':
        return '🟡 Reassigned';
      default:
        return action;
    }
  };

  const renderSnapshot = (snapshot: Record<string, unknown> | undefined, label: string) => {
    if (!snapshot || Object.keys(snapshot).length === 0) {
      return (
        <div className={styles.snapshot}>
          <h4>{label}</h4>
          <p className={styles.noData}>No data available</p>
        </div>
      );
    }

    return (
      <div className={styles.snapshot}>
        <h4>{label}</h4>
        <div className={styles.snapshotContent}>
          {Object.entries(snapshot).map(([key, value]) => (
            <div key={key} className={styles.snapshotRow}>
              <span className={styles.snapshotKey}>{key}:</span>
              <span className={styles.snapshotValue}>
                {value === null || value === undefined ? '(empty)' : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getChangedFields = () => {
    if (!log.beforeSnapshot || !log.afterSnapshot) return [];

    const before = log.beforeSnapshot;
    const after = log.afterSnapshot;
    const changed: Array<{ field: string; before: unknown; after: unknown }> = [];

    // Check all keys from both snapshots
    const allKeys = new Set([
      ...Object.keys(before),
      ...Object.keys(after),
    ]);

    allKeys.forEach(key => {
      const beforeValue = before[key];
      const afterValue = after[key];
      
      if (beforeValue !== afterValue) {
        changed.push({
          field: key,
          before: beforeValue,
          after: afterValue,
        });
      }
    });

    return changed;
  };

  const changedFields = getChangedFields();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Details">
      <div className={styles.modalContent}>
        {/* Basic Info */}
        <div className={styles.section}>
          <h3>Change Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Action:</span>
              <span className={styles.infoValue}>{getActionLabel(log.action)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Entity Type:</span>
              <span className={styles.infoValue}>{log.entityType}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Entity ID:</span>
              <span className={styles.infoValue}>{log.entityId}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Performed By:</span>
              <span className={styles.infoValue}>
                {log.performedByEmployee
                  ? `${log.performedByEmployee.firstName || ''} ${log.performedByEmployee.lastName || ''}`.trim() || 'Unknown'
                  : 'System'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Date:</span>
              <span className={styles.infoValue}>{formatDate(log.createdAt)}</span>
            </div>
            {log.summary && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Summary:</span>
                <span className={styles.infoValue}>{log.summary}</span>
              </div>
            )}
          </div>
        </div>

        {/* Changes Comparison */}
        {changedFields.length > 0 && (
          <div className={styles.section}>
            <h3>Changes</h3>
            <div className={styles.changesTable}>
              <div className={styles.changesHeader}>
                <div className={styles.changesHeaderCell}>Field</div>
                <div className={styles.changesHeaderCell}>Before</div>
                <div className={styles.changesHeaderCell}>After</div>
              </div>
              {changedFields.map((change, index) => (
                <div key={index} className={styles.changesRow}>
                  <div className={styles.changesCell}>
                    <strong>{change.field}</strong>
                  </div>
                  <div className={`${styles.changesCell} ${styles.beforeValue}`}>
                    {change.before === null || change.before === undefined
                      ? '(empty)'
                      : String(change.before)}
                  </div>
                  <div className={`${styles.changesCell} ${styles.afterValue}`}>
                    {change.after === null || change.after === undefined
                      ? '(empty)'
                      : String(change.after)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Snapshots */}
        <div className={styles.snapshotsContainer}>
          {renderSnapshot(log.beforeSnapshot, 'Before')}
          {renderSnapshot(log.afterSnapshot, 'After')}
        </div>
      </div>
    </Modal>
  );
}

