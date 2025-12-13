import { IsString, IsOptional } from 'class-validator';

export class CreateOrgChartSnapshotDto {
  @IsString()
  snapshotName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  purpose?: string; // SnapshotPurpose enum doesn't exist in schema
}
