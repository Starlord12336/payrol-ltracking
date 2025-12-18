'use client';

import { useEffect, useState } from 'react';
import { Button, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { JobRequisition, RecruitmentDashboard } from '../types';
import styles from './RecruitmentForms.module.css';

/**
 * HRRecruitmentMonitor (REC-009)
 * Allows HR Manager to monitor recruitment progress across all open positions
 */

interface RequisitionProgress {
    requisition: JobRequisition;
    applicationsByStage: Record<string, number>;
    totalApplications: number;
    progressPercentage: number;
}

export default function HRRecruitmentMonitor() {
    const [dashboard, setDashboard] = useState<RecruitmentDashboard | null>(null);
    const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<{ department: string; status: string }>({
        department: '',
        status: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardData, requisitionsData] = await Promise.all([
                recruitmentApi.getRecruitmentDashboard(),
                recruitmentApi.listJobRequisitions({ status: 'OPEN' })
            ]);
            setDashboard(dashboardData);
            setRequisitions(requisitionsData || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to load recruitment data');
        } finally {
            setLoading(false);
        }
    };

    const getDepartments = () => {
        const depts = new Set(requisitions.map(r => r.department));
        return Array.from(depts).sort();
    };

    const getFilteredRequisitions = () => {
        return requisitions.filter(r => {
            if (filter.department && r.department !== filter.department) return false;
            if (filter.status && r.status !== filter.status) return false;
            return true;
        });
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'HIGH': return { bg: '#fef2f2', color: '#dc2626' };
            case 'MEDIUM': return { bg: '#fffbeb', color: '#d97706' };
            case 'LOW': return { bg: '#f0fdf4', color: '#16a34a' };
            default: return { bg: '#f3f4f6', color: '#6b7280' };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': case 'PUBLISHED': return { bg: '#dbeafe', color: '#1d4ed8' };
            case 'DRAFT': return { bg: '#f3f4f6', color: '#6b7280' };
            case 'FILLED': return { bg: '#d1fae5', color: '#059669' };
            case 'CANCELLED': return { bg: '#fef2f2', color: '#dc2626' };
            default: return { bg: '#f3f4f6', color: '#6b7280' };
        }
    };

    if (loading) return <div>Loading recruitment data...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    const filteredRequisitions = getFilteredRequisitions();

    return (
        <div>
            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <Card padding="md">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                            {dashboard?.openRequisitions ?? requisitions.length}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Open Positions</div>
                    </div>
                </Card>
                <Card padding="md">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                            {dashboard?.activeApplications ?? 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Active Applications</div>
                    </div>
                </Card>
                <Card padding="md">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>
                            {dashboard?.interviewsScheduled ?? 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Interviews Scheduled</div>
                    </div>
                </Card>
                <Card padding="md">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                            {dashboard?.hiredCount ?? 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Hired (YTD)</div>
                    </div>
                </Card>
            </div>

            {/* Application Funnel */}
            {dashboard?.applicationsByStage && dashboard.applicationsByStage.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}><Card padding="md">
                    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>📊 Application Funnel</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dashboard.applicationsByStage.map((stage) => {
                            const percentage = dashboard.activeApplications > 0
                                ? Math.round((stage.count / dashboard.activeApplications) * 100)
                                : 0;
                            return (
                                <div key={stage.stage} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ width: '100px', fontSize: '0.9rem', fontWeight: 500 }}>{stage.stage}</span>
                                    <div style={{ flex: 1, backgroundColor: '#e5e7eb', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            backgroundColor: '#3b82f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingLeft: '0.5rem',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            transition: 'width 0.3s ease'
                                        }}>
                                            {percentage > 10 ? `${stage.count}` : ''}
                                        </div>
                                    </div>
                                    <span style={{ width: '50px', textAlign: 'right', fontWeight: 600 }}>{stage.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card></div>
            )}

            {/* Filters */}
            <div style={{ marginBottom: '1rem' }}><Card padding="md">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500 }}>Filter by:</span>
                    <select
                        value={filter.department}
                        onChange={(e) => setFilter(prev => ({ ...prev, department: e.target.value }))}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    >
                        <option value="">All Departments</option>
                        {getDepartments().map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="FILLED">Filled</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={fetchData}>
                        🔄 Refresh
                    </Button>
                </div>
            </Card></div>

            {/* Requisitions List */}
            <div>
                <h3 style={{ marginBottom: '1rem' }}>
                    📋 Open Requisitions ({filteredRequisitions.length})
                </h3>

                {filteredRequisitions.length === 0 ? (
                    <div style={{ textAlign: 'center' }}><Card padding="lg">
                        <p style={{ color: '#666' }}>No requisitions match your filters.</p>
                    </Card></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredRequisitions.map((req) => {
                            const urgencyStyles = getUrgencyColor(req.urgency);
                            const statusStyles = getStatusColor(req.status);

                            return (
                                <Card key={req._id} padding="md">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                <h4 style={{ margin: 0 }}>{req.jobTitle}</h4>
                                                <span style={{
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    backgroundColor: statusStyles.bg,
                                                    color: statusStyles.color
                                                }}>
                                                    {req.status}
                                                </span>
                                                <span style={{
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    backgroundColor: urgencyStyles.bg,
                                                    color: urgencyStyles.color
                                                }}>
                                                    {req.urgency} Priority
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                                                <span>🏢 {req.department}</span>
                                                {req.location && <span>📍 {req.location}</span>}
                                                <span>👥 {req.numberOfPositions} position{req.numberOfPositions > 1 ? 's' : ''}</span>
                                                {req.requisitionId && <span>ID: {req.requisitionId}</span>}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.location.href = `/modules/recruitment/requisitions/${req._id}`}
                                        >
                                            View Details →
                                        </Button>
                                    </div>

                                    {/* Posting Info */}
                                    {(req.postingDate || req.expiryDate) && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            padding: '0.5rem 0.75rem',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            gap: '1rem'
                                        }}>
                                            {req.postingDate && (
                                                <span>📅 Posted: {new Date(req.postingDate).toLocaleDateString()}</span>
                                            )}
                                            {req.expiryDate && (
                                                <span>⏰ Expires: {new Date(req.expiryDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            {dashboard?.recentActivity && dashboard.recentActivity.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}><Card padding="md">
                    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>📰 Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dashboard.recentActivity.slice(0, 10).map((activity) => (
                            <div key={activity.id} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem',
                                padding: '0.5rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '6px'
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    marginTop: '6px',
                                    backgroundColor: activity.type === 'application' ? '#3b82f6'
                                        : activity.type === 'interview' ? '#8b5cf6'
                                            : '#f59e0b'
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem' }}>{activity.message}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                        {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card></div>
            )}
        </div>
    );
}
