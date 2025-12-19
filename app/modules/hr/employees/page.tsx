/**
 * All Employees Page
 * View and manage all employee profiles
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Card, Button, Input, ProtectedRoute } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { hrApi, type EmployeeProfile } from '../api/hrApi';
import { getDepartments, getPositions } from '@/app/modules/organization-structure/api/orgStructureApi';
import type { Department, Position } from '@/app/modules/organization-structure/types';
import styles from './page.module.css';

function EmployeesListContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employeeRoles, setEmployeeRoles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchEmployeeRoles = useCallback(async () => {
    try {
      const rolesMap: Record<string, string[]> = {};
      // Roles should now be included in the employee data from backend
      employees.forEach((employee: any) => {
        if (employee.roles && Array.isArray(employee.roles)) {
          rolesMap[employee._id] = employee.roles;
        } else {
          rolesMap[employee._id] = [];
        }
      });
      setEmployeeRoles(rolesMap);
    } catch (err) {
      console.error('Error processing employee roles:', err);
    }
  }, [employees]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
  }, []);

  useEffect(() => {
    // Fetch roles for all employees
    if (employees.length > 0) {
      fetchEmployeeRoles();
    }
  }, [employees, fetchEmployeeRoles]);

  // Check if user has HR role
  const userRoles = user?.roles || [];
  const hasHrRole = 
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.getAllEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments({ limit: 1000, isActive: true });
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      // Don't set error state - this is a fallback, not critical
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await getPositions({ limit: 1000, isActive: true });
      setPositions(response.data || []);
    } catch (err) {
      console.error('Error fetching positions:', err);
      // Don't set error state - this is a fallback, not critical
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {};
      if (searchTerm) {
        filters.fullName = searchTerm;
      }
      if (statusFilter) {
        filters.status = statusFilter;
      }
      const data = await hrApi.searchEmployees(filters);
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#2ecc71'; // Green
      case 'PROBATION':
        return '#f39c12'; // Yellow
      case 'INACTIVE':
        return '#e74c3c'; // Red
      case 'ON_LEAVE':
        return '#95a5a6'; // Gray
      case 'SUSPENDED':
        return '#34495e'; // Dark
      default:
        return '#95a5a6';
    }
  };

  const getDepartmentName = (departmentId?: string | { _id: string; name: string; code: string }) => {
    if (!departmentId) return 'N/A';
    // If it's already populated (object), use it directly
    if (typeof departmentId === 'object' && departmentId.name) {
      return departmentId.name;
    }
    // Otherwise, look it up from the departments array (fallback)
    if (typeof departmentId === 'string') {
      const department = departments.find(d => d._id === departmentId);
      return department?.name || 'N/A';
    }
    return 'N/A';
  };

  const getPositionName = (positionId?: string | { _id: string; title: string; code: string }) => {
    if (!positionId) return 'N/A';
    // If it's already populated (object), use it directly
    if (typeof positionId === 'object' && positionId.title) {
      return positionId.title;
    }
    // Otherwise, look it up from the positions array (fallback)
    if (typeof positionId === 'string') {
      const position = positions.find(p => p._id === positionId);
      return position?.title || 'N/A';
    }
    return 'N/A';
  };

  const getEmployeeRoles = (employeeId: string) => {
    return employeeRoles[employeeId] || [];
  };

  const isAdmin = 
    userRoles.includes(SystemRole.HR_ADMIN) || 
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

  if (loading && employees.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading employees...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>All Employees</h1>
        {isAdmin && (
          <Button variant="primary" onClick={() => router.push('/modules/hr/employees/new')}>
            + Add Employee
          </Button>
        )}
      </div>

      <Card padding="lg" shadow="warm" className={styles.searchCard}>
        <div className={styles.searchForm}>
          <Input
            id="search"
            type="text"
            label="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter employee name..."
            fullWidth
          />
          <div className={styles.filterGroup}>
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="PROBATION">Probation</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="outline" onClick={fetchEmployees}>
            Reset
          </Button>
        </div>
      </Card>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      <Card padding="lg" shadow="warm">
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee #</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.noData}>
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((employee) => {
                  const roles = getEmployeeRoles(employee._id);
                  return (
                    <tr key={employee._id}>
                      <td>{employee.fullName}</td>
                      <td>{employee.employeeNumber || 'N/A'}</td>
                      <td>{employee.workEmail || employee.personalEmail || 'N/A'}</td>
                      <td>{getDepartmentName(employee.primaryDepartmentId)}</td>
                      <td>{getPositionName(employee.primaryPositionId)}</td>
                      <td>
                        {roles.length > 0 ? (
                          <div className={styles.rolesContainer}>
                            {roles.map((role, idx) => (
                              <span key={idx} className={styles.roleBadge}>
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(employee.status) }}
                        >
                          {employee.status || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => router.push(`/modules/hr/employees/${employee._id}/edit`)}
                          >
                            View/Edit
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/modules/hr/employees/${employee._id}/roles`)}
                            >
                              Roles
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function EmployeesListPage() {
  return (
    <ProtectedRoute>
      <EmployeesListContent />
    </ProtectedRoute>
  );
}

