import { AttendanceRecord } from "../types";
import s from "../page.module.css";
import { getEmployeeName } from "./utils";
import { EmployeeProfile } from "../../hr/api/hrApi";
import Link from "next/link";

interface AttendanceRecordListProps {
  attendancerecords: AttendanceRecord[];
  employees: EmployeeProfile[];
  onDelete: (id: string) => void;
}

/*
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  punches: Punch[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  exceptionIds: string[];
  finalisedForPayroll: boolean;
}
*/
export default function AttendanceRecordList({ attendancerecords, employees, onDelete }: AttendanceRecordListProps) {
  if (!attendancerecords.length) return <p>No attendance records yet</p>;

  return (
    <div className={s.cardContainer}>
      {attendancerecords.map((attendancerecord) => (
        <div key={attendancerecord.id} className={s.Card}>
          <p className={s.description}>Employee: {getEmployeeName(employees, attendancerecord.employeeId)}</p>

          <p className={s.description}>
            Employee ID: {attendancerecord.employeeId}
          </p>

          <p className={s.description}>
            Total Work Minutes: {attendancerecord.totalWorkMinutes}
          </p>

          <p className={s.description}>
            Status: {attendancerecord.hasMissedPunch ? "Shift Incomplete (Awaiting Out Punch)" : "Complete"}
          </p>

          <p className={s.description}>
            Finalised For Payroll? {attendancerecord.finalisedForPayroll ? "Yes" : "No"}
          </p>

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


          <div className={s.buttonGroup}>
            <Link href={`/modules/time-management/attendance-record/edit?id=${attendancerecord.id}`}>
              <button className={s.button}>Edit</button>
            </Link>
            <button className={`${s.button} ${s.danger}`} onClick={() => onDelete(attendancerecord.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
