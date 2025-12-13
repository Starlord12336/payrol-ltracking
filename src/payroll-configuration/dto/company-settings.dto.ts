////////////////////////# Company Wide Settings - Eslam ##############

import {
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

/**
 * DTO for creating company-wide settings
 * Business Rules:
 * - REQ-PY-15: Company-wide settings (pay dates, time zone, currency)
 * - Currency must be EGP
 */
export class CreateCompanySettingsDto {
  @ApiProperty({
    description: 'Pay date (day of month when payroll is processed)',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  payDate: Date;

  @ApiProperty({
    description: 'Time zone for payroll processing',
    example: 'Africa/Cairo',
  })
  @IsString()
  timeZone: string;

  @ApiProperty({
    description: 'Currency code (must be EGP)',
    example: 'EGP',
    default: 'EGP',
  })
  @IsString()
  @IsIn(['EGP'], {
    message: 'Currency must be EGP',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'ID of the employee creating this record',
  })
  @IsOptional()
  @IsMongoId()
  createdBy?: string;
}

/**
 * DTO for updating company-wide settings (only allowed in DRAFT status)
 */
export class UpdateCompanySettingsDto extends PartialType(
  CreateCompanySettingsDto,
) {}

/**
 * DTO for filtering company-wide settings
 */
export class FilterCompanySettingsDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ConfigStatus,
  })
  @IsOptional()
  @IsEnum(ConfigStatus)
  status?: ConfigStatus;

  @ApiPropertyOptional({
    description: 'Filter by currency',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}
