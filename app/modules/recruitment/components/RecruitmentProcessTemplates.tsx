'use client';

import { useState } from 'react';
import ProcessTemplateList from './ProcessTemplateList';
import ProcessTemplateForm from './ProcessTemplateForm';

export default function RecruitmentProcessTemplates() {
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
                <ProcessTemplateList onCreateClick={handleCreateClick} />
            ) : (
                <ProcessTemplateForm onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
        </div>
    );
}
