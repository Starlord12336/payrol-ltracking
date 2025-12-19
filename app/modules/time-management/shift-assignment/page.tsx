"use client";

import { useEffect, useState } from "react";
import ShiftAssignmentList from "../components/ShiftAssignmentList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";

import {
  getAllShiftAssignmentsByDepartment,
  getAllShiftAssignmentsByEmployee,
  getAllShiftAssignmentsByPosition,
  deleteShiftAssignmentByDepartment,
  deleteShiftAssignmentByEmployee,
  deleteShiftAssignmentByPosition,
  updateShiftAssignmentByPosition,
  updateShiftAssignmentByEmployee,
  updateShiftAssignmentByDepartment,
} from "../api";

import {
  ShiftAssignmentWithType,
  AssignmentType,
  ShiftAssignment,
} from "../types";

import CreateShiftAssignmentDepartmentForm from "../components/CreateShiftAssignmentDepartmentForm";
import CreateShiftAssignmentEmployeeForm from "../components/CreateShiftAssignmentEmployeeForm";
import CreateShiftAssignmentPositionForm from "../components/CreateShiftAssignmentPositionForm";
import { Button } from "@/shared/components";
import { usePathname, useRouter } from "next/navigation";

export default function ShiftAssignmentPage() {
  const [shiftassignments, setShiftAssignments] = useState<ShiftAssignmentWithType[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const [byDept, byEmp, byPos] = await Promise.all([
        getAllShiftAssignmentsByDepartment(),
        getAllShiftAssignmentsByEmployee(),
        getAllShiftAssignmentsByPosition(),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  const router = useRouter();
  const pathname = usePathname();

  const goToDepartmentPage = () => {
    const newPath = pathname.endsWith("/")
      ? pathname + "department"
      : pathname + "/department";

    router.push(newPath);
  };

  const gotoPositionPage = () => {
    const newPath = pathname.endsWith("/")
      ? pathname + "position"
      : pathname + "/position";

    router.push(newPath);
  };

  const goToEmployeePage = () => {
    const newPath = pathname.endsWith("/")
      ? pathname + "employee"
      : pathname + "/employee";

    router.push(newPath);
  };


  const handleRenewAssignment = async (id: string, type: AssignmentType, newEndDate: Date) => {
    try {
      // Format the date for the API
      const formattedDate = newEndDate.toISOString().split('T')[0]; // YYYY-MM-DD

      // Prepare payload - adjust based on what your backend expects
      const payload = {
        endDate: formattedDate,
        // Add other fields if needed
      };

      let result;

      // Call the appropriate update function based on type
      if (type === 1) {
        result = await updateShiftAssignmentByDepartment(id, payload);
      } else if (type === 2) {
        result = await updateShiftAssignmentByEmployee(id, payload);
      } else if (type === 3) {
        result = await updateShiftAssignmentByPosition(id, payload);
      } else {
        throw new Error(`Unknown assignment type: ${type}`);
      }

      if (result) {
        // Update local state
        setShiftAssignments(prev =>
          prev.map(sa =>
            sa.id === id
              ? {
                ...sa,
                endDate: result.endDate || formattedDate, // Use result from API
                status: result.status || sa.status // Update status if needed
              }
              : sa
          )
        );
        alert('Assignment renewed successfully!');
      } else {
        throw new Error('Update returned null');
      }

    } catch (error) {
      console.error('Renew failed:', error);
      alert('Failed to renew assignment. Please try again.');
    }
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Shift Assignments</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <button className={s.button} onClick={() => goToDepartmentPage()}>Assign by Department</button>
          <button className={s.button} onClick={() => goToEmployeePage()}>Assign by Employee</button>
          <button className={s.button} onClick={() => gotoPositionPage()}>Assign by Position</button>
        </>
      )}
    </div>
  );
}
