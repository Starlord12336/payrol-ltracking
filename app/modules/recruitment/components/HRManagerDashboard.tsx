'use client';

import { useState } from 'react';
import { Card, Button } from '@/shared/components';
import HRJobTemplateManager from './HRJobTemplateManager';
import HRProcessTemplateManager from './HRProcessTemplateManager';
import HRRecruitmentMonitor from './HRRecruitmentMonitor';
import OfferManagement from './OfferManagement';
import styles from './HRRecruitmentView.module.css';

type TabType = 'templates' | 'processes' | 'monitor' | 'offers';

interface TabConfig {
    id: TabType;
    label: string;
    description: string;
    icon: string;
}

const TABS: TabConfig[] = [
    { id: 'templates', label: 'Job Templates', description: 'REC-003: Define job description templates', icon: '📋' },
    { id: 'processes', label: 'Hiring Process', description: 'REC-004: Establish hiring workflow stages', icon: '⚙️' },
    { id: 'monitor', label: 'Progress Monitor', description: 'REC-009: Monitor recruitment across positions', icon: '📊' },
    { id: 'offers', label: 'Offers & Approvals', description: 'REC-014: Manage job offers and approvals', icon: '✉️' },
];

export default function HRManagerDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('templates');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'templates':
                return <HRJobTemplateManager />;
            case 'processes':
                return <HRProcessTemplateManager />;
            case 'monitor':
                return <HRRecruitmentMonitor />;
            case 'offers':
                return <OfferManagement />;
            default:
                return null;
        }
    };

    const currentTab = TABS.find(t => t.id === activeTab);

    return (
        <div className={styles.container}>
            <Card padding="lg" shadow="warm">
                <div className={styles.header}>
                    <h1>HR Manager Dashboard</h1>
                    <p>Manage recruitment templates, processes, and monitor hiring progress</p>
                </div>

                <div className={styles.tabs}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            title={tab.description}
                        >
                            <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {currentTab && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        color: '#3b82f6'
                    }}>
                        {currentTab.description}
                    </div>
                )}

                <div className={styles.content}>
                    {renderTabContent()}
                </div>
            </Card>
        </div>
    );
}
