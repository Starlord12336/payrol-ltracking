'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/shared/components';
import { apiClient } from '@/shared/utils/api';
import FinalSettlement from './FinalSettlement';
import ClearanceTracker from './ClearanceTracker';
import styles from './HRRecruitmentView.module.css';

// Employee interface for display
interface EmployeeProfile {
    _id: string;
    userId?: string;
    firstName: string;
    lastName: string;
    workEmail?: string;
    jobTitle?: string;
    employmentStatus?: string;
}

// Performance Data Interface
interface PerformanceData {
    employeeId: string;
    averageRating: number;
    lastAppraisalDate: string;
    reviews: {
        cycle: string;
        rating: number;
        summary: string;
        manager: string;
        date: string;
    }[];
    goals: {
        title: string;
        status: string;
        progress: number;
    }[];
}

// Employee List for Termination Review
const EmployeeListForTermination = () => {
    const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal States
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [showInitiateModal, setShowInitiateModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
    const [terminationReason, setTerminationReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await apiClient.get<{ success: boolean; data: EmployeeProfile[] }>('/employee-profile');
            setEmployees(response.data.data || []);
        } catch (err: any) {
            console.error('Failed to fetch employees', err);
            setError(err.response?.data?.message || err.message || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleViewPerformance = async (employee: EmployeeProfile) => {
        setSelectedEmployee(employee);
        setShowPerformanceModal(true);
        setPerformanceData(null); // Clear previous data

        try {
            const response = await apiClient.get<PerformanceData>(`/recruitment/employees/${employee._id}/performance-data`);
            setPerformanceData(response.data);
        } catch (err) {
            console.error('Failed to fetch performance data', err);
            // Fallback mock data if allowed, or just show error in modal
        }
    };

    const handleInitiateClick = (employee: EmployeeProfile) => {
        setSelectedEmployee(employee);
        setShowInitiateModal(true);
        setTerminationReason('');
    };

    const submitTermination = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee || !terminationReason) return;

        setActionLoading(true);
        try {
            const { recruitmentApi } = await import('../api/recruitment.api');
            await recruitmentApi.initiateTerminationReview({
                employeeId: selectedEmployee._id,
                reason: terminationReason,
                // initiator is handled by backend from token
            });
            alert('Termination review initiated successfully');
            setShowInitiateModal(false);
            setTerminationReason('');
        } catch (err: any) {
            console.error('Failed to initiate termination', err);
            alert(err.message || 'Failed to initiate termination');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div>Loading employees...</div>;
    if (error) return <div style={{ color: '#ef4444' }}>Error: {error}</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3>Employee Profiles - Termination Review</h3>
            {employees.length === 0 ? (
                <Card padding="lg">
                    <p style={{ color: '#666', textAlign: 'center' }}>No employees found</p>
                </Card>
            ) : (
                employees.map((employee) => (
                    <Card key={employee._id} padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontWeight: 500 }}>
                                    {employee.firstName} {employee.lastName}
                                </p>
                                {employee.jobTitle && (
                                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                        {employee.jobTitle}
                                    </p>
                                )}
                                {employee.workEmail && (
                                    <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                        {employee.workEmail}
                                    </p>
                                )}
                                {employee.employmentStatus && (
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            marginTop: '0.5rem',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            background: employee.employmentStatus === 'Active' ? '#22c55e20' : '#f59e0b20',
                                            color: employee.employmentStatus === 'Active' ? '#22c55e' : '#f59e0b',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {employee.employmentStatus}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewPerformance(employee)}
                                >
                                    📊 Performance
                                </Button>
                                <Button
                                    variant="error" // Use error/red variant for termination
                                    size="sm"
                                    onClick={() => handleInitiateClick(employee)}
                                >
                                    ⚠️ Initiate Termination
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))
            )}

            {/* Performance Modal - Inline Simple Modal Implementation */}
            {showPerformanceModal && selectedEmployee && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '500px', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3>Performance Data: {selectedEmployee.firstName} {selectedEmployee.lastName}</h3>

                        {!performanceData ? (
                            <p>Loading performance data...</p>
                        ) : (
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                    <div>
                                        <strong>Average Rating</strong>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{performanceData.averageRating} / 5.0</div>
                                    </div>
                                    <div>
                                        <strong>Last Appraisal</strong>
                                        <div>{new Date(performanceData.lastAppraisalDate).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div>
                                    <h4>Recent Reviews</h4>
                                    {performanceData.reviews.map((review, idx) => (
                                        <div key={idx} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>{review.cycle}</strong>
                                                <span style={{ fontWeight: 500 }}>Rating: {review.rating}</span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#555' }}>{review.summary}</p>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>By: {review.manager} on {new Date(review.date).toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <h4>Active Goals</h4>
                                    {performanceData.goals.map((goal, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                                            <span>{goal.title}</span>
                                            <div>
                                                <span style={{ marginRight: '1rem', fontSize: '0.9rem', color: '#666' }}>{goal.status}</span>
                                                <span style={{ fontWeight: 500 }}>{goal.progress}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="outline" onClick={() => setShowPerformanceModal(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Initiate Termination Modal */}
            {showInitiateModal && selectedEmployee && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '500px' }}>
                        <h3>Initiate Termination Review</h3>
                        <p style={{ marginBottom: '1rem' }}>Employee: <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong></p>

                        <form onSubmit={submitTermination}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Reason for Termination</label>
                                <textarea
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    rows={4}
                                    value={terminationReason}
                                    onChange={(e) => setTerminationReason(e.target.value)}
                                    placeholder="Please provide a detailed reason..."
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <Button type="button" variant="outline" onClick={() => setShowInitiateModal(false)}>Cancel</Button>
                                <Button type="submit" variant="error" disabled={actionLoading}>
                                    {actionLoading ? 'Initiating...' : 'Confirm Initiation'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Termination selection list for clearance tracker
const TerminationSelector = ({ onSelect }: { onSelect: (id: string) => void }) => {
    const [terminations, setTerminations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const data = await import('../api/recruitment.api').then(m => m.recruitmentApi.listTerminationReviews());
                setTerminations(data);
            } catch (err) {
                console.error("Failed to fetch terminations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTerms();
    }, []);

    if (loading) return <div>Loading terminations...</div>;

    return (
        <Card>
            <h3>Select a Termination Case</h3>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {terminations.length === 0 ? (
                    <p>No termination cases found.</p>
                ) : (
                    terminations.map(term => (
                        <div key={term._id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }} onClick={() => {
                            // Redirect to checklist creation form
                            window.location.href = `/modules/recruitment/offboarding/checklist/${term._id}`;
                        }}>
                            <strong>Termination: {term.employeeId}</strong>
                            <div>Status: {term.status}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Reason: {term.reason}</div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

// Termination Requests List for status management
const TerminationRequestsList = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const data = await import('../api/recruitment.api').then(m => m.recruitmentApi.listTerminationReviews());
            setRequests(data);
        } catch (err) {
            console.error("Failed to fetch termination requests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const { recruitmentApi } = await import('../api/recruitment.api');
            await recruitmentApi.updateTerminationReviewStatus(id, status);
            // Refresh list
            fetchRequests();
            alert(`Termination request ${status} successfully`);
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
        }
    };

    if (loading) return <div>Loading requests...</div>;

    // Helper for status colors
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return '#22c55e'; // Green
            case 'rejected': return '#ef4444'; // Red
            case 'under_review': return '#f59e0b'; // Amber
            default: return '#6b7280'; // Gray
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3>Termination Requests</h3>
            {requests.length === 0 ? (
                <Card padding="lg">
                    <p style={{ color: '#666', textAlign: 'center' }}>No termination requests found</p>
                </Card>
            ) : (
                requests.map(req => (
                    <Card key={req._id} padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Termination Request</div>
                                {/* Assuming req has employee details populated, or at least an ID */}
                                <div style={{ marginTop: '0.25rem' }}>Employee ID: {req.employeeId}</div>
                                <div style={{ color: '#666', marginTop: '0.25rem' }}>Reason: {req.reason}</div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                    Status: <span style={{ color: getStatusColor(req.status), fontWeight: 'bold' }}>{req.status?.toUpperCase() || 'PENDING'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {(!req.status || req.status === 'pending') && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                                        onClick={() => handleStatusUpdate(req._id, 'under_review')}
                                    >
                                        Mark Under Review
                                    </Button>
                                )}
                                {(req.status === 'under_review' || req.status === 'pending') && (
                                    <>
                                        <Button
                                            size="sm"
                                            style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', color: 'white' }}
                                            onClick={() => handleStatusUpdate(req._id, 'approved')}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="error"
                                            onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};

export default function HROffboardingView() {
    const [activeTab, setActiveTab] = useState<'termination-requests' | 'termination-review' | 'clearance' | 'settlement'>('termination-requests');
    const [selectedTerminationId, setSelectedTerminationId] = useState<string | null>(null);

    return (
        <div className={styles.subContainer}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'termination-requests' ? styles.active : ''}`}
                    onClick={() => setActiveTab('termination-requests')}
                >
                    Termination Requests
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'termination-review' ? styles.active : ''}`}
                    onClick={() => setActiveTab('termination-review')}
                >
                    Employees
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'clearance' ? styles.active : ''}`}
                    onClick={() => setActiveTab('clearance')}
                >
                    Clearance Tracker
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'settlement' ? styles.active : ''}`}
                    onClick={() => setActiveTab('settlement')}
                >
                    Final Settlement
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'termination-requests' && <TerminationRequestsList />}

                {activeTab === 'termination-review' && <EmployeeListForTermination />}

                {activeTab === 'clearance' && (
                    selectedTerminationId ? (
                        <div>
                            <Button variant="ghost" onClick={() => setSelectedTerminationId(null)} style={{ marginBottom: '1rem' }}>
                                ← Back to Selection
                            </Button>
                            <ClearanceTracker terminationId={selectedTerminationId} />
                        </div>
                    ) : (
                        <TerminationSelector onSelect={setSelectedTerminationId} />
                    )
                )}

                {activeTab === 'settlement' && <FinalSettlement />}
            </div>
        </div>
    );
}

