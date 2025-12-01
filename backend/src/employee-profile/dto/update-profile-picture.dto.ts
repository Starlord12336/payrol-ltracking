import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateProfilePictureDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  profilePictureUrl: string;
}
