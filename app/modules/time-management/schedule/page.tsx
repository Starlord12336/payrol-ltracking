"use client";

import { useEffect, useState } from "react";
import CreateScheduleRuleForm from "../components/CreateScheduleRuleForm";
import ScheduleRuleList from "../components/ScheduleRuleList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";
import { ScheduleRule } from "../types";
import { deleteSchedule, getAllSchedule } from '../api/index';

export default function ScheduleRulePage() {
  const [schedulerules, setScheduleRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllSchedule();
      setScheduleRules(data);
    } catch (err) {
      console.error("Error fetching schedulerules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteSchedule(id);
    load();
  };

  const handleToggleStatus = (id: string) => {
  setScheduleRules((prev) =>
    prev.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r
    )
  );
};

  return (
    <div className={s.container}>
      <h1 className={s.header}>Schedule Rules</h1>
      <p className={s.description}>Choose what days are on which are not</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
      <ScheduleRuleList
        schedulerules={schedulerules}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />        </>
      )}
          <CreateScheduleRuleForm onCreated={load} />
    </div>
  );
}
