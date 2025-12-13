import {
  IsMongoId,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReportingLineDto {
  @IsMongoId()
  employeeId: string;

  @IsMongoId()
  managerId: string;

  @IsString()
  @IsOptional()
  reportingType?: string; // ReportingType enum doesn't exist in schema

  @IsString()
  @IsOptional()
  @MaxLength(50)
  contextType?: string; // e.g., 'PROJECT', 'DEPARTMENT', 'FUNCTION'

  @IsMongoId()
  @IsOptional()
  contextId?: string;

  @IsBoolean()
  @IsOptional()
  canApproveLeave?: boolean;

  @IsBoolean()
  @IsOptional()
  canApproveTimesheet?: boolean;

  @IsBoolean()
  @IsOptional()
  canApproveExpenses?: boolean;

  @IsBoolean()
  @IsOptional()
  canConductAppraisal?: boolean;

  @IsDateString()
  effectiveDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
