////////////////////////# Audit Trail - Eslam ##############

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';

export type AuditLogDocument = HydratedDocument<AuditLog>;

/**
 * Audit log action types
 */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

/**
 * Entity types that can be audited
 */
export enum AuditEntityType {
  PAY_GRADE = 'PayGrade',
  ALLOWANCE = 'Allowance',
  TAX_RULE = 'TaxRule',
  INSURANCE_BRACKET = 'InsuranceBracket',
  PAYROLL_POLICY = 'PayrollPolicy',
  PAY_TYPE = 'PayType',
  SIGNING_BONUS = 'SigningBonus',
  TERMINATION_BENEFIT = 'TerminationBenefit',
  COMPANY_SETTINGS = 'CompanySettings',
}

@Schema({ collection: 'payroll_config_audit_logs', timestamps: true })
export class AuditLog {
  @Prop({ type: String, enum: AuditEntityType, required: true })
  entityType: AuditEntityType;

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;

  @Prop({ type: String, enum: AuditAction, required: true })
  action: AuditAction;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
  actorId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now, required: true })
  timestamp: Date;

  @Prop({ type: Object })
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };

  @Prop({ type: String })
  reason?: string;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Create indexes for efficient querying
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

