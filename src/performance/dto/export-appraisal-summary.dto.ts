import { IsOptional, IsString, IsMongoId, IsEnum } from 'class-validator';

export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
}

export class ExportAppraisalSummaryDto {
  @IsOptional()
  @IsMongoId()
  cycleId?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsMongoId()
  employeeId?: string;

  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat = ExportFormat.CSV;

  @IsOptional()
  @IsString()
  status?: string; // Filter by assignment status
}

