import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  Min,
  Max,
} from 'class-validator';

export class SubmitInterviewFeedbackDto {
  @IsMongoId()
  interviewerId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
