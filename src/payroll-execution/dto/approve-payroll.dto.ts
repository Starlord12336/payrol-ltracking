import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class ApprovePayrollDto {
  @IsMongoId()
  @IsNotEmpty()
  managerId: string;
}

export class RejectPayrollDto {
  @IsMongoId()
  @IsNotEmpty()
  managerId: string;

  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}

export class FinanceApproveDto {
  @IsMongoId()
  @IsNotEmpty()
  financeStaffId: string;
}

export class FinanceRejectDto {
  @IsMongoId()
  @IsNotEmpty()
  financeStaffId: string;

  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}

export class PublishPayrollDto {
  @IsMongoId()
  @IsNotEmpty()
  specialistId: string;
}

export class ApprovalResponseDto {
  runId: string;
  status: string;
  approvedBy?: string;
  approvalDate?: Date;
  message: string;
}
