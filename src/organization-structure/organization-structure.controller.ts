// Consolidated Organization Structure Controller
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
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { OrganizationStructureService } from './organization-structure.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
  AssignHeadDto,
  CreatePositionDto,
  UpdatePositionDto,
  QueryPositionDto,
  AssignReportingPositionDto,
  AssignDepartmentDto,
  CreateOrgChangeRequestDto,
  UpdateOrgChangeRequestDto,
  QueryOrgChangeRequestDto,
  ReviewOrgChangeRequestDto,
  ApproveOrgChangeRequestDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../auth';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('organization-structure')
@UseGuards(JwtAuthGuard)
export class OrganizationStructureController {
  constructor(
    private readonly orgStructureService: OrganizationStructureService,
  ) {}

  // =====================================
  // DEPARTMENT ENDPOINTS
  // =====================================

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async createDepartment(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.orgStructureService.createDepartment(
      createDepartmentDto,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Department created successfully',
      data: department,
    };
  }

  @Get('departments')
  async findAllDepartments(@Query() queryDto: QueryDepartmentDto) {
    const result = await this.orgStructureService.findAllDepartments(queryDto);

    return {
      success: true,
      message: 'Departments retrieved successfully',
      ...result,
    };
  }

  @Get('departments/hierarchy')
  async getDepartmentHierarchy(@Query('departmentId') departmentId?: string) {
    const hierarchy =
      await this.orgStructureService.getDepartmentHierarchy(departmentId);

    return {
      success: true,
      message: 'Department hierarchy retrieved successfully',
      data: hierarchy,
    };
  }

  @Get('departments/code/:code')
  async findDepartmentByCode(@Param('code') code: string) {
    const department =
      await this.orgStructureService.findDepartmentByCode(code);

    return {
      success: true,
      message: 'Department retrieved successfully',
      data: department,
    };
  }

  @Get('departments/:id')
  async findDepartmentById(@Param('id') id: string) {
    const department = await this.orgStructureService.findDepartmentById(id);

    return {
      success: true,
      message: 'Department retrieved successfully',
      data: department,
    };
  }

  @Get('departments/:id/stats')
  async getDepartmentStats(@Param('id') id: string) {
    const stats = await this.orgStructureService.getDepartmentStats(id);

    return {
      success: true,
      message: 'Department statistics retrieved successfully',
      data: stats,
    };
  }

  @Put('departments/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateDepartment(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.orgStructureService.updateDepartment(
      id,
      updateDepartmentDto,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Department updated successfully',
      data: department,
    };
  }

  @Put('departments/code/:code')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateDepartmentByCode(
    @Param('code') code: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const department =
      await this.orgStructureService.findDepartmentByCode(code);
    const updatedDepartment = await this.orgStructureService.updateDepartment(
      (department as any)._id.toString(),
      updateDepartmentDto,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment,
    };
  }

  @Delete('departments/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async removeDepartment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.orgStructureService.removeDepartment(
      id,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Department deactivated successfully',
      data: department,
    };
  }

  @Delete('departments/code/:code')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async removeDepartmentByCode(
    @Param('code') code: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const department =
      await this.orgStructureService.findDepartmentByCode(code);
    const deletedDepartment = await this.orgStructureService.removeDepartment(
      (department as any)._id.toString(),
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Department deactivated successfully',
      data: deletedDepartment,
    };
  }

  @Put('departments/:id/head')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async assignDepartmentHead(
    @Param('id') id: string,
    @Body() assignHeadDto: AssignHeadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const department = await this.orgStructureService.assignDepartmentHead(
      id,
      assignHeadDto.headPositionId || null,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: assignHeadDto.headPositionId
        ? 'Department head position assigned successfully'
        : 'Department head position removed successfully',
      data: department,
    };
  }

  @Put('departments/code/:code/head')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async assignDepartmentHeadByCode(
    @Param('code') code: string,
    @Body() assignHeadDto: AssignHeadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const department =
      await this.orgStructureService.findDepartmentByCode(code);
    const updatedDepartment =
      await this.orgStructureService.assignDepartmentHead(
        (department as any)._id.toString(),
        assignHeadDto.headPositionId || null,
        user.employeeId?.toString() || user.userid.toString(),
      );

    return {
      success: true,
      message: assignHeadDto.headPositionId
        ? 'Department head position assigned successfully'
        : 'Department head position removed successfully',
      data: updatedDepartment,
    };
  }

  // =====================================
  // POSITION ENDPOINTS
  // =====================================

  @Post('positions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async createPosition(
    @Body() createPositionDto: CreatePositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.orgStructureService.createPosition(
      createPositionDto,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Position created successfully',
      data: position,
    };
  }

  @Get('positions')
  async findAllPositions(@Query() queryDto: QueryPositionDto) {
    const result = await this.orgStructureService.findAllPositions(queryDto);

    return {
      success: true,
      message: 'Positions retrieved successfully',
      ...result,
    };
  }

  @Get('positions/hierarchy')
  async getPositionHierarchy(@Query('positionId') positionId?: string) {
    const hierarchy =
      await this.orgStructureService.getPositionHierarchy(positionId);

    return {
      success: true,
      message: 'Position hierarchy retrieved successfully',
      data: hierarchy,
    };
  }

  @Get('positions/department/:departmentId')
  async getPositionsByDepartment(@Param('departmentId') departmentId: string) {
    const positions =
      await this.orgStructureService.getPositionsByDepartment(departmentId);

    return {
      success: true,
      message: 'Positions retrieved successfully',
      data: positions,
      count: positions.length,
    };
  }

  @Get('positions/:id')
  async findPositionById(@Param('id') id: string) {
    const position = await this.orgStructureService.findPositionById(id);

    return {
      success: true,
      message: 'Position retrieved successfully',
      data: position,
    };
  }

  @Get('positions/code/:code')
  async findPositionByCode(@Param('code') code: string) {
    const position = await this.orgStructureService.findPositionByCode(code);

    return {
      success: true,
      message: 'Position retrieved successfully',
      data: position,
    };
  }

  @Put('positions/:id')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updatePosition(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.orgStructureService.updatePosition(
      id,
      updatePositionDto,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Position updated successfully',
      data: position,
    };
  }

  @Put('positions/code/:code')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updatePositionByCode(
    @Param('code') code: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.orgStructureService.findPositionByCode(code);
    const updatedPosition = await this.orgStructureService.updatePosition(
      (position as any)._id.toString(),
      updatePositionDto,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Position updated successfully',
      data: updatedPosition,
    };
  }

  @Delete('positions/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async removePosition(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.orgStructureService.removePosition(
      id,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Position deactivated successfully',
      data: position,
    };
  }

  @Delete('positions/code/:code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async removePositionByCode(
    @Param('code') code: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.orgStructureService.findPositionByCode(code);
    const deletedPosition = await this.orgStructureService.removePosition(
      (position as any)._id.toString(),
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Position deactivated successfully',
      data: deletedPosition,
    };
  }

  @Put('positions/:id/reporting-position')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async assignReportingPosition(
    @Param('id') id: string,
    @Body() assignReportingPositionDto: AssignReportingPositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.orgStructureService.assignReportingPosition(
      id,
      assignReportingPositionDto.reportsToPositionId || null,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: assignReportingPositionDto.reportsToPositionId
        ? 'Reporting position assigned successfully'
        : 'Reporting position removed successfully',
      data: position,
    };
  }

  @Put('positions/code/:code/reporting-position')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async assignReportingPositionByCode(
    @Param('code') code: string,
    @Body() assignReportingPositionDto: AssignReportingPositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.orgStructureService.findPositionByCode(code);
    const updatedPosition =
      await this.orgStructureService.assignReportingPosition(
        (position as any)._id.toString(),
        assignReportingPositionDto.reportsToPositionId || null,
        user.employeeId?.toString() || user.userid.toString(),
      );

    return {
      success: true,
      message: assignReportingPositionDto.reportsToPositionId
        ? 'Reporting position assigned successfully'
        : 'Reporting position removed successfully',
      data: updatedPosition,
    };
  }

  @Get('positions/:id/reporting-positions')
  async getReportingPositions(@Param('id') id: string) {
    const reportingPositions =
      await this.orgStructureService.getReportingPositions(id);

    return {
      success: true,
      message: 'Reporting positions retrieved successfully',
      data: reportingPositions,
    };
  }

  @Get('positions/code/:code/reporting-positions')
  async getReportingPositionsByCode(@Param('code') code: string) {
    const position = await this.orgStructureService.findPositionByCode(code);
    const reportingPositions =
      await this.orgStructureService.getReportingPositions(
        (position as any)._id.toString(),
      );

    return {
      success: true,
      message: 'Reporting positions retrieved successfully',
      data: reportingPositions,
    };
  }

  @Get('positions/:id/reporting-chain')
  async getReportingChain(@Param('id') id: string) {
    const chain = await this.orgStructureService.getReportingChain(id);

    return {
      success: true,
      message: 'Reporting chain retrieved successfully',
      data: chain,
    };
  }

  @Get('positions/code/:code/reporting-chain')
  async getReportingChainByCode(@Param('code') code: string) {
    const position = await this.orgStructureService.findPositionByCode(code);
    const chain = await this.orgStructureService.getReportingChain(
      (position as any)._id.toString(),
    );

    return {
      success: true,
      message: 'Reporting chain retrieved successfully',
      data: chain,
    };
  }

  @Put('positions/:id/department')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async assignDepartment(
    @Param('id') id: string,
    @Body() assignDepartmentDto: AssignDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.orgStructureService.assignDepartmentToPosition(
      id,
      assignDepartmentDto.departmentId,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Position reassigned to department successfully',
      data: position,
    };
  }

  @Put('positions/code/:code/department')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async assignDepartmentByCode(
    @Param('code') code: string,
    @Body() assignDepartmentDto: AssignDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const position = await this.orgStructureService.findPositionByCode(code);
    const updatedPosition =
      await this.orgStructureService.assignDepartmentToPosition(
        (position as any)._id.toString(),
        assignDepartmentDto.departmentId,
        user.employeeId?.toString() || user.userid.toString(),
      );

    return {
      success: true,
      message: 'Position reassigned to department successfully',
      data: updatedPosition,
    };
  }

  // =====================================
  // CHANGE REQUEST ENDPOINTS
  // =====================================

  @Post('change-requests')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
  )
  async createChangeRequest(
    @Body() createDto: CreateOrgChangeRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.employeeId?.toString() || user.userid?.toString();
    
    if (!userId) {
      throw new BadRequestException('User ID is required. Please ensure you are properly authenticated.');
    }

    const changeRequest = await this.orgStructureService.createChangeRequest(
      createDto,
      userId,
    );

    return {
      success: true,
      message: 'Change request created successfully',
      data: changeRequest,
    };
  }

  @Get('change-requests')
  async findAllChangeRequests(@Query() queryDto: QueryOrgChangeRequestDto) {
    const result =
      await this.orgStructureService.findAllChangeRequests(queryDto);

    return {
      success: true,
      message: 'Change requests retrieved successfully',
      ...result,
    };
  }

  @Post('change-requests/:id/submit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
  )
  async submitChangeRequestForReview(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.employeeId?.toString() || user.userid?.toString();
    
    if (!userId) {
      throw new BadRequestException('User ID is required. Please ensure you are properly authenticated.');
    }

    const changeRequest =
      await this.orgStructureService.submitChangeRequestForReview(
        id,
        userId,
      );

    return {
      success: true,
      message: 'Change request submitted for review successfully',
      data: changeRequest,
    };
  }

  @Delete('change-requests/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
  )
  async cancelChangeRequest(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.employeeId?.toString() || user.userid?.toString();
    
    if (!userId) {
      throw new BadRequestException('User ID is required. Please ensure you are properly authenticated.');
    }

    const changeRequest = await this.orgStructureService.cancelChangeRequest(
      id,
      userId,
    );

    return {
      success: true,
      message: 'Change request cancelled successfully',
      data: changeRequest,
    };
  }

  @Get('change-requests/number/:requestNumber')
  async findChangeRequestByNumber(
    @Param('requestNumber') requestNumber: string,
  ) {
    const changeRequest =
      await this.orgStructureService.findChangeRequestByNumber(requestNumber);

    return {
      success: true,
      message: 'Change request retrieved successfully',
      data: changeRequest,
    };
  }

  @Get('change-requests/:id')
  async findChangeRequestById(@Param('id') id: string) {
    const changeRequest =
      await this.orgStructureService.findChangeRequestById(id);

    return {
      success: true,
      message: 'Change request retrieved successfully',
      data: changeRequest,
    };
  }

  @Put('change-requests/:id')
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
    SystemRole.DEPARTMENT_HEAD,
  )
  async updateChangeRequest(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrgChangeRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const changeRequest = await this.orgStructureService.updateChangeRequest(
        id,
      updateDto,
        user.employeeId?.toString() || user.userid.toString(),
      );

    return {
      success: true,
      message: 'Change request updated successfully',
      data: changeRequest,
    };
  }

  @Post('change-requests/:id/review')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async reviewChangeRequest(
    @Param('id') id: string,
    @Body() reviewDto: ReviewOrgChangeRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.employeeId?.toString() || user.userid?.toString();
    
    if (!userId) {
      throw new BadRequestException('User ID is required. Please ensure you are properly authenticated.');
    }

    const changeRequest = await this.orgStructureService.reviewChangeRequest(
      id,
      reviewDto,
      userId,
    );

    return {
      success: true,
      message: 'Change request reviewed successfully',
      data: changeRequest,
    };
  }

  @Post('change-requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async approveChangeRequest(
    @Param('id') id: string,
    @Body() approveDto: ApproveOrgChangeRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.employeeId?.toString() || user.userid?.toString();
    
    if (!userId) {
      throw new BadRequestException('User ID is required. Please ensure you are properly authenticated.');
    }

    const changeRequest = await this.orgStructureService.approveChangeRequest(
      id,
      approveDto,
      userId,
    );

    return {
      success: true,
      message: 'Change request approved successfully',
      data: changeRequest,
    };
  }

  @Post('change-requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async rejectChangeRequest(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.employeeId?.toString() || user.userid?.toString();
    
    if (!userId) {
      throw new BadRequestException('User ID is required. Please ensure you are properly authenticated.');
    }

    const changeRequest = await this.orgStructureService.rejectChangeRequest(
      id,
      reason,
      userId,
    );

    return {
      success: true,
      message: 'Change request rejected successfully',
      data: changeRequest,
    };
  }

  // =====================================
  // ORG CHART ENDPOINTS
  // =====================================

  @Get('org-chart')
  async generateOrgChart() {
    const orgChart = await this.orgStructureService.generateOrgChart();
    return {
      success: true,
      data: orgChart,
    };
  }

  @Get('org-chart/department/:departmentId')
  async getDepartmentOrgChart(@Param('departmentId') departmentId: string) {
    const orgChart =
      await this.orgStructureService.getDepartmentOrgChart(departmentId);
    return {
      success: true,
      data: orgChart,
    };
  }

  @Get('org-chart/simplified')
  async getSimplifiedOrgChart() {
    const orgChart = await this.orgStructureService.getSimplifiedOrgChart();
    return {
      success: true,
      data: orgChart,
    };
  }

  @Get('org-chart/export/json')
  async exportOrgChartAsJson(
    @Query('departmentId') departmentId?: string,
    @Res() res?: Response,
  ) {
    const orgChart = departmentId
      ? await this.orgStructureService.getDepartmentOrgChart(departmentId)
      : await this.orgStructureService.generateOrgChart();

    if (res) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="org-chart-${Date.now()}.json"`,
      );
      res.json(orgChart);
    } else {
      return {
        success: true,
        message: 'Org chart exported successfully',
        data: orgChart,
      };
    }
  }

  @Get('org-chart/export/csv')
  async exportOrgChartAsCsv(
    @Res() res: Response,
    @Query('departmentId') departmentId?: string,
  ) {
    const orgChart = departmentId
      ? await this.orgStructureService.getDepartmentOrgChart(departmentId)
      : await this.orgStructureService.generateOrgChart();

    let csv =
      'Department Code,Department Name,Position Code,Position Title,Reports To Position Code\n';

    if (Array.isArray(orgChart.departments)) {
      for (const dept of orgChart.departments) {
        const deptCode = dept.department?.code || '';
        const deptName = dept.department?.name || '';

        if (Array.isArray(dept.positions)) {
          for (const pos of dept.positions) {
            const posCode = pos.code || '';
            const posTitle = pos.title || '';
            const reportsTo = pos.reportsToPositionId?.code || '';
            csv += `"${deptCode}","${deptName}","${posCode}","${posTitle}","${reportsTo}"\n`;
          }
        }
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="org-chart-${Date.now()}.csv"`,
    );
    res.send(csv);
  }
}
