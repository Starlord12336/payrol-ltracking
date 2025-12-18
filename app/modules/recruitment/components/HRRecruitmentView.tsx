
import { useState } from 'react';
import { Card, Button } from '@/shared/components';
import RecruitmentPostings from './RecruitmentPostings';
import HRApplicationList from './HRApplicationList';
import HRConfigurationView from './HRConfigurationView';
import styles from './HRRecruitmentView.module.css';

export default function HRRecruitmentView() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'config'>('jobs');

  return (
    <div className={styles.container}>
      <Card padding="lg" shadow="warm">
        <div className={styles.header}>
          <h1>HR Management Console</h1>
          <p>Comprehensive management for Recruitment, Onboarding, and Offboarding</p>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/modules/recruitment/onboarding'}
          >
            📋 Go to Onboarding Management
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/modules/recruitment/offboarding'}
          >
            🚪 Go to Offboarding Management
          </Button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'jobs' ? styles.active : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'applications' ? styles.active : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'config' ? styles.active : ''}`}
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'jobs' && <RecruitmentPostings />}

          {activeTab === 'applications' && <HRApplicationList />}

          {activeTab === 'config' && <HRConfigurationView />}
        </div>
      </Card>
    </div>
  );
}


