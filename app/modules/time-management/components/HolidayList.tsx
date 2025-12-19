"use client";

import { useEffect, useState } from "react";
import { Holiday } from "../types";
import s from "../page.module.css";
import { getAllHolidays, deleteHoliday } from "../api/index";

export default function HolidayList() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllHolidays();
      setHolidays(data);
    } catch (err) {
      console.error("Failed to load holidays", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!id) return;
    await deleteHoliday(id);
    load();
  };

  if (loading) return <p>Loading holidays...</p>;
  if (!holidays.length) return <p>No holidays found</p>;

  return (
    <div className={s.cardContainer}>
      {holidays.map((holiday) => (
        <div key={holiday.id} className={s.Card}>
          <h4 className={s.header}>{holiday.name}</h4>

          <p className={s.description}>
            Starts on: {new Date(holiday.startDate).toLocaleDateString()}
          </p>

          <p className={s.description}>
            Ends on:{" "}
            {holiday.endDate
              ? new Date(holiday.endDate).toLocaleDateString()
              : "N/A"}
          </p>

          <p className={s.description}>Type: {holiday.type}</p>

          <p className={s.description}>
            Active? {holiday.active ? "Yes" : "No"}
          </p>

          <button
            className={s.button}
            onClick={() => handleDelete(holiday.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
