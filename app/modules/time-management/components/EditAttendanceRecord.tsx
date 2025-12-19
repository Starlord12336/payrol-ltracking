import { AttendanceRecord } from "../types";
import { updateAttendanceRecord, getAllAttendanceRecord, deleteAttendanceCorrection } from "../api/index";
import s from "../page.module.css";
import { useEffect, useState } from "react";

interface EditAttendanceRecordProps {
  attendancerecords: AttendanceRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: AttendanceRecord) => void; // Add this prop
}


export default function EditAttendanceRecord({
  attendancerecords,
  onDelete,
  onEdit
}: EditAttendanceRecordProps) {
  if (!attendancerecords.length) return <p>No attendance records found</p>;

  return (
    <div className={s.cardcontainer}>
      {attendancerecords.map((attendancerecord) => (
        <div key={attendancerecord.id} className={s.Card}>
          {/* Employee ID */}
          <p className={s.description}>
            Employee ID: {attendancerecord.employeeId}
          </p>

          {/* Total Work Minutes */}
          <p className={s.description}>
            Total Work Minutes: {attendancerecord.totalWorkMinutes}
          </p>

          {/* Missed Punch */}
          <p className={s.description}>
            Missed Punch? {attendancerecord.hasMissedPunch ? "Yes" : "No"}
          </p>

          {/* Finalised For Payroll */}
          <p className={s.description}>
            Finalised For Payroll? {attendancerecord.finalisedForPayroll ? "Yes" : "No"}
          </p>

          {/* Punches */}
          <div className={s.description}>
            Punches:
            <ul>
              {attendancerecord.punches.map((p, i) => (
                <li key={i}>
                  {new Date(p.time).toLocaleString()} - {p.type}
                </li>
              ))}
            </ul>
          </div>

          {/* Exception IDs if they exist */}
          {attendancerecord.exceptionIds && attendancerecord.exceptionIds.length > 0 && (
            <p className={s.description}>
              Exceptions: {attendancerecord.exceptionIds.length}
            </p>
          )}

          {/* Action Buttons */}
          <div className={s.buttonGroup}>
            <button
              className={`${s.button} ${s.editButton}`}
              onClick={() => onEdit(attendancerecord)}
            >
              Edit
            </button>
            <button
              className={`${s.button} ${s.deleteButton}`}
              onClick={() => onDelete(attendancerecord.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}