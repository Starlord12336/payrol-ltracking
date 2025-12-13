import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateReferralDto {
  @IsMongoId()
  referringEmployeeId: string;

  @IsMongoId()
  candidateId: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  level?: string;
}
