import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateContactInfoDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  personalEmail?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  workEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  mobilePhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  homePhone?: string;
}
