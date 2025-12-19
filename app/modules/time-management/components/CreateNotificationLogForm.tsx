"use client";

import { useState } from "react";
import s from "../page.module.css";
import { createNotification } from '../api/index';
import { EmployeeProfile } from "../../hr/api/hrApi";
import Selections from "./Selections";

interface CreateNotificationLogFormProps {
  onCreated: () => void;
}

/*
export interface CreateNotificationLogDto {
  to: string;
  type: string;
  message?: string;
}
*/

export default function CreateNotificationLogForm({ onCreated }: CreateNotificationLogFormProps) {
  const [to, setTo] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createNotification({
        to,
        type,
        message,
      });

      // this is the default btw :)
      setTo(""); setType(""); setMessage("")
      
      onCreated();
    }
    catch (err) {console.error("Error creating notificationlog:", err);}
    finally {setLoading(false);}
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Employee ID</label>
          <Selections
                      employeeId={employeeId}
                      setEmployeeId={setEmployeeId}
                    />
          
          <label className={s.description}>Notification Type</label>
          <input type="text" value={type} onChange={e => setType(e.target.value)} required />
          
          <label className={s.description}>Message (optional)</label>
          <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
          
          <button className={s.button} disabled={loading}>{loading ? "Adding..." : "Add"}</button>
        </div>
      </div>
    </form>
  );
}