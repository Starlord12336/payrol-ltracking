'use client';

import { Suspense, useState } from 'react';
import { Button, Card } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import HROffboardingView from '../components/HROffboardingView';
import EmployeeOffboardingView from '../components/EmployeeOffboardingView';
import AdminOffboardingView from '../components/AdminOffboardingView';
import styles from '../page.module.css';

// Role constants from shared types (redefined here or imported if possible, but safe to match strings)
const ROLES = {
    HR_MANAGER: 'HR Manager',
    HR_EMPLOYEE: 'HR Employee',
    HR_ADMIN: 'HR Admin',
    SYSTEM_ADMIN: 'System Admin'
};

function OffboardingPageContent() {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<'EMPLOYEE' | 'MANAGER' | 'ADMIN'>('EMPLOYEE');

    if (!user) return <div>Loading user profile...</div>;

    const hasManagerAccess = user.roles.includes(ROLES.HR_MANAGER as any) || user.roles.includes(ROLES.HR_EMPLOYEE as any);
    const hasAdminAccess = user.roles.includes(ROLES.HR_ADMIN as any) || user.roles.includes(ROLES.SYSTEM_ADMIN as any);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Offboarding Management</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Offboarding</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment'}>
                        Back to Recruitment
                    </Button>
                </div>

                <div className={styles.tabs} style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
                    <button
                        className={`${styles.tab} ${activeSection === 'EMPLOYEE' ? styles.active : ''}`}
                        onClick={() => setActiveSection('EMPLOYEE')}
                        style={{ padding: '0.75rem 1.5rem', marginRight: '1rem' }}
                    >
                        My Offboarding
                    </button>

                    {hasManagerAccess && (
                        <button
                            className={`${styles.tab} ${activeSection === 'MANAGER' ? styles.active : ''}`}
                            onClick={() => setActiveSection('MANAGER')}
                            style={{ padding: '0.75rem 1.5rem', marginRight: '1rem' }}
                        >
                            HR Management
                        </button>
                    )}

                    {hasAdminAccess && (
                        <button
                            className={`${styles.tab} ${activeSection === 'ADMIN' ? styles.active : ''}`}
                            onClick={() => setActiveSection('ADMIN')}
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            Admin Console
                        </button>
                    )}
                </div>

                {activeSection === 'EMPLOYEE' && <EmployeeOffboardingView />}

                {activeSection === 'MANAGER' && hasManagerAccess && <HROffboardingView />}

                {activeSection === 'ADMIN' && hasAdminAccess && <AdminOffboardingView />}
            </div>
        </div>
    );
}

export default function OffboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OffboardingPageContent />
        </Suspense>
    );
}
