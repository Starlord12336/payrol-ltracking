import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AppraisalTemplateDocument = AppraisalTemplate & Document;

export enum AppraisalType {
  ANNUAL = 'ANNUAL',
  PROBATIONARY = 'PROBATIONARY',
  MID_YEAR = 'MID_YEAR',
  PROJECT_BASED = 'PROJECT_BASED',
  AD_HOC = 'AD_HOC',
}

export enum RatingScaleType {
  NUMERIC = 'NUMERIC',
  LETTER = 'LETTER',
  DESCRIPTIVE = 'DESCRIPTIVE',
}

export enum CalculationMethod {
  WEIGHTED_AVERAGE = 'WEIGHTED_AVERAGE',
  SIMPLE_AVERAGE = 'SIMPLE_AVERAGE',
  CUSTOM = 'CUSTOM',
}

@Schema({ _id: false })
export class RatingLabel {
  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  label: string;

  @Prop()
  description?: string;
}

@Schema({ _id: false })
export class RatingScale {
  @Prop({ required: true, enum: Object.values(RatingScaleType) })
  scaleType: RatingScaleType;

  @Prop({ required: true })
  minValue: number;

  @Prop({ required: true })
  maxValue: number;

  @Prop({ type: [RatingLabel] })
  labels?: RatingLabel[];
}

@Schema({ _id: false })
export class Criterion {
  @Prop({ required: true })
  criteriaId: string;

  @Prop({ required: true })
  criteriaName: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  weight: number; // Weight within section (0-100)

  @Prop({ required: true })
  isRequired: boolean;

  @Prop({ required: true })
  allowComments: boolean;
}

@Schema({ _id: false })
export class TemplateSection {
  @Prop({ required: true })
  sectionId: string;

  @Prop({ required: true })
  sectionName: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  weight: number; // Percentage weight in final score (0-100)

  @Prop({ required: true })
  order: number;

  @Prop({ type: [Criterion], required: true })
  criteria: Criterion[];
}

@Schema({ timestamps: true, collection: 'appraisal_templates' })
export class AppraisalTemplate {
  // Template Identity
  @Prop({ required: true, unique: true, uppercase: true })
  templateCode: string;

  @Prop({ required: true })
  templateName: string;

  @Prop()
  description?: string;

  // Appraisal Type
  @Prop({ required: true, enum: Object.values(AppraisalType) })
  appraisalType: AppraisalType;

  // Applicable To
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Department', default: [] })
  applicableDepartments: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Position', default: [] })
  applicablePositions: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  applicableLevels: string[];

  // Rating Scale
  @Prop({ type: RatingScale, required: true })
  ratingScale: RatingScale;

  // Evaluation Criteria/Sections
  @Prop({ type: [TemplateSection], required: true })
  sections: TemplateSection[];

  // Calculation Rules
  @Prop({ required: true, enum: Object.values(CalculationMethod) })
  calculationMethod: CalculationMethod;

  @Prop()
  passingScore?: number;

  // Workflow Configuration
  @Prop({ required: true })
  requiresSelfAssessment: boolean;

  @Prop({ default: false })
  requiresPeerReview: boolean;

  @Prop({ default: true })
  allowEmployeeFeedback: boolean;

  @Prop({ required: true, default: 7 })
  disputePeriodDays: number;

  // Status
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  version: number;

  // Metadata
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  approvedAt?: Date;
}

export const AppraisalTemplateSchema = SchemaFactory.createForClass(AppraisalTemplate);

// Indexes
AppraisalTemplateSchema.index({ templateCode: 1 }, { unique: true });
AppraisalTemplateSchema.index({ appraisalType: 1 });
AppraisalTemplateSchema.index({ isActive: 1 });
AppraisalTemplateSchema.index({ createdBy: 1 });

