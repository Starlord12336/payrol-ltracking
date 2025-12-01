import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DependentDocument = HydratedDocument<Dependent>;

export enum DependentRelationship {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  SIBLING = 'SIBLING',
  OTHER = 'OTHER',
}

export enum InsuranceStatus {
  COVERED = 'COVERED',
  NOT_COVERED = 'NOT_COVERED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}

@Schema({ collection: 'dependents', timestamps: true })
export class Dependent {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeProfileId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ type: String, enum: Object.values(DependentRelationship), required: true })
  relationship: DependentRelationship;

  @Prop({ type: String })
  nationalId?: string;

  @Prop({ type: String })
  phoneNumber?: string;

  @Prop({ type: String })
  email?: string;

  // Insurance Coverage
  @Prop({ type: String, enum: Object.values(InsuranceStatus), default: InsuranceStatus.NOT_COVERED })
  insuranceStatus: InsuranceStatus;

  @Prop({ type: Date })
  insuranceStartDate?: Date;

  @Prop({ type: Date })
  insuranceEndDate?: Date;

  @Prop({ type: String })
  insurancePolicyNumber?: string;

  @Prop({ type: String })
  insuranceProvider?: string;

  // Documents
  @Prop({ type: [String], default: [] })
  documentUrls: string[]; // URLs to uploaded documents (birth certificate, ID, etc.)

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String })
  notes?: string;

  // Metadata
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  updatedBy: Types.ObjectId;
}

export const DependentSchema = SchemaFactory.createForClass(Dependent);

// Indexes
DependentSchema.index({ employeeProfileId: 1, isActive: 1 });
DependentSchema.index({ insuranceStatus: 1 });

