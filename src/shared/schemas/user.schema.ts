import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HR_MANAGER = 'HR_MANAGER',
  HR_ADMIN = 'HR_ADMIN',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  PAYROLL_SPECIALIST = 'PAYROLL_SPECIALIST',
  PAYROLL_MANAGER = 'PAYROLL_MANAGER',
  FINANCE_STAFF = 'FINANCE_STAFF',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  LEGAL_ADMIN = 'LEGAL_ADMIN',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: Object.values(UserRole) })
  role: UserRole;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  // Timestamps (createdAt, updatedAt) are added automatically by Mongoose
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ employeeId: 1 });
UserSchema.index({ isActive: 1 });

