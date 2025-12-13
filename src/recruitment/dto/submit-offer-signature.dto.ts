import { IsString, IsIn, IsOptional, Matches } from 'class-validator';

export class SubmitOfferSignatureDto {
  @IsIn(['image', 'typed'])
  type: 'image' | 'typed';

  @IsString()
  data: string; // base64 for image, plain text for typed

  @IsOptional()
  @IsString()
  signerName?: string;

  @IsOptional()
  @IsString()
  signedAt?: string; // ISO date string
}
