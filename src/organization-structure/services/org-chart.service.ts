import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from '../../shared/schemas/department.schema';
import { Position, PositionDocument } from '../../shared/schemas/position.schema';
import { ReportingLine, ReportingLineDocument } from '../schemas/reporting-line.schema';

@Injectable()
export class OrgChartService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(ReportingLine.name)
    private reportingLineModel: Model<ReportingLineDocument>,
  ) {}

  /**
   * Generate complete organizational chart
   * Returns departments with positions and reporting relationships
   */
  async generateOrgChart(departmentId?: string): Promise<any> {
    let departments: DepartmentDocument[];

    if (departmentId) {
      const department = await this.departmentModel
        .findById(departmentId)
        .populate('headPositionId')
        .exec();
      if (!department) {
        throw new NotFoundException(`Department with ID ${departmentId} not found`);
      }
      departments = [department];
    } else {
      departments = await this.departmentModel
        .find({ isActive: true })
        .populate('headPositionId')
        .sort({ name: 1 })
        .exec();
    }

    const orgChart = await Promise.all(
      departments.map(async (dept) => {
        // Get all positions in this department
        const positions = await this.positionModel
          .find({
            departmentId: dept._id,
            isActive: true,
          })
          .populate('reportsToPositionId')
          .sort({ title: 1 })
          .exec();

        // Build position hierarchy
        const positionTree = await this.buildPositionTree(positions);

        // Get reporting lines for this department
        const reportingLines = await this.reportingLineModel
          .find({
            isActive: true,
            $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
          })
          .populate('employeeId', 'firstName lastName employeeNumber')
          .populate('managerId', 'firstName lastName employeeNumber')
          .limit(100) // Limit to prevent large queries
          .exec();

        return {
          department: {
            id: dept._id,
            code: dept.code,
            name: dept.name,
            description: dept.description,
            headPositionId: dept.headPositionId,
            isActive: dept.isActive,
          },
          positions: positionTree,
          reportingLines: reportingLines.filter((rl) => {
            // Filter reporting lines relevant to this department
            // This is a simplified filter - in production, you'd check employee's department
            return true; // Return all for now
          }),
          statistics: {
            totalPositions: positions.length,
            filledPositions: 0, // Would need Employee module integration
            vacantPositions: positions.length,
          },
        };
      }),
    );

    return {
      generatedAt: new Date(),
      departments: orgChart,
      totalDepartments: orgChart.length,
    };
  }

  /**
   * Build position hierarchy tree
   */
  private async buildPositionTree(positions: PositionDocument[]): Promise<any[]> {
    // Find root positions (no reportsToPositionId)
    const rootPositions = positions.filter((p) => !p.reportsToPositionId);

    const buildTree = (position: PositionDocument): any => {
      const children = positions.filter(
        (p) => p.reportsToPositionId?.toString() === position._id.toString(),
      );

      return {
        id: position._id,
        code: position.code,
        title: position.title,
        description: position.description,
        departmentId: position.departmentId,
        reportsToPositionId: position.reportsToPositionId,
        isActive: position.isActive,
        children: children.map((child) => buildTree(child)),
      };
    };

    return rootPositions.map((root) => buildTree(root));
  }

  /**
   * Get org chart for a specific department
   */
  async getDepartmentOrgChart(departmentId: string): Promise<any> {
    return this.generateOrgChart(departmentId);
  }

  /**
   * Get simplified org chart (departments and positions only, no reporting lines)
   */
  async getSimplifiedOrgChart(): Promise<any> {
    const departments = await this.departmentModel
      .find({ isActive: true })
      .populate('headPositionId')
      .sort({ name: 1 })
      .exec();

    const simplified = await Promise.all(
      departments.map(async (dept) => {
        const positions = await this.positionModel
          .find({
            departmentId: dept._id,
            isActive: true,
          })
          .select('code title reportsToPositionId')
          .sort({ title: 1 })
          .exec();

        return {
          department: {
            id: dept._id,
            code: dept.code,
            name: dept.name,
            headPositionId: dept.headPositionId,
          },
          positions: positions.map((p) => ({
            id: p._id,
            code: p.code,
            title: p.title,
            reportsToPositionId: p.reportsToPositionId,
          })),
        };
      }),
    );

    return {
      generatedAt: new Date(),
      departments: simplified,
    };
  }
}

