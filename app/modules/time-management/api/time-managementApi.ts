/*import axios from 'axios';

const BASE_URL =
  (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") +
  "/time-management";

// ============================================================
// Shift
// ============================================================

  export const getAllShifts = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/shifts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getShift = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/shifts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createShift = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/shifts`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateShift = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/shifts/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteShift = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/shifts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// Shift Type
// ============================================================

  export const getAllShiftsType = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/shift-type`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getShiftType = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/shift-type/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createShiftType = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/shift-type`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateShiftType = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/shift-type/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteShiftType = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/shift-type/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// Attendance Correction
// ============================================================

export const getAllAttendanceCorrections = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/attendanceCorrection`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getAttendanceCorrection = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/attendanceCorrection/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createAttendanceCorrection = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/attendanceCorrection`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateAttendanceCorrection = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/attendanceCorrection/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteAttendanceCorrection = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/attendanceCorrection/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// Attendance Record
// ============================================================

export const getAllAttendanceRecord = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/attendance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getAttendanceRecord = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/attendance/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createAttendanceRecord = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/attendance`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateAttendanceRecord = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/attendance/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteAttendanceRecord = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/attendance/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// TimeException
// ============================================================

export const getAllTimeExceptions = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/timeException`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getTimeException = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/timeException/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createTimeException = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/timeException`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateTimeException = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/timeException/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteTimeException = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/timeException/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// ShiftAssignment
// ============================================================

export const getShiftAssignmentsByEmployee = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/shift-assignments/employee/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createShiftAssignmentByEmployee = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/shift-assignments/employee`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateShiftAssignmentByEmployee = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/shift-assignments/employee/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteShiftAssignmentByEmployee = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/shift-assignments/employee/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

//
//
//

export const getShiftAssignmentsByPosition = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/shift-assignments/position/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createShiftAssignmentByPosition = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/shift-assignments/position`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateShiftAssignmentByPosition = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/shift-assignments/position/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteShiftAssignmentByPosition = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/shift-assignments/position/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

//
//
//

export const getShiftAssignmentsByDepartment = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/shift-assignments/department/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createShiftAssignmentByDepartment = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/shift-assignments/department`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateShiftAssignmentByDepartment = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/shift-assignments/department/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteShiftAssignmentByDepartment = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/shift-assignments/department/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// Overtime
// ============================================================

export const getOvertime = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/overtime`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createOvertime = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/overtime`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateOvertime = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/overtime/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteOvertime = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/overtime/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// Schedule
// ============================================================

export const getAllSchedule = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/schedule`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getSchedule = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/schedule/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createSchedule = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/schedule`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateSchedule = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/schedule/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteSchedule = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/schedule/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// Lateness
// ============================================================

export const getAllLatenessRule = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/lateness`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getLatenessRule = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/lateness/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createLatenessRule = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/lateness`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateLatenessRule = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/lateness/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteLatenessRule = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/lateness/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// Holiday
// ============================================================

export const getAllHolidays = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/holidays`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getHoliday = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/holidays/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createHoliday = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/holidays`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateHoliday = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/holidays/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteHoliday = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/holidays/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ============================================================
// Holiday
// ============================================================

export const getAllNotification = async (token: string) => {
  const { data } = await axios.get(`${BASE_URL}/notification`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getNotification = async (id: string, token: string) => {
  const { data } = await axios.get(`${BASE_URL}/notification/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createNotification = async (payload: any, token: string) => {
  const { data } = await axios.post(`${BASE_URL}/notification`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateNotification = async (id: string, payload: any, token: string) => {
  const { data } = await axios.put(`${BASE_URL}/notification/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteNotification = async (id: string, token: string) => {
  const { data } = await axios.delete(`${BASE_URL}/notification/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
 */