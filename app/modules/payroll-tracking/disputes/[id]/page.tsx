'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { getDisputeById } from '../../utils/disputeService';
import { Dispute } from '../../utils/dispute';
import { StatusTimeline } from '../../components/StatusTimeline';
import styles from './DisputeDetails.module.css';

export default function DisputeDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const employeeId = searchParams.get('employeeId') || user?.userid;
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !employeeId) return;
    
    getDisputeById(employeeId as string, id as string)
      .then(setDispute)
      .catch((err) => {
        console.error('Error fetching dispute:', err);
        setError('Failed to load dispute details');
      })
      .finally(() => setLoading(false));
  }, [id, employeeId]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;
  if (!dispute) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dispute Details</h1>
        <p>Track the progress and resolution of your dispute</p>
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Dispute Information</h2>
          <p><strong>Dispute ID:</strong> {dispute.disputeId}</p>
          <p><strong>Status:</strong> {dispute.status}</p>
          <p><strong>Description:</strong> {dispute.description}</p>
          {dispute.rejectionReason && (
            <p><strong>Rejection Reason:</strong> {dispute.rejectionReason}</p>
          )}
          {dispute.resolutionComment && (
            <p><strong>Resolution Comment:</strong> {dispute.resolutionComment}</p>
          )}
          <p><strong>Created:</strong> {new Date(dispute.createdAt).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(dispute.updatedAt).toLocaleString()}</p>
        </div>
        <StatusTimeline status={dispute.status} />
      </div>
    </div>
  );
}
