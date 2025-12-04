import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export type CompanyWideSettingsDocument = HydratedDocument<CompanyWideSettings>;

@Schema({ timestamps: true })
export class CompanyWideSettings {
  @Prop({ required: true })
  payDate: Date;
  @Prop({ required: true })
  timeZone: string;
  @Prop({ required: true, default: 'EGP' })
  currency: string; //will allow only egp

  @Prop({
    required: true,
    type: String,
    enum: ConfigStatus,
    default: ConfigStatus.DRAFT,
  })
  status: ConfigStatus;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  approvedAt?: Date;
}

export const CompanyWideSettingsSchema =
  SchemaFactory.createForClass(CompanyWideSettings);
