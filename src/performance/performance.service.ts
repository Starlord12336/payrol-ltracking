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
} from './schemas/appraisal-template.schema';
import {
  AppraisalCycle,
  AppraisalCycleDocument,
  CycleStatus,
  AssignmentStatus,
  CycleAssignment,
} from './schemas/appraisal-cycle.schema';
import {
  AppraisalEvaluation,
  AppraisalEvaluationDocument,
  EvaluationStatus,
  PerformanceCategory,
} from './schemas/appraisal-evaluation.schema';
import {
  AppraisalDispute,
  AppraisalDisputeDocument,
  DisputeStatus,
  ResolutionType,
} from './schemas/appraisal-dispute.schema';
import {
  PerformanceGoal,
  PerformanceGoalDocument,
  GoalStatus,
} from './schemas/performance-goal.schema';
import {
  PerformanceFeedback,
  PerformanceFeedbackDocument,
  FeedbackStatus,
} from './schemas/performance-feedback.schema';
import {
  PerformanceHistory,
  PerformanceHistoryDocument,
} from './schemas/performance-history.schema';
// Integration schemas (from shared)
import { EmployeeProfile, EmployeeProfileDocument } from '../shared/schemas/employee-profile.schema';
import { Department, DepartmentDocument } from '../shared/schemas/department.schema';
import { Position, PositionDocument } from '../shared/schemas/position.schema';
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

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(AppraisalTemplate.name)
    private templateModel: Model<AppraisalTemplateDocument>,
    @InjectModel(AppraisalCycle.name)
    private cycleModel: Model<AppraisalCycleDocument>,
    @InjectModel(AppraisalEvaluation.name)
    private evaluationModel: Model<AppraisalEvaluationDocument>,
    @InjectModel(AppraisalDispute.name)
    private disputeModel: Model<AppraisalDisputeDocument>,
    @InjectModel(PerformanceGoal.name)
    private goalModel: Model<PerformanceGoalDocument>,
    @InjectModel(PerformanceFeedback.name)
    private feedbackModel: Model<PerformanceFeedbackDocument>,
    @InjectModel(PerformanceHistory.name)
    private historyModel: Model<PerformanceHistoryDocument>,
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
   * Create a new appraisal template with weight validation
   */
  async createTemplate(
    createDto: CreateAppraisalTemplateDto,
  ): Promise<AppraisalTemplate> {
    // Validate that section weights sum to 100%
    if (createDto.sections && createDto.sections.length > 0) {
      const totalSectionWeight = createDto.sections.reduce(
        (sum, section) => sum + (section.weight || 0),
        0,
      );
      if (totalSectionWeight > 0 && Math.abs(totalSectionWeight - 100) > 0.01) {
        throw new BadRequestException(
          `Section weights must sum to 100%. Current sum: ${totalSectionWeight}%`,
        );
      }

      // Validate that criteria weights within each section sum to 100%
      for (const section of createDto.sections) {
        if (section.criteria && section.criteria.length > 0) {
          const totalCriteriaWeight = section.criteria.reduce(
            (sum, criterion) => sum + (criterion.weight || 0),
            0,
          );
          if (totalCriteriaWeight > 0 && Math.abs(totalCriteriaWeight - 100) > 0.01) {
            throw new BadRequestException(
              `Criteria weights in section "${section.sectionName}" must sum to 100%. Current sum: ${totalCriteriaWeight}%`,
            );
          }
        }
      }
    }

    // Convert string IDs to ObjectIds
    // Use a dummy user ID for createdBy/updatedBy (in real app, get from auth context)
    const dummyUserId = new Types.ObjectId('507f1f77bcf86cd799439011');
    
    const template = new this.templateModel({
      ...createDto,
      applicableDepartments: createDto.applicableDepartmentIds?.map(
        (id) => new Types.ObjectId(id),
      ) || [],
      applicablePositions: createDto.applicablePositionIds?.map(
        (id) => new Types.ObjectId(id),
      ) || [],
      createdBy: dummyUserId,
      updatedBy: dummyUserId,
    });

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
      .populate('applicableDepartments')
      .populate('applicablePositions')
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
    // Validate weights if sections are being updated
    if (updateDto.sections && updateDto.sections.length > 0) {
      const totalSectionWeight = updateDto.sections.reduce(
        (sum, section) => sum + (section.weight || 0),
        0,
      );
      if (totalSectionWeight > 0 && Math.abs(totalSectionWeight - 100) > 0.01) {
        throw new BadRequestException(
          `Section weights must sum to 100%. Current sum: ${totalSectionWeight}%`,
        );
      }

      // Validate that criteria weights within each section sum to 100%
      for (const section of updateDto.sections) {
        if (section.criteria && section.criteria.length > 0) {
          const totalCriteriaWeight = section.criteria.reduce(
            (sum, criterion) => sum + (criterion.weight || 0),
            0,
          );
          if (totalCriteriaWeight > 0 && Math.abs(totalCriteriaWeight - 100) > 0.01) {
            throw new BadRequestException(
              `Criteria weights in section "${section.sectionName}" must sum to 100%. Current sum: ${totalCriteriaWeight}%`,
            );
          }
        }
      }
    }

    const updated = await this.templateModel
      .findByIdAndUpdate(id, updateDto, { new: true })
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

    // Validate templateId
    if (!createDto.templateId || !Types.ObjectId.isValid(createDto.templateId)) {
      throw new BadRequestException('Invalid templateId');
    }

    // Use a dummy user ID for createdBy/updatedBy (in real app, get from auth context)
    const dummyUserId = new Types.ObjectId('507f1f77bcf86cd799439011');
    
    // Helper function to safely convert array of IDs
    const convertToObjectIds = (ids?: string[]): Types.ObjectId[] => {
      if (!ids || ids.length === 0) return [];
      return ids
        .filter(id => id && Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));
    };
    
    const cycle = new this.cycleModel({
      cycleCode: createDto.cycleCode,
      cycleName: createDto.cycleName,
      description: createDto.description,
      appraisalType: createDto.appraisalType,
      templateId: new Types.ObjectId(createDto.templateId),
      startDate,
      endDate,
      selfAssessmentDeadline: createDto.selfAssessmentDeadline
        ? new Date(createDto.selfAssessmentDeadline)
        : undefined,
      managerReviewDeadline: new Date(createDto.managerReviewDeadline),
      hrReviewDeadline: createDto.hrReviewDeadline
        ? new Date(createDto.hrReviewDeadline)
        : undefined,
      disputeDeadline: createDto.disputeDeadline
        ? new Date(createDto.disputeDeadline)
        : undefined,
      targetEmployees: convertToObjectIds(createDto.targetEmployeeIds),
      targetDepartments: convertToObjectIds(createDto.targetDepartmentIds),
      targetPositions: convertToObjectIds(createDto.targetPositionIds),
      excludeEmployees: convertToObjectIds(createDto.excludeEmployeeIds),
      status: CycleStatus.DRAFT,
      assignments: [],
      createdBy: dummyUserId,
      updatedBy: dummyUserId,
    });

    return cycle.save();
  }

  /**
   * Get all cycles
   */
  async findAllCycles(status?: CycleStatus): Promise<AppraisalCycleDocument[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.cycleModel
      .find(filter)
      .populate('templateId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a single cycle by ID
   */
  async findCycleById(id: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.cycleModel
      .findById(id)
      .populate('templateId')
      .populate('targetEmployees')
      .populate('targetDepartments')
      .populate('targetPositions')
      .populate('assignments.employeeId')
      .populate('assignments.reviewerId')
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
      updateData.managerReviewDeadline = new Date(updateDto.managerReviewDeadline);
    }
    if (updateDto.selfAssessmentDeadline) {
      updateData.selfAssessmentDeadline = new Date(updateDto.selfAssessmentDeadline);
    }
    if (updateDto.hrReviewDeadline) {
      updateData.hrReviewDeadline = new Date(updateDto.hrReviewDeadline);
    }
    if (updateDto.disputeDeadline) {
      updateData.disputeDeadline = new Date(updateDto.disputeDeadline);
    }

    // Convert string IDs to ObjectIds
    if (updateDto.targetEmployeeIds) {
      updateData.targetEmployees = updateDto.targetEmployeeIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (updateDto.targetDepartmentIds) {
      updateData.targetDepartments = updateDto.targetDepartmentIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (updateDto.targetPositionIds) {
      updateData.targetPositions = updateDto.targetPositionIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (updateDto.excludeEmployeeIds) {
      updateData.excludeEmployees = updateDto.excludeEmployeeIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (updateDto.templateId) {
      updateData.templateId = new Types.ObjectId(updateDto.templateId);
    }

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
    
    if (cycle.status !== CycleStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot activate cycle. Current status: ${cycle.status}`,
      );
    }

    // Auto-assign appraisals based on cycle scope
    await this.autoAssignAppraisals(cycle);

    cycle.status = CycleStatus.ACTIVE;
    return cycle.save();
  }

  /**
   * Auto-assign appraisals for a cycle
   * Integrates with Employee Profile and Organization Structure modules
   */
  private async autoAssignAppraisals(cycle: AppraisalCycleDocument): Promise<void> {
    const template = await this.templateModel.findById(cycle.templateId).exec();
    if (!template || !template.isActive) {
      throw new BadRequestException('Template not found or inactive');
    }

    // Build employee query based on cycle scope
    let employeeQuery: any = {
      status: { $in: [EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION] },
    };

    // Filter by target employees, departments, or positions
    if (cycle.targetEmployees && cycle.targetEmployees.length > 0) {
      employeeQuery._id = { $in: cycle.targetEmployees };
    } else if (cycle.targetDepartments && cycle.targetDepartments.length > 0) {
      employeeQuery.primaryDepartmentId = { $in: cycle.targetDepartments };
    } else if (cycle.targetPositions && cycle.targetPositions.length > 0) {
      employeeQuery.primaryPositionId = { $in: cycle.targetPositions };
    } else if (template.applicableDepartments && template.applicableDepartments.length > 0) {
      employeeQuery.primaryDepartmentId = { $in: template.applicableDepartments };
    }

    // Exclude specified employees
    if (cycle.excludeEmployees && cycle.excludeEmployees.length > 0) {
      employeeQuery._id = {
        ...(employeeQuery._id || {}),
        $nin: cycle.excludeEmployees,
      };
    }

    const employees = await this.employeeModel.find(employeeQuery).exec();
    const newAssignments: CycleAssignment[] = [];

    // For each employee, determine their manager and create assignment
    for (const employee of employees) {
      // Check if assignment already exists
      const existingAssignment = cycle.assignments.find(
        (a) => a.employeeId.toString() === employee._id.toString(),
      );
      if (existingAssignment) {
        continue; // Skip if already assigned
      }

      // Get manager from organization structure
      let managerId: Types.ObjectId | undefined;

      if (employee.supervisorPositionId) {
        // Find employee assigned to the supervisor position
        const manager = await this.employeeModel
          .findOne({
            primaryPositionId: employee.supervisorPositionId,
            status: EmployeeStatus.ACTIVE,
          })
          .exec();

        if (manager) {
          managerId = manager._id;
        }
      }

      // If no supervisor position, try department head
      if (!managerId && employee.primaryDepartmentId) {
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
            managerId = manager._id;
          }
        }
      }

      // Skip if no manager found (top-level employees)
      if (!managerId) {
        continue;
      }

      // Create assignment and add to cycle
      const assignment: CycleAssignment = {
        employeeId: employee._id as any,
        reviewerId: managerId as any,
        selfAssessmentRequired: template.requiresSelfAssessment || false,
        status: AssignmentStatus.NOT_STARTED,
        assignedAt: new Date(),
      };

      newAssignments.push(assignment);
    }

    // Add all new assignments to cycle
    cycle.assignments.push(...newAssignments);
    await cycle.save();
  }

  /**
   * Publish cycle results to employees
   */
  async publishCycle(id: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.findCycleById(id);
    
    if (cycle.status !== CycleStatus.ACTIVE && cycle.status !== CycleStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot publish cycle. Current status: ${cycle.status}`,
      );
    }

    // Update all evaluations to PUBLISHED status
    await this.evaluationModel.updateMany(
      { cycleId: new Types.ObjectId(id) },
      { 
        status: EvaluationStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    ).exec();

    // Update cycle assignments status
    cycle.assignments.forEach((assignment) => {
      if (assignment.status === AssignmentStatus.MANAGER_REVIEW_PENDING) {
        assignment.status = AssignmentStatus.COMPLETED;
      }
    });

    cycle.resultsPublished = true;
    cycle.publishedAt = new Date();
    return cycle.save();
  }

  /**
   * Close a cycle
   */
  async closeCycle(id: string): Promise<AppraisalCycleDocument> {
    const cycle = await this.findCycleById(id);
    
    if (cycle.status !== CycleStatus.ACTIVE && cycle.status !== CycleStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot close cycle. Current status: ${cycle.status}`,
      );
    }

    cycle.status = CycleStatus.COMPLETED;
    return cycle.save();
  }

  // ==================== APPRAISAL ASSIGNMENT METHODS ====================

  /**
   * Get all assignments for a cycle
   */
  async findAssignmentsByCycle(cycleId: string): Promise<CycleAssignment[]> {
    const cycle = await this.findCycleById(cycleId);
    return cycle.assignments;
  }

  /**
   * Get assignments for a manager
   */
  async findAssignmentsByManager(
    managerId: string,
    cycleId?: string,
  ): Promise<CycleAssignment[]> {
    if (cycleId) {
      const cycle = await this.findCycleById(cycleId);
      return cycle.assignments.filter(
        (a) => a.reviewerId.toString() === managerId,
      );
    }

    // If no cycleId, search across all cycles
    const cycles = await this.cycleModel
      .find({ status: { $in: [CycleStatus.ACTIVE, CycleStatus.IN_PROGRESS] } })
      .populate('assignments.reviewerId')
      .exec();

    const allAssignments: CycleAssignment[] = [];
    cycles.forEach((cycle) => {
      const managerAssignments = cycle.assignments.filter(
        (a) => a.reviewerId.toString() === managerId,
      );
      allAssignments.push(...managerAssignments);
    });

    return allAssignments;
  }

  /**
   * Get assignments for an employee
   */
  async findAssignmentsByEmployee(
    employeeId: string,
    cycleId?: string,
  ): Promise<CycleAssignment[]> {
    if (cycleId) {
      const cycle = await this.findCycleById(cycleId);
      return cycle.assignments.filter(
        (a) => a.employeeId.toString() === employeeId,
      );
    }

    // If no cycleId, search across all cycles
    const cycles = await this.cycleModel
      .find({ status: { $in: [CycleStatus.ACTIVE, CycleStatus.IN_PROGRESS] } })
      .populate('assignments.employeeId')
      .exec();

    const allAssignments: CycleAssignment[] = [];
    cycles.forEach((cycle) => {
      const employeeAssignments = cycle.assignments.filter(
        (a) => a.employeeId.toString() === employeeId,
      );
      allAssignments.push(...employeeAssignments);
    });

    return allAssignments;
  }

  /**
   * Get a single assignment by employee and cycle
   */
  async findAssignmentByEmployeeAndCycle(
    employeeId: string,
    cycleId: string,
  ): Promise<CycleAssignment> {
    const cycle = await this.findCycleById(cycleId);
    const assignment = cycle.assignments.find(
      (a) => a.employeeId.toString() === employeeId,
    );
    if (!assignment) {
      throw new NotFoundException(
        `Assignment not found for employee ${employeeId} in cycle ${cycleId}`,
      );
    }
    return assignment;
  }

  // ==================== APPRAISAL EVALUATION METHODS ====================

  /**
   * Create or update an appraisal evaluation
   */
  async createOrUpdateEvaluation(
    cycleId: string,
    employeeId: string,
    createDto: CreateAppraisalEvaluationDto,
  ): Promise<AppraisalEvaluationDocument> {
    const cycle = await this.findCycleById(cycleId);
    
    // Check if cycle is active
    if (cycle.status !== CycleStatus.ACTIVE && cycle.status !== CycleStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot modify evaluation for inactive cycle');
    }

    // Verify assignment exists
    const assignment = cycle.assignments.find(
      (a) => a.employeeId.toString() === employeeId,
    );
    if (!assignment) {
      throw new NotFoundException(
        `No assignment found for employee ${employeeId} in cycle ${cycleId}`,
      );
    }

    if (assignment.status === AssignmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot modify completed evaluation');
    }

    // Get template to calculate scores
    const template = await this.findTemplateById(createDto.templateId);

    // Calculate final rating from manager evaluation
    const finalRating = this.calculateFinalRating(
      createDto.managerEvaluation,
      template as any,
    );

    // Determine performance category
    const performanceCategory = this.determinePerformanceCategory(
      finalRating,
      template.ratingScale,
    );

    // Check if evaluation already exists
    let evaluation = await this.evaluationModel
      .findOne({
        cycleId: new Types.ObjectId(cycleId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .exec();

    if (evaluation) {
      // Update existing evaluation
      evaluation.selfAssessment = createDto.selfAssessment
        ? {
            submittedAt: new Date(),
            sections: createDto.selfAssessment.sections,
            overallComments: createDto.selfAssessment.overallComments,
          }
        : evaluation.selfAssessment;
      evaluation.managerEvaluation = {
        submittedAt: new Date(),
        sections: createDto.managerEvaluation.sections,
        overallRating: createDto.managerEvaluation.overallRating || finalRating,
        strengths: createDto.managerEvaluation.strengths,
        areasForImprovement: createDto.managerEvaluation.areasForImprovement,
        developmentRecommendations: createDto.managerEvaluation.developmentRecommendations,
        attendanceScore: createDto.managerEvaluation.attendanceScore,
        punctualityScore: createDto.managerEvaluation.punctualityScore,
        attendanceComments: createDto.managerEvaluation.attendanceComments,
      };
      evaluation.finalRating = finalRating;
      evaluation.performanceCategory = performanceCategory;
      evaluation.status = EvaluationStatus.MANAGER_REVIEW_SUBMITTED;
    } else {
      // Create new evaluation
      evaluation = new this.evaluationModel({
        cycleId: new Types.ObjectId(cycleId),
        templateId: new Types.ObjectId(createDto.templateId),
        employeeId: new Types.ObjectId(employeeId),
        reviewerId: assignment.reviewerId,
        selfAssessment: createDto.selfAssessment
          ? {
              submittedAt: new Date(),
              sections: createDto.selfAssessment.sections,
              overallComments: createDto.selfAssessment.overallComments,
            }
          : undefined,
        managerEvaluation: {
          submittedAt: new Date(),
          sections: createDto.managerEvaluation.sections,
          overallRating: createDto.managerEvaluation.overallRating || finalRating,
          strengths: createDto.managerEvaluation.strengths,
          areasForImprovement: createDto.managerEvaluation.areasForImprovement,
          developmentRecommendations: createDto.managerEvaluation.developmentRecommendations,
          attendanceScore: createDto.managerEvaluation.attendanceScore,
          punctualityScore: createDto.managerEvaluation.punctualityScore,
          attendanceComments: createDto.managerEvaluation.attendanceComments,
        },
        finalRating,
        performanceCategory,
        status: createDto.selfAssessment
          ? EvaluationStatus.SELF_ASSESSMENT_SUBMITTED
          : EvaluationStatus.MANAGER_REVIEW_SUBMITTED,
      });
    }

    const savedEvaluation = await evaluation.save();

    // Update assignment status
    assignment.status = createDto.selfAssessment
      ? AssignmentStatus.MANAGER_REVIEW_PENDING
      : AssignmentStatus.MANAGER_REVIEW_PENDING;
    await cycle.save();

    return savedEvaluation;
  }

  /**
   * Get evaluation by cycle and employee
   */
  async findEvaluationByCycleAndEmployee(
    cycleId: string,
    employeeId: string,
  ): Promise<AppraisalEvaluationDocument | null> {
    return this.evaluationModel
      .findOne({
        cycleId: new Types.ObjectId(cycleId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .populate('employeeId')
      .populate('reviewerId')
      .populate('templateId')
      .populate('cycleId')
      .exec();
  }

  /**
   * Get evaluation by ID
   */
  async findEvaluationById(id: string): Promise<AppraisalEvaluationDocument> {
    const evaluation = await this.evaluationModel
      .findById(id)
      .populate('employeeId')
      .populate('reviewerId')
      .populate('templateId')
      .populate('cycleId')
      .exec();
    if (!evaluation) {
      throw new NotFoundException(`Appraisal evaluation with ID ${id} not found`);
    }
    return evaluation;
  }

  /**
   * Employee acknowledges appraisal
   */
  async acknowledgeEvaluation(
    evaluationId: string,
    comment?: string,
  ): Promise<AppraisalEvaluationDocument> {
    const evaluation = await this.findEvaluationById(evaluationId);

    if (evaluation.status !== EvaluationStatus.PUBLISHED) {
      throw new BadRequestException(
        `Cannot acknowledge evaluation. Current status: ${evaluation.status}`,
      );
    }

    evaluation.acknowledgedAt = new Date();
    evaluation.employeeComments = comment;
    evaluation.status = EvaluationStatus.ACKNOWLEDGED;

    // Update cycle assignment status
    const cycle = await this.findCycleById(evaluation.cycleId.toString());
    const assignment = cycle.assignments.find(
      (a) => a.employeeId.toString() === evaluation.employeeId.toString(),
    );
    if (assignment) {
      assignment.status = AssignmentStatus.COMPLETED;
      await cycle.save();
    }

    return evaluation.save();
  }

  /**
   * Calculate final rating from manager evaluation sections
   */
  private calculateFinalRating(
    managerEvaluation: any,
    template: AppraisalTemplateDocument,
  ): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Calculate weighted score for each section
    managerEvaluation.sections.forEach((sectionRating: any) => {
      const templateSection = template.sections.find(
        (s) => s.sectionId === sectionRating.sectionId,
      );
      if (!templateSection) return;

      // Calculate section score from criteria
      let sectionScore = 0;
      let sectionWeight = 0;

      sectionRating.criteria.forEach((criterionRating: any) => {
        const criterion = templateSection.criteria.find(
          (c) => c.criteriaId === criterionRating.criteriaId,
        );
        if (!criterion || !criterionRating.rating) return;

        const criterionScore = (criterionRating.rating / template.ratingScale.maxValue) * 100;
        sectionScore += criterionScore * (criterion.weight / 100);
        sectionWeight += criterion.weight;
      });

      // Normalize section score
      const normalizedSectionScore = sectionWeight > 0
        ? (sectionScore / sectionWeight) * 100
        : 0;

      // Apply section weight to final score
      totalWeightedScore += normalizedSectionScore * (templateSection.weight / 100);
      totalWeight += templateSection.weight;
    });

    // Normalize final score
    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  }

  /**
   * Determine performance category based on rating
   */
  private determinePerformanceCategory(
    rating: number,
    ratingScale: any,
  ): PerformanceCategory {
    const { minValue, maxValue } = ratingScale;
    const range = maxValue - minValue;
    const percentage = ((rating - minValue) / range) * 100;

    if (percentage >= 90) return PerformanceCategory.EXCEPTIONAL;
    if (percentage >= 75) return PerformanceCategory.EXCEEDS_EXPECTATIONS;
    if (percentage >= 60) return PerformanceCategory.MEETS_EXPECTATIONS;
    if (percentage >= 40) return PerformanceCategory.NEEDS_IMPROVEMENT;
    return PerformanceCategory.UNSATISFACTORY;
  }

  // ==================== APPRAISAL DISPUTE METHODS ====================

  /**
   * Create a dispute for an appraisal evaluation
   */
  async createDispute(
    employeeId: string,
    createDto: CreateAppraisalDisputeDto,
  ): Promise<AppraisalDisputeDocument> {
    const evaluation = await this.findEvaluationById(createDto.evaluationId);

    // Verify the employee is the one who received the evaluation
    if (evaluation.employeeId.toString() !== employeeId) {
      throw new BadRequestException(
        'You can only dispute your own appraisals',
      );
    }

    // Check if dispute already exists
    const existingDispute = await this.disputeModel
      .findOne({
        evaluationId: new Types.ObjectId(createDto.evaluationId),
        status: { $in: [DisputeStatus.SUBMITTED, DisputeStatus.UNDER_REVIEW] },
      })
      .exec();

    if (existingDispute) {
      throw new ConflictException('An active dispute already exists for this evaluation');
    }

    const cycle = await this.findCycleById(evaluation.cycleId.toString());
    const disputeDeadline = cycle.disputeDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

    const dispute = new this.disputeModel({
      evaluationId: new Types.ObjectId(createDto.evaluationId),
      employeeId: new Types.ObjectId(employeeId),
      cycleId: evaluation.cycleId,
      disputeReason: createDto.disputeReason,
      disputedSections: createDto.disputedSections || [],
      disputedCriteria: createDto.disputedCriteria || [],
      proposedRating: createDto.proposedRating,
      supportingDocuments: createDto.supportingDocumentIds?.map(
        (id) => new Types.ObjectId(id),
      ) || [],
      additionalComments: createDto.additionalComments,
      status: DisputeStatus.SUBMITTED,
      deadline: disputeDeadline,
    });

    return dispute.save();
  }

  /**
   * Get all disputes
   */
  async findAllDisputes(status?: DisputeStatus): Promise<AppraisalDisputeDocument[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.disputeModel
      .find(filter)
      .populate('evaluationId')
      .populate('employeeId')
      .populate('cycleId')
      .sort({ submittedAt: -1 })
      .exec();
  }

  /**
   * Get disputes for a specific employee
   */
  async findDisputesByEmployee(employeeId: string): Promise<AppraisalDisputeDocument[]> {
    return this.disputeModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('evaluationId')
      .populate('cycleId')
      .sort({ submittedAt: -1 })
      .exec();
  }

  /**
   * Get a single dispute by ID
   */
  async findDisputeById(id: string): Promise<AppraisalDisputeDocument> {
    const dispute = await this.disputeModel
      .findById(id)
      .populate('evaluationId')
      .populate('employeeId')
      .populate('cycleId')
      .populate('reviewedBy')
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
      dispute.status !== DisputeStatus.SUBMITTED &&
      dispute.status !== DisputeStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        `Cannot resolve dispute. Current status: ${dispute.status}`,
      );
    }

    dispute.status = resolveDto.status === 'RESOLVED' ? DisputeStatus.RESOLVED : DisputeStatus.REJECTED;
    dispute.resolutionType = resolveDto.resolutionType;
    dispute.adjustedRating = resolveDto.adjustedRating;
    dispute.resolutionNotes = resolveDto.resolutionNotes;
    dispute.resolvedAt = new Date();
    dispute.reviewedBy = new Types.ObjectId(reviewerId) as any;
    dispute.reviewedAt = new Date();
    dispute.reviewComments = resolveDto.resolutionNotes;

    // If adjusted, update the evaluation
    if (resolveDto.resolutionType === ResolutionType.RATING_ADJUSTED && resolveDto.adjustedRating) {
      const evaluation = await this.findEvaluationById(dispute.evaluationId.toString());
      evaluation.finalRating = resolveDto.adjustedRating;
      evaluation.performanceCategory = this.determinePerformanceCategory(
        resolveDto.adjustedRating,
        (await this.findTemplateById(evaluation.templateId.toString())).ratingScale,
      );
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
  ): Promise<AppraisalEvaluationDocument[]> {
    return this.evaluationModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('cycleId')
      .populate('templateId')
      .populate('reviewerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get cycle progress dashboard
   */
  async getCycleProgress(cycleId: string): Promise<any> {
    const cycle = await this.findCycleById(cycleId);
    const assignments = cycle.assignments;
    
    const total = assignments.length;
    const notStarted = assignments.filter(
      (a) => a.status === AssignmentStatus.NOT_STARTED,
    ).length;
    const selfAssessmentPending = assignments.filter(
      (a) => a.status === AssignmentStatus.SELF_ASSESSMENT_PENDING,
    ).length;
    const managerReviewPending = assignments.filter(
      (a) => a.status === AssignmentStatus.MANAGER_REVIEW_PENDING,
    ).length;
    const completed = assignments.filter(
      (a) => a.status === AssignmentStatus.COMPLETED,
    ).length;
    const disputed = assignments.filter(
      (a) => a.status === AssignmentStatus.DISPUTED,
    ).length;

    return {
      total,
      notStarted,
      selfAssessmentPending,
      managerReviewPending,
      completed,
      disputed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      progressPercentage: cycle.progressPercentage || 0,
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
  ): Promise<AppraisalEvaluationDocument> {
    const cycle = await this.findCycleById(cycleId);
    
    if (cycle.status !== CycleStatus.ACTIVE && cycle.status !== CycleStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot submit self-assessment for inactive cycle');
    }

    const assignment = cycle.assignments.find(
      (a) => a.employeeId.toString() === employeeId,
    );
    if (!assignment) {
      throw new NotFoundException(
        `No assignment found for employee ${employeeId} in cycle ${cycleId}`,
      );
    }

    if (!assignment.selfAssessmentRequired) {
      throw new BadRequestException('Self-assessment is not required for this assignment');
    }

    if (assignment.status !== AssignmentStatus.SELF_ASSESSMENT_PENDING &&
        assignment.status !== AssignmentStatus.NOT_STARTED) {
      throw new BadRequestException(
        `Cannot submit self-assessment. Current status: ${assignment.status}`,
      );
    }

    // Get or create evaluation
    let evaluation = await this.evaluationModel
      .findOne({
        cycleId: new Types.ObjectId(cycleId),
        employeeId: new Types.ObjectId(employeeId),
      })
      .exec();

    if (evaluation) {
      evaluation.selfAssessment = {
        submittedAt: new Date(),
        sections: selfAssessmentDto.sections as any,
        overallComments: selfAssessmentDto.overallComments,
      };
      evaluation.status = EvaluationStatus.SELF_ASSESSMENT_SUBMITTED;
    } else {
      const template = await this.findTemplateById(cycle.templateId.toString());
      evaluation = new this.evaluationModel({
        cycleId: new Types.ObjectId(cycleId),
        templateId: cycle.templateId,
        employeeId: new Types.ObjectId(employeeId),
        reviewerId: assignment.reviewerId,
        selfAssessment: {
          submittedAt: new Date(),
          sections: selfAssessmentDto.sections as any,
          overallComments: selfAssessmentDto.overallComments,
        },
        managerEvaluation: {
          sections: [],
        },
        finalRating: 0,
        status: EvaluationStatus.SELF_ASSESSMENT_SUBMITTED,
      });
    }

    // Update assignment status
    assignment.status = AssignmentStatus.MANAGER_REVIEW_PENDING;
    await cycle.save();

    return evaluation.save();
  }

  // ==================== HR REVIEW METHODS ====================

  /**
   * Add HR review to an evaluation
   */
  async addHrReview(
    evaluationId: string,
    hrReviewDto: AddHrReviewDto,
  ): Promise<AppraisalEvaluationDocument> {
    const evaluation = await this.findEvaluationById(evaluationId);

    if (evaluation.status !== EvaluationStatus.MANAGER_REVIEW_SUBMITTED &&
        evaluation.status !== EvaluationStatus.HR_REVIEWED) {
      throw new BadRequestException(
        `Cannot add HR review. Current status: ${evaluation.status}`,
      );
    }

    const template = await this.findTemplateById(evaluation.templateId.toString());
    
    // Use adjusted rating if provided, otherwise keep current
    const finalRating = hrReviewDto.adjustedRating !== undefined
      ? hrReviewDto.adjustedRating
      : evaluation.finalRating;

    const performanceCategory = this.determinePerformanceCategory(
      finalRating,
      template.ratingScale,
    );

    evaluation.hrReview = {
      reviewedBy: new MongooseSchema.Types.ObjectId(hrReviewDto.reviewedBy) as any,
      reviewedAt: new Date(),
      adjustedRating: hrReviewDto.adjustedRating,
      adjustmentReason: hrReviewDto.adjustmentReason,
      hrComments: hrReviewDto.hrComments,
    };

    if (hrReviewDto.adjustedRating !== undefined) {
      evaluation.finalRating = finalRating;
      evaluation.performanceCategory = performanceCategory;
    }

    evaluation.status = EvaluationStatus.HR_REVIEWED;

    return evaluation.save();
  }

  // ==================== PERFORMANCE GOAL METHODS ====================

  /**
   * Create a performance goal
   */
  async createGoal(
    createDto: CreatePerformanceGoalDto,
  ): Promise<PerformanceGoalDocument> {
    const goal = new this.goalModel({
      goalTitle: createDto.goalTitle,
      description: createDto.description,
      employeeId: new Types.ObjectId(createDto.employeeId),
      setBy: new Types.ObjectId(createDto.setBy),
      cycleId: createDto.cycleId ? new Types.ObjectId(createDto.cycleId) : undefined,
      category: createDto.category,
      type: createDto.type,
      priority: createDto.priority,
      targetMetric: createDto.targetMetric,
      targetValue: createDto.targetValue,
      targetUnit: createDto.targetUnit,
      startDate: new Date(createDto.startDate),
      dueDate: new Date(createDto.dueDate),
      status: GoalStatus.NOT_STARTED,
    });

    return goal.save();
  }

  /**
   * Get all goals for an employee
   */
  async findGoalsByEmployee(
    employeeId: string,
    status?: GoalStatus,
  ): Promise<PerformanceGoalDocument[]> {
    const filter: any = { employeeId: new Types.ObjectId(employeeId) };
    if (status) {
      filter.status = status;
    }
    return this.goalModel
      .find(filter)
      .populate('setBy')
      .populate('cycleId')
      .sort({ dueDate: 1 })
      .exec();
  }

  /**
   * Get goal by ID
   */
  async findGoalById(id: string): Promise<PerformanceGoalDocument> {
    const goal = await this.goalModel
      .findById(id)
      .populate('setBy')
      .populate('employeeId')
      .populate('cycleId')
      .exec();
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
    return goal;
  }

  /**
   * Update a performance goal
   */
  async updateGoal(
    id: string,
    updateDto: UpdatePerformanceGoalDto,
  ): Promise<PerformanceGoalDocument> {
    const goal = await this.findGoalById(id);

    if (updateDto.currentValue !== undefined) {
      goal.currentValue = updateDto.currentValue;
    }
    if (updateDto.status !== undefined) {
      goal.status = updateDto.status;
      if (updateDto.status === GoalStatus.ACHIEVED || 
          updateDto.status === GoalStatus.PARTIALLY_ACHIEVED ||
          updateDto.status === GoalStatus.NOT_ACHIEVED) {
        goal.completedAt = new Date();
        goal.actualValue = updateDto.currentValue;
      }
    }
    if (updateDto.finalComments !== undefined) {
      goal.finalComments = updateDto.finalComments;
    }

    // Update other fields
    Object.assign(goal, updateDto);
    if (updateDto.startDate) goal.startDate = new Date(updateDto.startDate);
    if (updateDto.dueDate) goal.dueDate = new Date(updateDto.dueDate);

    return goal.save();
  }

  /**
   * Delete a performance goal
   */
  async deleteGoal(id: string): Promise<void> {
    const result = await this.goalModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
  }

  // ==================== PERFORMANCE FEEDBACK METHODS ====================

  /**
   * Create performance feedback
   */
  async createFeedback(
    createDto: CreatePerformanceFeedbackDto,
  ): Promise<PerformanceFeedbackDocument> {
    const feedback = new this.feedbackModel({
      recipientId: new Types.ObjectId(createDto.recipientId),
      providerId: new Types.ObjectId(createDto.providerId),
      feedbackType: createDto.feedbackType,
      cycleId: createDto.cycleId ? new Types.ObjectId(createDto.cycleId) : undefined,
      isAnonymous: createDto.isAnonymous || false,
      rating: createDto.rating,
      strengths: createDto.strengths,
      areasForImprovement: createDto.areasForImprovement,
      specificExamples: createDto.specificExamples,
      recommendations: createDto.recommendations,
      categories: createDto.categories || [],
      isPrivate: createDto.isPrivate || false,
      sharedWith: createDto.sharedWith?.map(id => new Types.ObjectId(id)) || [],
      status: FeedbackStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    return feedback.save();
  }

  /**
   * Get feedback for an employee (as recipient)
   */
  async findFeedbackByRecipient(
    employeeId: string,
    status?: FeedbackStatus,
  ): Promise<PerformanceFeedbackDocument[]> {
    const filter: any = { recipientId: new Types.ObjectId(employeeId) };
    if (status) {
      filter.status = status;
    }
    return this.feedbackModel
      .find(filter)
      .populate('providerId')
      .populate('recipientId')
      .populate('cycleId')
      .sort({ submittedAt: -1 })
      .exec();
  }

  /**
   * Get feedback by ID
   */
  async findFeedbackById(id: string): Promise<PerformanceFeedbackDocument> {
    const feedback = await this.feedbackModel
      .findById(id)
      .populate('providerId')
      .populate('recipientId')
      .populate('cycleId')
      .exec();
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  /**
   * Update feedback (acknowledge, respond)
   */
  async updateFeedback(
    id: string,
    updateDto: UpdatePerformanceFeedbackDto,
  ): Promise<PerformanceFeedbackDocument> {
    const feedback = await this.findFeedbackById(id);

    if (updateDto.recipientResponse !== undefined) {
      feedback.recipientResponse = updateDto.recipientResponse;
      feedback.acknowledgedAt = new Date();
      feedback.status = FeedbackStatus.ACKNOWLEDGED;
    }

    // Update other fields
    Object.assign(feedback, updateDto);

    return feedback.save();
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(id: string): Promise<void> {
    const result = await this.feedbackModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
  }
}
