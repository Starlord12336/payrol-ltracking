import { IsString, IsOptional } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  itemType: string; // e.g., 'laptop', 'phone', 'badge'

  @IsOptional()
  @IsString()
  preferredModel?: string;

  @IsOptional()
  @IsString()
  requestedBy?: string;
}
