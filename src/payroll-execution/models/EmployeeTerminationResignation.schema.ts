import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';
import { terminationAndResignationBenefits } from '../../payroll-configuration/models/terminationAndResignationBenefits';
import { TerminationRequest } from '../../recruitment/models/termination-request.schema';
import { BenefitStatus } from '../enums/payroll-execution-enum';

export type EmployeeTerminationResignationDocument =
  HydratedDocument<EmployeeTerminationResignation>;

@Schema({ timestamps: true })
export class EmployeeTerminationResignation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
  employeeId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: terminationAndResignationBenefits.name,
    required: true,
  })
  benefitId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: TerminationRequest.name, required: true })
  terminationId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  givenAmount: number;

  @Prop({ default: BenefitStatus.PENDING, type: String, enum: BenefitStatus })
  status: BenefitStatus; // pending, paid, approved ,rejected
}

export const EmployeeTerminationResignationSchema = SchemaFactory.createForClass(
  EmployeeTerminationResignation
);
