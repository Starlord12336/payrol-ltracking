'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/shared/components';
import OnboardingTracker from './OnboardingTracker';
import DocumentVerificationList from './DocumentVerificationList';
import EquipmentManagement from './EquipmentManagement';
import BenefitsEnrollment from './BenefitsEnrollment';
import SigningBonusList from './SigningBonusList';
import styles from './HRRecruitmentView.module.css';

const OnboardingEmployeeSelector = ({ onSelect, onCancel }: { onSelect: (id: string) => void, onCancel: () => void }) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // Fetch employees in PROBATION status (onboarding)
                const data = await import('../api/recruitment.api').then(m => m.recruitmentApi.listEmployees({ status: 'PROBATION' }));
                setEmployees(data);
            } catch (err) {
                console.error("Failed to fetch employees", err);
                setError("Failed to load employees");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    if (loading) return <div>Loading candidates...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Card>
            <h3>Select New Hire</h3>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {employees.length === 0 ? (
                    <p>No new hires found in text.</p>
                ) : (
                    employees.map(emp => (
                        <div key={emp._id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', cursor: 'pointer' }} onClick={() => onSelect(emp._id)}>
                            <strong>{emp.firstName} {emp.lastName}</strong>
                            <div>{emp.position || 'Use Profile Title'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: {emp.employeeNumber}</div>
                        </div>
                    ))
                )}
            </div>
            <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#888' }}>
                    Don&apos;t see the employee? Ensure they have been converted from Candidate to Employee with status &apos;PROBATION&apos;.
                </p>
            </div>
        </Card>
    );
};

export default function HROnboardingView() {
    const [activeTab, setActiveTab] = useState<'tracker' | 'documents' | 'equipment' | 'benefits' | 'bonus'>('tracker');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

    return (
        <div className={styles.subContainer}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'tracker' ? styles.active : ''}`}
                    onClick={() => setActiveTab('tracker')}
                >
                    Tracker
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    Documents
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'equipment' ? styles.active : ''}`}
                    onClick={() => setActiveTab('equipment')}
                >
                    Equipment
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'benefits' ? styles.active : ''}`}
                    onClick={() => setActiveTab('benefits')}
                >
                    Benefits
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'bonus' ? styles.active : ''}`}
                    onClick={() => setActiveTab('bonus')}
                >
                    Signing Bonuses
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'tracker' && (
                    selectedEmployeeId ? (
                        <div>
                            <Button variant="ghost" onClick={() => setSelectedEmployeeId(null)} style={{ marginBottom: '1rem' }}>
                                ← Back to Selection
                            </Button>
                            <OnboardingTracker employeeId={selectedEmployeeId} />
                        </div>
                    ) : (
                        <OnboardingEmployeeSelector onSelect={setSelectedEmployeeId} onCancel={() => { }} />
                    )
                )}

                {activeTab === 'documents' && <DocumentVerificationList />}

                {activeTab === 'equipment' && (
                    selectedEmployeeId ? (
                        <div>
                            <Button variant="ghost" onClick={() => setSelectedEmployeeId(null)} style={{ marginBottom: '1rem' }}>
                                ← Change Employee
                            </Button>
                            <EquipmentManagement employeeId={selectedEmployeeId} />
                        </div>
                    ) : (
                        <OnboardingEmployeeSelector onSelect={setSelectedEmployeeId} onCancel={() => { }} />
                    )
                )}

                {activeTab === 'benefits' && (
                    selectedEmployeeId ? (
                        <div>
                            <Button variant="ghost" onClick={() => setSelectedEmployeeId(null)} style={{ marginBottom: '1rem' }}>
                                ← Change Employee
                            </Button>
                            <BenefitsEnrollment employeeId={selectedEmployeeId} />
                        </div>
                    ) : (
                        <OnboardingEmployeeSelector onSelect={setSelectedEmployeeId} onCancel={() => { }} />
                    )
                )}

                {activeTab === 'bonus' && <SigningBonusList />}
            </div>
        </div>
    );
}
