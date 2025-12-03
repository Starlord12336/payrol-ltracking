import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DepartmentBudgetDocument = DepartmentBudget & Document;

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Schema({ timestamps: true, collection: 'department_budgets' })
export class DepartmentBudget {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
  departmentId: MongooseSchema.Types.ObjectId;

  // Fiscal Period
  @Prop({ required: true })
  fiscalYear: number; // e.g., 2025

  @Prop({ min: 1, max: 4 })
  fiscalQuarter?: number; // 1, 2, 3, 4

  // Headcount Budget
  @Prop({ required: true, default: 0 })
  budgetedHeadcount: number;

  @Prop({ default: 0 })
  currentHeadcount: number;

  @Prop({ default: 0 })
  vacantPositions: number;

  // Financial Budget
  @Prop({ required: true })
  budgetedAmount: number;

  @Prop({ required: true, default: 'EGP' })
  currency: string;

  @Prop({ default: 0 })
  actualSpent: number;

  @Prop()
  remainingBudget: number;

  // Status
  @Prop({ required: true, enum: Object.values(BudgetStatus), default: BudgetStatus.DRAFT })
  status: BudgetStatus;

  // Approvals
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  // Metadata
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: MongooseSchema.Types.ObjectId;
}

export const DepartmentBudgetSchema = SchemaFactory.createForClass(DepartmentBudget);

// Indexes
DepartmentBudgetSchema.index({ departmentId: 1, fiscalYear: 1 }, { unique: true });
DepartmentBudgetSchema.index({ fiscalYear: 1 });
DepartmentBudgetSchema.index({ status: 1 });

// Virtual for budget utilization percentage
DepartmentBudgetSchema.virtual('budgetUtilizationPercent').get(function (this: DepartmentBudgetDocument) {
  if (this.budgetedAmount === 0) return 0;
  return (this.actualSpent / this.budgetedAmount) * 100;
});

// Virtual for headcount utilization percentage
DepartmentBudgetSchema.virtual('headcountUtilizationPercent').get(function (this: DepartmentBudgetDocument) {
  if (this.budgetedHeadcount === 0) return 0;
  return (this.currentHeadcount / this.budgetedHeadcount) * 100;
});

// Calculate remaining budget before saving
DepartmentBudgetSchema.pre('save', function (next) {
  this.remainingBudget = this.budgetedAmount - this.actualSpent;
  this.vacantPositions = this.budgetedHeadcount - this.currentHeadcount;
  next();
});

// Ensure virtuals are included in toJSON
DepartmentBudgetSchema.set('toJSON', { virtuals: true });
DepartmentBudgetSchema.set('toObject', { virtuals: true });

