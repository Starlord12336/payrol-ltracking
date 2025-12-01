import { IsString, IsOptional, IsEnum, IsEmail, IsBoolean } from 'class-validator';
import { ContactPriority, RelationshipType } from '../models/emergency-contact.schema';

export class CreateEmergencyContactDto {
  @IsString()
  fullName: string;

  @IsString()
  relationship: string;

  @IsEnum(RelationshipType)
  relationshipType: RelationshipType;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  alternatePhoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(ContactPriority)
  @IsOptional()
  priority?: ContactPriority;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

