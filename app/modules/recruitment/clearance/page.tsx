'use client';

import { Suspense, useState, useEffect } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import ClearanceTracker from '../components/ClearanceTracker';
import styles from '../page.module.css';

function ClearancePageContent() {
    const [terminationId, setTerminationId] = useState('');
    const [showTracker, setShowTracker] = useState(false);
    const [pendingList, setPendingList] = useState<any[]>([]);
    const [clearedList, setClearedList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        setLoading(true);
        try {
            const pending = await recruitmentApi.getPendingClearances();
            setPendingList(Array.isArray(pending) ? pending : []);
            const cleared = await recruitmentApi.getFullyClearedTerminations();
            setClearedList(Array.isArray(cleared) ? cleared : []);
        } catch (e) {
            console.error('Failed to fetch clearance lists', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (terminationId.trim()) {
            setShowTracker(true);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Clearance Tracking</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Offboarding</span> / <span>Clearance</span>
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
                            placeholder="Enter Termination ID"
                            value={terminationId}
                            onChange={(e) => { setTerminationId(e.target.value); setShowTracker(false); }}
                        />
                        <Button type="submit" variant="primary">
                            View Clearance
                        </Button>
                    </form>
                </div>

                {showTracker && terminationId && (
                    <ClearanceTracker
                        terminationId={terminationId}
                        onRefresh={fetchLists}
                    />
                )}

                {!showTracker && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <Card padding="md">
                            <h4 style={{ marginBottom: '1rem', color: '#f59e0b' }}>⏳ Pending Clearances</h4>
                            {loading ? (
                                <p>Loading...</p>
                            ) : pendingList.length === 0 ? (
                                <p style={{ color: '#666' }}>No pending clearances</p>
                            ) : (
                                pendingList.slice(0, 10).map((item: any) => (
                                    <div
                                        key={item._id || item.terminationId}
                                        style={{
                                            padding: '0.75rem',
                                            borderBottom: '1px solid #f3f4f6',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => { setTerminationId(item._id || item.terminationId); setShowTracker(true); }}
                                    >
                                        <strong>{item.employeeName || item._id || item.terminationId}</strong>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Click to view</p>
                                    </div>
                                ))
                            )}
                        </Card>

                        <Card padding="md">
                            <h4 style={{ marginBottom: '1rem', color: '#22c55e' }}>✓ Fully Cleared</h4>
                            {loading ? (
                                <p>Loading...</p>
                            ) : clearedList.length === 0 ? (
                                <p style={{ color: '#666' }}>No fully cleared terminations</p>
                            ) : (
                                clearedList.slice(0, 10).map((item: any) => (
                                    <div
                                        key={item._id || item.terminationId}
                                        style={{
                                            padding: '0.75rem',
                                            borderBottom: '1px solid #f3f4f6',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => { setTerminationId(item._id || item.terminationId); setShowTracker(true); }}
                                    >
                                        <strong>{item.employeeName || item._id || item.terminationId}</strong>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Click to view</p>
                                    </div>
                                ))
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ClearancePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClearancePageContent />
        </Suspense>
    );
}
