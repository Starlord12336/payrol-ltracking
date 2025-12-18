'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import ResignationForm from './ResignationForm';
import ResignationHistory from './ResignationHistory';
import styles from './HRRecruitmentView.module.css';

export default function EmployeeOffboardingView() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

    if (!user?.userid) return <div>Please log in to view this page.</div>;

    return (
        <div className={styles.subContainer}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'submit' ? styles.active : ''}`}
                    onClick={() => setActiveTab('submit')}
                >
                    Submit Resignation
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Resignation Status
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'submit' && (
                    <ResignationForm
                        employeeId={user.userid}
                        onSuccess={() => setActiveTab('history')}
                    />
                )}

                {activeTab === 'history' && <ResignationHistory />}
            </div>
        </div>
    );
}
