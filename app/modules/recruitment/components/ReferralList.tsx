'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { Referral } from '../types';
import styles from './RecruitmentForms.module.css';

export default function ReferralList() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.listReferrals();
            setReferrals(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load referrals');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading referrals...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.listContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Referrals Dashboard</h3>
                <Button variant="outline" size="sm" onClick={fetchReferrals}>Refresh</Button>
            </div>

            {referrals.length === 0 ? (
                <p>No referrals found.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {referrals.map(ref => (
                        <div key={ref._id} className={styles.listItem}>
                            <div className={styles.itemInfo}>
                                <h3 className={styles.itemTitle}>Candidate ID: {ref.candidateId}</h3>
                                <div className={styles.itemMeta}>
                                    <span>Referred By: {ref.referringEmployeeId}</span>
                                    <span>Date: {new Date(ref.createdAt).toLocaleDateString()}</span>
                                </div>
                                {(ref.role || ref.level) && (
                                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                        {ref.role} {ref.level ? `(${ref.level})` : ''}
                                    </div>
                                )}
                            </div>
                            <div className={styles.itemActions}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '16px',
                                    background: ref.status === 'hired' ? '#d1fae5' : '#fef3c7',
                                    color: ref.status === 'hired' ? '#065f46' : '#92400e',
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }}>
                                    {ref.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
