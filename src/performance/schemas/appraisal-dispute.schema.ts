import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AppraisalDisputeDocument = AppraisalDispute & Document;

export enum DisputeStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum ResolutionType {
  UPHELD_ORIGINAL = 'UPHELD_ORIGINAL',
  RATING_ADJUSTED = 'RATING_ADJUSTED',
  REEVALUATION_ORDERED = 'REEVALUATION_ORDERED',
}

@Schema({ timestamps: true, collection: 'appraisal_disputes' })
export class AppraisalDispute {
  // Reference
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AppraisalEvaluation', required: true })
  evaluationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AppraisalCycle', required: true })
  cycleId: MongooseSchema.Types.ObjectId;

  // Dispute Details
  @Prop({ required: true })
  disputeReason: string;

  @Prop({ type: [String], default: [] })
  disputedSections: string[];

  @Prop({ type: [String], default: [] })
  disputedCriteria: string[];

  @Prop()
  proposedRating?: number;

  // Supporting Evidence
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'DocumentModel', default: [] })
  supportingDocuments: MongooseSchema.Types.ObjectId[];

  @Prop()
  additionalComments?: string;

  // Workflow
  @Prop({ required: true, enum: Object.values(DisputeStatus), default: DisputeStatus.SUBMITTED })
  status: DisputeStatus;

  // Review Process
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  reviewComments?: string;

  // Resolution
  @Prop({ enum: Object.values(ResolutionType) })
  resolutionType?: ResolutionType;

  @Prop()
  adjustedRating?: number;

  @Prop()
  resolutionNotes?: string;

  @Prop()
  resolvedAt?: Date;

  // Timeline
  @Prop({ required: true, default: Date.now })
  submittedAt: Date;

  @Prop({ required: true })
  deadline: Date;

  // Escalation
  @Prop({ default: false })
  isEscalated: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  escalatedTo?: MongooseSchema.Types.ObjectId;

  @Prop()
  escalatedAt?: Date;
}

export const AppraisalDisputeSchema = SchemaFactory.createForClass(AppraisalDispute);

// Indexes
AppraisalDisputeSchema.index({ evaluationId: 1 }, { unique: true });
AppraisalDisputeSchema.index({ employeeId: 1, status: 1 });
AppraisalDisputeSchema.index({ status: 1 });
AppraisalDisputeSchema.index({ submittedAt: -1 });
AppraisalDisputeSchema.index({ deadline: 1 });
AppraisalDisputeSchema.index({ isEscalated: 1 });

