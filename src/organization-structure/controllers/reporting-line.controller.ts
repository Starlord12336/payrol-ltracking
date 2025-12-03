import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ReportingLineService } from '../services/reporting-line.service';
import {
  CreateReportingLineDto,
  UpdateReportingLineDto,
  QueryReportingLineDto,
} from '../dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../auth';
import { UserRole } from '../../shared/schemas/user.schema';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Controller('organization-structure/reporting-lines')
@UseGuards(JwtAuthGuard)
export class ReportingLineController {
  constructor(private readonly reportingLineService: ReportingLineService) {}

  /**
   * Create a new reporting line
   * POST /api/organization-structure/reporting-lines
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async create(
    @Body() createReportingLineDto: CreateReportingLineDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const reportingLine = await this.reportingLineService.create(createReportingLineDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Reporting line created successfully',
      data: reportingLine,
    };
  }

  /**
   * Get all reporting lines with filters and pagination
   * GET /api/organization-structure/reporting-lines
   */
  @Get()
  async findAll(@Query() queryDto: QueryReportingLineDto) {
    const result = await this.reportingLineService.findAll(queryDto);
    
    return {
      success: true,
      message: 'Reporting lines retrieved successfully',
      ...result,
    };
  }

  /**
   * Get reporting line by ID
   * GET /api/organization-structure/reporting-lines/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reportingLine = await this.reportingLineService.findOne(id);
    
    return {
      success: true,
      message: 'Reporting line retrieved successfully',
      data: reportingLine,
    };
  }

  /**
   * Get all reporting lines for an employee (all managers)
   * GET /api/organization-structure/reporting-lines/employee/:employeeId
   */
  @Get('employee/:employeeId')
  async findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const isActiveOnly = activeOnly !== 'false';
    const reportingLines = await this.reportingLineService.findByEmployee(employeeId, isActiveOnly);
    
    return {
      success: true,
      message: 'Reporting lines retrieved successfully',
      data: reportingLines,
      total: reportingLines.length,
    };
  }

  /**
   * Get all reporting lines for a manager (all direct reports)
   * GET /api/organization-structure/reporting-lines/manager/:managerId
   */
  @Get('manager/:managerId')
  async findByManager(
    @Param('managerId') managerId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const isActiveOnly = activeOnly !== 'false';
    const reportingLines = await this.reportingLineService.findByManager(managerId, isActiveOnly);
    
    return {
      success: true,
      message: 'Reporting lines retrieved successfully',
      data: reportingLines,
      total: reportingLines.length,
    };
  }

  /**
   * Get direct reports only (DIRECT reporting type)
   * GET /api/organization-structure/reporting-lines/manager/:managerId/direct-reports
   */
  @Get('manager/:managerId/direct-reports')
  async getDirectReports(
    @Param('managerId') managerId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const isActiveOnly = activeOnly !== 'false';
    const reportingLines = await this.reportingLineService.getDirectReports(managerId, isActiveOnly);
    
    return {
      success: true,
      message: 'Direct reports retrieved successfully',
      data: reportingLines,
      total: reportingLines.length,
    };
  }

  /**
   * Get dotted line reports (DOTTED, FUNCTIONAL, ADMINISTRATIVE)
   * GET /api/organization-structure/reporting-lines/manager/:managerId/dotted-line
   */
  @Get('manager/:managerId/dotted-line')
  async getDottedLineReports(
    @Param('managerId') managerId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const isActiveOnly = activeOnly !== 'false';
    const reportingLines = await this.reportingLineService.getDottedLineReports(managerId, isActiveOnly);
    
    return {
      success: true,
      message: 'Dotted line reports retrieved successfully',
      data: reportingLines,
      total: reportingLines.length,
    };
  }

  /**
   * Get full reporting chain (all managers up the hierarchy)
   * GET /api/organization-structure/reporting-lines/employee/:employeeId/chain
   */
  @Get('employee/:employeeId/chain')
  async getReportingChain(@Param('employeeId') employeeId: string) {
    const chain = await this.reportingLineService.getReportingChain(employeeId);
    
    return {
      success: true,
      message: 'Reporting chain retrieved successfully',
      data: chain,
      total: chain.length,
    };
  }

  /**
   * Update a reporting line
   * PUT /api/organization-structure/reporting-lines/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateReportingLineDto: UpdateReportingLineDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const reportingLine = await this.reportingLineService.update(id, updateReportingLineDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Reporting line updated successfully',
      data: reportingLine,
    };
  }

  /**
   * Deactivate a reporting line
   * DELETE /api/organization-structure/reporting-lines/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const reportingLine = await this.reportingLineService.deactivate(id, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Reporting line deactivated successfully',
      data: reportingLine,
    };
  }
}

