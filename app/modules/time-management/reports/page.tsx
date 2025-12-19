"use client";
  import * as XLSX from 'xlsx';
import { useState } from "react";
import s from "../page.module.css";
import {
  getAllAttendanceRecord,
  getAllOvertime,
  getAllTimeExceptions,
} from "../api/index";
import { EmployeeProfile } from "../../hr/api/hrApi";
import Selections from "../components/Selections";
import { TimeExceptionStatus, TimeExceptionType } from "../types";

type ExportFormat = "excel" | "access" | "text";
type ReportType = "attendance" | "lateness" | "overtime";

export default function ReportsPage() {
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [reportType, setReportType] = useState<ReportType>("attendance");
  const [exporting, setExporting] = useState(false);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [employeeId, setEmployeeId] = useState("");
    


const exportReport = async () => {
  try {
    setExporting(true);

    let data: any[] = [];

    if (reportType === "attendance") {
      data = await getAllAttendanceRecord();
    } else if (reportType === "lateness") {
      const attendance = await getAllAttendanceRecord();
      const exceptions = await getAllTimeExceptions();

      data = exceptions
        .filter(e => e.type === TimeExceptionType.LATE)
        .filter(e => e.employeeId === employeeId || !employeeId)
        .map(e => {
          const record = attendance.find(
            r => r.id === e.attendanceRecordId
          );

          return {
            employeeId: e.employeeId,
            attendanceRecordId: e.attendanceRecordId,
            status: e.status,
            reason: e.reason ?? "",
            punches: JSON.stringify((record?.punches ?? []).map((p: any) => ({ 
              time: p.time ? new Date(p.time).toISOString() : null, 
              type: p.type 
            }))),
            totalWorkMinutes: record?.totalWorkMinutes ?? 0,
            hasMissedPunch: record?.hasMissedPunch ? "true" : "false",
            exceptionIds: record?.exceptionIds ? (Array.isArray(record.exceptionIds) ? record.exceptionIds.join(';') : String(record.exceptionIds)) : "",
            finalisedForPayroll: record?.finalisedForPayroll ? "true" : "false",
          };
        });
    } else if (reportType === "overtime") {
      data = await getAllOvertime();
    }

    // Filter by employee if selected
    if (employeeId) {
      data = data.filter((row) => row.employeeId === employeeId);
    }

    if (!data.length) {
      alert("No data to export for selected employee");
      return;
    }

    // Transform data for better readability
    let exportData = data;

    if (reportType === 'attendance') {
      exportData = (data as any[]).map((r: any) => ({
        id: r.id,
        employeeId: r.employeeId,
        punches: JSON.stringify((r.punches ?? []).map((p: any) => ({
          time: p.time ? new Date(p.time).toISOString() : null,
          type: p.type,
        }))),
        totalWorkMinutes: r.totalWorkMinutes ?? 0,
        hasMissedPunch: r.hasMissedPunch ? 'true' : 'false',
        exceptionIds: Array.isArray(r.exceptionIds) ? r.exceptionIds.join(';') : (r.exceptionIds ?? ''),
        finalisedForPayroll: r.finalisedForPayroll ? 'true' : 'false',
      }));
    }

    // Handle different export formats
    switch (format) {
      case "excel":
        // Generate real Excel file (.xlsx)
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, `${reportType}_report`);
        XLSX.writeFile(wb, `${reportType}_report.xlsx`);
        break;

      case "access":
        // Generate CSV for Access import
        const accessHeaders = Object.keys(exportData[0]);
        const accessRows = (exportData as any[]).map((row) =>
          accessHeaders.map((h) => {
            const value = row[h] ?? "";
            // For Access CSV, ensure proper quoting and escaping
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return `"${value}"`;
          }).join(",")
        );
        
        const accessCSV = [accessHeaders.join(","), ...accessRows].join("\n");
        const accessBlob = new Blob([accessCSV], { type: "text/csv;charset=utf-8;" });
        const accessUrl = window.URL.createObjectURL(accessBlob);
        
        const accessLink = document.createElement("a");
        accessLink.href = accessUrl;
        accessLink.download = `${reportType}_report_for_access.csv`;
        document.body.appendChild(accessLink);
        accessLink.click();
        accessLink.remove();
        window.URL.revokeObjectURL(accessUrl);
        break;

      case "text":
        // Generate formatted text file (.txt)
        const textContent = exportData.map((row: any, index: number) => {
          const entries = Object.entries(row);
          const recordText = entries.map(([key, value]) => {
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());
            return `${formattedKey}: ${value}`;
          }).join("\n");
          
          return `RECORD ${index + 1}\n${recordText}\n${"=".repeat(50)}`;
        }).join("\n\n");
        
        const headerText = `${reportType.toUpperCase()} REPORT\nGenerated: ${new Date().toLocaleString()}\n${"=".repeat(50)}\n\n`;
        const fullText = headerText + textContent;
        
        const textBlob = new Blob([fullText], { type: "text/plain;charset=utf-8;" });
        const textUrl = window.URL.createObjectURL(textBlob);
        
        const textLink = document.createElement("a");
        textLink.href = textUrl;
        textLink.download = `${reportType}_report.txt`;
        document.body.appendChild(textLink);
        textLink.click();
        textLink.remove();
        window.URL.revokeObjectURL(textUrl);
        break;

      default:
        // Fallback to CSV
        const headers = Object.keys(exportData[0]);
        const rows = (exportData as any[]).map((row) =>
          headers.map((h) => `"${row[h] ?? ""}"`).join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportType}_report.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }
  } finally {
    setExporting(false);
  }
};


  return (
    <div className={s.container}>
      <h1 className={s.header}>Generate Reports</h1>

      {/* Report type */}
      <Selections employeeId={employeeId} setEmployeeId={setEmployeeId} />
      <div className={s.buttonCollection}>
        <button className={`${s.segmentButton} ${ reportType === "attendance" ? s.active : "" }`}
          onClick={() => setReportType("attendance")}>
          Attendance
        </button>
        <button
          className={`${s.segmentButton} ${ reportType === "lateness" ? s.active : "" }`} onClick={() => setReportType("lateness")}>
          Lateness
        </button>
        <button className={`${s.segmentButton} ${ reportType === "overtime" ? s.active : "" }`} onClick={() => setReportType("overtime")}>
          Overtime
        </button>
      </div>

      <div className={s.buttonCollection}>
        <button className={`${s.segmentButton} ${ format === "excel" ? s.active : "" }`} onClick={() => setFormat("excel")}>
          Excel
        </button>
        <button className={`${s.segmentButton} ${ format === "access" ? s.active : "" }`} onClick={() => setFormat("access")} >
          Access
        </button>

        <button
          className={`${s.segmentButton} ${ format === "text" ? s.active : ""}`} onClick={() => setFormat("text")}>
          Text
        </button>
      </div>

      <button className={s.button} onClick={exportReport} disabled={exporting}>
        {exporting ? "Exporting..." : "Export Report"}
      </button>
    </div>
  );
}