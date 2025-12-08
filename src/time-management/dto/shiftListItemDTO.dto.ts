import { PunchPolicy } from '../enums'
import { ShiftDocument } from '../models/shift.schema';
import { Types } from 'mongoose';

export class ShiftDTO {
  id: string;
  name: string;
  shiftType: string; // ObjectId as string
  startTime: string;
  endTime: string;
  punchPolicy: PunchPolicy;
  graceInMinutes: number;
  graceOutMinutes: number;
  requiresApprovalForOvertime: boolean;
  active: boolean;

  constructor(shift: ShiftDocument) {
    this.id = shift._id.toString(); // map _id → id
    this.name = shift.name;
    this.shiftType =
      typeof shift.shiftType === 'string'
        ? shift.shiftType
        : (shift.shiftType as Types.ObjectId).toString();
    this.startTime = shift.startTime;
    this.endTime = shift.endTime;
    this.punchPolicy = shift.punchPolicy;
    this.graceInMinutes = shift.graceInMinutes;
    this.graceOutMinutes = shift.graceOutMinutes;
    this.requiresApprovalForOvertime = shift.requiresApprovalForOvertime;
    this.active = shift.active;
  }
}
