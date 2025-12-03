import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { NoteCategory, NoteVisibility } from '../models/employee-note.schema';

export class CreateEmployeeNoteDto {
  @IsString()
  note: string;

  @IsEnum(NoteCategory)
  @IsOptional()
  category?: NoteCategory;

  @IsEnum(NoteVisibility)
  @IsOptional()
  visibility?: NoteVisibility;

  @IsBoolean()
  @IsOptional()
  requiresFollowUp?: boolean;

  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  @IsBoolean()
  @IsOptional()
  isConfidential?: boolean;
}

