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
  BadRequestException,
} from '@nestjs/common';
import { PositionService } from '../services/position.service';
import { 
  CreatePositionDto, 
  UpdatePositionDto, 
  QueryPositionDto,
  AssignReportingPositionDto,
  AssignDepartmentDto,
} from '../dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../auth';
import { UserRole } from '../../shared/schemas/user.schema';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Controller('organization-structure/positions')
@UseGuards(JwtAuthGuard)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  /**
   * Create a new position
   * POST /api/organization-structure/positions
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async create(
    @Body() createPositionDto: CreatePositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.create(createPositionDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Position created successfully',
      data: position,
    };
  }

  /**
   * Get all positions with filters and pagination
   * GET /api/organization-structure/positions
   * Roles: All authenticated users
   */
  @Get()
  async findAll(@Query() queryDto: QueryPositionDto) {
    const result = await this.positionService.findAll(queryDto);
    
    return {
      success: true,
      message: 'Positions retrieved successfully',
      ...result,
    };
  }

  /**
   * Get position hierarchy (tree structure)
   * GET /api/organization-structure/positions/hierarchy
   * Roles: All authenticated users
   */
  @Get('hierarchy')
  async getHierarchy(@Query('positionId') positionId?: string) {
    const hierarchy = await this.positionService.getPositionHierarchy(positionId);
    
    return {
      success: true,
      message: 'Position hierarchy retrieved successfully',
      data: hierarchy,
    };
  }

  /**
   * Note: Headcount-related endpoints removed - not in main repo schema
   * (available-slots, at-capacity, over-capacity, headcount/statistics)
   */

  /**
   * Get all positions in a specific department
   * GET /api/organization-structure/positions/department/:departmentId
   * Roles: All authenticated users
   */
  @Get('department/:departmentId')
  async getPositionsByDepartment(@Param('departmentId') departmentId: string) {
    const positions = await this.positionService.getPositionsByDepartment(departmentId);
    
    return {
      success: true,
      message: 'Positions retrieved successfully',
      data: positions,
      count: positions.length,
    };
  }

  /**
   * Get position by ID
   * GET /api/organization-structure/positions/:id
   * Roles: All authenticated users
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const position = await this.positionService.findOne(id);
    
    return {
      success: true,
      message: 'Position retrieved successfully',
      data: position,
    };
  }

  /**
   * Get position by code
   * GET /api/organization-structure/positions/code/:code
   * Roles: All authenticated users
   */
  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    const position = await this.positionService.findByCode(code);
    
    return {
      success: true,
      message: 'Position retrieved successfully',
      data: position,
    };
  }

  /**
   * Update a position
   * PUT /api/organization-structure/positions/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.update(id, updatePositionDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Position updated successfully',
      data: position,
    };
  }

  /**
   * Update a position by code
   * PUT /api/organization-structure/positions/code/:code
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put('code/:code')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async updateByCode(
    @Param('code') code: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.findByCode(code);
    const updatedPosition = await this.positionService.update(
      (position as any)._id.toString(),
      updatePositionDto,
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Position updated successfully',
      data: updatedPosition,
    };
  }

  /**
   * Soft delete a position (deactivate)
   * DELETE /api/organization-structure/positions/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.remove(id, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Position deactivated successfully',
      data: position,
    };
  }

  /**
   * Soft delete a position by code (deactivate)
   * DELETE /api/organization-structure/positions/code/:code
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Delete('code/:code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async removeByCode(
    @Param('code') code: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.findByCode(code);
    const deletedPosition = await this.positionService.remove(
      (position as any)._id.toString(),
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Position deactivated successfully',
      data: deletedPosition,
    };
  }

  /**
   * Assign or change reporting position (hierarchy management)
   * PUT /api/organization-structure/positions/:id/reporting-position
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put(':id/reporting-position')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async assignReportingPosition(
    @Param('id') id: string,
    @Body() assignReportingPositionDto: AssignReportingPositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.assignReportingPosition(
      id,
      assignReportingPositionDto.reportsToPositionId || null,
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: assignReportingPositionDto.reportsToPositionId
        ? 'Reporting position assigned successfully'
        : 'Reporting position removed successfully',
      data: position,
    };
  }

  /**
   * Assign or change reporting position by code (convenience endpoint)
   * PUT /api/organization-structure/positions/code/:code/reporting-position
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put('code/:code/reporting-position')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async assignReportingPositionByCode(
    @Param('code') code: string,
    @Body() assignReportingPositionDto: AssignReportingPositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.findByCode(code);
    const updatedPosition = await this.positionService.assignReportingPosition(
      (position as any)._id.toString(),
      assignReportingPositionDto.reportsToPositionId || null,
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: assignReportingPositionDto.reportsToPositionId
        ? 'Reporting position assigned successfully'
        : 'Reporting position removed successfully',
      data: updatedPosition,
    };
  }

  /**
   * Get positions that report to this position (direct reports)
   * GET /api/organization-structure/positions/:id/reporting-positions
   * Roles: All authenticated users
   */
  @Get(':id/reporting-positions')
  async getReportingPositions(@Param('id') id: string) {
    const reportingPositions = await this.positionService.getReportingPositions(id);
    
    return {
      success: true,
      message: 'Reporting positions retrieved successfully',
      data: reportingPositions,
    };
  }

  /**
   * Get positions that report to this position by code
   * GET /api/organization-structure/positions/code/:code/reporting-positions
   * Roles: All authenticated users
   */
  @Get('code/:code/reporting-positions')
  async getReportingPositionsByCode(@Param('code') code: string) {
    const position = await this.positionService.findByCode(code);
    const reportingPositions = await this.positionService.getReportingPositions(
      (position as any)._id.toString(),
    );
    
    return {
      success: true,
      message: 'Reporting positions retrieved successfully',
      data: reportingPositions,
    };
  }

  /**
   * Get reporting chain (positions this position reports to, up the hierarchy)
   * GET /api/organization-structure/positions/:id/reporting-chain
   * Roles: All authenticated users
   */
  @Get(':id/reporting-chain')
  async getReportingChain(@Param('id') id: string) {
    const chain = await this.positionService.getReportingChain(id);
    
    return {
      success: true,
      message: 'Reporting chain retrieved successfully',
      data: chain,
    };
  }

  /**
   * Get reporting chain by code
   * GET /api/organization-structure/positions/code/:code/reporting-chain
   * Roles: All authenticated users
   */
  @Get('code/:code/reporting-chain')
  async getReportingChainByCode(@Param('code') code: string) {
    const position = await this.positionService.findByCode(code);
    const chain = await this.positionService.getReportingChain(
      (position as any)._id.toString(),
    );
    
    return {
      success: true,
      message: 'Reporting chain retrieved successfully',
      data: chain,
    };
  }

  /**
   * Update position headcount
   * PUT /api/organization-structure/positions/:id/headcount
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put(':id/headcount')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async updateHeadcount(
    @Param('id') id: string,
    @Body() updateHeadcountDto: { headcountBudget?: number; currentHeadcount?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.update(
      id,
      {
        headcountBudget: updateHeadcountDto.headcountBudget,
        currentHeadcount: updateHeadcountDto.currentHeadcount,
      },
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Headcount updated successfully',
      data: position,
    };
  }

  /**
   * Update position headcount by code
   * PUT /api/organization-structure/positions/code/:code/headcount
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put('code/:code/headcount')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async updateHeadcountByCode(
    @Param('code') code: string,
    @Body() updateHeadcountDto: { headcountBudget?: number; currentHeadcount?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.findByCode(code);
    const updatedPosition = await this.positionService.update(
      (position as any)._id.toString(),
      {
        headcountBudget: updateHeadcountDto.headcountBudget,
        currentHeadcount: updateHeadcountDto.currentHeadcount,
      },
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Headcount updated successfully',
      data: updatedPosition,
    };
  }

  /**
   * Get headcount statistics for a position
   * GET /api/organization-structure/positions/:id/headcount-stats
   */
  @Get(':id/headcount-stats')
  async getHeadcountStats(@Param('id') id: string) {
    const position = await this.positionService.findOne(id);
    const positionDoc = position as any;
    const stats = {
      positionId: positionDoc._id?.toString() || positionDoc.id,
      positionCode: positionDoc.code,
      positionTitle: positionDoc.title,
      headcountBudget: positionDoc.headcountBudget || 0,
      currentHeadcount: positionDoc.currentHeadcount || 0,
      vacantSlots: Math.max(0, (positionDoc.headcountBudget || 0) - (positionDoc.currentHeadcount || 0)),
      utilizationPercent: positionDoc.headcountBudget 
        ? ((positionDoc.currentHeadcount || 0) / positionDoc.headcountBudget) * 100 
        : 0,
    };
    
    return {
      success: true,
      message: 'Headcount statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Reassign position to a different department
   * PUT /api/organization-structure/positions/:id/department
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put(':id/department')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async assignDepartment(
    @Param('id') id: string,
    @Body() assignDepartmentDto: AssignDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.assignDepartment(
      id,
      assignDepartmentDto.departmentId,
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Position reassigned to department successfully',
      data: position,
    };
  }

  /**
   * Reassign position to a different department by code
   * PUT /api/organization-structure/positions/code/:code/department
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put('code/:code/department')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async assignDepartmentByCode(
    @Param('code') code: string,
    @Body() assignDepartmentDto: AssignDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.positionService.findByCode(code);
    const updatedPosition = await this.positionService.assignDepartment(
      (position as any)._id.toString(),
      assignDepartmentDto.departmentId,
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Position reassigned to department successfully',
      data: updatedPosition,
    };
  }
}

