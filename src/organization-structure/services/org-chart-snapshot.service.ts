import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrgChartSnapshot, OrgChartSnapshotDocument, SnapshotPurpose, SnapshotStatistics } from '../schemas/org-chart-snapshot.schema';
import { Department, DepartmentDocument } from '../../shared/schemas/department.schema';
import { Position, PositionDocument } from '../../shared/schemas/position.schema';
import { ReportingLine, ReportingLineDocument } from '../schemas/reporting-line.schema';
import { CreateOrgChartSnapshotDto } from '../dto';
@Injectable()
export class OrgChartSnapshotService {
  constructor(
    @InjectModel(OrgChartSnapshot.name)
    private snapshotModel: Model<OrgChartSnapshotDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(ReportingLine.name)
    private reportingLineModel: Model<ReportingLineDocument>,
  ) {}

  /**
   * Create a new org chart snapshot
   */
  async create(createDto: CreateOrgChartSnapshotDto, userId: string): Promise<OrgChartSnapshotDocument> {
    const snapshotDate = new Date();

    // Get current org structure
    const departments = await this.departmentModel
      .find({ isActive: true })
      .populate('headPositionId')
      .lean()
      .exec();

    const positions = await this.positionModel
      .find({ isActive: true })
      .lean()
      .exec();

    const reportingLines = await this.reportingLineModel
      .find({ isActive: true })
      .lean()
      .exec();

    // Calculate statistics
    const activeHeadcount = reportingLines.length; // Simplified - would need employee count
    const vacantPositions = positions.length - activeHeadcount; // Simplified

    const statistics: SnapshotStatistics = {
      totalDepartments: departments.length,
      totalPositions: positions.length,
      totalEmployees: activeHeadcount,
      activeHeadcount,
      vacantPositions: Math.max(0, vacantPositions),
    };

    // Create snapshot
    const snapshot = new this.snapshotModel({
      snapshotName: createDto.snapshotName,
      snapshotDate,
      description: createDto.description,
      departments: departments as any,
      positions: positions as any,
      reportingLines: reportingLines.map(rl => ({
        employeeId: rl.employeeId,
        managerId: rl.managerId,
        departmentId: (rl as any).departmentId || new Types.ObjectId(), // Fallback if not in schema
        positionId: (rl as any).positionId || new Types.ObjectId(), // Fallback if not in schema
      })),
      statistics,
      purpose: createDto.purpose,
      createdBy: new Types.ObjectId(userId),
      createdAt: snapshotDate,
    });

    return snapshot.save();
  }

  /**
   * Find all snapshots
   */
  async findAll(purpose?: SnapshotPurpose): Promise<OrgChartSnapshotDocument[]> {
    const filter: any = {};
    if (purpose) {
      filter.purpose = purpose;
    }

    return this.snapshotModel
      .find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ snapshotDate: -1 })
      .exec();
  }

  /**
   * Find snapshot by ID
   */
  async findOne(id: string): Promise<OrgChartSnapshotDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid snapshot ID');
    }

    const snapshot = await this.snapshotModel
      .findById(id)
      .populate('createdBy', 'firstName lastName')
      .exec();

    if (!snapshot) {
      throw new NotFoundException(`Snapshot with ID '${id}' not found`);
    }

    return snapshot;
  }

  /**
   * Get snapshot by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<OrgChartSnapshotDocument[]> {
    return this.snapshotModel
      .find({
        snapshotDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('createdBy', 'firstName lastName')
      .sort({ snapshotDate: -1 })
      .exec();
  }

  /**
   * Compare two snapshots
   */
  async compare(snapshotId1: string, snapshotId2: string): Promise<any> {
    const snapshot1 = await this.findOne(snapshotId1);
    const snapshot2 = await this.findOne(snapshotId2);

    return {
      snapshot1: {
        id: snapshot1._id,
        name: snapshot1.snapshotName,
        date: snapshot1.snapshotDate,
        statistics: snapshot1.statistics,
      },
      snapshot2: {
        id: snapshot2._id,
        name: snapshot2.snapshotName,
        date: snapshot2.snapshotDate,
        statistics: snapshot2.statistics,
      },
      differences: {
        departments: snapshot2.statistics.totalDepartments - snapshot1.statistics.totalDepartments,
        positions: snapshot2.statistics.totalPositions - snapshot1.statistics.totalPositions,
        employees: snapshot2.statistics.totalEmployees - snapshot1.statistics.totalEmployees,
        headcount: snapshot2.statistics.activeHeadcount - snapshot1.statistics.activeHeadcount,
        vacantPositions: snapshot2.statistics.vacantPositions - snapshot1.statistics.vacantPositions,
      },
    };
  }

  /**
   * Export snapshot as JSON
   */
  async exportAsJson(id: string): Promise<any> {
    const snapshot = await this.findOne(id);
    return {
      snapshotName: snapshot.snapshotName,
      snapshotDate: snapshot.snapshotDate,
      description: snapshot.description,
      purpose: snapshot.purpose,
      statistics: snapshot.statistics,
      departments: snapshot.departments,
      positions: snapshot.positions,
      reportingLines: snapshot.reportingLines,
      createdAt: snapshot.createdAt,
      createdBy: snapshot.createdBy,
    };
  }

  /**
   * Delete a snapshot
   */
  async delete(id: string): Promise<void> {
    await this.findOne(id); // Validate exists
    await this.snapshotModel.findByIdAndDelete(id).exec();
  }
}

