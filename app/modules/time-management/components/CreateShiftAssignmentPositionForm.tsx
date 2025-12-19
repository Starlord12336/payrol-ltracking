"use client";

import { useEffect, useState } from "react";
import {
  createShiftAssignmentByPosition,
  getAllSchedule,
  getAllShifts,
} from "../api/index";
import s from "../page.module.css";
import { ScheduleRule, Shift, ShiftAssignmentStatus } from "../types";
import { useSearchParams } from "next/navigation";
import { EmployeeProfile } from "../../hr/api/hrApi";

interface CreateShiftAssignmentPositionFormProps {
  onCreated: () => void;
}

function dateOnlyToIso(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00`).toISOString();
}

const toId = (x: any) => String(x?.id ?? x?._id ?? "");

export default function CreateShiftAssignmentPositionForm({
  onCreated,
}: CreateShiftAssignmentPositionFormProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [scheduleRules, setScheduleRules] = useState<ScheduleRule[]>([]);
  const [positions, setPositions] = useState<EmployeeProfile[]>([]);

  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [selectedScheduleRuleId, setSelectedScheduleRuleId] = useState("");

  const [startDate, setStartDate] = useState(""); // "YYYY-MM-DD"
  const [endDate, setEndDate] = useState(""); // "YYYY-MM-DD"

  const [status, setStatus] = useState<ShiftAssignmentStatus>(
    ShiftAssignmentStatus.APPROVED
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useSearchParams();
  const shiftId = params.get("shiftId");

  useEffect(() => {

    if (shiftId) {
      setSelectedShiftId(shiftId);
      console.log("URL shiftId =", shiftId);
    }
  }, [shiftId]);

  useEffect(() => {
    (async () => {
      try {
        const [allShifts, rules] = await Promise.all([
          getAllShifts(),
          getAllSchedule(),
        ]);

        setShifts(allShifts);
        setScheduleRules(rules);

        if (shiftId && !allShifts.some(s => s.id === shiftId)) {
          setSelectedShiftId("");
        }
      } catch (err) {
        console.error("Failed to load form data", err);
        setError("Failed to load form data");
      }
    })();
  }, [shiftId]);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedPositionId || !selectedShiftId || !startDate) {
      setError("Position, Shift, and Start Date are required");
      setLoading(false);
      return;
    }

    try {
      const shiftAssignmentData = {
        positionId: selectedPositionId,
        shiftId: selectedShiftId,
        scheduleRuleId: selectedScheduleRuleId || undefined,
        startDate: dateOnlyToIso(startDate),
        endDate: endDate ? dateOnlyToIso(endDate) : undefined,
        status,
      };

      await createShiftAssignmentByPosition(shiftAssignmentData);

      setSelectedPositionId("");
      setSelectedShiftId("");
      setSelectedScheduleRuleId("");
      setStartDate("");
      setEndDate("");
      setStatus(ShiftAssignmentStatus.APPROVED);

      onCreated();
    } catch (err) {
      console.error("Error creating shift assignment:", err);
      setError("Failed to create shift assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const badShifts = shifts.filter(s => !(s as any).id && !(s as any)._id);
    const badRules = scheduleRules.filter(r => !(r as any).id && !(r as any)._id);

    if (badShifts.length || badRules.length) {
      console.error("❌ BAD SHIFTS:", badShifts);
      console.error("❌ BAD RULES:", badRules);
    }
  }, [shifts, scheduleRules]);


  return (

    <form onSubmit={submit} className={s.formContainer}>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Position</label>
          <select
            className={s.select}
            value={selectedPositionId}
            onChange={(e) => setSelectedPositionId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a Position
            </option>
            {positions.map((pos) => (
              <option key={pos._id} value={pos._id}>
                {pos.contractType ?? pos._id}
              </option>
            ))}
          </select>

          <label className={s.description}>Shift</label>
          <select
            className={s.select}
            value={selectedShiftId}
            onChange={(e) => setSelectedShiftId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a Shift
            </option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name ?? shift.id}
              </option>
            ))}
          </select>

          <label className={s.description}>Schedule Rule (Optional)</label>
          <select
            className={s.select}
            value={selectedScheduleRuleId}
            onChange={(e) => setSelectedScheduleRuleId(e.target.value)}
          >
            <option value="">No Schedule Rule</option>
            {scheduleRules.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {rule.name ?? rule.id}
              </option>
            ))}
          </select>

          <label className={s.description}>Start Date</label>
          <input className={s.select} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />

          <label className={s.description}>End Date</label>
          <input className={s.select} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

          <label className={s.description}>Status</label>
          <select
            className={s.select}
            value={status}
            onChange={e => setStatus(e.target.value as ShiftAssignmentStatus)}
            required
          >
            {Object.values(ShiftAssignmentStatus).map(t => (
              <option key={t} value={t}>
                {t.replace('_', ' ')}
              </option>
            ))}
          </select>

          <button className={s.button} type="submit" disabled={loading}>
            {loading ? "Assigning..." : "Assign Shift"}
          </button>
        </div>
      </div>
    </form>
  );
}
