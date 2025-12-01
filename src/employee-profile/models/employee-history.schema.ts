import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type EmployeeHistoryDocument = HydratedDocument<EmployeeHistory>;

export enum ChangeType {
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  POSITION_CHANGE = 'POSITION_CHANGE',
  DEPARTMENT_CHANGE = 'DEPARTMENT_CHANGE',
  CONTACT_UPDATE = 'CONTACT_UPDATE',
  ADDRESS_UPDATE = 'ADDRESS_UPDATE',
  QUALIFICATION_ADDED = 'QUALIFICATION_ADDED',
  QUALIFICATION_REMOVED = 'QUALIFICATION_REMOVED',
  CHANGE_REQUEST_APPROVED = 'CHANGE_REQUEST_APPROVED',
  CHANGE_REQUEST_REJECTED = 'CHANGE_REQUEST_REJECTED',
  NOTE_ADDED = 'NOTE_ADDED',
  EMERGENCY_CONTACT_ADDED = 'EMERGENCY_CONTACT_ADDED',
  EMERGENCY_CONTACT_UPDATED = 'EMERGENCY_CONTACT_UPDATED',
  DEPENDENT_ADDED = 'DEPENDENT_ADDED',
  DEPENDENT_UPDATED = 'DEPENDENT_UPDATED',
  OTHER = 'OTHER',
}

@Schema({ _id: false })
export class FieldChange {
  @Prop({ type: String, required: true })
  field: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  oldValue?: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newValue?: any;
}

@Schema({ collection: 'employee_history', timestamps: true })
export class EmployeeHistory {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeProfileId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(ChangeType), required: true })
  changeType: ChangeType;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [FieldChange], default: [] })
  fieldChanges: FieldChange[];

  // Snapshot of employee profile at the time of change
  @Prop({ type: MongooseSchema.Types.Mixed })
  profileSnapshot?: any;

  // Reference to related entity (e.g., change request ID)
  @Prop({ type: Types.ObjectId })
  relatedEntityId?: Types.ObjectId;

  @Prop({ type: String })
  relatedEntityType?: string;

  // Metadata
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  changedBy: Types.ObjectId;

  @Prop({ type: String })
  changeReason?: string;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;
}

export const EmployeeHistorySchema = SchemaFactory.createForClass(EmployeeHistory);

// Indexes
EmployeeHistorySchema.index({ employeeProfileId: 1, createdAt: -1 });
EmployeeHistorySchema.index({ changeType: 1 });
EmployeeHistorySchema.index({ changedBy: 1 });
EmployeeHistorySchema.index({ createdAt: -1 });

