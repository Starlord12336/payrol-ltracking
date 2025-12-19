'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { JobApplication } from '../types';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import styles from './RecruitmentForms.module.css';

export default function ApplicationList() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const data = await recruitmentApi.getMyApplications();
                setApplications(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) return <div className={styles.loading}>Loading your applications...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    if (applications.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>You haven&apos;t applied to any jobs yet.</p>
            </div>
        );
    }

    return (
        <div className={styles.listContainer}>
            {applications.map((app) => (
                <div key={app._id} className={styles.listItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className={styles.itemInfo}>
                            <h3 className={styles.itemTitle}>{app.requisitionTitle || 'Unknown Position'}</h3>
                            <div className={styles.itemMeta}>
                                <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                                <span>Current Stage: <strong>{app.currentStage}</strong></span>
                            </div>
                        </div>
                        <div>
                            <ApplicationStatusBadge status={app.status} />
                        </div>
                    </div>

                    {/* History Section */}
                    {app.history && app.history.length > 0 && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                            <h5 style={{ margin: '0 0 0.5rem 0', color: '#444' }}>History</h5>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                {app.history.map((h, idx) => (
                                    <li key={idx} style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>
                                        <span style={{ fontWeight: 500 }}>{new Date(h.date).toLocaleDateString()}</span>:
                                        {h.stage ? ` Stage: ${h.stage}` : ''}
                                        {h.status ? ` - Status: ${h.status}` : ''}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
