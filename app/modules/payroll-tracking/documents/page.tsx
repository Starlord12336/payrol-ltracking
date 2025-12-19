'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { getTaxDocuments } from '../utils/documentService';
import { TaxDocument } from '../utils/document';
import { DocumentList } from '../components/DocumentList';
import styles from './documents.module.css';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.userid) {
      getTaxDocuments(user.userid)
        .then(setDocuments)
        .catch((err) => {
          console.error('Error fetching documents:', err);
          setError('Failed to load documents');
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tax Documents</h1>
        <p>Download your official payroll tax documents</p>
      </div>
      <DocumentList documents={documents} />
    </div>
  );
}
