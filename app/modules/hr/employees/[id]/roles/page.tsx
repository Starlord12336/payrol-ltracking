/**
 * Employee Roles Management Page
 * HR_ADMIN and SYSTEM_ADMIN can view and manage employee system roles
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Card, Button, ProtectedRoute } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { hrApi, type EmployeeProfile } from '../../../api/hrApi';
import { apiClient } from '@/shared/utils/api';
import styles from './page.module.css';

function EmployeeRolesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id as string;

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [currentRoles, setCurrentRoles] = useState<SystemRole[]>([]);
  // const [selectedRoles, setSelectedRoles] = useState<SystemRole[]>([]); // Commented out - no backend endpoint for manual assignment
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // All available system roles
  const allSystemRoles: { value: SystemRole; label: string }[] = useMemo(() => [
    { value: SystemRole.DEPARTMENT_EMPLOYEE, label: 'Department Employee' },
    { value: SystemRole.DEPARTMENT_HEAD, label: 'Department Head' },
    { value: SystemRole.HR_MANAGER, label: 'HR Manager' },
    { value: SystemRole.HR_EMPLOYEE, label: 'HR Employee' },
    { value: SystemRole.HR_ADMIN, label: 'HR Admin' },
    { value: SystemRole.PAYROLL_SPECIALIST, label: 'Payroll Specialist' },
    { value: SystemRole.PAYROLL_MANAGER, label: 'Payroll Manager' },
    { value: SystemRole.SYSTEM_ADMIN, label: 'System Admin' },
    { value: SystemRole.LEGAL_POLICY_ADMIN, label: 'Legal & Policy Admin' },
    { value: SystemRole.RECRUITER, label: 'Recruiter' },
    { value: SystemRole.FINANCE_STAFF, label: 'Finance Staff' },
    { value: SystemRole.JOB_CANDIDATE, label: 'Job Candidate' },
  ], []);

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the same approach as employees list page - getAllEmployees includes roles
      // Fetch all employees and find the one we need (same as employees list does)
      const allEmployees = await hrApi.getAllEmployees();
      const employeeData = allEmployees.find((emp: any) => emp._id === employeeId);
      
      if (!employeeData) {
        setError('Employee not found');
        return;
      }
      
      setEmployee(employeeData);
      
      // Get current roles from employee data (same approach as employees list page)
      const roles = employeeData.roles || [];
      
      // Backend returns roles as SystemRole enum values (e.g., "Payroll Manager", "department employee")
      // Map them directly to SystemRole enum by matching the value
      const mappedRoles = roles
        .map((role: string) => {
          // Find matching SystemRole enum - backend returns the enum value directly
          const systemRole = allSystemRoles.find(
            (sr) => sr.value === role
          );
          if (!systemRole) {
            // Fallback: try case-insensitive match for labels
            const fallbackRole = allSystemRoles.find(
              (sr) => sr.value.toLowerCase() === role.toLowerCase() || sr.label.toLowerCase() === role.toLowerCase()
            );
            return fallbackRole?.value;
          }
          return systemRole.value;
        })
        .filter((role): role is SystemRole => role !== undefined);
      
      setCurrentRoles(mappedRoles);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee data');
      console.error('Error fetching employee:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId, allSystemRoles]);

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId, fetchEmployee]);

  // Commented out - no backend endpoint for manual role assignment
  // const handleRoleToggle = (role: SystemRole) => {
  //   setSelectedRoles((prev) => {
  //     if (prev.includes(role)) {
  //       return prev.filter((r) => r !== role);
  //     } else {
  //       return [...prev, role];
  //     }
  //   });
  // };

  // Commented out - no backend endpoint for manual role assignment
  // const handleSave = async () => {
  //   if (selectedRoles.length === 0) {
  //     setError('At least one role must be selected');
  //     return;
  //   }

  //   setError(null);
  //   setSuccess(null);
  //   setSaving(true);

  //   try {
  //     const response = await apiClient.patch<{ success: boolean; message: string; data: any }>(
  //       `/organization-structure/employees/${employeeId}/roles`,
  //       { roles: selectedRoles }
  //     );

  //     if (response.data.success) {
  //       setSuccess('Employee roles updated successfully');
  //       setCurrentRoles(selectedRoles);
  //       setTimeout(() => {
  //         fetchEmployee();
  //       }, 1000);
  //     }
  //   } catch (err: any) {
  //     if (err.response?.status === 404) {
  //       setError(
  //         'Role management endpoint not found. Backend endpoint needed: PATCH /organization-structure/employees/:employeeId/roles'
  //       );
  //     } else {
  //       setError(err.response?.data?.message || err.message || 'Failed to update employee roles');
  //     }
  //     console.error('Error updating roles:', err);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSyncRoles = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Use existing sync-roles endpoint
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `/organization-structure/employees/${employeeId}/sync-roles`
      );

      if (response.data.success) {
        setSuccess('Employee roles synced successfully based on position and department');
        // Refresh employee data
        setTimeout(() => {
          fetchEmployee();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to sync employee roles');
      console.error('Error syncing roles:', err);
    } finally {
      setSaving(false);
    }
  };

  const userRoles = user?.roles || [];
  const hasAdminRole = 
    userRoles.includes(SystemRole.HR_ADMIN) || 
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

  if (!hasAdminRole) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          Access denied. HR Admin or System Admin role required.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading employee roles...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>Employee not found</div>
      </div>
    );
  }

  // const hasChanges = JSON.stringify(currentRoles.sort()) !== JSON.stringify(selectedRoles.sort()); // Commented out - no manual assignment

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manage Employee Roles</h1>
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <Card padding="lg" shadow="warm" className={styles.employeeCard}>
        <div className={styles.employeeInfo}>
          <h2>{employee.fullName}</h2>
          <p className={styles.employeeDetails}>
            <span>Employee #: {employee.employeeNumber || 'N/A'}</span>
            <span>Email: {employee.workEmail || employee.personalEmail || 'N/A'}</span>
          </p>
        </div>
      </Card>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage} role="alert">
          {success}
        </div>
      )}

      <Card padding="lg" shadow="warm" className={styles.rolesCard}>
        <div className={styles.rolesHeader}>
          <h2>System Roles</h2>
          <p className={styles.helperText}>
            View the current system roles for this employee. Roles are automatically synced based on position and department.
          </p>
        </div>

        <div className={styles.rolesList}>
          {allSystemRoles.map((role) => {
            const isSelected = currentRoles.includes(role.value);
            return (
              <div key={role.value} className={styles.roleItem}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={true}
                  className={styles.checkbox}
                />
                <span className={styles.roleLabel}>{role.label}</span>
              </div>
            );
          })}
        </div>

        {currentRoles.length === 0 && (
          <div className={styles.warningMessage}>
            ⚠️ No roles assigned. Employee will not have access to any system features.
          </div>
        )}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            onClick={handleSyncRoles}
            disabled={saving}
            isLoading={saving}
          >
            Sync Roles (Auto)
          </Button>
        </div>

        <div className={styles.infoBox}>
          <h3>ℹ️ About Role Management</h3>
          <ul>
            <li>
              <strong>Sync Roles (Auto):</strong> Automatically syncs roles based on the employee&apos;s position and department.
              This will add/remove DEPARTMENT_HEAD and DEPARTMENT_EMPLOYEE roles automatically.
            </li>
            <li>
              <strong>Current Roles:</strong> The roles currently assigned to this employee.
            </li>
            <li>
              <strong>Note:</strong> Manual role assignment is not available. Roles are managed automatically based on organizational structure.
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default function EmployeeRolesPage() {
  return (
    <ProtectedRoute>
      <EmployeeRolesContent />
    </ProtectedRoute>
  );
}

