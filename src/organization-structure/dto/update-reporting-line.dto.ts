import { PartialType } from '@nestjs/mapped-types';
import { CreateReportingLineDto } from './create-reporting-line.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReportingLineDto extends PartialType(
  CreateReportingLineDto,
) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
