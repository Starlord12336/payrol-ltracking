import { IsString, IsOptional } from 'class-validator';

export class RevokeAccessDto {
  @IsString()
  revokedBy: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
