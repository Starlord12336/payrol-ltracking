import { IsOptional, IsString, IsEnum, IsMongoId, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OrgRequestType, TargetType, OrgChangeStatus, OrgChangePriority } from '../schemas/org-change-request.schema';

export class QueryOrgChangeRequestDto {
  @IsOptional()
  @IsString()
  requestNumber?: string;

  @IsOptional()
  @IsEnum(OrgRequestType)
  requestType?: OrgRequestType;

  @IsOptional()
  @IsEnum(TargetType)
  targetType?: TargetType;

  @IsOptional()
  @IsMongoId()
  targetId?: string;

  @IsOptional()
  @IsEnum(OrgChangeStatus)
  status?: OrgChangeStatus;

  @IsOptional()
  @IsEnum(OrgChangePriority)
  priority?: OrgChangePriority;

  @IsOptional()
  @IsMongoId()
  requestedBy?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'requestedAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

