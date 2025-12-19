'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { useAuth } from '@/shared/hooks/useAuth';

export default function ResignationHistory() {
    const { user } = useAuth();
    const [resignations, setResignations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResignations = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch termination requests for this employee using their employee ID
            const data = await recruitmentApi.getEmployeeResignations(user!.userid);
            // The API returns an object with resignation info, but we want the actual list
            // Let's adapt to handle both array and the summary object
            if (data && data.resignations) {
                setResignations(data.resignations);
            } else if (Array.isArray(data)) {
                setResignations(data);
            } else {
                // If it's a summary object, we need to fetch the actual termination requests
                // Let's use getTerminationReviewsForEmployee instead
                const reviews = await recruitmentApi.getTerminationReviewsForEmployee(user!.userid);
                setResignations(Array.isArray(reviews) ? reviews : []);
            }
        } catch (error) {
            console.error('Failed to fetch resignation status', error);
            setResignations([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.userid) {
            fetchResignations();
        }
    }, [user?.userid, fetchResignations]);

    if (loading) return <div>Loading history...</div>;

    if (resignations.length === 0) {
        return (
            <Card padding="md">
                <p style={{ color: '#666', textAlign: 'center' }}>No resignation history found.</p>
            </Card>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resignations.map((res: any, idx: number) => (
                <Card key={res._id || idx} padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>Resignation Request</h4>
                            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.2rem 0' }}>
                                <strong>Date:</strong> {res.createdAt ? new Date(res.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.2rem 0' }}>
                                <strong>Reason:</strong> {res.reason}
                            </p>
                            {res.lastWorkingDay && (
                                <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.2rem 0' }}>
                                    <strong>Last Working Day:</strong> {new Date(res.lastWorkingDay).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div>
                            <span style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                background: res.status === 'APPROVED' ? '#dcfce7' : res.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                                color: res.status === 'APPROVED' ? '#166534' : res.status === 'REJECTED' ? '#991b1b' : '#92400e',
                                fontWeight: 600,
                                fontSize: '0.85rem'
                            }}>
                                {res.status}
                            </span>
                        </div>
                    </div>
                    {res.hrComments && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.9rem' }}>
                            <strong>HR Comments:</strong> {res.hrComments}
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}
