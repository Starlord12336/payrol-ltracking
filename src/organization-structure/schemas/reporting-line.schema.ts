import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReportingLineDocument = ReportingLine & Document;

export enum ReportingType {
  DIRECT = 'DIRECT',
  DOTTED = 'DOTTED',
  FUNCTIONAL = 'FUNCTIONAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
}

@Schema({ timestamps: true, collection: 'reporting_lines' })
export class ReportingLine {
  // Relationship
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  managerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: Object.values(ReportingType) })
  reportingType: ReportingType;

  // Context
  @Prop()
  contextType?: string; // e.g., 'PROJECT', 'DEPARTMENT', 'FUNCTION'

  @Prop({ type: MongooseSchema.Types.ObjectId })
  contextId?: MongooseSchema.Types.ObjectId;

  // Approval Authority
  @Prop({ default: false })
  canApproveLeave: boolean;

  @Prop({ default: false })
  canApproveTimesheet: boolean;

  @Prop({ default: false })
  canApproveExpenses: boolean;

  @Prop({ default: false })
  canConductAppraisal: boolean;

  // Effective Period
  @Prop({ required: true })
  effectiveDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: true })
  isActive: boolean;

  // Reason
  @Prop()
  reason?: string;

  // Metadata
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: MongooseSchema.Types.ObjectId;
}

export const ReportingLineSchema = SchemaFactory.createForClass(ReportingLine);

// Indexes
ReportingLineSchema.index({ employeeId: 1, isActive: 1 });
ReportingLineSchema.index({ managerId: 1, isActive: 1 });
ReportingLineSchema.index({ reportingType: 1 });
ReportingLineSchema.index({ effectiveDate: 1 });
ReportingLineSchema.index({ employeeId: 1, reportingType: 1, isActive: 1 }); // Compound for queries

