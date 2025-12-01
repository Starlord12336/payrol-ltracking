import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmployeeNoteDocument = EmployeeNote & Document;

export enum NoteCategory {
  GENERAL = 'GENERAL',
  PERFORMANCE = 'PERFORMANCE',
  DISCIPLINARY = 'DISCIPLINARY',
  DEVELOPMENT = 'DEVELOPMENT',
  CONFIDENTIAL = 'CONFIDENTIAL',
}

export enum FollowUpStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, collection: 'employee_notes' })
export class EmployeeNote {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  // Note Content
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string; // Rich text supported

  @Prop({ required: true, enum: Object.values(NoteCategory) })
  category: NoteCategory;

  // Visibility
  @Prop({ default: false })
  isConfidential: boolean; // Only HR can see

  @Prop({ default: false })
  visibleToManager: boolean;

  // Attachments
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'DocumentModel', default: [] })
  attachments: MongooseSchema.Types.ObjectId[];

  // Author
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  createdByRole: string;

  // Follow-up
  @Prop({ default: false })
  requiresFollowUp: boolean;

  @Prop()
  followUpDate?: Date;

  @Prop({ enum: Object.values(FollowUpStatus) })
  followUpStatus?: FollowUpStatus;
}

export const EmployeeNoteSchema = SchemaFactory.createForClass(EmployeeNote);

// Indexes
EmployeeNoteSchema.index({ employeeId: 1 });
EmployeeNoteSchema.index({ category: 1 });
EmployeeNoteSchema.index({ createdAt: -1 });
EmployeeNoteSchema.index({ followUpDate: 1 });
EmployeeNoteSchema.index({ isConfidential: 1 });
EmployeeNoteSchema.index({ requiresFollowUp: 1, followUpStatus: 1 });

