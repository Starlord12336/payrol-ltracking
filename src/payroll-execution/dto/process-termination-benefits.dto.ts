import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessTerminationBenefitsDto {
  @ApiProperty({
    description: 'ID of the termination request',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  terminationId: string;

  @ApiProperty({
    description: 'ID of the termination/resignation benefit from configuration',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty()
  @IsString()
  benefitId: string;

  @ApiProperty({
    description: 'Amount to be given to the employee for this benefit',
    example: 5000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  givenAmount: number;
}

