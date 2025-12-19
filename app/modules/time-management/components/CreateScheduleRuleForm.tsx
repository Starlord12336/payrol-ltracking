"use client";

import { useMemo, useState } from "react";
import s from "../page.module.css";
import { createSchedule } from "../api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysToLabel(days: number[]) {
  if (!days.length) return "";

  const sorted = [...days].sort((a, b) => a - b).join(",");
  if (sorted === "1,2,3,4,5") return "Mon–Fri";
  if (sorted === "0,6") return "Weekend";
  if (sorted === "0,1,2,3,4,5,6") return "Sun–Sat";

  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAYS[d])
    .join(", ");
}

/* ===================== TEMPLATES ===================== */
const templates = {
  MON_FRI: {
    name: "Standard Week (Mon–Fri)",
    days: [1, 2, 3, 4, 5],
  },
  SUN_THU: {
    name: "Standard Week (Sun–Thu)",
    days: [0, 1, 2, 3, 4],
  },
  WEEKEND_ONLY: {
    name: "Weekend Only",
    days: [0, 6],
  },
  FOUR_ON_THREE_OFF: {
    name: "4 Days On / 3 Days Off",
  },
} as const;

type TemplateKey = keyof typeof templates;

export default function CreateScheduleRuleForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateKey | "">("");

  const label = useMemo(() => daysToLabel(days), [days]);

  const applyTemplate = (key: TemplateKey) => {
  const t = templates[key];
  setName(t.name);

  if ("days" in t) {
    setDays([...t.days]);
  }
};


  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !days.length) return;

    setLoading(true);
    try {
      await createSchedule({
        name: name.trim(),
        pattern: label,
        days,
        active,
      });
      setName("");
      setDays([1, 2, 3, 4, 5]);
      setSelectedTemplate("");
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Schedule Template</label>
          <select
            className={s.select}
            value={selectedTemplate}
            onChange={(e) => {
              const key = e.target.value as TemplateKey;
              setSelectedTemplate(key);
              applyTemplate(key);
            }}
          >
            <option value="">Custom</option>
            {Object.entries(templates).map(([key, t]) => (
              <option key={key} value={key}>
                {t.name}
              </option>
            ))}
          </select>

          <label className={s.description}>Schedule Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className={s.description}>Weekdays</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {DAYS.map((d, i) => (
              <label key={i}>
                <input
                  type="checkbox"
                  checked={days.includes(i)}
                  onChange={() => toggleDay(i)}
                />
                {d}
              </label>
            ))}
          </div>

          <p className={s.description}>
            <strong>Auto:</strong> {label}
          </p>

          <label className={s.description}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>

          <button className={s.button} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
