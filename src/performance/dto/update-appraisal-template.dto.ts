import { PartialType } from '@nestjs/mapped-types';
import { CreateAppraisalTemplateDto } from './create-appraisal-template.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAppraisalTemplateDto extends PartialType(
  CreateAppraisalTemplateDto,
) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
