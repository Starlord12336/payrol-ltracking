'use client';

import { useState } from 'react';
import JobRequisitionList from './JobRequisitionList';
import JobRequisitionForm from './JobRequisitionForm';

export default function RecruitmentPostings() {
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
                <JobRequisitionList onCreateClick={handleCreateClick} />
            ) : (
                <JobRequisitionForm onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
        </div>
    );
}
