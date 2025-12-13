import { IsString, IsOptional } from 'class-validator';

export class AssignEquipmentDto {
  @IsString()
  assignedBy: string;

  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
