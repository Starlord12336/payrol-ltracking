import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmployeeDependentDocument = EmployeeDependent & Document;

export enum DependentRelationship {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  OTHER = 'OTHER',
}

export enum DependentGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Schema({ timestamps: true, collection: 'employee_dependents' })
export class EmployeeDependent {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  // Dependent Details
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true, enum: Object.values(DependentGender) })
  gender: DependentGender;

  @Prop({ required: true, enum: Object.values(DependentRelationship) })
  relationship: DependentRelationship;

  @Prop({ trim: true })
  nationalId?: string;

  // Insurance/Benefits
  @Prop({ default: false })
  isCoveredByInsurance: boolean;

  @Prop()
  insuranceNumber?: string;

  @Prop()
  insuranceStartDate?: Date;

  @Prop()
  insuranceEndDate?: Date;

  // Documentation
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'DocumentModel', default: [] })
  documents: MongooseSchema.Types.ObjectId[];

  // Status
  @Prop({ default: true })
  isActive: boolean;
}

export const EmployeeDependentSchema = SchemaFactory.createForClass(EmployeeDependent);

// Indexes
EmployeeDependentSchema.index({ employeeId: 1 });
EmployeeDependentSchema.index({ isActive: 1 });
EmployeeDependentSchema.index({ isCoveredByInsurance: 1 });

// Virtual for full name
EmployeeDependentSchema.virtual('fullName').get(function (this: EmployeeDependentDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
EmployeeDependentSchema.virtual('age').get(function (this: EmployeeDependentDocument) {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Ensure virtuals are included in toJSON
EmployeeDependentSchema.set('toJSON', { virtuals: true });
EmployeeDependentSchema.set('toObject', { virtuals: true });

