"use client";

import { useEffect, useState } from "react";
import { createTimeException, getAllAttendanceRecord } from '../api/index';
import s from "../page.module.css";
import { AttendanceRecord, TimeExceptionStatus, TimeExceptionType } from "../types";
import { EmployeeProfile, getAllEmployees } from "../../hr/api/hrApi";

interface CreateTimeExceptionFormProps {
  onCreated: () => void;
}

export default function CreateTimeExceptionForm({ onCreated }: CreateTimeExceptionFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<TimeExceptionType>(TimeExceptionType.MISSED_PUNCH);
  const [attendanceRecordId, setAttendanceRecordId] = useState("");
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [assignedTo, setAssignedTo] = useState(() => {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("userId");
      return currentUser || "";
    }
    return "";
  });
  const [status, setStatus] = useState<TimeExceptionStatus>(TimeExceptionStatus.OPEN);
  const [reason, setReason] = useState(""); // optional
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllEmployees().then(setEmployees).catch(() => { });
    getAllAttendanceRecord().then(setAttendanceRecords).catch(() => { });
  }, []);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createTimeException({
        employeeId,
        type,
        attendanceRecordId,
        assignedTo,
        status,
        reason: reason || undefined, // optional
      });

      // Reset form to defaults
      setEmployeeId("");
      setType(TimeExceptionType.MISSED_PUNCH);
      setAttendanceRecordId("");
      setAssignedTo("");
      setStatus(TimeExceptionStatus.OPEN);
      setReason("");

      onCreated();
    } catch (err) {
      console.error("Error creating time exception:", err);
    } finally {
      setLoading(false);
    }
  };

  /* export interface TimeException {
    attendanceRecordId: string;
    assignedTo: string; // person responsible for handling the exception
  }*/

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Employee</label>
          <select className={s.select} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
            <option value="" disabled>Select employee</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>

          <label className={s.description}>Time Exception Type</label>
          <select className={s.select} value={type} onChange={e => setType(e.target.value as TimeExceptionType)}>
            {Object.values(TimeExceptionType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className={s.description}>Attendance Record (By Employee ID)</label>
          <select
            className={s.select}
            value={attendanceRecordId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          >
            <option value="" disabled>Select Record</option>
            {attendanceRecords.map(a => (
              <option key={a.id} value={a.id}>
                {a.employeeId}
              </option>
            ))}
          </select>

          <label className={s.description}>person responsible for handling the exception</label>
          <select className={s.select} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required>
            <option value="" disabled>Select employee</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>

          <label className={s.description}>Status</label>
          <select className={s.select} value={status} onChange={e => setStatus(e.target.value as TimeExceptionStatus)}>
            {Object.values(TimeExceptionStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className={s.description}>Reason (optional)</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} />

          <button className={s.button} disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
}
