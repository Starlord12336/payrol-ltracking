import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMyProfileDto {
  // Contact Info
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @IsOptional()
  @IsString()
  homePhone?: string;

  @IsOptional()
  @IsEmail()
  workEmail?: string;

  // Address
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  country?: string;

  // Profile Picture
  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  // Biography (US-E2-12)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  biography?: string;
}
