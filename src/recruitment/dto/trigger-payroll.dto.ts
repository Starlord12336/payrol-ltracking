import { IsString, IsOptional } from 'class-validator';

export class TriggerPayrollDto {
  @IsString()
  triggeredBy: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
