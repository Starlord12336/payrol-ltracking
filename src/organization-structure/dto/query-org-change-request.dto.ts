import {
  IsOptional,
  IsString,
  IsEnum,
  IsMongoId,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  StructureRequestType,
  StructureRequestStatus,
} from '../enums/organization-structure.enums';

export class QueryOrgChangeRequestDto {
  @IsOptional()
  @IsString()
  requestNumber?: string;

  @IsOptional()
  @IsEnum(StructureRequestType)
  requestType?: StructureRequestType;

  @IsOptional()
  @IsEnum(StructureRequestStatus)
  status?: StructureRequestStatus;

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
