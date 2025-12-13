import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class AddOfferApproverDto {
  @IsMongoId()
  employeeId: string;

  @IsString()
  role: string;

  @IsString()
  status: string; // 'approved' | 'rejected' | 'pending'

  @IsOptional()
  @IsString()
  comment?: string;
}
