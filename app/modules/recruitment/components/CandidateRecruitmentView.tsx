/**
 * Candidate Recruitment View
 * Allows candidates to search and apply for jobs
 */

'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/shared/components';
import styles from './CandidateRecruitmentView.module.css';

export default function CandidateRecruitmentView() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={styles.container}>
      <Card padding="lg" shadow="warm">
        <div className={styles.header}>
          <h1>Job Search</h1>
          <p>Find and apply for open positions</p>
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
          <Button variant="primary" onClick={() => {}}>
            Search
          </Button>
        </div>

        <div className={styles.content}>
          <p className={styles.placeholder}>
            Job listings will appear here. This feature is under development.
          </p>
        </div>
      </Card>
    </div>
  );
}

