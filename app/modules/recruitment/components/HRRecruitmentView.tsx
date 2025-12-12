/**
 * HR Recruitment View
 * Allows HR users to manage job postings, applications, and candidates
 */

'use client';

import { useState } from 'react';
import { Card, Button } from '@/shared/components';
import styles from './HRRecruitmentView.module.css';

export default function HRRecruitmentView() {
  const [activeTab, setActiveTab] = useState<'postings' | 'applications' | 'candidates'>('postings');

  return (
    <div className={styles.container}>
      <Card padding="lg" shadow="warm">
        <div className={styles.header}>
          <h1>Recruitment Management</h1>
          <p>Manage job postings, applications, and candidates</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'postings' ? styles.active : ''}`}
            onClick={() => setActiveTab('postings')}
          >
            Job Postings
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'applications' ? styles.active : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'candidates' ? styles.active : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            Candidates
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'postings' && (
            <div className={styles.tabContent}>
              <div className={styles.actions}>
                <Button variant="primary" onClick={() => {}}>
                  Create Job Posting
                </Button>
              </div>
              <p className={styles.placeholder}>
                Job postings will appear here. This feature is under development.
              </p>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className={styles.tabContent}>
              <p className={styles.placeholder}>
                Applications will appear here. This feature is under development.
              </p>
            </div>
          )}

          {activeTab === 'candidates' && (
            <div className={styles.tabContent}>
              <p className={styles.placeholder}>
                Candidate list will appear here. This feature is under development.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

