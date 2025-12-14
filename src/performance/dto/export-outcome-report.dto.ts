import { IsOptional, IsString, IsMongoId, IsEnum } from 'class-validator';

export enum OutcomeReportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  JSON = 'json',
}

export class ExportOutcomeReportDto {
  @IsOptional()
  @IsMongoId()
  cycleId?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @IsEnum(OutcomeReportFormat)
  format?: OutcomeReportFormat = OutcomeReportFormat.CSV;

  @IsOptional()
  @IsString()
  includeHighPerformers?: string; // 'true' or 'false'

  @IsOptional()
  @IsString()
  includePIPs?: string; // 'true' or 'false'

  @IsOptional()
  @IsString()
  includeDisputes?: string; // 'true' or 'false'
}

