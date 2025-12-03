import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrganizationalUnitDocument = OrganizationalUnit & Document;

@Schema({ timestamps: true, collection: 'organizational_units' })
export class OrganizationalUnit {
  // Unit Details
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  unitCode: string;

  @Prop({ required: true, trim: true })
  unitName: string;

  @Prop({ trim: true })
  unitNameArabic?: string;

  @Prop()
  description?: string;

  // Hierarchy
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'OrganizationalUnit' })
  parentUnitId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: 1 })
  level: number; // 1 = highest level (e.g., Division), 2 = next level, etc.

  // Leadership
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee' })
  unitHeadId?: MongooseSchema.Types.ObjectId;

  // Composition
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Department', default: [] })
  departmentIds: MongooseSchema.Types.ObjectId[];

  // Budget & Planning
  @Prop()
  annualBudget?: number;

  @Prop()
  costCenter?: string;

  // Status
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  effectiveDate: Date;

  @Prop()
  endDate?: Date;

  // Metadata
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: MongooseSchema.Types.ObjectId;
}

export const OrganizationalUnitSchema = SchemaFactory.createForClass(OrganizationalUnit);

// Indexes
OrganizationalUnitSchema.index({ unitCode: 1 }, { unique: true });
OrganizationalUnitSchema.index({ parentUnitId: 1 });
OrganizationalUnitSchema.index({ unitHeadId: 1 });
OrganizationalUnitSchema.index({ isActive: 1 });
OrganizationalUnitSchema.index({ level: 1 });

