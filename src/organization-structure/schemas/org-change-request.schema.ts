import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrgChangeRequestDocument = OrgChangeRequest & Document;

export enum OrgRequestType {
  CREATE_DEPARTMENT = 'CREATE_DEPARTMENT',
  UPDATE_DEPARTMENT = 'UPDATE_DEPARTMENT',
  DEACTIVATE_DEPARTMENT = 'DEACTIVATE_DEPARTMENT',
  CREATE_POSITION = 'CREATE_POSITION',
  UPDATE_POSITION = 'UPDATE_POSITION',
  DEACTIVATE_POSITION = 'DEACTIVATE_POSITION',
  CHANGE_REPORTING_LINE = 'CHANGE_REPORTING_LINE',
  TRANSFER_EMPLOYEE = 'TRANSFER_EMPLOYEE',
  REORGANIZATION = 'REORGANIZATION',
}

export enum TargetType {
  DEPARTMENT = 'DEPARTMENT',
  POSITION = 'POSITION',
  REPORTING_LINE = 'REPORTING_LINE',
  EMPLOYEE_ASSIGNMENT = 'EMPLOYEE_ASSIGNMENT',
}

export enum OrgChangeStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IMPLEMENTED = 'IMPLEMENTED',
  CANCELLED = 'CANCELLED',
}

export enum OrgChangePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Schema({ _id: false })
export class ProposedChange {
  @Prop({ required: true })
  field: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  currentValue: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  proposedValue: any;

  @Prop({ required: true })
  reason: string;
}

@Schema({ timestamps: true, collection: 'org_change_requests' })
export class OrgChangeRequest {
  // Request Details
  @Prop({ required: true, unique: true, uppercase: true })
  requestNumber: string; // Auto-generated

  @Prop({ required: true, enum: Object.values(OrgRequestType) })
  requestType: OrgRequestType;

  // What's Being Changed
  @Prop({ required: true, enum: Object.values(TargetType) })
  targetType: TargetType;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  targetId?: MongooseSchema.Types.ObjectId; // ID of existing entity (for updates)

  // Proposed Changes
  @Prop({ type: [ProposedChange] })
  proposedChanges?: ProposedChange[];

  // For new entities
  @Prop({ type: MongooseSchema.Types.Mixed })
  newEntityData?: Record<string, any>;

  // Impact Analysis
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Employee', default: [] })
  impactedEmployees: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Department', default: [] })
  impactedDepartments: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Position', default: [] })
  impactedPositions: MongooseSchema.Types.ObjectId[];

  // Justification
  @Prop({ required: true })
  businessJustification: string;

  @Prop({ required: true })
  effectiveDate: Date;

  // Workflow
  @Prop({ required: true, enum: Object.values(OrgChangeStatus), default: OrgChangeStatus.DRAFT })
  status: OrgChangeStatus;

  @Prop({ required: true, enum: Object.values(OrgChangePriority), default: OrgChangePriority.MEDIUM })
  priority: OrgChangePriority;

  // Approval Chain
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  requestedBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  requestedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  reviewComments?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop()
  approvalComments?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  implementedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  implementedAt?: Date;

  // Attachments
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'DocumentModel', default: [] })
  attachments: MongooseSchema.Types.ObjectId[];
}

export const OrgChangeRequestSchema = SchemaFactory.createForClass(OrgChangeRequest);

// Indexes
OrgChangeRequestSchema.index({ requestNumber: 1 }, { unique: true });
OrgChangeRequestSchema.index({ targetType: 1, targetId: 1 });
OrgChangeRequestSchema.index({ status: 1 });
OrgChangeRequestSchema.index({ requestedBy: 1 });
OrgChangeRequestSchema.index({ effectiveDate: 1 });
OrgChangeRequestSchema.index({ priority: 1 });

