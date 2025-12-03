// src/employee-profile/dto/submit-change-request.dto.ts

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SubmitChangeRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  requestDescription: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason: string;
}
