"use client";

import { useEffect, useState } from "react";
import CreateShiftForm from "../components/CreateShiftForm";
import ShiftList from "../components/ShiftList";
import s from "../page.module.css";
import { deleteShift, getAllShifts, getAllShiftsType } from '../api/index';
import { Shift, ShiftType } from "../types";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks";
import { SystemRole } from "@/shared/types";
import EmployeeViewHoliday from "../components/EmployeeViewCalendar";

export default function ShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const [shiftsData, shiftTypesData] = await Promise.all([
        getAllShifts(),
        getAllShiftsType()
      ]);
      setShifts(shiftsData);
      setShiftTypes(shiftTypesData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteShift(id);
    load();
  };

  const router = useRouter();
  const pathname = usePathname();

  const goToShiftAssignmentPage = () => {
    const parts = pathname.split("/").filter(Boolean);
    parts[parts.length - 1] = "shift-assignment";
    router.push("/" + parts.join("/"));
  };

  const userRoles = user?.roles || [];
  const isHrUser =
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE) ||
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);

  const isManager =
    userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_ADMIN);

  return (
    <div className={s.container}>
      <h1 className={s.header}>Shifts</h1>

      <p className={s.description2}>
        Manage company holidays by adding, viewing, and deleting holiday entries.
      </p>
      {isHrUser || isManager ? (
        <>
          <ShiftList shifts={shifts} shiftTypes={shiftTypes} onDelete={handleDelete} />
          <CreateShiftForm onCreated={load} />
        </>
      ) : (
        <>
          <EmployeeViewHoliday defaultView="shifts" />
        </>
      )}
    </div>
  );
}