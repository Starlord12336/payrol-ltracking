"use client";

import { useState } from "react";
import { createLatenessRule } from '../api/index';
import s from "../../../page.module.css";

interface CreateLatenessRuleFormProps { onCreated: () => void; }

export default function CreateLatenessRuleForm({ onCreated }: CreateLatenessRuleFormProps) {
  const [name, setName] = useState(""),
  [description, setDescription] = useState(""),
  [gracePeriod, setGracePeriod] = useState(0),
  [deduction, setDeduction] = useState(0),
  [active, setActive] = useState(true),
  [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createLatenessRule({ name, description: description || undefined, gracePeriodMinutes: gracePeriod || undefined, deductionForEachMinute: deduction || undefined, active });
      setName(""); setDescription(""); setGracePeriod(0); setDeduction(0); setActive(true);
      onCreated();
    } catch (err) { console.error("Error creating shift:", err); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          <label className={s.description}>Description (optional)</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
          <label className={s.description}>Grace Period (min, optional)</label>
          <input type="number" value={gracePeriod} onChange={e => setGracePeriod(Number(e.target.value))} />
          <label className={s.description}>Deduction per Minute (optional)</label>
          <input type="number" value={deduction} onChange={e => setDeduction(Number(e.target.value))} />
          <label className={s.description}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />Active
          </label>
          <button className={s.buttonDark} disabled={loading}>{loading ? "Adding..." : "Add"}</button>
        </div>
      </div>
    </form>
  );
}
