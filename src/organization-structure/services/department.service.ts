import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from '../../shared/schemas/department.schema';
import { CreateDepartmentDto, UpdateDepartmentDto, QueryDepartmentDto } from '../dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  /**
   * Create a new department
   */
  async create(createDepartmentDto: CreateDepartmentDto, userId: string): Promise<Department> {
    // Check if department code already exists
    const existingDepartment = await this.departmentModel.findOne({
      code: createDepartmentDto.code,
    });

    if (existingDepartment) {
      throw new ConflictException(`Department with code '${createDepartmentDto.code}' already exists`);
    }

    // Validate head position exists if provided
    if (createDepartmentDto.headPositionId) {
      // TODO: Validate position exists when Position module is integrated
    }

    // Create department
    const department = new this.departmentModel({
      ...createDepartmentDto,
      isActive: true,
    });

    return department.save();
  }

  /**
   * Find all departments with filters and pagination
   */
  async findAll(queryDto: QueryDepartmentDto): Promise<{
    data: Department[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, code, isActive, headPositionId, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;

    // Build filter
    const filter: any = {};

    // Exact match by department code (takes priority over search)
    if (code) {
      filter.code = code;
    } else if (search) {
      // Fuzzy search across multiple fields
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

    // Execute query with pagination
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

  /**
   * Find one department by ID
   */
  async findOne(id: string): Promise<Department> {
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

  /**
   * Find department by code
   */
  async findByCode(code: string): Promise<Department> {
    const department = await this.departmentModel
      .findOne({ code: code })
      .populate('headPositionId', 'code title')
      .exec();

    if (!department) {
      throw new NotFoundException(`Department with code '${code}' not found`);
    }

    return department;
  }

  /**
   * Update a department
   */
  async update(id: string, updateDepartmentDto: UpdateDepartmentDto, userId: string): Promise<Department> {
    // Validate department exists
    const department = await this.findOne(id);

    // Check if updating department code and it conflicts with another department
    if (updateDepartmentDto.code && updateDepartmentDto.code !== department.code) {
      const existingDepartment = await this.departmentModel.findOne({
        code: updateDepartmentDto.code,
        _id: { $ne: id },
      });

      if (existingDepartment) {
        throw new ConflictException(`Department with code '${updateDepartmentDto.code}' already exists`);
      }
    }

    // Validate head position if changed
    if (updateDepartmentDto.headPositionId) {
      // TODO: Validate position exists when Position module is integrated
    }

    // Update department
    const updatedDepartment = await this.departmentModel
      .findByIdAndUpdate(
        id,
        updateDepartmentDto,
        { new: true, runValidators: true },
      )
      .populate('headPositionId', 'code title')
      .exec();

    return updatedDepartment;
  }

  /**
   * Soft delete a department (deactivate)
   */
  async remove(id: string, userId: string): Promise<Department> {
    const department = await this.findOne(id);

    // TODO: Check if department has active employees (integrate with Employee Profile module)
    // const activeEmployees = await this.employeeModel.countDocuments({
    //   'organizationalInfo.departmentId': new Types.ObjectId(id),
    //   'employmentInfo.employmentStatus': 'ACTIVE',
    // });
    //
    // if (activeEmployees > 0) {
    //   throw new BadRequestException(
    //     `Cannot deactivate department. It has ${activeEmployees} active employee(s). Please transfer them first.`,
    //   );
    // }

    // Soft delete (deactivate)
    const departmentDoc = department as DepartmentDocument;
    departmentDoc.isActive = false;

    return departmentDoc.save();
  }

  /**
   * Get department hierarchy (tree structure)
   * Note: Simplified - no parent/child hierarchy in main repo schema
   */
  async getDepartmentHierarchy(departmentId?: string): Promise<any> {
    let departments;

    if (departmentId) {
      // Get specific department
      departments = await this.departmentModel
        .find({ _id: new Types.ObjectId(departmentId), isActive: true })
        .populate('headPositionId', 'code title')
        .exec();
    } else {
      // Get all active departments
      departments = await this.departmentModel
        .find({ isActive: true })
        .populate('headPositionId', 'code title')
        .exec();
    }

    return departments;
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(departmentId: string): Promise<any> {
    const department = await this.findOne(departmentId);

    // TODO: Get employee count when Employee module is ready
    // const employeeCount = await this.employeeModel.countDocuments({
    //   'organizationalInfo.departmentId': new Types.ObjectId(departmentId),
    //   'employmentInfo.employmentStatus': 'ACTIVE',
    // });

    return {
      department,
      // employeeCount,
      // positionCount,
    };
  }

  /**
   * Helper: Validate department exists
   */
  private async validateDepartmentExists(departmentId: string): Promise<void> {
    if (!Types.ObjectId.isValid(departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    const exists = await this.departmentModel.exists({ _id: new Types.ObjectId(departmentId) });
    if (!exists) {
      throw new NotFoundException(`Department with ID '${departmentId}' not found`);
    }
  }

  /**
   * Note: Parent/child hierarchy methods removed - not in main repo schema
   */

  /**
   * Assign or change department head position
   */
  async assignDepartmentHead(departmentId: string, positionId: string | null, userId: string): Promise<Department> {
    const department = await this.findOne(departmentId);

    // TODO: Validate position exists when Position module is integrated
    // if (positionId) {
    //   const position = await this.positionModel.findById(positionId).exec();
    //   if (!position) {
    //     throw new NotFoundException(`Position with ID '${positionId}' not found`);
    //   }
    // }

    // Update department head position
    const departmentDoc = department as DepartmentDocument;
    departmentDoc.headPositionId = positionId 
      ? new Types.ObjectId(positionId) as any
      : undefined;

    return departmentDoc.save();
  }

  /**
   * Note: Cost center methods removed - not in main repo schema
   */
}


