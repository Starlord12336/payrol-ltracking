'use client';

import { useEffect, useState } from 'react';
import { getDocuments } from '../../../shared/utils/documentService';
import { Document } from '../../../shared/types/document';
import { DocumentList } from '../components/DocumentList';
import styles from './Documents.module.css';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch(() => setError('Failed to load documents'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Certificates</h1>
        <p>Download your official payroll documents</p>
      </div>
      <DocumentList documents={documents} />
    </div>
  );
}
