'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/shared/components';

export default function PayrollTrackingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard by default
    router.replace('/modules/payroll-tracking/dashboard');
  }, [router]);

  return (
    <ProtectedRoute>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Redirecting to payroll dashboard...</p>
      </div>
    </ProtectedRoute>
  );
}


