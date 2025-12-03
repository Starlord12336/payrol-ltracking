import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ContractType,
  EmployeeStatus,
  WorkType,
} from '../enums/employee-profile.enums';
import { AppraisalRatingScaleType } from '../../performance/enums/performance.enums';
import { OrganizationalUnit } from '../../organization-structure/schemas/organizational-unit.schema';
import { AppraisalCycle } from '../../performance/schemas/appraisal-cycle.schema';
import { AppraisalTemplate } from '../../performance/schemas/appraisal-template.schema';
import { AppraisalEvaluation } from '../../performance/schemas/appraisal-evaluation.schema';
import { UserProfileBase } from './user-schema';

// Type aliases for backward compatibility
type Department = OrganizationalUnit;
type Position = OrganizationalUnit;

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
  @Prop({ type: Types.ObjectId, ref: 'OrganizationalUnit' })
  primaryPositionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'OrganizationalUnit' })
  primaryDepartmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'OrganizationalUnit' })
  supervisorPositionId?: Types.ObjectId;

  // Payroll module not present - commented out
  // @Prop({ type: Types.ObjectId, ref: payGrade.name })
  // payGradeId?: Types.ObjectId;

  // Using AppraisalEvaluation instead of AppraisalRecord (which doesn't exist)
  @Prop({ type: Types.ObjectId, ref: 'AppraisalEvaluation' })
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

  @Prop({
    type: String,
    enum: Object.values(AppraisalRatingScaleType),
  })
  lastAppraisalScaleType?: AppraisalRatingScaleType;

  @Prop({ type: String })
  lastDevelopmentPlanSummary?: string;
}

export const EmployeeProfileSchema =
  SchemaFactory.createForClass(EmployeeProfile);
