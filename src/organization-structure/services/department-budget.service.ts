import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DepartmentBudget, DepartmentBudgetDocument, BudgetStatus } from '../schemas/department-budget.schema';
import { Department, DepartmentDocument } from '../../shared/schemas/department.schema';
import { CreateDepartmentBudgetDto, UpdateDepartmentBudgetDto } from '../dto';

@Injectable()
export class DepartmentBudgetService {
  constructor(
    @InjectModel(DepartmentBudget.name)
    private budgetModel: Model<DepartmentBudgetDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  /**
   * Create a new department budget
   */
  async create(createDto: CreateDepartmentBudgetDto, userId: string): Promise<DepartmentBudgetDocument> {
    // Validate department exists
    const department = await this.departmentModel.findById(createDto.departmentId).exec();
    if (!department) {
      throw new NotFoundException(`Department with ID '${createDto.departmentId}' not found`);
    }

    // Check if budget already exists for this department and fiscal year/quarter
    const existingBudget = await this.budgetModel.findOne({
      departmentId: new Types.ObjectId(createDto.departmentId),
      fiscalYear: createDto.fiscalYear,
      ...(createDto.fiscalQuarter ? { fiscalQuarter: createDto.fiscalQuarter } : { fiscalQuarter: null }),
    }).exec();

    if (existingBudget) {
      throw new ConflictException(
        `Budget already exists for department ${createDto.departmentId} for fiscal year ${createDto.fiscalYear}${createDto.fiscalQuarter ? ` Q${createDto.fiscalQuarter}` : ''}`,
      );
    }

    const budget = new this.budgetModel({
      ...createDto,
      departmentId: new Types.ObjectId(createDto.departmentId),
      currency: createDto.currency || 'EGP',
      status: createDto.status || BudgetStatus.DRAFT,
      currentHeadcount: 0,
      actualSpent: 0,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return budget.save();
  }

  /**
   * Find all budgets with filters
   */
  async findAll(departmentId?: string, fiscalYear?: number, status?: BudgetStatus): Promise<DepartmentBudgetDocument[]> {
    const filter: any = {};

    if (departmentId) {
      filter.departmentId = new Types.ObjectId(departmentId);
    }

    if (fiscalYear) {
      filter.fiscalYear = fiscalYear;
    }

    if (status) {
      filter.status = status;
    }

    return this.budgetModel
      .find(filter)
      .populate('departmentId', 'code name')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ fiscalYear: -1, fiscalQuarter: -1 })
      .exec();
  }

  /**
   * Find budget by ID
   */
  async findOne(id: string): Promise<DepartmentBudgetDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid budget ID');
    }

    const budget = await this.budgetModel
      .findById(id)
      .populate('departmentId', 'code name')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .exec();

    if (!budget) {
      throw new NotFoundException(`Budget with ID '${id}' not found`);
    }

    return budget;
  }

  /**
   * Find budget by department and fiscal period
   */
  async findByDepartmentAndPeriod(
    departmentId: string,
    fiscalYear: number,
    fiscalQuarter?: number,
  ): Promise<DepartmentBudgetDocument | null> {
    const filter: any = {
      departmentId: new Types.ObjectId(departmentId),
      fiscalYear,
    };

    if (fiscalQuarter) {
      filter.fiscalQuarter = fiscalQuarter;
    } else {
      filter.$or = [{ fiscalQuarter: null }, { fiscalQuarter: { $exists: false } }];
    }

    return this.budgetModel.findOne(filter).exec();
  }

  /**
   * Update a budget
   */
  async update(id: string, updateDto: UpdateDepartmentBudgetDto, userId: string): Promise<DepartmentBudgetDocument> {
    const budget = await this.findOne(id);

    // Don't allow updating approved/closed budgets unless changing status
    if (budget.status === BudgetStatus.APPROVED || budget.status === BudgetStatus.CLOSED) {
      if (updateDto.status && updateDto.status !== budget.status) {
        // Allow status change
      } else if (Object.keys(updateDto).some(key => key !== 'status' && key !== 'currentHeadcount' && key !== 'actualSpent')) {
        throw new BadRequestException('Cannot update approved or closed budget. Only status, currentHeadcount, and actualSpent can be updated.');
      }
    }

    const updated = await this.budgetModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDto,
          updatedBy: new Types.ObjectId(userId),
        },
        { new: true, runValidators: true },
      )
      .populate('departmentId', 'code name')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .exec();

    return updated;
  }

  /**
   * Approve a budget
   */
  async approve(id: string, userId: string): Promise<DepartmentBudgetDocument> {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException(`Budget must be in DRAFT status to be approved. Current status: ${budget.status}`);
    }

    budget.status = BudgetStatus.APPROVED;
    budget.approvedBy = new Types.ObjectId(userId) as any;
    budget.approvedAt = new Date();
    budget.updatedBy = new Types.ObjectId(userId) as any;

    return budget.save();
  }

  /**
   * Activate a budget
   */
  async activate(id: string, userId: string): Promise<DepartmentBudgetDocument> {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.APPROVED) {
      throw new BadRequestException(`Budget must be APPROVED to be activated. Current status: ${budget.status}`);
    }

    budget.status = BudgetStatus.ACTIVE;
    budget.updatedBy = new Types.ObjectId(userId) as any;

    return budget.save();
  }

  /**
   * Close a budget
   */
  async close(id: string, userId: string): Promise<DepartmentBudgetDocument> {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.ACTIVE) {
      throw new BadRequestException(`Budget must be ACTIVE to be closed. Current status: ${budget.status}`);
    }

    budget.status = BudgetStatus.CLOSED;
    budget.updatedBy = new Types.ObjectId(userId) as any;

    return budget.save();
  }

  /**
   * Delete a budget (only if DRAFT)
   */
  async delete(id: string): Promise<void> {
    const budget = await this.findOne(id);

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT budgets can be deleted');
    }

    await this.budgetModel.findByIdAndDelete(id).exec();
  }

  /**
   * Get budget utilization statistics
   */
  async getUtilizationStats(departmentId: string, fiscalYear?: number): Promise<any> {
    const filter: any = { departmentId: new Types.ObjectId(departmentId) };
    if (fiscalYear) {
      filter.fiscalYear = fiscalYear;
    }

    const budgets = await this.budgetModel.find(filter).exec();

    const stats = {
      totalBudgets: budgets.length,
      totalBudgetedAmount: budgets.reduce((sum, b) => sum + b.budgetedAmount, 0),
      totalActualSpent: budgets.reduce((sum, b) => sum + b.actualSpent, 0),
      totalRemainingBudget: budgets.reduce((sum, b) => sum + (b.remainingBudget || 0), 0),
      totalBudgetedHeadcount: budgets.reduce((sum, b) => sum + b.budgetedHeadcount, 0),
      totalCurrentHeadcount: budgets.reduce((sum, b) => sum + b.currentHeadcount, 0),
      totalVacantPositions: budgets.reduce((sum, b) => sum + b.vacantPositions, 0),
      budgets: budgets.map(b => {
        const budgetJson = b.toJSON ? b.toJSON() : b;
        return {
          id: b._id,
          fiscalYear: b.fiscalYear,
          fiscalQuarter: b.fiscalQuarter,
          budgetedAmount: b.budgetedAmount,
          actualSpent: b.actualSpent,
          remainingBudget: b.remainingBudget,
          budgetUtilizationPercent: (budgetJson as any).budgetUtilizationPercent || 0,
          budgetedHeadcount: b.budgetedHeadcount,
          currentHeadcount: b.currentHeadcount,
          vacantPositions: b.vacantPositions,
          headcountUtilizationPercent: (budgetJson as any).headcountUtilizationPercent || 0,
          status: b.status,
        };
      }),
    };

    return stats;
  }
}

