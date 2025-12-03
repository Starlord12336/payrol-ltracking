import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Employee } from '../../shared/schemas/employee.schema';

export type EmployeeHistoryDocument = EmployeeHistory & Document;

export enum ChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  ORGANIZATIONAL_CHANGE = 'ORGANIZATIONAL_CHANGE',
}

export enum SourceType {
  CHANGE_REQUEST = 'CHANGE_REQUEST',
  DIRECT_UPDATE = 'DIRECT_UPDATE',
  SYSTEM_SYNC = 'SYSTEM_SYNC',
  MIGRATION = 'MIGRATION',
}

@Schema({ timestamps: false, collection: 'employee_history' })
export class EmployeeHistory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  // Snapshot
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  snapshot: Employee; // Complete employee record at this point in time

  // Change Context
  @Prop({ required: true, enum: Object.values(ChangeType) })
  changeType: ChangeType;

  @Prop({ required: true })
  changeReason: string;

  @Prop({ type: [String] })
  changedFields?: string[]; // List of fields that changed

  // Who and When
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  changedBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  changeDate: Date;

  // Source
  @Prop({ required: true, enum: Object.values(SourceType) })
  sourceType: SourceType;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  sourceId?: MongooseSchema.Types.ObjectId; // Reference to ChangeRequest or other source
}

export const EmployeeHistorySchema = SchemaFactory.createForClass(EmployeeHistory);

// Indexes
EmployeeHistorySchema.index({ employeeId: 1, changeDate: -1 });
EmployeeHistorySchema.index({ changeType: 1 });
EmployeeHistorySchema.index({ changeDate: -1 });
EmployeeHistorySchema.index({ changedBy: 1 });

