import { IsString, IsBoolean, IsOptional } from "class-validator";

export class ScheduleRuleDto {
  @IsString()
  name: string;

  @IsString()
  pattern: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class CreateScheduleRuleDto {
  @IsString()
  name: string;

  @IsString()
  pattern: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateScheduleRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  pattern?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
