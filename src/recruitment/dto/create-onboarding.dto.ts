import { IsString, IsArray, IsOptional, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class OnboardingTaskDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsDateString()
    deadline?: string;

    @IsOptional()
    @IsString()
    documentId?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateOnboardingDto {
    @IsString()
    employeeId: string;

    @IsString()
    contractId: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OnboardingTaskDto)
    tasks?: OnboardingTaskDto[];
}
