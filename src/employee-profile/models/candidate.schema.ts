import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CandidateStatus } from '../enums/employee-profile.enums';
import { OrganizationalUnit } from '../../organization-structure/schemas/organizational-unit.schema';
import { UserProfileBase } from './user-schema';

// Type aliases for backward compatibility
type Department = OrganizationalUnit;
type Position = OrganizationalUnit;

export type CandidateDocument = HydratedDocument<Candidate>;

@Schema({ collection: 'candidates', timestamps: true })
export class Candidate extends UserProfileBase {
  @Prop({ type: String, required: true, unique: true })
  candidateNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'OrganizationalUnit' })
  departmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'OrganizationalUnit' })
  positionId?: Types.ObjectId;

  @Prop({ type: Date })
  applicationDate?: Date;

  @Prop({
    type: String,
    enum: Object.values(CandidateStatus),
    default: CandidateStatus.APPLIED,
  })
  status: CandidateStatus;

  @Prop({ type: String })
  resumeUrl?: string;

  @Prop({ type: String })
  notes?: string;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
