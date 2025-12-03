import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OrgChartService } from '../services/org-chart.service';
import { JwtAuthGuard } from '../../auth';

@Controller('organization-structure/org-chart')
@UseGuards(JwtAuthGuard)
export class OrgChartController {
  constructor(private readonly orgChartService: OrgChartService) {}

  /**
   * Generate complete organizational chart
   * GET /organization-structure/org-chart
   */
  @Get()
  async generateOrgChart() {
    const orgChart = await this.orgChartService.generateOrgChart();
    return {
      success: true,
      data: orgChart,
    };
  }

  /**
   * Get org chart for a specific department
   * GET /organization-structure/org-chart/department/:departmentId
   */
  @Get('department/:departmentId')
  async getDepartmentOrgChart(@Param('departmentId') departmentId: string) {
    const orgChart = await this.orgChartService.getDepartmentOrgChart(departmentId);
    return {
      success: true,
      data: orgChart,
    };
  }

  /**
   * Get simplified org chart (departments and positions only)
   * GET /organization-structure/org-chart/simplified
   */
  @Get('simplified')
  async getSimplifiedOrgChart() {
    const orgChart = await this.orgChartService.getSimplifiedOrgChart();
    return {
      success: true,
      data: orgChart,
    };
  }

  /**
   * Export org chart as JSON
   * GET /organization-structure/org-chart/export/json
   */
  @Get('export/json')
  async exportAsJson(
    @Query('departmentId') departmentId?: string,
    @Res() res?: Response,
  ) {
    const orgChart = departmentId
      ? await this.orgChartService.getDepartmentOrgChart(departmentId)
      : await this.orgChartService.generateOrgChart();

    if (res) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="org-chart-${Date.now()}.json"`);
      res.json(orgChart);
    } else {
      return {
        success: true,
        message: 'Org chart exported successfully',
        data: orgChart,
      };
    }
  }

  /**
   * Export org chart as CSV
   * GET /organization-structure/org-chart/export/csv
   */
  @Get('export/csv')
  async exportAsCsv(
    @Res() res: Response,
    @Query('departmentId') departmentId?: string,
  ) {
    const orgChart = departmentId
      ? await this.orgChartService.getDepartmentOrgChart(departmentId)
      : await this.orgChartService.generateOrgChart();

    // Convert to CSV format
    let csv = 'Department Code,Department Name,Position Code,Position Title,Reports To Position Code\n';
    
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
    res.setHeader('Content-Disposition', `attachment; filename="org-chart-${Date.now()}.csv"`);
    res.send(csv);
  }
}

