import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SectionRatingDto } from './create-appraisal-evaluation.dto';

export class SubmitSelfAssessmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionRatingDto)
  @ArrayMinSize(1)
  sections: SectionRatingDto[];

  @IsString()
  @IsOptional()
  overallComments?: string;
}
