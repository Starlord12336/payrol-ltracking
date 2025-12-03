import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Position, PositionDocument } from '../../shared/schemas/position.schema';
import { Department, DepartmentDocument } from '../../shared/schemas/department.schema';
import { CreatePositionDto, UpdatePositionDto, QueryPositionDto } from '../dto';

@Injectable()
export class PositionService {
  constructor(
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  /**
   * Create a new position
   */
  async create(createPositionDto: CreatePositionDto, userId: string): Promise<Position> {
    // Check if position code already exists
    const existingPosition = await this.positionModel.findOne({
      code: createPositionDto.code,
    });

    if (existingPosition) {
      throw new ConflictException(`Position with code '${createPositionDto.code}' already exists`);
    }

    // Validate department exists
    await this.validateDepartmentExists(createPositionDto.departmentId);

    // Validate reportsToPositionId exists if provided
    if (createPositionDto.reportsToPositionId) {
      await this.validatePositionExists(createPositionDto.reportsToPositionId);
    }

    // Create position
    const position = new this.positionModel({
      ...createPositionDto,
      isActive: true,
    });

    return position.save();
  }

  /**
   * Find all positions with filters and pagination
   */
  async findAll(queryDto: QueryPositionDto): Promise<{
    data: Position[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, code, departmentId, reportsToPositionId, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;

    // Build filter
    const filter: any = {};

    // Exact match by position code (takes priority over search)
    if (code) {
      filter.code = code;
    } else if (search) {
      // Fuzzy search across multiple fields
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

    // Execute query with pagination
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

  /**
   * Find one position by ID
   */
  async findOne(id: string): Promise<Position> {
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

  /**
   * Find position by code
   */
  async findByCode(code: string): Promise<Position> {
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

  /**
   * Update a position
   */
  async update(id: string, updatePositionDto: UpdatePositionDto, userId: string): Promise<Position> {
    // Validate position exists
    const position = await this.findOne(id);

    // Check if updating position code and it conflicts with another position
    if (updatePositionDto.code && updatePositionDto.code !== position.code) {
      const existingPosition = await this.positionModel.findOne({
        code: updatePositionDto.code,
        _id: { $ne: id },
      });

      if (existingPosition) {
        throw new ConflictException(`Position with code '${updatePositionDto.code}' already exists`);
      }
    }

    // Validate department if changed
    if (updatePositionDto.departmentId) {
      await this.validateDepartmentExists(updatePositionDto.departmentId);
    }

    // Validate reportsToPositionId if changed
    if (updatePositionDto.reportsToPositionId !== undefined) {
      if (updatePositionDto.reportsToPositionId) {
        // Prevent circular reference (position can't report to itself)
        if (updatePositionDto.reportsToPositionId === id) {
          throw new BadRequestException('Position cannot report to itself');
        }
        await this.validatePositionExists(updatePositionDto.reportsToPositionId);
      }
    }

    // Update position
    const updatedPosition = await this.positionModel
      .findByIdAndUpdate(
        id,
        updatePositionDto,
        { new: true, runValidators: true },
      )
      .populate('departmentId', 'code name')
      .populate('reportsToPositionId', 'code title')
      .exec();

    return updatedPosition;
  }

  /**
   * Soft delete a position (deactivate)
   */
  async remove(id: string, userId: string): Promise<Position> {
    const position = await this.findOne(id);

    const positionDoc = position as PositionDocument;

    // TODO: Check if position has active employees (when Employee module is integrated)
    // const activeEmployees = await this.employeeModel.countDocuments({
    //   'organizationalInfo.positionId': new Types.ObjectId(id),
    //   'employmentInfo.employmentStatus': 'ACTIVE',
    // });
    // if (activeEmployees > 0) {
    //   throw new BadRequestException(
    //     `Cannot deactivate position. It has ${activeEmployees} active employee(s). Please transfer them first.`,
    //   );
    // }

    // Check if position is reporting position for other positions
    const reportingPositions = await this.positionModel.countDocuments({
      reportsToPositionId: new Types.ObjectId(id),
      isActive: true,
    });

    if (reportingPositions > 0) {
      throw new BadRequestException(
        `Cannot deactivate position. ${reportingPositions} active position(s) report to this position. Please reassign them first.`,
      );
    }

    // Soft delete (deactivate)
    positionDoc.isActive = false;

    return positionDoc.save();
  }

  /**
   * Validate department exists
   */
  private async validateDepartmentExists(departmentId: string): Promise<void> {
    if (!Types.ObjectId.isValid(departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    const department = await this.departmentModel.findById(departmentId).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID '${departmentId}' not found`);
    }

    if (!department.isActive) {
      throw new BadRequestException(`Department with ID '${departmentId}' is not active`);
    }
  }

  /**
   * Validate position exists
   */
  private async validatePositionExists(positionId: string): Promise<void> {
    if (!Types.ObjectId.isValid(positionId)) {
      throw new BadRequestException('Invalid position ID');
    }

    const position = await this.positionModel.findById(positionId).exec();
    if (!position) {
      throw new NotFoundException(`Position with ID '${positionId}' not found`);
    }

    if (!position.isActive) {
      throw new BadRequestException(`Position with ID '${positionId}' is not active`);
    }
  }

  /**
   * Assign or change reporting position (hierarchy management)
   */
  async assignReportingPosition(positionId: string, reportsToPositionId: string | null, userId: string): Promise<Position> {
    const position = await this.findOne(positionId);

    // If setting a reporting position, validate it exists and check for circular reference
    if (reportsToPositionId) {
      // Prevent self-reference
      if (reportsToPositionId === positionId) {
        throw new BadRequestException('Position cannot report to itself');
      }

      await this.validatePositionExists(reportsToPositionId);
      await this.validateNoCircularReporting(positionId, reportsToPositionId);
    }

    // Update reporting position
    const positionDoc = position as PositionDocument;
    positionDoc.reportsToPositionId = reportsToPositionId
      ? new Types.ObjectId(reportsToPositionId) as any
      : undefined;

    return positionDoc.save();
  }

  /**
   * Get positions that report to this position (direct reports)
   */
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

  /**
   * Get reporting chain (positions this position reports to, up the hierarchy)
   */
  async getReportingChain(positionId: string): Promise<Position[]> {
    const position = await this.findOne(positionId);
    const chain: Position[] = [];
    let currentPosition = position as PositionDocument;

    // Traverse up the reporting chain
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

  /**
   * Get position hierarchy tree (all positions reporting to this position)
   */
  async getPositionHierarchy(positionId?: string): Promise<any> {
    let rootPositions;

    if (positionId) {
      // Validate position ID
      if (!Types.ObjectId.isValid(positionId)) {
        throw new BadRequestException('Invalid position ID');
      }
      
      // Get hierarchy starting from specific position
      rootPositions = await this.positionModel
        .find({ _id: new Types.ObjectId(positionId), isActive: true })
        .populate('departmentId', 'code name')
        .exec();
    } else {
      // Get all root positions (no reporting position)
      rootPositions = await this.positionModel
        .find({ reportsToPositionId: null, isActive: true })
        .populate('departmentId', 'code name')
        .exec();
    }

    // Build hierarchy tree
    const buildTree = async (pos: any): Promise<any> => {
      const reportingPositions = await this.positionModel
        .find({ reportsToPositionId: pos._id, isActive: true })
        .populate('departmentId', 'code name')
        .exec();

      return {
        ...pos.toObject(),
        reportingPositions: await Promise.all(reportingPositions.map(rp => buildTree(rp))),
      };
    };

    return Promise.all(rootPositions.map(pos => buildTree(pos)));
  }

  /**
   * Validate no circular reporting relationship
   */
  private async validateNoCircularReporting(positionId: string, reportsToPositionId: string): Promise<void> {
    // Check if the target position reports (directly or indirectly) to the current position
    let currentId = reportsToPositionId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) {
        break; // Prevent infinite loop
      }

      if (currentId === positionId) {
        throw new BadRequestException('Circular reporting relationship detected. This would create a loop in the hierarchy.');
      }

      visited.add(currentId);

      const position = await this.positionModel.findById(currentId).exec();
      if (!position || !position.reportsToPositionId) {
        break;
      }

      currentId = (position.reportsToPositionId as any).toString();
    }
  }

  /**
   * Note: Headcount methods removed - not in main repo schema
   */

  /**
   * Reassign position to a different department
   */
  async assignDepartment(positionId: string, departmentId: string, userId: string): Promise<Position> {
    const position = await this.findOne(positionId);

    // Validate new department exists and is active
    await this.validateDepartmentExists(departmentId);

    // Check if department is actually changing
    const positionDoc = position as PositionDocument;
    // Handle both ObjectId and populated object
    let currentDepartmentId: string;
    if (positionDoc.departmentId instanceof Types.ObjectId) {
      currentDepartmentId = positionDoc.departmentId.toString();
    } else if (typeof positionDoc.departmentId === 'object' && positionDoc.departmentId !== null) {
      // Populated object
      currentDepartmentId = (positionDoc.departmentId as any)._id?.toString() || (positionDoc.departmentId as any).toString();
    } else {
      currentDepartmentId = String(positionDoc.departmentId);
    }
    
    // Normalize both IDs for comparison
    const normalizedCurrent = new Types.ObjectId(currentDepartmentId).toString();
    const normalizedNew = new Types.ObjectId(departmentId).toString();
    
    if (normalizedCurrent === normalizedNew) {
      throw new BadRequestException('Position is already assigned to this department');
    }

    // TODO: Check if position has active employees (when Employee module is integrated)
    // const activeEmployees = await this.employeeModel.countDocuments({
    //   'organizationalInfo.positionId': new Types.ObjectId(positionId),
    //   'employmentInfo.employmentStatus': 'ACTIVE',
    // });
    //
    // if (activeEmployees > 0) {
    //   throw new BadRequestException(
    //     `Cannot reassign position. It has ${activeEmployees} active employee(s). Please transfer them first.`,
    //   );
    // }

    // Update department
    positionDoc.departmentId = new Types.ObjectId(departmentId) as any;

    return positionDoc.save();
  }

  /**
   * Get all positions in a specific department
   */
  async getPositionsByDepartment(departmentId: string): Promise<Position[]> {
    // Validate department exists
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
}

