import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum AuditEntityType {
  PAY_GRADE = 'PAY_GRADE',
  ALLOWANCE = 'ALLOWANCE',
  TAX_RULE = 'TAX_RULE',
  INSURANCE_BRACKET = 'INSURANCE_BRACKET',
  PAYROLL_POLICY = 'PAYROLL_POLICY',
  SIGNING_BONUS = 'SIGNING_BONUS',
  TERMINATION_BENEFIT = 'TERMINATION_BENEFIT',
  PAY_TYPE = 'PAY_TYPE',
  COMPANY_SETTINGS = 'COMPANY_SETTINGS',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true, type: String, enum: AuditEntityType })
  entityType: AuditEntityType;

  @Prop({ required: true, type: Types.ObjectId })
  entityId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: AuditAction })
  action: AuditAction;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile' })
  performedBy?: Types.ObjectId;

  @Prop({ type: Date, default: () => new Date() })
  timestamp: Date;

  @Prop({ type: Object })
  before?: Record<string, unknown>;

  @Prop({ type: Object })
  after?: Record<string, unknown>;

  @Prop({ type: String })
  description?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
