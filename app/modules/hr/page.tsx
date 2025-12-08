/**
 * HR Dashboard Page
 * Overview of HR metrics and pending tasks
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Card, ProtectedRoute } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { hrApi } from './api/hrApi';
import styles from './page.module.css';

function HRDashboardContent() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [onProbation, setOnProbation] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if user has HR role
  const userRoles = user?.roles || [];
  const hasHrRole = 
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.roles) return;

      try {
        setLoading(true);

        // Fetch pending change requests
        const requests = await hrApi.getPendingChangeRequests();
        setPendingRequests(requests.length);

        // Fetch active employees
        const employees = await hrApi.searchEmployees({ status: 'ACTIVE' });
        setActiveEmployees(employees.length);

        // Fetch employees on probation
        const probationEmployees = await hrApi.searchEmployees({ status: 'PROBATION' });
        setOnProbation(probationEmployees.length);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hasHrRole) {
      fetchDashboardData();
    }
  }, [user, hasHrRole]);

  const isAdmin = 
    userRoles.includes(SystemRole.HR_ADMIN) || 
    userRoles.includes(SystemRole.SYSTEM_ADMIN);
  const isManager = 
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE) ||
    isAdmin;

  if (!hasHrRole) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          Access denied. HR role required.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>HR Dashboard</h1>
        <p>Welcome, {user?.email}</p>
      </div>

      <div className={styles.widgets}>
        <Card padding="lg" shadow="warm" className={styles.widget}>
          <div className={styles.widgetContent}>
            <h3>Pending Change Requests</h3>
            <div className={styles.widgetValue}>{pendingRequests}</div>
            <a href="/modules/hr/change-requests" className={styles.widgetLink}>
              View Requests →
            </a>
          </div>
        </Card>

        <Card padding="lg" shadow="warm" className={styles.widget}>
          <div className={styles.widgetContent}>
            <h3>Active Employees</h3>
            <div className={styles.widgetValue}>{activeEmployees}</div>
            <a href="/modules/hr/employees" className={styles.widgetLink}>
              View All →
            </a>
          </div>
        </Card>

        <Card padding="lg" shadow="warm" className={styles.widget}>
          <div className={styles.widgetContent}>
            <h3>On Probation</h3>
            <div className={styles.widgetValue}>{onProbation}</div>
            <a href="/modules/hr/employees?status=PROBATION" className={styles.widgetLink}>
              View Details →
            </a>
          </div>
        </Card>
      </div>

      {isAdmin && (
        <Card padding="lg" shadow="warm" className={styles.adminSection}>
          <h2>Admin Actions</h2>
          <div className={styles.adminActions}>
            <a href="/modules/hr/roles" className={styles.adminLink}>
              Role Management
            </a>
            <a href="/modules/hr/settings" className={styles.adminLink}>
              System Settings
            </a>
          </div>
        </Card>
      )}

      <div className={styles.quickLinks}>
        <Card padding="lg" shadow="warm">
          <h2>Quick Links</h2>
          <div className={styles.linksGrid}>
            <a href="/modules/hr/employees" className={styles.link}>
              All Employees
            </a>
            <a href="/modules/hr/employees/search" className={styles.link}>
              Search Employees
            </a>
            <a href="/modules/hr/change-requests" className={styles.link}>
              Change Requests
            </a>
            {isManager && (
              <a href="/modules/recruitment" className={styles.link}>
                Recruitment
              </a>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function HRDashboardPage() {
  return (
    <ProtectedRoute>
      <HRDashboardContent />
    </ProtectedRoute>
  );
}

