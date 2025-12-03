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
  OrgRequestType,
  TargetType,
  OrgChangePriority,
} from '../schemas/org-change-request.schema';

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
  @IsEnum(OrgRequestType)
  requestType: OrgRequestType;

  @IsEnum(TargetType)
  targetType: TargetType;

  @IsMongoId()
  @IsOptional()
  targetId?: string; // ID of existing entity (for updates)

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProposedChangeDto)
  @IsOptional()
  proposedChanges?: ProposedChangeDto[];

  @IsObject()
  @IsOptional()
  newEntityData?: Record<string, any>;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  impactedEmployees?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  impactedDepartments?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  impactedPositions?: string[];

  @IsString()
  @MaxLength(2000)
  businessJustification: string;

  @IsDateString()
  effectiveDate: string;

  @IsEnum(OrgChangePriority)
  @IsOptional()
  priority?: OrgChangePriority;
}

