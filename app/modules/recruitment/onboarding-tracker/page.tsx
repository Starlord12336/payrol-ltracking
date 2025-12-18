'use client';

import { Suspense, useState } from 'react';
import { Button, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { OnboardingTrackerResponse } from '../types';
import OnboardingTracker from '../components/OnboardingTracker';
import styles from '../page.module.css';

function OnboardingTrackerPageContent() {
    const [employeeId, setEmployeeId] = useState('');
    const [trackerData, setTrackerData] = useState<OnboardingTrackerResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId.trim()) return;

        setLoading(true);
        setError('');
        setTrackerData(null);

        try {
            const data = await recruitmentApi.getOnboardingTracker(employeeId);
            setTrackerData(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Tracker not found or access denied.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Onboarding Progress</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Onboarding</span> / <span>Tracker</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                <div style={{ maxWidth: '600px', margin: '0 0 2rem' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                        <Input
                            placeholder="Enter Employee ID"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                        />
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Search' : 'View Tracker'}
                        </Button>
                    </form>
                    {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
                </div>

                {trackerData && <OnboardingTracker trackerData={trackerData} />}

                <div style={{ marginTop: '2rem' }}>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                await recruitmentApi.autoSendReminders();
                                alert('Auto-reminders sent for all upcoming deadlines!');
                            } catch (e) {
                                alert('Failed to send auto-reminders');
                            }
                        }}
                    >
                        Send Reminders for All Upcoming Deadlines (Admin)
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function OnboardingTrackerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingTrackerPageContent />
        </Suspense>
    );
}
