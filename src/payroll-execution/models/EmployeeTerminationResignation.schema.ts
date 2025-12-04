import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { terminationAndResignationBenefits } from '../../payroll-configuration/models/terminationAndResignationBenefits';
import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';
import { TerminationRequest } from '../../recruitment/models/termination-request.schema';
import { BenefitStatus } from '../enums/payroll-execution-enum';

export type EmployeeTerminationResignationDocument =
  HydratedDocument<EmployeeTerminationResignation>;

@Schema({ timestamps: true })
export class EmployeeTerminationResignation {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Employee.name,
    required: true,
  })
  employeeId: mongoose.Types.ObjectId;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: terminationAndResignationBenefits.name,
    required: true,
  })
  benefitId: mongoose.Types.ObjectId;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: TerminationRequest.name,
    required: true,
  })
  terminationId: mongoose.Types.ObjectId;
  
  @Prop({ type: String, required: true, enum: ['termination', 'resignation'] })
  terminationType: string;

  @Prop({ type: Number, default: 0 })
  leaveEncashment: number;

  @Prop({ type: Number, default: 0 })
  severancePay: number;

  @Prop({ type: Number, default: 0 })
  endOfServiceGratuity: number;

  @Prop({ type: Number, required: true })
  totalAmount: number;

  @Prop({ default: BenefitStatus.PENDING, type: String, enum: BenefitStatus })
  status: BenefitStatus; // pending, paid, approved ,rejected

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  approvedBy?: mongoose.Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ type: Boolean, default: false })
  disbursed: boolean;

  @Prop({ type: Date })
  disbursedAt?: Date;
}

export const EmployeeTerminationResignationSchema =
  SchemaFactory.createForClass(EmployeeTerminationResignation);
