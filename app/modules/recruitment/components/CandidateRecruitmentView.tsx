/**
 * Candidate Recruitment View
 * Allows candidates to search and apply for jobs
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Modal } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import { recruitmentApi } from '../api/recruitment.api';
import JobRequisitionList from './JobRequisitionList';
import styles from './CandidateRecruitmentView.module.css';

export default function CandidateRecruitmentView() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      if (user && user.userType === 'candidate') {
        try {
          const consent = await recruitmentApi.getLatestConsent(user.userid);
          if (!consent || !consent.data || !consent.data.granted) {
            setShowConsent(true);
          }
        } catch (error) {
          console.error('Error checking consent:', error);
          setShowConsent(true);
        }
      }
    };
    checkConsent();
  }, [user]);

  const handleGrantConsent = async () => {
    if (!user) return;
    try {
      await recruitmentApi.grantConsent(user.userid, 'Agreed via Candidate Portal');
      setShowConsent(false);
    } catch (error) {
      console.error('Failed to grant consent:', error);
      alert('Failed to save consent. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <Card padding="lg" shadow="warm">
        <div className={styles.header}>
          <h1>Job Search</h1>
          <p>Find and apply for open positions</p>
          <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/my-applications'}>
            My Applications
          </Button>
          <Button variant="primary" style={{ marginLeft: '1rem' }} onClick={() => window.location.href = '/modules/recruitment/offer'}>
            My Offers
          </Button>
        </div>

        <div className={styles.searchSection}>
          <Input
            id="search"
            name="search"
            type="text"
            label="Search Jobs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, department, or keywords..."
            fullWidth
          />
          <Button variant="primary" onClick={() => { }}>
            Search
          </Button>
        </div>

        <div className={styles.content}>
          <JobRequisitionList isCandidate={true} status="OPEN" />
        </div>
      </Card>

      <Modal
        isOpen={showConsent}
        onClose={() => { }}
        title="Candidate Consent Required"
        showCloseButton={false}
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            To proceed with your application, you must agree to our data processing and background check policies.
            Your personal data will be processed in accordance with GDPR and local regulations.
            We may conduct background checks including education, employment history, and criminal record checks where applicable.
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '2rem' }}>
            <input
              type="checkbox"
              id="consent-check"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={{ marginTop: '0.25rem', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="consent-check" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
              I have read and agree to the Personal Data Processing and Background Check Policy.
              I give my full consent for the processing of my personal data and the conduct of background checks.
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button
              variant="primary"
              onClick={handleGrantConsent}
              disabled={!consentChecked}
            >
              Agree & Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

