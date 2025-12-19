"use client";

import { useEffect, useState } from "react";
import CreateOvertimeRuleForm from "../components/CreateOvertimeRuleForm";
import OvertimeRuleList from "../components/OvertimeRuleList";
import s from "../../../page.module.css";
import { OvertimeRule } from "../types";
import { deleteOvertime, getOvertime } from '../api/index';
import { usePathname, useRouter } from "next/navigation";

export default function OvertimeRulePage() {
  const [overtimerules, setOvertimeRules] = useState<OvertimeRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getOvertime();
      setOvertimeRules(data);
    } catch (err) {
      console.error("Error fetching overtimerules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteOvertime(id);
    load();
  };

  const router = useRouter();
  const pathname = usePathname();

  const gotoReportsPage = () => {
    const parts = pathname.split("/").filter(Boolean);
    parts[parts.length - 1] = "reports";
    router.push("/" + parts.join("/"));
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>OvertimeRules</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <OvertimeRuleList overtimerules={overtimerules} onDelete={handleDelete} />
          <CreateOvertimeRuleForm onCreated={load} />
        </>
      )}
      <button type="button"className={s.buttonDark}onClick={gotoReportsPage}>
        Go to Reports Page
      </button>
    </div>
  );
}
