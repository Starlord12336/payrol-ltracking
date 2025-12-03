import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  VIEW = 'VIEW',
}

@Schema({ _id: false })
export class ChangeDetail {
  @Prop({ required: true })
  field: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  oldValue?: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newValue?: any;
}

@Schema({ timestamps: false, collection: 'audit_logs' })
export class AuditLog {
  // Who
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  userRole: string;

  // What
  @Prop({ required: true, enum: Object.values(AuditAction) })
  action: AuditAction;

  @Prop({ required: true })
  entity: string; // e.g., "Employee", "Department", "LeaveRequest"

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  entityId: MongooseSchema.Types.ObjectId;

  // Changes
  @Prop({ type: [ChangeDetail] })
  changes?: ChangeDetail[];

  // Context
  @Prop()
  reason?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  // When
  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  // Where (optional)
  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ timestamp: -1 }); // Descending for recent first
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 }); // Compound for entity history

