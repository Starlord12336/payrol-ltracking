// Consolidated Organization Structure Service
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './models/department.schema';
import { Position, PositionDocument } from './models/position.schema';
import {
  StructureChangeRequest,
  StructureChangeRequestDocument,
} from './models/structure-change-request.schema';
import {
  StructureApproval,
  StructureApprovalDocument,
} from './models/structure-approval.schema';
import {
  StructureChangeLog,
  StructureChangeLogDocument,
} from './models/structure-change-log.schema';
import {
  PositionAssignment,
  PositionAssignmentDocument,
} from './models/position-assignment.schema';
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
import {
  StructureRequestType,
  StructureRequestStatus,
  ApprovalDecision,
  ChangeLogAction,
} from './enums/organization-structure.enums';

@Injectable()
export class OrganizationStructureService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(StructureChangeRequest.name)
    private changeRequestModel: Model<StructureChangeRequestDocument>,
    @InjectModel(StructureApproval.name)
    private approvalModel: Model<StructureApprovalDocument>,
    @InjectModel(StructureChangeLog.name)
    private changeLogModel: Model<StructureChangeLogDocument>,
    @InjectModel(PositionAssignment.name)
    private positionAssignmentModel: Model<PositionAssignmentDocument>,
  ) {}

  // =====================================
  // DEPARTMENT METHODS
  // =====================================

  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
    userId: string,
  ): Promise<Department> {
    const existingDepartment = await this.departmentModel.findOne({
      code: createDepartmentDto.code,
    });

    if (existingDepartment) {
      throw new ConflictException(
        `Department with code '${createDepartmentDto.code}' already exists`,
      );
    }

    if (createDepartmentDto.headPositionId) {
      await this.validatePositionExists(createDepartmentDto.headPositionId);
    }

    const department = new this.departmentModel({
      ...createDepartmentDto,
      isActive: true,
    });

    return department.save();
  }

  async findAllDepartments(queryDto: QueryDepartmentDto): Promise<{
    data: Department[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      code,
      isActive,
      headPositionId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {};

    if (code) {
      filter.code = code;
    } else if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (headPositionId) {
      filter.headPositionId = new Types.ObjectId(headPositionId);
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.departmentModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('headPositionId', 'code title')
        .exec(),
      this.departmentModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findDepartmentById(id: string): Promise<Department> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.departmentModel
      .findById(id)
      .populate('headPositionId', 'code title')
      .exec();

    if (!department) {
      throw new NotFoundException(`Department with ID '${id}' not found`);
    }

    return department;
  }

  async findDepartmentByCode(code: string): Promise<Department> {
    const department = await this.departmentModel
      .findOne({ code: code })
      .populate('headPositionId', 'code title')
      .exec();

    if (!department) {
      throw new NotFoundException(`Department with code '${code}' not found`);
    }

    return department;
  }

  async updateDepartment(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    userId: string,
  ): Promise<Department> {
    const department = await this.findDepartmentById(id);

    if (
      updateDepartmentDto.code &&
      updateDepartmentDto.code !== department.code
    ) {
      const existingDepartment = await this.departmentModel.findOne({
        code: updateDepartmentDto.code,
        _id: { $ne: id },
      });

      if (existingDepartment) {
        throw new ConflictException(
          `Department with code '${updateDepartmentDto.code}' already exists`,
        );
      }
    }

    if (updateDepartmentDto.headPositionId) {
      await this.validatePositionExists(updateDepartmentDto.headPositionId);
    }

    const updatedDepartment = await this.departmentModel
      .findByIdAndUpdate(id, updateDepartmentDto, {
        new: true,
        runValidators: true,
      })
      .populate('headPositionId', 'code title')
      .exec();

    return updatedDepartment;
  }

  async removeDepartment(id: string, userId: string): Promise<Department> {
    const department = await this.findDepartmentById(id);

    const departmentDoc = department as DepartmentDocument;
    departmentDoc.isActive = false;

    return departmentDoc.save();
  }

  async getDepartmentHierarchy(departmentId?: string): Promise<any> {
    let departments;

    if (departmentId) {
      departments = await this.departmentModel
        .find({ _id: new Types.ObjectId(departmentId), isActive: true })
        .populate('headPositionId', 'code title')
        .exec();
    } else {
      departments = await this.departmentModel
        .find({ isActive: true })
        .populate('headPositionId', 'code title')
        .exec();
    }

    return departments;
  }

  async getDepartmentStats(departmentId: string): Promise<any> {
    const department = await this.findDepartmentById(departmentId);

    return {
      department,
    };
  }

  async assignDepartmentHead(
    departmentId: string,
    positionId: string | null,
    userId: string,
  ): Promise<Department> {
    const department = await this.findDepartmentById(departmentId);

    if (positionId) {
      await this.validatePositionExists(positionId);
    }

    const departmentDoc = department as DepartmentDocument;
    departmentDoc.headPositionId = positionId
      ? (new Types.ObjectId(positionId) as any)
      : undefined;

    return departmentDoc.save();
  }

  // =====================================
  // POSITION METHODS
  // =====================================

  async createPosition(
    createPositionDto: CreatePositionDto,
    userId: string,
  ): Promise<Position> {
    const existingPosition = await this.positionModel.findOne({
      code: createPositionDto.code,
    });

    if (existingPosition) {
      throw new ConflictException(
        `Position with code '${createPositionDto.code}' already exists`,
      );
    }

    await this.validateDepartmentExists(createPositionDto.departmentId);

    if (createPositionDto.reportsToPositionId) {
      await this.validatePositionExists(createPositionDto.reportsToPositionId);
    }

    const position = new this.positionModel({
      ...createPositionDto,
      isActive: true,
    });

    return position.save();
  }

  async findAllPositions(queryDto: QueryPositionDto): Promise<{
    data: Position[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      code,
      departmentId,
      reportsToPositionId,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {};

    if (code) {
      filter.code = code;
    } else if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (departmentId) {
      filter.departmentId = new Types.ObjectId(departmentId);
    }

    if (reportsToPositionId) {
      filter.reportsToPositionId = new Types.ObjectId(reportsToPositionId);
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.positionModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('departmentId', 'code name')
        .populate('reportsToPositionId', 'code title')
        .exec(),
      this.positionModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPositionById(id: string): Promise<Position> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid position ID');
    }

    const position = await this.positionModel
      .findById(id)
      .populate('departmentId', 'code name')
      .populate('reportsToPositionId', 'code title')
      .exec();

    if (!position) {
      throw new NotFoundException(`Position with ID '${id}' not found`);
    }

    return position;
  }

  async findPositionByCode(code: string): Promise<Position> {
    const position = await this.positionModel
      .findOne({ code: code })
      .populate('departmentId', 'code name')
      .populate('reportsToPositionId', 'code title')
      .exec();

    if (!position) {
      throw new NotFoundException(`Position with code '${code}' not found`);
    }

    return position;
  }

  async updatePosition(
    id: string,
    updatePositionDto: UpdatePositionDto,
    userId: string,
  ): Promise<Position> {
    const position = await this.findPositionById(id);

    if (updatePositionDto.code && updatePositionDto.code !== position.code) {
      const existingPosition = await this.positionModel.findOne({
        code: updatePositionDto.code,
        _id: { $ne: id },
      });

      if (existingPosition) {
        throw new ConflictException(
          `Position with code '${updatePositionDto.code}' already exists`,
        );
      }
    }

    if (updatePositionDto.departmentId) {
      await this.validateDepartmentExists(updatePositionDto.departmentId);
    }

    if (updatePositionDto.reportsToPositionId !== undefined) {
      if (updatePositionDto.reportsToPositionId) {
        if (updatePositionDto.reportsToPositionId === id) {
          throw new BadRequestException('Position cannot report to itself');
        }
        await this.validatePositionExists(
          updatePositionDto.reportsToPositionId,
        );
      }
    }

    const updatedPosition = await this.positionModel
      .findByIdAndUpdate(id, updatePositionDto, {
        new: true,
        runValidators: true,
      })
      .populate('departmentId', 'code name')
      .populate('reportsToPositionId', 'code title')
      .exec();

    return updatedPosition;
  }

  async removePosition(id: string, userId: string): Promise<Position> {
    const position = await this.findPositionById(id);

    const reportingPositions = await this.positionModel.countDocuments({
      reportsToPositionId: new Types.ObjectId(id),
      isActive: true,
    });

    if (reportingPositions > 0) {
      throw new BadRequestException(
        `Cannot deactivate position. ${reportingPositions} active position(s) report to this position. Please reassign them first.`,
      );
    }

    const positionDoc = position as PositionDocument;
    positionDoc.isActive = false;

    return positionDoc.save();
  }

  async assignReportingPosition(
    positionId: string,
    reportsToPositionId: string | null,
    userId: string,
  ): Promise<Position> {
    const position = await this.findPositionById(positionId);

    if (reportsToPositionId) {
      if (reportsToPositionId === positionId) {
        throw new BadRequestException('Position cannot report to itself');
      }

      await this.validatePositionExists(reportsToPositionId);
      await this.validateNoCircularReporting(positionId, reportsToPositionId);
    }

    const positionDoc = position as PositionDocument;
    positionDoc.reportsToPositionId = reportsToPositionId
      ? (new Types.ObjectId(reportsToPositionId) as any)
      : undefined;

    return positionDoc.save();
  }

  async getReportingPositions(positionId: string): Promise<Position[]> {
    await this.validatePositionExists(positionId);

    return this.positionModel
      .find({
        reportsToPositionId: new Types.ObjectId(positionId),
        isActive: true,
      })
      .populate('departmentId', 'code name')
      .exec();
  }

  async getReportingChain(positionId: string): Promise<Position[]> {
    const position = await this.findPositionById(positionId);
    const chain: Position[] = [];
    let currentPosition = position as PositionDocument;

    while (currentPosition.reportsToPositionId) {
      const reportingTo = await this.positionModel
        .findById(currentPosition.reportsToPositionId)
        .populate('departmentId', 'code name')
        .exec();

      if (!reportingTo) {
        break;
      }

      chain.push(reportingTo);
      currentPosition = reportingTo as PositionDocument;
    }

    return chain;
  }

  async getPositionHierarchy(positionId?: string): Promise<any> {
    let rootPositions;

    if (positionId) {
      if (!Types.ObjectId.isValid(positionId)) {
        throw new BadRequestException('Invalid position ID');
      }

      rootPositions = await this.positionModel
        .find({ _id: new Types.ObjectId(positionId), isActive: true })
        .populate('departmentId', 'code name')
        .exec();
    } else {
      rootPositions = await this.positionModel
        .find({ reportsToPositionId: null, isActive: true })
        .populate('departmentId', 'code name')
        .exec();
    }

    const buildTree = async (pos: any): Promise<any> => {
      const reportingPositions = await this.positionModel
        .find({ reportsToPositionId: pos._id, isActive: true })
        .populate('departmentId', 'code name')
        .exec();

      return {
        ...pos.toObject(),
        reportingPositions: await Promise.all(
          reportingPositions.map((rp: any) => buildTree(rp)),
        ),
      };
    };

    return Promise.all(rootPositions.map((pos: any) => buildTree(pos)));
  }

  async assignDepartmentToPosition(
    positionId: string,
    departmentId: string,
    userId: string,
  ): Promise<Position> {
    const position = await this.findPositionById(positionId);

    await this.validateDepartmentExists(departmentId);

    const positionDoc = position as PositionDocument;
    let currentDepartmentId: string;
    if (positionDoc.departmentId instanceof Types.ObjectId) {
      currentDepartmentId = positionDoc.departmentId.toString();
    } else if (
      typeof positionDoc.departmentId === 'object' &&
      positionDoc.departmentId !== null
    ) {
      currentDepartmentId =
        (positionDoc.departmentId as any)._id?.toString() ||
        (positionDoc.departmentId as any).toString();
    } else {
      currentDepartmentId = String(positionDoc.departmentId);
    }

    const normalizedCurrent = new Types.ObjectId(
      currentDepartmentId,
    ).toString();
    const normalizedNew = new Types.ObjectId(departmentId).toString();

    if (normalizedCurrent === normalizedNew) {
      throw new BadRequestException(
        'Position is already assigned to this department',
      );
    }

    positionDoc.departmentId = new Types.ObjectId(departmentId) as any;

    return positionDoc.save();
  }

  async getPositionsByDepartment(departmentId: string): Promise<Position[]> {
    await this.validateDepartmentExists(departmentId);

    return this.positionModel
      .find({
        departmentId: new Types.ObjectId(departmentId),
        isActive: true,
      })
      .populate('departmentId', 'code name')
      .populate('reportsToPositionId', 'code title')
      .sort({ title: 1 })
      .exec();
  }

  // =====================================
  // CHANGE REQUEST METHODS (using StructureChangeRequest)
  // =====================================

  async createChangeRequest(
    createDto: CreateOrgChangeRequestDto,
    userId: string,
  ): Promise<StructureChangeRequest> {
    const requestNumber = await this.generateRequestNumber();

    const changeRequest = new this.changeRequestModel({
      requestNumber,
      requestedByEmployeeId: new Types.ObjectId(userId),
      requestType: createDto.requestType,
      targetDepartmentId: createDto.targetDepartmentId
        ? new Types.ObjectId(createDto.targetDepartmentId)
        : undefined,
      targetPositionId: createDto.targetPositionId
        ? new Types.ObjectId(createDto.targetPositionId)
        : undefined,
      details: createDto.details,
      reason: createDto.reason,
      status: StructureRequestStatus.DRAFT,
    });

    return changeRequest.save();
  }

  async findAllChangeRequests(queryDto: QueryOrgChangeRequestDto): Promise<{
    data: StructureChangeRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      requestNumber,
      requestType,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {};

    if (requestNumber) {
      filter.requestNumber = requestNumber.toUpperCase();
    }

    if (requestType) {
      filter.requestType = requestType;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.changeRequestModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('requestedByEmployeeId', 'firstName lastName')
        .populate('submittedByEmployeeId', 'firstName lastName')
        .exec(),
      this.changeRequestModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findChangeRequestById(id: string): Promise<StructureChangeRequest> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid change request ID');
    }

    const changeRequest = await this.changeRequestModel
      .findById(id)
      .populate('requestedByEmployeeId', 'firstName lastName')
      .populate('submittedByEmployeeId', 'firstName lastName')
      .exec();

    if (!changeRequest) {
      throw new NotFoundException(`Change request with ID '${id}' not found`);
    }

    return changeRequest;
  }

  async findChangeRequestByNumber(
    requestNumber: string,
  ): Promise<StructureChangeRequest> {
    const changeRequest = await this.changeRequestModel
      .findOne({ requestNumber: requestNumber.toUpperCase() })
      .populate('requestedByEmployeeId', 'firstName lastName')
      .exec();

    if (!changeRequest) {
      throw new NotFoundException(
        `Change request with number '${requestNumber}' not found`,
      );
    }

    return changeRequest;
  }

  async updateChangeRequest(
    id: string,
    updateDto: UpdateOrgChangeRequestDto,
    userId: string,
  ): Promise<StructureChangeRequest> {
    const changeRequest = await this.findChangeRequestById(id);

    if (changeRequest.status !== StructureRequestStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT requests can be updated');
    }

    const updateData: any = {
      ...updateDto,
    };

    if (updateDto.targetDepartmentId !== undefined) {
      updateData.targetDepartmentId = updateDto.targetDepartmentId
        ? new Types.ObjectId(updateDto.targetDepartmentId)
        : undefined;
    }

    if (updateDto.targetPositionId !== undefined) {
      updateData.targetPositionId = updateDto.targetPositionId
        ? new Types.ObjectId(updateDto.targetPositionId)
        : undefined;
    }

    const updatedRequest = await this.changeRequestModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('requestedByEmployeeId', 'firstName lastName')
      .exec();

    return updatedRequest;
  }

  async submitChangeRequestForReview(
    id: string,
    userId: string,
  ): Promise<StructureChangeRequest> {
    const changeRequest = await this.findChangeRequestById(id);

    if (changeRequest.status !== StructureRequestStatus.DRAFT) {
      throw new BadRequestException(
        'Only DRAFT requests can be submitted for review',
      );
    }

    const changeRequestDoc = changeRequest as StructureChangeRequestDocument;
    changeRequestDoc.status = StructureRequestStatus.SUBMITTED;
    changeRequestDoc.submittedByEmployeeId = new Types.ObjectId(userId) as any;
    changeRequestDoc.submittedAt = new Date();

    return changeRequestDoc.save();
  }

  async reviewChangeRequest(
    id: string,
    reviewDto: ReviewOrgChangeRequestDto,
    userId: string,
  ): Promise<StructureChangeRequest> {
    const changeRequest = await this.findChangeRequestById(id);

    if (changeRequest.status !== StructureRequestStatus.SUBMITTED) {
      throw new BadRequestException('Only SUBMITTED requests can be reviewed');
    }

    const approval = new this.approvalModel({
      changeRequestId: new Types.ObjectId(id),
      approverEmployeeId: new Types.ObjectId(userId),
      decision: reviewDto.approved
        ? ApprovalDecision.APPROVED
        : ApprovalDecision.REJECTED,
      decidedAt: new Date(),
      comments: reviewDto.comments,
    });

    await approval.save();

    const changeRequestDoc = changeRequest as StructureChangeRequestDocument;
    changeRequestDoc.status = reviewDto.approved
      ? StructureRequestStatus.APPROVED
      : StructureRequestStatus.REJECTED;

    return changeRequestDoc.save();
  }

  async approveChangeRequest(
    id: string,
    approveDto: ApproveOrgChangeRequestDto,
    userId: string,
  ): Promise<StructureChangeRequest> {
    const changeRequest = await this.findChangeRequestById(id);

    if (changeRequest.status !== StructureRequestStatus.SUBMITTED) {
      throw new BadRequestException('Only SUBMITTED requests can be approved');
    }

    const approval = new this.approvalModel({
      changeRequestId: new Types.ObjectId(id),
      approverEmployeeId: new Types.ObjectId(userId),
      decision: ApprovalDecision.APPROVED,
      decidedAt: new Date(),
      comments: approveDto.comments,
    });

    await approval.save();

    const changeRequestDoc = changeRequest as StructureChangeRequestDocument;
    changeRequestDoc.status = StructureRequestStatus.APPROVED;

    return changeRequestDoc.save();
  }

  async rejectChangeRequest(
    id: string,
    reason: string,
    userId: string,
  ): Promise<StructureChangeRequest> {
    const changeRequest = await this.findChangeRequestById(id);

    if (changeRequest.status !== StructureRequestStatus.SUBMITTED) {
      throw new BadRequestException('Only SUBMITTED requests can be rejected');
    }

    const approval = new this.approvalModel({
      changeRequestId: new Types.ObjectId(id),
      approverEmployeeId: new Types.ObjectId(userId),
      decision: ApprovalDecision.REJECTED,
      decidedAt: new Date(),
      comments: reason,
    });

    await approval.save();

    const changeRequestDoc = changeRequest as StructureChangeRequestDocument;
    changeRequestDoc.status = StructureRequestStatus.REJECTED;

    return changeRequestDoc.save();
  }

  async cancelChangeRequest(
    id: string,
    userId: string,
  ): Promise<StructureChangeRequest> {
    const changeRequest = await this.findChangeRequestById(id);

    if (
      ![
        StructureRequestStatus.DRAFT,
        StructureRequestStatus.SUBMITTED,
      ].includes(changeRequest.status)
    ) {
      throw new BadRequestException(
        'Only DRAFT or SUBMITTED requests can be cancelled',
      );
    }

    const changeRequestDoc = changeRequest as StructureChangeRequestDocument;
    changeRequestDoc.status = StructureRequestStatus.CANCELED;

    return changeRequestDoc.save();
  }

  // =====================================
  // ORG CHART METHODS
  // =====================================

  async generateOrgChart(departmentId?: string): Promise<any> {
    let departments: DepartmentDocument[];

    if (departmentId) {
      const department = await this.departmentModel
        .findById(departmentId)
        .populate('headPositionId')
        .exec();
      if (!department) {
        throw new NotFoundException(
          `Department with ID ${departmentId} not found`,
        );
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
        const positions = await this.positionModel
          .find({
            departmentId: dept._id,
            isActive: true,
          })
          .populate('reportsToPositionId')
          .sort({ title: 1 })
          .exec();

        const positionTree = await this.buildPositionTree(positions);

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
          statistics: {
            totalPositions: positions.length,
            filledPositions: 0,
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

  async getDepartmentOrgChart(departmentId: string): Promise<any> {
    return this.generateOrgChart(departmentId);
  }

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

  // =====================================
  // HELPER METHODS
  // =====================================

  private async validateDepartmentExists(departmentId: string): Promise<void> {
    if (!Types.ObjectId.isValid(departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.departmentModel.findById(departmentId).exec();
    if (!department) {
      throw new NotFoundException(
        `Department with ID '${departmentId}' not found`,
      );
    }

    if (!department.isActive) {
      throw new BadRequestException(
        `Department with ID '${departmentId}' is not active`,
      );
    }
  }

  private async validatePositionExists(positionId: string): Promise<void> {
    if (!Types.ObjectId.isValid(positionId)) {
      throw new BadRequestException('Invalid position ID');
    }

    const position = await this.positionModel.findById(positionId).exec();
    if (!position) {
      throw new NotFoundException(`Position with ID '${positionId}' not found`);
    }

    if (!position.isActive) {
      throw new BadRequestException(
        `Position with ID '${positionId}' is not active`,
      );
    }
  }

  private async validateNoCircularReporting(
    positionId: string,
    reportsToPositionId: string,
  ): Promise<void> {
    let currentId = reportsToPositionId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) {
        break;
      }

      if (currentId === positionId) {
        throw new BadRequestException(
          'Circular reporting relationship detected. This would create a loop in the hierarchy.',
        );
      }

      visited.add(currentId);

      const position = await this.positionModel.findById(currentId).exec();
      if (!position || !position.reportsToPositionId) {
        break;
      }

      currentId = (position.reportsToPositionId as any).toString();
    }
  }

  private async buildPositionTree(
    positions: PositionDocument[],
  ): Promise<any[]> {
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

  private async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORG-${year}-`;

    const latest = await this.changeRequestModel
      .findOne({ requestNumber: new RegExp(`^${prefix}`) })
      .sort({ requestNumber: -1 })
      .exec();

    let sequence = 1;
    if (latest) {
      const lastSequence = parseInt(
        latest.requestNumber.split('-').pop() || '0',
        10,
      );
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }
}
