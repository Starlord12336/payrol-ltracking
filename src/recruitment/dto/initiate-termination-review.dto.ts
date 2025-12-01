import { IsMongoId, IsString, IsOptional, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class InitiateTerminationReviewDto {
  @IsMongoId()
  employeeId: Types.ObjectId;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  employeeComments?: string;

  @IsOptional()
  @IsString()
  hrComments?: string;

  @IsMongoId()
  contractId: Types.ObjectId;
}

export class PerformanceDataForReviewDto {
  employeeId: Types.ObjectId;
  recentAppraisalScore?: number;
  warningsCount: number;
  lowPerformanceIndicators: string[];
  appraisalRecordIds: string[];
  lastAppraisalDate?: Date;
}

export class TerminationReviewResponseDto {
  _id: string;
  employeeId: string;
  reason: string;
  status: string;
  initiator: string;
  performanceData?: PerformanceDataForReviewDto;
  createdAt: Date;
  updatedAt: Date;
}
