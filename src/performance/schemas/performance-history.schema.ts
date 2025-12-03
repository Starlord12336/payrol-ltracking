import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PerformanceHistoryDocument = PerformanceHistory & Document;

export enum TrendDirection {
  IMPROVING = 'IMPROVING',
  STABLE = 'STABLE',
  DECLINING = 'DECLINING',
}

@Schema({ _id: false })
export class EvaluationSummary {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  cycleId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  cycleName: string;

  @Prop({ required: true })
  appraisalType: string;

  @Prop({ required: true })
  evaluationDate: Date;

  @Prop({ required: true })
  finalRating: number;

  @Prop({ required: true })
  performanceCategory: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  reviewedBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  reviewerName: string;

  @Prop()
  keyStrengths?: string;

  @Prop()
  keyImprovements?: string;

  @Prop({ required: true })
  wasDisputed: boolean;
}

@Schema({ timestamps: false, collection: 'performance_history' })
export class PerformanceHistory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true, unique: true })
  employeeId: MongooseSchema.Types.ObjectId;

  // Complete history
  @Prop({ type: [EvaluationSummary], default: [] })
  evaluations: EvaluationSummary[];

  // Trend Analysis
  @Prop({ required: true, default: 0 })
  averageRating: number;

  @Prop({ enum: Object.values(TrendDirection), default: TrendDirection.STABLE })
  trendDirection: TrendDirection;

  @Prop({ required: true, default: 0 })
  totalEvaluations: number;

  // Last Updated
  @Prop()
  lastEvaluationDate?: Date;

  @Prop({ required: true, default: Date.now })
  lastUpdatedAt: Date;
}

export const PerformanceHistorySchema = SchemaFactory.createForClass(PerformanceHistory);

// Indexes
PerformanceHistorySchema.index({ employeeId: 1 }, { unique: true });
PerformanceHistorySchema.index({ lastEvaluationDate: -1 });
PerformanceHistorySchema.index({ averageRating: -1 });
PerformanceHistorySchema.index({ trendDirection: 1 });

// Calculate average rating before saving
PerformanceHistorySchema.pre('save', function (next) {
  if (this.evaluations.length > 0) {
    const total = this.evaluations.reduce((sum, evaluation) => sum + evaluation.finalRating, 0);
    this.averageRating = total / this.evaluations.length;
    this.totalEvaluations = this.evaluations.length;
    
    // Calculate trend (simple: compare last 2 evaluations)
    if (this.evaluations.length >= 2) {
      const recent = this.evaluations[this.evaluations.length - 1].finalRating;
      const previous = this.evaluations[this.evaluations.length - 2].finalRating;
      if (recent > previous) {
        this.trendDirection = TrendDirection.IMPROVING;
      } else if (recent < previous) {
        this.trendDirection = TrendDirection.DECLINING;
      } else {
        this.trendDirection = TrendDirection.STABLE;
      }
    }
  }
  next();
});

