import { IsString, IsOptional, IsMongoId, IsObject } from 'class-validator';

export class SubmitStructuredFeedbackDto {
  @IsMongoId()
  interviewerId: string;

  @IsString()
  formKey: string;

  @IsObject()
  responses: Record<string, number>;

  @IsOptional()
  @IsString()
  comments?: string;
}
