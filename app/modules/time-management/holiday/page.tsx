"use client";

import { useEffect, useState, useCallback } from "react";
import s from "../page.module.css";
import { deleteHoliday, getAllHolidays } from "../api/index";
import CreateHolidayForm from "../components/CreateHolidayForm";
import HolidayList from "../components/HolidayList";
import { Holiday } from "../types";
import { SystemRole } from "@/shared/types";
import { useAuth } from "@/shared/hooks";
import EmployeeViewHoliday from "../components/EmployeeViewCalendar";

export default function HolidayPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const roles = user?.roles;
  const isAuthorized = roles?.includes(SystemRole.SYSTEM_ADMIN) || roles?.includes(SystemRole.HR_ADMIN);


  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllHolidays();
      setHolidays(data);
    } catch (err) {
      console.error("Error fetching holidays:", err);
      setError("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (mounted) {
        await load();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [load]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!id) return;

      try {
        await deleteHoliday(id);
        await load();
      } catch (err) {
        console.error("Failed to delete holiday:", err);
        setError("Failed to delete holiday");
      }
    },
    [load]
  );

  return (
    <div className={s.container}>
      <h1 className={s.header}>Holidays</h1>

      <p className={s.description2}>
        Manage company holidays by adding, viewing, and deleting holiday entries.
      </p>
      {isAuthorized ? (
        <>
          <HolidayList />
          <CreateHolidayForm onCreated={load} />
        </>
      ) : (
        <>
          <EmployeeViewHoliday defaultView="holidays" />
        </>
      )}
    </div>
  );
}
