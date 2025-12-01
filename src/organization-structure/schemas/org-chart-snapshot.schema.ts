import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Department } from '../../shared/schemas/department.schema';
import { Position } from '../../shared/schemas/position.schema';

export type OrgChartSnapshotDocument = OrgChartSnapshot & Document;

export enum SnapshotPurpose {
  QUARTERLY_ARCHIVE = 'QUARTERLY_ARCHIVE',
  ANNUAL_ARCHIVE = 'ANNUAL_ARCHIVE',
  AUDIT = 'AUDIT',
  BEFORE_REORGANIZATION = 'BEFORE_REORGANIZATION',
  MANUAL_BACKUP = 'MANUAL_BACKUP',
}

@Schema({ _id: false })
export class ReportingLineSnapshot {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  managerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  departmentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  positionId: MongooseSchema.Types.ObjectId;
}

@Schema({ _id: false })
export class SnapshotStatistics {
  @Prop({ required: true })
  totalDepartments: number;

  @Prop({ required: true })
  totalPositions: number;

  @Prop({ required: true })
  totalEmployees: number;

  @Prop({ required: true })
  activeHeadcount: number;

  @Prop({ required: true })
  vacantPositions: number;
}

@Schema({ timestamps: false, collection: 'org_chart_snapshots' })
export class OrgChartSnapshot {
  // Snapshot Details
  @Prop({ required: true })
  snapshotName: string;

  @Prop({ required: true })
  snapshotDate: Date;

  @Prop()
  description?: string;

  // Structure Data
  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  departments: Department[]; // Complete department tree

  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  positions: Position[]; // All positions at this time

  @Prop({ type: [ReportingLineSnapshot], required: true })
  reportingLines: ReportingLineSnapshot[];

  // Statistics
  @Prop({ type: SnapshotStatistics, required: true })
  statistics: SnapshotStatistics;

  // Metadata
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  // Purpose
  @Prop({ required: true, enum: Object.values(SnapshotPurpose) })
  purpose: SnapshotPurpose;
}

export const OrgChartSnapshotSchema = SchemaFactory.createForClass(OrgChartSnapshot);

// Indexes
OrgChartSnapshotSchema.index({ snapshotDate: -1 });
OrgChartSnapshotSchema.index({ purpose: 1 });
OrgChartSnapshotSchema.index({ createdBy: 1 });

