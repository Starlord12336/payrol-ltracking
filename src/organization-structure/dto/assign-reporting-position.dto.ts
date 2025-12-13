import { IsMongoId, IsOptional } from 'class-validator';

export class AssignReportingPositionDto {
  @IsMongoId()
  @IsOptional()
  reportsToPositionId?: string; // null to remove reporting relationship (make it top-level)
}
