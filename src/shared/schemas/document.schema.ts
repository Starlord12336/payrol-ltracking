import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Schema as MongooseSchema } from 'mongoose';

export type DocumentModelDocument = DocumentModel & MongooseDocument;

export enum DocumentType {
  PROFILE_PICTURE = 'PROFILE_PICTURE',
  NATIONAL_ID = 'NATIONAL_ID',
  CONTRACT = 'CONTRACT',
  CERTIFICATE = 'CERTIFICATE',
  MEDICAL_DOCUMENT = 'MEDICAL_DOCUMENT',
  PAYSLIP = 'PAYSLIP',
  TAX_DOCUMENT = 'TAX_DOCUMENT',
  OTHER = 'OTHER',
}

export enum OwnerType {
  EMPLOYEE = 'EMPLOYEE',
  DEPARTMENT = 'DEPARTMENT',
  POSITION = 'POSITION',
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  APPRAISAL = 'APPRAISAL',
}

@Schema({ timestamps: true, collection: 'documents' })
export class DocumentModel {
  // Document Details
  @Prop({ required: true, trim: true })
  fileName: string;

  @Prop({ required: true, trim: true })
  originalFileName: string;

  @Prop({ required: true })
  fileSize: number; // in bytes

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  fileUrl: string; // S3/Cloud storage URL or local path

  // Classification
  @Prop({ required: true, enum: Object.values(DocumentType) })
  documentType: DocumentType;

  @Prop({ required: true, trim: true })
  category: string; // e.g., "Personal", "Employment", "Leave", "Payroll"

  // Ownership
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: Object.values(OwnerType) })
  ownerType: OwnerType;

  // Access Control
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  uploadedBy: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: [String], default: [] })
  allowedRoles: string[];

  // Metadata
  @Prop({ required: true, default: Date.now })
  uploadedAt: Date;

  @Prop()
  expiryDate?: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  description?: string;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);

// Indexes
DocumentSchema.index({ ownerId: 1, ownerType: 1 });
DocumentSchema.index({ documentType: 1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ uploadedAt: -1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ expiryDate: 1 });

