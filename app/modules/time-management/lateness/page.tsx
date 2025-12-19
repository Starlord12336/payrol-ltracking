"use client";

import { useEffect, useState } from "react";
import LatenessRuleList from "../components/LatenessRuleList";
import s from "../../../page.module.css";
import { LatenessRule } from "../types";
import CreateLatenessRuleForm from "../components/CreateLatenessRuleForm";
import { deleteLatenessRule, getAllLatenessRule } from '../api/index';
import { usePathname, useRouter } from "next/navigation";
import { SystemRole } from "@/shared/types";
import { useAuth } from "@/shared/hooks";
import EmployeeViewLateness from "../components/EmployeeViewLateness";

export default function LatenessRulePage() {
  const [latenessrules, setLatenessRules] = useState<LatenessRule[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllLatenessRule();
      setLatenessRules(data);
    } catch (err) {
      console.error("Error fetching latenessrules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteLatenessRule(id);
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
      <h1 className={s.header}>Lateness Rules</h1>

      {user?.roles.includes(SystemRole.HR_ADMIN) || user?.roles.includes(SystemRole.SYSTEM_ADMIN) ? (
        <>
        <p className={s.description2}>
        Is s/he late? Well, you decide... or something
      </p>
          <LatenessRuleList latenessrules={latenessrules} onDelete={handleDelete} />
          <CreateLatenessRuleForm onCreated={load} />
        </>
      ) : (
        <>
          <EmployeeViewLateness latenessrules={latenessrules} onDelete={handleDelete} />
        </>
      )}
  </div>);
}
