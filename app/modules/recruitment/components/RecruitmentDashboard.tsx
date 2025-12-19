'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { RecruitmentDashboard as DashboardData } from '../types';
import styles from './RecruitmentForms.module.css';

interface StatCardProps {
    title: string;
    value: number;
    color?: string;
}

function StatCard({ title, value, color = '#2563eb' }: StatCardProps) {
    return (
        <Card padding="md">
            <h4 style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{title}</h4>
            <div style={{ fontSize: '2rem', fontWeight: 600, color, marginTop: '0.5rem' }}>
                {value}
            </div>
        </Card>
    );
}

export default function RecruitmentDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const result = await recruitmentApi.getRecruitmentDashboard();
            setData(result);
            setError(null);
        } catch (err: any) {
            console.error(err);
            // Default data if API fails or backend structure mismatch
            // This is a safety fallback since backend implementation is unverified
            // In production, we'd handle error properly, but for demo continuity:
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!data) return <p>No data available.</p>;

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Analytics Overview</h2>
                <Button variant="outline" size="sm" onClick={fetchDashboard}>Refresh</Button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <StatCard title="Open Requisitions" value={data.openRequisitions ?? 0} color="#2563eb" />
                <StatCard title="Active Applications" value={data.activeApplications ?? 0} color="#f59e0b" />
                <StatCard title="Interviews Scheduled" value={data.interviewsScheduled ?? 0} color="#8b5cf6" />
                <StatCard title="Hired (YTD)" value={data.hiredCount ?? 0} color="#10b981" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <Card padding="lg">
                    <h3>Application Funnel</h3>
                    <div style={{ marginTop: '1rem' }}>
                        {data.applicationsByStage?.length ? (
                            data.applicationsByStage.map((stage) => (
                                <div key={stage.stage} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ width: '120px', fontSize: '0.9rem', color: '#444' }}>{stage.stage}</span>
                                    <div style={{ flex: 1, backgroundColor: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${Math.min((stage.count / (data.activeApplications || 1)) * 100, 100)}%`,
                                                backgroundColor: '#3b82f6',
                                                height: '100%'
                                            }}
                                        />
                                    </div>
                                    <span style={{ width: '40px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 500 }}>{stage.count}</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#999' }}>No stage data available yet.</p>
                        )}
                    </div>
                </Card>

                <Card padding="lg">
                    <h3>Recent Activity</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {data.recentActivity?.length ? (
                            data.recentActivity.map((activity) => (
                                <div key={activity.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: activity.type === 'application' ? '#3b82f6' : activity.type === 'interview' ? '#8b5cf6' : '#f59e0b',
                                        marginTop: '6px'
                                    }} />
                                    <div>
                                        <div style={{ fontSize: '0.9rem' }}>{activity.message}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                            {new Date(activity.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#999' }}>No recent activity.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
