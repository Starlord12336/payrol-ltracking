import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SnapshotPurpose } from '../schemas/org-chart-snapshot.schema';

export class CreateOrgChartSnapshotDto {
  @IsString()
  snapshotName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SnapshotPurpose)
  purpose: SnapshotPurpose;
}

