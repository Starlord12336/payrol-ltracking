'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getDisputeById } from '../../../shared/utils/disputeService';
import { Dispute } from '../../../shared/types/dispute';
import { StatusTimeline } from '../../components/StatusTimeline';
import { RefundSummary } from '../../components/RefundSummary';
import styles from './DisputeDetails.module.css';

export default function DisputeDetailsPage() {
  const { id } = useParams();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getDisputeById(id as string)
      .then(setDispute)
      .catch(() => setError('Failed to load dispute details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;
  if (!dispute) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dispute Details</h1>
        <p>Track the progress and resolution of your claim</p>
      </div>
      <StatusTimeline statusHistory={dispute.statusHistory} />
      <RefundSummary refund={dispute.refund} />
    </div>
  );
}
