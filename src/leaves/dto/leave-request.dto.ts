import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveStatus } from '../enums/leave-status.enum';

export class SubmitLeaveRequestDto {
  @IsString()
  leaveTypeId: string;

  @Type(() => Date)
  @IsDate()
  fromDate: Date;

  @Type(() => Date)
  @IsDate()
  toDate: Date;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsString()
  attachmentId?: string;
}

export class ReviewLeaveRequestDto {
  @IsString()
  status: LeaveStatus;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class AdjustLeaveBalanceDto {
  @IsString()
  employeeId: string;

  @IsString()
  leaveTypeId: string;

  @IsNumber()
  adjustmentDays: number;

  @IsString()
  reason: string;
}

export class BulkProcessLeaveRequestsDto {
  @IsArray()
  @IsString({ each: true })
  requestIds: string[];

  @IsString()
  action: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  comments?: string;
}

export class AssignEntitlementDto {
  @IsString()
  employeeId: string;

  @IsString()
  leaveTypeId: string;

  @IsNumber()
  @Min(0)
  yearlyEntitlement: number;
}

export class GetLeaveBalanceDto {
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  leaveTypeId?: string;
}

export class SetHolidayDto {
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SetBlockedPeriodDto {
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsString()
  reason: string;
}
