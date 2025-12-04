import {Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards} from '@nestjs/common';
import {TimeManagementService} from './time-management.service';
import {
    CreateAttendanceCorrectionRequestDto,
    CreateAttendanceRecordDto,
    CreateHolidayDTO,
    CreateLatenessRuleDto,
    CreateTimeExceptionDto,
    UpdateAttendanceCorrectionRequestDto,
    UpdateAttendanceRecordDto,
    UpdateHolidayDTO,
    UpdateLatenessRuleDto,
    UpdateTimeExceptionDto
} from './dto/attendance.dto';
import {ShiftDocument} from './models/shift.schema';
import {CreateShiftDto, CreateShiftTypeDto, UpdateShiftDto, UpdateShiftTypeDto} from './dto/shift.dto';
import {ShiftDTO} from './dto/shiftListItemDTO.dto';
import {ShiftAssignmentDocument} from './models/shift-assignment.schema';
import {
    CreateShiftAssignmentDtoDepartment,
    CreateShiftAssignmentDtoEmployee,
    CreateShiftAssignmentDtoPosition,
    UpdateShiftAssignmentDtoDepartment,
    UpdateShiftAssignmentDtoEmployee,
    UpdateShiftAssignmentDtoPosition
} from './dto/shiftassignment.dto';
import {ScheduleRuleDocument} from './models/schedule-rule.schema';
import {CreateScheduleRuleDto, UpdateScheduleRuleDto} from './dto/schedule.dto';
import {SystemRole} from '../employee-profile/enums/employee-profile.enums';
import {ShiftTypeDocument} from './models/shift-type.schema';
import {OvertimeRuleDocument} from './models/overtime-rule.schema';
import {CreateOvertimeRuleDto, UpdateOvertimeRuleDto} from './dto/rules.dto';
import {HolidayDocument} from './models/holiday.schema';
import {ApiBearerAuth} from '@nestjs/swagger';
import {AttendanceRecordDocument} from "./models/attendance-record.schema";
import {TimeExceptionDocument} from './models/time-exception.schema';
import {LatenessRuleDocument} from './models/lateness-rule.schema';
import {AttendanceCorrectionRequestDocument} from './models/attendance-correction-request.schema';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {Public} from "../auth/decorators/public.decorator";
import {Roles} from "../auth/decorators/roles.decorator";

@Controller('time-management')
export class TimeManagementController {
    constructor(private readonly timeManagementService: TimeManagementService) {}

    /*@Roles(SystemRole.SYSTEM_ADMIN, HR_Manager) @UseGuards(AuthGuard, authorizationGaurd)    
    @Post('/permissions')
    async defineTimeManagementPermissions(@Body() dto: { action: string; allowedRoles: string[] }[]) {
        return this.timeManagementService.defineTimeManagementPermissions(dto);
    }*/

    //As a System Admin/HR Admin
    // I want to assign shifts to employees (individually, by department, or by position)
    // and manage their statuses (Approved, Cancelled, Expired, etc.) so that work schedules are properly maintained and updated.

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/shift-assignments/employee/:id')
    async getShiftAssignmentByEmployee(@Param('id') id:string):Promise<ShiftAssignmentDocument[]> {
        return await this.timeManagementService.getShiftAssignmentByEmployee(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/shift-assignments/position/:id')
    async getShiftAssignmentByPosition(@Param('id') id:string):Promise<ShiftAssignmentDocument[]> {
        return await this.timeManagementService.getShiftAssignmentByPosition(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/shift-assignments/department/:id')
    async getShiftAssignmentByDepartment(@Param('id') id:string):Promise<ShiftAssignmentDocument[]> {
        return await this.timeManagementService.getShiftAssignmentByDepartment(id)
    }

    //
    //
    //

    /*@ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/shift-assignments/employee/')
    async getAllShiftAssignmentByEmployee(@Param('id') id:string):Promise<ShiftAssignmentDocument[]> {
        return await this.timeManagementService.getAllShiftAssignmentByEmployee(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/shift-assignments/position/')
    async getAllShiftAssignmentByPosition(@Param('id') id:string):Promise<ShiftAssignmentDocument[]> {
        return await this.timeManagementService.getAllShiftAssignmentByPosition(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/shift-assignments/department/')
    async getAllShiftAssignmentByDepartment(@Param('id') id:string):Promise<ShiftAssignmentDocument[]> {
        return await this.timeManagementService.getAllShiftAssignmentByDepartment(id)
    }*/

    //
    //
    //
    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('/shift-assignments/:id')
    async cancelShiftAssignment(@Param('id') id:string):Promise<ShiftAssignmentDocument >{
        return await this.timeManagementService.cancelShiftAssignment(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('/shift-assignments/:id')
    async approveShiftAssignment(@Param('id') id:string):Promise<ShiftAssignmentDocument >{
        return await this.timeManagementService.approveShiftAssignment(id);
    }
    
    //
    //
    //

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('/shift-assignments/employee/:id')
    async updateShiftAssignmentByEmployee(@Param('id') id:string,@Body()data: UpdateShiftAssignmentDtoEmployee):Promise<ShiftAssignmentDocument[]> {
        return await this.timeManagementService.updateShiftAssignmentByEmployee(id,data);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('/shift-assignments/position/:id')
    async updateShiftAssignmentByPosition(@Param('id') id:string,@Body()data: UpdateShiftAssignmentDtoPosition):Promise<ShiftAssignmentDocument[]> {
        return await this.timeManagementService.updateShiftAssignmentByPosition(id,data);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('/shift-assignments/department/:id')
    async updateShiftAssignmentByDepartment(@Param('id') id:string,@Body()data: UpdateShiftAssignmentDtoDepartment):Promise<ShiftAssignmentDocument[]> {
        return await this.timeManagementService.updateShiftAssignmentByDepartment(id,data);
    }

    //
    //
    //

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Delete('/shift-assignments/employee/:id')
    async deleteShiftAssignmentByEmployee(@Param('id') id:string):Promise<ShiftAssignmentDocument>{
        return await this.timeManagementService.deleteShiftAssignmentByEmployee(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Delete('/shift-assignments/position/:id')
    async deleteShiftAssignmentByPosition(@Param('id') id:string):Promise<ShiftAssignmentDocument>{
        return await this.timeManagementService.deleteShiftAssignmentByPosition(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Delete('/shift-assignments/department/:id')
    async deleteShiftAssignmentByDepartment(@Param('id') id:string):Promise<ShiftAssignmentDocument>{
        return await this.timeManagementService.deleteShiftAssignmentByDepartment(id);
    }

    //
    //
    //

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Post('/shift-assignments/employee')
    async createShiftAssignmentByEmployee(@Body()dto: CreateShiftAssignmentDtoEmployee):Promise<ShiftAssignmentDocument> {
        const newShiftAssignment = await this.timeManagementService.createShiftAssignmentByEmployee(dto);
        return newShiftAssignment
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Post('/shift-assignments/position')
    async createShiftAssignmentByPosition(@Body()dto: CreateShiftAssignmentDtoPosition):Promise<ShiftAssignmentDocument> {
        const newShiftAssignment = await this.timeManagementService.createShiftAssignmentByPosition(dto);
        return newShiftAssignment
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Post('/shift-assignments/department')
    async createShiftAssignmentByDepartment(@Body()dto: CreateShiftAssignmentDtoDepartment):Promise<ShiftAssignmentDocument> {
        const newShiftAssignment = await this.timeManagementService.createShiftAssignmentByDepartment(dto);
        return newShiftAssignment
    }

    //
    //
    //
    
    @Public()
    @Get('/holidays')
    async getHolidays() {
        return await this.timeManagementService.getHolidays();
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER) @Get('/holidays/:id')
    async getHolidayById(@Param('id') id: string) {
        return await this.timeManagementService.getHolidayById(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Post('/holidays')
    async createHoliday(@Body() dto: CreateHolidayDTO):Promise<HolidayDocument> {
        return await this.timeManagementService.createHoliday(dto);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('/holidays/:id')
    async updateHoliday(
    @Param('id') id: string,
        @Body() dto: UpdateHolidayDTO,
    ) {
        return await this.timeManagementService.updateHoliday(id, dto);
    }
    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Delete('/holidays/:id')
    async deleteHoliday(@Param('id') id: string) {
        return await this.timeManagementService.deleteHoliday(id);
    }

    //
    //
    //

    @Public()
    @Get('/shifts')
    async getAllShifts(): Promise<ShiftDTO[]> {
    const shifts = await this.timeManagementService.getAllShifts();
        return shifts.map(s => new ShiftDTO(s));
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/shifts/:id')
    async getShift(@Param('id') id: string) {
        return await this.timeManagementService.getShift(id);
    }
  
    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Post('/shifts')
    async createShift(@Body() dto: CreateShiftDto): Promise<ShiftDocument> {
        return await this.timeManagementService.createShift(dto);
    }
  
    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('shifts/:id')
    async updateShift(
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
    ): Promise<ShiftDocument > {
        return await this.timeManagementService.updateShift(id, dto);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Delete('shifts/:id')
    async deleteShift(@Param('id') id: string):Promise<ShiftDocument > {
        return await this.timeManagementService.deleteShift(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('shifts/expiring')
    async getAlmostExpiredShifts():Promise<ShiftDocument[] > {
        return await this.timeManagementService.getAlmostExpiredShifts(new Date());
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('shifts/expired')
    async getAllExpiredShifts():Promise<ShiftAssignmentDocument[] > {
        return await this.timeManagementService.getAllExpiredShifts();
    }

    //
    //
    //
    
    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/shift-type')
    async getAllShiftTypes():Promise<ShiftTypeDocument[] > {
        return await this.timeManagementService.getAllShiftTypes();
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/shift-type/:id')
    async getShiftType(@Param('id') id: string): Promise<ShiftTypeDocument > {
        return await this.timeManagementService.getShiftType(id);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Post('/shift-type')
    async createShiftType(@Body() dto: CreateShiftTypeDto): Promise<ShiftTypeDocument > {
        return await this.timeManagementService.createShiftType(dto);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('/shift-type/:id')
    async updateShiftType(@Param('id') id:string,@Body()data: UpdateShiftTypeDto): Promise<ShiftTypeDocument > {
        return await this.timeManagementService.updateShiftType(id,data);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Delete('/shift-type/:id')
    async deleteShiftType(@Param('id') id:string):Promise<ShiftTypeDocument > {
        return await this.timeManagementService.deleteShiftType(id);
    }    

    // I want to define flexible and custom scheduling rules
    // (e.g., flex-in/flex-out hours, custom weekly patterns like 4 days on/3 off)
    // so that the organization can accommodate diverse work styles.

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER) @UseGuards(JwtAuthGuard)
    @Get('schedule')
    async getAllSchedule():Promise<ScheduleRuleDocument[]> {
        return await this.timeManagementService.getAllSchedule()
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER) @UseGuards(JwtAuthGuard)
    @Get('schedule/:id')
    async getSchedule(@Param('id') id:string):Promise<ScheduleRuleDocument> {
        return await this.timeManagementService.getSchedule(id)
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER) @UseGuards(JwtAuthGuard)
    @Put('schedule/:id')
    async updateSchedule(@Param('id') id:string,@Body()data: UpdateScheduleRuleDto):Promise<ScheduleRuleDocument> {
        return await this.timeManagementService.updateSchedule(id,data);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER) @UseGuards(JwtAuthGuard)
    @Post('schedule')
    async createSchedule(@Body()data: CreateScheduleRuleDto):Promise<ScheduleRuleDocument> {
        return await this.timeManagementService.createSchedule(data);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER) @UseGuards(JwtAuthGuard)
    @Delete('schedule/:id')
    async deleteSchedule(@Param('id') id:string):Promise<ScheduleRuleDocument>{
        return await this.timeManagementService.deleteSchedule(id);
    }

    //
    //
    //

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST, SystemRole.DEPARTMENT_HEAD) @UseGuards(JwtAuthGuard)
    @Get('/overtime')
    async getAllOvertimeRule() :Promise<OvertimeRuleDocument[]>{
        return await this.timeManagementService.getAllOvertimeRule();
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST, SystemRole.DEPARTMENT_HEAD) @UseGuards(JwtAuthGuard)
    @Get('overtime/:id')
    async getOvertimeRule(@Param('id') id:string):Promise<OvertimeRuleDocument > {
        return await this.timeManagementService.getOvertimeRule(id)
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST) @UseGuards(JwtAuthGuard)
    @Put('overtime/:id')
    async updateOvertimeRule(@Param('id') id:string,@Body()data: UpdateOvertimeRuleDto):Promise<OvertimeRuleDocument > {
        return await this.timeManagementService.updateOvertimeRule(id,data);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST) @UseGuards(JwtAuthGuard)
    @Post('overtime')
    async createOvertimeRule(@Body()data: CreateOvertimeRuleDto):Promise<OvertimeRuleDocument > {
        const n = await this.timeManagementService.createOvertimeRule(data);
        return n
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @Roles(SystemRole.HR_MANAGER, SystemRole.PAYROLL_SPECIALIST) @UseGuards(JwtAuthGuard)
    @Delete('overtime/:id')
    async deleteOvertimeRule(@Param('id') id:string) : Promise<OvertimeRuleDocument > {
        return await this.timeManagementService.deleteOvertimeRule(id);
    }

    //
    //
    //

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER,SystemRole.DEPARTMENT_HEAD) @Get('/attendance')
    async getAllAttendance() :Promise<AttendanceRecordDocument[]>{
        return await this.timeManagementService.getAllAttendance();
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER,SystemRole.DEPARTMENT_HEAD) @Get('attendance/:id')
    async getAttendance(@Param('id') id:string):Promise<AttendanceRecordDocument > {
        return await this.timeManagementService.getAttendance(id)
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER,SystemRole.DEPARTMENT_HEAD) @Put('attendance/:id')
    async updateAttendance(@Param('id') id:string,@Body()data: UpdateAttendanceRecordDto):Promise<AttendanceRecordDocument > {
        return await this.timeManagementService.updateAttendance(id,data);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER,SystemRole.DEPARTMENT_HEAD) @Post('attendance')
    async createAttendance(@Body()data: CreateAttendanceRecordDto):Promise<AttendanceRecordDocument > {
        const n = await this.timeManagementService.createAttendance(data);
        return n
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER,SystemRole.DEPARTMENT_HEAD) @Delete('attendance/:id')
    async deleteAttendance(@Param('id') id:string) : Promise<AttendanceRecordDocument > {
        return await this.timeManagementService.deleteAttendance(id);
    }

    //
    //
    //

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER,SystemRole.DEPARTMENT_HEAD) @Get('/lateness')
    async getAllLateness() :Promise<LatenessRuleDocument[]>{
        return await this.timeManagementService.getAllLateness();
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER,SystemRole.DEPARTMENT_HEAD) @Get('lateness/:id')
    async getLateness(@Param('id') id:string):Promise<LatenessRuleDocument> {
        return await this.timeManagementService.getLateness(id)
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('lateness/:id')
    async updateLateness(@Param('id') id:string,@Body()data: UpdateLatenessRuleDto):Promise<LatenessRuleDocument> {
        return await this.timeManagementService.updateLateness(id,data);
    }

    @ApiBearerAuth('access_token') @UseGuards(JwtAuthGuard)
    @Post('lateness')
    async createLateness(@Body()data: CreateLatenessRuleDto):Promise<LatenessRuleDocument> {
        const n = await this.timeManagementService.createLateness(data);
        return n
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Delete('lateness/:id')
    async deleteLateness(@Param('id') id:string) : Promise<LatenessRuleDocument> {
        return await this.timeManagementService.deleteLateness(id);
    }

    //
    //
    //

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('/attendance')
    async getAllTimeException() :Promise<TimeExceptionDocument[]>{
        return await this.timeManagementService.getAllTimeException();
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Get('attendance/:id')
    async getTimeException(@Param('id') id:string):Promise<TimeExceptionDocument > {
        return await this.timeManagementService.getTimeException(id)
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Put('attendance/:id')
    async updateTimeException(@Param('id') id:string,@Body()data: UpdateTimeExceptionDto):Promise<TimeExceptionDocument > {
        return await this.timeManagementService.updateTimeException(id,data);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Post('attendance')
    async createTimeException(@Body()data: CreateTimeExceptionDto):Promise<TimeExceptionDocument > {
        const n = await this.timeManagementService.createTimeException(data);
        return n
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Delete('attendance/:id')
    async deleteTimeException(@Param('id') id:string) : Promise<TimeExceptionDocument > {
        return await this.timeManagementService.deleteTimeException(id);
    }

    //
    //
    //

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER) @Get('/attendanceCorrection')
    async getAllAttendanceCorrection() :Promise<AttendanceCorrectionRequestDocument[]>{
        return await this.timeManagementService.getAllAttendanceCorrection();
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER) @Get('attendanceCorrection/:id')
    async getAttendanceCorrection(@Param('id') id:string):Promise<AttendanceCorrectionRequestDocument> {
        return await this.timeManagementService.getAttendanceCorrection(id)
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER) @Put('attendanceCorrection/:id')
    async updateAttendanceCorrection(@Param('id') id:string,@Body()data: UpdateAttendanceCorrectionRequestDto):Promise<AttendanceCorrectionRequestDocument > {
        return await this.timeManagementService.updateAttendanceCorrection(id,data);
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER) @Post('attendanceCorrection')
    async createAttendanceCorrection(@Body()data: CreateAttendanceCorrectionRequestDto):Promise<AttendanceCorrectionRequestDocument > {
        const n = await this.timeManagementService.createAttendanceCorrection(data);
        return n
    }

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Roles(SystemRole.HR_MANAGER) @Delete('attendanceCorrection/:id')
    async deleteAttendanceCorrection(@Param('id') id:string) : Promise<AttendanceCorrectionRequestDocument > {
        return await this.timeManagementService.deleteAttendanceCorrection(id);
    }

    //As a System Admin/HR Admin
    // I want leave or time requests to escalate automatically
    // if not reviewed before the monthly payroll cut-off date so that payroll processing is not delayed.

    @ApiBearerAuth('access_token') @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN) @UseGuards(JwtAuthGuard)
    @Post('/escalate-pending-requests')
    async escalatePendingRequests() : Promise<{message:string}> {
        return await this.timeManagementService.escalatePendingRequests();
    }

    //
    //
    //

    @ApiBearerAuth('access_token') @UseGuards(JwtAuthGuard)
    @Post('attendanceCorrection/submit')
    async submitAttendanceCorrection(@Body() data: CreateAttendanceCorrectionRequestDto,@Req() req): Promise<AttendanceCorrectionRequestDocument> {
    const employeeId = req.user.id;
    return await this.timeManagementService.submitAttendanceCorrection(employeeId, data);
}

}