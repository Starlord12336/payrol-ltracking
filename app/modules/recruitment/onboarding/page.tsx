'use client';

import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button, Card } from '@/shared/components';
import ContractsList from '../components/ContractsList';
import CreateEmployeeProfileForm from '../components/CreateEmployeeProfileForm';
import DocumentUploadForm from '../components/DocumentUploadForm';
import SystemAccessPanel from '../components/SystemAccessPanel';
import ResourceAllocationPanel from '../components/ResourceAllocationPanel';
import PayrollInitiationPanel from '../components/PayrollInitiationPanel';
import EmployeeOnboardingList from '../components/EmployeeOnboardingList';
import styles from '../page.module.css';

type TabType = 'overview' | 'checklists' | 'employee-profile' | 'documents' | 'access' | 'resources' | 'payroll';

function OnboardingDashboardContent() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [employeeId, setEmployeeId] = useState('');

    const tabs: { key: TabType; label: string; code: string }[] = [
        { key: 'overview', label: 'Overview', code: '' },
        { key: 'checklists', label: 'Checklists (ONB-001)', code: 'ONB-001' },
        { key: 'employee-profile', label: 'Create Profile (ONB-002)', code: 'ONB-002' },
        { key: 'documents', label: 'Upload Docs (ONB-007)', code: 'ONB-007' },
        { key: 'access', label: 'System Access (ONB-009/013)', code: 'ONB-009' },
        { key: 'resources', label: 'Resources (ONB-012)', code: 'ONB-012' },
        { key: 'payroll', label: 'Payroll & Bonus (ONB-018/019)', code: 'ONB-018' },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Onboarding Management</h1>
                <div className={styles.breadcrumbs}>
                    <span>Recruitment</span> / <span>Onboarding</span>
                </div>
            </header>

            <div className={styles.content}>
                <div style={{ marginBottom: '1rem' }}>
                    <Button variant="outline" onClick={() => window.location.href = '/modules/recruitment/recruitent'}>
                        Back to Recruitment
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {tabs.map((tab) => (
                        <Button
                            key={tab.key}
                            variant={activeTab === tab.key ? 'primary' : 'outline'}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        <div onClick={() => setActiveTab('checklists')} style={{ cursor: 'pointer' }}>
                            <Card padding="lg" hover>
                                <h3>📋 ONB-001: Task Checklists</h3>
                                <p style={{ color: '#666' }}>Create standardized onboarding task checklists and define required steps for new hires.</p>
                            </Card>
                        </div>
                        <div onClick={() => setActiveTab('employee-profile')} style={{ cursor: 'pointer' }}>
                            <Card padding="lg" hover>
                                <h3>👤 ONB-002: Employee Profile</h3>
                                <p style={{ color: '#666' }}>Create employee profile from signed contract after offer acceptance.</p>
                            </Card>
                        </div>
                        <div onClick={() => router.push('/modules/recruitment/onboarding-tracker')} style={{ cursor: 'pointer' }}>
                            <Card padding="lg" hover>
                                <h3>📊 ONB-004: Onboarding Tracker</h3>
                                <p style={{ color: '#666' }}>View onboarding steps and progress with real-time task status.</p>
                            </Card>
                        </div>

                        <div onClick={() => setActiveTab('documents')} style={{ cursor: 'pointer' }}>
                            <Card padding="lg" hover>
                                <h3>📄 ONB-007: Upload Documents</h3>
                                <p style={{ color: '#666' }}>Upload ID, contracts, and certifications. Verified before first working day.</p>
                            </Card>
                        </div>
                        <div onClick={() => setActiveTab('access')} style={{ cursor: 'pointer' }}>
                            <Card padding="lg" hover>
                                <h3>🔐 ONB-009: System Access</h3>
                                <p style={{ color: '#666' }}>Provision payroll, email, and internal systems with automated provisioning.</p>
                            </Card>
                        </div>
                        <div onClick={() => setActiveTab('resources')} style={{ cursor: 'pointer' }}>
                            <Card padding="lg" hover>
                                <h3>💼 ONB-012: Resources</h3>
                                <p style={{ color: '#666' }}>Reserve equipment, desk, and access cards. Resources ready on Day 1.</p>
                            </Card>
                        </div>
                        <div onClick={() => setActiveTab('access')} style={{ cursor: 'pointer' }}>
                            <Card padding="lg" hover>
                                <h3>⚙️ ONB-013: Access Management</h3>
                                <p style={{ color: '#666' }}>Schedule access activation and revocation. Supports no-show cancellation.</p>
                            </Card>
                        </div>
                        <div onClick={() => setActiveTab('payroll')} style={{ cursor: 'pointer' }}>
                            <Card padding="lg" hover>
                                <h3>💰 ONB-018: Payroll Initiation</h3>
                                <p style={{ color: '#666' }}>Automatically initiate payroll setup for new employees.</p>
                            </Card>
                        </div>
                        <div onClick={() => setActiveTab('payroll')} style={{ cursor: 'pointer' }}>
                            <Card padding="lg" hover>
                                <h3>🎁 ONB-019: Signing Bonus</h3>
                                <p style={{ color: '#666' }}>Process signing bonus automatically and add to payroll.</p>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Checklists Tab (ONB-001) */}
                {activeTab === 'checklists' && (
                    <div style={{ maxWidth: '900px' }}>
                        <EmployeeOnboardingList />
                    </div>
                )}

                {/* Employee Profile Tab (ONB-002) */}
                {activeTab === 'employee-profile' && (
                    <div style={{ maxWidth: '800px' }}>
                        <ContractsList
                            onSuccess={(result) => {
                                setEmployeeId(result.profileId || result.employeeId);
                                setActiveTab('documents'); // Auto-advance to next tab
                            }}
                        />
                    </div>
                )}

                {/* Documents Tab (ONB-007) */}
                {activeTab === 'documents' && (
                    <div style={{ maxWidth: '800px' }}>
                        <DocumentUploadForm employeeId={employeeId} />
                    </div>
                )}

                {/* System Access Tab (ONB-009, ONB-013) */}
                {activeTab === 'access' && (
                    <div style={{ maxWidth: '900px' }}>
                        <SystemAccessPanel employeeId={employeeId} />
                    </div>
                )}

                {/* Resources Tab (ONB-012) */}
                {activeTab === 'resources' && (
                    <div style={{ maxWidth: '800px' }}>
                        <ResourceAllocationPanel employeeId={employeeId} />
                    </div>
                )}

                {/* Payroll Tab (ONB-018, ONB-019) */}
                {activeTab === 'payroll' && (
                    <div style={{ maxWidth: '900px' }}>
                        <PayrollInitiationPanel employeeId={employeeId} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OnboardingDashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingDashboardContent />
        </Suspense>
    );
}
