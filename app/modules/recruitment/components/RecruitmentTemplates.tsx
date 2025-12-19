'use client';

import { useState } from 'react';
import JobTemplateList from './JobTemplateList';
import JobTemplateForm from './JobTemplateForm';

export default function RecruitmentTemplates() {
    const [view, setView] = useState<'list' | 'create'>('list');

    const handleCreateClick = () => setView('create');

    const handleSuccess = () => {
        setView('list');
    };

    const handleCancel = () => {
        setView('list');
    };

    return (
        <div>
            {view === 'list' ? (
                <JobTemplateList onCreateClick={handleCreateClick} />
            ) : (
                <JobTemplateForm onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
        </div>
    );
}
