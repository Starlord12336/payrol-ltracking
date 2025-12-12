/**
 * Change Requests Page
 * Review and approve/reject employee-submitted profile changes
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Card, Button, ProtectedRoute } from '@/shared/components';
import { SystemRole, Gender, MaritalStatus, EmployeeStatus, ContractType } from '@/shared/types/auth';
import { hrApi, type ChangeRequest, type EmployeeProfile } from '../api/hrApi';
import styles from './page.module.css';

function ChangeRequestsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRequests();
  }, []);

  // Check if user has HR role
  const userRoles = user?.roles || [];
  const hasHrRole = 
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

  // Parse requestDescription to extract field name, old value, and new value
  const parseRequestDescription = (description?: string) => {
    if (!description) {
      return { fieldName: 'Unknown', oldValue: 'N/A', newValue: 'N/A', additionalDetails: '' };
    }

    const lines = description.split('\n');
    let fieldName = 'Unknown';
    let oldValue = 'N/A';
    let newValue = 'N/A';
    let additionalDetails = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('Field:')) {
        fieldName = line.replace('Field:', '').trim();
      } else if (line.startsWith('Current Value:')) {
        oldValue = line.replace('Current Value:', '').trim();
      } else if (line.startsWith('Corrected Value:')) {
        newValue = line.replace('Corrected Value:', '').trim();
      } else if (line.startsWith('Additional Details:')) {
        // Get everything after "Additional Details:"
        additionalDetails = lines.slice(i).join('\n').replace('Additional Details:', '').trim();
        break;
      }
    }

    return { fieldName, oldValue, newValue, additionalDetails };
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getFieldLabel = (fieldName: string): string => {
    const fieldLabels: Record<string, string> = {
      fullName: 'Full Name',
      nationalId: 'National ID',
      dateOfBirth: 'Date of Birth',
      employeeNumber: 'Employee Number',
      gender: 'Gender',
      maritalStatus: 'Marital Status',
      jobTitle: 'Job Title',
      department: 'Department',
      dateOfHire: 'Date of Hire',
      contractType: 'Contract Type',
      status: 'Status',
    };
    return fieldLabels[fieldName] || fieldName;
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrApi.getPendingChangeRequests();
      setRequests(data);

      // Fetch employee names for all unique employeeProfileIds
      const uniqueEmployeeIds = [...new Set(data.map(r => r.employeeProfileId))];
      const namesMap: Record<string, string> = {};
      
      // Fetch employee names in parallel
      await Promise.all(
        uniqueEmployeeIds.map(async (employeeId) => {
          try {
            const employee = await hrApi.getEmployeeById(employeeId);
            namesMap[employeeId] = employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown Employee';
          } catch (err) {
            namesMap[employeeId] = 'Unknown Employee';
          }
        })
      );
      
      setEmployeeNames(namesMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load change requests');
    } finally {
      setLoading(false);
    }
  };

  // Map change request field names to API field names
  // Note: employeeNumber is locked and cannot be updated via change requests
  const mapFieldToApiField = (fieldName: string): string | null => {
    const fieldMap: Record<string, string> = {
      'Full Name': 'fullName',
      'fullName': 'fullName',
      'National ID': 'nationalId',
      'nationalId': 'nationalId',
      'Date of Birth': 'dateOfBirth',
      'dateOfBirth': 'dateOfBirth',
      // 'Employee Number' is intentionally excluded - it's locked
      'Gender': 'gender',
      'gender': 'gender',
      'Marital Status': 'maritalStatus',
      'maritalStatus': 'maritalStatus',
      'Job Title': 'jobTitle',
      'jobTitle': 'jobTitle',
      'Department': 'department',
      'department': 'department',
      'Date of Hire': 'dateOfHire',
      'dateOfHire': 'dateOfHire',
      'Contract Type': 'contractType',
      'contractType': 'contractType',
      'Status': 'status',
      'status': 'status',
    };
    return fieldMap[fieldName] || null;
  };

  // Convert formatted enum value back to raw enum value
  const convertToRawEnumValue = (formattedValue: string, fieldName: string): string | null => {
    // Map of field names to their enum objects
    const enumMap: Record<string, Record<string, string>> = {
      gender: Gender,
      maritalStatus: MaritalStatus,
      status: EmployeeStatus,
      contractType: ContractType,
    };

    const enumObj = enumMap[fieldName];
    if (!enumObj) {
      return null; // Not an enum field
    }

    // Try to find the enum value that matches when formatted
    const enumValues = Object.values(enumObj) as string[];
    for (const enumValue of enumValues) {
      // Format the enum value and compare
      const formatted = enumValue.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
      if (formatted.toLowerCase() === formattedValue.toLowerCase()) {
        return enumValue;
      }
    }

    // If exact match not found, check if the value is already a raw enum value
    if (enumValues.includes(formattedValue)) {
      return formattedValue;
    }

    return null;
  };

  // Convert formatted date back to ISO string
  const convertToIsoDate = (dateValue: string): string | null => {
    try {
      // Try parsing as a formatted date (e.g., "December 11, 2025")
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
      }
    } catch {
      // If parsing fails, try if it's already in ISO format
      if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
        return dateValue;
      }
    }
    return null;
  };

  // Prepare update data based on field name and new value
  const prepareUpdateData = (fieldName: string, newValue: any): Partial<EmployeeProfile> => {
    const apiField = mapFieldToApiField(fieldName);
    if (!apiField) {
      return {};
    }

    const updateData: Partial<EmployeeProfile> = {};

    // Handle special cases
    if (apiField === 'fullName' && typeof newValue === 'string') {
      // Update fullName directly first
      updateData.fullName = newValue.trim();
      
      // Also split full name into firstName and lastName for backend compatibility
      const nameParts = newValue.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        updateData.firstName = nameParts[0];
        updateData.lastName = nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1) {
        updateData.firstName = nameParts[0];
        updateData.lastName = '';
      }
    } else if (apiField === 'dateOfBirth' || apiField === 'dateOfHire') {
      // Handle date fields - convert to ISO string
      const isoDate = convertToIsoDate(String(newValue));
      if (isoDate) {
        (updateData as any)[apiField] = isoDate;
      }
    } else if (apiField === 'gender' || apiField === 'maritalStatus' || apiField === 'status' || apiField === 'contractType') {
      // Handle enum fields - convert formatted value back to raw enum value
      const rawEnumValue = convertToRawEnumValue(String(newValue), apiField);
      if (rawEnumValue) {
        (updateData as any)[apiField] = rawEnumValue;
      } else {
        // If conversion fails, try using the value as-is (might already be raw)
        (updateData as any)[apiField] = newValue;
      }
    } else {
      // For other fields, directly assign the value
      (updateData as any)[apiField] = newValue;
    }

    return updateData;
  };

  const handleApprove = async (requestId: string, request: ChangeRequest) => {
    try {
      setProcessingId(requestId);
      
      // Parse the request to get field name and new value
      const parsed = parseRequestDescription(request.requestDescription);
      const fieldName = request.fieldName || parsed.fieldName;
      const newValue = request.newValue !== undefined ? request.newValue : parsed.newValue;

      // First, update the change request status
      await hrApi.updateChangeRequestStatus(requestId, 'APPROVED');
      
      // Then, automatically update the employee profile
      const updateData = prepareUpdateData(fieldName, newValue);
      
      if (Object.keys(updateData).length > 0) {
        try {
          await hrApi.updateEmployeeAsHr(request.employeeProfileId, updateData);
        } catch (profileUpdateError: any) {
          // If profile update fails, still show success for the approval
          // but warn the user
          console.error('Failed to update employee profile:', profileUpdateError);
          alert(`Change request approved, but failed to automatically update employee profile: ${profileUpdateError.message || 'Unknown error'}. Please update manually using the employee profile page.`);
        }
      } else {
        // Field cannot be automatically updated, but request is still approved
        alert(`Change request approved. Field "${fieldName}" cannot be automatically updated. Please update manually using the employee profile page.`);
      }
      
      await fetchRequests(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const comments = prompt('Enter rejection reason (optional):');
    if (comments === null) return; // User cancelled

    try {
      setProcessingId(requestId);
      await hrApi.updateChangeRequestStatus(requestId, 'REJECTED', comments || undefined);
      await fetchRequests(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

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
        <div className={styles.loading}>Loading change requests...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Pending Change Requests</h1>
        <p>Review and approve employee profile change requests</p>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No pending change requests</p>
          </div>
        </Card>
      ) : (
        <div className={styles.requestsList}>
          {requests.map((request) => {
            // Parse requestDescription to extract field info
            const parsed = parseRequestDescription(request.requestDescription);
            const fieldName = request.fieldName || parsed.fieldName;
            const oldValue = request.oldValue !== undefined ? request.oldValue : parsed.oldValue;
            const newValue = request.newValue !== undefined ? request.newValue : parsed.newValue;
            const additionalDetails = parsed.additionalDetails;
            const employeeName = request.employeeName || employeeNames[request.employeeProfileId] || 'Unknown Employee';

            return (
              <Card key={request._id} padding="lg" shadow="warm" className={styles.requestCard}>
                <div className={styles.requestHeader}>
                  <div>
                    <h3>{employeeName}</h3>
                    {request.requestId && (
                      <p className={styles.requestId}>Request #{request.requestId}</p>
                    )}
                  </div>
                  <span className={styles.date}>
                    {new Date(request.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className={styles.requestDetails}>
                  <div className={styles.fieldChange}>
                    <strong>Field:</strong> {getFieldLabel(fieldName)}
                  </div>
                  <div className={styles.valueComparison}>
                    <div className={styles.valueBox}>
                      <span className={styles.valueLabel}>Current:</span>
                      <span className={styles.oldValue}>
                        {formatValue(oldValue)}
                      </span>
                    </div>
                    <div className={styles.arrow}>→</div>
                    <div className={styles.valueBox}>
                      <span className={styles.valueLabel}>Requested:</span>
                      <span className={styles.newValue}>
                        {formatValue(newValue)}
                      </span>
                    </div>
                  </div>
                  {request.reason && (
                    <div className={styles.reason}>
                      <strong>Reason:</strong> {request.reason}
                    </div>
                  )}
                  {additionalDetails && (
                    <div className={styles.additionalDetails}>
                      <strong>Additional Details:</strong>
                      <p>{additionalDetails}</p>
                    </div>
                  )}
                </div>

                <div className={styles.requestActions}>
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(request._id, request)}
                    disabled={processingId === request._id}
                    size="sm"
                  >
                    {processingId === request._id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(request._id)}
                    disabled={processingId === request._id}
                    size="sm"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/modules/hr/employees/${request.employeeProfileId}`)}
                    size="sm"
                  >
                    View Employee
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ChangeRequestsPage() {
  return (
    <ProtectedRoute>
      <ChangeRequestsContent />
    </ProtectedRoute>
  );
}

