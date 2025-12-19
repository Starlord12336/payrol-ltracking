// ============================================================
// 
// ============================================================

export enum CorrectionRequestStatus {
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

export enum PunchType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum HolidayType {
  NATIONAL = 'NATIONAL',
  ORGANIZATIONAL = 'ORGANIZATIONAL',
  WEEKLY_REST = 'WEEKLY_REST',
}

export enum ShiftAssignmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PunchPolicy {
  MULTIPLE = 'MULTIPLE',
  FIRST_LAST = 'FIRST_LAST',
  ONLY_FIRST = 'ONLY_FIRST',
}

export enum TimeExceptionType {
  MISSED_PUNCH = 'MISSED_PUNCH',
  LATE = 'LATE',
  EARLY_LEAVE = 'EARLY_LEAVE',
  SHORT_TIME = 'SHORT_TIME',
  OVERTIME_REQUEST = 'OVERTIME_REQUEST',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

export enum TimeExceptionStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
}

// ============================================================
// 
// ============================================================

export interface Punch {
  time: Date; // ISO string
  type: PunchType;
}

export interface Holiday {
  id:string;
  type: HolidayType;
  startDate: Date;
  endDate?: Date; // if missing, startDate == holiday day
  name?: string;
  active: boolean;
}

export interface AttendanceCorrectionRequest {
  id: string;
  employeeId: string;
  attendanceRecord: AttendanceRecord;
  reason?: string;
  status: CorrectionRequestStatus;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  punches: Punch[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  exceptionIds: string[];
  finalisedForPayroll: boolean;
}

export interface LatenessRule {
  id: string;
  name: string;
  description?: string;
  gracePeriodMinutes: number;
  deductionForEachMinute: number;
  active: boolean;
}

export interface NotificationLog {
  id: string;
  to: string;
  type: string;
  message?: string;
}

export interface OvertimeRule {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  approved: boolean;
}

export interface ScheduleRule {
  id: string;
  name: string;
  pattern: string;
  active: boolean;
}

export type AssignmentType = 1 | 2 | 3;

export interface ShiftAssignment {
  id: string;
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  shiftId: string;
  scheduleRuleId?: string;
  startDate: Date;
  endDate?: Date; //null means ongoing
  status: ShiftAssignmentStatus;
}

export interface ShiftAssignmentWithType extends ShiftAssignment {
  type: AssignmentType; // 1 = dept, 2 = employee, 3 = position
}

export interface ShiftType {
  id: string;
  name: string;
  active: boolean;
}

export interface Shift {
  id: string;
  name: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  punchPolicy: PunchPolicy;
  graceInMinutes: number;
  graceOutMinutes: number;
  requiresApprovalForOvertime: boolean;
  active: boolean;
}

export interface TimeException {
  id: string;
  employeeId: string;
  type: TimeExceptionType;
  attendanceRecordId: string;
  assignedTo: string; // person responsible for handling the exception
  status: TimeExceptionStatus;
  reason?: string;
}

// ============================================================
// 
// ============================================================

// Attendance Correction Request DTO
export interface CreateAttendanceCorrectionRequestDto {
  employeeId: string;
  attendanceRecordId: string;
  status: CorrectionRequestStatus;
  reason?: string;
}

export interface UpdateAttendanceCorrectionRequestDto {
  employeeId: string;
  attendanceRecordId: string;
  status: CorrectionRequestStatus;
  reason?: string;
}

// Attendance Record DTO
export interface CreateAttendanceRecordDto {
  employeeId: string;
  punches?: Punch[];
  totalWorkMinutes?: number;
  hasMissedPunch?: boolean;
  exceptionIds?: string[];
  finalisedForPayroll?: boolean;
}

export interface UpdateAttendanceRecordDto {
  punches?: Punch[];
  totalWorkMinutes?: number;
  hasMissedPunch?: boolean;
  exceptionIds?: string[];
  finalisedForPayroll?: boolean;
}

// Shift Assignment DTO
export interface CreateShiftAssignmentDto {
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  shiftId: string;
  scheduleRuleId?: string;
  startDate: string;
  endDate?: string;
}

export interface UpdateShiftAssignmentDto {
  status?: ShiftAssignmentStatus;
  endDate?: string;
}

// Holiday DTO
export interface CreateHolidayDto {
  type: HolidayType;
  startDate: string;
  endDate?: string;
  name?: string;
  active?: boolean;
}

export interface UpdateHolidayDto {
  type?: HolidayType;
  startDate?: string;
  endDate?: string;
  name?: string;
  active?: boolean;
}

// Shift DTO
export interface CreateShiftDto {
  name: string;
  shiftTypeId: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  punchPolicy?: PunchPolicy;
  graceInMinutes?: number;
  graceOutMinutes?: number;
  requiresApprovalForOvertime?: boolean;
  active?: boolean;
}

export interface UpdateShiftDto {
  name?: string;
  shiftTypeId?: string;
  startTime?: string;
  endTime?: string;
  punchPolicy?: PunchPolicy;
  graceInMinutes?: number;
  graceOutMinutes?: number;
  requiresApprovalForOvertime?: boolean;
  active?: boolean;
}

export interface CreateTimeExceptionDto {
  employeeId: string;
  type: TimeExceptionType;
  attendanceRecordId: string;
  assignedTo: string;
  reason?: string;
}

export interface UpdateTimeExceptionDto {
  status?: TimeExceptionStatus;
  reason?: string;
}

// LatenessRule DTO
export interface CreateLatenessRuleDto {
  name: string;
  description?: string;
  gracePeriodMinutes?: number;
  deductionForEachMinute?: number;
  active?: boolean;
}

export interface UpdateLatenessRuleDto {
  name?: string;
  description?: string;
  gracePeriodMinutes?: number;
  deductionForEachMinute?: number;
  active?: boolean;
}

// NotificationLog DTO
export interface CreateNotificationLogDto {
  to: string;
  type: string;
  message?: string;
}

export interface UpdateNotificationLogDto {
  to: string;
  type: string;
  message?: string;
}

// OvertimeRule DTO
export interface CreateOvertimeRuleDto {
  name: string;
  description?: string;
  active?: boolean;
  approved?: boolean;
}

export interface UpdateOvertimeRuleDto {
  name?: string;
  description?: string;
  active?: boolean;
  approved?: boolean;
}

// ScheduleRule DTO
export interface CreateScheduleRuleDto {
  name: string;
  pattern: string;
  active?: boolean;
}

export interface UpdateScheduleRuleDto {
  name?: string;
  pattern?: string;
  active?: boolean;
}

// ShiftType DTO
export interface CreateShiftTypeDto {
  name: string;
  active?: boolean;
}

export interface UpdateShiftTypeDto {
  name?: string;
  active?: boolean;
}

//
//
//

export interface AttendanceCorrectionReview {
  id: string;

  employeeId: string;
  employeeName: string;
  employeeNumber: string;

  punches: Punch[];
  hasMissedPunch: boolean;
  totalWorkMinutes: number;

  reason?: string;
  status: CorrectionRequestStatus;
}

export interface CreateAttendanceCorrectionRequestDto {
  attendanceRecordId: string;
  reason?: string;
}

export interface CorrectAttendanceRecordDto {
  punches: Punch[];
}

//
//
//

export interface AttendanceCorrectionReview {
  id: string; // correction request id
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  punches: Punch[];
  hasMissedPunch: boolean;
  totalWorkMinutes: number;
  reason?: string;
  status: CorrectionRequestStatus;
}
