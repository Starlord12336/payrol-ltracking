"use client";

import { useState } from "react";
import { createShiftType } from '../api/index';
import s from "../page.module.css";
import { useRouter, usePathname } from "next/navigation";

interface CreateShiftTypeFormProps {
  onCreated: () => void;
}

export default function CreateShiftTypeForm({ onCreated }: CreateShiftTypeFormProps) {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createShiftType({
        name,
        active,
      });

      // this is the default btw :)
      setName(""); setActive(true);

      onCreated();
    }
    catch (err) { console.error("Error creating shifttype:", err); }
    finally { setLoading(false); }
  };

  const router = useRouter();
  const pathname = usePathname();

  const goToShiftPage = () => {
    const parts = pathname.split("/").filter(Boolean);
    parts[parts.length - 1] = "shifts";
    router.push("/" + parts.join("/"));
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.container}>
        <div className={s.field}>

          <label className={s.description}>ShiftType Name  </label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          <label className={s.description}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />Active</label>
          <button className={s.button} disabled={loading}>{loading ? "Adding..." : "Add"}</button>
          <button
            type="button"
            className={s.button}
            onClick={goToShiftPage}
          >
            Add Shift Type
          </button>

        </div>
      </div>
    </form>
  );
}