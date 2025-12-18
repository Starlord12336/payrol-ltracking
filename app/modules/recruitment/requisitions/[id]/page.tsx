'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card } from '@/shared/components';
import { recruitmentApi } from '../../api/recruitment.api';
import { JobRequisition, JobApplication } from '../../types';
import styles from '../../components/RecruitmentForms.module.css';
import ReferralModal from '../../components/ReferralModal';
import InterviewListModal from '../../components/InterviewListModal';
import RejectionModal from '../../components/RejectionModal';

export default function RequisitionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [requisition, setRequisition] = useState<JobRequisition | null>(null);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [referralTarget, setReferralTarget] = useState<{ candidateId: string, name: string } | null>(null);
    const [listInterviewsTarget, setListInterviewsTarget] = useState<{ id: string, name: string } | null>(null);
    const [rejectionTarget, setRejectionTarget] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqData, appData] = await Promise.all([
                recruitmentApi.getJobRequisition(id),
                recruitmentApi.listApplications({ requisitionId: id })
            ]);
            setRequisition(reqData);
            setApplications(appData);
        } catch (err: any) {
            console.error('Failed to load details', err);
            setError(err.message || 'Failed to load requisition details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading details...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!requisition) return <div>Requisition not found</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Button variant="outline" onClick={() => router.back()}>&larr; Back to List</Button>
            </div>

            <Card className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{requisition.jobTitle}</h1>
                        <p style={{ color: '#666' }}>{requisition.department} • {requisition.location}</p>
                    </div>
                    <div className={`${styles.badge} ${styles.badgeInfo}`}>
                        {requisition.status}
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <strong>Employment Type:</strong> {requisition.employmentType}
                    </div>
                    <div>
                        <strong>Salary Range:</strong> {requisition.salary?.min} - {requisition.salary?.max} {requisition.salary?.currency}
                    </div>
                    {requisition.postingDate && (
                        <div>
                            <strong>Posting Date:</strong> {new Date(requisition.postingDate).toLocaleDateString()}
                        </div>
                    )}
                    {requisition.expiryDate && (
                        <div>
                            <strong>Closing Date:</strong> {new Date(requisition.expiryDate).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Description</h3>
                    <div dangerouslySetInnerHTML={{ __html: requisition.description }} />
                </div>
            </Card>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Applications ({applications.length})</h2>

            {applications.length === 0 ? (
                <p>No applications received yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {applications.map((app) => (
                        <Card key={app._id} className={styles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontWeight: '600' }}>Candidate ID: {app.candidateId}</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={styles.badge} style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                                        {app.currentStage}
                                    </span>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        Status: {app.status}
                                    </div>
                                    {app.attachment && (
                                        <div style={{ marginTop: '5px' }}>
                                            CV Document ID: {app.attachment}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.itemActions} style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setReferralTarget({ candidateId: app.candidateId, name: `Candidate ${app.candidateId}` })}
                                >
                                    Tag Referral
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setListInterviewsTarget({ id: app._id, name: `Candidate ${app.candidateId}` })}
                                >
                                    Interviews / Feedback
                                </Button>
                                {app.status !== 'rejected' && app.status !== 'hired' && (
                                    <Button
                                        variant="error"
                                        size="sm"
                                        onClick={() => setRejectionTarget({ id: app._id, name: `Candidate ${app.candidateId}` })}
                                    >
                                        Reject
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {referralTarget && (
                <ReferralModal
                    candidateId={referralTarget.candidateId}
                    candidateName={referralTarget.name}
                    onClose={() => setReferralTarget(null)}
                    onSuccess={() => { alert('Referral tagged successfully'); }}
                />
            )}

            {listInterviewsTarget && (
                <InterviewListModal
                    applicationId={listInterviewsTarget.id}
                    candidateName={listInterviewsTarget.name}
                    onClose={() => setListInterviewsTarget(null)}
                />
            )}

            {rejectionTarget && (
                <RejectionModal
                    applicationId={rejectionTarget.id}
                    candidateName={rejectionTarget.name}
                    onClose={() => setRejectionTarget(null)}
                    onSuccess={() => { fetchData(); }}
                />
            )}
        </div>
    );
}
