import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  OnModuleInit,
  Logger,
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
import {
  EmployeeStatus,
  SystemRole,
} from '../employee-profile/enums/employee-profile.enums';
import {
  NotificationLog,
  NotificationLogDocument,
} from '../time-management/models/notification-log.schema';
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
import { CreatePerformanceImprovementPlanDto } from './dto/create-performance-improvement-plan.dto';
import { UpdatePerformanceImprovementPlanDto } from './dto/update-performance-improvement-plan.dto';
import {
  CreateOneOnOneMeetingDto,
  UpdateOneOnOneMeetingDto,
  OneOnOneMeetingDto,
  MeetingStatus,
} from './dto/one-on-one-meeting.dto';
import {
  CreateVisibilityRuleDto,
  UpdateVisibilityRuleDto,
  VisibilityRuleDto,
  FeedbackFieldType,
} from './dto/visibility-rule.dto';
import { PerformanceGoalDto, GoalStatus } from './dto/performance-goal.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class PerformanceService implements OnModuleInit {
  private readonly logger = new Logger(PerformanceService.name);
  private visibilityRulesBucket: GridFSBucket;
  private meetingsBucket: GridFSBucket;
  private goalsBucket: GridFSBucket;
  private readonly VISIBILITY_RULES_FILENAME = 'visibility-rules.json';
  private readonly MEETINGS_FILENAME = 'one-on-one-meetings.json';
  private readonly GOALS_FILENAME = 'performance-goals.json';

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
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
    @InjectConnection() private connection: Connection,
  ) {
    // Initialize GridFS buckets
    this.visibilityRulesBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'visibility_rules',
    });
    this.meetingsBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'one_on_one_meetings',
    });
    this.goalsBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'performance_goals',
    });
  }

  /**
   * Fix MongoDB indexes on module initialization
   * This ensures the cycleCode index is sparse (allows multiple nulls)
   */
  async onModuleInit() {
    // Fix cycleCode index
    try {
      const cycleCollection = this.cycleModel.collection;
      
      // Get all indexes
      const indexes = await cycleCollection.indexes();
      const cycleCodeIndex = indexes.find(idx => idx.key?.cycleCode !== undefined);
      
      if (cycleCodeIndex) {
        // Check if it's already sparse
        if (!cycleCodeIndex.sparse) {
          this.logger.log('Fixing cycleCode index: making it sparse to allow multiple nulls');
          
          // Drop the existing non-sparse index
          try {
            await cycleCollection.dropIndex(cycleCodeIndex.name);
          } catch (err: any) {
            // Index might not exist or have different name
            if (!err.message?.includes('index not found')) {
              this.logger.warn(`Could not drop cycleCode index: ${err.message}`);
            }
          }
          
          // Create sparse unique index (allows multiple nulls)
          await cycleCollection.createIndex(
            { cycleCode: 1 },
            { unique: true, sparse: true, name: 'cycleCode_1' }
          );
          
          this.logger.log('Successfully fixed cycleCode index');
        }
      }
    } catch (error: any) {
      this.logger.warn(`Could not fix cycleCode index: ${error.message}`);
      // Don't throw - allow app to start even if index fix fails
    }

    // Fix templateCode index (legacy index that should be removed)
    try {
      const templateCollection = this.templateModel.collection;
      
      // Get all indexes
      const indexes = await templateCollection.indexes();
      const templateCodeIndex = indexes.find(idx => idx.key?.templateCode !== undefined);
      
      if (templateCodeIndex) {
        this.logger.log('Found legacy templateCode index, removing it...');
        
        // Drop the legacy templateCode index (it's not needed anymore)
        try {
          await templateCollection.dropIndex(templateCodeIndex.name);
          this.logger.log(`Successfully removed legacy templateCode index: ${templateCodeIndex.name}`);
        } catch (err: any) {
          // Index might not exist or have different name
          if (!err.message?.includes('index not found')) {
            this.logger.warn(`Could not drop templateCode index: ${err.message}`);
          }
        }
      }
    } catch (error: any) {
      this.logger.warn(`Could not fix templateCode index: ${error.message}`);
      // Don't throw - allow app to start even if index fix fails
    }

    // Fix evaluationId index (legacy index in disputes collection that should be removed)
    // The schema uses 'appraisalId' not 'evaluationId'
    try {
      const disputeCollection = this.disputeModel.collection;
      
      // Get all indexes
      const indexes = await disputeCollection.indexes();
      const evaluationIdIndex = indexes.find(idx => idx.key?.evaluationId !== undefined);
      
      if (evaluationIdIndex) {
        this.logger.log('Found legacy evaluationId index in disputes collection, removing it...');
        
        // Drop the legacy evaluationId index (it's not needed anymore)
        try {
          await disputeCollection.dropIndex(evaluationIdIndex.name);
          this.logger.log(`Successfully removed legacy evaluationId index: ${evaluationIdIndex.name}`);
        } catch (err: any) {
          // Index might not exist or have different name
          if (!err.message?.includes('index not found')) {
            this.logger.warn(`Could not drop evaluationId index: ${err.message}`);
          }
        }
      }
    } catch (error: any) {
      this.logger.warn(`Could not fix evaluationId index: ${error.message}`);
      // Don't throw - allow app to start even if index fix fails
    }
  }

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

    try {
      const template = new this.templateModel(templateData);
      return await template.save();
    } catch (error: unknown) {
      // Handle duplicate key errors with better messages
      if (error && typeof error === 'object' && 'code' in error) {
        const mongoError = error as { 
          code: number; 
          keyPattern?: Record<string, number>;
          keyValue?: Record<string, any>;
        };
        if (mongoError.code === 11000) {
          // Handle duplicate name error
          if (mongoError.keyPattern?.name) {
            throw new ConflictException(
              `Template with name "${createDto.name}" already exists. Please use a different name.`
            );
          }
          // Handle legacy templateCode index error
          if (mongoError.keyPattern?.templateCode) {
            throw new BadRequestException(
              'Database configuration error: A legacy index on "templateCode" is causing conflicts. ' +
              'Please contact the system administrator to remove the legacy index. ' +
              'The index should be dropped from MongoDB: db.appraisal_templates.dropIndex("templateCode_1")'
            );
          }
          // Generic duplicate key error
          throw new ConflictException(
            'A template with this information already exists. Please check for duplicates.'
          );
        }
      }
      // Re-throw other errors
      throw error;
    }
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

    try {
      const result = await cycle.save();
      return result as AppraisalCycleDocument;
    } catch (error: unknown) {
      // Handle duplicate key errors with better messages
      if (error && typeof error === 'object' && 'code' in error) {
        const mongoError = error as { code: number; keyPattern?: Record<string, number> };
        if (mongoError.code === 11000) {
          if (mongoError.keyPattern?.name) {
            throw new BadRequestException(
              `A cycle with the name "${cycleName}" already exists. Please use a different name.`
            );
          }
          if (mongoError.keyPattern?.cycleCode) {
            throw new BadRequestException(
              'Database index error. The cycleCode index will be automatically fixed on next server restart.'
            );
          }
        }
      }
      throw error;
    }
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
    const cycle = await this.findCycleById(id);
    
    const updateData: any = {};

    // Update basic fields
    if (updateDto.cycleName !== undefined) {
      updateData.name = updateDto.cycleName;
    }
    if (updateDto.description !== undefined) {
      updateData.description = updateDto.description;
    }
    if (updateDto.appraisalType !== undefined) {
      updateData.cycleType = updateDto.appraisalType;
    }
    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate);
    }
    if (updateDto.managerReviewDeadline) {
      updateData.managerDueDate = new Date(updateDto.managerReviewDeadline);
    }
    if (updateDto.status) {
      updateData.status = updateDto.status;
    }

    // Handle templateAssignments update if templateId is provided
    if (updateDto.templateId) {
      const templateId = new Types.ObjectId(updateDto.templateId);
      const departmentIds = updateDto.targetDepartmentIds
        ? updateDto.targetDepartmentIds.map((id) => new Types.ObjectId(id))
        : [];

      // Update or create templateAssignments
      updateData.templateAssignments = [
        {
          templateId,
          departmentIds,
        },
      ];
    } else if (updateDto.targetDepartmentIds !== undefined) {
      // Only update departmentIds if templateId is not provided
      // Keep existing templateId but update departmentIds
      if (cycle.templateAssignments && cycle.templateAssignments.length > 0) {
        const existingTemplateId = cycle.templateAssignments[0].templateId;
        updateData.templateAssignments = [
          {
            templateId: existingTemplateId,
            departmentIds: updateDto.targetDepartmentIds.map((id) => new Types.ObjectId(id)),
          },
        ];
      }
    }

    const updated = await this.cycleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('templateAssignments.templateId')
      .populate('templateAssignments.departmentIds')
      .exec();
    if (!updated) {
      throw new NotFoundException(`Cycle with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Activate a cycle
   * REQ-PP-02: HR Manager defines and schedules appraisal cycles.
   * Activation only changes status - assignments are done separately by HR Employee (REQ-PP-05)
   */
  async activateCycle(id: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.findCycleById(id);

    if (cycle.status !== AppraisalCycleStatus.PLANNED) {
      throw new BadRequestException(
        `Cannot activate cycle. Current status: ${cycle.status}`,
      );
    }

    // Only change status to ACTIVE
    // Assignments are done separately by HR Employee using the Assignments tab (REQ-PP-05)
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
      // Skip if employee has no primary department (required for organizational tracking)
      if (!employee.primaryDepartmentId) {
        this.logger.warn(
          `Skipping employee ${employee._id} (${employee.employeeNumber || 'N/A'}): No primary department assigned. Employee must be assigned to a department to receive appraisals.`,
        );
        continue;
      }

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
        this.logger.warn(
          `Skipping employee ${employee._id} (${employee.employeeNumber || 'N/A'}): No manager found. Employee must have a manager to receive appraisals.`,
        );
        continue;
      }

      // Create assignment document
      const assignmentData = {
        cycleId: cycle._id,
        templateId: templateAssignment.templateId,
        employeeProfileId: employee._id,
        managerProfileId: managerId,
        departmentId: employee.primaryDepartmentId,
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
        `Cannot publish cycle. Current status: ${cycle.status}. Only ACTIVE cycles can be published.`,
      );
    }

    // Allow republishing to include late submissions
    // Only publish evaluations that are ready (MANAGER_SUBMITTED) and not already published
    const publishDate = new Date();
    
    // Update evaluations that are ready for publishing (MANAGER_SUBMITTED) but not yet published
    const evaluationsResult = await this.evaluationModel
      .updateMany(
        {
          cycleId: new Types.ObjectId(id),
          status: AppraisalRecordStatus.MANAGER_SUBMITTED,
          hrPublishedAt: { $exists: false }, // Only update if not already published
        },
        {
          status: AppraisalRecordStatus.HR_PUBLISHED,
          hrPublishedAt: publishDate,
        },
      )
      .exec();

    // Update assignments that are SUBMITTED but not yet PUBLISHED
    // This includes late submissions after initial publish
    const assignmentsResult = await this.assignmentModel
      .updateMany(
        {
          cycleId: new Types.ObjectId(id),
          status: AppraisalAssignmentStatus.SUBMITTED,
          publishedAt: { $exists: false }, // Only update if not already published
        },
        {
          status: AppraisalAssignmentStatus.PUBLISHED,
          publishedAt: publishDate,
        },
      )
      .exec();

    // Set publishedAt on cycle if this is the first publish
    if (!cycle.publishedAt) {
      cycle.publishedAt = publishDate;
    }

    this.logger.log(
      `Published cycle ${id}: ${evaluationsResult.modifiedCount} evaluations, ${assignmentsResult.modifiedCount} assignments`,
    );

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

  /**
   * Delete a cycle
   * Only allows deletion of PLANNED cycles with no assignments
   * REQ-PP-02: HR Manager defines and schedules appraisal cycles.
   */
  async deleteCycle(id: string): Promise<void> {
    const cycle = await this.findCycleById(id);

    // Only allow deletion of PLANNED cycles
    if (cycle.status !== AppraisalCycleStatus.PLANNED) {
      throw new BadRequestException(
        `Cannot delete cycle. Only PLANNED cycles can be deleted. Current status: ${cycle.status}`,
      );
    }

    // Check if there are any assignments for this cycle
    const assignmentCount = await this.assignmentModel
      .countDocuments({ cycleId: new Types.ObjectId(id) })
      .exec();

    if (assignmentCount > 0) {
      throw new BadRequestException(
        `Cannot delete cycle. There are ${assignmentCount} assignment(s) associated with this cycle. Please remove assignments first.`,
      );
    }

    // Check if there are any evaluations for this cycle
    const evaluationCount = await this.evaluationModel
      .countDocuments({ cycleId: new Types.ObjectId(id) })
      .exec();

    if (evaluationCount > 0) {
      throw new BadRequestException(
        `Cannot delete cycle. There are ${evaluationCount} evaluation(s) associated with this cycle.`,
      );
    }

    // Safe to delete
    await this.cycleModel.findByIdAndDelete(id).exec();
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
      .populate('employeeProfileId', 'firstName lastName fullName employeeNumber')
      .populate('managerProfileId', 'firstName lastName fullName employeeNumber')
      .populate('templateId', 'name')
      .populate('cycleId', 'name status')
      .populate('departmentId', 'name code')
      .populate('positionId', 'title code')
      .sort({ assignedAt: -1 })
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
    const skippedEmployees: string[] = [];

    for (const employee of employees) {
      // Skip if employee has no primary department (required for organizational tracking)
      if (!employee.primaryDepartmentId) {
        skippedEmployees.push(
          employee.employeeNumber || employee._id.toString(),
        );
        this.logger.warn(
          `Skipping employee ${employee._id} (${employee.employeeNumber || 'N/A'}): No primary department assigned. Employee must be assigned to a department to receive appraisals.`,
        );
        continue;
      }

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
          this.logger.warn(
            `Skipping employee ${employee._id} (${employee.employeeNumber || 'N/A'}): No manager found. Employee must have a manager to receive appraisals.`,
          );
          continue; // Skip if no manager found
        }
        managerId = determinedManager;
      }

      // Create assignment
      const assignmentData: any = {
        templateId: new Types.ObjectId(createDto.templateId),
        employeeProfileId: employee._id,
        managerProfileId: managerId,
        departmentId: employee.primaryDepartmentId,
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

    // Log warning if any employees were skipped
    if (skippedEmployees.length > 0) {
      this.logger.warn(
        `Skipped ${skippedEmployees.length} employee(s) without departments: ${skippedEmployees.join(', ')}`,
      );
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
    const skippedEmployees: string[] = [];

    for (const employee of employees) {
      // Skip if employee has no primary department (required for organizational tracking)
      if (!employee.primaryDepartmentId) {
        skippedEmployees.push(
          employee.employeeNumber || employee._id.toString(),
        );
        this.logger.warn(
          `Skipping employee ${employee._id} (${employee.employeeNumber || 'N/A'}): No primary department assigned. Employee must be assigned to a department to receive appraisals.`,
        );
        continue;
      }

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
          this.logger.warn(
            `Skipping employee ${employee._id} (${employee.employeeNumber || 'N/A'}): No manager found. Employee must have a manager to receive appraisals.`,
          );
          continue; // Skip if no manager found
        }
        managerId = determinedManager;
      }

      // Create assignment
      const assignmentData: any = {
        templateId: new Types.ObjectId(bulkDto.templateId),
        employeeProfileId: employee._id,
        managerProfileId: managerId,
        departmentId: employee.primaryDepartmentId,
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

    // Log warning if any employees were skipped
    if (skippedEmployees.length > 0) {
      this.logger.warn(
        `Skipped ${skippedEmployees.length} employee(s) without departments: ${skippedEmployees.join(', ')}`,
      );
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

    // Verify that the reviewer is authorized (Line Manager/DEPARTMENT_HEAD only)
    // REQ-AE-03: Line Manager completes structured appraisal ratings for direct reports.
    if (reviewerId) {
      const reviewerObjectId = new Types.ObjectId(reviewerId);
      const isAssignedManager = assignment.managerProfileId.equals(reviewerObjectId);
      
      if (!isAssignedManager) {
        // Only allow DEPARTMENT_HEAD (Line Manager) to review appraisals
        // HR roles are not allowed for regular evaluations (only for dispute resolution - REQ-OD-07)
        const reviewer = await this.employeeModel
          .findById(reviewerId)
          .populate('accessProfileId')
          .exec();
        
        if (!reviewer) {
          throw new BadRequestException('Reviewer not found');
        }

        // Get reviewer's roles from EmployeeSystemRole
        let isDepartmentHead = false;
        if (reviewer.accessProfileId) {
          const systemRole = await this.employeeModel.db
            .collection('employee_system_roles')
            .findOne({ _id: reviewer.accessProfileId });
          
          if (systemRole && systemRole.roles) {
            const reviewerRoles = systemRole.roles as string[];
            // Only allow DEPARTMENT_HEAD (Line Manager) - REQ-AE-03 specifies Line Manager only
            isDepartmentHead = reviewerRoles.includes('department head'); // SystemRole.DEPARTMENT_HEAD
          }
        }

        if (!isDepartmentHead) {
          throw new BadRequestException(
            'You are not authorized to review this employee. Only Line Managers (Department Heads) who are assigned as the manager can review appraisals. REQ-AE-03: Line Manager completes structured appraisal ratings for direct reports.',
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
   * Applies visibility rules based on user role
   */
  async findEvaluationById(
    id: string,
    userRoles?: SystemRole | SystemRole[],
  ): Promise<AppraisalRecordDocument> {
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

    // Apply visibility rules if user roles are provided
    if (userRoles) {
      const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
      this.logger.debug(`Applying visibility rules for evaluation ${id} with user roles: [${rolesArray.join(', ')}]`);
      await this.applyVisibilityRules(evaluation, userRoles);
    } else {
      this.logger.warn(`No user roles provided for evaluation ${id}, visibility rules not applied`);
    }

    return evaluation;
  }

  /**
   * Apply visibility rules to an appraisal record
   * Removes fields that the user's role is not allowed to see
   * @param evaluation The appraisal record to filter
   * @param userRoles Array of user roles (check all roles, user may have multiple)
   */
  private async applyVisibilityRules(
    evaluation: AppraisalRecordDocument,
    userRoles: SystemRole | SystemRole[],
  ): Promise<void> {
    // Normalize to array
    const roles = Array.isArray(userRoles) ? userRoles : [userRoles];
    // Helper to check if any of the user's roles can view the field
    const canViewFieldWithAnyRole = async (fieldType: FeedbackFieldType): Promise<boolean> => {
      for (const role of roles) {
        const canView = await this.canViewField(fieldType, role);
        if (canView) {
          this.logger.debug(`User with role ${role} can view ${fieldType}`);
          return true;
        }
      }
      this.logger.debug(`User with roles [${roles.join(', ')}] cannot view ${fieldType}`);
      return false;
    };

    // Check each field type and remove if not allowed
    const canSeeManagerSummary = await canViewFieldWithAnyRole(FeedbackFieldType.MANAGER_SUMMARY);
    if (!canSeeManagerSummary) {
      evaluation.managerSummary = undefined;
    }

    const canSeeStrengths = await canViewFieldWithAnyRole(FeedbackFieldType.STRENGTHS);
    if (!canSeeStrengths) {
      evaluation.strengths = undefined;
    }

    const canSeeImprovementAreas = await canViewFieldWithAnyRole(FeedbackFieldType.IMPROVEMENT_AREAS);
    if (!canSeeImprovementAreas) {
      evaluation.improvementAreas = undefined;
    }

    const canSeeRatings = await canViewFieldWithAnyRole(FeedbackFieldType.RATINGS);
    if (!canSeeRatings) {
      evaluation.ratings = [];
    }

    const canSeeOverallScore = await canViewFieldWithAnyRole(FeedbackFieldType.OVERALL_SCORE);
    if (!canSeeOverallScore) {
      evaluation.totalScore = undefined;
      evaluation.overallRatingLabel = undefined;
    }

    const canSeeFinalRating = await canViewFieldWithAnyRole(FeedbackFieldType.FINAL_RATING);
    if (!canSeeFinalRating) {
      // Hide final rating (totalScore and overallRatingLabel) if restricted
      evaluation.totalScore = undefined;
      evaluation.overallRatingLabel = undefined;
    }

    const canSeeSelfAssessment = await canViewFieldWithAnyRole(FeedbackFieldType.SELF_ASSESSMENT);
    // Note: Self-assessment is typically stored in the assignment, not the evaluation
    // This would need to be handled separately if needed

    // Filter rating comments based on visibility
    if (evaluation.ratings && evaluation.ratings.length > 0) {
      const canSeeComments = await canViewFieldWithAnyRole(FeedbackFieldType.COMMENTS);
      if (!canSeeComments) {
        // Remove comments from each rating entry
        evaluation.ratings = evaluation.ratings.map((rating) => ({
          ...rating,
          comments: undefined,
        }));
      }
    }
  }

  /**
   * Employee acknowledges assignment (REQ-PP-07)
   * Changes status from NOT_STARTED to ACKNOWLEDGED
   */
  async acknowledgeAssignment(
    assignmentId: string,
    employeeId: string,
  ): Promise<AppraisalAssignmentDocument> {
    // Fetch assignment without populating to get raw ObjectId for comparison
    const assignment = await this.assignmentModel.findById(assignmentId).exec();
    
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    // Verify the employee is acknowledging their own assignment
    // Compare ObjectIds directly (more reliable than string comparison)
    const assignmentEmployeeId = assignment.employeeProfileId.toString();
    const userEmployeeId = new Types.ObjectId(employeeId).toString();
    
    if (assignmentEmployeeId !== userEmployeeId) {
      throw new ForbiddenException('You can only acknowledge your own assignments');
    }

    // Only allow acknowledgment if status is NOT_STARTED
    if (assignment.status !== AppraisalAssignmentStatus.NOT_STARTED) {
      throw new BadRequestException(
        `Cannot acknowledge assignment. Current status: ${assignment.status}. Only NOT_STARTED assignments can be acknowledged.`,
      );
    }

    assignment.status = AppraisalAssignmentStatus.ACKNOWLEDGED;
    return assignment.save();
  }

  /**
   * Employee acknowledges final published appraisal evaluation
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

    // Get the assignment first to check employee ID consistency
    const assignment = await this.assignmentModel
      .findOne({ latestAppraisalId: evaluation._id })
      .exec();
    if (!assignment) {
      throw new NotFoundException('Assignment not found for this evaluation');
    }

    // Verify the employee is the one who received the evaluation
    // Handle both populated (object) and unpopulated (ObjectId) cases
    const evaluationEmployeeId = (evaluation.employeeProfileId as any)?._id 
      ? (evaluation.employeeProfileId as any)._id.toString()
      : evaluation.employeeProfileId.toString();
    const assignmentEmployeeId = assignment.employeeProfileId.toString();
    const providedEmployeeId = employeeId.toString();
    
    // Log for debugging
    this.logger.debug(
      `Dispute creation check - Evaluation employee: ${evaluationEmployeeId}, Assignment employee: ${assignmentEmployeeId}, Provided: ${providedEmployeeId}`
    );
    
    // Check if the provided employeeId matches either the evaluation or assignment employee
    // This handles cases where there might be a mismatch between evaluation and assignment
    if (evaluationEmployeeId !== providedEmployeeId && assignmentEmployeeId !== providedEmployeeId) {
      throw new BadRequestException(
        `You can only dispute your own appraisals. Evaluation belongs to employee ${evaluationEmployeeId}, assignment belongs to ${assignmentEmployeeId}, but you provided ${providedEmployeeId}`
      );
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

    // Extract ObjectIds - handle both populated and unpopulated cases
    // Mongoose will handle the conversion, but we need to ensure we pass the right format
    const getObjectId = (value: any): Types.ObjectId => {
      if (!value) {
        throw new BadRequestException('Missing required ID field');
      }
      if (value instanceof Types.ObjectId) {
        return value;
      }
      if (value._id) {
        return value._id instanceof Types.ObjectId ? value._id : new Types.ObjectId(String(value._id));
      }
      return new Types.ObjectId(String(value));
    };

    const disputeData = {
      appraisalId: getObjectId(evaluation._id),
      assignmentId: getObjectId(assignment._id),
      cycleId: getObjectId(evaluation.cycleId),
      raisedByEmployeeId: getObjectId(employeeId),
      reason: createDto.disputeReason || (createDto as any).reason || '',
      details: createDto.additionalComments || (createDto as any).details || undefined,
      status: AppraisalDisputeStatus.OPEN,
      submittedAt: new Date(),
    };

    this.logger.debug(`Creating dispute with data: ${JSON.stringify({
      appraisalId: disputeData.appraisalId.toString(),
      assignmentId: disputeData.assignmentId.toString(),
      cycleId: disputeData.cycleId.toString(),
      raisedByEmployeeId: disputeData.raisedByEmployeeId.toString(),
      reason: disputeData.reason,
      status: disputeData.status,
    })}`);

    // Workaround for schema with explicit _id and auto: true
    // Must explicitly set _id when using new Model() + save()
    const disputeId = new Types.ObjectId();
    const dispute = new this.disputeModel({
      ...disputeData,
      _id: disputeId, // Explicitly set _id to work around auto: true issue
    });
    const savedDispute = await dispute.save();
    this.logger.debug(`Dispute created successfully. ID: ${savedDispute._id.toString()}, Status: ${savedDispute.status}`);
    return savedDispute;
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
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid dispute ID format: ${id}`);
    }

    // Use findOne with _id instead of findById due to explicit _id with auto: true in schema
    const dispute = await this.disputeModel
      .findOne({ _id: new Types.ObjectId(id) })
      .populate('appraisalId')
      .populate('raisedByEmployeeId')
      .populate('cycleId')
      .populate('assignmentId')
      .populate('resolvedByEmployeeId')
      .populate('assignedReviewerEmployeeId')
      .exec();
    if (!dispute) {
      this.logger.debug(`Dispute not found. ID: ${id}, Type: ${typeof id}`);
      // Try to find without populate to see if it exists at all
      const exists = await this.disputeModel.findOne({ _id: new Types.ObjectId(id) }).lean().exec();
      this.logger.debug(`Dispute exists (lean): ${!!exists}`);
      
      // List all disputes to help debug
      const allDisputes = await this.disputeModel.find({}).select('_id').lean().exec();
      this.logger.debug(`All dispute IDs in database: ${JSON.stringify(allDisputes.map(d => d._id?.toString()))}`);
      
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
      // Extract appraisalId - handle both populated object and raw ObjectId
      const appraisalIdValue = (dispute.appraisalId as any)?._id 
        ? (dispute.appraisalId as any)._id.toString()
        : dispute.appraisalId.toString();
      
      const evaluation = await this.findEvaluationById(appraisalIdValue);
      evaluation.totalScore = resolveDto.adjustedRating;
      await evaluation.save();
    }

    return dispute.save();
  }

  // ==================== HELPER METHODS ====================

  /**
   * Export appraisal summaries
   * Generates CSV or JSON export of appraisal data
   */
  async exportAppraisalSummaries(
    cycleId?: string,
    departmentId?: string,
    employeeId?: string,
    format: 'csv' | 'pdf' = 'csv',
    status?: string,
  ): Promise<{ data: any; filename: string; contentType: string }> {
    // Build filter
    const filter: any = {};

    if (cycleId) {
      filter.cycleId = new Types.ObjectId(cycleId);
    }

    if (departmentId) {
      filter.departmentId = new Types.ObjectId(departmentId);
    }

    if (employeeId) {
      filter.employeeProfileId = new Types.ObjectId(employeeId);
    }

    if (status) {
      filter.status = status;
    }

    // Get assignments with populated data
    const assignments = await this.assignmentModel
      .find(filter)
      .populate('employeeProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('managerProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('cycleId', 'name startDate endDate')
      .populate('templateId', 'name')
      .populate('departmentId', 'name code')
      .populate('latestAppraisalId')
      .lean()
      .exec();

    // Get evaluations for assignments
    const evaluationIds = assignments
      .map((a) => a.latestAppraisalId)
      .filter((id) => id)
      .map((id) => (id as any)._id || id);

    const evaluations = evaluationIds.length > 0
      ? await this.evaluationModel
          .find({ _id: { $in: evaluationIds } })
          .lean()
          .exec()
      : [];

    const evaluationMap = new Map(
      evaluations.map((e: any) => [e._id.toString(), e]),
    );

    // Prepare export data
    const exportData = assignments.map((assignment: any) => {
      const evaluation = evaluationMap.get(
        assignment.latestAppraisalId?._id?.toString() ||
          assignment.latestAppraisalId?.toString() ||
          '',
      );

      const employee = assignment.employeeProfileId || {};
      const manager = assignment.managerProfileId || {};
      const cycle = assignment.cycleId || {};
      const template = assignment.templateId || {};
      const department = assignment.departmentId || {};

      // Extract high performer flag from managerSummary
      let isHighPerformer = false;
      let highPerformerNotes = '';
      let promotionRecommendation = '';
      let managerSummaryClean = evaluation?.managerSummary || '';
      
      if (evaluation?.managerSummary) {
        const highPerformerMatch = evaluation.managerSummary.match(/\[HIGH_PERFORMER\](.*?)\[END_FLAG\]/s);
        if (highPerformerMatch) {
          try {
            const flagData = JSON.parse(highPerformerMatch[1]);
            isHighPerformer = flagData.flagged || false;
            highPerformerNotes = flagData.notes || '';
            promotionRecommendation = flagData.promotionRecommendation || '';
            // Remove the flag marker from summary for cleaner display
            managerSummaryClean = evaluation.managerSummary.replace(/\[HIGH_PERFORMER\].*?\[END_FLAG\]\s*/s, '').trim();
          } catch (e) {
            // If parsing fails, keep original summary
            managerSummaryClean = evaluation.managerSummary;
          }
        }
      }

      return {
        'Employee Number': employee.employeeNumber || '',
        'Employee Name': `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.trim(),
        'Employee Email': employee.workEmail || '',
        'Department': department.name || '',
        'Department Code': department.code || '',
        'Cycle Name': cycle.name || '',
        'Cycle Start': cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : '',
        'Cycle End': cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : '',
        'Template': template.name || '',
        'Status': assignment.status || '',
        'Assigned Date': assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : '',
        'Due Date': assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '',
        'Submitted Date': assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : '',
        'Published Date': assignment.publishedAt ? new Date(assignment.publishedAt).toLocaleDateString() : '',
        'Manager Name': `${manager.firstName || ''} ${manager.middleName || ''} ${manager.lastName || ''}`.trim(),
        'Manager Email': manager.workEmail || '',
        'Total Score': evaluation?.totalScore || '',
        'Overall Rating': evaluation?.overallRatingLabel || '',
        'High Performer': isHighPerformer ? 'Yes' : 'No',
        'High Performer Notes': highPerformerNotes,
        'Promotion Recommendation': promotionRecommendation,
        'Manager Summary': managerSummaryClean,
        'Strengths': evaluation?.strengths || '',
        'Improvement Areas': evaluation?.improvementAreas || '',
        'Acknowledged': evaluation?.employeeAcknowledgedAt ? 'Yes' : 'No',
        'Acknowledged Date': evaluation?.employeeAcknowledgedAt
          ? new Date(evaluation.employeeAcknowledgedAt).toLocaleDateString()
          : '',
      };
    });

    if (format === 'csv') {
      // Generate CSV
      if (exportData.length === 0) {
        // Return empty CSV with headers
        const headers = [
          'Employee Number', 'Employee Name', 'Employee Email', 'Department',
          'Department Code', 'Cycle Name', 'Cycle Start', 'Cycle End',
          'Template', 'Status', 'Assigned Date', 'Due Date', 'Submitted Date',
          'Published Date', 'Manager Name', 'Manager Email', 'Total Score',
          'Overall Rating', 'High Performer', 'High Performer Notes', 'Promotion Recommendation',
          'Manager Summary', 'Strengths', 'Improvement Areas',
          'Acknowledged', 'Acknowledged Date'
        ];
        const csvContent = headers.join(',');
        return {
          data: csvContent,
          filename: `appraisal-summary-${Date.now()}.csv`,
          contentType: 'text/csv',
        };
      }

      const headers = Object.keys(exportData[0]);
      const csvRows = [
        headers.join(','),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header] || '';
              // Escape commas and quotes in CSV
              if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${String(value).replace(/"/g, '""')}"`;
              }
              return String(value);
            })
            .join(','),
        ),
      ];

      const csvContent = csvRows.join('\n');
      const filename = `appraisal-summary-${Date.now()}.csv`;

      return {
        data: csvContent,
        filename,
        contentType: 'text/csv',
      };
    } else {
      // For PDF/JSON, return JSON data (frontend can use a library to generate PDF)
      const filename = `appraisal-summary-${Date.now()}.json`;
      return {
        data: JSON.stringify(exportData, null, 2),
        filename,
        contentType: 'application/json',
      };
    }
  }

  /**
   * Get performance history for an employee
   * REQ-OD-08: Employee / Line Manager access past appraisal history
   * Authorization:
   * - Employee can see their own history
   * - Manager can see their direct reports' history
   * - HR/Admin can see any employee's history
   */
  async getEmployeePerformanceHistory(
    employeeId: string,
    requestingUserId?: string,
    requestingUserRoles?: string[],
  ): Promise<AppraisalRecordDocument[]> {
    // Check authorization
    if (requestingUserId) {
      const isSelf = requestingUserId === employeeId;
      const hasAdminRole = requestingUserRoles?.some(role =>
        ['HR_MANAGER', 'HR_ADMIN', 'HR_EMPLOYEE', 'SYSTEM_ADMIN', 'DEPARTMENT_HEAD'].includes(role)
      );

      if (!isSelf && !hasAdminRole) {
        // Check if requesting user is the employee's manager
        const employee = await this.employeeModel.findById(employeeId).exec();
        if (!employee) {
          throw new NotFoundException(`Employee with ID ${employeeId} not found`);
        }

        const managerId = await this.determineManagerForEmployee(employee);
        const isManager = managerId?.toString() === requestingUserId;

        if (!isManager) {
          throw new ForbiddenException(
            'You are not authorized to view this employee\'s performance history. Only the employee themselves, their direct manager, or HR staff can access this information.',
          );
        }
      }
    }

    return this.evaluationModel
      .find({ employeeProfileId: new Types.ObjectId(employeeId) })
      .populate('cycleId', 'name startDate endDate status')
      .populate('templateId', 'name')
      .populate('managerProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('assignmentId')
      .populate('employeeProfileId', 'employeeNumber firstName middleName lastName workEmail')
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

    // Prevent submission if assignment is already PUBLISHED
    // Once published, the appraisal is final and cannot be modified
    if (assignment.status === AppraisalAssignmentStatus.PUBLISHED) {
      throw new BadRequestException(
        `Cannot submit self-assessment. This assignment has already been published and finalized. You cannot modify a published appraisal.`,
      );
    }

    // Allow submission when status is NOT_STARTED, ACKNOWLEDGED, or IN_PROGRESS
    // ACKNOWLEDGED is the status after employee acknowledges the assignment (REQ-PP-07)
    // SUBMITTED status allows viewing but not re-submission (unless manager hasn't reviewed yet)
    if (
      assignment.status !== AppraisalAssignmentStatus.IN_PROGRESS &&
      assignment.status !== AppraisalAssignmentStatus.NOT_STARTED &&
      assignment.status !== AppraisalAssignmentStatus.ACKNOWLEDGED &&
      assignment.status !== AppraisalAssignmentStatus.SUBMITTED
    ) {
      throw new BadRequestException(
        `Cannot submit self-assessment. Current status: ${assignment.status}. You can only submit when status is NOT_STARTED, ACKNOWLEDGED, IN_PROGRESS, or SUBMITTED (before manager review).`,
      );
    }

    // If status is SUBMITTED, check if manager has already reviewed
    // If manager has reviewed, don't allow re-submission
    if (assignment.status === AppraisalAssignmentStatus.SUBMITTED) {
      const existingEvaluation = await this.evaluationModel
        .findOne({
          assignmentId: assignment._id,
          status: { $in: [AppraisalRecordStatus.MANAGER_SUBMITTED, AppraisalRecordStatus.HR_PUBLISHED] },
        })
        .exec();
      
      if (existingEvaluation) {
        throw new BadRequestException(
          `Cannot submit self-assessment. Your manager has already reviewed this appraisal. Once reviewed, you cannot modify your self-assessment.`,
        );
      }
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

    // Update assignment status to SUBMITTED (REQ-AE-02: Employee submits self-assessment)
    // Expected: Assignment status changes to SUBMITTED
    assignment.status = AppraisalAssignmentStatus.SUBMITTED;
    assignment.submittedAt = new Date();
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
  // REQ-PP-12: Line Manager sets and reviews employee objectives
  // Stored in GridFS since we cannot create new schemas

  /**
   * Load all performance goals from GridFS
   */
  private async loadGoals(): Promise<PerformanceGoalDto[]> {
    try {
      const files = await this.goalsBucket
        .find({ filename: this.GOALS_FILENAME })
        .sort({ uploadDate: -1 })
        .limit(1)
        .toArray();

      if (files.length > 0) {
        const file = files[0];
        const downloadStream = this.goalsBucket.openDownloadStream(file._id);
        
        const chunks: Buffer[] = [];
        for await (const chunk of downloadStream) {
          chunks.push(chunk);
        }
        
        const data = Buffer.concat(chunks).toString('utf-8');
        const goals = JSON.parse(data);
        // Convert date strings back to Date objects
        return goals.map((goal: any) => ({
          ...goal,
          startDate: goal.startDate ? new Date(goal.startDate) : undefined,
          dueDate: goal.dueDate ? new Date(goal.dueDate) : undefined,
          createdAt: goal.createdAt ? new Date(goal.createdAt) : undefined,
          updatedAt: goal.updatedAt ? new Date(goal.updatedAt) : undefined,
          completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
        }));
      }
      
      return [];
    } catch (error) {
      this.logger.error('Error loading goals:', error);
      return [];
    }
  }

  /**
   * Save all performance goals to GridFS
   */
  private async saveGoals(goals: PerformanceGoalDto[]): Promise<void> {
    try {
      // Delete existing file if it exists
      const existingFiles = await this.goalsBucket
        .find({ filename: this.GOALS_FILENAME })
        .toArray();
      
      for (const file of existingFiles) {
        await this.goalsBucket.delete(file._id);
      }

      // Upload new file
      const jsonData = JSON.stringify(goals, null, 2);
      const readableStream = new Readable();
      readableStream.push(jsonData);
      readableStream.push(null);

      const uploadStream = this.goalsBucket.openUploadStream(
        this.GOALS_FILENAME,
        {
          contentType: 'application/json',
          metadata: {
            updatedAt: new Date(),
          },
        },
      );

      await new Promise<void>((resolve, reject) => {
        readableStream
          .pipe(uploadStream)
          .on('finish', () => resolve())
          .on('error', (error) => reject(error));
      });
    } catch (error) {
      this.logger.error('Error saving goals:', error);
      throw new BadRequestException('Failed to save goal');
    }
  }

  /**
   * Create a performance goal
   * REQ-PP-12: Line Manager sets and reviews employee objectives
   */
  async createGoal(createDto: CreatePerformanceGoalDto): Promise<PerformanceGoalDto> {
    // Verify employee exists
    const employee = await this.employeeModel.findById(createDto.employeeId).exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${createDto.employeeId} not found`);
    }

    // Verify setBy (manager) exists
    const manager = await this.employeeModel.findById(createDto.setBy).exec();
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${createDto.setBy} not found`);
    }

    // Verify manager is authorized (is direct manager or department head of employee's department)
    const isDirectManager = employee.supervisorPositionId?.toString() === manager.primaryPositionId?.toString();
    
    // Check if manager is department head of employee's department
    let isDepartmentHead = false;
    if (employee.primaryDepartmentId) {
      const department = await this.departmentModel.findById(employee.primaryDepartmentId).exec();
      if (department?.headPositionId?.toString() === manager.primaryPositionId?.toString()) {
        isDepartmentHead = true;
      }
    }

    if (!isDirectManager && !isDepartmentHead) {
      throw new ForbiddenException(
        'You can only set goals for your direct reports or employees in your department',
      );
    }

    // Load existing goals
    const goals = await this.loadGoals();

    // Create new goal
    const newGoal: PerformanceGoalDto = {
      id: new Types.ObjectId().toString(),
      goalTitle: createDto.goalTitle,
      description: createDto.description,
      employeeId: createDto.employeeId,
      setBy: createDto.setBy,
      cycleId: createDto.cycleId,
      category: createDto.category,
      type: createDto.type,
      priority: createDto.priority,
      targetMetric: createDto.targetMetric,
      targetValue: createDto.targetValue,
      targetUnit: createDto.targetUnit,
      startDate: new Date(createDto.startDate),
      dueDate: new Date(createDto.dueDate),
      status: GoalStatus.NOT_STARTED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    goals.push(newGoal);
    await this.saveGoals(goals);

    return newGoal;
  }

  /**
   * Get goals for an employee
   */
  async findGoalsByEmployee(employeeId: string, status?: string): Promise<PerformanceGoalDto[]> {
    const goals = await this.loadGoals();
    
    let filteredGoals = goals.filter(goal => goal.employeeId === employeeId);
    
    if (status) {
      filteredGoals = filteredGoals.filter(goal => goal.status === status);
    }

    return filteredGoals.sort((a, b) => {
      // Sort by due date (earliest first), then by created date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.createdAt && b.createdAt) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return 0;
    });
  }

  /**
   * Get a goal by ID
   */
  async findGoalById(id: string): Promise<PerformanceGoalDto> {
    const goals = await this.loadGoals();
    const goal = goals.find(g => g.id === id);
    
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    return goal;
  }

  /**
   * Update a performance goal
   * REQ-PP-12: Line Manager sets and reviews employee objectives
   */
  async updateGoal(
    id: string,
    updateDto: UpdatePerformanceGoalDto,
    managerId?: string,
  ): Promise<PerformanceGoalDto> {
    const goals = await this.loadGoals();
    const goalIndex = goals.findIndex(g => g.id === id);
    
    if (goalIndex === -1) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    const goal = goals[goalIndex];

    // If managerId is provided, verify they're authorized to update this goal
    if (managerId) {
      if (goal.setBy !== managerId) {
        throw new ForbiddenException('You can only update goals that you set');
      }
    }

    // Update goal fields
    if (updateDto.goalTitle !== undefined) goal.goalTitle = updateDto.goalTitle;
    if (updateDto.description !== undefined) goal.description = updateDto.description;
    if (updateDto.category !== undefined) goal.category = updateDto.category;
    if (updateDto.type !== undefined) goal.type = updateDto.type;
    if (updateDto.priority !== undefined) goal.priority = updateDto.priority;
    if (updateDto.targetMetric !== undefined) goal.targetMetric = updateDto.targetMetric;
    if (updateDto.targetValue !== undefined) goal.targetValue = updateDto.targetValue;
    if (updateDto.targetUnit !== undefined) goal.targetUnit = updateDto.targetUnit;
    if (updateDto.currentValue !== undefined) goal.currentValue = updateDto.currentValue;
    if (updateDto.startDate !== undefined) goal.startDate = new Date(updateDto.startDate);
    if (updateDto.dueDate !== undefined) goal.dueDate = new Date(updateDto.dueDate);
    if (updateDto.status !== undefined) {
      goal.status = updateDto.status as GoalStatus;
      // Set completedAt if status is COMPLETED
      if (updateDto.status === GoalStatus.COMPLETED && !goal.completedAt) {
        goal.completedAt = new Date();
      }
    }
    if (updateDto.finalComments !== undefined) goal.finalComments = updateDto.finalComments;

    goal.updatedAt = new Date();

    goals[goalIndex] = goal;
    await this.saveGoals(goals);

    return goal;
  }

  /**
   * Delete a performance goal
   * REQ-PP-12: Line Manager sets and reviews employee objectives
   */
  async deleteGoal(id: string, managerId?: string): Promise<void> {
    const goals = await this.loadGoals();
    const goalIndex = goals.findIndex(g => g.id === id);
    
    if (goalIndex === -1) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    const goal = goals[goalIndex];

    // If managerId is provided, verify they're authorized to delete this goal
    if (managerId) {
      if (goal.setBy !== managerId) {
        throw new ForbiddenException('You can only delete goals that you set');
      }
    }

    goals.splice(goalIndex, 1);
    await this.saveGoals(goals);
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

  // ==================== HIGH-PERFORMER FLAGGING METHODS ====================
  // Note: Using existing AppraisalRecord fields to store flag information
  // We use managerSummary field with a special prefix to indicate high-performer status
  // Format: "[HIGH_PERFORMER]" + original summary + flag notes

  /**
   * Flag an employee as a high-performer based on their appraisal
   * Stores flag information in existing managerSummary field with special prefix
   */
  async flagHighPerformer(
    appraisalRecordId: string,
    managerId: string,
    flagDto: { isHighPerformer?: boolean; notes?: string; promotionRecommendation?: string },
  ): Promise<AppraisalRecordDocument> {
    // Verify appraisal record exists
    const appraisal = await this.evaluationModel
      .findById(appraisalRecordId)
      .populate('employeeProfileId')
      .exec();

    if (!appraisal) {
      throw new NotFoundException(
        `Appraisal record with ID ${appraisalRecordId} not found`,
      );
    }

    // Verify the manager is the one who evaluated this employee
    const managerIdObj = new Types.ObjectId(managerId);
    if (!appraisal.managerProfileId.equals(managerIdObj)) {
      throw new BadRequestException(
        'Only the manager who evaluated this employee can flag them as a high-performer',
      );
    }

    // Store flag information in existing fields
    // Use managerSummary to store flag status with special marker
    const isHighPerformer = flagDto.isHighPerformer ?? true;
    
    if (isHighPerformer) {
      // Extract original summary (remove existing flag markers)
      const originalSummary = appraisal.managerSummary?.replace(/^\[HIGH_PERFORMER\].*?\[END_FLAG\]\s*/s, '') || '';
      
      // Build flag metadata
      const flagMetadata = {
        flagged: true,
        flaggedAt: new Date().toISOString(),
        notes: flagDto.notes || '',
        promotionRecommendation: flagDto.promotionRecommendation || '',
      };
      
      // Store in managerSummary with special markers
      appraisal.managerSummary = `[HIGH_PERFORMER]${JSON.stringify(flagMetadata)}[END_FLAG] ${originalSummary}`;
      
      // Also store in strengths field if available (as backup indicator)
      if (flagDto.notes) {
        const existingStrengths = appraisal.strengths || '';
        if (!existingStrengths.includes('[HP_FLAG]')) {
          appraisal.strengths = `${existingStrengths}\n[HP_FLAG]${flagDto.notes}`.trim();
        }
      }
    } else {
      // Remove flag markers
      if (appraisal.managerSummary) {
        appraisal.managerSummary = appraisal.managerSummary.replace(/\[HIGH_PERFORMER\].*?\[END_FLAG\]\s*/s, '');
      }
      if (appraisal.strengths) {
        appraisal.strengths = appraisal.strengths.replace(/\n\[HP_FLAG\].*$/s, '');
      }
    }

    return await appraisal.save();
  }

  /**
   * Unflag a high-performer
   */
  async unflagHighPerformer(
    appraisalRecordId: string,
    managerId: string,
  ): Promise<void> {
    const appraisal = await this.evaluationModel
      .findById(appraisalRecordId)
      .exec();

    if (!appraisal) {
      throw new NotFoundException(
        `Appraisal record with ID ${appraisalRecordId} not found`,
      );
    }

    // Verify the manager is the one who flagged this employee
    const managerIdObj = new Types.ObjectId(managerId);
    if (!appraisal.managerProfileId.equals(managerIdObj)) {
      throw new BadRequestException(
        'Only the manager who flagged this employee can unflag them',
      );
    }

    // Remove flag markers
    if (appraisal.managerSummary) {
      appraisal.managerSummary = appraisal.managerSummary.replace(/\[HIGH_PERFORMER\].*?\[END_FLAG\]\s*/s, '');
    }
    if (appraisal.strengths) {
      appraisal.strengths = appraisal.strengths.replace(/\n\[HP_FLAG\].*$/s, '');
    }

    await appraisal.save();
  }

  /**
   * Get high-performer flag for an appraisal
   */
  async getHighPerformerFlag(
    appraisalRecordId: string,
  ): Promise<{ isHighPerformer: boolean; notes?: string; promotionRecommendation?: string; flaggedAt?: string } | null> {
    const appraisal = await this.evaluationModel
      .findById(appraisalRecordId)
      .exec();

    if (!appraisal) {
      return null;
    }

    // Extract flag information from managerSummary
    const flagMatch = appraisal.managerSummary?.match(/\[HIGH_PERFORMER\](.*?)\[END_FLAG\]/s);
    
    if (flagMatch) {
      try {
        const flagMetadata = JSON.parse(flagMatch[1]);
        return {
          isHighPerformer: true,
          notes: flagMetadata.notes || '',
          promotionRecommendation: flagMetadata.promotionRecommendation || '',
          flaggedAt: flagMetadata.flaggedAt,
        };
      } catch (e) {
        // Fallback: check if strengths has HP_FLAG marker
        if (appraisal.strengths?.includes('[HP_FLAG]')) {
          const notesMatch = appraisal.strengths.match(/\[HP_FLAG\](.*)$/s);
          return {
            isHighPerformer: true,
            notes: notesMatch?.[1] || '',
          };
        }
      }
    }

    return null;
  }

  /**
   * Get all high-performers for a manager
   */
  async getHighPerformersByManager(
    managerId: string,
  ): Promise<AppraisalRecordDocument[]> {
    // Find all appraisals by this manager that have high-performer flag
    const allAppraisals = await this.evaluationModel
      .find({
        managerProfileId: new Types.ObjectId(managerId),
      })
      .populate('employeeProfileId')
      .populate('cycleId')
      .exec();

    // Filter to only those with high-performer flag
    return allAppraisals.filter(appraisal => {
      return appraisal.managerSummary?.includes('[HIGH_PERFORMER]') ||
             appraisal.strengths?.includes('[HP_FLAG]');
    });
  }

  /**
   * Get all high-performers (HR/Admin view)
   */
  async getAllHighPerformers(): Promise<AppraisalRecordDocument[]> {
    // Find all appraisals with high-performer flag
    const allAppraisals = await this.evaluationModel
      .find({})
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('cycleId')
      .exec();

    // Filter to only those with high-performer flag
    return allAppraisals.filter(appraisal => {
      return appraisal.managerSummary?.includes('[HIGH_PERFORMER]') ||
             appraisal.strengths?.includes('[HP_FLAG]');
    });
  }

  // ==================== PERFORMANCE IMPROVEMENT PLAN (PIP) METHODS ====================
  // REQ-OD-05: Line Manager initiates Performance Improvement Plans
  // Note: PIP data is stored in existing AppraisalRecord fields using special markers
  // Format: [PIP_START]{JSON data}[PIP_END] stored in improvementAreas field

  /**
   * Create a Performance Improvement Plan
   * REQ-OD-05: Line Manager initiates PIPs
   * Stores PIP data in existing improvementAreas field with special markers
   */
  async createPerformanceImprovementPlan(
    managerId: string,
    createDto: CreatePerformanceImprovementPlanDto,
  ): Promise<AppraisalRecordDocument> {
    // Verify appraisal record exists
    const appraisal = await this.evaluationModel
      .findById(createDto.appraisalRecordId)
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .exec();

    if (!appraisal) {
      throw new NotFoundException(
        `Appraisal record with ID ${createDto.appraisalRecordId} not found`,
      );
    }

    // Verify the manager is authorized to create PIP for this employee
    const managerIdObj = new Types.ObjectId(managerId);
    const isDirectManager = appraisal.managerProfileId.equals(managerIdObj);
    
    if (!isDirectManager) {
      // Get manager and employee profiles
      const manager = await this.employeeModel.findById(managerId).exec();
      const employee = await this.employeeModel
        .findById(appraisal.employeeProfileId)
        .populate('primaryDepartmentId')
        .exec();
      
      if (!manager) {
        throw new NotFoundException(`Manager with ID ${managerId} not found`);
      }
      
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${appraisal.employeeProfileId} not found`);
      }

      let hasAuthorizedRole = false;
      let isDepartmentHead = false;
      let isSameDepartment = false;

      // FIRST: Check if manager is the department head based on POSITION (not just SystemRole)
      // This is the primary way to determine if someone is a "Line Manager" / "Department Head"
      // A department head is someone whose primaryPositionId matches the department's headPositionId
      if (employee.primaryDepartmentId && manager.primaryPositionId) {
        const department = employee.primaryDepartmentId as any;
        if (department && department.headPositionId) {
          isDepartmentHead = department.headPositionId.equals(manager.primaryPositionId);
          this.logger.debug(`Department head check:`, {
            managerId,
            employeeId: appraisal.employeeProfileId.toString(),
            managerPositionId: manager.primaryPositionId.toString(),
            departmentHeadPositionId: department.headPositionId.toString(),
            isDepartmentHead,
          });
        }
      }

      // SECOND: Check if manager has HR or admin SystemRole
      // Note: An HR Manager CAN also be a department head (they can have both roles)
      if (manager.accessProfileId) {
        try {
          const systemRole = await this.employeeModel.db
            .collection('employee_system_roles')
            .findOne({ _id: manager.accessProfileId });
          
          if (systemRole && systemRole.roles) {
            const managerRoles = systemRole.roles as string[];
            hasAuthorizedRole = [
              'department head',  // SystemRole.DEPARTMENT_HEAD
              'HR Manager',       // SystemRole.HR_MANAGER
              'HR Admin',         // SystemRole.HR_ADMIN
              'System Admin',     // SystemRole.SYSTEM_ADMIN
            ].some(role => managerRoles.includes(role));
            
            this.logger.debug(`Manager roles check:`, {
              managerId,
              accessProfileId: manager.accessProfileId.toString(),
              roles: managerRoles,
              hasAuthorizedRole,
            });
          }
        } catch (err) {
          this.logger.warn(`Error checking system roles for manager ${managerId}:`, err);
        }
      }

      // THIRD: Check if manager and employee are in the same department
      // This is a fallback for cases where role checking might have issues
      if (employee.primaryDepartmentId && manager.primaryDepartmentId) {
        isSameDepartment = employee.primaryDepartmentId.equals(manager.primaryDepartmentId);
      }

      // Authorization logic (REQ-OD-05: Line Manager initiates PIPs):
      // 1. Manager is department head (position-based) - PRIMARY check for "Line Manager"
      // 2. Manager has HR/Admin role - HR Managers can create PIPs for any employee
      // 3. Manager is in same department AND has some role/position (fallback)
      // Note: HR Managers should be able to create PIPs for any employee if they have HR_MANAGER role
      const isAuthorized = isDepartmentHead || hasAuthorizedRole || (isSameDepartment && (manager.accessProfileId || manager.primaryPositionId));

      if (!isAuthorized) {
        this.logger.debug(`PIP authorization failed:`, {
          managerId,
          employeeId: appraisal.employeeProfileId.toString(),
          isDirectManager,
          hasAuthorizedRole,
          isDepartmentHead,
          isSameDepartment,
          managerRoles: manager.accessProfileId ? 'has accessProfileId' : 'no accessProfileId',
          employeeDepartment: employee.primaryDepartmentId?.toString(),
          managerDepartment: manager.primaryDepartmentId?.toString(),
        });
        
        throw new BadRequestException(
          'You are not authorized to create a PIP for this employee. Only direct managers, department heads, or HR staff can create PIPs.',
        );
      }
    }

    // Validate dates
    const startDate = new Date(createDto.startDate);
    const targetDate = new Date(createDto.targetCompletionDate);
    if (targetDate <= startDate) {
      throw new BadRequestException('Target completion date must be after start date');
    }

    // Check if PIP already exists for this appraisal
    const existingImprovementAreas = appraisal.improvementAreas || '';
    if (existingImprovementAreas.includes('[PIP_START]')) {
      throw new ConflictException('A Performance Improvement Plan already exists for this appraisal');
    }

    // Build PIP data object
    const pipData = {
      title: createDto.title,
      description: createDto.description,
      reason: createDto.reason,
      improvementAreas: createDto.improvementAreas,
      actionItems: createDto.actionItems,
      expectedOutcomes: createDto.expectedOutcomes,
      startDate: startDate.toISOString(),
      targetCompletionDate: targetDate.toISOString(),
      status: 'DRAFT',
      createdByManagerId: managerId,
      createdAt: new Date().toISOString(),
    };

    // Store PIP data in improvementAreas field with special markers
    // Format: [PIP_START]{JSON}[PIP_END] + original improvement areas
    const originalImprovementAreas = existingImprovementAreas.replace(/\[PIP_START\].*?\[PIP_END\]/s, '').trim();
    const pipMarker = `[PIP_START]${JSON.stringify(pipData)}[PIP_END]`;
    
    appraisal.improvementAreas = originalImprovementAreas
      ? `${pipMarker}\n\n${originalImprovementAreas}`
      : pipMarker;

    return await appraisal.save();
  }

  /**
   * Get PIP data from an appraisal record
   */
  getPIPFromAppraisal(appraisal: AppraisalRecordDocument): any | null {
    const improvementAreas = appraisal.improvementAreas || '';
    const pipMatch = improvementAreas.match(/\[PIP_START\](.*?)\[PIP_END\]/s);
    
    if (pipMatch) {
      try {
        const pipData = JSON.parse(pipMatch[1]);
        return {
          ...pipData,
          appraisalRecordId: appraisal._id.toString(),
          employeeProfileId: (appraisal.employeeProfileId as any)?._id?.toString() || appraisal.employeeProfileId.toString(),
        };
      } catch (err) {
        this.logger.error('Error parsing PIP data:', err);
        return null;
      }
    }
    
    return null;
  }

  /**
   * Get all PIPs for an employee
   */
  async getPIPsByEmployee(employeeId: string): Promise<any[]> {
    const appraisals = await this.evaluationModel
      .find({ employeeProfileId: new Types.ObjectId(employeeId) })
      .populate('employeeProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('managerProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('cycleId')
      .exec();

    const pips: any[] = [];
    for (const appraisal of appraisals) {
      const pip = this.getPIPFromAppraisal(appraisal);
      if (pip) {
        pips.push(pip);
      }
    }

    return pips.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Most recent first
    });
  }

  /**
   * Get all PIPs created by a manager
   * REQ-OD-05: Line Manager initiates PIPs
   */
  async getPIPsByManager(managerId: string): Promise<any[]> {
    const appraisals = await this.evaluationModel
      .find({ managerProfileId: new Types.ObjectId(managerId) })
      .populate('employeeProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('cycleId')
      .exec();

    const pips: any[] = [];
    for (const appraisal of appraisals) {
      const pip = this.getPIPFromAppraisal(appraisal);
      if (pip && pip.createdByManagerId === managerId) {
        pips.push(pip);
      }
    }

    return pips.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Most recent first
    });
  }

  /**
   * Get all PIPs (for HR/Admin view)
   */
  async getAllPIPs(status?: string): Promise<any[]> {
    const appraisals = await this.evaluationModel
      .find({})
      .populate('employeeProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('managerProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('cycleId')
      .exec();

    const pips: any[] = [];
    for (const appraisal of appraisals) {
      const pip = this.getPIPFromAppraisal(appraisal);
      if (pip) {
        if (!status || pip.status === status) {
          pips.push(pip);
        }
      }
    }

    return pips.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Most recent first
    });
  }

  /**
   * Get a single PIP by appraisal record ID
   */
  async getPIPByAppraisalId(appraisalRecordId: string): Promise<any> {
    const appraisal = await this.evaluationModel
      .findById(appraisalRecordId)
      .populate('employeeProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('managerProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('cycleId')
      .exec();
    
    if (!appraisal) {
      throw new NotFoundException(`Appraisal record with ID ${appraisalRecordId} not found`);
    }
    
    const pip = this.getPIPFromAppraisal(appraisal);
    if (!pip) {
      throw new NotFoundException(`No Performance Improvement Plan found for this appraisal`);
    }
    
    return pip;
  }

  /**
   * Update a PIP
   * REQ-OD-05: Line Manager initiates PIPs
   */
  async updatePIP(
    appraisalRecordId: string,
    managerId: string,
    updateDto: UpdatePerformanceImprovementPlanDto,
  ): Promise<AppraisalRecordDocument> {
    const appraisal = await this.evaluationModel
      .findById(appraisalRecordId)
      .exec();
    
    if (!appraisal) {
      throw new NotFoundException(`Appraisal record with ID ${appraisalRecordId} not found`);
    }

    // Get existing PIP data
    const existingPIP = this.getPIPFromAppraisal(appraisal);
    if (!existingPIP) {
      throw new NotFoundException(`No Performance Improvement Plan found for this appraisal`);
    }

    // Verify manager is authorized to update this PIP
    if (existingPIP.createdByManagerId !== managerId) {
      // Check if manager has HR or admin role
      const manager = await this.employeeModel.findById(managerId).exec();
      let hasAuthorizedRole = false;
      
      if (manager && manager.accessProfileId) {
        const systemRole = await this.employeeModel.db
          .collection('employee_system_roles')
          .findOne({ _id: manager.accessProfileId });
        
        if (systemRole && systemRole.roles) {
          const managerRoles = systemRole.roles as string[];
          hasAuthorizedRole = [
            'HR Manager',
            'HR Admin',
            'System Admin',
          ].some(role => managerRoles.includes(role));
        }
      }

      if (!hasAuthorizedRole) {
        throw new BadRequestException(
          'You are not authorized to update this PIP. Only the creating manager or HR staff can update PIPs.',
        );
      }
    }

    // Merge updates with existing PIP data
    const updatedPIP = {
      ...existingPIP,
      title: updateDto.title !== undefined ? updateDto.title : existingPIP.title,
      description: updateDto.description !== undefined ? updateDto.description : existingPIP.description,
      reason: updateDto.reason !== undefined ? updateDto.reason : existingPIP.reason,
      improvementAreas: updateDto.improvementAreas !== undefined ? updateDto.improvementAreas : existingPIP.improvementAreas,
      actionItems: updateDto.actionItems !== undefined ? updateDto.actionItems : existingPIP.actionItems,
      expectedOutcomes: updateDto.expectedOutcomes !== undefined ? updateDto.expectedOutcomes : existingPIP.expectedOutcomes,
      startDate: updateDto.startDate !== undefined ? updateDto.startDate : existingPIP.startDate,
      targetCompletionDate: updateDto.targetCompletionDate !== undefined ? updateDto.targetCompletionDate : existingPIP.targetCompletionDate,
      actualCompletionDate: updateDto.actualCompletionDate !== undefined ? updateDto.actualCompletionDate : existingPIP.actualCompletionDate,
      status: updateDto.status !== undefined ? updateDto.status : existingPIP.status,
      progressNotes: updateDto.progressNotes !== undefined ? updateDto.progressNotes : existingPIP.progressNotes,
      finalOutcome: updateDto.finalOutcome !== undefined ? updateDto.finalOutcome : existingPIP.finalOutcome,
      updatedAt: new Date().toISOString(),
    };

    // Validate dates if updated
    if (updateDto.startDate || updateDto.targetCompletionDate) {
      const startDate = new Date(updatedPIP.startDate);
      const targetDate = new Date(updatedPIP.targetCompletionDate);
      if (targetDate <= startDate) {
        throw new BadRequestException('Target completion date must be after start date');
      }
    }

    // Auto-set completion date if status is COMPLETED
    if (updateDto.status === 'COMPLETED' && !updatedPIP.actualCompletionDate) {
      updatedPIP.actualCompletionDate = new Date().toISOString();
    }

    // Update the improvementAreas field with new PIP data
    const originalImprovementAreas = (appraisal.improvementAreas || '').replace(/\[PIP_START\].*?\[PIP_END\]/s, '').trim();
    const pipMarker = `[PIP_START]${JSON.stringify(updatedPIP)}[PIP_END]`;
    
    appraisal.improvementAreas = originalImprovementAreas
      ? `${pipMarker}\n\n${originalImprovementAreas}`
      : pipMarker;

    return await appraisal.save();
  }

  /**
   * Delete a PIP
   * Only the creating manager or HR/Admin can delete
   */
  async deletePIP(appraisalRecordId: string, managerId: string): Promise<void> {
    const appraisal = await this.evaluationModel
      .findById(appraisalRecordId)
      .exec();
    
    if (!appraisal) {
      throw new NotFoundException(`Appraisal record with ID ${appraisalRecordId} not found`);
    }

    // Get existing PIP data
    const existingPIP = this.getPIPFromAppraisal(appraisal);
    if (!existingPIP) {
      throw new NotFoundException(`No Performance Improvement Plan found for this appraisal`);
    }

    // Verify manager is authorized to delete this PIP
    if (existingPIP.createdByManagerId !== managerId) {
      // Check if manager has HR or admin role
      const manager = await this.employeeModel.findById(managerId).exec();
      let hasAuthorizedRole = false;
      
      if (manager && manager.accessProfileId) {
        const systemRole = await this.employeeModel.db
          .collection('employee_system_roles')
          .findOne({ _id: manager.accessProfileId });
        
        if (systemRole && systemRole.roles) {
          const managerRoles = systemRole.roles as string[];
          hasAuthorizedRole = [
            'HR Manager',
            'HR Admin',
            'System Admin',
          ].some(role => managerRoles.includes(role));
        }
      }

      if (!hasAuthorizedRole) {
        throw new BadRequestException(
          'You are not authorized to delete this PIP. Only the creating manager or HR staff can delete PIPs.',
        );
      }
    }

    // Remove PIP marker from improvementAreas
    const originalImprovementAreas = (appraisal.improvementAreas || '').replace(/\[PIP_START\].*?\[PIP_END\]/s, '').trim();
    appraisal.improvementAreas = originalImprovementAreas || undefined;

    await appraisal.save();
  }

  /**
   * Generate outcome report
   * REQ-OD-06: HR Employee generates outcome reports
   * Generates comprehensive reports on appraisal outcomes including ratings, high performers, PIPs, and disputes
   */
  async generateOutcomeReport(
    cycleId?: string,
    departmentId?: string,
    format: 'csv' | 'pdf' | 'json' = 'csv',
    includeHighPerformers: boolean = true,
    includePIPs: boolean = true,
    includeDisputes: boolean = true,
  ): Promise<{ data: any; filename: string; contentType: string }> {
    // Build filter for completed/published appraisals
    const filter: any = {
      status: AppraisalRecordStatus.HR_PUBLISHED,
    };

    if (cycleId) {
      filter.cycleId = new Types.ObjectId(cycleId);
    }

    // Get all published/acknowledged appraisals with populated data
    const appraisals = await this.evaluationModel
      .find(filter)
      .populate('employeeProfileId', 'employeeNumber firstName middleName lastName workEmail primaryDepartmentId')
      .populate('managerProfileId', 'employeeNumber firstName middleName lastName workEmail')
      .populate('cycleId', 'name startDate endDate')
      .populate('templateId', 'name')
      .populate('assignmentId')
      .lean()
      .exec();

    // Filter by department if specified
    let filteredAppraisals = appraisals;
    if (departmentId) {
      filteredAppraisals = appraisals.filter((appraisal: any) => {
        const employee = appraisal.employeeProfileId;
        if (!employee) return false;
        const empDeptId = employee.primaryDepartmentId?._id?.toString() || employee.primaryDepartmentId?.toString();
        return empDeptId === departmentId;
      });
    }

    // Get assignments for department filter
    if (departmentId && filteredAppraisals.length === 0) {
      const assignments = await this.assignmentModel
        .find({ departmentId: new Types.ObjectId(departmentId) })
        .populate('latestAppraisalId')
        .lean()
        .exec();
      
      const appraisalIds = assignments
        .map(a => a.latestAppraisalId)
        .filter(id => id)
        .map(id => (id as any)._id || id);
      
      if (appraisalIds.length > 0) {
        filteredAppraisals = await this.evaluationModel
          .find({ 
            _id: { $in: appraisalIds },
            status: AppraisalRecordStatus.HR_PUBLISHED,
          })
          .populate('employeeProfileId', 'employeeNumber firstName middleName lastName workEmail primaryDepartmentId')
          .populate('managerProfileId', 'employeeNumber firstName middleName lastName workEmail')
          .populate('cycleId', 'name startDate endDate')
          .populate('templateId', 'name')
          .populate('assignmentId')
          .lean()
          .exec();
      }
    }

    // Prepare outcome data
    const outcomeData = filteredAppraisals.map((appraisal: any) => {
      const employee = appraisal.employeeProfileId || {};
      const manager = appraisal.managerProfileId || {};
      const cycle = appraisal.cycleId || {};
      const template = appraisal.templateId || {};
      const assignment = appraisal.assignmentId || {};
      const department = employee.primaryDepartmentId || {};

      // Extract high performer flag
      let isHighPerformer = false;
      let highPerformerNotes = '';
      if (appraisal.managerSummary) {
        const highPerformerMatch = appraisal.managerSummary.match(/\[HIGH_PERFORMER\](.*?)\[END_FLAG\]/s);
        if (highPerformerMatch) {
          try {
            const flagData = JSON.parse(highPerformerMatch[1]);
            isHighPerformer = flagData.isHighPerformer || false;
            highPerformerNotes = flagData.notes || '';
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      // Extract PIP data
      let hasPIP = false;
      let pipStatus = '';
      let pipTitle = '';
      if (appraisal.improvementAreas) {
        const pipMatch = appraisal.improvementAreas.match(/\[PIP_START\](.*?)\[PIP_END\]/s);
        if (pipMatch) {
          try {
            const pipData = JSON.parse(pipMatch[1]);
            hasPIP = true;
            pipStatus = pipData.status || '';
            pipTitle = pipData.title || '';
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      return {
        'Employee Number': employee.employeeNumber || '',
        'Employee Name': `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.trim(),
        'Employee Email': employee.workEmail || '',
        'Department': department.name || '',
        'Department Code': department.code || '',
        'Cycle Name': cycle.name || '',
        'Cycle Start': cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : '',
        'Cycle End': cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : '',
        'Template': template.name || '',
        'Total Score': appraisal.totalScore || '',
        'Overall Rating': appraisal.overallRatingLabel || '',
        'Manager Name': `${manager.firstName || ''} ${manager.middleName || ''} ${manager.lastName || ''}`.trim(),
        'Manager Email': manager.workEmail || '',
        'Manager Summary': appraisal.managerSummary || '',
        'Strengths': appraisal.strengths || '',
        'Improvement Areas': appraisal.improvementAreas || '',
        'Published Date': appraisal.hrPublishedAt ? new Date(appraisal.hrPublishedAt).toLocaleDateString() : '',
        'Acknowledged': appraisal.employeeAcknowledgedAt ? 'Yes' : 'No',
        'Acknowledged Date': appraisal.employeeAcknowledgedAt
          ? new Date(appraisal.employeeAcknowledgedAt).toLocaleDateString()
          : '',
        'High Performer': isHighPerformer ? 'Yes' : 'No',
        'High Performer Notes': highPerformerNotes,
        'Has PIP': hasPIP ? 'Yes' : 'No',
        'PIP Status': pipStatus,
        'PIP Title': pipTitle,
      };
    });

    // Get disputes if requested
    let disputeData: any[] = [];
    if (includeDisputes) {
      const disputeFilter: any = {};
      if (cycleId) {
        disputeFilter.cycleId = new Types.ObjectId(cycleId);
      }
      
      const disputes = await this.disputeModel
        .find(disputeFilter)
        .populate('appraisalId')
        .populate('raisedByEmployeeId', 'employeeNumber firstName middleName lastName workEmail')
        .populate('resolvedByEmployeeId', 'employeeNumber firstName middleName lastName workEmail')
        .lean()
        .exec();

      disputeData = disputes.map((dispute: any) => {
        const appraisal = dispute.appraisalId || {};
        const raisedBy = dispute.raisedByEmployeeId || {};
        const resolvedBy = dispute.resolvedByEmployeeId || {};
        
        return {
          'Dispute ID': dispute._id?.toString() || '',
          'Appraisal ID': appraisal._id?.toString() || '',
          'Raised By': `${raisedBy.firstName || ''} ${raisedBy.lastName || ''}`.trim(),
          'Raised By Email': raisedBy.workEmail || '',
          'Reason': dispute.reason || '',
          'Status': dispute.status || '',
          'Resolved By': resolvedBy ? `${resolvedBy.firstName || ''} ${resolvedBy.lastName || ''}`.trim() : '',
          'Resolution Notes': dispute.resolutionNotes || '',
          'Resolved Date': dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleDateString() : '',
          'Created Date': dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : '',
        };
      });
    }

    // Generate report based on format
    const timestamp = Date.now();
    
    if (format === 'csv') {
      // Generate CSV with multiple sections
      const sections: string[] = [];
      
      // Section 1: Performance Outcomes
      if (outcomeData.length > 0) {
        const headers = Object.keys(outcomeData[0]);
        sections.push('=== PERFORMANCE OUTCOMES ===');
        sections.push(headers.join(','));
        sections.push(...outcomeData.map(row =>
          headers.map(header => {
            const value = row[header] || '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${String(value).replace(/"/g, '""')}"`;
            }
            return String(value);
          }).join(',')
        ));
      }

      // Section 2: High Performers (if requested)
      if (includeHighPerformers && outcomeData.length > 0) {
        const highPerformers = outcomeData.filter(row => row['High Performer'] === 'Yes');
        if (highPerformers.length > 0) {
          sections.push('\n=== HIGH PERFORMERS ===');
          const hpHeaders = ['Employee Number', 'Employee Name', 'Employee Email', 'Department', 'Total Score', 'Overall Rating', 'High Performer Notes'];
          sections.push(hpHeaders.join(','));
          sections.push(...highPerformers.map(row =>
            hpHeaders.map(header => {
              const value = row[header] || '';
              if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${String(value).replace(/"/g, '""')}"`;
              }
              return String(value);
            }).join(',')
          ));
        }
      }

      // Section 3: Performance Improvement Plans (if requested)
      if (includePIPs && outcomeData.length > 0) {
        const pips = outcomeData.filter(row => row['Has PIP'] === 'Yes');
        if (pips.length > 0) {
          sections.push('\n=== PERFORMANCE IMPROVEMENT PLANS ===');
          const pipHeaders = ['Employee Number', 'Employee Name', 'Employee Email', 'Department', 'PIP Title', 'PIP Status', 'Total Score', 'Overall Rating'];
          sections.push(pipHeaders.join(','));
          sections.push(...pips.map(row =>
            pipHeaders.map(header => {
              const value = row[header] || '';
              if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${String(value).replace(/"/g, '""')}"`;
              }
              return String(value);
            }).join(',')
          ));
        }
      }

      // Section 4: Disputes (if requested)
      if (includeDisputes && disputeData.length > 0) {
        sections.push('\n=== DISPUTES ===');
        const disputeHeaders = Object.keys(disputeData[0]);
        sections.push(disputeHeaders.join(','));
        sections.push(...disputeData.map(row =>
          disputeHeaders.map(header => {
            const value = row[header] || '';
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${String(value).replace(/"/g, '""')}"`;
            }
            return String(value);
          }).join(',')
        ));
      }

      // Section 5: Summary Statistics
      sections.push('\n=== SUMMARY STATISTICS ===');
      const totalAppraisals = outcomeData.length;
      const acknowledged = outcomeData.filter(row => row['Acknowledged'] === 'Yes').length;
      const highPerformers = includeHighPerformers ? outcomeData.filter(row => row['High Performer'] === 'Yes').length : 0;
      const pips = includePIPs ? outcomeData.filter(row => row['Has PIP'] === 'Yes').length : 0;
      const disputes = includeDisputes ? disputeData.length : 0;
      const resolvedDisputes = includeDisputes ? disputeData.filter(row => row['Status'] === 'RESOLVED').length : 0;
      
      const avgScore = totalAppraisals > 0
        ? (outcomeData.reduce((sum, row) => sum + (parseFloat(row['Total Score']) || 0), 0) / totalAppraisals).toFixed(2)
        : '0.00';

      sections.push('Metric,Value');
      sections.push(`Total Appraisals,${totalAppraisals}`);
      sections.push(`Acknowledged,${acknowledged}`);
      sections.push(`Acknowledgment Rate,${totalAppraisals > 0 ? ((acknowledged / totalAppraisals) * 100).toFixed(2) : '0.00'}%`);
      sections.push(`Average Score,${avgScore}`);
      if (includeHighPerformers) {
        sections.push(`High Performers,${highPerformers}`);
      }
      if (includePIPs) {
        sections.push(`Performance Improvement Plans,${pips}`);
      }
      if (includeDisputes) {
        sections.push(`Total Disputes,${disputes}`);
        sections.push(`Resolved Disputes,${resolvedDisputes}`);
        sections.push(`Resolution Rate,${disputes > 0 ? ((resolvedDisputes / disputes) * 100).toFixed(2) : '0.00'}%`);
      }

      const csvContent = sections.join('\n');
      return {
        data: csvContent,
        filename: `outcome-report-${timestamp}.csv`,
        contentType: 'text/csv',
      };
    } else {
      // JSON format
      const reportData = {
        metadata: {
          generatedAt: new Date().toISOString(),
          cycleId: cycleId || 'All Cycles',
          departmentId: departmentId || 'All Departments',
          filters: {
            includeHighPerformers,
            includePIPs,
            includeDisputes,
          },
        },
        summary: {
          totalAppraisals: outcomeData.length,
          acknowledged: outcomeData.filter(row => row['Acknowledged'] === 'Yes').length,
          highPerformers: includeHighPerformers ? outcomeData.filter(row => row['High Performer'] === 'Yes').length : 0,
          pips: includePIPs ? outcomeData.filter(row => row['Has PIP'] === 'Yes').length : 0,
          disputes: includeDisputes ? disputeData.length : 0,
          resolvedDisputes: includeDisputes ? disputeData.filter(row => row['Status'] === 'RESOLVED').length : 0,
          averageScore: outcomeData.length > 0
            ? (outcomeData.reduce((sum, row) => sum + (parseFloat(row['Total Score']) || 0), 0) / outcomeData.length).toFixed(2)
            : '0.00',
        },
        performanceOutcomes: outcomeData,
        highPerformers: includeHighPerformers ? outcomeData.filter(row => row['High Performer'] === 'Yes') : [],
        performanceImprovementPlans: includePIPs ? outcomeData.filter(row => row['Has PIP'] === 'Yes') : [],
        disputes: includeDisputes ? disputeData : [],
      };

      return {
        data: JSON.stringify(reportData, null, 2),
        filename: `outcome-report-${timestamp}.json`,
        contentType: 'application/json',
      };
    }
  }

  /**
   * Visibility Rules Management (REQ-OD-16)
   * Stored in GridFS since we cannot create new schemas
   */

  private async loadVisibilityRules(): Promise<VisibilityRuleDto[]> {
    try {
      // Try to find existing file in GridFS
      const files = await this.visibilityRulesBucket
        .find({ filename: this.VISIBILITY_RULES_FILENAME })
        .sort({ uploadDate: -1 })
        .limit(1)
        .toArray();

      if (files.length > 0) {
        const file = files[0];
        try {
          const downloadStream = this.visibilityRulesBucket.openDownloadStream(
            file._id,
          );
          
          const chunks: Buffer[] = [];
          for await (const chunk of downloadStream) {
            chunks.push(chunk);
          }
          
          const data = Buffer.concat(chunks).toString('utf-8');
          const rules = JSON.parse(data);
          this.logger.log(`Loaded ${rules.length} visibility rules from GridFS`);
          return rules;
        } catch (downloadError: any) {
          // File reference exists but file is missing - delete the reference and recreate
          this.logger.warn(`Visibility rules file not found, recreating: ${downloadError.message}`);
          try {
            await this.visibilityRulesBucket.delete(file._id);
          } catch (deleteError) {
            this.logger.warn(`Could not delete missing file reference: ${deleteError}`);
          }
          // Fall through to create default rules
        }
      }
      
      // If no file exists, return defaults and initialize
      this.logger.log('No visibility rules file found, creating default rules');
      const defaultRules = this.getDefaultVisibilityRules();
      await this.saveVisibilityRules(defaultRules);
      return defaultRules;
    } catch (error) {
      this.logger.error('Error loading visibility rules:', error);
      // Return default rules as fallback
      return this.getDefaultVisibilityRules();
    }
  }

  private async saveVisibilityRules(rules: VisibilityRuleDto[]): Promise<void> {
    try {
      // Delete existing file if it exists
      const existingFiles = await this.visibilityRulesBucket
        .find({ filename: this.VISIBILITY_RULES_FILENAME })
        .toArray();
      
      for (const file of existingFiles) {
        await this.visibilityRulesBucket.delete(file._id);
      }

      // Upload new file
      const jsonData = JSON.stringify(rules, null, 2);
      const readableStream = new Readable();
      readableStream.push(jsonData);
      readableStream.push(null);

      const uploadStream = this.visibilityRulesBucket.openUploadStream(
        this.VISIBILITY_RULES_FILENAME,
        {
          contentType: 'application/json',
          metadata: {
            updatedAt: new Date(),
          },
        },
      );

      await new Promise<void>((resolve, reject) => {
        readableStream
          .pipe(uploadStream)
          .on('finish', () => resolve())
          .on('error', (error) => reject(error));
      });
    } catch (error) {
      this.logger.error('Error saving visibility rules:', error);
      throw new BadRequestException('Failed to save visibility rules');
    }
  }

  private getDefaultVisibilityRules(): VisibilityRuleDto[] {
    return [
      {
        id: '1',
        name: 'Manager Summary - Default',
        description: 'Manager summary visible to employee, manager, and HR',
        fieldType: FeedbackFieldType.MANAGER_SUMMARY,
        allowedRoles: [
          SystemRole.DEPARTMENT_EMPLOYEE,
          SystemRole.DEPARTMENT_HEAD,
          SystemRole.HR_EMPLOYEE,
          SystemRole.HR_MANAGER,
          SystemRole.HR_ADMIN,
          SystemRole.SYSTEM_ADMIN,
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Ratings - Default',
        description: 'Ratings visible to employee, manager, and HR',
        fieldType: FeedbackFieldType.RATINGS,
        allowedRoles: [
          SystemRole.DEPARTMENT_EMPLOYEE,
          SystemRole.DEPARTMENT_HEAD,
          SystemRole.HR_EMPLOYEE,
          SystemRole.HR_MANAGER,
          SystemRole.HR_ADMIN,
          SystemRole.SYSTEM_ADMIN,
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Self Assessment - Default',
        description: 'Self assessment visible to employee and manager',
        fieldType: FeedbackFieldType.SELF_ASSESSMENT,
        allowedRoles: [
          SystemRole.DEPARTMENT_EMPLOYEE,
          SystemRole.DEPARTMENT_HEAD,
          SystemRole.HR_MANAGER,
          SystemRole.HR_ADMIN,
          SystemRole.SYSTEM_ADMIN,
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getAllVisibilityRules(): Promise<VisibilityRuleDto[]> {
    return await this.loadVisibilityRules();
  }

  async getVisibilityRuleById(id: string): Promise<VisibilityRuleDto> {
    const rules = await this.loadVisibilityRules();
    const rule = rules.find((r) => r.id === id);
    if (!rule) {
      throw new NotFoundException(`Visibility rule with ID ${id} not found`);
    }
    return rule;
  }

  async createVisibilityRule(
    createDto: CreateVisibilityRuleDto,
  ): Promise<VisibilityRuleDto> {
    const rules = await this.loadVisibilityRules();
    const newRule: VisibilityRuleDto = {
      id: Date.now().toString(),
      name: createDto.name,
      description: createDto.description,
      fieldType: createDto.fieldType,
      allowedRoles: createDto.allowedRoles,
      isActive: createDto.isActive ?? true,
      effectiveFrom: createDto.effectiveFrom
        ? new Date(createDto.effectiveFrom)
        : undefined,
      effectiveTo: createDto.effectiveTo
        ? new Date(createDto.effectiveTo)
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    rules.push(newRule);
    this.logger.log(`Creating visibility rule: ${newRule.name} for field ${newRule.fieldType} with allowed roles: [${newRule.allowedRoles.join(', ')}]`);
    await this.saveVisibilityRules(rules);
    this.logger.log(`Successfully saved ${rules.length} visibility rules to GridFS`);
    return newRule;
  }

  async updateVisibilityRule(
    id: string,
    updateDto: UpdateVisibilityRuleDto,
  ): Promise<VisibilityRuleDto> {
    const rules = await this.loadVisibilityRules();
    const index = rules.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new NotFoundException(`Visibility rule with ID ${id} not found`);
    }

    const updatedRule: VisibilityRuleDto = {
      ...rules[index],
      ...(updateDto.name && { name: updateDto.name }),
      ...(updateDto.description !== undefined && {
        description: updateDto.description,
      }),
      ...(updateDto.fieldType && { fieldType: updateDto.fieldType }),
      ...(updateDto.allowedRoles && { allowedRoles: updateDto.allowedRoles }),
      ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
      ...(updateDto.effectiveFrom && {
        effectiveFrom: new Date(updateDto.effectiveFrom),
      }),
      ...(updateDto.effectiveTo && {
        effectiveTo: new Date(updateDto.effectiveTo),
      }),
      updatedAt: new Date(),
    };

    rules[index] = updatedRule;
    await this.saveVisibilityRules(rules);
    return updatedRule;
  }

  async deleteVisibilityRule(id: string): Promise<void> {
    const rules = await this.loadVisibilityRules();
    const filtered = rules.filter((r) => r.id !== id);
    if (filtered.length === rules.length) {
      throw new NotFoundException(`Visibility rule with ID ${id} not found`);
    }
    await this.saveVisibilityRules(filtered);
  }

  async getActiveVisibilityRules(): Promise<VisibilityRuleDto[]> {
    const rules = await this.loadVisibilityRules();
    const now = new Date();
    const activeRules = rules.filter((rule) => {
      if (!rule.isActive) return false;
      if (rule.effectiveFrom && new Date(rule.effectiveFrom) > now)
        return false;
      if (rule.effectiveTo && new Date(rule.effectiveTo) < now) return false;
      return true;
    });
    this.logger.debug(`Found ${activeRules.length} active visibility rules out of ${rules.length} total rules`);
    return activeRules;
  }

  /**
   * Check if a user role can view a specific feedback field
   */
  async canViewField(
    fieldType: FeedbackFieldType,
    userRole: SystemRole,
  ): Promise<boolean> {
    try {
      const activeRules = await this.getActiveVisibilityRules();
      
      // Log all active rules for debugging
      if (activeRules.length > 0) {
        this.logger.debug(`Active visibility rules: ${activeRules.map(r => `${r.fieldType}(${r.name})`).join(', ')}`);
      }
      
      const rule = activeRules.find((r) => r.fieldType === fieldType);
      if (!rule) {
        // Default: allow if no rule exists
        this.logger.debug(`No visibility rule found for ${fieldType}, allowing access by default. Available rules: ${activeRules.map(r => r.fieldType).join(', ') || 'none'}`);
        return true;
      }
      const canView = rule.allowedRoles.includes(userRole);
      this.logger.debug(`Visibility check for ${fieldType}: role ${userRole} canView=${canView}, allowedRoles=[${rule.allowedRoles.join(', ')}]`);
      return canView;
    } catch (error) {
      this.logger.error(`Error checking visibility for ${fieldType}:`, error);
      // Default to allowing access if there's an error
      return true;
    }
  }

  /**
   * 1-on-1 Meeting Management (REQ-OD-14)
   * Stored in GridFS since we cannot create new schemas
   */

  private async loadMeetings(): Promise<OneOnOneMeetingDto[]> {
    try {
      // Try to find existing file in GridFS
      const files = await this.meetingsBucket
        .find({ filename: this.MEETINGS_FILENAME })
        .sort({ uploadDate: -1 })
        .limit(1)
        .toArray();

      if (files.length > 0) {
        const file = files[0];
        const downloadStream = this.meetingsBucket.openDownloadStream(
          file._id,
        );
        
        const chunks: Buffer[] = [];
        for await (const chunk of downloadStream) {
          chunks.push(chunk);
        }
        
        const data = Buffer.concat(chunks).toString('utf-8');
        return JSON.parse(data);
      }
      
      return [];
    } catch (error) {
      this.logger.error('Error loading meetings:', error);
      return [];
    }
  }

  private async saveMeetings(meetings: OneOnOneMeetingDto[]): Promise<void> {
    try {
      // Delete existing file if it exists
      const existingFiles = await this.meetingsBucket
        .find({ filename: this.MEETINGS_FILENAME })
        .toArray();
      
      for (const file of existingFiles) {
        await this.meetingsBucket.delete(file._id);
      }

      // Upload new file
      const jsonData = JSON.stringify(meetings, null, 2);
      const readableStream = new Readable();
      readableStream.push(jsonData);
      readableStream.push(null);

      const uploadStream = this.meetingsBucket.openUploadStream(
        this.MEETINGS_FILENAME,
        {
          contentType: 'application/json',
          metadata: {
            updatedAt: new Date(),
          },
        },
      );

      await new Promise<void>((resolve, reject) => {
        readableStream
          .pipe(uploadStream)
          .on('finish', () => resolve())
          .on('error', (error) => reject(error));
      });
    } catch (error) {
      this.logger.error('Error saving meetings:', error);
      throw new BadRequestException('Failed to save meeting');
    }
  }

  async createOneOnOneMeeting(
    managerId: string,
    createDto: CreateOneOnOneMeetingDto,
  ): Promise<OneOnOneMeetingDto> {
    // First verify manager is a department head by position (not just by role)
    const isManagerDepartmentHead = await this.isManagerDepartmentHeadByPosition(managerId);
    if (!isManagerDepartmentHead) {
      throw new ForbiddenException(
        'Only department heads can schedule meetings. You must be assigned as a department head position.',
      );
    }

    // Verify manager is authorized (is direct manager or department head of employee's department)
    const employee = await this.employeeModel.findById(createDto.employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const manager = await this.employeeModel.findById(managerId);
    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    // Check if manager is the direct manager (employee's supervisorPositionId matches manager's primaryPositionId)
    const isDirectManager =
      employee.supervisorPositionId?.toString() ===
      manager.primaryPositionId?.toString();
    
    // Check if manager is department head of employee's department
    const isDepartmentHead = employee.primaryDepartmentId
      ? await this.isDepartmentHead(managerId, employee.primaryDepartmentId.toString())
      : false;

    if (!isDirectManager && !isDepartmentHead) {
      throw new ForbiddenException(
        'You can only schedule meetings with your direct reports or employees in your department',
      );
    }

    const meetings = await this.loadMeetings();
    const newMeeting: OneOnOneMeetingDto = {
      id: Date.now().toString(),
      managerId,
      employeeId: createDto.employeeId,
      scheduledDate: new Date(createDto.scheduledDate),
      agenda: createDto.agenda,
      meetingNotes: createDto.meetingNotes,
      status: MeetingStatus.SCHEDULED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    meetings.push(newMeeting);
    await this.saveMeetings(meetings);

    // Send notification to employee
    try {
      const managerName = manager.firstName && manager.lastName
        ? `${manager.firstName} ${manager.lastName}`
        : 'Your manager';
      const meetingDate = new Date(createDto.scheduledDate).toLocaleString();
      const message = `A 1-on-1 meeting has been scheduled with ${managerName} on ${meetingDate}.${createDto.agenda ? ` Agenda: ${createDto.agenda}` : ''}`;

      await this.notificationLogModel.create({
        to: new Types.ObjectId(createDto.employeeId),
        type: 'one_on_one_meeting_scheduled',
        message,
      });

      this.logger.log(
        `1-on-1 meeting notification sent to employee ${createDto.employeeId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification for 1-on-1 meeting:`,
        error,
      );
      // Don't throw - notification failure shouldn't block meeting creation
    }

    return newMeeting;
  }

  async getMeetingsByManager(managerId: string): Promise<OneOnOneMeetingDto[]> {
    // Verify manager is a department head by position (not just by role)
    const isDepartmentHeadByPosition = await this.isManagerDepartmentHeadByPosition(managerId);
    if (!isDepartmentHeadByPosition) {
      throw new ForbiddenException(
        'Only department heads can view meetings. You must be assigned as a department head position.',
      );
    }

    const meetings = await this.loadMeetings();
    return meetings.filter((m) => m.managerId === managerId);
  }

  /**
   * Check if a manager is a department head by position (their primaryPositionId matches any department's headPositionId)
   */
  private async isManagerDepartmentHeadByPosition(managerId: string): Promise<boolean> {
    try {
      const manager = await this.employeeModel.findById(managerId).exec();
      if (!manager || !manager.primaryPositionId) {
        return false;
      }

      // Check if manager's position is a head position in any department
      const department = await this.departmentModel
        .findOne({
          headPositionId: manager.primaryPositionId,
          isActive: true,
        })
        .lean()
        .exec();

      return !!department;
    } catch (error) {
      return false;
    }
  }

  async getMeetingsByEmployee(
    employeeId: string,
  ): Promise<OneOnOneMeetingDto[]> {
    const meetings = await this.loadMeetings();
    return meetings.filter((m) => m.employeeId === employeeId);
  }

  async getMeetingById(id: string): Promise<OneOnOneMeetingDto> {
    const meetings = await this.loadMeetings();
    const meeting = meetings.find((m) => m.id === id);
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return meeting;
  }

  async updateOneOnOneMeeting(
    id: string,
    managerId: string,
    updateDto: UpdateOneOnOneMeetingDto,
  ): Promise<OneOnOneMeetingDto> {
    const meetings = await this.loadMeetings();
    const index = meetings.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }

    const meeting = meetings[index];
    if (meeting.managerId !== managerId) {
      throw new ForbiddenException('You can only update your own meetings');
    }

    const updatedMeeting: OneOnOneMeetingDto = {
      ...meeting,
      ...(updateDto.scheduledDate && {
        scheduledDate: new Date(updateDto.scheduledDate),
      }),
      ...(updateDto.agenda !== undefined && { agenda: updateDto.agenda }),
      ...(updateDto.meetingNotes !== undefined && {
        meetingNotes: updateDto.meetingNotes,
      }),
      ...(updateDto.status && { status: updateDto.status }),
      ...(updateDto.status === MeetingStatus.COMPLETED && {
        completedAt: new Date(),
      }),
      ...(updateDto.status === MeetingStatus.CANCELLED && {
        cancelledAt: new Date(),
      }),
      updatedAt: new Date(),
    };

    meetings[index] = updatedMeeting;
    await this.saveMeetings(meetings);
    return updatedMeeting;
  }

  async deleteOneOnOneMeeting(id: string, managerId: string): Promise<void> {
    const meetings = await this.loadMeetings();
    const meeting = meetings.find((m) => m.id === id);
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    if (meeting.managerId !== managerId) {
      throw new ForbiddenException('You can only delete your own meetings');
    }
    const filtered = meetings.filter((m) => m.id !== id);
    await this.saveMeetings(filtered);
  }

  private async isDepartmentHead(
    managerId: string,
    departmentId: string,
  ): Promise<boolean> {
    try {
      const department = await this.departmentModel.findById(departmentId);
      if (!department || !department.headPositionId) {
        return false;
      }
      const manager = await this.employeeModel.findById(managerId);
      if (!manager) {
        return false;
      }
      return (
        manager.primaryPositionId?.toString() ===
        department.headPositionId.toString()
      );
    } catch (error) {
      return false;
    }
  }
}
