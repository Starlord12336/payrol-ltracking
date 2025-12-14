'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/shared/components';
import { Card, Button } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import {
  getOrgChart,
  getDepartmentOrgChart,
  getSimplifiedOrgChart,
  exportOrgChartJson,
  exportOrgChartCsv,
  getPositions,
} from '../api/orgStructureApi';
import { getDepartments } from '../api/orgStructureApi';
import type { OrgChartResponse, SimplifiedOrgChartResponse, Department } from '../types';
import { OrgChartVisualization } from './components/OrgChartVisualization';
import { SimplifiedOrgChartView } from './components/SimplifiedOrgChartView';
import styles from './page.module.css';

type ViewType = 'full' | 'department' | 'simplified';

function OrgChartContent() {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<ViewType>('full');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [orgChartData, setOrgChartData] = useState<OrgChartResponse | null>(null);
  const [simplifiedData, setSimplifiedData] = useState<SimplifiedOrgChartResponse | null>(null);
  const [allPositions, setAllPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const userRoles = user?.roles || [];
  const canAccessOrgStructure =
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN) ||
    userRoles.includes(SystemRole.DEPARTMENT_EMPLOYEE) ||
    userRoles.includes(SystemRole.DEPARTMENT_HEAD);
  
  // Employees and Managers have read-only access
  const isReadOnly = !userRoles.includes(SystemRole.SYSTEM_ADMIN) && 
                     !userRoles.includes(SystemRole.HR_ADMIN) && 
                     !userRoles.includes(SystemRole.HR_MANAGER);

  // Fetch departments for dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartments({ limit: 100, isActive: true });
        setDepartments(response.data);
        if (response.data.length > 0 && !selectedDepartmentId) {
          setSelectedDepartmentId(response.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, [selectedDepartmentId]);

  // Fetch all positions for complete tree building
  useEffect(() => {
    const fetchAllPositions = async () => {
      try {
        const response = await getPositions({ limit: 100, isActive: true });
        console.log('Fetched all positions:', response.data?.length || 0);
        setAllPositions(response.data || []);
      } catch (err) {
        console.error('Error fetching all positions:', err);
        setAllPositions([]);
      }
    };
    fetchAllPositions();
  }, []);

  // Fetch org chart data based on view type
  useEffect(() => {
    const fetchOrgChart = async () => {
      setLoading(true);
      setError(null);

      try {
        if (viewType === 'simplified') {
          const response = await getSimplifiedOrgChart();
          setSimplifiedData(response);
          setOrgChartData(null);
        } else if (viewType === 'department' && selectedDepartmentId) {
          const response = await getDepartmentOrgChart(selectedDepartmentId);
          setOrgChartData(response);
          setSimplifiedData(null);
        } else {
          const response = await getOrgChart();
          setOrgChartData(response);
          setSimplifiedData(null);
        }
      } catch (err: any) {
        console.error('Error fetching org chart:', err);
        setError(err.response?.data?.message || 'Failed to load organization chart');
      } finally {
        setLoading(false);
      }
    };

    if (viewType !== 'department' || selectedDepartmentId) {
      fetchOrgChart();
    }
  }, [viewType, selectedDepartmentId]);

  const handleExportJson = async () => {
    setExporting(true);
    try {
      if (viewType === 'department' && selectedDepartmentId) {
        await exportOrgChartJson(selectedDepartmentId);
      } else {
        await exportOrgChartJson();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to export JSON');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      if (viewType === 'department' && selectedDepartmentId) {
        await exportOrgChartCsv(selectedDepartmentId);
      } else {
        await exportOrgChartCsv();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  if (!canAccessOrgStructure) {
    return (
      <div className={styles.container}>
        <Card padding="lg">
          <div className={styles.emptyStateContent}>
            <h2>Access Denied</h2>
            <p>You don&apos;t have permission to access the Organization Chart.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Organization Chart</h1>
          <p>Visual representation of company structure and hierarchy</p>
        </div>
        <div className={styles.exportButtons}>
          <Button
            variant="outline"
            onClick={handleExportJson}
            disabled={loading || exporting}
          >
            {exporting ? 'Exporting...' : 'Export JSON'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={loading || exporting}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.viewSelector}>
          <label>View:</label>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as ViewType)}
            className={styles.select}
          >
            <option value="full">Full Chart</option>
            <option value="department">By Department</option>
            <option value="simplified">Simplified View</option>
          </select>
        </div>

        {viewType === 'department' && (
          <div className={styles.departmentSelector}>
            <label>Department:</label>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className={styles.select}
            >
              <option value="">Select a department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <Card padding="lg">
          <div className={styles.loading}>Loading organization chart...</div>
        </Card>
      ) : error ? (
        <Card padding="lg">
          <div className={styles.error}>{error}</div>
        </Card>
      ) : viewType === 'simplified' && simplifiedData ? (
        <SimplifiedOrgChartView departments={simplifiedData.data.departments || []} />
      ) : orgChartData ? (
        <OrgChartVisualization 
          departments={orgChartData.data.departments} 
          allPositions={allPositions}
        />
      ) : (
        <Card padding="lg">
          <div className={styles.emptyStateContent}>
            <p>No organization chart data available</p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  return (
    <ProtectedRoute>
      <OrgChartContent />
    </ProtectedRoute>
  );
}

