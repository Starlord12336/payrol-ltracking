"use client";

import { useEffect, useState } from "react";
import ShiftAssignmentList from "../../components/ShiftAssignmentList";
import s from "../../page.module.css";

import {
  getAllShiftAssignmentsByDepartment,
  getAllShiftAssignmentsByEmployee,
  getAllShiftAssignmentsByPosition,
  deleteShiftAssignmentByDepartment,
  deleteShiftAssignmentByEmployee,
  deleteShiftAssignmentByPosition,
  getAlmostExpiredShifts,
  updateShiftAssignmentByDepartment,
  updateShiftAssignmentByEmployee,
  updateShiftAssignmentByPosition,
  getAllShifts,
} from "../../api";

import {
  ShiftAssignmentWithType,
  AssignmentType,
  ShiftAssignment,
} from "../../types";

import CreateShiftAssignmentPositionForm from "../../components/CreateShiftAssignmentPositionForm";
import { EmployeeProfile, getAllEmployees } from "../../../hr/api/hrApi";

export default function ShiftAssignmentPage() {
  const [shiftassignments, setShiftAssignments] = useState<ShiftAssignmentWithType[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const [byDept, byEmp, byPos, employeeData, shiftsData] = await Promise.all([
        getAllShiftAssignmentsByDepartment(),
        getAllShiftAssignmentsByEmployee(),
        getAllShiftAssignmentsByPosition(),
        getAllEmployees(),
        getAllShifts(),
      ]);

      setEmployees(employeeData);
      setShifts(shiftsData);

      // Combine all assignments with their type
      const combined: ShiftAssignmentWithType[] = [
        ...byDept.map(sa => ({ ...sa, type: 1 as AssignmentType })), // 1 = DEPARTMENT
        ...byEmp.map(sa => ({ ...sa, type: 2 as AssignmentType })), // 2 = EMPLOYEE
        ...byPos.map(sa => ({ ...sa, type: 3 as AssignmentType })), // 3 = POSITION
      ];

      setShiftAssignments(combined);

      // Trigger notification check (fire and forget / or await if needed)
      // We don't necessarily need to show the result, but calling it triggers the email/notifications
      getAlmostExpiredShifts().catch(err => console.error("Expiry check failed", err));

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRenew = async (id: string, type: AssignmentType, newEndDate: string) => {
    try {
      const payload = { endDate: newEndDate };
      if (type === 1) await updateShiftAssignmentByDepartment(id, payload);
      if (type === 2) await updateShiftAssignmentByEmployee(id, payload);
      if (type === 3) await updateShiftAssignmentByPosition(id, payload);

      await load();
    } catch (err) {
      console.error("Error renewing shift assignment:", err);
    }
  };

  const handleDelete = async (id: string, type: AssignmentType) => {
    try {
      if (type === 1) await deleteShiftAssignmentByDepartment(id);
      if (type === 2) await deleteShiftAssignmentByEmployee(id);
      if (type === 3) await deleteShiftAssignmentByPosition(id);

      await load();
    } catch (err) {
      console.error("Error deleting shift assignment:", err);
    }
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Shift Assignments</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ShiftAssignmentList shiftassignments={shiftassignments} employees={employees} shifts={shifts} onDelete={handleDelete} />
          <CreateShiftAssignmentPositionForm onCreated={load} />
        </>
      )}
    </div>
  );
}
