"use client";

import { ScheduleRule } from "../types";
import s from "../page.module.css";
import { updateSchedule } from "../api";

interface ScheduleRuleListProps {
  schedulerules: ScheduleRule[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const getRuleId = (r: any) =>
  String(r?.id ?? r?._id ?? r?.scheduleRuleId ?? "");

export default function ScheduleRuleList({
  schedulerules,
  onDelete,
  onToggleStatus,
}: ScheduleRuleListProps) {
  if (!schedulerules.length) return <p>No schedule rules found</p>;

  const handleToggleClick = async (id: string, currentActive: boolean) => {
    try {
      await updateSchedule(id, { active: !currentActive });
      onToggleStatus(id); // 🔥 let parent update state
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className={s.cardcontainer}>
      {schedulerules.map((r, idx) => {
        const id = getRuleId(r);

        return (
          <div key={id || `rule-${idx}`} className={s.Card}>
            <h4 className={s.header}>{r.name}</h4>

            <p className={s.description}>Type: {r.pattern}</p>
            <p className={s.description}>
              Active? {r.active ? "Yes" : "No"}
            </p>

            <div className={s.buttonContainer}>
              <button
                className={`${s.button} ${
                  r.active ? s.deactivateBtn : s.activateBtn
                }`}
                onClick={() => handleToggleClick(id, r.active)}
              >
                {r.active ? "Deactivate" : "Activate"}
              </button>

              <button
                className={`${s.button} ${s.deleteButton}`}
                onClick={() => onDelete(id)}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
