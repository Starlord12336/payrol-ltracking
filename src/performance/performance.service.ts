import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Schema as MongooseSchema } from 'mongoose';
// Performance schemas
import {
  AppraisalTemplate,
  AppraisalTemplateDocument,
} from './models/appraisal-template.schema';
import {
  AppraisalCycle,
  AppraisalCycleDocument,
} from './models/appraisal-cycle.schema';
import {
  AppraisalCycleStatus,
  AppraisalAssignmentStatus,
} from './enums/performance.enums';
import {
  AppraisalRecord,
  AppraisalRecordDocument,
} from './models/appraisal-record.schema';
import { AppraisalRecordStatus } from './enums/performance.enums';
import {
  AppraisalAssignment,
  AppraisalAssignmentDocument,
} from './models/appraisal-assignment.schema';
import {
  AppraisalDispute,
  AppraisalDisputeDocument,
} from './models/appraisal-dispute.schema';
import { AppraisalDisputeStatus } from './enums/performance.enums';
// Integration schemas
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import {
  Department,
  DepartmentDocument,
} from '../organization-structure/models/department.schema';
import {
  Position,
  PositionDocument,
} from '../organization-structure/models/position.schema';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
// DTOs
import { CreateAppraisalTemplateDto } from './dto/create-appraisal-template.dto';
import { UpdateAppraisalTemplateDto } from './dto/update-appraisal-template.dto';
import { CreateAppraisalCycleDto } from './dto/create-appraisal-cycle.dto';
import { UpdateAppraisalCycleDto } from './dto/update-appraisal-cycle.dto';
import { CreateAppraisalEvaluationDto } from './dto/create-appraisal-evaluation.dto';
import { UpdateAppraisalEvaluationDto } from './dto/update-appraisal-evaluation.dto';
import { CreateAppraisalDisputeDto } from './dto/create-appraisal-dispute.dto';
import { ResolveAppraisalDisputeDto } from './dto/resolve-appraisal-dispute.dto';
import { AddHrReviewDto } from './dto/add-hr-review.dto';
import { SubmitSelfAssessmentDto } from './dto/submit-self-assessment.dto';
import { CreatePerformanceGoalDto } from './dto/create-performance-goal.dto';
import { UpdatePerformanceGoalDto } from './dto/update-performance-goal.dto';
import { CreatePerformanceFeedbackDto } from './dto/create-performance-feedback.dto';
import { UpdatePerformanceFeedbackDto } from './dto/update-performance-feedback.dto';
import { CreateAppraisalAssignmentDto, BulkAssignTemplateDto } from './dto/create-appraisal-assignment.dto';
import { UpdateAppraisalAssignmentDto } from './dto/update-appraisal-assignment.dto';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(AppraisalTemplate.name)
    private templateModel: Model<AppraisalTemplateDocument>,
    @InjectModel(AppraisalCycle.name)
    private cycleModel: Model<AppraisalCycleDocument>,
    @InjectModel(AppraisalRecord.name)
    private evaluationModel: Model<AppraisalRecordDocument>,
    @InjectModel(AppraisalAssignment.name)
    private assignmentModel: Model<AppraisalAssignmentDocument>,
    @InjectModel(AppraisalDispute.name)
    private disputeModel: Model<AppraisalDisputeDocument>,
    // Integration models
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfileDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
  ) {}

  // ==================== APPRAISAL TEMPLATE METHODS ====================

  /**
   * Create a new appraisal template
   * Validates criteria weights if provided
   */
  async createTemplate(
    createDto: CreateAppraisalTemplateDto,
  ): Promise<AppraisalTemplate> {
    // Validate criteria weights if provided
    if (createDto.criteria && createDto.criteria.length > 0) {
      const criteriaWithWeights = createDto.criteria.filter(
        (c) => c.weight !== undefined && c.weight > 0,
      );
      if (criteriaWithWeights.length > 0) {
        const totalWeight = criteriaWithWeights.reduce(
          (sum, criterion) => sum + (criterion.weight || 0),
          0,
        );
        if (totalWeight > 0 && Math.abs(totalWeight - 100) > 0.01) {
          throw new BadRequestException(
            `Criteria weights must sum to 100%. Current sum: ${totalWeight}%`,
          );
        }
      }
    }

    // Check if template name already exists
    const existingTemplate = await this.templateModel.findOne({
      name: createDto.name,
    });
    if (existingTemplate) {
      throw new ConflictException(
        `Template with name "${createDto.name}" already exists`,
      );
    }

    // Convert string IDs to ObjectIds for applicable departments and positions
    const templateData: any = {
      name: createDto.name,
      description: createDto.description,
      templateType: createDto.templateType,
      ratingScale: createDto.ratingScale,
      criteria: createDto.criteria || [],
      instructions: createDto.instructions,
      applicableDepartmentIds:
        createDto.applicableDepartmentIds?.map(
          (id) => new Types.ObjectId(id),
        ) || [],
      applicablePositionIds:
        createDto.applicablePositionIds?.map(
          (id) => new Types.ObjectId(id),
        ) || [],
      isActive: createDto.isActive !== undefined ? createDto.isActive : true,
    };

    const template = new this.templateModel(templateData);
    return template.save();
  }

  /**
   * Get all templates (with optional filtering)
   */
  async findAllTemplates(isActive?: boolean): Promise<AppraisalTemplate[]> {
    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    return this.templateModel.find(filter).exec();
  }

  /**
   * Get a single template by ID
   */
  async findTemplateById(id: string): Promise<AppraisalTemplate> {
    const template = await this.templateModel
      .findById(id)
      .populate('applicableDepartmentIds')
      .populate('applicablePositionIds')
      .exec();
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  /**
   * Update a template
   */
  async updateTemplate(
    id: string,
    updateDto: UpdateAppraisalTemplateDto,
  ): Promise<AppraisalTemplate> {
    // Validate criteria weights if being updated
    if (updateDto.criteria && updateDto.criteria.length > 0) {
      const criteriaWithWeights = updateDto.criteria.filter(
        (c) => c.weight !== undefined && c.weight > 0,
      );
      if (criteriaWithWeights.length > 0) {
        const totalWeight = criteriaWithWeights.reduce(
          (sum, criterion) => sum + (criterion.weight || 0),
          0,
        );
        if (totalWeight > 0 && Math.abs(totalWeight - 100) > 0.01) {
          throw new BadRequestException(
            `Criteria weights must sum to 100%. Current sum: ${totalWeight}%`,
          );
        }
      }
    }

    // Check if name is being changed and if new name already exists
    if (updateDto.name) {
      const existingTemplate = await this.templateModel.findOne({
        name: updateDto.name,
        _id: { $ne: id },
      });
      if (existingTemplate) {
        throw new ConflictException(
          `Template with name "${updateDto.name}" already exists`,
        );
      }
    }

    // Prepare update data with ObjectId conversion
    const updateData: any = { ...updateDto };
    
    // Convert string IDs to ObjectIds if provided
    if (updateDto.applicableDepartmentIds) {
      updateData.applicableDepartmentIds = updateDto.applicableDepartmentIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    
    if (updateDto.applicablePositionIds) {
      updateData.applicablePositionIds = updateDto.applicablePositionIds.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updated = await this.templateModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    const result = await this.templateModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
  }

  // ==================== APPRAISAL CYCLE METHODS ====================

  /**
   * Create a new appraisal cycle
   */
  async createCycle(
    createDto: CreateAppraisalCycleDto,
  ): Promise<AppraisalCycleDocument> {
    // Validate dates
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate templateId if provided
    let templateId: Types.ObjectId | undefined;
    if (createDto.templateId && Types.ObjectId.isValid(createDto.templateId)) {
      templateId = new Types.ObjectId(createDto.templateId);
    }

    // Auto-generate cycle code
    const cycleCode = await this.generateCycleCode(
      createDto.appraisalType || 'ANNUAL',
      startDate,
    );

    // Build templateAssignments array (required by schema)
    const templateAssignments: any[] = [];
    if (templateId) {
      templateAssignments.push({
        templateId,
        departmentIds:
          createDto.targetDepartmentIds?.map((id) => new Types.ObjectId(id)) ||
          [],
      });
    }

    // Use cycle name if provided, otherwise use generated code
    // If both provided, use name but code is still generated for reference
    const cycleName = createDto.cycleName || cycleCode;

    const cycle = new this.cycleModel({
      name: cycleName,
      description: createDto.description,
      cycleType: createDto.appraisalType || 'ANNUAL',
      startDate,
      endDate,
      managerDueDate: createDto.managerReviewDeadline
        ? new Date(createDto.managerReviewDeadline)
        : undefined,
      employeeAcknowledgementDueDate: undefined, // Set later if needed
      templateAssignments,
      status: AppraisalCycleStatus.PLANNED,
    });

    return cycle.save();
  }

  /**
   * Generate a unique cycle code
   * Format: {TYPE}-{YEAR}-{SEQUENCE}
   * Example: ANNUAL-2024-001, SEMI_ANNUAL-2024-001
   */
  private async generateCycleCode(
    cycleType: string,
    startDate: Date,
  ): Promise<string> {
    const year = startDate.getFullYear();
    const typePrefix = cycleType.replace('_', '-').toUpperCase();
    const prefix = `${typePrefix}-${year}-`;

    // Find all cycles with names starting with the prefix
    const cyclesWithPrefix = await this.cycleModel
      .find({ name: new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) })
      .sort({ createdAt: -1 })
      .exec();

    let maxSequence = 0;
    for (const cycle of cyclesWithPrefix) {
      if (cycle.name) {
        // Extract sequence number from cycle name (format: TYPE-YEAR-SEQ)
        const match = cycle.name.match(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)(?:-|$)`));
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSequence) {
            maxSequence = seq;
          }
        }
      }
    }

    const sequence = maxSequence + 1;
    const cycleCode = `${prefix}${sequence.toString().padStart(3, '0')}`;

    // Double-check for uniqueness (in case of race condition)
    const exists = await this.cycleModel.findOne({ name: cycleCode }).exec();
    if (exists) {
      // If exists, increment and try again
      return `${prefix}${(sequence + 1).toString().padStart(3, '0')}`;
    }

    return cycleCode;
  }

  /**
   * Get all cycles
   */
  async findAllCycles(
    status?: AppraisalCycleStatus,
  ): Promise<AppraisalCycleDocument[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.cycleModel
      .find(filter)
      .populate('templateAssignments.templateId')
      .populate('templateAssignments.departmentIds')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a single cycle by ID
   */
  async findCycleById(id: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.cycleModel
      .findById(id)
      .populate('templateAssignments.templateId')
      .exec();
    if (!cycle) {
      throw new NotFoundException(`Cycle with ID ${id} not found`);
    }
    return cycle;
  }

  /**
   * Update a cycle
   */
  async updateCycle(
    id: string,
    updateDto: UpdateAppraisalCycleDto,
  ): Promise<AppraisalCycleDocument> {
    const updateData: any = { ...updateDto };

    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate);
    }
    if (updateDto.managerReviewDeadline) {
      updateData.managerDueDate = new Date(updateDto.managerReviewDeadline);
    }

    // Note: AppraisalCycle schema doesn't have targetEmployees, targetDepartments, etc.
    // These would need to be handled via templateAssignments if needed

    const updated = await this.cycleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Cycle with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Activate a cycle and auto-assign appraisals
   * This creates assignments for all eligible employees
   */
  async activateCycle(id: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.findCycleById(id);

    if (cycle.status !== AppraisalCycleStatus.PLANNED) {
      throw new BadRequestException(
        `Cannot activate cycle. Current status: ${cycle.status}`,
      );
    }

    // Auto-assign appraisals based on cycle scope
    await this.autoAssignAppraisals(cycle);

    cycle.status = AppraisalCycleStatus.ACTIVE;
    return cycle.save();
  }

  /**
   * Auto-assign appraisals for a cycle
   * Integrates with Employee Profile and Organization Structure modules
   */
  private async autoAssignAppraisals(
    cycle: AppraisalCycleDocument,
  ): Promise<void> {
    // Get template from cycle's templateAssignments
    const templateAssignment = cycle.templateAssignments?.[0];
    if (!templateAssignment) {
      throw new BadRequestException('Cycle has no template assignments');
    }

    const template = await this.templateModel
      .findById(templateAssignment.templateId)
      .exec();
    if (!template || !template.isActive) {
      throw new BadRequestException('Template not found or inactive');
    }

    // Build employee query based on cycle scope
    let employeeQuery: any = {
      status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] },
    };

    // Filter by template's applicable departments
    if (
      templateAssignment.departmentIds &&
      templateAssignment.departmentIds.length > 0
    ) {
      employeeQuery.primaryDepartmentId = {
        $in: templateAssignment.departmentIds,
      };
    } else if (
      template.applicableDepartmentIds &&
      template.applicableDepartmentIds.length > 0
    ) {
      employeeQuery.primaryDepartmentId = {
        $in: template.applicableDepartmentIds,
      };
    }

    const employees = await this.employeeModel.find(employeeQuery).exec();
    const newAssignments: AppraisalAssignmentDocument[] = [];

    // For each employee, determine their manager and create assignment
    for (const employee of employees) {
      // Check if assignment already exists
      const existingAssignment = await this.assignmentModel
        .findOne({
          cycleId: cycle._id,
          employeeProfileId: employee._id,
        })
        .exec();
      if (existingAssignment) {
        continue; // Skip if already assigned
      }

      // Get manager from organization structure using the helper method
      const managerId = await this.determineManagerForEmployee(employee);

      // Skip if no manager found (top-level employees)
      if (!managerId) {
        continue;
      }

      // Create assignment document
      const assignmentData = {
        cycleId: cycle._id,
        templateId: templateAssignment.templateId,
        employeeProfileId: employee._id,
        managerProfileId: managerId,
        departmentId: employee.primaryDepartmentId || new Types.ObjectId(),
        positionId: employee.primaryPositionId,
        status: AppraisalAssignmentStatus.NOT_STARTED,
        assignedAt: new Date(),
      };

      const assignment = new this.assignmentModel(assignmentData);
      await assignment.save();
      newAssignments.push(assignment);
    }
  }

  /**
   * Publish cycle results to employees
   */
  async publishCycle(id: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.findCycleById(id);

    if (cycle.status !== AppraisalCycleStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot publish cycle. Current status: ${cycle.status}`,
      );
    }

    // Update all evaluations to PUBLISHED status
    await this.evaluationModel
      .updateMany(
        { cycleId: new Types.ObjectId(id) },
        {
          status: AppraisalRecordStatus.HR_PUBLISHED,
          hrPublishedAt: new Date(),
        },
      )
      .exec();

    // Update cycle assignments status
    await this.assignmentModel
      .updateMany(
        {
          cycleId: new Types.ObjectId(id),
          status: AppraisalAssignmentStatus.SUBMITTED,
        },
        {
          status: AppraisalAssignmentStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      )
      .exec();

    cycle.publishedAt = new Date();
    return cycle.save();
  }

  /**
   * Close a cycle
   */
  async closeCycle(id: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.findCycleById(id);

    if (cycle.status !== AppraisalCycleStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot close cycle. Current status: ${cycle.status}`,
      );
    }

    cycle.status = AppraisalCycleStatus.CLOSED;
    return cycle.save();
  }

  // ==================== APPRAISAL ASSIGNMENT METHODS ====================

  /**
   * Get all assignments for a cycle
   */
  async findAssignmentsByCycle(
    cycleId: string,
  ): Promise<AppraisalAssignmentDocument[]> {
    return this.assignmentModel
      .find({ cycleId: new Types.ObjectId(cycleId) })
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .exec();
  }

  /**
   * Get assignments for a manager
   */
  async findAssignmentsByManager(
    managerId: string,
    cycleId?: string,
  ): Promise<AppraisalAssignmentDocument[]> {
    const filter: any = { managerProfileId: new Types.ObjectId(managerId) };
    if (cycleId) {
      filter.cycleId = new Types.ObjectId(cycleId);
    }
    return this.assignmentModel
      .find(filter)
      .populate('employeeProfileId')
      .populate('cycleId')
      .exec();
  }

  /**
   * Get assignments for an employee
   */
  async findAssignmentsByEmployee(
    employeeId: string,
    cycleId?: string,
  ): Promise<AppraisalAssignmentDocument[]> {
    const filter: any = { employeeProfileId: new Types.ObjectId(employeeId) };
    if (cycleId) {
      filter.cycleId = new Types.ObjectId(cycleId);
    }
    return this.assignmentModel
      .find(filter)
      .populate('managerProfileId')
      .populate('cycleId')
      .exec();
  }

  /**
   * Get a single assignment by employee and cycle
   */
  async findAssignmentByEmployeeAndCycle(
    employeeId: string,
    cycleId: string,
  ): Promise<AppraisalAssignmentDocument> {
    const assignment = await this.assignmentModel
      .findOne({
        employeeProfileId: new Types.ObjectId(employeeId),
        cycleId: new Types.ObjectId(cycleId),
      })
      .exec();
    if (!assignment) {
      throw new NotFoundException(
        `Assignment not found for employee ${employeeId} in cycle ${cycleId}`,
      );
    }
    return assignment;
  }

  /**
   * Get a single assignment by ID
   */
  async findAssignmentById(id: string): Promise<AppraisalAssignmentDocument> {
    const assignment = await this.assignmentModel
      .findById(id)
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('templateId')
      .populate('cycleId')
      .populate('departmentId')
      .populate('positionId')
      .exec();

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  /**
   * Get all assignments with optional filters
   */
  async findAllAssignments(filters?: {
    cycleId?: string;
    templateId?: string;
    employeeProfileId?: string;
    managerProfileId?: string;
    departmentId?: string;
    status?: AppraisalAssignmentStatus;
  }): Promise<AppraisalAssignmentDocument[]> {
    const query: any = {};

    if (filters?.cycleId) {
      query.cycleId = new Types.ObjectId(filters.cycleId);
    }
    if (filters?.templateId) {
      query.templateId = new Types.ObjectId(filters.templateId);
    }
    if (filters?.employeeProfileId) {
      query.employeeProfileId = new Types.ObjectId(filters.employeeProfileId);
    }
    if (filters?.managerProfileId) {
      query.managerProfileId = new Types.ObjectId(filters.managerProfileId);
    }
    if (filters?.departmentId) {
      query.departmentId = new Types.ObjectId(filters.departmentId);
    }
    if (filters?.status) {
      query.status = filters.status;
    }

    return this.assignmentModel
      .find(query)
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('templateId')
      .populate('cycleId')
      .populate('departmentId')
      .populate('positionId')
      .exec();
  }

  /**
   * Helper method to determine manager for an employee
   */
  private async determineManagerForEmployee(
    employee: EmployeeProfileDocument,
  ): Promise<Types.ObjectId | null> {
    // Try supervisor position first (explicit supervisor assignment)
    if (employee.supervisorPositionId) {
      const manager = await this.employeeModel
        .findOne({
          primaryPositionId: employee.supervisorPositionId,
          status: EmployeeStatus.ACTIVE,
        })
        .exec();

      if (manager) {
        return manager._id;
      }
    }

    // Try position hierarchy - if employee's position reports to another position
    if (employee.primaryPositionId) {
      const employeePosition = await this.positionModel
        .findById(employee.primaryPositionId)
        .exec();

      if (employeePosition && employeePosition.reportsToPositionId) {
        // Find the employee assigned to the position that this position reports to
        const manager = await this.employeeModel
          .findOne({
            primaryPositionId: employeePosition.reportsToPositionId,
            status: EmployeeStatus.ACTIVE,
          })
          .exec();

        if (manager) {
          return manager._id;
        }
      }
    }

    // Try department head
    if (employee.primaryDepartmentId) {
      const department = await this.departmentModel
        .findById(employee.primaryDepartmentId)
        .exec();

      if (department && department.headPositionId) {
        const manager = await this.employeeModel
          .findOne({
            primaryPositionId: department.headPositionId,
            status: EmployeeStatus.ACTIVE,
          })
          .exec();

        if (manager) {
          return manager._id;
        }
      }
    }

    return null;
  }

  /**
   * Manually assign template to specific employee(s)
   */
  async assignTemplateToEmployees(
    createDto: CreateAppraisalAssignmentDto,
  ): Promise<AppraisalAssignmentDocument[]> {
    // Validate template exists and is active
    const template = await this.templateModel
      .findById(createDto.templateId)
      .exec();
    if (!template || !template.isActive) {
      throw new BadRequestException('Template not found or inactive');
    }

    // Validate cycle if provided
    let cycleId: Types.ObjectId | undefined;
    if (createDto.cycleId) {
      const cycle = await this.cycleModel.findById(createDto.cycleId).exec();
      if (!cycle) {
        throw new NotFoundException(`Cycle with ID ${createDto.cycleId} not found`);
      }
      cycleId = cycle._id;
    }

    // Validate employees exist and are active
    const employees = await this.employeeModel
      .find({
        _id: { $in: createDto.employeeProfileIds.map((id) => new Types.ObjectId(id)) },
        status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] },
      })
      .exec();

    if (employees.length !== createDto.employeeProfileIds.length) {
      throw new BadRequestException('Some employees not found or not eligible for assignment');
    }

    const assignments: AppraisalAssignmentDocument[] = [];

    for (const employee of employees) {
      // Check for duplicate assignment
      const duplicateQuery: any = {
        templateId: new Types.ObjectId(createDto.templateId),
        employeeProfileId: employee._id,
      };
      if (cycleId) {
        duplicateQuery.cycleId = cycleId;
      }

      const existing = await this.assignmentModel.findOne(duplicateQuery).exec();
      if (existing) {
        continue; // Skip if already assigned
      }

      // Determine manager
      let managerId: Types.ObjectId;
      if (createDto.managerProfileId) {
        const manager = await this.employeeModel
          .findById(createDto.managerProfileId)
          .exec();
        if (!manager) {
          throw new NotFoundException(`Manager with ID ${createDto.managerProfileId} not found`);
        }
        managerId = manager._id;
      } else {
        const determinedManager = await this.determineManagerForEmployee(employee);
        if (!determinedManager) {
          continue; // Skip if no manager found
        }
        managerId = determinedManager;
      }

      // Create assignment
      const assignmentData: any = {
        templateId: new Types.ObjectId(createDto.templateId),
        employeeProfileId: employee._id,
        managerProfileId: managerId,
        departmentId: employee.primaryDepartmentId || new Types.ObjectId(),
        positionId: employee.primaryPositionId,
        status: AppraisalAssignmentStatus.NOT_STARTED,
        assignedAt: new Date(),
      };

      if (cycleId) {
        assignmentData.cycleId = cycleId;
      }
      if (createDto.dueDate) {
        assignmentData.dueDate = new Date(createDto.dueDate);
      }

      const assignment = new this.assignmentModel(assignmentData);
      await assignment.save();
      assignments.push(assignment);
    }

    return assignments;
  }

  /**
   * Bulk assign template to departments, positions, or employees
   */
  async bulkAssignTemplate(
    bulkDto: BulkAssignTemplateDto,
  ): Promise<AppraisalAssignmentDocument[]> {
    // Validate template exists and is active
    const template = await this.templateModel
      .findById(bulkDto.templateId)
      .exec();
    if (!template || !template.isActive) {
      throw new BadRequestException('Template not found or inactive');
    }

    // Validate cycle if provided
    let cycleId: Types.ObjectId | undefined;
    if (bulkDto.cycleId) {
      const cycle = await this.cycleModel.findById(bulkDto.cycleId).exec();
      if (!cycle) {
        throw new NotFoundException(`Cycle with ID ${bulkDto.cycleId} not found`);
      }
      cycleId = cycle._id;
    }

    // Build employee query
    const employeeQuery: any = {
      status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] },
    };

    if (bulkDto.departmentIds && bulkDto.departmentIds.length > 0) {
      employeeQuery.primaryDepartmentId = {
        $in: bulkDto.departmentIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (bulkDto.positionIds && bulkDto.positionIds.length > 0) {
      employeeQuery.primaryPositionId = {
        $in: bulkDto.positionIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (bulkDto.employeeProfileIds && bulkDto.employeeProfileIds.length > 0) {
      employeeQuery._id = {
        $in: bulkDto.employeeProfileIds.map((id) => new Types.ObjectId(id)),
      };
    }

    const employees = await this.employeeModel.find(employeeQuery).exec();
    if (employees.length === 0) {
      throw new BadRequestException('No eligible employees found for assignment');
    }

    const assignments: AppraisalAssignmentDocument[] = [];

    for (const employee of employees) {
      // Check for duplicate assignment
      const duplicateQuery: any = {
        templateId: new Types.ObjectId(bulkDto.templateId),
        employeeProfileId: employee._id,
      };
      if (cycleId) {
        duplicateQuery.cycleId = cycleId;
      }

      const existing = await this.assignmentModel.findOne(duplicateQuery).exec();
      if (existing) {
        continue; // Skip if already assigned
      }

      // Determine manager
      let managerId: Types.ObjectId;
      if (bulkDto.managerProfileId) {
        const manager = await this.employeeModel
          .findById(bulkDto.managerProfileId)
          .exec();
        if (!manager) {
          throw new NotFoundException(`Manager with ID ${bulkDto.managerProfileId} not found`);
        }
        managerId = manager._id;
      } else {
        const determinedManager = await this.determineManagerForEmployee(employee);
        if (!determinedManager) {
          continue; // Skip if no manager found
        }
        managerId = determinedManager;
      }

      // Create assignment
      const assignmentData: any = {
        templateId: new Types.ObjectId(bulkDto.templateId),
        employeeProfileId: employee._id,
        managerProfileId: managerId,
        departmentId: employee.primaryDepartmentId || new Types.ObjectId(),
        positionId: employee.primaryPositionId,
        status: AppraisalAssignmentStatus.NOT_STARTED,
        assignedAt: new Date(),
      };

      if (cycleId) {
        assignmentData.cycleId = cycleId;
      }
      if (bulkDto.dueDate) {
        assignmentData.dueDate = new Date(bulkDto.dueDate);
      }

      const assignment = new this.assignmentModel(assignmentData);
      await assignment.save();
      assignments.push(assignment);
    }

    return assignments;
  }

  /**
   * Update an assignment
   */
  async updateAssignment(
    id: string,
    updateDto: UpdateAppraisalAssignmentDto,
  ): Promise<AppraisalAssignmentDocument> {
    const assignment = await this.findAssignmentById(id);

    // Validate template if being updated
    if (updateDto.templateId) {
      const template = await this.templateModel.findById(updateDto.templateId).exec();
      if (!template || !template.isActive) {
        throw new BadRequestException('Template not found or inactive');
      }
      assignment.templateId = new Types.ObjectId(updateDto.templateId);
    }

    // Validate manager if being updated
    if (updateDto.managerProfileId) {
      const manager = await this.employeeModel
        .findById(updateDto.managerProfileId)
        .exec();
      if (!manager) {
        throw new NotFoundException(`Manager with ID ${updateDto.managerProfileId} not found`);
      }
      assignment.managerProfileId = new Types.ObjectId(updateDto.managerProfileId);
    }

    if (updateDto.dueDate) {
      assignment.dueDate = new Date(updateDto.dueDate);
    }

    if (updateDto.status) {
      assignment.status = updateDto.status;
    }

    return assignment.save();
  }

  /**
   * Remove an assignment
   */
  async removeAssignment(id: string): Promise<void> {
    const assignment = await this.findAssignmentById(id);

    // Check if assignment can be removed (not submitted/published)
    if (
      assignment.status === AppraisalAssignmentStatus.SUBMITTED ||
      assignment.status === AppraisalAssignmentStatus.PUBLISHED ||
      assignment.status === AppraisalAssignmentStatus.ACKNOWLEDGED
    ) {
      throw new BadRequestException(
        `Cannot remove assignment with status: ${assignment.status}`,
      );
    }

    await this.assignmentModel.findByIdAndDelete(id).exec();
  }

  // ==================== APPRAISAL EVALUATION METHODS ====================

  /**
   * Create or update an appraisal evaluation
   */
  async createOrUpdateEvaluation(
    cycleId: string,
    employeeId: string,
    createDto: CreateAppraisalEvaluationDto,
    reviewerId?: string,
  ): Promise<AppraisalRecordDocument> {
    const cycle = await this.findCycleById(cycleId);

    // Check if cycle is active
    if (cycle.status !== AppraisalCycleStatus.ACTIVE) {
      throw new BadRequestException(
        'Cannot modify evaluation for inactive cycle',
      );
    }

    // Verify assignment exists
    const assignment = await this.assignmentModel
      .findOne({
        cycleId: new Types.ObjectId(cycleId),
        employeeProfileId: new Types.ObjectId(employeeId),
      })
      .exec();
    if (!assignment) {
      throw new NotFoundException(
        `No assignment found for employee ${employeeId} in cycle ${cycleId}`,
      );
    }

    // Verify that the reviewer is authorized (Line Manager/DEPARTMENT_HEAD, assigned manager, or HR)
    if (reviewerId) {
      const reviewerObjectId = new Types.ObjectId(reviewerId);
      const isAssignedManager = assignment.managerProfileId.equals(reviewerObjectId);
      
      if (!isAssignedManager) {
        // Check if reviewer has appropriate role (DEPARTMENT_HEAD, HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN)
        const reviewer = await this.employeeModel
          .findById(reviewerId)
          .populate('accessProfileId')
          .exec();
        
        if (!reviewer) {
          throw new BadRequestException('Reviewer not found');
        }

        // Get reviewer's roles from EmployeeSystemRole
        let hasAuthorizedRole = false;
        if (reviewer.accessProfileId) {
          const systemRole = await this.employeeModel.db
            .collection('employee_system_roles')
            .findOne({ _id: reviewer.accessProfileId });
          
          if (systemRole && systemRole.roles) {
            const reviewerRoles = systemRole.roles as string[];
            hasAuthorizedRole = [
              'department head', // SystemRole.DEPARTMENT_HEAD
              'HR Manager',      // SystemRole.HR_MANAGER
              'HR Admin',        // SystemRole.HR_ADMIN
              'System Admin',    // SystemRole.SYSTEM_ADMIN
            ].some(role => reviewerRoles.includes(role));
          }
        }

        if (!hasAuthorizedRole) {
          throw new BadRequestException(
            'You are not authorized to review this employee. Only Line Managers (Department Heads), assigned managers, or HR staff can review appraisals.',
          );
        }
      }
    }

    if (assignment.status === AppraisalAssignmentStatus.ACKNOWLEDGED) {
      throw new BadRequestException('Cannot modify completed evaluation');
    }

    // Get template to calculate scores
    const template = await this.findTemplateById(createDto.templateId);

    // Convert manager evaluation to ratings array (AppraisalRecord uses ratings, not managerEvaluation)
    const ratings = this.convertEvaluationToRatings(
      createDto.managerEvaluation,
      template as any,
    );

    // Calculate total score
    const totalScore = this.calculateTotalScore(ratings, template as any);

    // Check if evaluation already exists
    let evaluation = await this.evaluationModel
      .findOne({
        cycleId: new Types.ObjectId(cycleId),
        employeeProfileId: new Types.ObjectId(employeeId),
      })
      .exec();

    if (evaluation) {
      // Update existing evaluation
      evaluation.ratings = ratings;
      evaluation.totalScore = totalScore;
      evaluation.managerSummary =
        createDto.managerEvaluation?.strengths || evaluation.managerSummary;
      evaluation.strengths =
        createDto.managerEvaluation?.strengths || evaluation.strengths;
      evaluation.improvementAreas =
        createDto.managerEvaluation?.areasForImprovement ||
        evaluation.improvementAreas;
      evaluation.managerSubmittedAt = new Date();
      evaluation.status = AppraisalRecordStatus.MANAGER_SUBMITTED;
    } else {
      // Create new evaluation
      evaluation = new this.evaluationModel({
        assignmentId: assignment._id,
        cycleId: new Types.ObjectId(cycleId),
        templateId: new Types.ObjectId(createDto.templateId),
        employeeProfileId: new Types.ObjectId(employeeId),
        managerProfileId: assignment.managerProfileId,
        ratings,
        totalScore,
        managerSummary: createDto.managerEvaluation?.strengths,
        strengths: createDto.managerEvaluation?.strengths,
        improvementAreas: createDto.managerEvaluation?.areasForImprovement,
        managerSubmittedAt: new Date(),
        status: AppraisalRecordStatus.MANAGER_SUBMITTED,
      });
    }

    const savedEvaluation = await evaluation.save();

    // Update assignment status
    assignment.status = AppraisalAssignmentStatus.SUBMITTED;
    assignment.submittedAt = new Date();
    assignment.latestAppraisalId = savedEvaluation._id;
    await assignment.save();

    return savedEvaluation;
  }

  /**
   * Get evaluation by cycle and employee
   */
  async findEvaluationByCycleAndEmployee(
    cycleId: string,
    employeeId: string,
  ): Promise<AppraisalRecordDocument | null> {
    return this.evaluationModel
      .findOne({
        cycleId: new Types.ObjectId(cycleId),
        employeeProfileId: new Types.ObjectId(employeeId),
      })
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('templateId')
      .populate('cycleId')
      .populate('assignmentId')
      .exec();
  }

  /**
   * Get evaluation by ID
   */
  async findEvaluationById(id: string): Promise<AppraisalRecordDocument> {
    const evaluation = await this.evaluationModel
      .findById(id)
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('templateId')
      .populate('cycleId')
      .populate('assignmentId')
      .exec();
    if (!evaluation) {
      throw new NotFoundException(
        `Appraisal evaluation with ID ${id} not found`,
      );
    }
    return evaluation;
  }

  /**
   * Employee acknowledges appraisal
   */
  async acknowledgeEvaluation(
    evaluationId: string,
    comment?: string,
  ): Promise<AppraisalRecordDocument> {
    const evaluation = await this.findEvaluationById(evaluationId);

    if (evaluation.status !== AppraisalRecordStatus.HR_PUBLISHED) {
      throw new BadRequestException(
        `Cannot acknowledge evaluation. Current status: ${evaluation.status}`,
      );
    }

    evaluation.employeeAcknowledgedAt = new Date();
    evaluation.employeeAcknowledgementComment = comment;

    // Update assignment status
    const assignment = await this.assignmentModel
      .findOne({ latestAppraisalId: evaluation._id })
      .exec();
    if (assignment) {
      assignment.status = AppraisalAssignmentStatus.ACKNOWLEDGED;
      await assignment.save();
    }

    return evaluation.save();
  }

  /**
   * Convert evaluation DTO to ratings array for AppraisalRecord
   */
  private convertEvaluationToRatings(
    managerEvaluation: any,
    template: AppraisalTemplateDocument,
  ): any[] {
    const ratings: any[] = [];

    if (managerEvaluation?.sections) {
      managerEvaluation.sections.forEach((sectionRating: any) => {
        if (sectionRating.criteria) {
          sectionRating.criteria.forEach((criterionRating: any) => {
            // Normalize rating to percentage based on rating scale
            const { min, max } = template.ratingScale;
            const scaleRange = max - min;
            const ratingValue = criterionRating.rating || min;
            const normalizedPercentage = scaleRange > 0
              ? ((ratingValue - min) / scaleRange) * 100
              : 0;
            
            // Get criterion weight from template
            const criterion = template.criteria?.find(
              (c) => c.key === (criterionRating.criteriaId || criterionRating.key),
            );
            const weight = criterion?.weight || 0;
            
            ratings.push({
              key: criterionRating.criteriaId || criterionRating.key,
              title: criterionRating.title || criterion?.title || '',
              ratingValue: ratingValue,
              ratingLabel: this.getRatingLabel(
                ratingValue,
                template.ratingScale,
              ),
              weightedScore: weight > 0
                ? (normalizedPercentage * weight) / 100
                : 0,
              comments: criterionRating.comments,
            });
          });
        }
      });
    }

    return ratings;
  }

  /**
   * Calculate total score from ratings
   */
  private calculateTotalScore(
    ratings: any[],
    template: AppraisalTemplateDocument,
  ): number {
    if (ratings.length === 0) return 0;

    const totalWeightedScore = ratings.reduce((sum, rating) => {
      return sum + (rating.weightedScore || 0);
    }, 0);

    const totalWeight = template.criteria.reduce((sum, criterion) => {
      return sum + (criterion.weight || 0);
    }, 0);

    // weightedScore is already a percentage (0-100), so we just return the sum
    // If weights don't add up to 100%, normalize it
    return totalWeight > 0 ? totalWeightedScore : 0;
  }

  /**
   * Get rating label from rating value
   */
  private getRatingLabel(rating: number, ratingScale: any): string {
    if (!ratingScale.labels || ratingScale.labels.length === 0) {
      return rating.toString();
    }
    const index = Math.round(
      (rating - ratingScale.min) / (ratingScale.step || 1),
    );
    return (
      ratingScale.labels[Math.min(index, ratingScale.labels.length - 1)] ||
      rating.toString()
    );
  }

  /**
   * Convert self-assessment DTO to ratings array
   */
  private convertSelfAssessmentToRatings(
    selfAssessmentDto: SubmitSelfAssessmentDto,
    template: AppraisalTemplateDocument,
  ): any[] {
    const ratings: any[] = [];

    if (selfAssessmentDto.sections) {
      selfAssessmentDto.sections.forEach((section: any) => {
        if (section.criteria) {
          section.criteria.forEach((criterion: any) => {
            // Find the criterion in the template by matching criteriaId with key
            const templateCriterion = template.criteria?.find(
              (c) => c.key === (criterion.criteriaId || criterion.key),
            );

            // Get title from template criterion, fallback to criteriaId if not found
            const title = templateCriterion?.title || criterion.criteriaId || criterion.key || 'Unknown Criterion';

            ratings.push({
              key: criterion.criteriaId || criterion.key,
              title: title,
              ratingValue: criterion.rating || 0,
              ratingLabel: this.getRatingLabel(
                criterion.rating || 0,
                template.ratingScale,
              ),
              comments: criterion.comments || undefined,
            });
          });
        }
      });
    }

    return ratings;
  }

  // ==================== APPRAISAL DISPUTE METHODS ====================

  /**
   * Create a dispute for an appraisal evaluation
   */
  async createDispute(
    employeeId: string,
    createDto: CreateAppraisalDisputeDto,
  ): Promise<AppraisalDisputeDocument> {
    const evaluationId =
      (createDto as any).evaluationId || (createDto as any).appraisalId;
    if (!evaluationId) {
      throw new BadRequestException('evaluationId or appraisalId is required');
    }
    const evaluation = await this.findEvaluationById(evaluationId);

    // Verify the employee is the one who received the evaluation
    if (evaluation.employeeProfileId.toString() !== employeeId) {
      throw new BadRequestException('You can only dispute your own appraisals');
    }

    // Check if dispute already exists
    const existingDispute = await this.disputeModel
      .findOne({
        appraisalId: evaluation._id,
        status: {
          $in: [
            AppraisalDisputeStatus.OPEN,
            AppraisalDisputeStatus.UNDER_REVIEW,
          ],
        },
      })
      .exec();

    if (existingDispute) {
      throw new ConflictException(
        'An active dispute already exists for this evaluation',
      );
    }

    const assignment = await this.assignmentModel
      .findOne({ latestAppraisalId: evaluation._id })
      .exec();
    if (!assignment) {
      throw new NotFoundException('Assignment not found for this evaluation');
    }

    const dispute = new this.disputeModel({
      appraisalId: evaluation._id,
      assignmentId: assignment._id,
      cycleId: evaluation.cycleId,
      raisedByEmployeeId: new Types.ObjectId(employeeId),
      reason: createDto.disputeReason || (createDto as any).reason || '',
      details: createDto.additionalComments || (createDto as any).details,
      status: AppraisalDisputeStatus.OPEN,
      submittedAt: new Date(),
    });

    return dispute.save();
  }

  /**
   * Get all disputes
   */
  async findAllDisputes(
    status?: AppraisalDisputeStatus,
  ): Promise<AppraisalDisputeDocument[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.disputeModel
      .find(filter)
      .populate('appraisalId')
      .populate('raisedByEmployeeId')
      .populate('cycleId')
      .populate('assignmentId')
      .sort({ submittedAt: -1 })
      .exec();
  }

  /**
   * Get disputes for a specific employee
   */
  async findDisputesByEmployee(
    employeeId: string,
  ): Promise<AppraisalDisputeDocument[]> {
    return this.disputeModel
      .find({ raisedByEmployeeId: new Types.ObjectId(employeeId) })
      .populate('appraisalId')
      .populate('cycleId')
      .populate('assignmentId')
      .sort({ submittedAt: -1 })
      .exec();
  }

  /**
   * Get a single dispute by ID
   */
  async findDisputeById(id: string): Promise<AppraisalDisputeDocument> {
    const dispute = await this.disputeModel
      .findById(id)
      .populate('appraisalId')
      .populate('raisedByEmployeeId')
      .populate('cycleId')
      .populate('assignmentId')
      .populate('resolvedByEmployeeId')
      .populate('assignedReviewerEmployeeId')
      .exec();
    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }
    return dispute;
  }

  /**
   * Resolve a dispute (HR Manager action)
   */
  async resolveDispute(
    disputeId: string,
    reviewerId: string,
    resolveDto: ResolveAppraisalDisputeDto,
  ): Promise<AppraisalDisputeDocument> {
    const dispute = await this.findDisputeById(disputeId);

    if (
      dispute.status !== AppraisalDisputeStatus.OPEN &&
      dispute.status !== AppraisalDisputeStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        `Cannot resolve dispute. Current status: ${dispute.status}`,
      );
    }

    dispute.status =
      resolveDto.status === 'RESOLVED'
        ? AppraisalDisputeStatus.ADJUSTED
        : AppraisalDisputeStatus.REJECTED;
    dispute.resolutionSummary =
      resolveDto.resolutionNotes || (resolveDto as any).resolutionSummary;
    dispute.resolvedAt = new Date();
    dispute.resolvedByEmployeeId = new Types.ObjectId(reviewerId);

    // If adjusted, update the evaluation totalScore
    if (resolveDto.status === 'RESOLVED' && resolveDto.adjustedRating) {
      const evaluation = await this.findEvaluationById(
        dispute.appraisalId.toString(),
      );
      evaluation.totalScore = resolveDto.adjustedRating;
      await evaluation.save();
    }

    return dispute.save();
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get performance history for an employee
   */
  async getEmployeePerformanceHistory(
    employeeId: string,
  ): Promise<AppraisalRecordDocument[]> {
    return this.evaluationModel
      .find({ employeeProfileId: new Types.ObjectId(employeeId) })
      .populate('cycleId')
      .populate('templateId')
      .populate('managerProfileId')
      .populate('assignmentId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get cycle progress dashboard
   */
  async getCycleProgress(cycleId: string): Promise<any> {
    const assignments = await this.assignmentModel
      .find({ cycleId: new Types.ObjectId(cycleId) })
      .exec();

    const total = assignments.length;
    const notStarted = assignments.filter(
      (a) => a.status === AppraisalAssignmentStatus.NOT_STARTED,
    ).length;
    const inProgress = assignments.filter(
      (a) => a.status === AppraisalAssignmentStatus.IN_PROGRESS,
    ).length;
    const submitted = assignments.filter(
      (a) => a.status === AppraisalAssignmentStatus.SUBMITTED,
    ).length;
    const acknowledged = assignments.filter(
      (a) => a.status === AppraisalAssignmentStatus.ACKNOWLEDGED,
    ).length;

    return {
      total,
      notStarted,
      inProgress,
      submitted,
      acknowledged,
      completed: acknowledged,
      completionRate: total > 0 ? (acknowledged / total) * 100 : 0,
    };
  }

  // ==================== SELF-ASSESSMENT METHODS ====================

  /**
   * Submit self-assessment for an evaluation
   */
  async submitSelfAssessment(
    cycleId: string,
    employeeId: string,
    selfAssessmentDto: SubmitSelfAssessmentDto,
  ): Promise<AppraisalRecordDocument> {
    const cycle = await this.findCycleById(cycleId);

    // Allow submission for both PLANNED and ACTIVE cycles
    // PLANNED allows employees to start early, ACTIVE is the official period
    if (
      cycle.status !== AppraisalCycleStatus.ACTIVE &&
      cycle.status !== AppraisalCycleStatus.PLANNED
    ) {
      throw new BadRequestException(
        `Cannot submit self-assessment. Cycle status must be PLANNED or ACTIVE, but is currently ${cycle.status}`,
      );
    }

    const assignment = await this.assignmentModel
      .findOne({
        cycleId: new Types.ObjectId(cycleId),
        employeeProfileId: new Types.ObjectId(employeeId),
      })
      .exec();
    if (!assignment) {
      throw new NotFoundException(
        `No assignment found for employee ${employeeId} in cycle ${cycleId}`,
      );
    }

    if (
      assignment.status !== AppraisalAssignmentStatus.IN_PROGRESS &&
      assignment.status !== AppraisalAssignmentStatus.NOT_STARTED
    ) {
      throw new BadRequestException(
        `Cannot submit self-assessment. Current status: ${assignment.status}`,
      );
    }

    // Get template from assignment
    const template = await this.findTemplateById(
      assignment.templateId.toString(),
    );

    // Get or create evaluation
    let evaluation = await this.evaluationModel
      .findOne({
        cycleId: new Types.ObjectId(cycleId),
        employeeProfileId: new Types.ObjectId(employeeId),
      })
      .exec();

    // Convert self-assessment to ratings (AppraisalRecord uses ratings, not selfAssessment)
    const ratings = this.convertSelfAssessmentToRatings(
      selfAssessmentDto,
      template as any,
    );

    if (evaluation) {
      evaluation.ratings = ratings;
      evaluation.status = AppraisalRecordStatus.DRAFT;
    } else {
      evaluation = new this.evaluationModel({
        assignmentId: assignment._id,
        cycleId: new Types.ObjectId(cycleId),
        templateId: assignment.templateId,
        employeeProfileId: new Types.ObjectId(employeeId),
        managerProfileId: assignment.managerProfileId,
        ratings,
        status: AppraisalRecordStatus.DRAFT,
      });
    }

    // Update assignment status
    assignment.status = AppraisalAssignmentStatus.IN_PROGRESS;
    await assignment.save();

    return evaluation.save();
  }

  // ==================== HR REVIEW METHODS ====================

  /**
   * Add HR review to an evaluation
   */
  async addHrReview(
    evaluationId: string,
    hrReviewDto: AddHrReviewDto,
  ): Promise<AppraisalRecordDocument> {
    const evaluation = await this.findEvaluationById(evaluationId);

    if (
      evaluation.status !== AppraisalRecordStatus.MANAGER_SUBMITTED &&
      evaluation.status !== AppraisalRecordStatus.HR_PUBLISHED
    ) {
      throw new BadRequestException(
        `Cannot add HR review. Current status: ${evaluation.status}`,
      );
    }

    // AppraisalRecord doesn't have hrReview field, but we can update totalScore if adjusted
    if (hrReviewDto.adjustedRating !== undefined) {
      evaluation.totalScore = hrReviewDto.adjustedRating;
    }

    // Update status and published info
    evaluation.status = AppraisalRecordStatus.HR_PUBLISHED;
    evaluation.hrPublishedAt = new Date();
    evaluation.publishedByEmployeeId = new Types.ObjectId(
      hrReviewDto.reviewedBy,
    );

    return evaluation.save();
  }

  // ==================== PERFORMANCE GOAL METHODS ====================

  /**
   * Create a performance goal
   */
  async createGoal(createDto: CreatePerformanceGoalDto): Promise<any> {
    // Note: PerformanceGoal schema doesn't exist
    throw new BadRequestException(
      'Performance goals feature not yet implemented',
    );
  }

  async findGoalsByEmployee(employeeId: string, status?: any): Promise<any[]> {
    // Note: PerformanceGoal schema doesn't exist
    throw new BadRequestException(
      'Performance goals feature not yet implemented',
    );
  }

  async findGoalById(id: string): Promise<any> {
    // Note: PerformanceGoal schema doesn't exist
    throw new BadRequestException(
      'Performance goals feature not yet implemented',
    );
  }

  async updateGoal(
    id: string,
    updateDto: UpdatePerformanceGoalDto,
  ): Promise<any> {
    // Note: PerformanceGoal schema doesn't exist
    throw new BadRequestException(
      'Performance goals feature not yet implemented',
    );
  }

  async deleteGoal(id: string): Promise<void> {
    // Note: PerformanceGoal schema doesn't exist
    throw new BadRequestException(
      'Performance goals feature not yet implemented',
    );
  }

  async createFeedback(createDto: CreatePerformanceFeedbackDto): Promise<any> {
    // Note: PerformanceFeedback schema doesn't exist
    throw new BadRequestException(
      'Performance feedback feature not yet implemented',
    );
  }

  async findFeedbackByRecipient(
    employeeId: string,
    status?: any,
  ): Promise<any[]> {
    // Note: PerformanceFeedback schema doesn't exist
    throw new BadRequestException(
      'Performance feedback feature not yet implemented',
    );
  }

  async findFeedbackById(id: string): Promise<any> {
    // Note: PerformanceFeedback schema doesn't exist
    throw new BadRequestException(
      'Performance feedback feature not yet implemented',
    );
  }

  async updateFeedback(
    id: string,
    updateDto: UpdatePerformanceFeedbackDto,
  ): Promise<any> {
    // Note: PerformanceFeedback schema doesn't exist
    throw new BadRequestException(
      'Performance feedback feature not yet implemented',
    );
  }

  async deleteFeedback(id: string): Promise<void> {
    // Note: PerformanceFeedback schema doesn't exist
    throw new BadRequestException(
      'Performance feedback feature not yet implemented',
    );
  }
}
