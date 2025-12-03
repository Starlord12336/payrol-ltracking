import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OrgChartSnapshotService } from '../services/org-chart-snapshot.service';
import { CreateOrgChartSnapshotDto } from '../dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../auth';
import { UserRole } from '../../shared/schemas/user.schema';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { SnapshotPurpose } from '../schemas/org-chart-snapshot.schema';

@Controller('organization-structure/org-chart-snapshots')
@UseGuards(JwtAuthGuard)
export class OrgChartSnapshotController {
  constructor(private readonly snapshotService: OrgChartSnapshotService) {}

  /**
   * Create a new org chart snapshot
   * POST /api/organization-structure/org-chart-snapshots
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async create(
    @Body() createDto: CreateOrgChartSnapshotDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const snapshot = await this.snapshotService.create(createDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Org chart snapshot created successfully',
      data: snapshot,
    };
  }

  /**
   * Get all snapshots
   * GET /api/organization-structure/org-chart-snapshots
   */
  @Get()
  async findAll(@Query('purpose') purpose?: SnapshotPurpose) {
    const snapshots = await this.snapshotService.findAll(purpose);
    
    return {
      success: true,
      message: 'Snapshots retrieved successfully',
      data: snapshots,
      count: snapshots.length,
    };
  }

  /**
   * Get snapshot by ID
   * GET /api/organization-structure/org-chart-snapshots/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const snapshot = await this.snapshotService.findOne(id);
    
    return {
      success: true,
      message: 'Snapshot retrieved successfully',
      data: snapshot,
    };
  }

  /**
   * Get snapshots by date range
   * GET /api/organization-structure/org-chart-snapshots/date-range
   */
  @Get('date-range')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const snapshots = await this.snapshotService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
    
    return {
      success: true,
      message: 'Snapshots retrieved successfully',
      data: snapshots,
      count: snapshots.length,
    };
  }

  /**
   * Compare two snapshots
   * GET /api/organization-structure/org-chart-snapshots/compare
   */
  @Get('compare')
  async compare(
    @Query('snapshotId1') snapshotId1: string,
    @Query('snapshotId2') snapshotId2: string,
  ) {
    const comparison = await this.snapshotService.compare(snapshotId1, snapshotId2);
    
    return {
      success: true,
      message: 'Snapshots compared successfully',
      data: comparison,
    };
  }

  /**
   * Export snapshot as JSON
   * GET /api/organization-structure/org-chart-snapshots/:id/export/json
   */
  @Get(':id/export/json')
  async exportAsJson(@Param('id') id: string, @Res() res: Response) {
    const json = await this.snapshotService.exportAsJson(id);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="org-chart-snapshot-${id}.json"`);
    res.json(json);
  }

  /**
   * Delete a snapshot
   * DELETE /api/organization-structure/org-chart-snapshots/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async delete(@Param('id') id: string) {
    await this.snapshotService.delete(id);
    
    return {
      success: true,
      message: 'Snapshot deleted successfully',
    };
  }
}

