import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PerformanceFeedbackDocument = PerformanceFeedback & Document;

export enum FeedbackType {
  MANAGER_TO_EMPLOYEE = 'MANAGER_TO_EMPLOYEE',
  PEER_TO_PEER = 'PEER_TO_PEER',
  EMPLOYEE_TO_MANAGER = 'EMPLOYEE_TO_MANAGER',
  SELF_REFLECTION = 'SELF_REFLECTION',
  REVIEW_360 = '360_REVIEW',
}

export enum FeedbackStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  ARCHIVED = 'ARCHIVED',
}

@Schema({ _id: false })
export class FeedbackCategory {
  @Prop({ required: true })
  categoryName: string;

  @Prop()
  rating?: number;

  @Prop()
  comments?: string;
}

@Schema({ timestamps: true, collection: 'performance_feedback' })
export class PerformanceFeedback {
  // Participants
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  recipientId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  providerId: MongooseSchema.Types.ObjectId;

  // Feedback Type
  @Prop({ required: true, enum: Object.values(FeedbackType) })
  feedbackType: FeedbackType;

  // Context
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AppraisalCycle' })
  cycleId?: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isAnonymous: boolean;

  // Feedback Content
  @Prop()
  rating?: number;

  @Prop()
  strengths?: string;

  @Prop()
  areasForImprovement?: string;

  @Prop()
  specificExamples?: string;

  @Prop()
  recommendations?: string;

  // Categories (optional structured feedback)
  @Prop({ type: [FeedbackCategory], default: [] })
  categories: FeedbackCategory[];

  // Visibility
  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
  sharedWith: MongooseSchema.Types.ObjectId[];

  // Status
  @Prop({ required: true, enum: Object.values(FeedbackStatus), default: FeedbackStatus.DRAFT })
  status: FeedbackStatus;

  // Acknowledgment
  @Prop()
  acknowledgedAt?: Date;

  @Prop()
  recipientResponse?: string;

  // Timeline
  @Prop()
  submittedAt?: Date;
}

export const PerformanceFeedbackSchema = SchemaFactory.createForClass(PerformanceFeedback);

// Indexes
PerformanceFeedbackSchema.index({ recipientId: 1, submittedAt: -1 });
PerformanceFeedbackSchema.index({ providerId: 1 });
PerformanceFeedbackSchema.index({ cycleId: 1 });
PerformanceFeedbackSchema.index({ feedbackType: 1 });
PerformanceFeedbackSchema.index({ status: 1 });
PerformanceFeedbackSchema.index({ isAnonymous: 1 });

