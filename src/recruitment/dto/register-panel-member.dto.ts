import {
  IsString,
  IsOptional,
  IsArray,
  IsMongoId,
  IsEmail,
} from 'class-validator';

export class RegisterPanelMemberDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];
}
