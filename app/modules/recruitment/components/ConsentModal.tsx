'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Modal } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { ConsentLog } from '../types';
import styles from './RecruitmentForms.module.css';

interface ConsentModalProps {
    candidateId: string;
    candidateName: string;
    onClose: () => void;
}

export default function ConsentModal({ candidateId, candidateName, onClose }: ConsentModalProps) {
    const [logs, setLogs] = useState<ConsentLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [latestStatus, setLatestStatus] = useState<boolean | null>(null);

    const fetchConsents = useCallback(async () => {
        try {
            setLoading(true);
            const data = await recruitmentApi.getCandidateConsents(candidateId);
            // Sort by file name (timestamp) descending
            const sorted = data.sort((a, b) => b.file.localeCompare(a.file));
            setLogs(sorted);
            if (sorted.length > 0) {
                setLatestStatus(sorted[0].data.granted);
            }
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load consent history');
        } finally {
            setLoading(false);
        }
    }, [candidateId]);

    useEffect(() => {
        fetchConsents();
    }, [fetchConsents]);

    const handleAction = async (granted: boolean) => {
        setActionLoading(true);
        try {
            if (granted) {
                await recruitmentApi.grantConsent(candidateId, 'Granted via HR Action');
            } else {
                await recruitmentApi.revokeConsent(candidateId, 'Revoked via HR Action');
            }
            await fetchConsents();
        } catch (err: any) {
            alert('Failed to update consent: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Consent Management: ${candidateName}`}>
            <div className={styles.publishContainer}>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>Current Status:</span>
                        {latestStatus === null ? (
                            <span style={{ color: '#666' }}>Unknown / No Record</span>
                        ) : latestStatus ? (
                            <span style={{ color: '#10b981', fontWeight: 600 }}>GRANTED</span>
                        ) : (
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>REVOKED</span>
                        )}
                    </div>
                    <div>
                        {latestStatus !== true && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAction(true)}
                                disabled={actionLoading}
                            >
                                Grant Consent
                            </Button>
                        )}
                        {latestStatus !== false && (
                            <Button
                                variant="error"
                                size="sm"
                                onClick={() => handleAction(false)}
                                disabled={actionLoading}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                Revoke Consent
                            </Button>
                        )}
                    </div>
                </div>

                <h3>History</h3>
                {loading ? (
                    <div>Loading history...</div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : logs.length === 0 ? (
                    <p style={{ color: '#666' }}>No consent history found.</p>
                ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                        {logs.map((log) => (
                            <div key={log.file} style={{
                                padding: '0.75rem',
                                borderBottom: '1px solid #f3f4f6',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 500, color: log.data.granted ? '#047857' : '#b91c1c' }}>
                                        {log.data.granted ? 'Granted' : 'Revoked'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        By: {log.data.givenBy || 'Unknown'} | {new Date(log.data.consentedAt).toLocaleString()}
                                    </div>
                                    {log.data.details && (
                                        <div style={{ fontSize: '0.85rem', color: '#444', marginTop: '0.25rem' }}>
                                            Note: {log.data.details}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
