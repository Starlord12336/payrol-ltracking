/**
 * Performance Module
 * This module handles performance appraisal management
 * REQ-PP-01: Configure Standardized Appraisal Templates and Rating Scales (System Admin)
 * Employee Performance View (for employees)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { Card, ProtectedRoute } from '@/shared/components';
import { performanceApi } from './api/performanceApi';
import type { AppraisalTemplate, AppraisalCycle } from './types';
import TemplateList from './components/TemplateList';
import AssignmentList from './components/AssignmentList';
import CycleList from './components/CycleList';
import EmployeeAssignmentsView from './components/EmployeeAssignmentsView';
import ManagerReviewsView from './components/ManagerReviewsView';
import styles from './page.module.css';

function PerformanceContent() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'cycles' | 'assignments' | 'my-performance' | 'team-reviews'>('templates');
  const [hasTeamReviews, setHasTeamReviews] = useState(false);

  // Check user roles
  const isSystemAdmin = user?.roles?.includes(SystemRole.SYSTEM_ADMIN);
  const isHrAdmin = user?.roles?.includes(SystemRole.HR_ADMIN);
  const isHrManager = user?.roles?.includes(SystemRole.HR_MANAGER);
  const isDepartmentHead = user?.roles?.includes(SystemRole.DEPARTMENT_HEAD);
  const canManageTemplates = isSystemAdmin || isHrAdmin || isHrManager;
  const isEmployee = user?.userType === 'employee';
  
  // Set default tab when hasTeamReviews changes
  useEffect(() => {
    if (hasTeamReviews && isEmployee && !canManageTemplates && activeTab === 'templates') {
      setActiveTab('team-reviews');
    }
  }, [hasTeamReviews, isEmployee, canManageTemplates, activeTab]);

  const fetchTemplates = async () => {
    if (!canManageTemplates) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await performanceApi.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    if (!canManageTemplates) return;
    
    try {
      setError(null);
      const data = await performanceApi.getCycles();
      setCycles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cycles');
      console.error('Error fetching cycles:', err);
    }
  };

  // Check if user has team reviews (is a Line Manager/DEPARTMENT_HEAD or has assignments)
  useEffect(() => {
    const checkTeamReviews = async () => {
      console.log('Checking team reviews...', {
        userid: user?.userid,
        isDepartmentHead,
        isHrManager,
        isHrAdmin,
        isSystemAdmin,
      });
      
      // Line Manager (DEPARTMENT_HEAD) should always see Team Reviews tab
      if (isDepartmentHead || isHrManager || isHrAdmin || isSystemAdmin) {
        console.log('User has authorized role, setting hasTeamReviews to true');
        setHasTeamReviews(true);
        return;
      }
      
      // For other employees, check if they have any assignments as manager
      if (user?.userid) {
        try {
          console.log('Fetching manager assignments for user:', user.userid);
          const assignments = await performanceApi.getManagerAssignments(user.userid);
          console.log('Manager assignments response:', assignments);
          const hasAssignments = assignments && assignments.length > 0;
          console.log('Setting hasTeamReviews to:', hasAssignments);
          setHasTeamReviews(hasAssignments);
        } catch (err: any) {
          console.error('Error checking manager assignments:', err);
          console.error('Error details:', err.response?.data || err.message);
          // Silently fail - user might not be a manager
          setHasTeamReviews(false);
        }
      } else {
        console.log('No userid, setting hasTeamReviews to false');
        setHasTeamReviews(false);
      }
    };
    
    if (canManageTemplates) {
      fetchTemplates();
      fetchCycles();
    } else {
      setLoading(false);
    }
    
    checkTeamReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageTemplates, user?.userid, isDepartmentHead, isHrManager, isHrAdmin, isSystemAdmin]);

  // For employees without admin access, show tabs if they have team reviews
  if (isEmployee && !canManageTemplates) {
    console.log('Rendering employee view, hasTeamReviews:', hasTeamReviews);
    
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Performance Management</h1>
            <p>{hasTeamReviews ? 'Review your team and view your performance' : 'View your performance appraisals and feedback'}</p>
          </div>
        </div>

        {hasTeamReviews && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'team-reviews' ? styles.active : ''}`}
              onClick={() => {
                console.log('Switching to team-reviews tab');
                setActiveTab('team-reviews');
              }}
            >
              Team Reviews
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'my-performance' ? styles.active : ''}`}
              onClick={() => {
                console.log('Switching to my-performance tab');
                setActiveTab('my-performance');
              }}
            >
              My Performance
            </button>
          </div>
        )}

        {activeTab === 'team-reviews' && hasTeamReviews && (
          <>
            {user?.userid && (
              <ManagerReviewsView managerId={user.userid} />
            )}
          </>
        )}

        {activeTab === 'my-performance' && (
          <>
            {user?.userid ? (
              <EmployeeAssignmentsView employeeId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load employee ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}

        {!hasTeamReviews && (
          <>
            {user?.userid ? (
              <EmployeeAssignmentsView employeeId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load employee ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  // For admins/managers, show tabs: Templates and My Performance
  if (canManageTemplates) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Performance Management</h1>
            <p>Manage appraisal templates and view your performance</p>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'templates' ? styles.active : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Template Configuration
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'cycles' ? styles.active : ''}`}
            onClick={() => setActiveTab('cycles')}
          >
            Cycles
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'assignments' ? styles.active : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
          {hasTeamReviews && (
            <button
              className={`${styles.tab} ${activeTab === 'team-reviews' ? styles.active : ''}`}
              onClick={() => setActiveTab('team-reviews')}
            >
              Team Reviews
            </button>
          )}
          <button
            className={`${styles.tab} ${activeTab === 'my-performance' ? styles.active : ''}`}
            onClick={() => setActiveTab('my-performance')}
          >
            My Performance
          </button>
        </div>

        {activeTab === 'templates' && (
          <>
            {loading ? (
              <Card padding="lg" shadow="warm">
                <div className={styles.loading}>Loading templates...</div>
              </Card>
            ) : error && templates.length === 0 ? (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  {error}
                </div>
              </Card>
            ) : (
              <TemplateList templates={templates} onRefresh={fetchTemplates} />
            )}
          </>
        )}

        {activeTab === 'cycles' && (
          <CycleList cycles={cycles} onRefresh={fetchCycles} />
        )}

        {activeTab === 'assignments' && (
          <AssignmentList />
        )}

        {activeTab === 'team-reviews' && (
          <>
            {user?.userid && (
              <ManagerReviewsView managerId={user.userid} />
            )}
          </>
        )}

        {activeTab === 'my-performance' && (
          <>
            {user?.userid && (
              <EmployeeAssignmentsView employeeId={user.userid} />
            )}
          </>
        )}
      </div>
    );
  }

  // For other users (candidates, etc.)
  return (
    <div className={styles.container}>
      <Card padding="lg" shadow="warm">
        <div className={styles.placeholder}>
          <h2>Performance Management</h2>
          <p>Performance management features are not available for your user type.</p>
        </div>
      </Card>
    </div>
  );
}

export default function PerformancePage() {
  return (
    <ProtectedRoute>
      <PerformanceContent />
    </ProtectedRoute>
  );
}
