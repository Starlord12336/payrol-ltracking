import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployeeNoteDocument = HydratedDocument<EmployeeNote>;

export enum NoteCategory {
  GENERAL = 'GENERAL',
  PERFORMANCE = 'PERFORMANCE',
  DISCIPLINARY = 'DISCIPLINARY',
  DEVELOPMENT = 'DEVELOPMENT',
  COMPENSATION = 'COMPENSATION',
  LEAVE = 'LEAVE',
  INCIDENT = 'INCIDENT',
  OTHER = 'OTHER',
}

export enum NoteVisibility {
  HR_ONLY = 'HR_ONLY',
  MANAGER_ONLY = 'MANAGER_ONLY',
  HR_AND_MANAGER = 'HR_AND_MANAGER',
  PUBLIC = 'PUBLIC', // Visible to employee
}

@Schema({ collection: 'employee_notes', timestamps: true })
export class EmployeeNote {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeProfileId: Types.ObjectId;

  @Prop({ type: String, required: true })
  note: string;

  @Prop({ type: String, enum: Object.values(NoteCategory), default: NoteCategory.GENERAL })
  category: NoteCategory;

  @Prop({ type: String, enum: Object.values(NoteVisibility), default: NoteVisibility.HR_ONLY })
  visibility: NoteVisibility;

  @Prop({ type: Boolean, default: false })
  requiresFollowUp: boolean;

  @Prop({ type: Date })
  followUpDate?: Date;

  @Prop({ type: Boolean, default: false })
  isFollowedUp: boolean;

  @Prop({ type: Date })
  followedUpAt?: Date;

  @Prop({ type: String })
  followUpNotes?: string;

  @Prop({ type: Boolean, default: false })
  isConfidential: boolean;

  // Metadata
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  followedUpBy?: Types.ObjectId;
}

export const EmployeeNoteSchema = SchemaFactory.createForClass(EmployeeNote);

// Indexes
EmployeeNoteSchema.index({ employeeProfileId: 1, createdAt: -1 });
EmployeeNoteSchema.index({ category: 1 });
EmployeeNoteSchema.index({ requiresFollowUp: 1, followUpDate: 1 });
EmployeeNoteSchema.index({ visibility: 1 });

