
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { OnboardingTrackerResponse, OnboardingTrackerTask } from '../types';
import styles from './RecruitmentForms.module.css';

interface OnboardingTrackerProps {
    trackerData?: OnboardingTrackerResponse;
    employeeId?: string;
}

export default function OnboardingTracker({ trackerData: initialData, employeeId }: OnboardingTrackerProps) {
    const [trackerData, setTrackerData] = useState<OnboardingTrackerResponse | null>(initialData || null);
    const [loading, setLoading] = useState(!initialData && !!employeeId);
    const [error, setError] = useState<string | null>(null);

    const fetchTracker = useCallback(async () => {
        if (!employeeId) return;
        try {
            setLoading(true);
            const data = await recruitmentApi.getOnboardingTracker(employeeId);
            setTrackerData(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load tracker');
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => {
        if (!initialData && employeeId) {
            fetchTracker();
        }
    }, [employeeId, initialData, fetchTracker]);

    if (loading) return <div>Loading tracker...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!trackerData) return <div>No tracker data available.</div>;

    const { tasks, progress, nextTask, employeeId: dataEmployeeId } = trackerData;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3>Onboarding Tracker</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Employee ID: {dataEmployeeId}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                            {Math.round(progress?.percentage || 0)}%
                        </div>
                        <p style={{ fontSize: '0.8rem' }}>Completed</p>
                    </div>
                </div>

                <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', marginTop: '1rem' }}>
                    <div style={{
                        width: `${progress?.percentage || 0}%`,
                        height: '100%',
                        background: '#2563eb',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </Card>

            {nextTask && (
                <div style={{ borderLeft: '4px solid #f59e0b' }}>
                    <Card padding="md">
                        <h4 style={{ color: '#d97706', marginBottom: '0.5rem' }}>Next Up</h4>
                        <div>
                            <strong>{nextTask.sequence}. {nextTask.name}</strong>
                            {nextTask.description && <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{nextTask.description}</p>}
                            {nextTask.deadline && (
                                <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.5rem' }}>
                                    Due: {new Date(nextTask.deadline).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            <div className={styles.taskList}>
                <h4 style={{ marginBottom: '1rem' }}>Task List</h4>
                {tasks?.map((task: OnboardingTrackerTask) => (
                    <div
                        key={task._id}
                        style={{
                            padding: '1rem',
                            borderBottom: '1px solid #f3f4f6',
                            display: 'flex',
                            gap: '1rem',
                            opacity: task.status === 'completed' ? 0.6 : 1,
                            background: task.status === 'completed' ? '#f9fafb' : 'white'
                        }}
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: task.status === 'completed' ? '#22c55e' : '#e5e7eb',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            flexShrink: 0
                        }}>
                            {task.status === 'completed' ? '✓' : task.sequence}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 500, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                                    {task.name}
                                </span>
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        background: task.status === 'completed' ? '#dcfce7' : '#f3f4f6',
                                        color: task.status === 'completed' ? '#166534' : '#4b5563'
                                    }}
                                >
                                    {task.status.toUpperCase()}
                                </span>
                            </div>

                            {task.description && (
                                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>{task.description}</p>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                                {task.department && <span>Dept: {task.department}</span>}
                                {task.owner && <span>Owner: {task.owner}</span>}
                                {task.deadline && (
                                    <span style={{ color: new Date(task.deadline) < new Date() && task.status !== 'completed' ? '#dc2626' : 'inherit' }}>
                                        Due: {new Date(task.deadline).toLocaleDateString()}
                                    </span>
                                )}
                                {task.status !== 'completed' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async () => {
                                            try {
                                                await recruitmentApi.sendTaskReminder(dataEmployeeId, task.sequence - 1);
                                                alert('Reminder sent!');
                                            } catch (e) {
                                                alert('Failed to send reminder');
                                            }
                                        }}
                                    >
                                        Send Reminder
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

