import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PerformanceGoalDocument = PerformanceGoal & Document;

export enum GoalCategory {
  INDIVIDUAL = 'INDIVIDUAL',
  TEAM = 'TEAM',
  DEPARTMENT = 'DEPARTMENT',
  COMPANY = 'COMPANY',
}

export enum GoalType {
  QUANTITATIVE = 'QUANTITATIVE',
  QUALITATIVE = 'QUALITATIVE',
  BEHAVIORAL = 'BEHAVIORAL',
}

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ACHIEVED = 'ACHIEVED',
  PARTIALLY_ACHIEVED = 'PARTIALLY_ACHIEVED',
  NOT_ACHIEVED = 'NOT_ACHIEVED',
  CANCELLED = 'CANCELLED',
}

@Schema({ _id: false })
export class ProgressUpdate {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  updateDate: Date;

  @Prop({ required: true })
  currentValue: number;

  @Prop({ required: true })
  comments: string;
}

@Schema({ timestamps: true, collection: 'performance_goals' })
export class PerformanceGoal {
  // Goal Identity
  @Prop({ required: true })
  goalTitle: string;

  @Prop({ required: true })
  description: string;

  // Context
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  setBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AppraisalCycle' })
  cycleId?: MongooseSchema.Types.ObjectId;

  // Goal Details
  @Prop({ required: true, enum: Object.values(GoalCategory) })
  category: GoalCategory;

  @Prop({ required: true, enum: Object.values(GoalType) })
  type: GoalType;

  @Prop({ required: true, enum: Object.values(GoalPriority) })
  priority: GoalPriority;

  // Measurement
  @Prop()
  targetMetric?: string; // e.g., "Sales Revenue"

  @Prop()
  targetValue?: number;

  @Prop()
  targetUnit?: string; // e.g., "USD", "Units"

  @Prop()
  currentValue?: number;

  @Prop()
  achievementPercentage?: number;

  // Timeline
  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  // Status
  @Prop({ required: true, enum: Object.values(GoalStatus), default: GoalStatus.NOT_STARTED })
  status: GoalStatus;

  // Progress Updates
  @Prop({ type: [ProgressUpdate], default: [] })
  progressUpdates: ProgressUpdate[];

  // Completion
  @Prop()
  completedAt?: Date;

  @Prop()
  actualValue?: number;

  @Prop()
  finalComments?: string;
}

export const PerformanceGoalSchema = SchemaFactory.createForClass(PerformanceGoal);

// Indexes
PerformanceGoalSchema.index({ employeeId: 1, status: 1 });
PerformanceGoalSchema.index({ cycleId: 1 });
PerformanceGoalSchema.index({ dueDate: 1 });
PerformanceGoalSchema.index({ status: 1 });
PerformanceGoalSchema.index({ setBy: 1 });

// Calculate achievement percentage before saving
PerformanceGoalSchema.pre('save', function (next) {
  if (this.targetValue && this.currentValue) {
    this.achievementPercentage = (this.currentValue / this.targetValue) * 100;
  }
  next();
});

