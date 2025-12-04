import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Holiday, HolidayDocument } from './models/holiday.schema';
import { CreateAttendanceCorrectionRequestDto, CreateAttendanceRecordDto, CreateHolidayDTO, CreateLatenessRuleDto, PunchDto, UpdateAttendanceCorrectionRequestDto, UpdateAttendanceRecordDto, UpdateHolidayDTO, UpdateLatenessRuleDto, UpdateTimeExceptionDto } from './dto/attendance.dto';
import { CreateShiftDto, CreateShiftTypeDto, UpdateShiftDto, UpdateShiftTypeDto } from './dto/shift.dto';
import { Shift, ShiftDocument } from './models/shift.schema';
import { ShiftAssignment, ShiftAssignmentDocument } from './models/shift-assignment.schema';
import { CreateShiftAssignmentDtoDepartment, CreateShiftAssignmentDtoEmployee, CreateShiftAssignmentDtoPosition, UpdateShiftAssignmentDtoDepartment, UpdateShiftAssignmentDtoEmployee, UpdateShiftAssignmentDtoPosition } from './dto/shiftassignment.dto';
import { CreateScheduleRuleDto, UpdateScheduleRuleDto } from './dto/schedule.dto';
import { ScheduleRuleDocument } from './models/schedule-rule.schema';
import { ShiftTypeDocument } from './models/shift-type.schema';
import { OvertimeRuleDocument } from './models/overtime-rule.schema';
import { CorrectionRequestStatus, ShiftAssignmentStatus } from './enums';
import { CreateOvertimeRuleDto, UpdateOvertimeRuleDto } from './dto/rules.dto';
import {AttendanceRecordDocument} from "./models/attendance-record.schema";
import { TimeExceptionDocument } from './models/time-exception.schema';
import { AssignmentStatus } from '../organization-structure/enums/organization-structure.enums';
import { LatenessRuleDocument } from './models/lateness-rule.schema';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestDocument } from './models/attendance-correction-request.schema';

export function isWeekend(date: Date): boolean {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday, 1 = Monday... fahem?
    return day === 0 || day === 6;
}


export function isHoliday(date: Date, holidays: Date[]): boolean {
    return holidays.some(h => h.toDateString() === date.toDateString());
}

const overtimeRulesConfig = {
    'Standard Overtime': { multiplier: 1.5, minHours: 8, maxHours: 12 },
    'Weekend Overtime': { multiplier: 2, minHours: 0, maxHours: 16 },
    'Holiday Overtime': { multiplier: 3, minHours: 0, maxHours: 24 },
};

function buildDateFromTime(timeStr: string, date: Date): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);

    const d = new Date(date);
    d.setHours(hours);
    d.setMinutes(minutes);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
}

function calculateLateness(punchIn: Date,shiftStart: Date,totalGrace: number): number {
    const graceEnd = new Date(shiftStart.getTime() + totalGrace * 60000);
    if (punchIn <= graceEnd)
        return 0;

    return Math.floor((punchIn.getTime() - graceEnd.getTime()) / 60000);
}


function detectMissedPunch(punches: PunchDto[]): { missed: boolean, reason: string } {
  if (!punches || punches.length === 0) {
    return { missed: true, reason: 'No punches for this day' };
  }

  const hasIn = punches.some(p => p.type === 'IN');
  const hasOut = punches.some(p => p.type === 'OUT');

  if (!hasIn && !hasOut) {
    return { missed: true, reason: 'Missing IN and OUT punches' };
  }
  if (!hasIn) {
    return { missed: true, reason: 'Missing IN punch' };
  }
  if (!hasOut) {
    return { missed: true, reason: 'Missing OUT punch' };
  }

  return { missed: false, reason: '' };
}

export function calculateOvertime(rule: OvertimeRuleDocument,date: Date,hoursWorked: number,holidays: Date[] = [],): number {
    if (!rule.active || !rule.approved) return 0;

    let multiplier = 1.0;
    let minHours = 0;

    switch (rule.name) {
        case 'Standard OT':
            multiplier = 1.5;
            minHours = 8;
            break;

        case 'Weekend OT':
            if (!isWeekend(date)) return 0;
            multiplier = 2;
            minHours = 0;
            break;

        case 'Holiday OT':
            if (!isHoliday(date, holidays)) return 0;
            multiplier = 3;
            minHours = 0;
            break;

        case 'Pre-approved OT':
            multiplier = 1.5;
            minHours = 0;
            break;

        default:
            return 0;
    }

    if (hoursWorked <= minHours) return 0;

    return (hoursWorked - minHours) * multiplier;
}

function combine(date: Date, time: string): Date {
    const [h, m] = time.split(':').map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
}

function validateScheduleRulePattern(pattern: string) {
    
}

function roundTime(date: Date, intervalMinutes: number, mode: 'nearest' | 'ceil' | 'floor'): Date {
  const ms = intervalMinutes * 60 * 1000;
  const timestamp = date.getTime();

  let r: number;

  if (mode === 'nearest') {r = Math.round(timestamp / ms) * ms;}
  else if (mode === 'ceil') {r = Math.ceil(timestamp / ms) * ms;}
  else {r = Math.floor(timestamp / ms) * ms;}

  return new Date(r);
}

function applyHRRulesToPunches(punches: PunchDto[]): PunchDto[] {
    // BR-TM-11 The system must allow multiple punches per day, or alternatively use first in/last out.
  if (!punches || punches.length === 0) return punches;

  const snapIntervalThingy = 15;
  const sorted = [...punches].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  if (sorted[0].type === 'IN') {
    sorted[0].time = roundTime(new Date(sorted[0].time), snapIntervalThingy, 'floor');
  }

  if (sorted[sorted.length - 1].type === 'OUT') {
    sorted[sorted.length - 1].time = roundTime(new Date(sorted[sorted.length - 1].time), snapIntervalThingy, 'ceil');
  }

  for (let i = 1; i < sorted.length - 1; i++) {
    sorted[i].time = roundTime(new Date(sorted[i].time), snapIntervalThingy, 'nearest');
  }

  return sorted;
}



@Injectable()
export class TimeManagementService {
    constructor(
        @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
        @InjectModel(Shift.name) private readonly shiftModel: Model<ShiftDocument>,
        @InjectModel(ShiftAssignment.name) private readonly shiftAssignmentModel: Model<ShiftAssignmentDocument>,
        @InjectModel('ScheduleRule') private readonly scheduleRuleModel: Model<ScheduleRuleDocument>,
        @InjectModel('ShiftType') private readonly shiftTypeModel: Model<ShiftTypeDocument>,
        @InjectModel('OvertimeRule') private readonly overtimeModel: Model<OvertimeRuleDocument>,
        @InjectModel('AttendanceRecord') private readonly attendanceRecordModel: Model<AttendanceRecordDocument>,
        @InjectModel('TimeException') private readonly timeExceptionModel: Model<TimeExceptionDocument>,
        @InjectModel('LatenessRule') private readonly latenessRuleModel: Model<LatenessRuleDocument>,
        @InjectModel('AttendanceCorrectionRequest') private readonly attendanceCorrectionModel: Model<AttendanceCorrectionRequestDocument>,
    ) {}

    

    async recalcAllShiftStatuses(): Promise<void> {
        const all = await this.shiftAssignmentModel.find();
        for (const bro of all) {
            await this.handleShiftAssignment(bro);
            await this.handleShiftStatus(bro);
            await bro.save();
        }
    }

    async handleShiftStatus(assignment: ShiftAssignmentDocument,referenceDate: Date = new Date()): Promise<ShiftAssignmentDocument> {

        const cancelled = ShiftAssignmentStatus.CANCELLED;
        const expired   = ShiftAssignmentStatus.EXPIRED;
        const pending   = ShiftAssignmentStatus.PENDING;
        const approved  = ShiftAssignmentStatus.APPROVED;
        const now = referenceDate;

        if (assignment.status === cancelled)
            return assignment;

        if (!assignment.startDate)
            throw new BadRequestException('Shift assignment must have startDate');

        if (!assignment.endDate) { //3ashan yshoof law ongoing :)

            if (assignment.startDate > now)
                assignment.status = pending;
            else
                assignment.status = approved;
            return assignment;
        }

            if (assignment.startDate >= assignment.endDate)
                throw new BadRequestException('Shift startDate must be before endDate');

            if (assignment.endDate < now) {
                assignment.status = expired;
                return assignment;
            }

            if (assignment.startDate > now) {
                assignment.status = pending;
                return assignment;
            }

        if (assignment.startDate <= now && assignment.endDate >= now) {
            assignment.status = approved;
            return assignment;
            }

        return assignment;
    }


    async calculateDeduction(lateMinutes: number,ratePerMinute: number): Promise<number> {
        return lateMinutes * ratePerMinute;
    }

    async handleDeletingShifts(startDate: Date, endDate: Date){
        const start = new Date(startDate);
        const end = new Date(endDate);
        let current = new Date(start);

        while (current <= end) {
        const shifts = await this.getAllShifts();
        if (shifts && shifts.length > 0) {
            for (const shift of shifts) {
                await this.deleteShift(shift._id.toString());
            }
        }
        current.setDate(current.getDate() + 1);
        }
    }

    async handleShiftAssignment(bro: ShiftAssignmentDocument): Promise<ShiftAssignmentDocument> {
        const now = new Date();

        if (bro.status === ShiftAssignmentStatus.CANCELLED)
            return bro;

        if (!bro.startDate || !bro.endDate)
            throw new BadRequestException('Shift assignment must have startDate and endDate');

        if (bro.startDate >= bro.endDate) 
            throw new BadRequestException('Shift start date must be before end date');

        const overlaps = await this.shiftAssignmentModel.findOne({
            employeeId: bro.employeeId,
            _id: { $ne: bro._id },
            $or: [{
                startDate: { $lte: bro.endDate },
                endDate: { $gte: bro.startDate }}]});

            if (overlaps)
                throw new BadRequestException('Shift overlaps with an existing assignment');

        if (bro.endDate < now)
            bro.status = ShiftAssignmentStatus.EXPIRED;
        else if (bro.startDate > now)
            bro.status = ShiftAssignmentStatus.PENDING;
        else 
            bro.status = ShiftAssignmentStatus.APPROVED;
        return bro;
    }


    //
    //
    //

    /*defineTimeManagementPermissions(definitions: { action: string; allowedRoles: string[] }[]) {
        definitions.forEach(def => {
            this.permissions[def.action] = def.allowedRoles;
        });
        return this.permissions; // return current state
    }*/
    
    //
    //
    //

    async getHolidayById(id: string): Promise<HolidayDocument> {
        const holiday = await this.holidayModel.findById(id).exec();
        if (!holiday) {
            throw new NotFoundException('Holiday with id ${id} not found');
        }
        return holiday;
    }

    async getHolidays(): Promise<HolidayDocument[]> {
        return await this.holidayModel.find().exec();
    }

    async updateHoliday(id: string, dto: UpdateHolidayDTO): Promise<HolidayDocument> {
        const updatedHoliday = await this.holidayModel
        .findByIdAndUpdate(id, dto, { new: true })
        .exec();

        if (!updatedHoliday) {
            throw new NotFoundException('Holiday with id ${id} not found');}

        if(updatedHoliday.startDate && updatedHoliday.endDate)
            this.handleDeletingShifts(updatedHoliday.startDate, updatedHoliday.endDate)

        return updatedHoliday;
    }

    async deleteHoliday(id: string): Promise<HolidayDocument> {
        const deletedHoliday = await this.holidayModel.findByIdAndDelete(id).exec();
        if (!deletedHoliday) {
            throw new NotFoundException('Holiday with id ${id} not found');
        }
        return deletedHoliday;
    }

    //
    //
    //

    async getAllShifts(): Promise<ShiftDocument[]> {
        return this.shiftModel.find().exec();
    }

    async getShift(id: string): Promise<ShiftDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('Shift with id ${id} not found');
        const g = await this.shiftModel.findById(id).exec();
        if(!g)
            throw new NotFoundException('Shift with id ${id} not found');
        return g;
    }

    async getShiftsByShiftType(shiftTypeId: string): Promise<ShiftTypeDocument[]> {
        return this.shiftTypeModel.find({ shiftType: shiftTypeId });
    }

    async getAlmostExpiredShifts(beforeDate: Date) {
    const shifts = await this.shiftModel.find({
        status: { $ne: ShiftAssignmentStatus.EXPIRED },
    });

    return shifts.filter(s => {
        const end = combine(new Date(), s.endTime);
        return end <= beforeDate;});
    }


    async getAllExpiredShifts(): Promise<ShiftAssignmentDocument[]> {
    const today = new Date();
        const expiredAssignments = await this.shiftAssignmentModel.find({
            endDate: { $lt: today },
            status: { $ne: ShiftAssignmentStatus.EXPIRED },
        }).populate('shiftId').exec();

        for (const assignment of expiredAssignments) {
            assignment.status = ShiftAssignmentStatus.EXPIRED;
            await assignment.save();
        }

        return expiredAssignments;
    }


    async createShift(dto: CreateShiftDto): Promise<ShiftDocument> {
        const newShift = new this.shiftModel(dto);

        const toDate = (time: string): Date => {
        const [h, m] = time.split(':').map(Number);
        const d = new Date(); // today
        d.setHours(h, m, 0, 0);
        return d;
    };


        const toMinutes = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    const startDate = toDate(newShift.startTime);
    const endDate = toDate(newShift.endTime);

    if (newShift.startTime === newShift.endTime || toMinutes(newShift.startTime) >= toMinutes(newShift.endTime)) 
        throw new NotFoundException('Shift start time must be before end time');
    
    if( newShift.graceInMinutes && newShift.graceInMinutes < 0)
        throw new NotFoundException('Grace in minutes must be non-negative');
    
    if( newShift.graceOutMinutes && newShift.graceOutMinutes < 0)
        throw new NotFoundException('Grace out minutes must be non-negative');


    if (await this.isHoliday(startDate) || await this.isHoliday(endDate)) {
            console.log('why would he do that?')
            throw new NotFoundException('Shift cannot start or end on a holiday');
    }

        return newShift.save();
    }

    async updateShift(id: string, dto: UpdateShiftDto): Promise<ShiftDocument> {
        if( !mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('Shift with id ${id} not found');
        const u = await this.shiftModel.findByIdAndUpdate(id, dto, { new: true });
        if(!u)
            throw new NotFoundException('Shift with id ${id} not found');
        return u
    }

    async deleteShift(id: string): Promise<ShiftDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('Shift with id ${id} not found');
        const d = await this.shiftModel.findByIdAndDelete(id)
        if(!d)
            throw new NotFoundException('Shift with id ${id} not found');
        return d;
    }

    async isHoliday(date: Date): Promise<boolean> {
        const holiday = await this.holidayModel.findOne({
            startDate: { $lte: date },
            $or: [
                { endDate: { $gte: date } },
                { endDate: null }
            ]
        });

        return !!holiday;
    }

    async createHoliday(data: CreateHolidayDTO): Promise<HolidayDocument> {
        let newHoliday = new this.holidayModel(data);
        if(!newHoliday || !newHoliday.startDate || !newHoliday.endDate)
            throw new NotFoundException('Could not create holiday');

    this.handleDeletingShifts(newHoliday.startDate, newHoliday.endDate)
    return newHoliday.save();
    }

    // ===========================================
    //          shift assignment w keda
    // ===========================================

    async cancelShiftAssignment(id: string): Promise<ShiftAssignmentDocument> {
        const bro = await this.shiftAssignmentModel.findById(id);
        if (!bro)
            throw new NotFoundException('Shift assignment not found');

        bro.status = ShiftAssignmentStatus.CANCELLED;
        return bro.save();
    }

    async approveShiftAssignment(id: string): Promise<ShiftAssignmentDocument> {
        const bro = await this.shiftAssignmentModel.findById(id);
        if (!bro)
            throw new NotFoundException('Shift assignment not found');

        bro.status = ShiftAssignmentStatus.APPROVED;
        return bro.save();
    }


    //
    //
    //

    async getShiftAssignmentByDepartment(d: string): Promise<ShiftAssignmentDocument[]> {
        const s = await this.shiftAssignmentModel
            .find({ departmentId: new Types.ObjectId(d) })
            .populate('shiftId');

        for (const bro of s) {
            this.handleShiftAssignment(bro);
            this.handleShiftStatus(bro)
            await bro.save();
        }
        return s
    }

    async getShiftAssignmentByEmployee(d: string): Promise<ShiftAssignmentDocument[]> {
        const s = await this.shiftAssignmentModel
            .find({ employeeId: new Types.ObjectId(d) })
            .populate('shiftId');

        for (const bro of s) {
            this.handleShiftAssignment(bro);
            this.handleShiftStatus(bro)
            await bro.save();
        }
        return s
    }

    async getShiftAssignmentByPosition(d: string): Promise<ShiftAssignmentDocument[]> {
        const s = await this.shiftAssignmentModel
            .find({ positionId: new Types.ObjectId(d) })
            .populate('shiftId');

        for (const bro of s) {
            this.handleShiftAssignment(bro);
            this.handleShiftStatus(bro)
            await bro.save();
        }
        return s
    }

    //
    //
    //

    async getShiftAssignmentsByStatus(status: ShiftAssignmentStatus) {
        return this.shiftAssignmentModel.find({ status }).populate('shiftId');
    }


    //
    //
    //

    /*async getAllShiftAssignmentByDepartment(d: string): Promise<ShiftAssignmentDocument[]> {
        const s = await this.shiftAssignmentModel
            .find({ departmentId: new Types.ObjectId(d) })
            .populate('shiftId');

        for (const bro of s) {
            handleShiftAssignment(bro);
            await bro.save();
        }
        return s
    }

    async getAllShiftAssignmentByEmployee(d: string): Promise<ShiftAssignmentDocument[]> {
        const s = await this.shiftAssignmentModel
            .find({ employeeId: new Types.ObjectId(d) })
            .populate('shiftId');

        for (const bro of s) {
            handleShiftAssignment(bro);
            await bro.save();
        }
        return s
    }

    async getAllShiftAssignmentByPosition(d: string): Promise<ShiftAssignmentDocument[]> {
        const s = await this.shiftAssignmentModel
            .find({ positionId: new Types.ObjectId(d) })
            .populate('shiftId');

        for (const bro of s) {
            handleShiftAssignment(bro);
            await bro.save();
        }
        return s
    }*/
  
    //
    //
    //

    async createShiftAssignmentByDepartment(shiftData: CreateShiftAssignmentDtoDepartment): Promise<ShiftAssignmentDocument> {
        let bro = new this.shiftAssignmentModel(shiftData);
        if(!bro) throw new NotFoundException('Could not create shift assignment for this employee');
        this.handleShiftAssignment(bro);
        return bro.save();
    }

    async createShiftAssignmentByEmployee(shiftData: CreateShiftAssignmentDtoEmployee): Promise<ShiftAssignmentDocument> {
        const bro = new this.shiftAssignmentModel(shiftData);
        if(!bro) throw new NotFoundException('Could not create shift assignment for this employee');
        this.handleShiftAssignment(bro);
        return bro.save();
    }

    async createShiftAssignmentByPosition(shiftData: CreateShiftAssignmentDtoPosition): Promise<ShiftAssignmentDocument> {
        const bro = new this.shiftAssignmentModel(shiftData);
        if(!bro) throw new NotFoundException('Could not create shift assignment for this position');
        this.handleShiftAssignment(bro);
        return bro.save();
    }

    //
    //
    //

    async updateShiftAssignmentByDepartment(id: string,updateData: UpdateShiftAssignmentDtoEmployee): Promise<ShiftAssignmentDocument[]> {
        if (!Types.ObjectId.isValid(id))
            throw new Error('Invalid department ID');

        const result = await this.shiftAssignmentModel.updateMany({ departmentId: new Types.ObjectId(id) },updateData);

        if (result.matchedCount === 0)
            throw new Error('Shift assignment not found');

        const updatedDocs = await this.shiftAssignmentModel.find({departmentId: new Types.ObjectId(id)});

        for (const doc of updatedDocs) {
            await this.handleShiftAssignment(doc);
            await doc.save();}

        return updatedDocs;
    }

    async updateShiftAssignmentByEmployee(id: string,updateData: UpdateShiftAssignmentDtoEmployee): Promise<ShiftAssignmentDocument[]> {
        if (!Types.ObjectId.isValid(id))
            throw new Error('Invalid employee ID');

        const result = await this.shiftAssignmentModel.updateMany({ employeeId: new Types.ObjectId(id) },updateData);

        if (result.matchedCount === 0)
            throw new Error('Shift assignment not found');

        const updatedDocs = await this.shiftAssignmentModel.find({employeeId: new Types.ObjectId(id)});

        for (const doc of updatedDocs) {
            await this.handleShiftAssignment(doc);
            await doc.save();}

        return updatedDocs;
    }


    async updateShiftAssignmentByPosition(id: string,updateData: UpdateShiftAssignmentDtoPosition): Promise<ShiftAssignmentDocument[]> {
        if (!Types.ObjectId.isValid(id))
            throw new Error('Invalid Position ID');

        const result = await this.shiftAssignmentModel.updateMany({ positionId: new Types.ObjectId(id) },updateData);

        if (result.matchedCount === 0)
            throw new Error('Shift assignment not found');

        const updatedDocs = await this.shiftAssignmentModel.find({positionId: new Types.ObjectId(id)});

        for (const doc of updatedDocs) {
            await this.handleShiftAssignment(doc);
            await doc.save();}

        return updatedDocs;
    }

    //
    //
    //

    async deleteShiftAssignmentByEmployee(id: string): Promise<ShiftAssignmentDocument> {
        if (!Types.ObjectId.isValid(id)) {throw new Error('Invalid employee ID');}
  
        const deleted = await this.shiftAssignmentModel.findOneAndDelete({ employeeId: new Types.ObjectId(id) });
    
        if (!deleted) throw new NotFoundException('Shift not found for this employee')
    
        return deleted;
    }

    async deleteShiftAssignmentByPosition(id: string): Promise<ShiftAssignmentDocument> {
        if (!Types.ObjectId.isValid(id)) {throw new Error('Invalid position ID');}
  
        const deletedShift = await this.shiftAssignmentModel.findOneAndDelete({ positionId: new Types.ObjectId(id) });
    
        if (!deletedShift) {throw new NotFoundException('Shift not found for this position')}
    
        return deletedShift;
    }

    async deleteShiftAssignmentByDepartment(id: string): Promise<ShiftAssignmentDocument> {
        if (!Types.ObjectId.isValid(id)) {throw new Error('Invalid department ID')}
  
        const deletedShift = await this.shiftAssignmentModel.findOneAndDelete({ departmentId: new Types.ObjectId(id) });
    
        if (!deletedShift) {throw new NotFoundException('Shift not found for this department')}
    
        return deletedShift;
    }

    // As an HR Manager
    // I want to define flexible and custom scheduling rules
    // (e.g., flex-in/flex-out hours, custom weekly patterns like 4 days on/3 off)
    // so that the organization can accommodate diverse work styles.

    async getAllSchedule():Promise<ScheduleRuleDocument[]> {
        return this.scheduleRuleModel
        .find().exec();
    }

    async getSchedule(id:string):Promise<ScheduleRuleDocument> {
        if(!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('Schedule with id ${id} not found');
        let schedule = await this.scheduleRuleModel.findById(id).exec();
        if(!schedule)
            throw new NotFoundException('Schedule with id ${id} not found');
        return schedule
    }

    async createSchedule(data: CreateScheduleRuleDto): Promise<ScheduleRuleDocument> {
        const bro = new this.scheduleRuleModel(data);
        validateScheduleRulePattern(bro.pattern);
        return await bro.save();
    }

    async updateSchedule(id: string, updateData: UpdateScheduleRuleDto): Promise<ScheduleRuleDocument> {
        if(!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundException('Schedule with id ${id} not found');
  
        const updated = await this.scheduleRuleModel.findByIdAndUpdate(id,updateData , { new: true });
        if (!updated) {throw new Error('Scheuld not found');}
        validateScheduleRulePattern(updated.pattern);
        return updated;
    }

    async deleteSchedule(id: string): Promise<ScheduleRuleDocument> {
        if(!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundException('Schedule with id ${id} not found');
        
        const deleted = await this.scheduleRuleModel.findByIdAndDelete(id);
        if (!deleted) {throw new NotFoundException('Schedule not found')}
        return deleted
    }

    //
    //
    //

    async getAllShiftTypes(): Promise<ShiftTypeDocument[]> {
        return this.shiftTypeModel.find().exec();
    }

    async getShiftType(id:string):Promise<ShiftTypeDocument> {
        if(!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('ShiftType with id ${id} not found');
        const shiftType = await this.shiftTypeModel.findById(id)
        if(!shiftType)
            throw new NotFoundException('ShiftType with id ${id} not found');
        return shiftType;
    }

    async createShiftType(data: CreateShiftTypeDto): Promise<ShiftTypeDocument> {
        const bro = new this.shiftTypeModel(data);
        return await bro.save();
    }

    async updateShiftType(id:string,data: UpdateShiftTypeDto): Promise<ShiftTypeDocument> {
        if(!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('ShiftType with id ${id} not found');
        const updatedShiftType = await this.shiftTypeModel.findByIdAndUpdate(id,data,{ new: true })
        if(!  updatedShiftType)
            throw new NotFoundException('ShiftType with id ${id} not found');
        return updatedShiftType;
    }

    async deleteShiftType(id:string):Promise<ShiftTypeDocument> {
        if(!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundException('ShiftType with id ${id} not found');
        const deletedShiftType = await this .shiftTypeModel.findByIdAndDelete(id)
        if(! deletedShiftType)
            throw new NotFoundException('ShiftType with id ${id} not found');
        return deletedShiftType;
    }

    //
    //
    //

    async getAllOvertimeRule(): Promise<OvertimeRuleDocument[]> {
        return this.overtimeModel.find().exec();
    }

    async getOvertimeRule(id:string):Promise<OvertimeRuleDocument> {
        if(!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundException('Overtime thing with id ${id} not found');
        const type = await this.overtimeModel.findById(id)
        if(!type)  throw new NotFoundException('Overtime thing with id ${id} not found');
        return type;
    }

    async getOvertimeRuleCalculation(type:OvertimeRuleDocument, employeeId:string):Promise<number> {
        if(!type) throw new NotFoundException('Overtime thing with id ${id} not found');
        const attendance = await this.getEmployeeAttendanceRecord(employeeId)
        if(!attendance)
            throw new NotFoundException("I hate seeing errors brdo, Employee has no attendance???")
        const n = attendance.totalWorkMinutes/60
        const attendanceDate = attendance.punches[0]?.time;
        const res = calculateOvertime(type, attendanceDate, n);
        return res
    }

    //
    //
    //

    async getEmployeeAttendanceRecord(employeeId: string): Promise<AttendanceRecordDocument> {
        const objectId = new Types.ObjectId(employeeId);
        const attendance = await this.attendanceRecordModel
            .findOne({ objectId }).exec();

        if (!attendance) {
            console.log("No attendance record found for this employee");
            throw new NotFoundException("No attendance record found for this employee");
        }

        console.log("Attendance record:", attendance);
        return attendance;
    }

    //
    //
    //

    async createOvertimeRule(data: CreateOvertimeRuleDto): Promise<OvertimeRuleDocument> {
        const bro = new this.overtimeModel(data);
        return await bro.save();
    }

    async updateOvertimeRule(id:string,data: UpdateOvertimeRuleDto): Promise<OvertimeRuleDocument> {
        if(!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundException('Overtime thing with id ${id} not found');
        const updated = await this.overtimeModel.findByIdAndUpdate(id,data,{ new: true })
        if(!updated) throw new NotFoundException('Overtime thing with id ${id} not found');
        
        return updated;
    }

    async deleteOvertimeRule(id:string):Promise<OvertimeRuleDocument> {
        if(!mongoose.Types.ObjectId.isValid(id)) throw new NotFoundException('Overtime thing with id ${id} not found');
        const deleted = await this.overtimeModel.findByIdAndDelete(id)
        if(! deleted) throw new NotFoundException('Overtime thing with id ${id} not found');

        return deleted;
    }

    //
    //
    //

    async getAllAttendance(): Promise<AttendanceRecordDocument[]> {
        return this.attendanceRecordModel.find().exec();
    }

    async getAttendance(id: string): Promise<AttendanceRecordDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('attendance record with id ${id} not found');

        const record = await this.attendanceRecordModel.findById(id).exec();
        if (!record)
            throw new NotFoundException('attendance record with id ${id} not found');

        return record;
    }

    async createAttendance(data: CreateAttendanceRecordDto,): Promise<AttendanceRecordDocument> {
        if (data.punches)
            data.punches = applyHRRulesToPunches(data.punches);
        const record = new this.attendanceRecordModel(data);
        return record.save();
    }

    async updateAttendance(id: string,data: UpdateAttendanceRecordDto,): Promise<AttendanceRecordDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('attendance record with id ${id} not found');

        if(data.punches) //read the thing above - present me has no idea why past me wrote this
            data.punches = applyHRRulesToPunches(data.punches); //either nest or ts was being a cry baby w idk why

        const updated = await this.attendanceRecordModel.findByIdAndUpdate(id, data, {
            new: true,
        });

        if (!updated)
            throw new NotFoundException('attendance record with id ${id} not found');
    
        return updated;
    }

    async deleteAttendance(id: string): Promise<AttendanceRecordDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('attendance record with id ${id} not found');

        const deleted = await this.attendanceRecordModel.findByIdAndDelete(id);

        if (!deleted)
            throw new NotFoundException('attendance record with id ${id} not found');

        return deleted;
    }

    //
    //
    //

    private calculateLateness(punchIn: Date, shiftStart: Date, totalGrace: number): number {
        const graceEnd = new Date(shiftStart.getTime() + totalGrace * 60000);

        if (punchIn <= graceEnd) return 0;

        return Math.floor((punchIn.getTime() - graceEnd.getTime()) / 60000);
    }

    private buildDateFromTime(timeStr: string, date: Date): Date {
        const [hours, minutes] = timeStr.split(':').map(Number);

        const d = new Date(date);
        d.setHours(hours, minutes, 0, 0);
        return d;
    }



    async computeLateness(punchIn: Date, shift: ShiftDocument) {
        const rule = await this.latenessRuleModel.findOne({ active: true });
        if (!rule) return { lateMinutes: 0, deduction: 0 };

        const shiftStart = this.buildDateFromTime(shift.startTime, punchIn);
        const totalGrace = shift.graceInMinutes + rule.gracePeriodMinutes;
        const lateMinutes = this.calculateLateness(punchIn, shiftStart, totalGrace);
        const deduction = this.calculateDeduction(lateMinutes,rule.deductionForEachMinute);

        return { lateMinutes, deduction };
    }

    //
    //
    //

    async getAllLateness(): Promise<LatenessRuleDocument[]> {
        return this.latenessRuleModel.find().exec();
    }

    async getLateness(id: string): Promise<LatenessRuleDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('lateness rule with id ${id} not found');

        const rule = await this.latenessRuleModel.findById(id).exec();
        if (!rule)
            throw new NotFoundException('lateness rule with id ${id} not found');

        return rule;
    }

    async createLateness(data: CreateLatenessRuleDto,): Promise<LatenessRuleDocument> {
        const record = new this.latenessRuleModel(data);
        return record.save();
    }

    async updateLateness(id: string,data: UpdateLatenessRuleDto): Promise<LatenessRuleDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('lateness rule with id ${id} not found');

        const updated = await this.latenessRuleModel.findByIdAndUpdate(id, data, {
            new: true,
        });

        if (!updated)
            throw new NotFoundException('lateness rule with id ${id} not found');
    
        return updated;
    }

    async deleteLateness(id: string): Promise<LatenessRuleDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('lateness rule with id ${id} not found');

        const deleted = await this.latenessRuleModel.findByIdAndDelete(id);

        if (!deleted)
            throw new NotFoundException('lateness rule with id ${id} not found');

        return deleted;
    }

    //
    //
    //

    async getAllAttendanceCorrection(): Promise<AttendanceCorrectionRequestDocument[]> {
        return this.attendanceCorrectionModel.find().exec();
    }

    async getAttendanceCorrection(id: string): Promise<AttendanceCorrectionRequestDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('attendance correction with id ${id} not found');

        const rule = await this.attendanceCorrectionModel.findById(id).exec();
        if (!rule)
            throw new NotFoundException('attendance correction with id ${id} not found');

        return rule;
    }

    async createAttendanceCorrection(data: CreateAttendanceCorrectionRequestDto): Promise<AttendanceCorrectionRequestDocument> {
        const record = new this.attendanceCorrectionModel(data);
        return record.save();
    }

    async updateAttendanceCorrection(id: string,data: UpdateAttendanceCorrectionRequestDto): Promise<AttendanceCorrectionRequestDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('attendance correction with id ${id} not found');

        const updated = await this.attendanceCorrectionModel.findByIdAndUpdate(id, data, {
            new: true,
        });

        if (!updated)
            throw new NotFoundException('attendance correction with id ${id} not found');
    
        return updated;
    }

    async deleteAttendanceCorrection(id: string): Promise<AttendanceCorrectionRequestDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('Attendance correction with id ${id} not found');

        const deleted = await this.attendanceCorrectionModel.findByIdAndDelete(id);

        if (!deleted)
            throw new NotFoundException('Attendance correction with id ${id} not found');

        return deleted;
    }

    //
    //
    //

    async getAllTimeException(): Promise<TimeExceptionDocument[]> {
        return this.timeExceptionModel.find().exec();
    }

    async getTimeException(id: string): Promise<TimeExceptionDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('Time Exception with id ${id} not found');

        const record = await this.timeExceptionModel.findById(id).exec();
        if (!record)
            throw new NotFoundException('Time Exception with id ${id} not found');

        return record;
    }

    async createTimeException(data: CreateAttendanceRecordDto,): Promise<TimeExceptionDocument> {
        const record = new this.timeExceptionModel(data);
        return record.save();
    }

    async updateTimeException(id: string,data: UpdateTimeExceptionDto,): Promise<TimeExceptionDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('Time Exception with id ${id} not found');

        const updated = await this.timeExceptionModel.findByIdAndUpdate(id, data, {
            new: true,
        });

        if (!updated)
            throw new NotFoundException('Time Exception with id ${id} not found');
    
        return updated;
    }

    async deleteTimeException(id: string): Promise<TimeExceptionDocument> {
        if (!mongoose.Types.ObjectId.isValid(id))
            throw new NotFoundException('Time Exception with id ${id} not found');

        const deleted = await this.timeExceptionModel.findByIdAndDelete(id);

        if (!deleted)
            throw new NotFoundException('Time Exception with id ${id} not found');

        return deleted;
    }

    //
    //
    //

    async escalatePendingRequests() : Promise<{message:string}> {
        // this is ay kalam
        return {message: 'Escalation process initiated.'};
    }

    //
    //
    //

    async submitAttendanceCorrection(employeeId: string,dto: CreateAttendanceCorrectionRequestDto): Promise<AttendanceCorrectionRequestDocument> {
    const newRequest = new this.attendanceCorrectionModel({
            ...dto,
            submittedBy: employeeId,
            status: CorrectionRequestStatus.IN_REVIEW,
            submittedAt: new Date(),
        });
        return await newRequest.save();
    }

    async approveAttendanceCorrection(requestId: string,approverId: string,approve: boolean): Promise<AttendanceCorrectionRequestDocument> {
        if (!mongoose.Types.ObjectId.isValid(requestId))
            throw new NotFoundException('Attendance correction request not found');
        const request = await this.attendanceCorrectionModel.findById(requestId);
        if (!request) throw new NotFoundException('Request not found');
        if (request.status !== CorrectionRequestStatus.IN_REVIEW)
            throw new BadRequestException('Request already processed');
        request.status = approve ? CorrectionRequestStatus.APPROVED : CorrectionRequestStatus.REJECTED;
        return request.save();
    }

    // ========== PAYROLL INTEGRATION STUBS ==========
    // These methods are called by payroll-execution service
    // TODO: Implement full logic when payroll integration is completed

    /**
     * Get the number of working days in a month
     * Used by payroll-execution to calculate daily rate
     */
    async getWorkDaysInMonth(periodDate: Date): Promise<number> {
        try {
            const year = periodDate.getFullYear();
            const month = periodDate.getMonth();
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 0);

            // Get holidays for the month
            const holidays = await this.holidayModel.find({
                startDate: {
                    $gte: startOfMonth,
                    $lte: endOfMonth,
                },
                active: true,
            });

            // Build list of holiday dates (including multi-day holidays)
            const holidayDates: string[] = [];
            for (const holiday of holidays) {
                const end = holiday.endDate || holiday.startDate;
                let current = new Date(holiday.startDate);
                while (current <= end) {
                    holidayDates.push(current.toDateString());
                    current.setDate(current.getDate() + 1);
                }
            }

            let workDays = 0;

            // Count weekdays that are not holidays
            for (let day = 1; day <= endOfMonth.getDate(); day++) {
                const currentDate = new Date(year, month, day);
                const dayOfWeek = currentDate.getDay();

                // Skip weekends (Saturday = 6, Sunday = 0)
                if (dayOfWeek === 0 || dayOfWeek === 6) continue;

                // Skip holidays
                if (holidayDates.includes(currentDate.toDateString())) continue;

                workDays++;
            }

            return workDays || 22; // Default to 22 if calculation fails
        } catch (error) {
            console.error('Error calculating work days in month:', error);
            return 22; // Default working days per month
        }
    }


}