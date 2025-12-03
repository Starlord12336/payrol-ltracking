// src/employee-profile/dto/update-address.dto.ts

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  streetAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;
}
