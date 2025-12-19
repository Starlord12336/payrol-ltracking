'use client';

import { useState } from 'react';
import { Card } from '@/shared/components';
import AssessmentFormList from './AssessmentFormList';
import AssessmentFormBuilder from './AssessmentFormBuilder';
import { AssessmentForm } from '../types';

export default function RecruitmentAssessmentForms() {
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editData, setEditData] = useState<AssessmentForm | undefined>(undefined);

    const handleCreate = () => {
        setEditData(undefined);
        setView('create');
    };

    const handleEdit = (form: AssessmentForm) => {
        setEditData(form);
        setView('edit');
    };

    const handleSuccess = () => {
        setView('list');
    };

    const handleCancel = () => {
        setView('list');
    };

    return (
        <Card padding="lg">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Assessment Forms Management</h1>

            {view === 'list' && (
                <AssessmentFormList
                    onCreateNew={handleCreate}
                    onEdit={handleEdit}
                />
            )}

            {(view === 'create' || view === 'edit') && (
                <AssessmentFormBuilder
                    initialData={editData}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            )}
        </Card>
    );
}
