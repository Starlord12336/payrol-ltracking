import {
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';
import { ReviewPayrollResponseDto } from './dto';

@Controller('payroll-execution')
export class PayrollExecutionController {
  constructor(
    private readonly payrollExecutionService: PayrollExecutionService,
  ) {}

  //phase 2

  @Post('runs/:runId/review')
  @HttpCode(HttpStatus.OK)
  async reviewPayroll(
    @Param('runId') runId: string,
  ): Promise<ReviewPayrollResponseDto> {
    return this.payrollExecutionService.reviewPayrollRun(runId);
  }

  @Get('runs/:runId')
  getPayrollRunDetails() {
    return { message: 'Get payroll details - To be implemented' };
  }
}
