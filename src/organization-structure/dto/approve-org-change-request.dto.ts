import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ApproveOrgChangeRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comments?: string;
}
