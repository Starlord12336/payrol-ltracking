import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class ReviewOrgChangeRequestDto {
  @IsBoolean()
  approved: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comments?: string;
}
