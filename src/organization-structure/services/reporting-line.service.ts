import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReportingLine, ReportingLineDocument, ReportingType } from '../schemas/reporting-line.schema';
import { CreateReportingLineDto, UpdateReportingLineDto, QueryReportingLineDto } from '../dto';

@Injectable()
export class ReportingLineService {
  constructor(
    @InjectModel(ReportingLine.name)
    private reportingLineModel: Model<ReportingLineDocument>,
  ) {}

  /**
   * Create a new reporting line
   */
  async create(createReportingLineDto: CreateReportingLineDto, userId: string): Promise<ReportingLine> {
    // Validate employee and manager are different
    if (createReportingLineDto.employeeId === createReportingLineDto.managerId) {
      throw new BadRequestException('Employee cannot report to themselves');
    }

    // Check for duplicate DIRECT reporting line (only one DIRECT allowed per employee)
    if (createReportingLineDto.reportingType === ReportingType.DIRECT) {
      const existingDirect = await this.reportingLineModel.findOne({
        employeeId: new Types.ObjectId(createReportingLineDto.employeeId),
        reportingType: ReportingType.DIRECT,
        isActive: true,
        $or: [
          { endDate: null },
          { endDate: { $gte: new Date(createReportingLineDto.effectiveDate) } },
        ],
      });

      if (existingDirect) {
        throw new ConflictException('Employee already has an active DIRECT reporting line');
      }
    }

    // Validate no circular reporting relationship
    await this.validateNoCircularReporting(
      createReportingLineDto.employeeId,
      createReportingLineDto.managerId,
    );

    // TODO: Validate employee and manager exist (when Employee module is integrated)
    // await this.validateEmployeeExists(createReportingLineDto.employeeId);
    // await this.validateEmployeeExists(createReportingLineDto.managerId);

    // Create reporting line
    const reportingLine = new this.reportingLineModel({
      ...createReportingLineDto,
      employeeId: new Types.ObjectId(createReportingLineDto.employeeId),
      managerId: new Types.ObjectId(createReportingLineDto.managerId),
      contextId: createReportingLineDto.contextId
        ? new Types.ObjectId(createReportingLineDto.contextId)
        : undefined,
      effectiveDate: new Date(createReportingLineDto.effectiveDate),
      endDate: createReportingLineDto.endDate ? new Date(createReportingLineDto.endDate) : undefined,
      isActive: true,
      canApproveLeave: createReportingLineDto.canApproveLeave ?? false,
      canApproveTimesheet: createReportingLineDto.canApproveTimesheet ?? false,
      canApproveExpenses: createReportingLineDto.canApproveExpenses ?? false,
      canConductAppraisal: createReportingLineDto.canConductAppraisal ?? false,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return reportingLine.save();
  }

  /**
   * Find all reporting lines with filters and pagination
   */
  async findAll(queryDto: QueryReportingLineDto): Promise<{
    data: ReportingLine[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      employeeId,
      managerId,
      reportingType,
      contextType,
      contextId,
      isActive,
      sortBy = 'effectiveDate',
      sortOrder = 'desc',
    } = queryDto;

    // Build filter
    const filter: any = {};

    if (employeeId) {
      filter.employeeId = new Types.ObjectId(employeeId);
    }

    if (managerId) {
      filter.managerId = new Types.ObjectId(managerId);
    }

    if (reportingType) {
      filter.reportingType = reportingType;
    }

    if (contextType) {
      filter.contextType = contextType;
    }

    if (contextId) {
      filter.contextId = new Types.ObjectId(contextId);
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.reportingLineModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('employeeId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
        .populate('managerId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
        .populate('contextId')
        .exec(),
      this.reportingLineModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one reporting line by ID
   */
  async findOne(id: string): Promise<ReportingLine> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid reporting line ID');
    }

    const reportingLine = await this.reportingLineModel
      .findById(id)
      .populate('employeeId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
      .populate('managerId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
      .populate('contextId')
      .exec();

    if (!reportingLine) {
      throw new NotFoundException(`Reporting line with ID '${id}' not found`);
    }

    return reportingLine;
  }

  /**
   * Find all reporting lines for an employee (all managers)
   */
  async findByEmployee(employeeId: string, activeOnly: boolean = true): Promise<ReportingLine[]> {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const filter: any = {
      employeeId: new Types.ObjectId(employeeId),
    };

    if (activeOnly) {
      filter.isActive = true;
      filter.$or = [{ endDate: null }, { endDate: { $gte: new Date() } }];
    }

    return this.reportingLineModel
      .find(filter)
      .populate('managerId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
      .populate('contextId')
      .sort({ reportingType: 1, effectiveDate: -1 })
      .exec();
  }

  /**
   * Find all reporting lines for a manager (all direct reports)
   */
  async findByManager(managerId: string, activeOnly: boolean = true): Promise<ReportingLine[]> {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager ID');
    }

    const filter: any = {
      managerId: new Types.ObjectId(managerId),
    };

    if (activeOnly) {
      filter.isActive = true;
      filter.$or = [{ endDate: null }, { endDate: { $gte: new Date() } }];
    }

    return this.reportingLineModel
      .find(filter)
      .populate('employeeId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
      .populate('contextId')
      .sort({ reportingType: 1, effectiveDate: -1 })
      .exec();
  }

  /**
   * Get direct reports only (DIRECT reporting type)
   */
  async getDirectReports(managerId: string, activeOnly: boolean = true): Promise<ReportingLine[]> {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager ID');
    }

    const filter: any = {
      managerId: new Types.ObjectId(managerId),
      reportingType: ReportingType.DIRECT,
    };

    if (activeOnly) {
      filter.isActive = true;
      filter.$or = [{ endDate: null }, { endDate: { $gte: new Date() } }];
    }

    return this.reportingLineModel
      .find(filter)
      .populate('employeeId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
      .sort({ effectiveDate: -1 })
      .exec();
  }

  /**
   * Get dotted line reports (DOTTED, FUNCTIONAL, ADMINISTRATIVE)
   */
  async getDottedLineReports(managerId: string, activeOnly: boolean = true): Promise<ReportingLine[]> {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager ID');
    }

    const filter: any = {
      managerId: new Types.ObjectId(managerId),
      reportingType: { $in: [ReportingType.DOTTED, ReportingType.FUNCTIONAL, ReportingType.ADMINISTRATIVE] },
    };

    if (activeOnly) {
      filter.isActive = true;
      filter.$or = [{ endDate: null }, { endDate: { $gte: new Date() } }];
    }

    return this.reportingLineModel
      .find(filter)
      .populate('employeeId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
      .populate('contextId')
      .sort({ reportingType: 1, effectiveDate: -1 })
      .exec();
  }

  /**
   * Get full reporting chain (all managers up the hierarchy)
   */
  async getReportingChain(employeeId: string): Promise<ReportingLine[]> {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const chain: ReportingLine[] = [];
    let currentEmployeeId = employeeId;
    const visited = new Set<string>();

    while (currentEmployeeId) {
      if (visited.has(currentEmployeeId)) {
        break; // Prevent infinite loop
      }
      visited.add(currentEmployeeId);

      // Get DIRECT reporting line (only one should exist)
      const directLine = await this.reportingLineModel
        .findOne({
          employeeId: new Types.ObjectId(currentEmployeeId),
          reportingType: ReportingType.DIRECT,
          isActive: true,
          $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
        })
        .populate('managerId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
        .exec();

      if (!directLine) {
        break; // No more managers
      }

      chain.push(directLine);
      currentEmployeeId = (directLine.managerId as any)._id?.toString() || directLine.managerId.toString();
    }

    return chain;
  }

  /**
   * Update a reporting line
   */
  async update(id: string, updateReportingLineDto: UpdateReportingLineDto, userId: string): Promise<ReportingLine> {
    const reportingLine = await this.findOne(id);

    // Validate employee and manager are different if both are being updated
    if (updateReportingLineDto.employeeId && updateReportingLineDto.managerId) {
      if (updateReportingLineDto.employeeId === updateReportingLineDto.managerId) {
        throw new BadRequestException('Employee cannot report to themselves');
      }
    }

    // Check for duplicate DIRECT reporting line if changing to DIRECT
    if (updateReportingLineDto.reportingType === ReportingType.DIRECT) {
      const employeeId = updateReportingLineDto.employeeId || (reportingLine.employeeId as any).toString();
      const existingDirect = await this.reportingLineModel.findOne({
        employeeId: new Types.ObjectId(employeeId),
        reportingType: ReportingType.DIRECT,
        isActive: true,
        _id: { $ne: id },
        $or: [
          { endDate: null },
          {
            endDate: {
              $gte: updateReportingLineDto.effectiveDate
                ? new Date(updateReportingLineDto.effectiveDate)
                : reportingLine.effectiveDate,
            },
          },
        ],
      });

      if (existingDirect) {
        throw new ConflictException('Employee already has an active DIRECT reporting line');
      }
    }

    // Validate no circular reporting if manager is being changed
    if (updateReportingLineDto.managerId) {
      const employeeId = updateReportingLineDto.employeeId || (reportingLine.employeeId as any).toString();
      await this.validateNoCircularReporting(employeeId, updateReportingLineDto.managerId);
    }

    // Prepare update data
    const updateData: any = {
      ...updateReportingLineDto,
      updatedBy: new Types.ObjectId(userId),
    };

    if (updateReportingLineDto.employeeId) {
      updateData.employeeId = new Types.ObjectId(updateReportingLineDto.employeeId);
    }

    if (updateReportingLineDto.managerId) {
      updateData.managerId = new Types.ObjectId(updateReportingLineDto.managerId);
    }

    if (updateReportingLineDto.contextId) {
      updateData.contextId = new Types.ObjectId(updateReportingLineDto.contextId);
    }

    if (updateReportingLineDto.effectiveDate) {
      updateData.effectiveDate = new Date(updateReportingLineDto.effectiveDate);
    }

    if (updateReportingLineDto.endDate) {
      updateData.endDate = new Date(updateReportingLineDto.endDate);
    }

    const updatedReportingLine = await this.reportingLineModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('employeeId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
      .populate('managerId', 'personalInfo.firstName personalInfo.lastName employmentInfo.employeeNumber')
      .populate('contextId')
      .exec();

    return updatedReportingLine;
  }

  /**
   * Deactivate a reporting line (soft delete)
   */
  async deactivate(id: string, userId: string): Promise<ReportingLine> {
    const reportingLine = await this.findOne(id);

    const reportingLineDoc = reportingLine as ReportingLineDocument;
    reportingLineDoc.isActive = false;
    reportingLineDoc.endDate = new Date();
    reportingLineDoc.updatedBy = new Types.ObjectId(userId) as any;

    return reportingLineDoc.save();
  }

  /**
   * Helper: Validate no circular reporting relationship
   */
  private async validateNoCircularReporting(employeeId: string, managerId: string): Promise<void> {
    // Check if manager eventually reports to employee (directly or indirectly)
    let currentManagerId = managerId;
    const visited = new Set<string>();

    while (currentManagerId) {
      if (visited.has(currentManagerId)) {
        break; // Prevent infinite loop
      }

      if (currentManagerId === employeeId) {
        throw new BadRequestException('Circular reporting relationship detected. This would create a loop in the hierarchy.');
      }

      visited.add(currentManagerId);

      // Get DIRECT reporting line for current manager
      const managerLine = await this.reportingLineModel
        .findOne({
          employeeId: new Types.ObjectId(currentManagerId),
          reportingType: ReportingType.DIRECT,
          isActive: true,
          $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
        })
        .exec();

      if (!managerLine) {
        break; // No more managers
      }

      currentManagerId = (managerLine.managerId as any)._id?.toString() || managerLine.managerId.toString();
    }
  }
}

