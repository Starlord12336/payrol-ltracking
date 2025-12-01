import { IsBoolean, IsString, IsOptional, IsMongoId } from 'class-validator';

export class SaveConsentDto {
  @IsBoolean()
  granted: boolean;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsMongoId()
  givenBy?: string;

  @IsOptional()
  @IsString()
  details?: string;
}
