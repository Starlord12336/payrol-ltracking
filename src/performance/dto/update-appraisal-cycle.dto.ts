import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalCycleDto } from './create-appraisal-cycle.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CycleStatus } from '../schemas/appraisal-cycle.schema';

export class UpdateAppraisalCycleDto extends PartialType(
  CreateAppraisalCycleDto,
) {
  @IsEnum(CycleStatus)
  @IsOptional()
  status?: CycleStatus;
}
