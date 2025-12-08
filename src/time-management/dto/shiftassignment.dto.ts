import { Types } from "mongoose";
import { IsDate, IsEnum, IsMongoId, IsOptional, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShiftAssignmentStatus } from "../enums";

export class ShiftAssignmentDto {
  _id?: Types.ObjectId;
  employeeId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  positionId?: Types.ObjectId;
  shiftId: Types.ObjectId;
  scheduleRuleId?: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  status: ShiftAssignmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreateShiftAssignmentDtoDepartment {
  @ApiProperty({
    description: 'ID of the department to assign the shift to',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  departmentId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the shift to assign',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
    required: true
  })
  @IsNotEmpty()
  @IsMongoId()
  shiftId: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the schedule rule governing this assignment',
    example: '507f1f77bcf86cd799439013',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  scheduleRuleId?: Types.ObjectId;

  @ApiProperty({
    description: 'Start date of the shift assignment',
    example: '2024-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'End date of the shift assignment (optional for ongoing assignments)',
    example: '2024-12-31T23:59:59.999Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    description: 'Status of the shift assignment',
    enum: ShiftAssignmentStatus,
    example: ShiftAssignmentStatus.APPROVED,
    default: ShiftAssignmentStatus.APPROVED
  })
  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;
}

export class UpdateShiftAssignmentDtoDepartment {
  @ApiProperty({
    description: 'ID of the department to assign the shift to',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  departmentId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the shift to assign',
    example: '507f1f77bcf86cd799439012',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  shiftId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the schedule rule governing this assignment',
    example: '507f1f77bcf86cd799439013',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  scheduleRuleId?: Types.ObjectId;

  @ApiProperty({
    description: 'Start date of the shift assignment',
    example: '2024-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    description: 'End date of the shift assignment',
    example: '2024-12-31T23:59:59.999Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    description: 'Status of the shift assignment',
    enum: ShiftAssignmentStatus,
    example: ShiftAssignmentStatus.APPROVED
  })
  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;
}

export class CreateShiftAssignmentDtoEmployee {
  @ApiProperty({
    description: 'ID of the employee to assign the shift to',
    example: '507f1f77bcf86cd799439014',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  employeeId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the shift to assign',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
    required: true
  })
  @IsNotEmpty()
  @IsMongoId()
  shiftId: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the schedule rule governing this assignment',
    example: '507f1f77bcf86cd799439013',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  scheduleRuleId?: Types.ObjectId;

  @ApiProperty({
    description: 'Start date of the shift assignment',
    example: '2024-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'End date of the shift assignment (optional for ongoing assignments)',
    example: '2024-12-31T23:59:59.999Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    description: 'Status of the shift assignment',
    enum: ShiftAssignmentStatus,
    example: ShiftAssignmentStatus.APPROVED,
    default: ShiftAssignmentStatus.APPROVED
  })
  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;
}

export class UpdateShiftAssignmentDtoEmployee {
  @ApiProperty({
    description: 'ID of the employee to assign the shift to',
    example: '507f1f77bcf86cd799439014',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  employeeId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the shift to assign',
    example: '507f1f77bcf86cd799439012',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  shiftId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the schedule rule governing this assignment',
    example: '507f1f77bcf86cd799439013',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  scheduleRuleId?: Types.ObjectId;

  @ApiProperty({
    description: 'Start date of the shift assignment',
    example: '2024-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    description: 'End date of the shift assignment',
    example: '2024-12-31T23:59:59.999Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    description: 'Status of the shift assignment',
    enum: ShiftAssignmentStatus,
    example: ShiftAssignmentStatus.APPROVED
  })
  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;
}

export class CreateShiftAssignmentDtoPosition {
  @ApiProperty({
    description: 'ID of the position to assign the shift to',
    example: '507f1f77bcf86cd799439015',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  positionId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the shift to assign',
    example: '507f1f77bcf86cd799439012',
    type: 'string',
    required: true
  })
  @IsNotEmpty()
  @IsMongoId()
  shiftId: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the schedule rule governing this assignment',
    example: '507f1f77bcf86cd799439013',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  scheduleRuleId?: Types.ObjectId;

  @ApiProperty({
    description: 'Start date of the shift assignment',
    example: '2024-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'End date of the shift assignment (optional for ongoing assignments)',
    example: '2024-12-31T23:59:59.999Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    description: 'Status of the shift assignment',
    enum: ShiftAssignmentStatus,
    example: ShiftAssignmentStatus.APPROVED,
    default: ShiftAssignmentStatus.APPROVED
  })
  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;
}

export class UpdateShiftAssignmentDtoPosition {
  @ApiProperty({
    description: 'ID of the position to assign the shift to',
    example: '507f1f77bcf86cd799439015',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  positionId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the shift to assign',
    example: '507f1f77bcf86cd799439012',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  shiftId?: Types.ObjectId;

  @ApiProperty({
    description: 'ID of the schedule rule governing this assignment',
    example: '507f1f77bcf86cd799439013',
    type: 'string'
  })
  @IsOptional()
  @IsMongoId()
  scheduleRuleId?: Types.ObjectId;

  @ApiProperty({
    description: 'Start date of the shift assignment',
    example: '2024-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    description: 'End date of the shift assignment',
    example: '2024-12-31T23:59:59.999Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    description: 'Status of the shift assignment',
    enum: ShiftAssignmentStatus,
    example: ShiftAssignmentStatus.APPROVED
  })
  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;
}