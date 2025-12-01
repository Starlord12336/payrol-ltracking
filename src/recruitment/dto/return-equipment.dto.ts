import { IsString, IsOptional } from 'class-validator';

export class ReturnEquipmentDto {
  @IsString()
  returnedBy: string;

  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
