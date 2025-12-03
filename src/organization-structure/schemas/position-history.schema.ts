import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Position } from '../../shared/schemas/position.schema';

export type PositionHistoryDocument = PositionHistory & Document;

export enum PositionChangeType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  EMPLOYEE_ASSIGNED = 'EMPLOYEE_ASSIGNED',
  EMPLOYEE_UNASSIGNED = 'EMPLOYEE_UNASSIGNED',
  REPORTING_CHANGED = 'REPORTING_CHANGED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum PositionSourceType {
  CHANGE_REQUEST = 'CHANGE_REQUEST',
  DIRECT_UPDATE = 'DIRECT_UPDATE',
  SYSTEM_SYNC = 'SYSTEM_SYNC',
}

@Schema({ timestamps: false, collection: 'position_history' })
export class PositionHistory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position', required: true })
  positionId: MongooseSchema.Types.ObjectId;

  // What Changed
  @Prop({ required: true, enum: Object.values(PositionChangeType) })
  changeType: PositionChangeType;

  // For assignment changes
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee' })
  employeeId?: MongooseSchema.Types.ObjectId;

  // Snapshot
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  positionSnapshot: Position; // Complete position record at this point

  // Details
  @Prop({ required: true })
  changeDescription: string;

  @Prop({ type: [String] })
  changedFields?: string[];

  // Who and When
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  changedBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  changeDate: Date;

  @Prop({ required: true })
  effectiveDate: Date;

  // Source
  @Prop({ required: true, enum: Object.values(PositionSourceType) })
  sourceType: PositionSourceType;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  sourceId?: MongooseSchema.Types.ObjectId;
}

export const PositionHistorySchema = SchemaFactory.createForClass(PositionHistory);

// Indexes
PositionHistorySchema.index({ positionId: 1, changeDate: -1 });
PositionHistorySchema.index({ employeeId: 1 });
PositionHistorySchema.index({ changeType: 1 });
PositionHistorySchema.index({ effectiveDate: 1 });

