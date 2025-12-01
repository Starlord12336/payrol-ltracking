import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AppraisalEvaluationDocument = AppraisalEvaluation & Document;

export enum EvaluationStatus {
  DRAFT = 'DRAFT',
  SELF_ASSESSMENT_SUBMITTED = 'SELF_ASSESSMENT_SUBMITTED',
  MANAGER_REVIEW_SUBMITTED = 'MANAGER_REVIEW_SUBMITTED',
  HR_REVIEWED = 'HR_REVIEWED',
  PUBLISHED = 'PUBLISHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  DISPUTED = 'DISPUTED',
  FINALIZED = 'FINALIZED',
}

export enum PerformanceCategory {
  EXCEPTIONAL = 'EXCEPTIONAL',
  EXCEEDS_EXPECTATIONS = 'EXCEEDS_EXPECTATIONS',
  MEETS_EXPECTATIONS = 'MEETS_EXPECTATIONS',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  UNSATISFACTORY = 'UNSATISFACTORY',
}

@Schema({ _id: false })
export class CriterionRating {
  @Prop({ required: true })
  criteriaId: string;

  @Prop()
  rating?: number;

  @Prop()
  comments?: string;
}

@Schema({ _id: false })
export class SectionRating {
  @Prop({ required: true })
  sectionId: string;

  @Prop()
  sectionScore?: number;

  @Prop({ type: [CriterionRating], required: true })
  criteria: CriterionRating[];
}

@Schema({ _id: false })
export class SelfAssessment {
  @Prop({ required: true })
  submittedAt: Date;

  @Prop({ type: [SectionRating], required: true })
  sections: SectionRating[];

  @Prop()
  overallComments?: string;
}

@Schema({ _id: false })
export class ManagerEvaluation {
  @Prop()
  submittedAt?: Date;

  @Prop({ type: [SectionRating], required: true })
  sections: SectionRating[];

  @Prop()
  overallRating?: number;

  @Prop()
  strengths?: string;

  @Prop()
  areasForImprovement?: string;

  @Prop()
  developmentRecommendations?: string;

  @Prop()
  attendanceScore?: number;

  @Prop()
  punctualityScore?: number;

  @Prop()
  attendanceComments?: string;
}

@Schema({ _id: false })
export class HRReview {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reviewedBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  reviewedAt: Date;

  @Prop()
  adjustedRating?: number;

  @Prop()
  adjustmentReason?: string;

  @Prop()
  hrComments?: string;
}

@Schema({ _id: false })
export class AttendanceData {
  @Prop({ required: true })
  totalWorkingDays: number;

  @Prop({ required: true })
  presentDays: number;

  @Prop({ required: true })
  absentDays: number;

  @Prop({ required: true })
  lateDays: number;

  @Prop({ default: 0 })
  overtimeHours: number;
}

@Schema({ _id: false })
export class LeaveData {
  @Prop({ required: true })
  totalLeaveDays: number;

  @Prop({ default: 0 })
  sickLeaveDays: number;

  @Prop({ default: 0 })
  annualLeaveDays: number;
}

@Schema({ timestamps: true, collection: 'appraisal_evaluations' })
export class AppraisalEvaluation {
  // Context
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AppraisalCycle', required: true })
  cycleId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AppraisalTemplate', required: true })
  templateId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EmployeeProfile', required: true })
  reviewerId: MongooseSchema.Types.ObjectId;

  // Self-Assessment (if required)
  @Prop({ type: SelfAssessment })
  selfAssessment?: SelfAssessment;

  // Manager Evaluation
  @Prop({ type: ManagerEvaluation, required: true })
  managerEvaluation: ManagerEvaluation;

  // HR Review (optional)
  @Prop({ type: HRReview })
  hrReview?: HRReview;

  // Final Result
  @Prop({ required: true })
  finalRating: number;

  @Prop({ enum: Object.values(PerformanceCategory) })
  performanceCategory?: PerformanceCategory;

  @Prop()
  isPassed?: boolean; // For probationary appraisals

  // Status Tracking
  @Prop({ required: true, enum: Object.values(EvaluationStatus), default: EvaluationStatus.DRAFT })
  status: EvaluationStatus;

  // Employee Acknowledgment
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  acknowledgedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  acknowledgedAt?: Date;

  @Prop()
  employeeComments?: string;

  // Integration Data (from other modules)
  @Prop({ type: AttendanceData })
  attendanceData?: AttendanceData;

  @Prop({ type: LeaveData })
  leaveData?: LeaveData;

  @Prop()
  publishedAt?: Date;
}

export const AppraisalEvaluationSchema = SchemaFactory.createForClass(AppraisalEvaluation);

// Indexes
AppraisalEvaluationSchema.index({ cycleId: 1, employeeId: 1 }, { unique: true });
AppraisalEvaluationSchema.index({ employeeId: 1, createdAt: -1 });
AppraisalEvaluationSchema.index({ reviewerId: 1, status: 1 });
AppraisalEvaluationSchema.index({ status: 1 });
AppraisalEvaluationSchema.index({ finalRating: 1 });
AppraisalEvaluationSchema.index({ performanceCategory: 1 });

