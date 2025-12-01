import { Types } from 'mongoose';

export class RevokeAccessDto {
  employeeId: Types.ObjectId;
  reason: string;
  accessType: string;
  revokedBy: Types.ObjectId;
  revokedAt: Date;
  comments?: string;
}

export class RevokeAccessResponseDto {
  _id: string;
  employeeId: string;
  status: string;
  reason: string;
  accessType: string;
  revokedBy: string;
  revokedAt: Date;
  comments?: string;
  message: string;
}

export class InactiveEmployeeDto {
  _id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  workEmail?: string;
  status: string;
  statusEffectiveFrom?: Date;
  revokedAt?: Date;
  reason?: string;
}

export class BulkRevokeAccessDto {
  employeeIds: Types.ObjectId[];
  reason: string;
  accessType: string;
  revokedBy: Types.ObjectId;
  comments?: string;
}
