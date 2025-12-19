"use client";

import { useEffect, useState } from "react";
import { PunchPolicy, ShiftType } from "../types";
import s from "../page.module.css";
import { createShift, getAllShiftsType } from '../api/index';
import { useRouter, usePathname } from "next/navigation";

interface CreateShiftFormProps {
  onCreated: () => void;
}

export default function CreateShiftForm({ onCreated }: CreateShiftFormProps) {
  const [name, setName] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [punchPolicy, setPunchPolicy] = useState<PunchPolicy| "">("");
  const [graceIn, setGraceIn] = useState(0);
  const [graceOut, setGraceOut] = useState(0);
  const [requiresOvertimeApproval, setRequiresOvertimeApproval] = useState(false);
  const [active, setActive] = useState(true);
  
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllShiftsType()
      .then(setShiftTypes)
      .catch((err) => {
        setError("Failed to load shift types");
      });
  }, []);

  const router = useRouter();
  const pathname = usePathname();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftType) {
      setError("Please select a shift type");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createShift({
        name,
        shiftType,
        startTime,
        endTime,
        punchPolicy: "FIRST_LAST",
        graceInMinutes: graceIn,
        graceOutMinutes: graceOut,
        requiresApprovalForOvertime: requiresOvertimeApproval,
        active,
      });

      // Reset form
      setName("");
      setShiftType("");
      setStartTime("09:00");
      setEndTime("17:00");
      setGraceIn(0);
      setGraceOut(0);
      setRequiresOvertimeApproval(false);
      setActive(true);

      // Notify parent
      onCreated();
    } catch (err) {
      console.error("Error creating shift:", err);
      setError("Failed to create shift. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToShiftTypePage = () => {
    const parts = pathname.split("/").filter(Boolean);
    parts[parts.length - 1] = "shift-type";
    router.push("/" + parts.join("/"));
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      {error && <div style={{ color: "red", marginBottom: "1.25rem" }}>{error}</div>}
      
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Shift Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          
          <label className={s.description}>Shift Type</label>
          <select className={s.select}value={shiftType}onChange={e => setShiftType(e.target.value)} required>
            <option value="" disabled>Select a Shift Type</option>
            {shiftTypes.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          <button type="button" className={s.button} onClick={goToShiftTypePage}>
            Add Shift Type
          </button>

          <label className={s.description}>Start Time</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required/>
          
          <label className={s.description}>End Time</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required/>

          <label className={s.description}>Policy</label>
          <select className={s.select} value={punchPolicy} onChange={e => setPunchPolicy(e.target.value as PunchPolicy)} required>
            <option value="">Policy</option>
            {Object.values(PunchPolicy).map(t => (
              <option key={t} value={t}>
                {t.replace('_', ' ')}
              </option>
            ))}
          </select>
          
          <label className={s.description}>Grace In (min)</label>
          <input type="number" value={graceIn} onChange={e => setGraceIn(Number(e.target.value))} min="0"/>
          
          <label className={s.description}>Grace Out (min)</label>
          <input type="number" value={graceOut} onChange={e => setGraceOut(Number(e.target.value))} min="0"/>
          
          <label className={s.description}>
            <input type="checkbox" checked={requiresOvertimeApproval} onChange={e => setRequiresOvertimeApproval(e.target.checked)} />
            Requires Overtime Approval
          </label>
          
          <label className={s.description}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            Active
          </label>
          
          <button className={s.button} type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Shift"}
          </button>
        </div>
      </div>
    </form>
  );
}