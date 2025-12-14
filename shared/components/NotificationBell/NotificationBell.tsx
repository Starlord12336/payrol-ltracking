/**
 * NotificationBell Component
 * Shows notification bell icon with badge count in navbar
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { performanceApi } from '@/app/modules/performance/api/performanceApi';
import { AppraisalAssignmentStatus } from '@/app/modules/performance/types';
import { apiClient } from '../../utils/api';
import NotificationDropdown from './NotificationDropdown';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const { user } = useAuth();
  const { notifications } = useNotificationContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingAcknowledgments, setPendingAcknowledgments] = useState(0);
  const [newAssignments, setNewAssignments] = useState(0);
  const [backendNotifications, setBackendNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch backend notifications
  const fetchBackendNotifications = useCallback(async () => {
    if (!user?.userid) {
      console.log('[NotificationBell] No user ID, skipping fetch');
      setBackendNotifications([]);
      return;
    }

    try {
      console.log('[NotificationBell] Fetching notifications for user:', user.userid);
      const response = await apiClient.get('/organization-structure/notifications');
      const notifications = response.data || [];
      console.log('[NotificationBell] Received notifications:', notifications.length, notifications);
      setBackendNotifications(notifications);
    } catch (error) {
      // Silently fail - don't show error to user
      console.error('[NotificationBell] Error fetching backend notifications:', error);
      setBackendNotifications([]);
    }
  }, [user]);

  // Check for pending acknowledgments
  const checkPendingAcknowledgments = useCallback(async () => {
    if (!user?.userid) {
      setPendingAcknowledgments(0);
      return;
    }

    try {
      setLoading(true);
      const employeeId = user.userid;
      if (!employeeId) {
        setPendingAcknowledgments(0);
        return;
      }
      
      const assignments = await performanceApi.getEmployeeAssignments(employeeId);
      
      if (!Array.isArray(assignments) || assignments.length === 0) {
        setPendingAcknowledgments(0);
        setNewAssignments(0);
        return;
      }
      
      // Count published assignments that need acknowledgment
      const publishedCount = assignments.filter((a: any) => {
        const status = a.status;
        return (
          status === AppraisalAssignmentStatus.PUBLISHED || 
          status === 'PUBLISHED' ||
          String(status).toUpperCase() === 'PUBLISHED'
        );
      }).length;
      
      // Count new assignments (NOT_STARTED or IN_PROGRESS) that haven't been acknowledged
      const newAssignmentsCount = assignments.filter((a: any) => {
        const status = a.status;
        return (
          status === AppraisalAssignmentStatus.NOT_STARTED ||
          status === 'NOT_STARTED' ||
          status === AppraisalAssignmentStatus.IN_PROGRESS ||
          status === 'IN_PROGRESS'
        );
      }).length;
      
      setPendingAcknowledgments(publishedCount);
      setNewAssignments(newAssignmentsCount);
    } catch (error) {
      // Silently fail - don't show error to user, just don't show badge
      console.error('Error checking pending acknowledgments:', error);
      setPendingAcknowledgments(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check on mount and when user changes
  useEffect(() => {
    if (user) {
      // Only check performance acknowledgments for employees
      if (user.userType === 'employee') {
        checkPendingAcknowledgments();
      }
      // Always fetch backend notifications for all users
      fetchBackendNotifications();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        if (user.userType === 'employee') {
          checkPendingAcknowledgments();
        }
        fetchBackendNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, checkPendingAcknowledgments, fetchBackendNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Total notification count (toast notifications + pending acknowledgments + new assignments + backend notifications)
  const totalCount = notifications.length + pendingAcknowledgments + newAssignments + backendNotifications.length;
  const hasNotifications = totalCount > 0;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleBellClick = () => {
    toggleDropdown();
    // Refresh notifications when opening
    if (!isDropdownOpen && user) {
      if (user.userType === 'employee') {
        checkPendingAcknowledgments();
      }
      fetchBackendNotifications();
    }
  };

  // Show for all authenticated users (employees, admins, managers, etc.)
  if (!user) {
    return null;
  }

  return (
    <div className={styles.notificationBellContainer} ref={containerRef}>
      <button
        className={`${styles.bellButton} ${hasNotifications ? styles.hasNotifications : ''}`}
        onClick={handleBellClick}
        aria-label={`Notifications${hasNotifications ? ` (${totalCount} new)` : ''}`}
        aria-expanded={isDropdownOpen}
      >
        <span className={styles.bellIcon}>🔔</span>
        {hasNotifications && (
          <span className={styles.badge} aria-hidden="true">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <NotificationDropdown
          pendingAcknowledgments={pendingAcknowledgments}
          newAssignments={newAssignments}
          backendNotifications={backendNotifications}
          onClose={() => setIsDropdownOpen(false)}
          onRefresh={() => {
            checkPendingAcknowledgments();
            fetchBackendNotifications();
          }}
        />
      )}
    </div>
  );
}

