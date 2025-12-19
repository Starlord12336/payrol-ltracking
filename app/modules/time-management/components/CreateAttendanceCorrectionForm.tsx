"use client";

import { useEffect, useState } from "react";
import { createAttendanceCorrection, getAllAttendanceRecord } from "../api/index";
import s from "../page.module.css";
import { AttendanceRecord, CorrectionRequestStatus } from "../types";
import { EmployeeProfile, getAllEmployees } from "../../hr/api/hrApi";
import Selections from "./Selections";

interface CreateAttendanceCorrectionFormProps {
  onCreated: () => void;
}

export default function CreateAttendanceCorrectionForm({
  onCreated,
}: CreateAttendanceCorrectionFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [attendanceRecordId, setAttendanceRecordId] = useState("");
  const [status, setStatus] = useState<CorrectionRequestStatus | undefined>(CorrectionRequestStatus.IN_REVIEW);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, recordData] = await Promise.all([
          getAllEmployees(),
          getAllAttendanceRecord()
        ]);
        setEmployees(empData);
        setAttendanceRecords(recordData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();


    setLoading(true);
    try {
      await createAttendanceCorrection({
        employeeId,
        attendanceRecordId,
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

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Employee ID</label>
          <Selections
            employeeId={employeeId}
            setEmployeeId={setEmployeeId}
          />

          <label className={s.description}>Attendance Record</label>
          <select
            className={s.select}
            value={attendanceRecordId}
            onChange={(e) => setAttendanceRecordId(e.target.value)}
            required
            disabled={!employeeId}
          >
            <option value="" disabled>
              {employeeId ? "Select an Attendance Record" : "Select an Employee first"}
            </option>

            {attendanceRecords
              .filter((at) => at.employeeId === employeeId)
              .map((at) => (
                <option key={at.id} value={at.id}>
                  Record #{at.id} · {at.totalWorkMinutes} mins
                  {at.hasMissedPunch ? " · Incomplete shift" : ""}
                </option>
              ))}
          </select>

          <label className={s.description}>Status</label>
          <select
            className={s.select}
            value={status}
            onChange={(e) => setStatus(e.target.value as CorrectionRequestStatus)}
            required
          >
            <option value="" disabled>

            </option>
            {Object.values(CorrectionRequestStatus).map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          <label className={s.description}>Reason (optional)</label>
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />

          <button className={s.button} disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
}
