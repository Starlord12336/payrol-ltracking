import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalEvaluationDto } from './create-appraisal-evaluation.dto';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { AppraisalRecordStatus } from '../enums/performance.enums';

export class UpdateAppraisalEvaluationDto extends PartialType(
  CreateAppraisalEvaluationDto,
) {
  @IsEnum(AppraisalRecordStatus)
  @IsOptional()
  status?: AppraisalRecordStatus;

  @IsString()
  @IsOptional()
  employeeComments?: string;
}
