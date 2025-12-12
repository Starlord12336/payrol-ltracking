/**
 * Edit Employee Page
 * HR can edit employee profile including department and position assignment
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Card, Button, Input, ProtectedRoute } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { hrApi, type EmployeeProfile } from '../../../api/hrApi';
import { getDepartments, getPositions, getPositionsByDepartment } from '@/app/modules/organization-structure/api/orgStructureApi';
import type { Department, Position } from '@/app/modules/organization-structure/types';
import styles from './page.module.css';

function EditEmployeeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id as string;

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    workEmail: '',
    personalEmail: '',
    mobilePhone: '',
    employeeNumber: '',
    status: '',
    primaryDepartmentId: '',
    primaryPositionId: '',
  });

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
      fetchDepartments();
    }
  }, [employeeId]);

  useEffect(() => {
    // When department changes, fetch positions for that department
    if (formData.primaryDepartmentId) {
      fetchPositionsForDepartment(formData.primaryDepartmentId);
    } else {
      setPositions([]);
    }
  }, [formData.primaryDepartmentId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.getEmployeeById(employeeId);
      setEmployee(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        middleName: data.middleName || '',
        workEmail: data.workEmail || '',
        personalEmail: data.personalEmail || '',
        mobilePhone: data.mobilePhone || '',
        employeeNumber: data.employeeNumber || '',
        status: data.status || 'ACTIVE',
        primaryDepartmentId: (data as any).primaryDepartmentId || '',
        primaryPositionId: (data as any).primaryPositionId || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments({ limit: 100, isActive: true });
      setDepartments(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchPositionsForDepartment = async (departmentId: string) => {
    try {
      const response = await getPositionsByDepartment(departmentId);
      const positionsList = response.data || [];
      setPositions(positionsList);
      
      // If current position is not in the new department, clear it
      if (formData.primaryPositionId) {
        const currentPosition = positionsList.find(
          (p: Position) => p._id === formData.primaryPositionId
        );
        if (!currentPosition) {
          setFormData(prev => ({ ...prev, primaryPositionId: '' }));
        }
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
      setPositions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const updateData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        workEmail: formData.workEmail.trim(),
        personalEmail: formData.personalEmail.trim(),
        mobilePhone: formData.mobilePhone.trim(),
        status: formData.status,
      };

      if (formData.middleName) {
        updateData.middleName = formData.middleName.trim();
      }

      // Add department and position if selected
      if (formData.primaryDepartmentId) {
        updateData.primaryDepartmentId = formData.primaryDepartmentId;
      }
      if (formData.primaryPositionId) {
        updateData.primaryPositionId = formData.primaryPositionId;
      }

      await hrApi.updateEmployeeAsHr(employeeId, updateData);
      router.push('/modules/hr/employees');
    } catch (err: any) {
      let errorMessage = 'Failed to update employee';
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const userRoles = user?.roles || [];
  const hasHrRole = 
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

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
        <div className={styles.loading}>Loading employee...</div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className={styles.container}>
        <Card padding="lg" shadow="warm">
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
          <Button onClick={fetchEmployee} variant="primary" style={{ marginTop: '1rem' }}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Employee</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <Card padding="lg" shadow="warm">
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}

          <div className={styles.section}>
            <h2>Personal Information</h2>
            <div className={styles.formGrid}>
              <Input
                id="firstName"
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
                fullWidth
              />
              <Input
                id="middleName"
                label="Middle Name"
                value={formData.middleName}
                onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                fullWidth
              />
              <Input
                id="lastName"
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
                fullWidth
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2>Contact Information</h2>
            <div className={styles.formGrid}>
              <Input
                id="workEmail"
                label="Work Email *"
                type="email"
                value={formData.workEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, workEmail: e.target.value }))}
                required
                fullWidth
              />
              <Input
                id="personalEmail"
                label="Personal Email"
                type="email"
                value={formData.personalEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))}
                fullWidth
              />
              <Input
                id="mobilePhone"
                label="Mobile Phone"
                value={formData.mobilePhone}
                onChange={(e) => setFormData(prev => ({ ...prev, mobilePhone: e.target.value }))}
                fullWidth
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2>Employment Information</h2>
            <div className={styles.formGrid}>
              <Input
                id="employeeNumber"
                label="Employee Number"
                value={formData.employeeNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeNumber: e.target.value }))}
                fullWidth
                disabled
              />
              <div className={styles.formField}>
                <label htmlFor="status" className={styles.label}>
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className={styles.select}
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PROBATION">Probation</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Organization Assignment</h2>
            <p className={styles.helperText}>
              Assign employee to a department and position in the organization structure.
            </p>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="primaryDepartmentId" className={styles.label}>
                  Department
                </label>
                <select
                  id="primaryDepartmentId"
                  value={formData.primaryDepartmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryDepartmentId: e.target.value, primaryPositionId: '' }))}
                  className={styles.select}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label htmlFor="primaryPositionId" className={styles.label}>
                  Position
                </label>
                <select
                  id="primaryPositionId"
                  value={formData.primaryPositionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryPositionId: e.target.value }))}
                  className={styles.select}
                  disabled={!formData.primaryDepartmentId}
                >
                  <option value="">Select Position</option>
                  {positions.map((pos) => (
                    <option key={pos._id} value={pos._id}>
                      {pos.code} - {pos.title}
                    </option>
                  ))}
                </select>
                {!formData.primaryDepartmentId && (
                  <span className={styles.helperText}>
                    Select a department first to see available positions
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={saving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function EditEmployeePage() {
  return (
    <ProtectedRoute>
      <EditEmployeeContent />
    </ProtectedRoute>
  );
}

