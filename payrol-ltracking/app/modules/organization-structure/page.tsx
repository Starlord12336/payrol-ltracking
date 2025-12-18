'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/shared/components';
import { Card, Button, Input, Modal } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { useRouter } from 'next/navigation';
import { createDepartment, getDepartments } from './api/orgStructureApi';
import type { CreateDepartmentDto, Department } from './types';
import styles from './page.module.css';
import { CreateDepartmentForm } from './components/CreateDepartmentForm';
import { DepartmentList } from './components/DepartmentList';
import { ChangeRequestList } from './change-requests/components/ChangeRequestList';

function OrganizationStructureContent() {
  // All hooks must be called at the top level, before any conditional returns
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'departments' | 'change-requests'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch existing departments on mount, when refresh is triggered, or when switching to departments tab
  useEffect(() => {
    const userRoles = user?.roles || [];
    const canAccessOrgStructure = 
      userRoles.includes(SystemRole.HR_ADMIN) ||
      userRoles.includes(SystemRole.HR_MANAGER) ||
      userRoles.includes(SystemRole.SYSTEM_ADMIN);

    if (canAccessOrgStructure && activeTab === 'departments') {
      const fetchDepartments = async () => {
        try {
          setIsLoadingDepartments(true);
          const response = await getDepartments({ limit: 1000, isActive: true });
          setDepartments(response.data);
        } catch (err) {
          console.error('Error fetching departments:', err);
        } finally {
          setIsLoadingDepartments(false);
        }
      };

      fetchDepartments();
    }
  }, [refreshTrigger, activeTab, user?.roles]);

  const userRoles = user?.roles || [];
  
  // Check if user has access to organization structure
  const canAccessOrgStructure = 
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

  const handleDepartmentCreated = () => {
    setShowAddDepartmentModal(false);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  // Conditionally render content instead of early return to avoid hook count issues
  return (
    <div className={styles.container}>
      {!canAccessOrgStructure ? (
        <Card padding="lg">
          <div className={styles.emptyStateContent}>
            <h2>Access Denied</h2>
            <p>You don&apos;t have permission to access the Organization Structure module.</p>
            <p>Required roles: HR Admin, HR Manager, or System Admin</p>
            <p>Your roles: {userRoles.length > 0 ? userRoles.join(', ') : 'None'}</p>
          </div>
        </Card>
      ) : (
        <>
          <div className={styles.header}>
            <div>
              <h1>Organization Structure</h1>
              <p>Manage departments, positions, and change requests</p>
            </div>
            <div className={styles.headerActions}>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/modules/organization-structure/org-chart')}
              >
                📊 View Org Chart
              </Button>
              {activeTab === 'departments' && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowAddDepartmentModal(true)}
                >
                  + Add Department
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'departments' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('departments')}
            >
              Departments
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'change-requests' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('change-requests')}
            >
              Change Requests
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'departments' && (
            <>
              {isLoadingDepartments ? (
                <Card padding="lg">
                  <div className={styles.loading}>Loading departments...</div>
                </Card>
              ) : departments.length === 0 ? (
                <Card padding="lg" className={styles.emptyState}>
                  <div className={styles.emptyStateContent}>
                    <h2>No departments yet</h2>
                    <p>Get started by creating your first department</p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setShowAddDepartmentModal(true)}
                    >
                      Create First Department
                    </Button>
                  </div>
                </Card>
              ) : (
                <DepartmentList
                  departments={departments}
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}

              {/* Add Department Modal */}
              <Modal
                isOpen={showAddDepartmentModal}
                onClose={() => setShowAddDepartmentModal(false)}
                title="Create New Department"
              >
                <CreateDepartmentForm
                  onSuccess={handleDepartmentCreated}
                  onCancel={() => setShowAddDepartmentModal(false)}
                />
              </Modal>
            </>
          )}

          {activeTab === 'change-requests' && (
            <ChangeRequestList
              onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}
        </>
      )}
    </div>
  );
}

// Always wrap with ProtectedRoute!
export default function OrganizationStructurePage() {
  return (
    <ProtectedRoute>
      <OrganizationStructureContent />
    </ProtectedRoute>
  );
}
