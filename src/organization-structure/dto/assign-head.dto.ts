import { IsMongoId, IsOptional } from 'class-validator';

export class AssignHeadDto {
  @IsMongoId()
  @IsOptional()
  headPositionId?: string; // null to remove department head position
}
