'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { recruitmentApi } from '../api/recruitment.api';
import { DocumentType, UploadOnboardingDocumentDto } from '../types';
import styles from './RecruitmentForms.module.css';

interface DocumentUploadFormProps {
    employeeId: string;
    onSuccess?: () => void;
}

export default function DocumentUploadForm({ employeeId, onSuccess }: DocumentUploadFormProps) {
    const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.ID);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file' });
            return;
        }

        setLoading(true);
        try {
            // In a real app, we would upload the file to a storage service (S3, etc.) first
            // and get the URL/Path. Here we will mock it by using the filename.
            const fakeFilePath = `uploads/${employeeId}/${file.name}`;

            const dto: UploadOnboardingDocumentDto = {
                employeeId,
                documentType,
                filePath: fakeFilePath
            };

            await recruitmentApi.uploadOnboardingDocument(dto);
            setMessage({ type: 'success', text: 'Document uploaded successfully!' });
            setFile(null);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Upload failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card padding="lg">
            <h3>Upload Onboarding Document</h3>
            {message && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b'
                }}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Document Type</label>
                    <select
                        className={styles.input}
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                    >
                        {Object.values(DocumentType).map((type) => (
                            <option key={type} value={type}>{type.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>File</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.png,.doc,.docx"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formActions}>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
