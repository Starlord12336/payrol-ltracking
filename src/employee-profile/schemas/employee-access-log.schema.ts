import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmployeeAccessLogDocument = EmployeeAccessLog & Document;

export enum AccessType {
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT',
}

@Schema({ timestamps: false, collection: 'employee_access_logs' })
export class EmployeeAccessLog {
  // Who was viewed
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  // Who viewed
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  accessedBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  accessedByRole: string;

  // What was viewed
  @Prop({ type: [String], required: true })
  sections: string[]; // e.g., ["personalInfo", "compensationInfo"]

  @Prop({ required: true, enum: Object.values(AccessType) })
  accessType: AccessType;

  // Context
  @Prop()
  reason?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  // When
  @Prop({ required: true, default: Date.now })
  accessedAt: Date;
}

export const EmployeeAccessLogSchema = SchemaFactory.createForClass(EmployeeAccessLog);

// Indexes
EmployeeAccessLogSchema.index({ employeeId: 1, accessedAt: -1 });
EmployeeAccessLogSchema.index({ accessedBy: 1 });
EmployeeAccessLogSchema.index({ accessedAt: -1 });
EmployeeAccessLogSchema.index({ accessType: 1 });

