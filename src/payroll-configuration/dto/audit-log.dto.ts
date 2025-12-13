////////////////////////# Audit Trail DTOs - Eslam ##############

import {
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsDate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AuditAction, AuditEntityType } from '../models/audit-log.schema';

/**
 * DTO for filtering audit logs
 */
export class FilterAuditLogDto {
  @ApiPropertyOptional({
    description: 'Filter by entity type',
    enum: AuditEntityType,
  })
  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
  })
  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by action',
    enum: AuditAction,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    description: 'Filter by actor (employee) ID',
  })
  @IsOptional()
  @IsMongoId()
  actorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by end date',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}
