import axios from 'axios';
import { AttendanceRecord, AttendanceCorrectionRequest, CreateOvertimeRuleDto, OvertimeRule, PunchPolicy, Shift, ShiftType, Holiday, ShiftAssignment, TimeException, ScheduleRule, NotificationLog, LatenessRule, CreateAttendanceCorrectionRequestDto, Punch, UpdateAttendanceRecordDto, CreateAttendanceRecordDto, PunchType } from '../types';
import { mapIds } from './utils';
import HolidayList from '../components/HolidayList';
import axiosInstance from './axiosinstance';

const BASE_URL = 'http://localhost:3000/time-management';

const toArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const toId = (x: any): string => {
  return String(x?._id ?? x?.id);
};

const mapShiftAssignment = (a: any): ShiftAssignment => ({
  id: toId(a),
  employeeId: a.employeeId,
  departmentId: a.departmentId,
  positionId: a.positionId,
  shiftId: a.shiftId,
  scheduleRuleId: a.scheduleRuleId,
  startDate: new Date(a.startDate),
  endDate: a.endDate ? new Date(a.endDate) : undefined,
  status: a.status,
});


// ============================================================
// Yalla bina
// ============================================================


export const getShift = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shifts/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createShift = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/shifts`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateShift = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shifts/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const getShiftType = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shift-type/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createShiftType = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/shift-type`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateShiftType = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shift-type/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const getAttendanceCorrection = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/attendanceCorrection/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createAttendanceCorrection = async (payload: any) => {
  try {
    const { data } = await axiosInstance.post(`/attendanceCorrection`, payload);
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateAttendanceCorrection = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/attendanceCorrection/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const getAttendanceRecord = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/attendance/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createAttendanceRecord = async (payload: CreateAttendanceRecordDto) => {
  try {
    return (await axiosInstance.post('/attendance', payload, { withCredentials: true })).data;
  } catch (err: any) {
    console.error("Create attendance error:", err.message);
    throw err;
  }
};

export const updateAttendanceRecord = async (id: string, payload: UpdateAttendanceRecordDto) => {
  try {
    return (await axiosInstance.put(`/attendance/${id}`, payload, { withCredentials: true })).data;
  } catch (err: any) {
    console.error("Update attendance error:", err.message);
    throw err;
  }
};

export const addPunchToAttendance = async (id: string, punch: any) => {
  try {
    const { data } = await axiosInstance.patch(`/attendance/${id}/punch`, punch, { withCredentials: true });
    return data;
  } catch (err: any) {
    console.error("Add punch error:", err.message);
    throw err;
  }
};


export const getTimeException = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/timeException/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createTimeException = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/timeException`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateTimeException = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/timeException/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// ShiftAssignment
// ============================================================

export const getShiftAssignmentsByEmployee = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shift-assignments/employee/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const updateShiftAssignmentByEmployee = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shift-assignments/employee/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const getShiftAssignmentsByPosition = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shift-assignments/position/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const getShiftAssignmentsByDepartment = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shift-assignments/department/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const updateShiftAssignmentByPosition = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shift-assignments/position/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateShiftAssignmentByDepartment = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shift-assignments/department/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// Overtime
// ============================================================

export const getOvertime = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/overtime`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const createOvertime = async (payload: CreateOvertimeRuleDto) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/overtime`, payload, {
      withCredentials: true,
    });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
};

export const updateOvertime = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/overtime/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

//
//
//

export const getSchedule = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createSchedule = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/schedule`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateSchedule = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/schedule/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteSchedule = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/schedule/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const getLatenessRule = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/lateness/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createLatenessRule = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/lateness`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateLatenessRule = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/lateness/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteLatenessRule = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/lateness/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const getHoliday = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/holidays/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createHoliday = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/holidays`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateHoliday = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/holidays/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const getNotification = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/notification/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createNotification = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/notification`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateNotification = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/notification/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// All
// ============================================================

export const getAllAttendanceCorrections =
  async (): Promise<AttendanceCorrectionRequest[]> => {
    try {
      const { data } = await axiosInstance.get("/attendanceCorrection");
      return toArray(data).map((r: any): AttendanceCorrectionRequest => ({
        id: toId(r),
        employeeId: r.employeeId,
        attendanceRecord: r.attendanceRecord,
        reason: r.reason,
        status: r.status,
      }));
    } catch {
      return [];
    }
  };


export const getAllAttendanceRecord =
  async (): Promise<AttendanceRecord[]> => {
    try {
      const { data } = await axiosInstance.get("/attendance");
      console.log("RAW API RESPONSE:", JSON.stringify(data, null, 2));

      return toArray(data).map((r: any): AttendanceRecord => ({
        id: toId(r),
        employeeId: r.employeeId,
        punches: (r.punches ?? []).map((p: any) => ({
          type: p.type,
          time: parseDate(p.time),
        })),
        totalWorkMinutes: r.totalWorkMinutes,
        hasMissedPunch: r.hasMissedPunch,
        exceptionIds: r.exceptionIds ?? [],
        finalisedForPayroll: r.finalisedForPayroll,
      }));
    } catch {
      return [];
    }
  };

function parseDate(dateString: any): Date {
  if (!dateString) return new Date();

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string: ${dateString}, using current date instead`);
    return new Date();
  }

  return date;
}



export const getAllHolidays = async (): Promise<Holiday[]> => {
  try {
    const { data } = await axiosInstance.get("/holidays");

    const list = Array.isArray(data) ? data : data?.data ?? [];

    return list
      .map((h: any) => {
        const id = h._id;

        return {
          id: String(id),
          type: h.type,
          startDate: h.startDate,
          endDate: h.endDate,
          name: h.name,
          active: h.active,
        };
      })
      .filter(Boolean) as Holiday[];
  } catch (error) {
    return [];
  }
};

export const getAllLatenessRule = async (): Promise<LatenessRule[]> => {
  try {
    const { data } = await axiosInstance.get("/lateness");
    return toArray(data).map((r: any): LatenessRule => ({
      id: toId(r),
      name: r.name,
      description: r.description,
      gracePeriodMinutes: r.gracePeriodMinutes,
      deductionForEachMinute: r.deductionForEachMinute,
      active: r.active,
    }));
  } catch {
    return [];
  }
};

export const getAllNotification = async (): Promise<NotificationLog[]> => {
  try {
    const { data } = await axiosInstance.get("/notification");
    return toArray(data).map((n: any): NotificationLog => ({
      id: toId(n),
      to: n.to,
      type: n.type,
      message: n.message,
    }));
  } catch {
    return [];
  }
};

export const getAllOvertime = async (): Promise<OvertimeRule[]> => {
  try {
    const { data } = await axiosInstance.get("/overtime");
    return toArray(data).map((o: any): OvertimeRule => ({
      id: toId(o),
      name: o.name,
      description: o.description,
      active: o.active,
      approved: o.approved,
    }));
  } catch {
    return [];
  }
};

export const getAllSchedule = async (): Promise<ScheduleRule[]> => {
  try {
    const { data } = await axiosInstance.get("/schedule");
    return toArray(data).map((s: any): ScheduleRule => ({
      id: toId(s),
      name: s.name,
      pattern: s.pattern,
      active: s.active,
    }));
  } catch {
    return [];
  }
};

export const getAllShiftAssignmentsByDepartment =
  async (): Promise<ShiftAssignment[]> => {
    try {
      const { data } = await axiosInstance.get("/shift-assignments/department");
      return toArray(data).map(mapShiftAssignment);
    } catch {
      return [];
    }
  };

export const getAllShiftAssignmentsByEmployee =
  async (): Promise<ShiftAssignment[]> => {
    try {
      const { data } = await axiosInstance.get("/shift-assignments/employee");
      return toArray(data).map(mapShiftAssignment);
    } catch {
      return [];
    }
  };

export const getAllShiftAssignmentsByPosition =
  async (): Promise<ShiftAssignment[]> => {
    try {
      const { data } = await axiosInstance.get("/shift-assignments/position");
      return toArray(data).map(mapShiftAssignment);
    } catch {
      return [];
    }
  };

export const getAllShiftAssignments =
  async (): Promise<ShiftAssignment[]> => {
    try {
      const { data } = await axiosInstance.get("/shift-assignments");
      return toArray(data).map(mapShiftAssignment);
    } catch {
      return [];
    }
  };

export const getAllShifts = async (): Promise<Shift[]> => {
  try {
    const response = await axiosInstance.get("/shifts");

    const rawData = Array.isArray(response.data)
      ? response.data
      : response.data?.data ?? [];

    return rawData.map((item: any): Shift => ({
      id: String(item.id ?? item._id), // ← FIX
      name: item.name ?? "",
      shiftType: item.shiftType,
      startTime: item.startTime,
      endTime: item.endTime,
      punchPolicy: item.punchPolicy,
      graceInMinutes: item.graceInMinutes ?? 0,
      graceOutMinutes: item.graceOutMinutes ?? 0,
      requiresApprovalForOvertime: !!item.requiresApprovalForOvertime,
      active: item.active ?? true,
    }));
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return [];
  }
};

export const getAlmostExpiredShifts = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/shifts/expiring/list");
    return response.data;
  } catch (error) {
    console.error("Error fetching almost expired shifts:", error);
    return [];
  }
};

export const getExpiredShifts = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/shifts/expired/list");
    return response.data;
  } catch (error) {
    console.error("Error fetching expired shifts:", error);
    return [];
  }
};


export const getAllShiftsType = async (): Promise<ShiftType[]> => {
  try {
    const { data } = await axiosInstance.get("/shift-type");
    return toArray(data).map((s: any): ShiftType => ({
      id: toId(s),
      name: s.name,
      active: s.active,
    }));
  } catch {
    return [];
  }
};


export const getAllTimeExceptions = async (): Promise<TimeException[]> => {
  try {
    const { data } = await axiosInstance.get("/timeException");
    return toArray(data).map((e: any): TimeException => ({
      id: toId(e),
      employeeId: e.employeeId,
      type: e.type,
      attendanceRecordId: e.attendanceRecordId,
      assignedTo: e.assignedTo,
      status: e.status,
      reason: e.reason,
    }));
  } catch {
    return [];
  }
};

// ============================================================
// Get One
// ============================================================



// ============================================================
// Create
// ============================================================

export const createShiftAssignmentByDepartment = async (payload: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/shift-assignments/department');
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    return giveError(error);
  }
};

export const createShiftAssignmentByEmployee = async (payload: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/shift-assignments/employee', payload);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    return giveError(error);
  }
};

export const createShiftAssignmentByPosition = async (payload: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/shift-assignments/position');
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error: any) {
    return giveError(error);
  }
};

// ============================================================
// Update
// ============================================================



// ============================================================
// Delete
// ============================================================

export const deleteAttendanceCorrection = async (id: string) => {
  try {
    return await axiosInstance.delete(`/attendanceCorrection/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteAttendanceRecord = async (id: string) => {
  try {
    return await axiosInstance.delete(`/attendance/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteHoliday = async (id: string) => {
  try {
    return await axiosInstance.delete(`/holidays/${id}`);
  } catch (error) {
    throw error;
  }
};

export const deleteLateness = async (id: string) => {
  try {
    return await axiosInstance.delete(`/lateness/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteNotification = async (id: string) => {
  try {
    return await axiosInstance.delete(`/notification/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteOvertime = async (id: string) => {
  try {
    return await axiosInstance.delete(`/overtime/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteShiftAssignmentByDepartment = async (id: string) => {
  try {
    return await axiosInstance.delete(`/shift-assignments/department/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteShiftAssignmentByEmployee = async (id: string) => {
  try {
    return await axiosInstance.delete(`/shift-assignments/employee/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteShiftAssignmentByPosition = async (id: string) => {
  try {
    return await axiosInstance.delete(`/shift-assignments/position/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteShiftType = async (id: string) => {
  try {
    return await axiosInstance.delete(`/shift-type/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteShift = async (id: string) => {
  try {
    return await axiosInstance.delete(`/shifts/${id}`);
  } catch (error: any) {
    return null;
  }
};

export const deleteTimeException = async (id: string) => {
  try {
    return await axiosInstance.delete(`/timeException/${id}`);
  } catch (error: any) {
    return null;
  }
};

//
//
//

export async function submitAttendanceCorrection(dto: CreateAttendanceCorrectionRequestDto) {

  const res = await axiosInstance.post(
    "/attendanceCorrections",
    dto,
    {
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );

  return res.data;
}

export async function getPendingCorrectionsForManager() {
  const res = await axiosInstance.get(
    '/attendanceCorrections/pending',
    {
      headers: {
        // Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );

  return res.data;
}
export async function approveAttendanceCorrection(id: string) {
  const res = await axiosInstance.post(
    `/attendanceCorrections/approve/${id}`,
    {}
  );
  return res.data;
}

export async function rejectAttendanceCorrection(id: string) {
  const res = await axiosInstance.post(
    `/attendanceCorrections/reject/${id}`,
    {}
  );
  return res.data;
}

//
//
//

export async function correctAttendanceRecord(attendanceRecordId: string, updatedPunches: Punch[]) {
  const response = await axiosInstance.patch(`/attendance/${attendanceRecordId}/correct`, { punches: updatedPunches, },
    {
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );

  return response.data;
}

//
//
//

async function giveError(error: any) {
  const errorResponse = {
    success: false,
    error: {
      message: 'Unknown error occurred',
      details: '',
      code: 'UNKNOWN_ERROR',
      conflicts: [] as any[],
      status: error.response?.status || 0
    }
  };

  // Handle different types of errors
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorResponse.error.status = error.response.status;
    errorResponse.error.message = error.response.data?.message || error.response.statusText || 'Server error';
    errorResponse.error.details = error.response.data;

    // Specific handling for overlap errors (400 Bad Request)
    if (error.response.status === 400) {
      errorResponse.error.code = 'VALIDATION_ERROR';

      // Check if it's an overlap error
      const errorMsg = error.response.data?.message || '';
      if (errorMsg.toLowerCase().includes('overlap')) {
        errorResponse.error.code = 'OVERLAP';
        errorResponse.error.message = 'conflicts with existing item';

        // Try to extract conflict details if available
        if (error.response.data) {
          errorResponse.error.conflicts = [error.response.data];
        }
      }
    }

    // Handle other status codes
    else if (error.response.status === 401) {
      errorResponse.error.code = 'UNAUTHORIZED';
      errorResponse.error.message = 'Authentication required';
    }
    else if (error.response.status === 403) {
      errorResponse.error.code = 'FORBIDDEN';
      errorResponse.error.message = 'You do not have permission to assign shifts';
    }
    else if (error.response.status === 404) {
      errorResponse.error.code = 'NOT_FOUND';
      errorResponse.error.message = 'Employee or shift not found';
    }
    else if (error.response.status === 409) {
      errorResponse.error.code = 'CONFLICT';
      errorResponse.error.message = 'Shift assignment conflict';
    }
    else if (error.response.status >= 500) {
      errorResponse.error.code = 'SERVER_ERROR';
      errorResponse.error.message = 'Internal server error. Please try again later.';
    }

  } else if (error.request) {
    // The request was made but no response was received
    errorResponse.error.code = 'NETWORK_ERROR';
    errorResponse.error.message = 'Network error. Please check your connection.';
    errorResponse.error.details = error.request;

  } else {
    // Something happened in setting up the request that triggered an Error
    errorResponse.error.code = 'REQUEST_ERROR';
    errorResponse.error.message = error.message || 'Failed to create request';
  }

  // Return the structured error so the component can handle it properly
  return errorResponse;
}

