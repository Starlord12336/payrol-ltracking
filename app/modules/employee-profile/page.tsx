/**
 * Employee Profile Module
 * This module handles employee profile management
 * Based on User Stories: US-E2-04, US-E2-05, US-E2-12
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button, Card, ProtectedRoute } from '@/shared/components';
import { profileApi, type ProfileData, type ChangeRequest } from './api/profileApi';
import ProfilePictureSection from './components/ProfilePictureSection';
import PersonalInfoDisplay from './components/PersonalInfoDisplay';
import BiographySection from './components/BiographySection';
import ContactInfoSection from './components/ContactInfoSection';
import AddressSection from './components/AddressSection';
import ResumeSection from './components/ResumeSection';
import ChangePasswordModal from './components/ChangePasswordModal';
import ChangeRequestsList from './components/ChangeRequestsList';
import styles from './page.module.css';

function EmployeeProfileContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await profileApi.getMyProfile();
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeRequests = useCallback(async () => {
    // Only fetch change requests for employees
    if (user?.userType !== 'employee') {
      setChangeRequests([]);
      return;
    }
    
    try {
      const requests = await profileApi.getMyChangeRequests();
      setChangeRequests(requests);
    } catch (err: any) {
      console.error('Error fetching change requests:', err);
      // Don't show error to user, just log it
    }
  }, [user?.userType]);

  const handleChangeRequestSubmitted = () => {
    // Refresh both profile and change requests
    fetchProfile();
    fetchChangeRequests();
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchChangeRequests();
    }
  }, [user, fetchChangeRequests]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Card padding="lg" shadow="warm" className={styles.card}>
          <div className={styles.loading}>Loading profile...</div>
        </Card>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className={styles.container}>
        <Card padding="lg" shadow="warm" className={styles.card}>
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
          <Button onClick={fetchProfile} variant="primary" style={{ marginTop: '1rem' }}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card padding="lg" shadow="warm" className={styles.card}>
        <div className={styles.header}>
          <h1>{user?.userType === 'candidate' ? 'Candidate Profile' : 'Employee Profile'}</h1>
          <p>Manage your profile and account settings</p>
        </div>

        {/* Profile Picture Section (US-E2-12) - Only for employees */}
        {user?.userType === 'employee' && (
          <ProfilePictureSection profile={profile} onUpdate={fetchProfile} />
        )}

        {/* Personal Information (US-E2-04 - View Only) */}
        <PersonalInfoDisplay 
          profile={profile} 
          changeRequests={user?.userType === 'employee' ? changeRequests : []}
          onRequestSubmitted={handleChangeRequestSubmitted}
          isEmployee={user?.userType === 'employee'}
        />

        {/* Biography Section (US-E2-12) - Only for employees */}
        {user?.userType === 'employee' && (
          <BiographySection profile={profile} onUpdate={fetchProfile} />
        )}

        {/* Contact Information (US-E2-05) */}
        <ContactInfoSection profile={profile} onUpdate={fetchProfile} />

        {/* Address (US-E2-05) - Only for employees */}
        {user?.userType === 'employee' && (
          <AddressSection profile={profile} onUpdate={fetchProfile} />
        )}

        {/* Change Requests Section - Only for employees */}
        {user?.userType === 'employee' && (
          <ChangeRequestsList changeRequests={changeRequests} />
        )}

        {/* Resume/CV Section (REC-007) - Only for candidates */}
        {user?.userType === 'candidate' && user?.userid && (
          <ResumeSection candidateId={user.userid.toString()} profile={profile} onUpdate={fetchProfile} />
        )}

        {/* Security Settings */}
        <div className={styles.settingsSection}>
          <h2>Security Settings</h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h3>Password</h3>
                <p>Change your account password</p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}

export default function EmployeeProfilePage() {
  return (
    <ProtectedRoute>
      <EmployeeProfileContent />
    </ProtectedRoute>
  );
}

