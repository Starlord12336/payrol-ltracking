import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class LockPayrollDto {
  @IsMongoId()
  @IsNotEmpty()
  managerId: string;
}

export class UnlockPayrollDto {
  @IsMongoId()
  @IsNotEmpty()
  managerId: string;

  @IsString()
  @IsNotEmpty()
  unlockReason: string;
}

export class LockResponseDto {
  runId: string;
  status: string;
  message: string;
  reason?: string;
}
