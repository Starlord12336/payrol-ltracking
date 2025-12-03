import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { AppraisalType } from './appraisal-template.schema';

export type AppraisalCycleDocument = AppraisalCycle & Document;

export enum CycleStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  CANCELLED = 'CANCELLED',
}

export enum AssignmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  SELF_ASSESSMENT_PENDING = 'SELF_ASSESSMENT_PENDING',
  MANAGER_REVIEW_PENDING = 'MANAGER_REVIEW_PENDING',
  HR_REVIEW_PENDING = 'HR_REVIEW_PENDING',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
}

@Schema({ _id: false })
export class CycleAssignment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EmployeeProfile', required: true })
  reviewerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  selfAssessmentRequired: boolean;

  @Prop({ required: true, enum: Object.values(AssignmentStatus) })
  status: AssignmentStatus;

  @Prop({ required: true, default: Date.now })
  assignedAt: Date;
}

@Schema({ timestamps: true, collection: 'appraisal_cycles' })
export class AppraisalCycle {
  // Cycle Identity
  @Prop({ required: true, unique: true, uppercase: true })
  cycleCode: string;

  @Prop({ required: true })
  cycleName: string;

  @Prop()
  description?: string;

  // Type & Template
  @Prop({ type: String, required: true, enum: Object.values(AppraisalType) })
  appraisalType: AppraisalType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AppraisalTemplate', required: true })
  templateId: MongooseSchema.Types.ObjectId;

  // Timeline
  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  selfAssessmentDeadline?: Date;

  @Prop({ required: true })
  managerReviewDeadline: Date;

  @Prop()
  hrReviewDeadline?: Date;

  @Prop()
  disputeDeadline?: Date;

  // Scope
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'EmployeeProfile', default: [] })
  targetEmployees: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Department', default: [] })
  targetDepartments: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Position', default: [] })
  targetPositions: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'EmployeeProfile', default: [] })
  excludeEmployees: MongooseSchema.Types.ObjectId[];

  // Assignments
  @Prop({ type: [CycleAssignment], default: [] })
  assignments: CycleAssignment[];

  // Progress Tracking
  @Prop({ default: 0 })
  totalAssignments: number;

  @Prop({ default: 0 })
  completedAssignments: number;

  @Prop({ default: 0 })
  progressPercentage: number;

  // Status
  @Prop({ required: true, enum: Object.values(CycleStatus), default: CycleStatus.DRAFT })
  status: CycleStatus;

  // Publication
  @Prop({ default: false })
  resultsPublished: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  publishedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  publishedAt?: Date;

  // Metadata
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: MongooseSchema.Types.ObjectId;
}

export const AppraisalCycleSchema = SchemaFactory.createForClass(AppraisalCycle);

// Indexes
AppraisalCycleSchema.index({ cycleCode: 1 }, { unique: true });
AppraisalCycleSchema.index({ appraisalType: 1 });
AppraisalCycleSchema.index({ status: 1 });
AppraisalCycleSchema.index({ startDate: 1, endDate: 1 });
AppraisalCycleSchema.index({ 'assignments.employeeId': 1 });

// Update progress before saving
AppraisalCycleSchema.pre('save', function (next) {
  this.totalAssignments = this.assignments.length;
  this.completedAssignments = this.assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length;
  this.progressPercentage = this.totalAssignments > 0
    ? (this.completedAssignments / this.totalAssignments) * 100
    : 0;
  next();
});

