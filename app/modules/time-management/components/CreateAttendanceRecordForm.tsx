"use client";

import { useEffect, useState } from "react";
import { createAttendanceRecord, getAllTimeExceptions } from '../api/index';
import s from "../page.module.css";
import { Punch, PunchType, TimeException } from "../types";
import Selections from "./Selections";
import { EmployeeProfile } from "../../hr/api/hrApi";

interface CreateAttendanceRecordFormProps {
  onCreated: () => void;
}

export default function CreateAttendanceRecordForm({ onCreated }: CreateAttendanceRecordFormProps) {
  const [timeExceptions, setTimeExceptions] = useState<TimeException[]>([]);
  const [exceptionIds, setExceptionIds] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [punches, setPunches] = useState<Punch[]>([]);
  const [finalisedForPayroll, setFinalisedForPayroll] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [selectedTimeExceptionId, setSelectedTimeExceptionId] = useState("");

  useEffect(() => {
    getAllTimeExceptions()
      .then(setTimeExceptions)
      .catch(err => console.error("Failed to load exceptions", err));
  }, []);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createAttendanceRecord({
        employeeId,
        punches: punches.length > 0 ? punches : undefined,
        totalWorkMinutes: 0,
        hasMissedPunch: false,
        exceptionIds: Array.isArray(exceptionIds) && exceptionIds.length > 0 ? exceptionIds : undefined,
        finalisedForPayroll
      });

      // Reset form fields
      setEmployeeId("");
      setPunches([]);
      setExceptionIds("");
      setFinalisedForPayroll(false);

      onCreated(); // reload attendance records
    } catch (err) {
      console.error("Error creating attendance record:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Employee</label>
          <Selections
            employeeId={employeeId}
            setEmployeeId={setEmployeeId}
          />

          <label className={s.description}>Punches</label>
          <div className={s.punchList}>
            {punches.map((punch, index) => (
              <div key={index} className={s.punchRow}>
                <input
                  type="time"
                  className={s.punchTime}
                  value={punch.time.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const next = [...punches];
                    const newTime = new Date(punch.time);
                    newTime.setHours(hours, minutes);
                    next[index] = { ...next[index], time: newTime };
                    setPunches(next);
                  }}
                />

                <select
                  className={s.select}
                  value={punch.type}
                  onChange={(e) => {
                    const next = [...punches];
                    next[index] = {
                      ...next[index],
                      type: e.target.value as PunchType,
                    };
                    setPunches(next);
                  }}
                >
                  <option value={PunchType.IN}>IN</option>
                  <option value={PunchType.OUT}>OUT</option>
                </select>

                <button
                  type="button"
                  className={s.punchDelete}
                  onClick={() => setPunches(punches.filter((_, i) => i !== index))}
                  aria-label="Remove punch"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              className={s.punchAdd}
              onClick={() =>
                setPunches([
                  ...punches,
                  {
                    time: new Date(), // Create a Date object with current time
                    type: PunchType.IN
                  }
                ])
              }
            >
              + Add punch
            </button>
          </div>

          <label className={s.description}>Time Exceptions</label>
          <select
            className={s.select}
            value={selectedTimeExceptionId}
            onChange={(e) => setSelectedTimeExceptionId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a Time Exception
            </option>
            {timeExceptions.map((TimeException) => (
              <option key={TimeException.id} value={TimeException.id}>
                {TimeException.id}
              </option>
            ))}
          </select>

          <label className={s.description}>Finalised for Payroll</label>
          <input type="checkbox" checked={finalisedForPayroll} onChange={e => setFinalisedForPayroll(e.target.checked)} />

          <button className={s.button} disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
        </div>
      </div>
    </form>
  );
}