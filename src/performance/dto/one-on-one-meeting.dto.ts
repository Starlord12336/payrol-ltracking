import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
} from 'class-validator';

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export class OneOnOneMeetingDto {
  id?: string;
  managerId: string;
  employeeId: string;
  scheduledDate: Date;
  meetingNotes?: string;
  agenda?: string;
  status: MeetingStatus;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreateOneOnOneMeetingDto {
  @IsString()
  employeeId: string;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  agenda?: string;

  @IsString()
  @IsOptional()
  meetingNotes?: string;
}

export class UpdateOneOnOneMeetingDto {
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @IsString()
  @IsOptional()
  agenda?: string;

  @IsString()
  @IsOptional()
  meetingNotes?: string;

  @IsEnum(MeetingStatus)
  @IsOptional()
  status?: MeetingStatus;
}

