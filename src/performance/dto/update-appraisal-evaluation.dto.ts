import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalEvaluationDto } from './create-appraisal-evaluation.dto';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { EvaluationStatus } from '../schemas/appraisal-evaluation.schema';

export class UpdateAppraisalEvaluationDto extends PartialType(
  CreateAppraisalEvaluationDto,
) {
  @IsEnum(EvaluationStatus)
  @IsOptional()
  status?: EvaluationStatus;

  @IsString()
  @IsOptional()
  employeeComments?: string;
}

