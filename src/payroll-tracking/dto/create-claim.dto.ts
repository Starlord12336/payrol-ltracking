import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  claimType: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
