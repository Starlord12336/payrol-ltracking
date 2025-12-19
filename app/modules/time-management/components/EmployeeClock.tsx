"use client";  // This tells Next.js that this component is a Client Component

import { useEffect, useState } from "react";
import { useAuth } from "@/shared/hooks";
import { useRouter } from "next/navigation";
import { addPunchToAttendance, createAttendanceRecord, getAllAttendanceRecord, getAllHolidays, getShiftAssignmentsByDepartment, getShiftAssignmentsByEmployee, getShiftAssignmentsByPosition } from "../api/index";
import s from "../page.module.css";
import { PunchType } from "../types";
import * as XLSX from "xlsx";
import { profileApi } from "../../employee-profile/api/profileApi";
import styles from "./EmployeeClock.module.css";

export default function EmployeeClock() {
  const { user } = useAuth();
  const [punchType, setPunchType] = useState<PunchType>(PunchType.IN);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  // Live clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle manual punch for clocking in/out 
  const handlePunch = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!user?.userid) {
        router.push("/login");
        return;
      }

      const today = new Date();

      // Helper: strip time portion for date-only comparison
      const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const todayOnly = toDateOnly(today).getTime();

      try {
        const [
          profile,
          holidays
        ] = await Promise.all([
          profileApi.getMyProfile(),
          getAllHolidays()
        ]);

        const [
          employeeAssignments,
          departmentAssignments,
          positionAssignments
        ] = await Promise.all([
          getShiftAssignmentsByEmployee(user.userid),
          profile.primaryDepartmentId ? getShiftAssignmentsByDepartment(profile.primaryDepartmentId) : Promise.resolve([]),
          profile.primaryPositionId ? getShiftAssignmentsByPosition(profile.primaryPositionId) : Promise.resolve([])
        ]);

        const currentUserProfile = profile;

        // Helper to compare IDs safely
        const getIdsMatch = (id1: any, id2: any) => {
          if (!id1 || !id2) return false;
          const s1 = (typeof id1 === 'object' && id1?._id) ? id1._id : id1;
          const s2 = (typeof id2 === 'object' && id2?._id) ? id2._id : id2;
          return String(s1) === String(s2);
        };

        const isAssignmentActive = (a: any) => {
          if (!a || (a.status !== 'APPROVED' && a.status !== 'PENDING')) return false;
          const start = toDateOnly(new Date(a.startDate)).getTime();
          const end = a.endDate ? toDateOnly(new Date(a.endDate)).getTime() : new Date(8640000000000000).getTime();
          return todayOnly >= start && todayOnly <= end;
        };

        let activeAssignment = null;

        // 1. Direct Employee Assignment
        activeAssignment = employeeAssignments.find((a: any) =>
          getIdsMatch(a.employeeId, user.userid) && isAssignmentActive(a)
        );

        // 2. Department Assignment
        if (!activeAssignment && currentUserProfile?.primaryDepartmentId) {
          activeAssignment = departmentAssignments.find((a: any) =>
            getIdsMatch(a.departmentId, currentUserProfile.primaryDepartmentId) && isAssignmentActive(a)
          );
        }

        // 3. Position Assignment
        if (!activeAssignment && currentUserProfile?.primaryPositionId) {
          activeAssignment = positionAssignments.find((a: any) =>
            getIdsMatch(a.positionId, currentUserProfile.primaryPositionId) && isAssignmentActive(a)
          );
        }

        if (!activeAssignment) {
          setMessage("No shift assignment found for today; contact your manager if this is an error.");
          setLoading(false);
          return;
        }

        // Check Holidays
        const isHoliday = holidays.some((h: any) => {
          if (!h || !h.active) return false;
          const start = toDateOnly(new Date(h.startDate)).getTime();
          const end = h.endDate ? toDateOnly(new Date(h.endDate)).getTime() : toDateOnly(new Date(h.startDate)).getTime();
          return todayOnly >= start && todayOnly <= end;
        });

        if (isHoliday) {
          setMessage("It is a holiday... take a rest ya basha");
          setLoading(false);
          return;
        }

      } catch (err: any) {
        console.error('Failed to validate shift/holiday:', err);
        setMessage("Error validating information: " + (err.message || "Unknown error"));
        setLoading(false);
        return;
      }

      const all = await getAllAttendanceRecord();
      const todayStr = today.toDateString();

      const existingRecord = all.find(record =>
        record.employeeId === user.userid &&
        record.punches?.some(p =>
          new Date(p.time).toDateString() === todayStr
        )
      );


      const punch = {
        type: punchType,
        time: new Date(),
      };

      if (existingRecord) {
        // PATCH :D
        await addPunchToAttendance(existingRecord.id, punch);
        setMessage(`Punch ${punchType} recorded successfully at ${new Date().toLocaleTimeString()}`);
      } else {
        // CREATE new record
        await createAttendanceRecord({
          employeeId: user.userid,
          punches: [punch],
          finalisedForPayroll: true,
        });
        setMessage(`Attendance record created with ${punchType} punch at ${new Date().toLocaleTimeString()}`);
      }

      setPunchType(punchType === PunchType.IN ? PunchType.OUT : PunchType.IN);

    } catch (error: any) {
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };


  // Handle file upload for bulk import from Excel 
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportResults(null);
    setMessage("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      // Prepare import results and error tracking 
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNum = i + 2;
        try {
          const punchTypeStr = row.punchType?.toString().toUpperCase() || row.PunchType?.toString().toUpperCase();

          if (!punchTypeStr || (punchTypeStr !== "IN" && punchTypeStr !== "OUT")) {
            errors.push(`Row ${rowNum}: Invalid punch type (must be IN or OUT)`);
            failedCount++;
            continue;
          }

          const time =
            row.timestamp
              ? new Date(row.timestamp)
              : row.Time
                ? new Date(row.Time)
                : new Date();

          const punches = [
            {
              type: punchTypeStr as PunchType,
              time,
            },
          ];


          if (!user?.userid) {
            router.push("/login");
            throw new Error("User ID not found");
          }

          await createAttendanceRecord({
            employeeId: user?.userid,
            punches,
            finalisedForPayroll: true,
          });

          successCount++;
        } catch (error: any) {
          failedCount++;
          const errorMsg = error.response?.data?.message || error.message || "Failed to process";
          errors.push(`Row ${rowNum}: ${errorMsg}`);
        }
      }

      setImportResults({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10), // Show first 10 errors 
      });

      // Display results based on the import outcome 
      if (successCount > 0) {
        setMessage(`Import completed: ${successCount} records processed successfully`);
      } else if (failedCount > 0) {
        setMessage(`Import failed: All ${failedCount} records had errors`);
      }
    } catch (err: any) {
      console.error("Error importing file:", err);
      setMessage(`Failed to import file: ${err.message}`);
    } finally {
      setImportLoading(false);
      event.target.value = ""; // Reset file input after upload 
    }
  };

  // Download a template for the Excel file 
  const downloadTemplate = () => {
    const template = [
      { punchType: "IN", timestamp: new Date().toISOString() },
      { punchType: "OUT", timestamp: new Date().toISOString() },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance_template.xlsx");
  };

  return (
    <div className={styles.clockCard}>
      <div className={styles.statusBadge}>
        {punchType === PunchType.IN ? "Currently Off Shift" : "Shift In Progress"}
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '5px 0 0 0' }}>
          {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <button
        className={`${styles.punchCircle} ${punchType === PunchType.OUT ? styles.punchOut : ''}`}
        onClick={handlePunch}
        disabled={loading}
      >
        <span style={{ fontSize: '2.5rem' }}>{punchType === PunchType.IN ? "📥" : "📤"}</span>
        <span>{loading ? "..." : `Clock ${punchType}`}</span>
      </button>

      {message && (
        <div className={`${styles.message} ${message.includes('success') || message.includes('recorded') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <div className={styles.importSection}>
        <h3 className={styles.importTitle}>Bulk Management</h3>
        <div className={styles.importGrid}>
          <button onClick={downloadTemplate} className={styles.actionBtn}>
            📄 Download Template
          </button>

          <label htmlFor="excel-upload" className={`${styles.actionBtn} ${styles.primary}`}>
            {importLoading ? '...' : '📤 Upload'}
          </label>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={importLoading}
            style={{ display: 'none' }}
          />
        </div>

        {importResults && (
          <div className={styles.results}>
            <p style={{ color: '#10b981', margin: '0 0 5px 0' }}>✓ Success: {importResults.success}</p>
            <p style={{ color: '#ef4444', margin: 0 }}>✗ Failed: {importResults.failed}</p>
            {importResults.errors.length > 0 && (
              <ul style={{ fontSize: '12px', opacity: 0.7, paddingLeft: '15px', marginTop: '10px' }}>
                {importResults.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
