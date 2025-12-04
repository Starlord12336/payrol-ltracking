// import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
// import { ProfileChangeStatus } from '../enums/employee-profile.enums';

// export class ReviewChangeRequestDto {
//   @IsEnum(ProfileChangeStatus)
//   status: ProfileChangeStatus; // APPROVED or REJECTED

//   @IsOptional()
//   @IsString()
//   @MaxLength(1000)
//   reviewComment?: string;
// }

// // You might restrict status to only APPROVED/REJECTED in the controller, but this is fine for now.

// src/employee-profile/dto/review-change-request.dto.ts
// src/employee-profile/dto/review-change-request.dto.ts

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';

export class ReviewChangeRequestDto {
  @IsEnum(ProfileChangeStatus)
  status: ProfileChangeStatus; // PENDING / APPROVED / REJECTED / CANCELED

  @IsOptional()
  @IsString()
  reason?: string;
}
