"use client";

import { useEffect, useState } from "react";
import s from "../page.module.css";
import { AttendanceCorrectionRequest } from "../types";
import { deleteAttendanceCorrection, getAllAttendanceCorrections } from '../api/index';
import CreateAttendanceCorrectionForm from "../components/CreateAttendanceCorrectionForm";
import AttendanceCorrectionRequestList from "../components/AttendanceCorrectionList";
import { AttendanceCorrectionManagementForHRManager } from "../components/AttendanceCorrectionManagement";
import { useAuth } from "@/shared/hooks";
import { SystemRole } from "@/shared/types";
import AskForCorrection from "../components/AskForCorrection";

export default function AttendanceCorrectionRequestPage() {
  const [attendancecorrectionrequests, setAttendanceCorrectionRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const roles = user?.roles;
  const isAuthorized = roles?.includes(SystemRole.SYSTEM_ADMIN) || roles?.includes(SystemRole.HR_ADMIN);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllAttendanceCorrections();
      console.log("Fetched data:", data); // Check for duplicates here
      setAttendanceCorrectionRequests(data);
    } catch (err) {
      console.error("Error fetching attendancecorrectionrequests:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, [user]); // Make sure `user` is properly updated  

  const handleDelete = async (id: string) => {
    await deleteAttendanceCorrection(id);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Attendance Correction Requests</h1>
      <p className={s.description}>Had something that caused you to be late/absent? No worries</p>
      <p className={s.description}>(Ngl I would worry since the code was not written by professionals but yk)</p>
      {isAuthorized ? (
        <>
          <AttendanceCorrectionRequestList attendancecorrectionrequests={attendancecorrectionrequests} onDelete={handleDelete} />
          <CreateAttendanceCorrectionForm onCreated={load} />
          <AttendanceCorrectionManagementForHRManager />
        </>
      ) : (
        <>
          <AskForCorrection onCreated={load} />
        </>
      )}
    </div>
  );
}
