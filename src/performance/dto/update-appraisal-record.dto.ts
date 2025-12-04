import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalRecordDto } from './create-appraisal-record.dto';
import { IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { AppraisalRecordStatus } from '../enums/performance.enums';

export class UpdateAppraisalRecordDto extends PartialType(
  CreateAppraisalRecordDto,
) {
  @IsEnum(AppraisalRecordStatus)
  @IsOptional()
  status?: AppraisalRecordStatus;

  @IsDateString()
  @IsOptional()
  employeeAcknowledgedAt?: string;

  @IsString()
  @IsOptional()
  employeeAcknowledgementComment?: string;
}
