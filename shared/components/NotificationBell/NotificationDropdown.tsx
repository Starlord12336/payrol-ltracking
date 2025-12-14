/**
 * NotificationDropdown Component
 * Dropdown menu showing notifications and pending acknowledgments
 */

'use client';

import { useRouter } from 'next/navigation';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';
import styles from './NotificationDropdown.module.css';

interface NotificationDropdownProps {
  pendingAcknowledgments: number;
  newAssignments: number;
  backendNotifications?: any[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function NotificationDropdown({
  pendingAcknowledgments,
  newAssignments,
  backendNotifications = [],
  onClose,
  onRefresh,
}: NotificationDropdownProps) {
  const { notifications, clearNotifications } = useNotificationContext();
  const { user } = useAuth();
  const router = useRouter();

  const handleAcknowledgmentClick = () => {
    router.push(ROUTES.PERFORMANCE);
    onClose();
  };

  const handleClearAll = () => {
    clearNotifications();
    onRefresh();
  };

  const hasAnyNotifications = notifications.length > 0 || pendingAcknowledgments > 0 || newAssignments > 0 || backendNotifications.length > 0;

  return (
    <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
      <div className={styles.header}>
        <h3 className={styles.title}>Notifications</h3>
        {hasAnyNotifications && (
          <button className={styles.clearButton} onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      <div className={styles.content}>
        {!hasAnyNotifications ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔕</span>
            <p className={styles.emptyText}>No new notifications</p>
          </div>
        ) : (
          <>
            {/* New Assignments */}
            {newAssignments > 0 && (
              <div className={styles.notificationItem} onClick={handleAcknowledgmentClick}>
                <div className={styles.notificationIcon}>📝</div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>
                    {newAssignments === 1
                      ? 'New Appraisal Assignment'
                      : `${newAssignments} New Appraisal Assignments`}
                  </div>
                  <div className={styles.notificationMessage}>
                    {newAssignments === 1
                      ? 'You have a new appraisal form to complete'
                      : `You have ${newAssignments} new appraisal forms to complete`}
                  </div>
                  <div className={styles.notificationAction}>Click to view →</div>
                </div>
              </div>
            )}

            {/* Pending Acknowledgments */}
            {pendingAcknowledgments > 0 && (
              <div className={styles.notificationItem} onClick={handleAcknowledgmentClick}>
                <div className={styles.notificationIcon}>📊</div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>
                    {pendingAcknowledgments === 1
                      ? 'New Appraisal Result Available'
                      : `${pendingAcknowledgments} Appraisal Results Available`}
                  </div>
                  <div className={styles.notificationMessage}>
                    {pendingAcknowledgments === 1
                      ? 'You have a published appraisal ready for acknowledgment'
                      : `You have ${pendingAcknowledgments} published appraisals ready for acknowledgment`}
                  </div>
                  <div className={styles.notificationAction}>Click to view →</div>
                </div>
              </div>
            )}

            {/* Backend Notifications */}
            {backendNotifications.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>System Notifications</div>
                {backendNotifications.slice(0, 10).map((notification: any) => (
                  <div key={notification._id || notification.id} className={styles.notificationItem}>
                    <div className={styles.notificationIcon}>
                      {notification.type?.includes('approved') && '✓'}
                      {notification.type?.includes('rejected') && '✕'}
                      {notification.type?.includes('created') && '📢'}
                      {!notification.type?.includes('approved') && !notification.type?.includes('rejected') && !notification.type?.includes('created') && 'ℹ'}
                    </div>
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationMessage}>{notification.message}</div>
                      <div className={styles.notificationTime}>
                        {notification.createdAt 
                          ? new Date(notification.createdAt).toLocaleString()
                          : notification.timestamp
                          ? new Date(notification.timestamp).toLocaleString()
                          : 'Just now'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Toast Notifications */}
            {notifications.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Recent Notifications</div>
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className={styles.notificationItem}>
                    <div className={`${styles.notificationIcon} ${styles[`icon--${notification.type}`]}`}>
                      {notification.type === 'success' && '✓'}
                      {notification.type === 'error' && '✕'}
                      {notification.type === 'warning' && '⚠'}
                      {notification.type === 'info' && 'ℹ'}
                    </div>
                    <div className={styles.notificationContent}>
                      {notification.title && (
                        <div className={styles.notificationTitle}>{notification.title}</div>
                      )}
                      <div className={styles.notificationMessage}>{notification.message}</div>
                      <div className={styles.notificationTime}>
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {hasAnyNotifications && (
        <div className={styles.footer}>
          <button className={styles.viewAllButton} onClick={handleAcknowledgmentClick}>
            View All Performance Notifications
          </button>
        </div>
      )}
    </div>
  );
}

