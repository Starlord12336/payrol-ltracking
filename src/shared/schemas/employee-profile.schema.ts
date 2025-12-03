import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ContractType,
  EmployeeStatus,
  WorkType,
} from '../../employee-profile/enums/employee-profile.enums';
import { Department } from './department.schema';
import { Position } from './position.schema';
import { UserProfileBase } from './user-profile-base.schema';

export type EmployeeProfileDocument = HydratedDocument<EmployeeProfile>;

@Schema({ collection: 'employee_profiles', timestamps: true })
export class EmployeeProfile extends UserProfileBase {
  // Core IDs
  @Prop({ type: String, required: true, unique: true })
  employeeNumber: string; // HR/Payroll number

  @Prop({ type: Date, required: true })
  dateOfHire: Date;

  @Prop({ type: String })
  workEmail?: string;

  @Prop({ type: String })
  biography?: string;

  @Prop({ type: Date })
  contractStartDate?: Date;

  @Prop({ type: Date })
  contractEndDate?: Date;

  // Banking details
  @Prop({ type: String })
  bankName?: string;

  @Prop({ type: String })
  bankAccountNumber?: string;

  @Prop({
    type: String,
    enum: Object.values(ContractType),
    required: false,
  })
  contractType?: ContractType;

  @Prop({
    type: String,
    enum: Object.values(WorkType),
    required: false,
  })
  workType?: WorkType;

  @Prop({
    type: String,
    enum: Object.values(EmployeeStatus),
    required: true,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Prop({ type: Date, default: () => new Date() })
  statusEffectiveFrom?: Date;

  // Org Structure links
  @Prop({ type: Types.ObjectId, ref: 'Position' })
  primaryPositionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  primaryDepartmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  supervisorPositionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PayGrade' })
  payGradeId?: Types.ObjectId;

  // Performance links (references to Performance module)
  @Prop({ type: Types.ObjectId, ref: 'AppraisalRecord' })
  lastAppraisalRecordId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalCycle' })
  lastAppraisalCycleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalTemplate' })
  lastAppraisalTemplateId?: Types.ObjectId;

  @Prop({ type: Date })
  lastAppraisalDate?: Date;

  @Prop({ type: Number })
  lastAppraisalScore?: number;

  @Prop({ type: String })
  lastAppraisalRatingLabel?: string;

  @Prop({ type: String })
  lastAppraisalScaleType?: string;

  @Prop({ type: String })
  lastDevelopmentPlanSummary?: string;
}

export const EmployeeProfileSchema =
  SchemaFactory.createForClass(EmployeeProfile);

