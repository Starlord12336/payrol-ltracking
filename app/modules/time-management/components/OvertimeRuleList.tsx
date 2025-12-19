"use client";

import { OvertimeRule } from "../types";
import s from "../page.module.css";
import { updateOvertime } from "../api";

interface OvertimeRuleListProps {
  overtimerules: OvertimeRule[];
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string) => void; // To handle status change
}

const getOvertimeRuleId = (r: any) =>
  String(r?.id ?? r?._id ?? r?.overtimeRuleId ?? "");

export default function OvertimeRuleList({
  overtimerules,
  onDelete,
  onToggleStatus,
}: OvertimeRuleListProps) {
  if (!overtimerules.length) return <p>No overtime rules found</p>;

  // Handle toggle status (approved or active status)
  const handleToggleClick = async (id: string, currentActive: boolean) => {
    try {
      await updateOvertime(id, { active: !currentActive }); // Update API to change active status
      if(onToggleStatus)onToggleStatus(id); // Let parent update state after toggling
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className={s.cardcontainer}>
      {overtimerules.map((overtimerule, idx) => {
        const id = getOvertimeRuleId(overtimerule);

        return (
          <div key={id || `overtime-rule-${idx}`} className={s.Card}>
            <h4 className={s.header}>{overtimerule.name}</h4>

            {overtimerule.description && (
              <p className={s.description}>Description: {overtimerule.description}</p>
            )}

            <p className={s.description}>
              Active? {overtimerule.active ? "Yes" : "No"}
            </p>
            <p className={s.description}>
              Approved? {overtimerule.approved ? "Yes" : "No"}
            </p>

            <div className={s.buttonContainer}>
              <button
                className={`${s.button} ${overtimerule.active ? s.deactivateBtn : s.activateBtn}`}
                onClick={() => handleToggleClick(id, overtimerule.active)}
              >
                {overtimerule.active ? "Deactivate" : "Activate"}
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
