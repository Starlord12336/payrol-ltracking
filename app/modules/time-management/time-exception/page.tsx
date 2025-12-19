"use client";

import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import s from "../page.module.css";
import { deleteTimeException, getAllTimeExceptions } from '../api/index';
import CreateTimeExceptionForm from "../components/CreateTimeExceptionForm";
import TimeExceptionList from "../components/TimeExceptionList";

import { TimeException } from "../types";

export default function TimeExceptionPage() {
  const [timeexceptions, setTimeExceptions] = useState<TimeException[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllTimeExceptions();
      console.log("Fetched timeexceptions:", data); // check API response
      setTimeExceptions(data);
    } catch (err) {
      console.error("Error fetching timeexceptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteTimeException(id);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Time Exceptions</h1>
      <CreateTimeExceptionForm onCreated={load} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <TimeExceptionList timeexceptions={timeexceptions} onDelete={handleDelete} />
      )}
    </div>
  );
}