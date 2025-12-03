import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmployeeChangeRequestDocument = EmployeeChangeRequest & Document;

export enum RequestType {
  SELF_SERVICE_UPDATE = 'SELF_SERVICE_UPDATE',
  HR_CORRECTION = 'HR_CORRECTION',
  MANAGER_UPDATE = 'MANAGER_UPDATE',
}

export enum ChangeRequestStatus {
  DRAFT = 'DRAFT',
  PENDING_HR_REVIEW = 'PENDING_HR_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ChangeSection {
  PERSONAL_INFO = 'PERSONAL_INFO',
  CONTACT_INFO = 'CONTACT_INFO',
  EMPLOYMENT_INFO = 'EMPLOYMENT_INFO',
  ORGANIZATIONAL_INFO = 'ORGANIZATIONAL_INFO',
  COMPENSATION_INFO = 'COMPENSATION_INFO',
}

@Schema({ _id: false })
export class ChangeItem {
  @Prop({ required: true, enum: Object.values(ChangeSection) })
  section: ChangeSection;

  @Prop({ required: true })
  field: string; // e.g., "contactInfo.phoneNumber"

  @Prop({ required: true })
  fieldLabel: string; // Human-readable, e.g., "Phone Number"

  @Prop({ type: MongooseSchema.Types.Mixed })
  oldValue: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newValue: any;

  @Prop({ required: true })
  requiresApproval: boolean;
}

@Schema({ timestamps: true, collection: 'employee_change_requests' })
export class EmployeeChangeRequest {
  @Prop({ required: true, unique: true, uppercase: true })
  requestNumber: string; // Auto-generated, e.g., "ECR-2025-001"

  @Prop({ required: true, enum: Object.values(RequestType) })
  requestType: RequestType;

  // Employee
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  // Changes Requested
  @Prop({ type: [ChangeItem], required: true })
  changes: ChangeItem[];

  // Justification
  @Prop({ required: true })
  reason: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'DocumentModel', default: [] })
  attachments: MongooseSchema.Types.ObjectId[];

  // Workflow
  @Prop({ required: true, enum: Object.values(ChangeRequestStatus), default: ChangeRequestStatus.DRAFT })
  status: ChangeRequestStatus;

  @Prop({ required: true, enum: Object.values(Priority), default: Priority.MEDIUM })
  priority: Priority;

  // Approval Chain
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  submittedBy: MongooseSchema.Types.ObjectId;

  @Prop()
  submittedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  reviewComments?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  appliedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  appliedAt?: Date;

  @Prop()
  expiresAt?: Date; // Auto-reject if not processed within X days
}

export const EmployeeChangeRequestSchema = SchemaFactory.createForClass(EmployeeChangeRequest);

// Indexes
EmployeeChangeRequestSchema.index({ requestNumber: 1 }, { unique: true });
EmployeeChangeRequestSchema.index({ employeeId: 1 });
EmployeeChangeRequestSchema.index({ status: 1 });
EmployeeChangeRequestSchema.index({ submittedAt: -1 });
EmployeeChangeRequestSchema.index({ submittedBy: 1 });
EmployeeChangeRequestSchema.index({ priority: 1 });

