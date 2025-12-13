import { CorrectionRequestStatus, HolidayType, PunchPolicy, TimeExceptionStatus, TimeExceptionType } from '../enums';
import { IsArray, ValidateNested, IsDate, IsBoolean, IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PunchType } from '../enums';
import { Types } from "mongoose";

export class PunchDto {
  type: PunchType;
  time: Date;
}

export class AttendanceRecordDto {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  punches: PunchDto[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  exceptionIds: Types.ObjectId[];
  finalisedForPayroll: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreatePunchDto {
  @IsEnum(PunchType)
  type: PunchType;

  @IsDate()
  @Type(() => Date)
  time: Date;
}

export class UpdatePunchDto {
  @IsEnum(PunchType)
  type: PunchType;

  @IsDate()
  @Type(() => Date)
  time: Date;
}

export class CreateAttendanceRecordDto {
  @ApiProperty()
  @IsMongoId()
  employeeId: Types.ObjectId;

  @ApiProperty({ example: "IN" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePunchDto)
  @IsOptional()
  punches?: CreatePunchDto[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  exceptionIds?: Types.ObjectId[];

  @IsBoolean()
  @IsOptional()
  finalisedForPayroll?: boolean;
}

export class UpdateAttendanceRecordDto {
  @IsMongoId()
  @IsOptional()
  employeeId?: Types.ObjectId;

  @ApiProperty({ example: "IN" })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePunchDto)
  @IsOptional()
  punches?: UpdatePunchDto[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  exceptionIds?: Types.ObjectId[];

  @IsBoolean()
  @IsOptional()
  finalisedForPayroll?: boolean;
}

export class CreateHolidayDTO {
  @ApiProperty({example: 'ORGANIZATIONAL'})
  @IsEnum(HolidayType)
  type: HolidayType;

  @ApiProperty({ example: '2026-01-01', required: false })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-01-02', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateHolidayDTO {
  @ApiProperty({ example: 'ORGANIZATIONAL'})
  @IsEnum(HolidayType)
  type: HolidayType;

  @ApiProperty({ example: '2026-01-01', required: false })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-01-02', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class HolidayDto {
  @IsEnum(HolidayType)
  type: HolidayType;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}



export class TimeExceptionDto {
  @IsMongoId()
  employeeId: Types.ObjectId;

  @IsEnum(TimeExceptionType)
  type: TimeExceptionType;

  @IsMongoId()
  attendanceRecordId: Types.ObjectId;

  @IsMongoId()
  assignedTo: Types.ObjectId;

  @IsEnum(TimeExceptionStatus)
  @IsOptional()
  status?: TimeExceptionStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateTimeExceptionDto {
  @IsMongoId()
  employeeId: Types.ObjectId;

  @IsEnum(TimeExceptionType)
  type: TimeExceptionType;

  @IsMongoId()
  attendanceRecordId: Types.ObjectId;

  @IsMongoId()
  assignedTo: Types.ObjectId;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateTimeExceptionDto {
  @IsMongoId()
  @IsOptional()
  EmployeeId?: Types.ObjectId;
  
  @IsEnum(TimeExceptionType)
  @IsOptional()
  type?: TimeExceptionType;

  @IsMongoId()
  @IsOptional()
  AttendanceRecordId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  assignedTo?: Types.ObjectId;

  @IsEnum(TimeExceptionStatus)
  @IsOptional()
  status?: TimeExceptionStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class LatenessRuleDto {
  name: string;
  description?: string;
  gracePeriodMinutes: number;
  deductionForEachMinute: number;
  active: boolean;
}

export class CreateLatenessRuleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  gracePeriodMinutes: number;

  @IsNumber()
  @Min(0)
  deductionForEachMinute: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateLatenessRuleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  gracePeriodMinutes: number;

  @IsNumber()
  @Min(0)
  deductionForEachMinute: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreateAttendanceCorrectionRequestDto {
    @IsNotEmpty()
    employeeId: Types.ObjectId;

    @IsNotEmpty()
    attendanceRecord: Types.ObjectId;

    @IsOptional()
    reason?: string;
}

export class UpdateAttendanceCorrectionRequestDto {
    @IsOptional()
    reason?: string;

    @IsOptional()
    @IsEnum(CorrectionRequestStatus)
    status?: CorrectionRequestStatus;
}

export class AttendanceCorrectionRequestDto {
    employeeId: Types.ObjectId;
    attendanceRecord: Types.ObjectId;
    reason?: string;
    status: CorrectionRequestStatus;
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
