"use client";

import { Shift, ShiftType } from "../types";
import s from "../page.module.css";

interface ShiftListProps {
  shifts: Shift[];
  shiftTypes: ShiftType[];
  onDelete: (id: string) => void | Promise<void>;
}

export default function ShiftList({
  shifts,
  shiftTypes,
  onDelete,
}: ShiftListProps) {
  if (!shifts.length) {
    return <p>No shifts found</p>;
  }

  return (
    <div className={s.cardContainer}>
      {shifts.map((shift, index) => {
        const shiftType = shiftTypes.find(
          (t) =>
            typeof shift.shiftType === "string"
              ? t.id === shift.shiftType
              : t.id === shift.shiftType?.id
        );

        return (
          <div
            key={shift.id || shift.name || `shift-${index}`}
            className={s.Card}
          >
            <h4 className={s.ctaTitle}>{shift.name}</h4>

            <p className={s.description}>
              Type: {shiftType?.name ?? "Unknown"}
            </p>

            <p className={s.description}>
              Active? {shift.active ? "Yes" : "No"}
            </p>

            <p className={s.description}>
              Start Time: {shift.startTime}
            </p>

            <p className={s.description}>
              End Time: {shift.endTime}
            </p>

            <p className={s.description}>
              Grace In: {shift.graceInMinutes} minutes
            </p>

            <p className={s.description}>
              Grace Out: {shift.graceOutMinutes} minutes
            </p>

            <p className={s.description}>
              Requires Overtime Approval?{" "}
              {shift.requiresApprovalForOvertime ? "Yes" : "No"}
            </p>

            <p className={s.description}>
              Punch Policy: {shift.punchPolicy}
            </p>

            <button
              className={s.button}
              onClick={() => onDelete(shift.id)}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
