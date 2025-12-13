import { IsOptional, IsString, IsBoolean, IsMongoId } from 'class-validator';

export class PrioritizeApplicationDto {
  @IsOptional()
  @IsMongoId()
  changedBy?: string;

  @IsOptional()
  @IsBoolean()
  expedite?: boolean;

  @IsOptional()
  @IsString()
  expediteToStage?: string;
}
