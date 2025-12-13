import { PartialType } from '@nestjs/mapped-types';
import { CreateOrgChangeRequestDto } from './create-org-change-request.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsMongoId,
  MaxLength,
} from 'class-validator';
import { StructureRequestStatus } from '../enums/organization-structure.enums';

export class UpdateOrgChangeRequestDto extends PartialType(
  CreateOrgChangeRequestDto,
) {
  @IsEnum(StructureRequestStatus)
  @IsOptional()
  status?: StructureRequestStatus;

  @IsMongoId()
  @IsOptional()
  targetDepartmentId?: string;

  @IsMongoId()
  @IsOptional()
  targetPositionId?: string;
}
