"use client";

import { useEffect, useState } from "react";
import { createAttendanceCorrection, getAllAttendanceRecord } from "../api/index";
import s from "../page.module.css";
import { AttendanceRecord, CorrectionRequestStatus } from "../types";
import { useAuth } from "@/shared/hooks";

interface CreateAttendanceCorrectionFormProps {
  onCreated: () => void;
}

export default function AskForCorrection({
  onCreated,
}: CreateAttendanceCorrectionFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [attendanceRecordId, setAttendanceRecordId] = useState("");
  const [status, setStatus] = useState<CorrectionRequestStatus | undefined>(CorrectionRequestStatus.IN_REVIEW);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const { user } = useAuth();

  // Submit function for creating an attendance correction
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createAttendanceCorrection({
        employeeId,
        attendanceRecord: attendanceRecordId,
        status,
        reason: reason || undefined,
      });

      setEmployeeId("");
      setAttendanceRecordId("");
      setStatus(undefined);
      setReason("");
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userid && !employeeId) { // Only set if employeeId is empty
      setEmployeeId(user.userid);
    }
  }, [user?.userid, employeeId]);

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        const records = await getAllAttendanceRecord();
        const myRecord = records.filter((record) => record.employeeId === user?.userid);
        setAttendanceRecords(records);
      } catch (error) {
        console.error("Failed to fetch attendance records", error);
      }
    };

    if (user) {
      fetchAttendanceRecords();
    }
  }, [user]);


  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.field}>
        <label className={s.description}>Attendance Record</label>
        <select
          className={s.select}
          value={attendanceRecordId}
          onChange={(e) => setAttendanceRecordId(e.target.value)}
          required
          disabled={!employeeId} // Disabled unless employeeId is set
        >

          {attendanceRecords
            .filter((at) => at.employeeId === user?.userid) // Filters records for the logged-in user
            .map((at) => (
              <option key={at.id} value={at.id}>
                Record #{at.id} · {at.totalWorkMinutes} mins
                {at.hasMissedPunch ? " · Shift Incomplete/Awaiting Out Punch" : ""}
              </option>
            ))}
        </select>


        <label className={s.description}>Reason (optional, unless you want to make it convincing...)</label>
        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />

        <button className={s.button} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
} 
