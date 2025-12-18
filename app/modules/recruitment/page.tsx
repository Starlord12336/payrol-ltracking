/**
 * Recruitment Module
 * Handles job search (candidates) and recruitment management (HR)
 */

'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import CandidateRecruitmentView from './components/CandidateRecruitmentView';
import HRRecruitmentView from './components/HRRecruitmentView';
import { Card } from '@/shared/components';
import styles from './page.module.css';

export default function RecruitmentPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Card padding="lg" shadow="warm">
          <div className={styles.loading}>Loading...</div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <Card padding="lg" shadow="warm">
          <p>Please log in to access the recruitment module.</p>
        </Card>
      </div>
    );
  }

  // Determine view based on user type and roles
  const isCandidate = user.userType === 'candidate';
  const isHRUser =
    user.roles?.includes(SystemRole.HR_EMPLOYEE) ||
    user.roles?.includes(SystemRole.HR_MANAGER) ||
    user.roles?.includes(SystemRole.RECRUITER) ||
    user.roles?.includes(SystemRole.HR_ADMIN) ||
    user.roles?.includes(SystemRole.SYSTEM_ADMIN);

  return (
    <div className={styles.container}>
      {isCandidate ? (
        <CandidateRecruitmentView />
      ) : isHRUser ? (
        <HRRecruitmentView />
      ) : (
        <Card padding="lg" shadow="warm">
          <p>You don&apos;t have access to the recruitment module.</p>
        </Card>
      )}
    </div>
  );
}
