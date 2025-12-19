"use client";

import { useState } from "react";
import { createHoliday } from '../api/index';
import s from "../page.module.css";
import { HolidayType } from "../types"; // make sure you import your HolidayType

interface CreateHolidayFormProps {
  onCreated: () => void;
}

export default function CreateHolidayForm({ onCreated }: CreateHolidayFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HolidayType | "">(""); // your HolidayType
  const [startDate, setStartDate] = useState(""); // format YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // optional
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createHoliday(
        {
          name,
          type,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
          active,
        }
      );

      // reset form
      setName("");
      setType("");
      setStartDate("");
      setEndDate("");
      setActive(true);

      onCreated();
    } catch (err) {
      console.error("Error creating holiday:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Holiday Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />

          <label className={s.description}>Holiday Type</label>
          <select
            className={s.select}
            value={type}
            onChange={e => setType(e.target.value as HolidayType)}
            required
          >
            <option value="">Select type</option>
            {Object.values(HolidayType).map(t => (
              <option key={t} value={t}>
                {t.replace('_', ' ')}
              </option>
            ))}
          </select>


          <label className={s.description}>Start Date</label>
          <input className={s.select} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />

          <label className={s.description}>End Date</label>
          <input className={s.select} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

          <label className={s.description}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Active
          </label>

          <button className={s.button} disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
}
