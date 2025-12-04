import { PartialType } from '@nestjs/mapped-types';
import { CreatePerformanceFeedbackDto } from './create-performance-feedback.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdatePerformanceFeedbackDto extends PartialType(
  CreatePerformanceFeedbackDto,
) {
  @IsString()
  @IsOptional()
  recipientResponse?: string;
}
