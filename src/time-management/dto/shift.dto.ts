import { PunchPolicy, ShiftAssignmentStatus } from '../enums';
import {
  IsBoolean,
  isDate,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  isEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ShiftType } from '../models/shift-type.schema';

export class CreateShiftDto {
  @ApiProperty({ description: 'Shift name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Shift type (TYPE yk)' })
  @IsEnum(ShiftType)
  shiftType: ShiftType;
  

  @ApiProperty({ description: 'Start time (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'End time (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({ enum: PunchPolicy })
  @IsEnum(PunchPolicy)
  @IsOptional()
  punchPolicy?: PunchPolicy;

  @ApiPropertyOptional({ description: 'Grace minutes allowed for check-in' })
  @IsNumber()
  @IsOptional()
  graceInMinutes?: number;

  @ApiPropertyOptional({ description: 'Grace minutes allowed for check-out' })
  @IsNumber()
  @IsOptional()
  graceOutMinutes?: number;

  @ApiPropertyOptional({ description: 'If true, overtime requires approval' })
  @IsBoolean()
  @IsOptional()
  requiresApprovalForOvertime?: boolean;

  @ApiPropertyOptional({ description: 'Whether shift is active' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateShiftDto {
  @ApiProperty({ description: 'Shift name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Shift type (TYPE yk)' })
  @IsEnum(ShiftType)
  shiftType: ShiftType;

  @ApiProperty({ description: 'Start time (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'End time (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({ enum: PunchPolicy })
  @IsEnum(PunchPolicy)
  @IsOptional()
  punchPolicy?: PunchPolicy;

  @ApiPropertyOptional({ description: 'Grace minutes allowed for check-in' })
  @IsNumber()
  @IsOptional()
  graceInMinutes?: number;

  @ApiPropertyOptional({ description: 'Grace minutes allowed for check-out' })
  @IsNumber()
  @IsOptional()
  graceOutMinutes?: number;

  @ApiPropertyOptional({ description: 'If true, overtime requires approval' })
  @IsBoolean()
  @IsOptional()
  requiresApprovalForOvertime?: boolean;

  @ApiPropertyOptional({ description: 'Whether shift is active' })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
export class UpdateShiftAssignmentDto {
  @ApiPropertyOptional({ description: 'Employee ID' })
  @IsMongoId()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Position ID' })
  @IsMongoId()
  @IsOptional()
  positionId?: string;

  @ApiPropertyOptional({ description: 'Shift ID' })
  @IsMongoId()
  @IsOptional()
  shiftId?: string;

  @ApiPropertyOptional({ description: 'Shift ID' })
  @IsMongoId()
  @IsOptional()
  ruleId?: string;

  @ApiProperty()
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty()
  @IsEnum(ShiftAssignmentStatus)
  @IsOptional()
  status: ShiftAssignmentStatus;
}

// DTO used for creating a new ShiftType
//
//

export class CreateShiftTypeDto {
  @ApiProperty({ example: 'Morning Shift', description: 'Name of the shift type' })
  @IsString()
  name: string;

  @ApiProperty({ example: true, description: 'Whether the shift type is active', default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}

export class ShiftTypeDto {
  @ApiProperty({ example: 'Morning Shift', description: 'Name of the shift type' })
  name: string;

  @ApiProperty({ example: true, description: 'Whether the shift type is active' })
  active: boolean;
}

export class UpdateShiftTypeDto {
  @ApiProperty({ example: 'Evening Shift', description: 'Updated name of the shift type', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: false, description: 'Updated active status', required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
