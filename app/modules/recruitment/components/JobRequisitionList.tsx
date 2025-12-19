'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { JobRequisition } from '../types';
import RequisitionPreviewModal from './RequisitionPreviewModal';
import PublishRequisitionModal from './PublishRequisitionModal';
import ApplyJobModal from './ApplyJobModal';
import styles from './RecruitmentForms.module.css';

interface JobRequisitionListProps {
    onCreateClick?: () => void;
    isCandidate?: boolean;
    status?: string;
    department?: string;
}
// ... imports kept as is in file, replacing component body

export default function JobRequisitionList({ onCreateClick, isCandidate = false, status, department }: JobRequisitionListProps) {
    const router = useRouter();
    const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [publishId, setPublishId] = useState<string | null>(null);
    const [applyModalData, setApplyModalData] = useState<{ id: string; title: string; } | null>(null);

    const fetchRequisitions = useCallback(async () => {
        try {
            setLoading(true);
            // Candidates only see published; HR sees all (or filtered)
            const data = await recruitmentApi.listJobRequisitions({ status, department });
            // Note: Backend filtering for candidates should handle status='PUBLISHED' validation.
            // For now, assuming API returns appropriate list based on role/token context or we filter client-side if needed.
            setRequisitions(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load requisitions');
        } finally {
            setLoading(false);
        }
    }, [status, department]);

    useEffect(() => {
        fetchRequisitions();
    }, [status, department, fetchRequisitions]);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'OPEN': return styles.badgeSuccess;
            case 'DRAFT': return styles.badgeWarning;
            case 'FILLED': return styles.badgeNeutral;
            case 'PUBLISHED': return styles.badgeInfo;
            default: return styles.badge;
        }
    };

    if (loading) return <div>Loading job postings...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.listContainer}>
            {!isCandidate && onCreateClick && (
                <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: 0 }}>
                    <h2>Job Postings</h2>
                    <Button variant="primary" onClick={onCreateClick}>
                        Create New Posting
                    </Button>
                </div>
            )}

            {requisitions.length === 0 ? (
                <p>No job postings found.</p>
            ) : (
                requisitions.map((req) => (
                    <div key={req._id} className={styles.listItem}>
                        <div className={styles.itemInfo}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3>{req.jobTitle}</h3>
                                {!isCandidate && (
                                    <>
                                        <span className={`${styles.badge} ${getStatusClass(req.status)}`}>
                                            {req.status}
                                        </span>
                                        {req.publishStatus === 'published' && (
                                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Published</span>
                                        )}
                                        {req.publishStatus === 'unpublished' && (
                                            <span className={`${styles.badge} ${styles.badgeWarning}`}>Unpublished</span>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className={styles.itemMeta}>
                                <span>{req.department}</span>
                                {req.location && <span>{req.location}</span>}
                                {req.salary && <span>{req.salary.min} - {req.salary.max} {req.salary.currency}</span>}
                            </div>
                        </div>

                        <div className={styles.itemActions}>
                            {isCandidate ? (
                                <Button
                                    variant="primary"
                                    onClick={() => setApplyModalData({ id: req._id || '', title: req.jobTitle })}
                                >
                                    Apply
                                </Button>
                            ) : (
                                <>
                                    {/* HR Actions */}
                                    <Button variant="outline" onClick={() => router.push(`/modules/recruitment/requisitions/${req._id}`)}>Details</Button>
                                    <Button variant="outline" onClick={() => setPreviewId(req._id!)}>Preview</Button>

                                    {req.publishStatus !== 'published' && (
                                        <Button variant="primary" onClick={() => setPublishId(req._id!)}>Publish</Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div >
                ))
            )
            }

            {/* Modals */}
            {
                previewId && (
                    <RequisitionPreviewModal
                        requisitionId={previewId}
                        onClose={() => setPreviewId(null)}
                    />
                )
            }

            {
                publishId && (
                    <PublishRequisitionModal
                        requisitionId={publishId}
                        onClose={() => setPublishId(null)}
                        onSuccess={() => {
                            fetchRequisitions(); // Refresh list to show new status
                        }}
                    />
                )
            }

            {
                applyModalData && (
                    <ApplyJobModal
                        requisitionId={applyModalData.id}
                        jobTitle={applyModalData.title}
                        onClose={() => setApplyModalData(null)}
                        onSuccess={() => {
                            // Optionally show success message or redirect
                            alert('Application submitted successfully!');
                        }}
                    />
                )
            }
        </div >
    );
}
