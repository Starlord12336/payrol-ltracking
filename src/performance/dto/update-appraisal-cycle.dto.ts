import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalCycleDto } from './create-appraisal-cycle.dto';
import { IsString, IsOptional } from 'class-validator';
import { AppraisalCycleStatus } from '../enums/performance.enums';

export class UpdateAppraisalCycleDto extends PartialType(
  CreateAppraisalCycleDto,
) {
  @IsString()
  @IsOptional()
  status?: string; // AppraisalCycleStatus as string
}
