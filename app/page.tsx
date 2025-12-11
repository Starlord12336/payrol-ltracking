'use client';

import { useAuth } from '@/shared/hooks/useAuth';
import { Button, Card } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className={styles.container}>
        <Card padding="lg" shadow="warm" className={styles.card}>
          <h1>HR Management System</h1>
          <p>Welcome! Please login to continue.</p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/login')}
            className={styles.button}
          >
            Go to Login
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <Card padding="lg" shadow="warm" className={styles.card}>
        <h1>Welcome, {user?.email}!</h1>
        <div className={styles.userInfo}>
          <p><strong>User ID:</strong> {user?.userid}</p>
          <p><strong>User Type:</strong> {user?.userType}</p>
          {user?.employeeNumber && (
            <p><strong>Employee Number:</strong> {user.employeeNumber}</p>
          )}
          {user?.candidateNumber && (
            <p><strong>Candidate Number:</strong> {user.candidateNumber}</p>
          )}
          <p><strong>Roles:</strong> {user?.roles?.join(', ') || 'None'}</p>
        </div>
        <div className={styles.actions}>
          {(() => {
            const userRoles = user?.roles || [];
            
            // Debug: Log roles to console
            console.log('User roles:', userRoles);
            console.log('HR_ADMIN enum value:', SystemRole.HR_ADMIN);
            console.log('Direct includes check:', userRoles.includes(SystemRole.HR_ADMIN));
            console.log('String check:', userRoles.includes('HR Admin'));
            
            const isHrUser = 
              userRoles.includes(SystemRole.HR_ADMIN) ||
              userRoles.includes(SystemRole.HR_MANAGER) ||
              userRoles.includes(SystemRole.HR_EMPLOYEE) ||
              userRoles.includes(SystemRole.SYSTEM_ADMIN);
            
            // Check for org structure access - use both enum and string comparison
            const hasHrAdmin = userRoles.includes(SystemRole.HR_ADMIN) || userRoles.includes('HR Admin');
            const hasHrManager = userRoles.includes(SystemRole.HR_MANAGER) || userRoles.includes('HR Manager');
            const hasSystemAdmin = userRoles.includes(SystemRole.SYSTEM_ADMIN) || userRoles.includes('System Admin');
            
            const canAccessOrgStructure = hasHrAdmin || hasHrManager || hasSystemAdmin;

            console.log('hasHrAdmin:', hasHrAdmin);
            console.log('hasHrManager:', hasHrManager);
            console.log('hasSystemAdmin:', hasSystemAdmin);
            console.log('canAccessOrgStructure:', canAccessOrgStructure);

            return (
              <>
                {isHrUser && (
                  <Button variant="primary" onClick={() => router.push('/modules/hr')}>
                    HR Dashboard
                  </Button>
                )}
                {canAccessOrgStructure && (
                  <Button variant="primary" onClick={() => router.push('/modules/organization-structure')}>
                    Organization Structure
                  </Button>
                )}
                {!isHrUser && (
                  <Button variant="primary" onClick={() => router.push('/modules/employee-profile')}>
                    {user?.userType === 'candidate' ? 'Candidate Profile' : 'Employee Profile'}
                  </Button>
                )}
              </>
            );
          })()}
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </Card>
    </main>
  );
}

