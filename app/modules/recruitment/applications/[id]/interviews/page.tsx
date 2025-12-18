'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button, Modal } from '@/shared/components';
import { recruitmentApi } from '../../../api/recruitment.api';
import { JobApplication, Interview } from '../../../types';
import ScheduleInterviewModal from '../../../components/ScheduleInterviewModal';
import FeedbackModal from '../../../components/InterviewFeedbackModal';

export default function ApplicationInterviewsPage() {
    const params = useParams();
    const router = useRouter();
    const applicationId = params.id as string;

    const [application, setApplication] = useState<JobApplication | null>(null);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState<{ interviewId: string, candidateName: string } | null>(null);

    useEffect(() => {
        if (applicationId) {
            fetchData();
        }
    }, [applicationId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('Fetching interviews for application:', applicationId);
            const interviewsData = await recruitmentApi.listInterviews(applicationId);
            console.log('Interviews loaded:', interviewsData);
            setInterviews(interviewsData);

            const allApps = await recruitmentApi.listApplications();
            const app = allApps.find((a: any) => a._id === applicationId);
            setApplication(app || null);

        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!application) return <div>Application not found</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Button variant="ghost" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>
                ← Back to Applications
            </Button>

            <div style={{ marginBottom: '2rem' }}>
                <Card padding="lg">
                    <h1>Application Details</h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <strong>Candidate ID:</strong> {application.candidateId}
                        </div>
                        <div>
                            <strong>Requisition:</strong> {application.requisitionId}
                        </div>
                        <div>
                            <strong>Current Stage:</strong> {application.currentStage}
                        </div>
                        <div>
                            <strong>Status:</strong> {application.status}
                        </div>
                        <div>
                            <strong>Applied Date:</strong> {new Date(application.appliedDate || application.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </Card>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Interviews</h2>
                <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
                    Schedule Interview
                </Button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {interviews.length === 0 ? (
                    <Card><p>No interviews scheduled.</p></Card>
                ) : (
                    interviews.map(interview => (
                        <Card key={interview._id} padding="md">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{interview.stage} Interview</h3>
                                    <p style={{ margin: 0, color: '#666' }}>
                                        {new Date(interview.scheduledDate).toLocaleString()} - {interview.method}
                                    </p>
                                    <p style={{ margin: '0.5rem 0 0 0' }}>
                                        <strong>Panel:</strong> {interview.panel.join(', ')}
                                    </p>
                                    <p style={{ margin: '0.25rem 0 0 0', textTransform: 'capitalize' }}>
                                        <strong>Status:</strong> {interview.status}
                                    </p>
                                </div>
                                <div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowFeedbackModal({ interviewId: interview._id, candidateName: `Candidate ${application.candidateId}` })}
                                    >
                                        Give Feedback
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {showScheduleModal && (
                <ScheduleInterviewModal
                    applicationId={application._id}
                    candidateName={`Candidate ${application.candidateId}`}
                    onClose={() => setShowScheduleModal(false)}
                    onSuccess={() => { setShowScheduleModal(false); fetchData(); }}
                />
            )}

            {showFeedbackModal && (
                <FeedbackModal
                    interviewId={showFeedbackModal.interviewId}
                    interviewTitle={`Interview for ${showFeedbackModal.candidateName}`}
                    onClose={() => setShowFeedbackModal(null)}
                    onSuccess={() => { setShowFeedbackModal(null); fetchData(); }}
                />
            )}
        </div>
    );
}
