import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ReviewOrgChangeRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reviewComments?: string;
}

