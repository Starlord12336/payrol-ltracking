
'use client';

import { useState } from 'react';
import RecruitmentTemplates from './RecruitmentTemplates';
import RecruitmentProcessTemplates from './RecruitmentProcessTemplates';
import PanelManagement from './PanelManagement';
import styles from './HRRecruitmentView.module.css';

export default function HRConfigurationView() {
    const [activeTab, setActiveTab] = useState<'job-templates' | 'process-templates' | 'panels'>('job-templates');

    return (
        <div className={styles.subContainer}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'job-templates' ? styles.active : ''}`}
                    onClick={() => setActiveTab('job-templates')}
                >
                    Job Templates
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'process-templates' ? styles.active : ''}`}
                    onClick={() => setActiveTab('process-templates')}
                >
                    Process Templates
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'panels' ? styles.active : ''}`}
                    onClick={() => setActiveTab('panels')}
                >
                    Panel Management
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'job-templates' && <RecruitmentTemplates />}

                {activeTab === 'process-templates' && <RecruitmentProcessTemplates />}

                {activeTab === 'panels' && <PanelManagement />}
            </div>
        </div>
    );
}
