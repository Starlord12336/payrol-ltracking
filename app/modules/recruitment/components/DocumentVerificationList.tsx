'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { OnboardingDocument } from '../types';
import { useAuth } from '@/shared/hooks/useAuth';
import styles from './RecruitmentForms.module.css';

export default function DocumentVerificationList() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<OnboardingDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [verificationNote, setVerificationNote] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const data = await recruitmentApi.listPendingDocuments();
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedDoc || !user) return;
        const myId = user.userid || 'admin'; // Fallback

        try {
            if (actionType === 'verify') {
                await recruitmentApi.verifyDocument(selectedDoc, myId, verificationNote);
                alert('Document Verified');
            } else if (actionType === 'reject') {
                if (!rejectReason) {
                    alert('Rejection reason is required');
                    return;
                }
                await recruitmentApi.rejectDocument(selectedDoc, myId, rejectReason, verificationNote);
                alert('Document Rejected');
            }
            setSelectedDoc(null);
            setActionType(null);
            setVerificationNote('');
            setRejectReason('');
            fetchDocuments();
        } catch (error) {
            alert('Action failed');
        }
    };

    if (loading) return <div>Loading pending documents...</div>;

    return (
        <div>
            <h3 style={{ marginBottom: '1rem' }}>Pending Document Verification</h3>
            {documents.length === 0 ? (
                <p>No documents pending verification.</p>
            ) : (
                <div className={styles.grid}>
                    {documents.map(doc => (
                        <Card key={doc._id} padding="md">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h5>{doc.documentType.toUpperCase()}</h5>
                                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Employee ID: {doc.employeeId}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#888' }}>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                    <div style={{ marginTop: '0.5rem', background: '#f3f4f6', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                                        File: {doc.filePath}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <Button size="sm" variant="success" onClick={() => { setSelectedDoc(doc._id); setActionType('verify'); }}>
                                        Verify
                                    </Button>
                                    <Button size="sm" variant="error" onClick={() => { setSelectedDoc(doc._id); setActionType('reject'); }}>
                                        Reject
                                    </Button>
                                </div>
                            </div>

                            {selectedDoc === doc._id && (
                                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                    <p><strong>{actionType === 'verify' ? 'Verify Document' : 'Reject Document'}</strong></p>

                                    {actionType === 'reject' && (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <Input
                                                placeholder="Rejection Reason"
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <Input
                                            placeholder="Optional Notes"
                                            value={verificationNote}
                                            onChange={e => setVerificationNote(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button size="sm" variant="primary" onClick={handleAction}>Confirm</Button>
                                        <Button size="sm" variant="outline" onClick={() => { setSelectedDoc(null); setActionType(null); }}>Cancel</Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
