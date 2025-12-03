import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProfileAccessLogDocument = HydratedDocument<ProfileAccessLog>;

export enum AccessAction {
  VIEW = 'VIEW',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
}

@Schema({ collection: 'profile_access_logs', timestamps: true })
export class ProfileAccessLog {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeProfileId: Types.ObjectId; // Profile being accessed

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  accessedBy: Types.ObjectId; // User who accessed the profile

  @Prop({ type: String, enum: Object.values(AccessAction), required: true })
  action: AccessAction;

  @Prop({ type: String })
  details?: string; // Additional details about what was accessed

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: Boolean, default: false })
  isAuthorized: boolean; // Whether the access was authorized

  @Prop({ type: String })
  reason?: string; // Reason for access (for compliance)
}

export const ProfileAccessLogSchema = SchemaFactory.createForClass(ProfileAccessLog);

// Indexes
ProfileAccessLogSchema.index({ employeeProfileId: 1, createdAt: -1 });
ProfileAccessLogSchema.index({ accessedBy: 1, createdAt: -1 });
ProfileAccessLogSchema.index({ action: 1 });
ProfileAccessLogSchema.index({ createdAt: -1 });
ProfileAccessLogSchema.index({ isAuthorized: 1 });

