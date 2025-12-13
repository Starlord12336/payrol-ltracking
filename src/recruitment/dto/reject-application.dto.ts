import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class RejectApplicationDto {
  @IsOptional()
  @IsString()
  templateKey?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsMongoId()
  changedBy?: string;
}
