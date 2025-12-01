import { PartialType } from '@nestjs/mapped-types';
import { CreateOrgChangeRequestDto } from './create-org-change-request.dto';
import { IsEnum, IsOptional, IsString, IsMongoId, MaxLength } from 'class-validator';
import { OrgChangeStatus } from '../schemas/org-change-request.schema';

export class UpdateOrgChangeRequestDto extends PartialType(CreateOrgChangeRequestDto) {
  @IsEnum(OrgChangeStatus)
  @IsOptional()
  status?: OrgChangeStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reviewComments?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  approvalComments?: string;
}

