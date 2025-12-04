import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApprovePayrollDto {
  @ApiProperty({
    description: 'ID of the approver (Payroll Manager or Finance Staff)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  approverId: string;

  @ApiPropertyOptional({
    description: 'Optional comments for approval',
    example: 'All calculations verified',
  })
  @IsOptional()
  @IsString()
  comments?: string;
}
