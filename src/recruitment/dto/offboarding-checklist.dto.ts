import {
  IsMongoId,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';
import { Types } from 'mongoose';
import { ApprovalStatus } from '../enums/approval-status.enum';

export class CreateOffboardingChecklistDto {
  @IsMongoId()
  terminationId: Types.ObjectId;
}

export class OffboardingItemDto {
  @IsString()
  department: string;

  @IsOptional()
  @IsString()
  comments?: string;
}

export class EquipmentItemDto {
  @IsString()
  name: string;

  @IsBoolean()
  returned: boolean;

  @IsOptional()
  @IsString()
  condition?: string;
}

export class UpdateOffboardingChecklistDto {
  @IsOptional()
  @IsArray()
  items?: Array<{
    department: string;
    status: ApprovalStatus;
    comments?: string;
  }>;

  @IsOptional()
  @IsArray()
  equipmentList?: EquipmentItemDto[];

  @IsOptional()
  @IsBoolean()
  cardReturned?: boolean;
}

export class OffboardingChecklistResponseDto {
  _id: string;
  terminationId: string;
  items: Array<{
    department: string;
    status: string;
    comments?: string;
    updatedAt?: Date;
  }>;
  equipmentList: EquipmentItemDto[];
  cardReturned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OffboardingChecklistSummaryDto {
  totalItems: number;
  approvedItems: number;
  pendingItems: number;
  rejectedItems: number;
  completionPercentage: number;
  equipmentReturned: number;
  totalEquipment: number;
  cardReturned: boolean;
  overallStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'INCOMPLETE';
}
