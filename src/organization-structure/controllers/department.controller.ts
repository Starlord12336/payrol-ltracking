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
import { DepartmentService } from '../services/department.service';
import { 
  CreateDepartmentDto, 
  UpdateDepartmentDto, 
  QueryDepartmentDto,
  AssignHeadDto,
} from '../dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../auth';
import { UserRole } from '../../shared/schemas/user.schema';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Controller('organization-structure/departments')
@UseGuards(JwtAuthGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  /**
   * Create a new department
   * POST /api/organization-structure/departments
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.departmentService.create(createDepartmentDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Department created successfully',
      data: department,
    };
  }

  /**
   * Get all departments with filters and pagination
   * GET /api/organization-structure/departments
   * Roles: All authenticated users
   */
  @Get()
  async findAll(@Query() queryDto: QueryDepartmentDto) {
    const result = await this.departmentService.findAll(queryDto);
    
    return {
      success: true,
      message: 'Departments retrieved successfully',
      ...result,
    };
  }

  /**
   * Get department hierarchy (tree structure)
   * GET /api/organization-structure/departments/hierarchy
   * Roles: All authenticated users
   */
  @Get('hierarchy')
  async getHierarchy(@Query('departmentId') departmentId?: string) {
    const hierarchy = await this.departmentService.getDepartmentHierarchy(departmentId);
    
    return {
      success: true,
      message: 'Department hierarchy retrieved successfully',
      data: hierarchy,
    };
  }

  /**
   * Get department by code
   * GET /api/organization-structure/departments/code/:code
   * Roles: All authenticated users
   */
  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    const department = await this.departmentService.findByCode(code);
    
    return {
      success: true,
      message: 'Department retrieved successfully',
      data: department,
    };
  }

  /**
   * Get department by ID
   * GET /api/organization-structure/departments/:id
   * Roles: All authenticated users
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const department = await this.departmentService.findOne(id);
    
    return {
      success: true,
      message: 'Department retrieved successfully',
      data: department,
    };
  }

  /**
   * Get department statistics
   * GET /api/organization-structure/departments/:id/stats
   * Roles: All authenticated users
   */
  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    const stats = await this.departmentService.getDepartmentStats(id);
    
    return {
      success: true,
      message: 'Department statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Update a department by ID
   * PUT /api/organization-structure/departments/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.departmentService.update(id, updateDepartmentDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Department updated successfully',
      data: department,
    };
  }

  /**
   * Update a department by code (convenience endpoint)
   * PUT /api/organization-structure/departments/code/:code
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put('code/:code')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async updateByCode(
    @Param('code') code: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // First find department by code to get ID
    const department = await this.departmentService.findByCode(code);
    
    // Then update using the ID
    const updatedDepartment = await this.departmentService.update(
      (department as any)._id.toString(),
      updateDepartmentDto,
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment,
    };
  }

  /**
   * Deactivate a department by ID (soft delete)
   * DELETE /api/organization-structure/departments/:id
   * Roles: SYSTEM_ADMIN
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.departmentService.remove(id, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Department deactivated successfully',
      data: department,
    };
  }

  /**
   * Deactivate a department by code (convenience endpoint)
   * DELETE /api/organization-structure/departments/code/:code
   * Roles: SYSTEM_ADMIN
   */
  @Delete('code/:code')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  async removeByCode(
    @Param('code') code: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // First find department by code to get ID
    const department = await this.departmentService.findByCode(code);
    
    // Then delete using the ID
    const deletedDepartment = await this.departmentService.remove(
      (department as any)._id.toString(),
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Department deactivated successfully',
      data: deletedDepartment,
    };
  }

  // ==========================================
  // DEPARTMENT HEAD MANAGEMENT ENDPOINTS
  // ==========================================
  // Note: Parent/Child department endpoints removed - not in main repo schema

  /**
   * Assign or change department head position
   * PUT /api/organization-structure/departments/:id/head
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put(':id/head')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async assignHead(
    @Param('id') id: string,
    @Body() assignHeadDto: AssignHeadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.departmentService.assignDepartmentHead(
      id,
      assignHeadDto.headPositionId || null,
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: assignHeadDto.headPositionId 
        ? 'Department head position assigned successfully'
        : 'Department head position removed successfully',
      data: department,
    };
  }

  /**
   * Assign department head position by code
   * PUT /api/organization-structure/departments/code/:code/head
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Put('code/:code/head')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async assignHeadByCode(
    @Param('code') code: string,
    @Body() assignHeadDto: AssignHeadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.departmentService.findByCode(code);
    const updatedDepartment = await this.departmentService.assignDepartmentHead(
      (department as any)._id.toString(),
      assignHeadDto.headPositionId || null,
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: assignHeadDto.headPositionId 
        ? 'Department head position assigned successfully'
        : 'Department head position removed successfully',
      data: updatedDepartment,
    };
  }

  /**
   * Update department cost center
   * PUT /api/organization-structure/departments/:id/cost-center
   * Roles: HR_ADMIN, SYSTEM_ADMIN, FINANCE_STAFF
   */
  @Put(':id/cost-center')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.FINANCE_STAFF)
  async updateCostCenter(
    @Param('id') id: string,
    @Body() updateCostCenterDto: { costCenter?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.departmentService.update(
      id,
      { costCenter: updateCostCenterDto.costCenter || undefined },
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Cost center updated successfully',
      data: department,
    };
  }

  /**
   * Update department cost center by code
   * PUT /api/organization-structure/departments/code/:code/cost-center
   * Roles: HR_ADMIN, SYSTEM_ADMIN, FINANCE_STAFF
   */
  @Put('code/:code/cost-center')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.FINANCE_STAFF)
  async updateCostCenterByCode(
    @Param('code') code: string,
    @Body() updateCostCenterDto: { costCenter?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.departmentService.findByCode(code);
    const updatedDepartment = await this.departmentService.update(
      (department as any)._id.toString(),
      { costCenter: updateCostCenterDto.costCenter || undefined },
      user.sub?.toString() || user.userid.toString(),
    );
    
    return {
      success: true,
      message: 'Cost center updated successfully',
      data: updatedDepartment,
    };
  }
}

