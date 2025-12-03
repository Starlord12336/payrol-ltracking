import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmergencyContactDocument = HydratedDocument<EmergencyContact>;

export enum ContactPriority {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  TERTIARY = 'TERTIARY',
}

export enum RelationshipType {
  SPOUSE = 'SPOUSE',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  FRIEND = 'FRIEND',
  OTHER = 'OTHER',
}

@Schema({ collection: 'emergency_contacts', timestamps: true })
export class EmergencyContact {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeProfileId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  relationship: string;

  @Prop({ type: String, enum: Object.values(RelationshipType), required: true })
  relationshipType: RelationshipType;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String })
  alternatePhoneNumber?: string;

  @Prop({ type: String })
  email?: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: String, enum: Object.values(ContactPriority), default: ContactPriority.SECONDARY })
  priority: ContactPriority;

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

export const EmergencyContactSchema = SchemaFactory.createForClass(EmergencyContact);

// Indexes
EmergencyContactSchema.index({ employeeProfileId: 1, isActive: 1 });
EmergencyContactSchema.index({ priority: 1 });

