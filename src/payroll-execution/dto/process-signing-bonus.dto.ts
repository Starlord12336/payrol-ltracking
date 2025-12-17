import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessSigningBonusDto {
  @ApiProperty({
    description: 'ID of the employee',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({
    description: 'ID of the signing bonus from configuration',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty()
  @IsString()
  signingBonusId: string;

  @ApiProperty({
    description: 'Amount to be given to the employee for this signing bonus',
    example: 5000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  givenAmount: number;
}
