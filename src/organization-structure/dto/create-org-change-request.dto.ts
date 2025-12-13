import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  ValidateNested,
  IsObject,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  StructureRequestType,
  StructureRequestStatus,
} from '../enums/organization-structure.enums';

export class ProposedChangeDto {
  @IsString()
  field: string;

  @IsOptional()
  currentValue?: any;

  @IsOptional()
  proposedValue?: any;

  @IsString()
  @MaxLength(500)
  reason: string;
}

export class CreateOrgChangeRequestDto {
  @IsEnum(StructureRequestType)
  requestType: StructureRequestType;

  @IsMongoId()
  @IsOptional()
  targetDepartmentId?: string;

  @IsMongoId()
  @IsOptional()
  targetPositionId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  details?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  reason?: string;
}
