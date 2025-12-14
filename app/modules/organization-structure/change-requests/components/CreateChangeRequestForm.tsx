'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { createChangeRequest, getDepartments, getPositions, submitChangeRequest } from '../../api/orgStructureApi';
import {
  type CreateChangeRequestDto,
  ChangeRequestType,
  type Department,
  type Position,
} from '../../types';
import styles from './CreateChangeRequestForm.module.css';

interface CreateChangeRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateChangeRequestForm({
  onSuccess,
  onCancel,
}: CreateChangeRequestFormProps) {
  const [formData, setFormData] = useState<CreateChangeRequestDto>({
    requestType: ChangeRequestType.NEW_DEPARTMENT,
    reason: '',
    details: '',
  });

  // Dynamic form fields based on request type
  const [departmentCode, setDepartmentCode] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');
  const [departmentCostCenter, setDepartmentCostCenter] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [positionCode, setPositionCode] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [positionDescription, setPositionDescription] = useState('');
  const [positionDepartmentId, setPositionDepartmentId] = useState('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
    if (formData.requestType === ChangeRequestType.UPDATE_POSITION || formData.requestType === ChangeRequestType.CLOSE_POSITION) {
      fetchPositions();
    }
  }, [formData.requestType]);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments({ limit: 100, isActive: true });
      setDepartments(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await getPositions({ limit: 100, isActive: true });
      setPositions(response.data);
    } catch (err) {
      console.error('Error fetching positions:', err);
    }
  };

  const handleSubmit = async (submitForReview: boolean = false) => {
    setError(null);

    // Validation
    if (!formData.reason || !formData.reason.trim()) {
      setError('Reason is required');
      return;
    }

    // Type-specific validation
    if (formData.requestType === ChangeRequestType.NEW_DEPARTMENT) {
      if (!departmentCode.trim() || !departmentName.trim()) {
        setError('Department code and name are required');
        return;
      }
    } else if (formData.requestType === ChangeRequestType.UPDATE_DEPARTMENT) {
      if (!selectedDepartmentId) {
        setError('Please select a department to update');
        return;
      }
    } else if (formData.requestType === ChangeRequestType.NEW_POSITION) {
      if (!positionCode.trim() || !positionTitle.trim() || !positionDepartmentId) {
        setError('Position code, title, and department are required');
        return;
      }
    } else if (formData.requestType === ChangeRequestType.UPDATE_POSITION || formData.requestType === ChangeRequestType.CLOSE_POSITION) {
      if (!selectedPositionId) {
        setError('Please select a position');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Log the payload for debugging
      console.log('Creating change request with data:', {
        requestType: formData.requestType,
        reason: formData.reason.trim(),
        details: formData.details?.trim() || undefined,
      });

      const requestData: CreateChangeRequestDto = {
        requestType: formData.requestType,
        reason: formData.reason.trim(),
        details: formData.details?.trim() ? formData.details.trim() : undefined,
      };

      // Add target IDs based on type
      if (formData.requestType === ChangeRequestType.UPDATE_DEPARTMENT) {
        requestData.targetDepartmentId = selectedDepartmentId;
      } else if (formData.requestType === ChangeRequestType.UPDATE_POSITION || formData.requestType === ChangeRequestType.CLOSE_POSITION) {
        requestData.targetPositionId = selectedPositionId;
      }

      // Store additional details in the details field for NEW_DEPARTMENT and NEW_POSITION
      if (formData.requestType === ChangeRequestType.NEW_DEPARTMENT) {
        requestData.details = JSON.stringify({
          code: departmentCode.trim().toUpperCase(),
          name: departmentName.trim(),
          description: departmentDescription.trim() || undefined,
          costCenter: departmentCostCenter.trim() || undefined,
        });
      } else if (formData.requestType === ChangeRequestType.NEW_POSITION) {
        requestData.details = JSON.stringify({
          code: positionCode.trim().toUpperCase(),
          title: positionTitle.trim(),
          description: positionDescription.trim() || undefined,
          departmentId: positionDepartmentId,
        });
      }

      // Ensure reason is not empty string (backend might reject empty strings even if optional)
      if (!requestData.reason || !requestData.reason.trim()) {
        setError('Reason is required');
        setIsLoading(false);
        return;
      }

      // Remove undefined values to avoid sending them
      // Ensure requestType is a string (not enum object)
      const cleanRequestData: any = {
        requestType: String(requestData.requestType),
        reason: String(requestData.reason),
      };
      
      if (requestData.details) {
        cleanRequestData.details = requestData.details;
      }
      if (requestData.targetDepartmentId) {
        cleanRequestData.targetDepartmentId = requestData.targetDepartmentId;
      }
      if (requestData.targetPositionId) {
        cleanRequestData.targetPositionId = requestData.targetPositionId;
      }

      console.log('Sending clean request data:', cleanRequestData);

      const response = await createChangeRequest(cleanRequestData);
      console.log('Create change request response:', response);
      const createdRequestId = response.data._id;
      const createdRequestNumber = response.data.requestNumber;
      console.log('Created request ID:', createdRequestId);
      console.log('Created request number:', createdRequestNumber);
      
      if (submitForReview) {
        // If submitting for review, submit it immediately
        try {
          const submitResponse = await submitChangeRequest(createdRequestId);
          console.log('Submit change request response:', submitResponse);
        } catch (submitErr: any) {
          console.error('Error submitting request:', submitErr);
          // Request was created but submission failed - user can submit from list
        }
      }
      
      // Add a small delay to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSuccess();
    } catch (err: any) {
      console.error('Error creating change request:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error config (request):', err.config);
      
      // Try to get more detailed error message
      let errorMessage = 'Failed to create change request. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // If it's a 500 error, provide more helpful message
      if (err.response?.status === 500) {
        errorMessage = 'Server error occurred. Please check that all required fields are filled correctly and try again. If the problem persists, contact support.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (formData.requestType) {
      case ChangeRequestType.NEW_DEPARTMENT:
        return (
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label>Department Code *</label>
              <Input
                type="text"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value.toUpperCase())}
                placeholder="e.g., IT, HR, SALES"
                maxLength={10}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Department Name *</label>
              <Input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="e.g., Information Technology"
                maxLength={100}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={departmentDescription}
                onChange={(e) => setDepartmentDescription(e.target.value)}
                placeholder="Department description..."
                maxLength={500}
                rows={3}
                className={styles.textarea}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Cost Center</label>
              <Input
                type="text"
                value={departmentCostCenter}
                onChange={(e) => setDepartmentCostCenter(e.target.value.toUpperCase())}
                placeholder="Cost center code"
                maxLength={50}
              />
            </div>
          </div>
        );

      case ChangeRequestType.UPDATE_DEPARTMENT:
        return (
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label>Select Department *</label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
              <p className={styles.helpText}>
                Select the department you want to update. You can specify the changes in the details field below.
              </p>
            </div>
          </div>
        );

      case ChangeRequestType.NEW_POSITION:
        return (
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label>Position Code *</label>
              <Input
                type="text"
                value={positionCode}
                onChange={(e) => setPositionCode(e.target.value.toUpperCase())}
                placeholder="e.g., DEV, MGR, LEAD"
                maxLength={20}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Position Title *</label>
              <Input
                type="text"
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                placeholder="e.g., Senior Developer"
                maxLength={100}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Department *</label>
              <select
                value={positionDepartmentId}
                onChange={(e) => setPositionDepartmentId(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={positionDescription}
                onChange={(e) => setPositionDescription(e.target.value)}
                placeholder="Position description..."
                maxLength={1000}
                rows={3}
                className={styles.textarea}
              />
            </div>
          </div>
        );

      case ChangeRequestType.UPDATE_POSITION:
        return (
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label>Select Position *</label>
              <select
                value={selectedPositionId}
                onChange={(e) => setSelectedPositionId(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Select Position --</option>
                {positions.map((pos) => (
                  <option key={pos._id} value={pos._id}>
                    {pos.code} - {pos.title}
                  </option>
                ))}
              </select>
              <p className={styles.helpText}>
                Select the position you want to update. You can specify the changes in the details field below.
              </p>
            </div>
          </div>
        );

      case ChangeRequestType.CLOSE_POSITION:
        return (
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label>Select Position *</label>
              <select
                value={selectedPositionId}
                onChange={(e) => setSelectedPositionId(e.target.value)}
                className={styles.select}
              >
                <option value="">-- Select Position --</option>
                {positions.map((pos) => (
                  <option key={pos._id} value={pos._id}>
                    {pos.code} - {pos.title}
                  </option>
                ))}
              </select>
              <p className={styles.helpText}>
                Select the position you want to close/deactivate.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Create Change Request"
    >
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label>Request Type *</label>
          <select
            value={formData.requestType}
            onChange={(e) => {
              setFormData({ ...formData, requestType: e.target.value as ChangeRequestType as any });
              // Reset form fields when type changes
              setDepartmentCode('');
              setDepartmentName('');
              setDepartmentDescription('');
              setDepartmentCostCenter('');
              setSelectedDepartmentId('');
              setSelectedPositionId('');
              setPositionCode('');
              setPositionTitle('');
              setPositionDescription('');
              setPositionDepartmentId('');
            }}
            className={styles.select}
          >
            <option value={ChangeRequestType.NEW_DEPARTMENT}>New Department</option>
            <option value={ChangeRequestType.UPDATE_DEPARTMENT}>Update Department</option>
            <option value={ChangeRequestType.NEW_POSITION}>New Position</option>
            <option value={ChangeRequestType.UPDATE_POSITION}>Update Position</option>
            <option value={ChangeRequestType.CLOSE_POSITION}>Close Position</option>
          </select>
        </div>

        {renderFormFields()}

        <div className={styles.formGroup}>
          <label>Reason *</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Explain why this change is needed..."
            required
            rows={4}
            className={styles.textarea}
            maxLength={2000}
          />
          <p className={styles.helpText}>
            This field is required. Explain the business reason for this change.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>Additional Details (Optional)</label>
          <textarea
            value={formData.details || ''}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            placeholder="Any additional information about this change request..."
            rows={3}
            className={styles.textarea}
            maxLength={2000}
          />
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

