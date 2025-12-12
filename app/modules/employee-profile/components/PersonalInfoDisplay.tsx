/**
 * Personal Information Display Component
 * Shows read-only personal information (US-E2-04)
 * Allows employees to request corrections via change requests
 */

'use client';

import { useState } from 'react';
import { Button } from '@/shared/components';
import type { ProfileData, ChangeRequest } from '../api/profileApi';
import ChangeRequestModal from './ChangeRequestModal';
import ChangeRequestStatus from './ChangeRequestStatus';
import styles from './PersonalInfoDisplay.module.css';

interface PersonalInfoDisplayProps {
  profile: ProfileData | null;
  changeRequests?: ChangeRequest[];
  onRequestSubmitted?: () => void;
  isEmployee?: boolean;
}

type FieldType = 'text' | 'gender' | 'maritalStatus' | 'employeeStatus' | 'contractType' | 'date';

interface FieldConfig {
  fieldName: string;
  label: string;
  fieldType: FieldType;
  getValue: (p: ProfileData) => any;
}

// Fields that require change requests (read-only)
const CHANGE_REQUEST_FIELDS: FieldConfig[] = [
  { fieldName: 'fullName', label: 'Full Name', fieldType: 'text', getValue: (p: ProfileData) => p.fullName },
  { fieldName: 'nationalId', label: 'National ID', fieldType: 'text', getValue: (p: ProfileData) => p.nationalId },
  { fieldName: 'dateOfBirth', label: 'Date of Birth', fieldType: 'date', getValue: (p: ProfileData) => p.dateOfBirth },
  // employeeNumber is locked and cannot be changed via change request
  { fieldName: 'gender', label: 'Gender', fieldType: 'gender', getValue: (p: ProfileData) => p.gender },
  { fieldName: 'maritalStatus', label: 'Marital Status', fieldType: 'maritalStatus', getValue: (p: ProfileData) => p.maritalStatus },
  { fieldName: 'jobTitle', label: 'Job Title', fieldType: 'text', getValue: (p: ProfileData) => p.jobTitle },
  { fieldName: 'department', label: 'Department', fieldType: 'text', getValue: (p: ProfileData) => p.department },
  { fieldName: 'dateOfHire', label: 'Date of Hire', fieldType: 'date', getValue: (p: ProfileData) => p.dateOfHire },
  { fieldName: 'contractType', label: 'Contract Type', fieldType: 'contractType', getValue: (p: ProfileData) => p.contractType },
  { fieldName: 'status', label: 'Status', fieldType: 'employeeStatus', getValue: (p: ProfileData) => p.status },
];

export default function PersonalInfoDisplay({ 
  profile, 
  changeRequests = [],
  onRequestSubmitted,
  isEmployee = false
}: PersonalInfoDisplayProps) {
  const [openModalField, setOpenModalField] = useState<string | null>(null);

  if (!profile) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleRequestCorrection = (fieldName: string) => {
    setOpenModalField(fieldName);
  };

  const handleModalClose = () => {
    setOpenModalField(null);
  };

  const handleRequestSuccess = () => {
    if (onRequestSubmitted) {
      onRequestSubmitted();
    }
  };

  const getFieldConfig = (fieldName: string): FieldConfig | undefined => {
    return CHANGE_REQUEST_FIELDS.find((f) => f.fieldName === fieldName);
  };

  const formatEnumValue = (value: string | undefined): string => {
    if (!value) return 'N/A';
    // Format enum values to be more readable
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Compute fullName from firstName and lastName if fullName is not available
  const getFullName = (): string => {
    if (profile.fullName) {
      return profile.fullName;
    }
    // Compute from firstName and lastName
    const parts = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  const renderFieldWithRequestButton = (
    label: string,
    value: any,
    fieldName: string,
    formatter?: (val: any) => string
  ) => {
    const fieldConfig = getFieldConfig(fieldName);
    const displayValue = formatter ? formatter(value) : (value || 'N/A');
    const canRequestCorrection = fieldConfig !== undefined && isEmployee;

    return (
      <div className={styles.infoItem}>
        <div className={styles.fieldHeader}>
          <strong>{label}:</strong>
          {canRequestCorrection && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleRequestCorrection(fieldName)}
              className={styles.requestButton}
            >
              Request Correction
            </Button>
          )}
        </div>
        <span>{displayValue}</span>
        {canRequestCorrection && changeRequests.length > 0 && (
          <ChangeRequestStatus fieldName={fieldName} changeRequests={changeRequests} />
        )}
      </div>
    );
  };

  const renderLockedField = (
    label: string,
    value: any,
    formatter?: (val: any) => string
  ) => {
    const displayValue = formatter ? formatter(value) : (value || 'N/A');

    return (
      <div className={`${styles.infoItem} ${styles.lockedField}`}>
        <div className={styles.fieldHeader}>
          <strong>{label}:</strong>
          <span className={styles.lockedIcon} title="This field is locked and cannot be changed">
            🔒
          </span>
        </div>
        <span className={styles.lockedValue}>{displayValue}</span>
      </div>
    );
  };

  return (
    <div className={styles.personalInfoSection}>
      <h2>Personal Information</h2>
      <p className={styles.sectionDescription}>
        {isEmployee 
          ? 'Some information is read-only. If you notice an error, you can request a correction.'
          : 'This information is read-only and cannot be changed.'}
      </p>

      <div className={styles.infoGrid}>
        {renderFieldWithRequestButton('Full Name', getFullName(), 'fullName')}

        {profile.employeeNumber && 
          renderLockedField('Employee Number', profile.employeeNumber)
        }

        {profile.candidateNumber && (
          <div className={styles.infoItem}>
            <strong>Candidate Number:</strong>
            <span>{profile.candidateNumber}</span>
          </div>
        )}

        {renderFieldWithRequestButton('National ID', profile.nationalId, 'nationalId')}
        {renderFieldWithRequestButton('Date of Birth', profile.dateOfBirth, 'dateOfBirth', formatDate)}
        {renderFieldWithRequestButton('Gender', profile.gender, 'gender', formatEnumValue)}
        {renderFieldWithRequestButton('Marital Status', profile.maritalStatus, 'maritalStatus', formatEnumValue)}

        {/* Additional fields that may require change requests */}
        {profile.jobTitle && 
          renderFieldWithRequestButton('Job Title', profile.jobTitle, 'jobTitle')
        }

        {profile.department && 
          renderFieldWithRequestButton('Department', profile.department, 'department')
        }

        {profile.dateOfHire && 
          renderFieldWithRequestButton('Date of Hire', profile.dateOfHire, 'dateOfHire', formatDate)
        }

        {profile.contractType && 
          renderFieldWithRequestButton('Contract Type', profile.contractType, 'contractType', formatEnumValue)
        }

        {profile.status && 
          renderFieldWithRequestButton('Status', profile.status, 'status', formatEnumValue)
        }
      </div>

      {/* Change Request Modals - Only for employees */}
      {isEmployee && CHANGE_REQUEST_FIELDS.map((field) => {
        const isOpen = openModalField === field.fieldName;
        // For fullName, use computed value; for others, use the getter
        const currentValue = field.fieldName === 'fullName' 
          ? getFullName() 
          : field.getValue(profile);

        return (
          <ChangeRequestModal
            key={field.fieldName}
            isOpen={isOpen}
            onClose={handleModalClose}
            onSuccess={handleRequestSuccess}
            fieldName={field.fieldName}
            fieldLabel={field.label}
            currentValue={currentValue}
            fieldType={field.fieldType}
          />
        );
      })}
    </div>
  );
}

