import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmergencyContactDocument = EmergencyContact & Document;

export enum Relationship {
  SPOUSE = 'SPOUSE',
  PARENT = 'PARENT',
  SIBLING = 'SIBLING',
  CHILD = 'CHILD',
  FRIEND = 'FRIEND',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true, collection: 'employee_emergency_contacts' })
export class EmergencyContact {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  // Contact Details
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, enum: Object.values(Relationship) })
  relationship: Relationship;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ trim: true })
  alternatePhone?: string;

  @Prop({ lowercase: true, trim: true })
  email?: string;

  @Prop()
  address?: string;

  // Priority
  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ default: 1 })
  priority: number; // 1, 2, 3... in order of contact
}

export const EmergencyContactSchema = SchemaFactory.createForClass(EmergencyContact);

// Indexes
EmergencyContactSchema.index({ employeeId: 1 });
EmergencyContactSchema.index({ isPrimary: 1 });
EmergencyContactSchema.index({ employeeId: 1, priority: 1 });

