import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeNoteDto } from './create-employee-note.dto';
import { IsBoolean, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateEmployeeNoteDto extends PartialType(CreateEmployeeNoteDto) {
  @IsBoolean()
  @IsOptional()
  isFollowedUp?: boolean;

  @IsDateString()
  @IsOptional()
  followedUpAt?: string;

  @IsString()
  @IsOptional()
  followUpNotes?: string;
}

