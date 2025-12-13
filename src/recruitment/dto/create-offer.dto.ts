import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  IsMongoId,
} from 'class-validator';

export class CreateOfferDto {
  @IsMongoId()
  applicationId: string;

  @IsMongoId()
  candidateId: string;

  @IsOptional()
  @IsMongoId()
  hrEmployeeId?: string;

  @IsNumber()
  grossSalary: number;

  @IsOptional()
  @IsNumber()
  signingBonus?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  @IsString()
  conditions?: string;

  @IsOptional()
  @IsString()
  insurances?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
