"use client";

import { useEffect, useState } from "react";
import {
  createShiftAssignmentByEmployee,
  getAllSchedule,
  getAllShifts,
} from "../api/index";
import s from "../page.module.css";
import { ScheduleRule, Shift, ShiftAssignmentStatus } from "../types";
import { useSearchParams } from "next/navigation";
import Selections from "./Selections";

interface CreateShiftAssignmentEmployeeFormProps {
  onCreated: () => void;
}

function dateOnlyToIso(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00`).toISOString();
}

export default function CreateShiftAssignmentEmployeeForm({
  onCreated,
}: CreateShiftAssignmentEmployeeFormProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [scheduleRules, setScheduleRules] = useState<ScheduleRule[]>([]);

  // ✅ Use only ONE state for employeeId
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [selectedScheduleRuleId, setSelectedScheduleRuleId] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

    console.log("Selected Employee ID:", selectedEmployeeId); // Add this log
    console.log("Selected Shift ID:", selectedShiftId);
    console.log("Start Date:", startDate);

    if (!selectedEmployeeId || !selectedShiftId || !startDate) {
      setError("Employee, Shift, and Start Date are required");
      setLoading(false);
      return;
    }

    try {
      const shiftAssignmentData = {
        employeeId: selectedEmployeeId,
        shiftId: selectedShiftId,
        scheduleRuleId: selectedScheduleRuleId || undefined,
        startDate: dateOnlyToIso(startDate),
        endDate: endDate ? dateOnlyToIso(endDate) : undefined,
        status,
      };

      console.log("Submitting data:", shiftAssignmentData); // Log the payload

      const result = await createShiftAssignmentByEmployee(shiftAssignmentData);

      if (result && result.success) {
        // Reset form
        setSelectedEmployeeId("");
        setSelectedShiftId("");
        setSelectedScheduleRuleId("");
        setStartDate("");
        setEndDate("");
        setStatus(ShiftAssignmentStatus.APPROVED);

        onCreated();
      } else {
        setError(result.error?.message || "Failed to create shift assignment");
      }
    } catch (err) {
      console.error("Error creating shift assignment:", err);
      setError("Failed to create shift assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Employee</label>
          {/* ✅ Pass the same state variable and setter */}
          <Selections
            employeeId={selectedEmployeeId}
            setEmployeeId={setSelectedEmployeeId}
          />

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
          <input
            className={s.select}
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />

          <label className={s.description}>End Date</label>
          <input
            className={s.select}
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />

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