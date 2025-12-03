import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  OrgChangeRequest,
  OrgChangeRequestDocument,
  OrgRequestType,
  TargetType,
  OrgChangeStatus,
  OrgChangePriority,
} from '../schemas/org-change-request.schema';
import {
  CreateOrgChangeRequestDto,
  UpdateOrgChangeRequestDto,
  QueryOrgChangeRequestDto,
  ReviewOrgChangeRequestDto,
  ApproveOrgChangeRequestDto,
} from '../dto';
import { DepartmentService } from './department.service';
import { PositionService } from './position.service';
import { ReportingLineService } from './reporting-line.service';

@Injectable()
export class OrgChangeRequestService {
  constructor(
    @InjectModel(OrgChangeRequest.name)
    private changeRequestModel: Model<OrgChangeRequestDocument>,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private reportingLineService: ReportingLineService,
  ) {}

  /**
   * Generate unique request number
   */
  private async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORG-${year}-`;
    
    // Find the latest request number for this year
    const latest = await this.changeRequestModel
      .findOne({ requestNumber: new RegExp(`^${prefix}`) })
      .sort({ requestNumber: -1 })
      .exec();

    let sequence = 1;
    if (latest) {
      const lastSequence = parseInt(latest.requestNumber.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Create a new change request
   */
  async create(createDto: CreateOrgChangeRequestDto, userId: string): Promise<OrgChangeRequest> {
    const requestNumber = await this.generateRequestNumber();

    const changeRequest = new this.changeRequestModel({
      requestNumber,
      ...createDto,
      targetId: createDto.targetId ? new Types.ObjectId(createDto.targetId) : undefined,
      impactedEmployees: createDto.impactedEmployees?.map(id => new Types.ObjectId(id)) || [],
      impactedDepartments: createDto.impactedDepartments?.map(id => new Types.ObjectId(id)) || [],
      impactedPositions: createDto.impactedPositions?.map(id => new Types.ObjectId(id)) || [],
      effectiveDate: new Date(createDto.effectiveDate),
      status: OrgChangeStatus.DRAFT,
      priority: createDto.priority || OrgChangePriority.MEDIUM,
      requestedBy: new Types.ObjectId(userId),
      requestedAt: new Date(),
    });

    return changeRequest.save();
  }

  /**
   * Submit a draft change request for review
   */
  async submitForReview(id: string, userId: string): Promise<OrgChangeRequestDocument> {
    const changeRequest = await this.findOne(id);

    if (changeRequest.status !== OrgChangeStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT requests can be submitted for review');
    }

    // TODO: Validate user has permission to submit

    const changeRequestDoc = changeRequest as OrgChangeRequestDocument;
    changeRequestDoc.status = OrgChangeStatus.PENDING_APPROVAL;

    return changeRequestDoc.save();
  }

  /**
   * Review a change request (HR Manager)
   */
  async review(id: string, reviewDto: ReviewOrgChangeRequestDto, userId: string): Promise<OrgChangeRequestDocument> {
    const changeRequest = await this.findOne(id);

    if (changeRequest.status !== OrgChangeStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only PENDING_APPROVAL requests can be reviewed');
    }

    // TODO: Validate user is HR Manager

    const changeRequestDoc = changeRequest as OrgChangeRequestDocument;
    changeRequestDoc.reviewedBy = new Types.ObjectId(userId) as any;
    changeRequestDoc.reviewedAt = new Date();
    changeRequestDoc.reviewComments = reviewDto.reviewComments;
    // Status remains PENDING_APPROVAL until System Admin approves

    return changeRequestDoc.save();
  }

  /**
   * Approve a change request (System Admin)
   */
  async approve(id: string, approveDto: ApproveOrgChangeRequestDto, userId: string): Promise<OrgChangeRequestDocument> {
    const changeRequest = await this.findOne(id);

    if (changeRequest.status !== OrgChangeStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only PENDING_APPROVAL requests can be approved');
    }

    // TODO: Validate user is System Admin

    const changeRequestDoc = changeRequest as OrgChangeRequestDocument;
    changeRequestDoc.status = OrgChangeStatus.APPROVED;
    changeRequestDoc.approvedBy = new Types.ObjectId(userId) as any;
    changeRequestDoc.approvedAt = new Date();
    changeRequestDoc.approvalComments = approveDto.approvalComments;

    return changeRequestDoc.save();
  }

  /**
   * Reject a change request
   */
  async reject(id: string, reason: string, userId: string): Promise<OrgChangeRequestDocument> {
    const changeRequest = await this.findOne(id);

    if (changeRequest.status !== OrgChangeStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only PENDING_APPROVAL requests can be rejected');
    }

    // TODO: Validate user is HR Manager or System Admin

    const changeRequestDoc = changeRequest as OrgChangeRequestDocument;
    changeRequestDoc.status = OrgChangeStatus.REJECTED;
    changeRequestDoc.reviewComments = reason;
    changeRequestDoc.reviewedBy = new Types.ObjectId(userId) as any;
    changeRequestDoc.reviewedAt = new Date();

    return changeRequestDoc.save();
  }

  /**
   * Implement an approved change request
   */
  async implement(id: string, userId: string): Promise<OrgChangeRequestDocument> {
    const changeRequest = await this.findOne(id);

    if (changeRequest.status !== OrgChangeStatus.APPROVED) {
      throw new BadRequestException('Only APPROVED requests can be implemented');
    }

    // TODO: Validate user has permission to implement

    const changeRequestDoc = changeRequest as OrgChangeRequestDocument;

    // Implement the change based on request type
    try {
      await this.applyChange(changeRequestDoc);
    } catch (error) {
      throw new BadRequestException(`Failed to implement change: ${error.message}`);
    }

    changeRequestDoc.status = OrgChangeStatus.IMPLEMENTED;
    changeRequestDoc.implementedBy = new Types.ObjectId(userId) as any;
    changeRequestDoc.implementedAt = new Date();

    return changeRequestDoc.save();
  }

  /**
   * Apply the actual change to the system
   */
  private async applyChange(changeRequest: OrgChangeRequestDocument): Promise<void> {
    switch (changeRequest.requestType) {
      case OrgRequestType.CREATE_DEPARTMENT:
        if (changeRequest.newEntityData) {
          await this.departmentService.create(changeRequest.newEntityData as any, changeRequest.requestedBy.toString());
        }
        break;

      case OrgRequestType.UPDATE_DEPARTMENT:
        if (changeRequest.targetId && changeRequest.proposedChanges) {
          const updateData: any = {};
          changeRequest.proposedChanges.forEach(change => {
            updateData[change.field] = change.proposedValue;
          });
          await this.departmentService.update(
            changeRequest.targetId.toString(),
            updateData,
            changeRequest.requestedBy.toString(),
          );
        }
        break;

      case OrgRequestType.DEACTIVATE_DEPARTMENT:
        if (changeRequest.targetId) {
          await this.departmentService.remove(changeRequest.targetId.toString(), changeRequest.requestedBy.toString());
        }
        break;

      case OrgRequestType.CREATE_POSITION:
        if (changeRequest.newEntityData) {
          await this.positionService.create(changeRequest.newEntityData as any, changeRequest.requestedBy.toString());
        }
        break;

      case OrgRequestType.UPDATE_POSITION:
        if (changeRequest.targetId && changeRequest.proposedChanges) {
          const updateData: any = {};
          changeRequest.proposedChanges.forEach(change => {
            updateData[change.field] = change.proposedValue;
          });
          await this.positionService.update(
            changeRequest.targetId.toString(),
            updateData,
            changeRequest.requestedBy.toString(),
          );
        }
        break;

      case OrgRequestType.DEACTIVATE_POSITION:
        if (changeRequest.targetId) {
          await this.positionService.remove(changeRequest.targetId.toString(), changeRequest.requestedBy.toString());
        }
        break;

      case OrgRequestType.CHANGE_REPORTING_LINE:
        // TODO: Implement reporting line change
        break;

      case OrgRequestType.TRANSFER_EMPLOYEE:
        // TODO: Implement employee transfer (when Employee module is ready)
        break;

      case OrgRequestType.REORGANIZATION:
        // TODO: Implement reorganization (complex, may involve multiple changes)
        break;

      default:
        throw new BadRequestException(`Unsupported request type: ${changeRequest.requestType}`);
    }
  }

  /**
   * Find all change requests with filters and pagination
   */
  async findAll(queryDto: QueryOrgChangeRequestDto): Promise<{
    data: OrgChangeRequest[];
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
      targetType,
      targetId,
      status,
      priority,
      requestedBy,
      sortBy = 'requestedAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {};

    if (requestNumber) {
      filter.requestNumber = requestNumber.toUpperCase();
    }

    if (requestType) {
      filter.requestType = requestType;
    }

    if (targetType) {
      filter.targetType = targetType;
    }

    if (targetId) {
      filter.targetId = new Types.ObjectId(targetId);
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (requestedBy) {
      filter.requestedBy = new Types.ObjectId(requestedBy);
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      this.changeRequestModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('requestedBy', 'email')
        .populate('reviewedBy', 'email')
        .populate('approvedBy', 'email')
        .populate('implementedBy', 'email')
        .populate('impactedEmployees', 'personalInfo.firstName personalInfo.lastName')
        .populate('impactedDepartments', 'code name')
        .populate('impactedPositions', 'code title')
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

  /**
   * Find one change request by ID
   */
  async findOne(id: string): Promise<OrgChangeRequestDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid change request ID');
    }

    const changeRequest = await this.changeRequestModel
      .findById(id)
      .populate('requestedBy', 'email')
      .populate('reviewedBy', 'email')
      .populate('approvedBy', 'email')
      .populate('implementedBy', 'email')
      .populate('impactedEmployees', 'personalInfo.firstName personalInfo.lastName')
      .populate('impactedDepartments', 'code name')
      .populate('impactedPositions', 'code title')
      .exec();

    if (!changeRequest) {
      throw new NotFoundException(`Change request with ID '${id}' not found`);
    }

    return changeRequest;
  }

  /**
   * Find change request by request number
   */
  async findByRequestNumber(requestNumber: string): Promise<OrgChangeRequest> {
    const changeRequest = await this.changeRequestModel
      .findOne({ requestNumber: requestNumber.toUpperCase() })
      .populate('requestedBy', 'email')
      .populate('reviewedBy', 'email')
      .populate('approvedBy', 'email')
      .populate('implementedBy', 'email')
      .exec();

    if (!changeRequest) {
      throw new NotFoundException(`Change request with number '${requestNumber}' not found`);
    }

    return changeRequest;
  }

  /**
   * Update a change request (only DRAFT status can be updated)
   */
  async update(id: string, updateDto: UpdateOrgChangeRequestDto, userId: string): Promise<OrgChangeRequest> {
    const changeRequest = await this.findOne(id);

    if (changeRequest.status !== OrgChangeStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT requests can be updated');
    }

    const updateData: any = {
      ...updateDto,
    };

    if (updateDto.targetId) {
      updateData.targetId = new Types.ObjectId(updateDto.targetId);
    }

    if (updateDto.impactedEmployees) {
      updateData.impactedEmployees = updateDto.impactedEmployees.map(id => new Types.ObjectId(id));
    }

    if (updateDto.impactedDepartments) {
      updateData.impactedDepartments = updateDto.impactedDepartments.map(id => new Types.ObjectId(id));
    }

    if (updateDto.impactedPositions) {
      updateData.impactedPositions = updateDto.impactedPositions.map(id => new Types.ObjectId(id));
    }

    if (updateDto.effectiveDate) {
      updateData.effectiveDate = new Date(updateDto.effectiveDate);
    }

    const updatedRequest = await this.changeRequestModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('requestedBy', 'email')
      .populate('reviewedBy', 'email')
      .populate('approvedBy', 'email')
      .populate('implementedBy', 'email')
      .exec();

    return updatedRequest;
  }

  /**
   * Cancel a change request
   */
  async cancel(id: string, userId: string): Promise<OrgChangeRequestDocument> {
    const changeRequest = await this.findOne(id);

    if (![OrgChangeStatus.DRAFT, OrgChangeStatus.PENDING_APPROVAL].includes(changeRequest.status)) {
      throw new BadRequestException('Only DRAFT or PENDING_APPROVAL requests can be cancelled');
    }

    // TODO: Validate user has permission (requestor or admin)

    const changeRequestDoc = changeRequest as OrgChangeRequestDocument;
    changeRequestDoc.status = OrgChangeStatus.CANCELLED;

    return changeRequestDoc.save();
  }
}

