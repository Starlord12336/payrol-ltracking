import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmployeeDocument = Employee & Document;

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
}

@Schema({ _id: false })
export class PersonalInfo {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true })
  middleName?: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ trim: true })
  fullNameArabic?: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true, enum: Object.values(Gender) })
  gender: Gender;

  @Prop({ required: true, trim: true })
  nationality: string;

  @Prop({ required: true, unique: true, trim: true })
  nationalId: string;

  @Prop({ trim: true })
  passportNumber?: string;

  @Prop({ required: true, enum: Object.values(MaritalStatus) })
  maritalStatus: MaritalStatus;

  @Prop()
  profilePicture?: string;
}

@Schema({ _id: false })
export class Address {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  postalCode: string;
}

@Schema({ _id: false })
export class ContactInfo {
  @Prop({ required: true, lowercase: true, trim: true })
  personalEmail: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  workEmail: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ trim: true })
  alternatePhone?: string;

  @Prop({ type: Address, required: true })
  address: Address;
}

@Schema({ _id: false })
export class EmploymentInfo {
  @Prop({ required: true, unique: true, trim: true })
  employeeNumber: string;

  @Prop({ required: true })
  hireDate: Date;

  @Prop({ required: true })
  workReceivingDate: Date;

  @Prop({ required: true, enum: Object.values(ContractType) })
  contractType: ContractType;

  @Prop({ required: true, enum: Object.values(EmploymentStatus), default: EmploymentStatus.ACTIVE })
  employmentStatus: EmploymentStatus;

  @Prop()
  probationEndDate?: Date;

  @Prop()
  confirmationDate?: Date;

  @Prop()
  terminationDate?: Date;

  @Prop()
  terminationReason?: string;
}

@Schema({ _id: false })
export class OrganizationalInfo {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department', required: true })
  departmentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position', required: true })
  positionId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee' })
  reportingManagerId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Employee' })
  dottedLineManagerId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  location: string;
}

@Schema({ _id: false })
export class CompensationInfo {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PayGrade', required: true })
  payGradeId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: 'EGP' })
  currency: string;

  @Prop()
  bankAccountNumber?: string;

  @Prop()
  bankName?: string;

  @Prop()
  bankBranch?: string;
}

@Schema({ _id: false })
export class Metadata {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  updatedAt: Date;

  @Prop({ default: 1 })
  version: number;
}

@Schema({ timestamps: true, collection: 'employees' })
export class Employee {
  @Prop({ type: PersonalInfo, required: true })
  personalInfo: PersonalInfo;

  @Prop({ type: ContactInfo, required: true })
  contactInfo: ContactInfo;

  @Prop({ type: EmploymentInfo, required: true })
  employmentInfo: EmploymentInfo;

  @Prop({ type: OrganizationalInfo, required: true })
  organizationalInfo: OrganizationalInfo;

  @Prop({ type: CompensationInfo, required: true })
  compensationInfo: CompensationInfo;

  @Prop({ type: Metadata, required: true })
  metadata: Metadata;

  @Prop({ default: true })
  isActive: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Indexes
EmployeeSchema.index({ 'personalInfo.nationalId': 1 }, { unique: true });
EmployeeSchema.index({ 'contactInfo.workEmail': 1 }, { unique: true });
EmployeeSchema.index({ 'employmentInfo.employeeNumber': 1 }, { unique: true });
EmployeeSchema.index({ 'organizationalInfo.departmentId': 1 });
EmployeeSchema.index({ 'organizationalInfo.positionId': 1 });
EmployeeSchema.index({ 'organizationalInfo.reportingManagerId': 1 });
EmployeeSchema.index({ 'employmentInfo.employmentStatus': 1 });
EmployeeSchema.index({ isActive: 1 });

// Virtual for full name
EmployeeSchema.virtual('fullName').get(function (this: EmployeeDocument) {
  const { firstName, middleName, lastName } = this.personalInfo;
  return middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
});

// Ensure virtuals are included in toJSON
EmployeeSchema.set('toJSON', { virtuals: true });
EmployeeSchema.set('toObject', { virtuals: true });

