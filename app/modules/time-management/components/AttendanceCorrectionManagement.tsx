'use client';

import { useEffect, useState } from 'react';
import {
  getPendingCorrectionsForManager,
  approveAttendanceCorrection,
  rejectAttendanceCorrection,
} from '../api';
import { AttendanceCorrectionReview } from '../types';
import s from '../page.module.css';

export function AttendanceCorrectionManagementForHRManager() {
  const [pendingCorrections, setPendingCorrections] =
    useState<AttendanceCorrectionReview[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  interface AttendanceCorrectionManagementForHRManagerProps {
    onCreated: () => void;
  }

  useEffect(() => {
    getPendingCorrectionsForManager().then((data) => {
      setPendingCorrections(data);
      setIsLoaded(true);
    });
  }, []);

  const approve = async (id: string) => {
    await approveAttendanceCorrection(id);
    setPendingCorrections((prev) => prev.filter((r) => r.id !== id));
  };

  const reject = async (id: string) => {
    await rejectAttendanceCorrection(id);
    setPendingCorrections((prev) => prev.filter((r) => r.id !== id));
  };

  if (!isLoaded) return <p>Loading…</p>;

  return (
    <div className={s.attendancerecordContainer}>
      {pendingCorrections.map((r) => (
        <div key={r.id} className={s.Card}>
          <h4>{r.employeeName} ({r.employeeNumber})</h4>

          <p>Employee ID: {r.employeeId}</p>
          <p>Total Minutes: {r.totalWorkMinutes}</p>
          <p>Missed Punch: {r.hasMissedPunch ? 'Yes' : 'No'}</p>

          {r.reason && <p>Reason: {r.reason}</p>}

          <div className={s.punchList}>
            {r.punches.map((p, i) => (
              <div key={i}>
                {p.type} — {new Date(p.time).toLocaleString()}
              </div>
            ))}
          </div>

          <div className={s.actions}>
            <button onClick={() => approve(r.id)}>Approve</button>
            <button onClick={() => reject(r.id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
