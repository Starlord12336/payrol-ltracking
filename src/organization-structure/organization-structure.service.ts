  // Consolidated Organization Structure Service
  import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, Types } from 'mongoose';
  import mongoose from 'mongoose';
  import { Department, DepartmentDocument, DepartmentSchema } from './models/department.schema';
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
    EmployeeProfile,
    EmployeeProfileDocument,
  } from '../employee-profile/models/employee-profile.schema';
  import {
    EmployeeSystemRole,
    EmployeeSystemRoleDocument,
  } from '../employee-profile/models/employee-system-role.schema';
  import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
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
  import { NotificationLog } from '../time-management/models/notification-log.schema';

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
      @InjectModel(EmployeeProfile.name)
      private employeeModel: Model<EmployeeProfileDocument>,
      @InjectModel(NotificationLog.name)
      private notificationLogModel: Model<any>,
      @InjectModel(EmployeeSystemRole.name)
      private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
    ) {}

    // =====================================
    // DEPARTMENT METHODS
    // =====================================

    async createDepartment(
      createDepartmentDto: CreateDepartmentDto,
      userId: string,
    ): Promise<Department> {
      // Check for existing department with same code (only active ones)
      const existingActiveDepartment = await this.departmentModel.findOne({
        code: createDepartmentDto.code,
        isActive: true,
      });

      if (existingActiveDepartment) {
        throw new ConflictException(
          `Department with code '${createDepartmentDto.code}' already exists`,
        );
      }

      // Check if there's an inactive department with this code
      // If so, reactivate and update it instead of creating a new one
      const existingInactiveDepartment = await this.departmentModel.findOne({
        code: createDepartmentDto.code,
        isActive: false,
      });

      if (existingInactiveDepartment) {
        // Reactivate and update the existing department instead of creating new
        // This works around MongoDB's unique index constraint
        existingInactiveDepartment.name = createDepartmentDto.name;
        existingInactiveDepartment.description = createDepartmentDto.description;
        existingInactiveDepartment.headPositionId = createDepartmentDto.headPositionId
          ? new Types.ObjectId(createDepartmentDto.headPositionId)
          : undefined;
        existingInactiveDepartment.isActive = true;

        // Validate head position if provided
        if (createDepartmentDto.headPositionId) {
          await this.validatePositionExists(createDepartmentDto.headPositionId);
        }

        const savedDepartment = await existingInactiveDepartment.save();

        // Log the change (reactivation)
        await this.logChange(
          ChangeLogAction.CREATED,
          'Department',
          savedDepartment._id,
          userId,
          undefined,
          {
            name: savedDepartment.name,
            code: savedDepartment.code,
            description: savedDepartment.description,
            headPositionId: savedDepartment.headPositionId?.toString(),
            isActive: savedDepartment.isActive,
          },
          `Created Department "${savedDepartment.code}" - ${savedDepartment.name}`,
        );

        // Notify HR_MANAGER and HR_ADMIN
        try {
          await this.notifyHRTeamAboutStructuralChange(
            'created',
            'Department',
            savedDepartment.name,
            savedDepartment.code,
          );
        } catch (error) {
          console.error('[Department] Error sending creation notification:', error);
        }

        return savedDepartment;
      }

      if (createDepartmentDto.headPositionId) {
        await this.validatePositionExists(createDepartmentDto.headPositionId);
      }

      const department = new this.departmentModel({
        ...createDepartmentDto,
        isActive: true,
      });

      const savedDepartment = await department.save();

      // Log the change - make sure it happens
      try {
        await this.logChange(
          ChangeLogAction.CREATED,
          'Department',
          savedDepartment._id,
          userId,
          undefined,
          {
            name: savedDepartment.name,
            code: savedDepartment.code,
            description: savedDepartment.description,
            headPositionId: savedDepartment.headPositionId?.toString(),
          },
          `Created Department "${savedDepartment.code}" - ${savedDepartment.name}`,
        );
        console.log('[Department] Logging completed for department:', savedDepartment._id.toString());
      } catch (logError) {
        console.error('[Department] Failed to log department creation:', logError);
        // Continue even if logging fails
      }

      // Notify HR_MANAGER and HR_ADMIN
      try {
        await this.notifyHRTeamAboutStructuralChange(
          'created',
          'Department',
          savedDepartment.name,
          savedDepartment.code,
        );
      } catch (error) {
        console.error('[Department] Error sending creation notification:', error);
      }

      return savedDepartment;
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
        // Only check active departments - inactive ones can have their codes reused
        const existingDepartment = await this.departmentModel.findOne({
          code: updateDepartmentDto.code,
          _id: { $ne: id },
          isActive: true,
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

      // Capture before snapshot
      const beforeSnapshot = {
        name: department.name,
        code: department.code,
        description: department.description,
        headPositionId: department.headPositionId?.toString(),
      };

      const updatedDepartment = await this.departmentModel
        .findByIdAndUpdate(id, updateDepartmentDto, {
          new: true,
          runValidators: true,
        })
        .populate('headPositionId', 'code title')
        .exec();

      // Capture after snapshot
      const afterSnapshot = {
        name: updatedDepartment.name,
        code: updatedDepartment.code,
        description: updatedDepartment.description,
        headPositionId: updatedDepartment.headPositionId?.toString(),
      };

      // Log the change
      await this.logChange(
        ChangeLogAction.UPDATED,
        'Department',
        updatedDepartment._id,
        userId,
        beforeSnapshot,
        afterSnapshot,
        `Updated Department "${updatedDepartment.code}" - ${updatedDepartment.name}`,
      );

      // Notify HR_MANAGER and HR_ADMIN
      try {
        await this.notifyHRTeamAboutStructuralChange(
          'updated',
          'Department',
          updatedDepartment.name,
          updatedDepartment.code,
        );
      } catch (error) {
        console.error('[Department] Error sending update notification:', error);
      }

      return updatedDepartment;
    }

    async removeDepartment(id: string, userId: string): Promise<Department> {
      const department = await this.findDepartmentById(id);

      // Deactivate all positions in this department first
      // Since positions are department-specific, they should be deactivated when department is deleted
      await this.positionModel.updateMany(
        { departmentId: new Types.ObjectId(id), isActive: true },
        { isActive: false }
      );

      const departmentDoc = department as DepartmentDocument;
      departmentDoc.isActive = false;

      // Capture before snapshot
      const beforeSnapshot = {
        name: department.name,
        code: department.code,
        description: department.description,
        headPositionId: department.headPositionId?.toString(),
        isActive: department.isActive,
      };

      const savedDepartment = await departmentDoc.save();

      // Log the change
      await this.logChange(
        ChangeLogAction.DEACTIVATED,
        'Department',
        savedDepartment._id,
        userId,
        beforeSnapshot,
        {
          isActive: false,
        },
        `Deactivated Department "${savedDepartment.code}" - ${savedDepartment.name}`,
      );

      // Notify HR_MANAGER and HR_ADMIN
      try {
        await this.notifyHRTeamAboutStructuralChange(
          'deleted',
          'Department',
          savedDepartment.name,
          savedDepartment.code,
        );
      } catch (error) {
        console.error('[Department] Error sending deletion notification:', error);
      }

      return savedDepartment;
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

      // Get the old head position before updating
      const oldHeadPositionId = department.headPositionId?.toString();

      const departmentDoc = department as DepartmentDocument;
      departmentDoc.headPositionId = positionId
        ? (new Types.ObjectId(positionId) as any)
        : undefined;

      const savedDepartment = await departmentDoc.save();

      // Sync roles: Remove DEPARTMENT_HEAD role from employees with old position
      if (oldHeadPositionId && oldHeadPositionId !== positionId) {
        await this.removeDepartmentHeadRoleFromPosition(oldHeadPositionId);
      }

      // Sync roles: Add DEPARTMENT_HEAD role to employees with new position
      if (positionId) {
        await this.addDepartmentHeadRoleToPosition(positionId);
        // Also sync DEPARTMENT_EMPLOYEE role for employees with this position
        await this.syncEmployeeRolesForPosition(positionId);
      }

      return savedDepartment;
    }

    /**
     * Add DEPARTMENT_HEAD role to all employees with the given position
     */
    private async addDepartmentHeadRoleToPosition(
      positionId: string,
    ): Promise<void> {
      // Find all employees with this position as their primaryPositionId
      const employees = await this.employeeModel
        .find({ primaryPositionId: new Types.ObjectId(positionId) })
        .select('_id')
        .lean()
        .exec();

      for (const employee of employees) {
        // Get or create EmployeeSystemRole for this employee
        let systemRole = await this.employeeSystemRoleModel
          .findOne({ employeeProfileId: employee._id, isActive: true })
          .exec();

        if (!systemRole) {
          // Create new EmployeeSystemRole if it doesn't exist
          systemRole = new this.employeeSystemRoleModel({
            employeeProfileId: employee._id,
            roles: [],
            permissions: [],
            isActive: true,
          });
        }

        // Add DEPARTMENT_HEAD role if not already present
        if (!systemRole.roles.includes(SystemRole.DEPARTMENT_HEAD)) {
          systemRole.roles.push(SystemRole.DEPARTMENT_HEAD);
          await systemRole.save();
        }
      }
    }

    /**
     * Remove DEPARTMENT_HEAD role from all employees with the given position
     */
    private async removeDepartmentHeadRoleFromPosition(
      positionId: string,
    ): Promise<void> {
      // Find all employees with this position as their primaryPositionId
      const employees = await this.employeeModel
        .find({ primaryPositionId: new Types.ObjectId(positionId) })
        .select('_id')
        .lean()
        .exec();

      for (const employee of employees) {
        // Get EmployeeSystemRole for this employee
        const systemRole = await this.employeeSystemRoleModel
          .findOne({ employeeProfileId: employee._id, isActive: true })
          .exec();

        if (systemRole && systemRole.roles.includes(SystemRole.DEPARTMENT_HEAD)) {
          // Remove DEPARTMENT_HEAD role
          systemRole.roles = systemRole.roles.filter(
            (role) => role !== SystemRole.DEPARTMENT_HEAD,
          );
          await systemRole.save();
        }
      }
    }

    // =====================================
    // POSITION METHODS
    // =====================================

    async createPosition(
      createPositionDto: CreatePositionDto,
      userId: string,
    ): Promise<Position> {
      // Check for existing active position with same code
      const existingActivePosition = await this.positionModel.findOne({
        code: createPositionDto.code,
        isActive: true,
      });

      if (existingActivePosition) {
        throw new ConflictException(
          `Position with code '${createPositionDto.code}' already exists`,
        );
      }

      // Check if there's an inactive position with this code
      // If so, reactivate and update it instead of creating a new one
      const existingInactivePosition = await this.positionModel.findOne({
        code: createPositionDto.code,
        isActive: false,
      });

      if (existingInactivePosition) {
        // Reactivate and update the existing position
        existingInactivePosition.title = createPositionDto.title;
        existingInactivePosition.description = createPositionDto.description;
        existingInactivePosition.departmentId = new Types.ObjectId(createPositionDto.departmentId);
        existingInactivePosition.reportsToPositionId = createPositionDto.reportsToPositionId
          ? new Types.ObjectId(createPositionDto.reportsToPositionId)
          : undefined;
        existingInactivePosition.isActive = true;

        const savedPosition = await existingInactivePosition.save();

        // Log the change
        await this.logChange(
          ChangeLogAction.CREATED,
          'Position',
          savedPosition._id,
          userId,
          undefined,
          {
            code: savedPosition.code,
            title: savedPosition.title,
            description: savedPosition.description,
            departmentId: savedPosition.departmentId?.toString(),
            reportsToPositionId: savedPosition.reportsToPositionId?.toString(),
          },
          `Created Position "${savedPosition.code}" - ${savedPosition.title}`,
        );

        // Notify HR_MANAGER and HR_ADMIN
        try {
          await this.notifyHRTeamAboutStructuralChange(
            'created',
            'Position',
            savedPosition.title,
            savedPosition.code,
          );
        } catch (error) {
          console.error('[Position] Error sending creation notification:', error);
        }

        return savedPosition;
      }

      const department = await this.validateDepartmentExists(createPositionDto.departmentId);

      if (createPositionDto.reportsToPositionId) {
        await this.validatePositionExists(createPositionDto.reportsToPositionId);
      }

      // Determine reportsToPositionId: use provided value, or department head if not provided
      // This replicates the logic from the pre-save hook to avoid schema access issues
      // We set it here so the pre-save hook logic might be skipped (though it will still run)
      let reportsToPositionId = createPositionDto.reportsToPositionId;
      if (!reportsToPositionId && department.headPositionId) {
        // Only set to department head if not explicitly provided
        reportsToPositionId = department.headPositionId.toString();
      }

      // Build position data - ensure all required fields are set
      const positionData: any = {
        code: createPositionDto.code,
        title: createPositionDto.title,
        departmentId: new Types.ObjectId(createPositionDto.departmentId),
        isActive: true,
      };

      if (createPositionDto.description) {
        positionData.description = createPositionDto.description;
      }

      if (reportsToPositionId) {
        positionData.reportsToPositionId = new Types.ObjectId(reportsToPositionId);
      }

      // The Position schema's pre-save hook uses model() which tries to access Department model
      // Since we can't change the schema, we need to ensure the model is accessible
      // However, the hook will still run and may fail. We've already set reportsToPositionId above.
      // Use insertOne to bypass hooks entirely since we've already handled the logic
      try {
        // Convert ObjectIds to proper format for insertOne
        const insertData: any = {
          code: positionData.code,
          title: positionData.title,
          departmentId: positionData.departmentId,
          isActive: positionData.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        if (positionData.description) {
          insertData.description = positionData.description;
        }
        
        if (positionData.reportsToPositionId) {
          insertData.reportsToPositionId = positionData.reportsToPositionId;
        }
        
        // Use insertOne which bypasses Mongoose hooks
        const result = await this.positionModel.collection.insertOne(insertData);
        
        // Fetch the created document to return it as a Mongoose document
        const createdPosition = await this.positionModel.findById(result.insertedId);
        if (!createdPosition) {
          throw new Error('Failed to retrieve created position');
        }
        
        // Log the change
        await this.logChange(
          ChangeLogAction.CREATED,
          'Position',
          createdPosition._id,
          userId,
          undefined,
          {
            code: createdPosition.code,
            title: createdPosition.title,
            description: createdPosition.description,
            departmentId: createdPosition.departmentId?.toString(),
            reportsToPositionId: createdPosition.reportsToPositionId?.toString(),
          },
          `Created Position "${createdPosition.code}" - ${createdPosition.title}`,
        );
        
        // Notify HR_MANAGER and HR_ADMIN
        try {
          await this.notifyHRTeamAboutStructuralChange(
            'created',
            'Position',
            createdPosition.title,
            createdPosition.code,
          );
        } catch (error) {
          console.error('[Position] Error sending creation notification:', error);
        }
        
        return createdPosition;
      } catch (insertErr) {
        // If insertOne fails, try to register the model and use create
        console.warn('insertOne failed, trying to register model and use create:', insertErr);
        
        try {
          // Register Department model on the connection
          const connection = this.positionModel.db;
          if (!connection.models[Department.name]) {
            connection.model(Department.name, DepartmentSchema, 'departments');
          }
          
          // Now try create - the hook might work if model is registered
          const savedPosition = await this.positionModel.create(positionData);
          
          // Log the change
          await this.logChange(
            ChangeLogAction.CREATED,
            'Position',
            savedPosition._id,
            userId,
            undefined,
            {
              code: savedPosition.code,
              title: savedPosition.title,
              description: savedPosition.description,
              departmentId: savedPosition.departmentId?.toString(),
              reportsToPositionId: savedPosition.reportsToPositionId?.toString(),
            },
            `Created Position "${savedPosition.code}" - ${savedPosition.title}`,
          );
          
          // Notify HR_MANAGER and HR_ADMIN
          try {
            await this.notifyHRTeamAboutStructuralChange(
              'created',
              'Position',
              savedPosition.title,
              savedPosition.code,
            );
          } catch (error) {
            console.error('[Position] Error sending creation notification:', error);
          }
          
          return savedPosition;
        } catch (createErr) {
          // If create also fails, throw the original insertOne error
          throw insertErr;
        }
      }
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
        // Only check active positions - inactive ones can have their codes reused
        const existingPosition = await this.positionModel.findOne({
          code: updatePositionDto.code,
          _id: { $ne: id },
          isActive: true,
        });

        if (existingPosition) {
          throw new ConflictException(
            `Position with code '${updatePositionDto.code}' already exists`,
          );
        }
      }

      if (updatePositionDto.departmentId) {
        await this.validateDepartmentExists(updatePositionDto.departmentId); // Ignore return value
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

      // Use findOneAndUpdate which triggers the pre-save hook
      // But we need to ensure Department model is accessible
      // Since we can't change the schema, we'll handle reportsToPositionId logic here if needed
      const updateData: any = { ...updatePositionDto };
      
      // If departmentId is being updated, we might need to handle reportsToPositionId
      // But the pre-save hook will handle it, so we just need to ensure the model is accessible
      try {
        // Register Department model if needed (same as in createPosition)
        const connection = this.positionModel.db;
        if (!connection.models[Department.name]) {
          connection.model(Department.name, DepartmentSchema, 'departments');
        }
      } catch (err) {
        console.warn('Could not ensure Department model is accessible for update:', err);
      }

      // Capture before snapshot
      const beforeSnapshot = {
        code: position.code,
        title: position.title,
        description: position.description,
        departmentId: position.departmentId?.toString(),
        reportsToPositionId: position.reportsToPositionId?.toString(),
      };

      const updatedPosition = await this.positionModel
        .findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        })
        .populate('departmentId', 'code name')
        .populate('reportsToPositionId', 'code title')
        .exec();

      // Capture after snapshot
      const afterSnapshot = {
        code: updatedPosition.code,
        title: updatedPosition.title,
        description: updatedPosition.description,
        departmentId: updatedPosition.departmentId?.toString(),
        reportsToPositionId: updatedPosition.reportsToPositionId?.toString(),
      };

      // Determine action type
      const logAction = updatePositionDto.reportsToPositionId !== undefined 
        ? ChangeLogAction.REASSIGNED 
        : ChangeLogAction.UPDATED;

      // Log the change
      await this.logChange(
        logAction,
        'Position',
        updatedPosition._id,
        userId,
        beforeSnapshot,
        afterSnapshot,
        logAction === ChangeLogAction.REASSIGNED
          ? `Reassigned Position "${updatedPosition.code}" - ${updatedPosition.title}`
          : `Updated Position "${updatedPosition.code}" - ${updatedPosition.title}`,
      );

      // Notify HR_MANAGER and HR_ADMIN
      try {
        const action = updatePositionDto.reportsToPositionId !== undefined ? 'updated (reporting line changed)' : 'updated';
        await this.notifyHRTeamAboutStructuralChange(
          action,
          'Position',
          updatedPosition.title,
          updatedPosition.code,
        );
      } catch (error) {
        console.error('[Position] Error sending update notification:', error);
      }

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

      // Capture before snapshot
      const beforeSnapshot = {
        code: position.code,
        title: position.title,
        description: position.description,
        departmentId: position.departmentId?.toString(),
        reportsToPositionId: position.reportsToPositionId?.toString(),
        isActive: position.isActive,
      };

      const positionDoc = position as PositionDocument;
      positionDoc.isActive = false;

      const savedPosition = await positionDoc.save();

      // Log the change
      await this.logChange(
        ChangeLogAction.DEACTIVATED,
        'Position',
        savedPosition._id,
        userId,
        beforeSnapshot,
        {
          isActive: false,
        },
        `Deactivated Position "${savedPosition.code}" - ${savedPosition.title}`,
      );

      // Notify HR_MANAGER and HR_ADMIN
      try {
        await this.notifyHRTeamAboutStructuralChange(
          'deleted',
          'Position',
          savedPosition.title,
          savedPosition.code,
        );
      } catch (error) {
        console.error('[Position] Error sending deletion notification:', error);
      }

      return savedPosition;
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

      // Use updateOne on collection to bypass Mongoose hooks that would override reportsToPositionId
      // The hooks are designed to auto-assign to department head, but we want explicit control here
      const updateData: any = {
        reportsToPositionId: reportsToPositionId
          ? new Types.ObjectId(reportsToPositionId)
          : null,
      };

      // Update directly on collection to bypass hooks
      await this.positionModel.collection.updateOne(
        { _id: new Types.ObjectId(positionId) },
        { $set: updateData }
      );

      // Capture before snapshot
      const beforeSnapshot = {
        reportsToPositionId: position.reportsToPositionId?.toString(),
      };

      // Fetch the updated position
      const updatedPosition = await this.positionModel.findById(positionId).exec();

      if (!updatedPosition) {
        throw new NotFoundException('Position not found');
      }

      // Capture after snapshot
      const afterSnapshot = {
        reportsToPositionId: updatedPosition.reportsToPositionId?.toString(),
      };

      // Log the change
      await this.logChange(
        ChangeLogAction.REASSIGNED,
        'Position',
        updatedPosition._id,
        userId,
        beforeSnapshot,
        afterSnapshot,
        `Reassigned Position "${updatedPosition.code}" - ${updatedPosition.title}`,
      );

      // Notify HR_MANAGER and HR_ADMIN about reporting line change
      try {
        await this.notifyHRTeamAboutStructuralChange(
          'updated (reporting line changed)',
          'Position',
          updatedPosition.title,
          updatedPosition.code,
        );
      } catch (error) {
        console.error('[Position] Error sending reporting line change notification:', error);
      }

      return updatedPosition;
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

      await this.validateDepartmentExists(departmentId); // Ignore return value

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
      await this.validateDepartmentExists(departmentId); // Ignore return value

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
      try {
        // Validate userId is a valid ObjectId
        if (!Types.ObjectId.isValid(userId)) {
          throw new BadRequestException(`Invalid userId: ${userId}`);
        }

      const requestNumber = await this.generateRequestNumber();

        // Create the document data
        const changeRequestData: any = {
        requestNumber,
        requestedByEmployeeId: new Types.ObjectId(userId),
        requestType: createDto.requestType,
        status: StructureRequestStatus.DRAFT,
        };

        // Add optional fields only if they exist
        if (createDto.targetDepartmentId) {
          if (!Types.ObjectId.isValid(createDto.targetDepartmentId)) {
            throw new BadRequestException(`Invalid targetDepartmentId: ${createDto.targetDepartmentId}`);
          }
          changeRequestData.targetDepartmentId = new Types.ObjectId(createDto.targetDepartmentId);
        }

        if (createDto.targetPositionId) {
          if (!Types.ObjectId.isValid(createDto.targetPositionId)) {
            throw new BadRequestException(`Invalid targetPositionId: ${createDto.targetPositionId}`);
          }
          changeRequestData.targetPositionId = new Types.ObjectId(createDto.targetPositionId);
        }

        if (createDto.details) {
          changeRequestData.details = createDto.details;
        }

        if (createDto.reason) {
          changeRequestData.reason = createDto.reason;
        }

        // Use new + save() with explicit _id to work around schema auto: true issue
        const changeRequest = new this.changeRequestModel({
          ...changeRequestData,
          _id: new Types.ObjectId(), // Explicitly set _id
        });
        const savedRequest = await changeRequest.save();
        
        // Verify it was saved with an _id
        if (!savedRequest._id) {
          throw new Error('Failed to create change request: _id was not generated');
        }
        
        return savedRequest;
      } catch (error) {
        console.error('Error creating change request:', error);
        throw error;
      }
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
        throw new BadRequestException(`Invalid change request ID: ${id}`);
      }

      // Try to find by _id first
      let changeRequest = await this.changeRequestModel
        .findById(id)
        .populate('requestedByEmployeeId', 'firstName lastName')
        .populate('submittedByEmployeeId', 'firstName lastName')
        .exec();

      // If not found, try finding by _id as ObjectId
      if (!changeRequest) {
        try {
          changeRequest = await this.changeRequestModel
            .findOne({ _id: new Types.ObjectId(id) })
            .populate('requestedByEmployeeId', 'firstName lastName')
            .populate('submittedByEmployeeId', 'firstName lastName')
            .exec();
        } catch (err) {
          console.error('Error finding change request:', err);
        }
      }

      if (!changeRequest) {
        // Log for debugging
        const count = await this.changeRequestModel.countDocuments({});
        console.error(`Change request not found. ID: ${id}, Total requests in DB: ${count}`);
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

      const savedRequest = await changeRequestDoc.save();

      console.log('[ChangeRequest] Request submitted successfully:', {
        requestNumber: savedRequest.requestNumber,
        requestType: savedRequest.requestType,
        status: savedRequest.status,
        requestedBy: savedRequest.requestedByEmployeeId,
      });

      // Send notification to SYSTEM_ADMIN when request is submitted
      try {
        await this.notifyChangeRequestCreated(
          savedRequest.requestNumber,
          savedRequest.requestType,
          savedRequest.requestedByEmployeeId as Types.ObjectId,
        );
        console.log('[ChangeRequest] Notification sent successfully');
      } catch (notifError) {
        console.error('[ChangeRequest] Failed to send notification:', notifError);
        // Don't fail the request if notification fails
      }

      return savedRequest;
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

      // Use create() with explicit _id to work around schema auto: true issue
      await this.approvalModel.create({
        _id: new Types.ObjectId(), // Explicitly set _id
        changeRequestId: new Types.ObjectId(id),
        approverEmployeeId: new Types.ObjectId(userId),
        decision: reviewDto.approved
          ? ApprovalDecision.APPROVED
          : ApprovalDecision.REJECTED,
        decidedAt: new Date(),
        comments: reviewDto.comments,
      });

      // If approved, implement the change request
      let finalStatus = reviewDto.approved
        ? StructureRequestStatus.APPROVED
        : StructureRequestStatus.REJECTED;

      if (reviewDto.approved) {
        try {
          await this.implementChangeRequest(changeRequest, userId);
          finalStatus = StructureRequestStatus.IMPLEMENTED; // Set to IMPLEMENTED after successful implementation
        } catch (error) {
          console.error('Error implementing change request:', error);
          // Don't fail the approval if implementation fails - just log it
          // The request is still approved, but implementation can be retried
        }
      }

      // Update using collection.updateOne to bypass Mongoose hooks/validation
      const updateResult = await this.changeRequestModel.collection.updateOne(
        { _id: new Types.ObjectId(id) },
        {
          $set: {
            status: finalStatus,
            updatedAt: new Date(),
          },
        },
      );

      if (updateResult.matchedCount === 0) {
        throw new NotFoundException(`Change request with ID '${id}' not found`);
      }

      // Return the document we already have, but update its status
      const changeRequestDoc = changeRequest as StructureChangeRequestDocument;
      changeRequestDoc.status = finalStatus;
      
      // Send notifications based on decision
      try {
        // Ensure requestedByEmployeeId is properly formatted
        let requesterId: Types.ObjectId;
        const requestedBy = changeRequest.requestedByEmployeeId;
        
        if (requestedBy instanceof Types.ObjectId) {
          requesterId = requestedBy;
        } else if (requestedBy && typeof requestedBy === 'object' && (requestedBy as any)._id) {
          requesterId = (requestedBy as any)._id instanceof Types.ObjectId 
            ? (requestedBy as any)._id 
            : new Types.ObjectId((requestedBy as any)._id);
        } else if (typeof requestedBy === 'string' && Types.ObjectId.isValid(requestedBy)) {
          requesterId = new Types.ObjectId(requestedBy);
        } else {
          console.error('[ChangeRequest] Invalid requestedByEmployeeId format:', requestedBy);
          requesterId = requestedBy as any;
        }
        
        if (reviewDto.approved) {
          await this.notifyChangeRequestApproved(
            changeRequest.requestNumber,
            changeRequest.requestType,
            requesterId,
            reviewDto.comments,
          );
        } else {
          await this.notifyChangeRequestRejected(
            changeRequest.requestNumber,
            changeRequest.requestType,
            requesterId,
            reviewDto.comments || 'No reason provided',
          );
        }
      } catch (error) {
        console.error('[ChangeRequest] Error sending notification:', error);
        // Don't fail the review if notification fails
      }
      
      return changeRequestDoc;
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

      // Use create() with explicit _id to work around schema auto: true issue
      await this.approvalModel.create({
        _id: new Types.ObjectId(), // Explicitly set _id
        changeRequestId: new Types.ObjectId(id),
        approverEmployeeId: new Types.ObjectId(userId),
        decision: ApprovalDecision.APPROVED,
        decidedAt: new Date(),
        comments: approveDto.comments,
      });

      // Implement the change request based on its type
      try {
        await this.implementChangeRequest(changeRequest, userId);
      } catch (error) {
        console.error('Error implementing change request:', error);
        // Don't fail the approval if implementation fails - just log it
        // The request is still approved, but implementation can be retried
      }

      // Update using collection.updateOne to bypass Mongoose hooks/validation
      const updateResult = await this.changeRequestModel.collection.updateOne(
        { _id: new Types.ObjectId(id) },
        {
          $set: {
            status: StructureRequestStatus.IMPLEMENTED, // Set to IMPLEMENTED after successful implementation
            updatedAt: new Date(),
          },
        },
      );

      if (updateResult.matchedCount === 0) {
        throw new NotFoundException(`Change request with ID '${id}' not found`);
      }

      // Return the document we already have, but update its status
      const changeRequestDoc = changeRequest as StructureChangeRequestDocument;
      changeRequestDoc.status = StructureRequestStatus.IMPLEMENTED;
      
      // Send notification to requester (HR_MANAGER or HR_ADMIN who created it)
      try {
        // Ensure requestedByEmployeeId is properly formatted
        let requesterId: Types.ObjectId;
        const requestedBy = changeRequest.requestedByEmployeeId;
        
        if (requestedBy instanceof Types.ObjectId) {
          requesterId = requestedBy;
        } else if (requestedBy && typeof requestedBy === 'object' && (requestedBy as any)._id) {
          requesterId = (requestedBy as any)._id instanceof Types.ObjectId 
            ? (requestedBy as any)._id 
            : new Types.ObjectId((requestedBy as any)._id);
        } else if (typeof requestedBy === 'string' && Types.ObjectId.isValid(requestedBy)) {
          requesterId = new Types.ObjectId(requestedBy);
        } else {
          console.error('[ChangeRequest] Invalid requestedByEmployeeId format:', requestedBy);
          requesterId = requestedBy as any;
        }
        
        await this.notifyChangeRequestApproved(
          changeRequest.requestNumber,
          changeRequest.requestType,
          requesterId,
          approveDto.comments,
        );
      } catch (error) {
        console.error('[ChangeRequest] Error sending approval notification:', error);
        // Don't fail the approval if notification fails
      }
      
      return changeRequestDoc;
    }

    private async implementChangeRequest(
      changeRequest: StructureChangeRequest,
      userId: string,
    ): Promise<void> {
      const { requestType, details, targetDepartmentId, targetPositionId } = changeRequest;

      switch (requestType) {
        case StructureRequestType.NEW_DEPARTMENT:
          if (!details) {
            throw new BadRequestException('Change request details are missing');
          }
          try {
            const deptData = JSON.parse(details);
            await this.createDepartment(
              {
                code: deptData.code,
                name: deptData.name,
                description: deptData.description,
              },
              userId,
            );
          } catch (error) {
            console.error('Error creating department from change request:', error);
            throw error;
          }
          break;

        case StructureRequestType.NEW_POSITION:
          if (!details) {
            throw new BadRequestException('Change request details are missing');
          }
          try {
            const posData = JSON.parse(details);
            await this.createPosition(
              {
                code: posData.code,
                title: posData.title,
                description: posData.description,
                departmentId: posData.departmentId,
              },
              userId,
            );
          } catch (error) {
            console.error('Error creating position from change request:', error);
            throw error;
          }
          break;

        case StructureRequestType.UPDATE_DEPARTMENT:
          if (!targetDepartmentId) {
            throw new BadRequestException('Target department ID is missing');
          }
          // For UPDATE_DEPARTMENT, the details should contain the fields to update
          if (details) {
            try {
              const updateData = JSON.parse(details);
              await this.updateDepartment(targetDepartmentId.toString(), updateData, userId);
            } catch (error) {
              console.error('Error updating department from change request:', error);
              throw error;
            }
          }
          break;

        case StructureRequestType.UPDATE_POSITION:
          if (!targetPositionId) {
            throw new BadRequestException('Target position ID is missing');
          }
          // For UPDATE_POSITION, the details should contain the fields to update
          if (details) {
            try {
              const updateData = JSON.parse(details);
              await this.updatePosition(targetPositionId.toString(), updateData, userId);
            } catch (error) {
              console.error('Error updating position from change request:', error);
              throw error;
            }
          }
          break;

        case StructureRequestType.CLOSE_POSITION:
          if (!targetPositionId) {
            throw new BadRequestException('Target position ID is missing');
          }
          // Close/deactivate the position
          await this.removePosition(targetPositionId.toString(), userId);
          break;

        default:
          throw new BadRequestException(`Unknown request type: ${requestType}`);
      }
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

      // Use create() with explicit _id to work around schema auto: true issue
      await this.approvalModel.create({
        _id: new Types.ObjectId(), // Explicitly set _id
        changeRequestId: new Types.ObjectId(id),
        approverEmployeeId: new Types.ObjectId(userId),
        decision: ApprovalDecision.REJECTED,
        decidedAt: new Date(),
        comments: reason,
      });

      // Update using collection.updateOne to bypass Mongoose hooks/validation
      const updateResult = await this.changeRequestModel.collection.updateOne(
        { _id: new Types.ObjectId(id) },
        {
          $set: {
            status: StructureRequestStatus.REJECTED,
            updatedAt: new Date(),
          },
        },
      );

      if (updateResult.matchedCount === 0) {
        throw new NotFoundException(`Change request with ID '${id}' not found`);
      }

      // Return the document we already have, but update its status
      const changeRequestDoc = changeRequest as StructureChangeRequestDocument;
      changeRequestDoc.status = StructureRequestStatus.REJECTED;

      // Send notification to requester (HR_MANAGER or HR_ADMIN who created it)
      try {
        // Ensure requestedByEmployeeId is properly formatted
        let requesterId: Types.ObjectId;
        const requestedBy = changeRequest.requestedByEmployeeId;
        
        if (requestedBy instanceof Types.ObjectId) {
          requesterId = requestedBy;
        } else if (requestedBy && typeof requestedBy === 'object' && (requestedBy as any)._id) {
          requesterId = (requestedBy as any)._id instanceof Types.ObjectId 
            ? (requestedBy as any)._id 
            : new Types.ObjectId((requestedBy as any)._id);
        } else if (typeof requestedBy === 'string' && Types.ObjectId.isValid(requestedBy)) {
          requesterId = new Types.ObjectId(requestedBy);
        } else {
          console.error('[ChangeRequest] Invalid requestedByEmployeeId format:', requestedBy);
          requesterId = requestedBy as any;
        }
        
        await this.notifyChangeRequestRejected(
          changeRequest.requestNumber,
          changeRequest.requestType,
          requesterId,
          reason,
        );
      } catch (error) {
        console.error('[ChangeRequest] Error sending rejection notification:', error);
        // Don't fail the rejection if notification fails
      }

      return changeRequestDoc;
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

    private async validateDepartmentExists(departmentId: string): Promise<DepartmentDocument> {
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

      return department;
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

  /**
   * Check if an employee is a department head based on their primaryPositionId
   * matching any department's headPositionId
   */
  async isEmployeeDepartmentHead(employeeId: string): Promise<boolean> {
    try {
      const employee = await this.employeeModel
        .findById(employeeId)
        .select('primaryPositionId primaryDepartmentId')
        .lean()
        .exec();

      if (!employee || !employee.primaryPositionId) {
        return false;
      }

      // Check if the employee's primaryPositionId matches any department's headPositionId
      const department = await this.departmentModel
        .findOne({
          headPositionId: employee.primaryPositionId,
          isActive: true,
        })
        .lean()
        .exec();

      return !!department;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sync roles for an employee based on their position and department
   * This should be called whenever an employee's primaryPositionId or primaryDepartmentId is updated
   */
  async syncEmployeeRoles(employeeId: string): Promise<void> {
    try {
      const employee = await this.employeeModel
        .findById(employeeId)
        .select('primaryPositionId primaryDepartmentId')
        .lean()
        .exec();

      if (!employee) {
        return;
      }

      // Get or create EmployeeSystemRole for this employee
      let systemRole = await this.employeeSystemRoleModel
        .findOne({ employeeProfileId: new Types.ObjectId(employeeId), isActive: true })
        .exec();

      if (!systemRole) {
        systemRole = new this.employeeSystemRoleModel({
          employeeProfileId: new Types.ObjectId(employeeId),
          roles: [],
          permissions: [],
          isActive: true,
        });
      }

      const rolesToAdd: SystemRole[] = [];
      const rolesToRemove: SystemRole[] = [];

      // Check if employee is a department head
      if (employee.primaryPositionId) {
        const isDepartmentHead = await this.isPositionDepartmentHead(
          employee.primaryPositionId.toString(),
        );
        if (isDepartmentHead) {
          if (!systemRole.roles.includes(SystemRole.DEPARTMENT_HEAD)) {
            rolesToAdd.push(SystemRole.DEPARTMENT_HEAD);
          }
        } else {
          // Remove DEPARTMENT_HEAD if they're no longer a head
          if (systemRole.roles.includes(SystemRole.DEPARTMENT_HEAD)) {
            rolesToRemove.push(SystemRole.DEPARTMENT_HEAD);
          }
        }
      } else {
        // Remove DEPARTMENT_HEAD if they don't have a position
        if (systemRole.roles.includes(SystemRole.DEPARTMENT_HEAD)) {
          rolesToRemove.push(SystemRole.DEPARTMENT_HEAD);
        }
      }

      // Check if employee is assigned to a department (has primaryDepartmentId or primaryPositionId)
      // DEPARTMENT_EMPLOYEE role should be kept if they have ANY department/position assignment
      // This role is NOT mutually exclusive with DEPARTMENT_HEAD - someone can be both
      // (e.g., head in one department, employee in another, or just associated with departments)
      if (employee.primaryDepartmentId || employee.primaryPositionId) {
        if (!systemRole.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE)) {
          rolesToAdd.push(SystemRole.DEPARTMENT_EMPLOYEE);
        }
        // Don't remove DEPARTMENT_EMPLOYEE even if they become a head - they're still an employee
      } else {
        // Only remove DEPARTMENT_EMPLOYEE if they have NO department or position assignment
        if (systemRole.roles.includes(SystemRole.DEPARTMENT_EMPLOYEE)) {
          rolesToRemove.push(SystemRole.DEPARTMENT_EMPLOYEE);
        }
      }

      // Apply role changes
      if (rolesToAdd.length > 0 || rolesToRemove.length > 0) {
        // Add new roles
        for (const role of rolesToAdd) {
          if (!systemRole.roles.includes(role)) {
            systemRole.roles.push(role);
          }
        }

        // Remove roles
        systemRole.roles = systemRole.roles.filter(
          (role) => !rolesToRemove.includes(role),
        );

        await systemRole.save();
      }
    } catch (error) {
      console.error('Error syncing employee roles:', error);
      // Don't throw - this is a background sync operation
    }
  }

  /**
   * Check if a position is a department head position
   */
  private async isPositionDepartmentHead(positionId: string): Promise<boolean> {
    try {
      const department = await this.departmentModel
        .findOne({
          headPositionId: new Types.ObjectId(positionId),
          isActive: true,
        })
        .lean()
        .exec();

      return !!department;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sync roles for all employees with a given position
   * Used when a position becomes a department head or when department head is removed
   */
  private async syncEmployeeRolesForPosition(positionId: string): Promise<void> {
    try {
      const employees = await this.employeeModel
        .find({ primaryPositionId: new Types.ObjectId(positionId) })
        .select('_id')
        .lean()
        .exec();

      for (const employee of employees) {
        await this.syncEmployeeRoles(employee._id.toString());
      }
    } catch (error) {
      console.error('Error syncing roles for position:', error);
    }
  }

  // =====================================
  // NOTIFICATION HELPER METHODS
  // =====================================

    /**
     * Get employee IDs by their system roles
     */
    private async getEmployeeIdsByRoles(roles: SystemRole[]): Promise<Types.ObjectId[]> {
      try {
        // Query for employees with any of the specified roles
        const roleRecords = await this.employeeSystemRoleModel
          .find({ 
            roles: { $in: roles }, 
            isActive: true 
          })
          .select('employeeProfileId')
          .lean()
          .exec();

        const employeeIds: Types.ObjectId[] = [];
        
        for (const record of roleRecords) {
          const empId = record.employeeProfileId;
          if (!empId) continue;
          
          let objectId: Types.ObjectId;
          if (empId instanceof Types.ObjectId) {
            objectId = empId;
          } else if (typeof empId === 'string' && Types.ObjectId.isValid(empId)) {
            objectId = new Types.ObjectId(empId);
          } else if (empId && typeof empId === 'object' && (empId as any)._id) {
            // Handle populated references
            const idValue = (empId as any)._id;
            objectId = idValue instanceof Types.ObjectId ? idValue : new Types.ObjectId(idValue);
          } else {
            continue; // Skip invalid IDs
          }
          
          employeeIds.push(objectId);
        }
        
        return employeeIds;
      } catch (error) {
        console.error('[Notification] Error fetching employees by roles:', error);
        return [];
      }
    }

    /**
     * Send notification to specific employee
     */
    private async sendNotificationToEmployee(
      employeeId: Types.ObjectId | string,
      type: string,
      message: string,
    ): Promise<void> {
      try {
        // Convert to ObjectId - must be valid ObjectId
        let employeeObjectId: Types.ObjectId;
        
        if (employeeId instanceof Types.ObjectId) {
          employeeObjectId = employeeId;
        } else if (typeof employeeId === 'string' && Types.ObjectId.isValid(employeeId)) {
          employeeObjectId = new Types.ObjectId(employeeId);
        } else {
          console.error(`[Notification] Invalid employee ID format: ${employeeId}`);
          return;
        }
        
        // Create notification
        const notification = await this.notificationLogModel.create({
          to: employeeObjectId,
          type,
          message,
        });
        
        // Verify it was saved
        const saved = await this.notificationLogModel.findById(notification._id).lean().exec();
        if (!saved) {
          console.error(`[Notification] Failed to save notification for employee ${employeeObjectId.toString()}`);
        }
      } catch (error) {
        console.error(`[Notification] Error creating notification:`, error);
        // Don't throw - notifications are non-critical
      }
    }

    /**
     * Send notification to multiple employees by roles
     */
    private async sendNotificationToRoles(
      roles: SystemRole[],
      type: string,
      message: string,
      excludeEmployeeIds?: (Types.ObjectId | string)[],
    ): Promise<void> {
      try {
        const employeeIds = await this.getEmployeeIdsByRoles(roles);
        
        if (employeeIds.length === 0) {
          return;
        }
        
        // Convert excludeEmployeeIds to strings for comparison
        const excludeIds: string[] = [];
        if (excludeEmployeeIds && excludeEmployeeIds.length > 0) {
          for (const excludeId of excludeEmployeeIds) {
            if (excludeId instanceof Types.ObjectId) {
              excludeIds.push(excludeId.toString());
            } else if (typeof excludeId === 'string' && Types.ObjectId.isValid(excludeId)) {
              excludeIds.push(excludeId);
            }
          }
        }
        
        // Filter out excluded employees only if there are exclusions
        let filteredEmployeeIds = employeeIds;
        if (excludeIds.length > 0) {
          filteredEmployeeIds = employeeIds.filter(empId => {
            const empIdStr = empId.toString();
            return !excludeIds.includes(empIdStr);
          });
        }
        
        // Send notification to each employee sequentially to ensure they're all created
        for (const employeeId of filteredEmployeeIds) {
          await this.sendNotificationToEmployee(employeeId, type, message);
        }
      } catch (error) {
        console.error('[Notification] Error sending notifications to roles:', error);
        // Don't throw - notifications are non-critical
      }
    }

    /**
     * Send notification when change request is created
     */
    private async notifyChangeRequestCreated(
      requestNumber: string,
      requestType: StructureRequestType,
      requesterId: Types.ObjectId,
    ): Promise<void> {
      try {
        // Ensure requesterId is ObjectId
        let requesterObjectId: Types.ObjectId;
        if (requesterId instanceof Types.ObjectId) {
          requesterObjectId = requesterId;
        } else if (Types.ObjectId.isValid(requesterId)) {
          requesterObjectId = new Types.ObjectId(requesterId);
        } else {
          console.error('[Notification] Invalid requester ID format:', requesterId);
          return;
        }
        
        // Get all SYSTEM_ADMIN users
        const systemAdminIds = await this.getEmployeeIdsByRoles([SystemRole.SYSTEM_ADMIN]);
        
        if (systemAdminIds.length === 0) {
          console.warn('[Notification] No SYSTEM_ADMIN users found');
          return;
        }
        
        // Filter out the requester (if they happen to be a SYSTEM_ADMIN)
        const requesterIdStr = requesterObjectId.toString();
        const adminIdsToNotify = systemAdminIds.filter(adminId => {
          return adminId.toString() !== requesterIdStr;
        });
        
        // Send notification to each SYSTEM_ADMIN (excluding requester)
        const message = `New change request ${requestNumber} (${requestType}) has been submitted and requires your review.`;
        
        for (const adminId of adminIdsToNotify) {
          await this.sendNotificationToEmployee(adminId, 'org_structure_change_request_created', message);
        }
      } catch (error) {
        console.error('[Notification] Error sending change request created notification:', error);
        // Don't throw - notifications are non-critical
      }
    }

    /**
     * Send notification when change request is approved
     */
    private async notifyChangeRequestApproved(
      requestNumber: string,
      requestType: StructureRequestType,
      requesterId: Types.ObjectId,
      approverComments?: string,
    ): Promise<void> {
      try {
        // Ensure requesterId is ObjectId
        const requesterObjectId = requesterId instanceof Types.ObjectId 
          ? requesterId 
          : (Types.ObjectId.isValid(requesterId) ? new Types.ObjectId(requesterId) : requesterId);
        
        if (!(requesterObjectId instanceof Types.ObjectId)) {
          console.error('[Notification] Invalid requester ID format:', requesterId);
          return;
        }
        
        // Notify the requester (HR_MANAGER or HR_ADMIN who created the request)
        const requesterMessage = `Your change request ${requestNumber} (${requestType}) has been approved${approverComments ? ` with comments: ${approverComments}` : ''}.`;
        await this.sendNotificationToEmployee(
          requesterObjectId,
          'org_structure_change_request_approved',
          requesterMessage,
        );
      } catch (error) {
        console.error('[Notification] Error sending change request approved notification:', error);
        // Don't throw - notifications are non-critical
      }
    }

    /**
     * Log a change to the audit trail
     */
    private async logChange(
      action: ChangeLogAction,
      entityType: 'Department' | 'Position',
      entityId: Types.ObjectId,
      userId: string,
      beforeSnapshot?: Record<string, unknown>,
      afterSnapshot?: Record<string, unknown>,
      summary?: string,
    ): Promise<void> {
      const entityName = entityType === 'Department' ? 'Department' : 'Position';
      const defaultSummary = summary || `${action} ${entityName} ${entityId}`;
      
      const logData: any = {
        action,
        entityType,
        entityId,
        beforeSnapshot,
        afterSnapshot,
        summary: defaultSummary,
      };

      try {

        // Only add performedByEmployeeId if userId is valid
        if (userId && Types.ObjectId.isValid(userId)) {
          logData.performedByEmployeeId = new Types.ObjectId(userId);
        }

        console.log('[ChangeLog] Attempting to create log with data:', {
          action,
          entityType,
          entityId: entityId?.toString(),
          userId,
          hasModel: !!this.changeLogModel,
          logData: JSON.stringify(logData, null, 2),
        });
        
        if (!this.changeLogModel) {
          throw new Error('changeLogModel is not available');
        }
        
        // Use insertOne directly to ensure it works - bypass Mongoose validation
        console.log('[ChangeLog] Collection name:', this.changeLogModel.collection.name);
        
        const insertDoc: any = {
          action: logData.action,
          entityType: logData.entityType,
          entityId: logData.entityId,
          beforeSnapshot: logData.beforeSnapshot || {},
          afterSnapshot: logData.afterSnapshot || {},
          summary: logData.summary,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        if (logData.performedByEmployeeId) {
          insertDoc.performedByEmployeeId = logData.performedByEmployeeId;
        }
        
        console.log('[ChangeLog] Inserting document:', JSON.stringify(insertDoc, null, 2));
        
        const result = await this.changeLogModel.collection.insertOne(insertDoc);
        
        console.log('[ChangeLog] Insert result:', {
          insertedId: result.insertedId?.toString(),
          acknowledged: result.acknowledged,
        });
        
        // Verify it was saved
        const verifyLog = await this.changeLogModel.findById(result.insertedId);
        if (!verifyLog) {
          throw new Error('Log was created but could not be retrieved');
        }
        
        console.log('[ChangeLog] ✅ Successfully logged and verified change:', {
          logId: result.insertedId?.toString(),
          action,
          entityType,
          entityId: entityId?.toString(),
          userId,
          summary: defaultSummary,
          createdAt: (verifyLog as any).createdAt || new Date(),
        });
      } catch (error: any) {
        console.error('[ChangeLog] ❌ CRITICAL ERROR recording change:', error);
        console.error('[ChangeLog] Error details:', {
          action,
          entityType,
          entityId: entityId?.toString(),
          userId,
          errorMessage: error?.message || String(error),
          errorStack: error?.stack,
          errorName: error?.name,
          logData: JSON.stringify(logData, null, 2),
        });
        // Don't throw - logging is non-critical, but log the error
        // The error will be visible in console
      }
    }

    /**
     * Notify HR_MANAGER and HR_ADMIN about structural changes
     */
    private async notifyHRTeamAboutStructuralChange(
      action: string,
      entityType: 'Department' | 'Position',
      entityName: string,
      entityCode?: string,
    ): Promise<void> {
      try {
        const message = `${entityType} ${entityCode ? `"${entityCode}"` : entityName} has been ${action}.`;
        
        await this.sendNotificationToRoles(
          [SystemRole.HR_ADMIN, SystemRole.HR_MANAGER],
          'org_structure_change',
          message,
        );
      } catch (error) {
        console.error('[Notification] Error sending structural change notification:', error);
        // Don't throw - notifications are non-critical
      }
    }

    /**
     * Send notification when change request is rejected
     */
    private async notifyChangeRequestRejected(
      requestNumber: string,
      requestType: StructureRequestType,
      requesterId: Types.ObjectId,
      rejectionReason: string,
    ): Promise<void> {
      try {
        // Ensure requesterId is ObjectId
        const requesterObjectId = requesterId instanceof Types.ObjectId 
          ? requesterId 
          : (Types.ObjectId.isValid(requesterId) ? new Types.ObjectId(requesterId) : requesterId);
        
        if (!(requesterObjectId instanceof Types.ObjectId)) {
          console.error('[Notification] Invalid requester ID format:', requesterId);
          return;
        }
        
        // Notify the requester (HR_MANAGER or HR_ADMIN who created the request)
        const requesterMessage = `Your change request ${requestNumber} (${requestType}) has been rejected. Reason: ${rejectionReason}`;
        await this.sendNotificationToEmployee(
          requesterObjectId,
          'org_structure_change_request_rejected',
          requesterMessage,
        );
      } catch (error) {
        console.error('[Notification] Error sending change request rejected notification:', error);
        // Don't throw - notifications are non-critical
      }
    }

    /**
     * Get audit logs (change history) with filtering and pagination
     */
    async getChangeLogs(query: {
      page?: number;
      limit?: number;
      action?: ChangeLogAction;
      entityType?: 'Department' | 'Position';
      entityId?: string;
      performedBy?: string;
      startDate?: Date;
      endDate?: Date;
    }): Promise<{
      data: StructureChangeLogDocument[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.action) {
        filter.action = query.action;
      }

      if (query.entityType) {
        filter.entityType = query.entityType;
      }

      if (query.entityId) {
        filter.entityId = Types.ObjectId.isValid(query.entityId)
          ? new Types.ObjectId(query.entityId)
          : query.entityId;
      }

      if (query.performedBy) {
        filter.performedByEmployeeId = Types.ObjectId.isValid(query.performedBy)
          ? new Types.ObjectId(query.performedBy)
          : query.performedBy;
      }

      if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) {
          filter.createdAt.$gte = query.startDate;
        }
        if (query.endDate) {
          filter.createdAt.$lte = query.endDate;
        }
      }

      // Fetch logs with pagination
      console.log('[ChangeLog] Fetching logs with filter:', JSON.stringify(filter, null, 2));
      console.log('[ChangeLog] Query params:', { page, limit, skip });
      
      // First check total count without filter
      const totalWithoutFilter = await this.changeLogModel.countDocuments({}).exec();
      console.log('[ChangeLog] Total logs in database (no filter):', totalWithoutFilter);
      
      const [data, total] = await Promise.all([
        this.changeLogModel
          .find(filter)
          .sort({ createdAt: -1 }) // Newest first
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'performedByEmployeeId',
            model: 'EmployeeProfile',
            select: 'firstName lastName email',
          })
          .exec(),
        this.changeLogModel.countDocuments(filter).exec(),
      ]);

      console.log('[ChangeLog] Query results:', {
        count: data.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        sampleLog: data.length > 0 ? {
          _id: data[0]._id?.toString(),
          action: data[0].action,
          entityType: data[0].entityType,
          entityId: data[0].entityId?.toString(),
          createdAt: (data[0] as any).createdAt || new Date(),
        } : null,
      });

      // Convert to plain objects for JSON serialization
      const plainData = data.map((doc: any) => {
        const performedBy = doc.performedByEmployeeId;
        let performedByEmployeeId: string | undefined;
        let performedByEmployee: any = undefined;

        if (performedBy) {
          if (typeof performedBy === 'object' && !(performedBy instanceof Types.ObjectId)) {
            // Populated employee
            performedByEmployeeId = performedBy._id?.toString() || performedBy.toString();
            performedByEmployee = {
              firstName: performedBy.firstName || '',
              lastName: performedBy.lastName || '',
              email: performedBy.email || '',
            };
          } else {
            // Just ObjectId
            performedByEmployeeId = performedBy.toString();
          }
        }

        return {
          _id: doc._id?.toString() || '',
          action: doc.action || '',
          entityType: doc.entityType || '',
          entityId: doc.entityId?.toString() || '',
          performedByEmployeeId,
          performedByEmployee,
          summary: doc.summary || '',
          beforeSnapshot: doc.beforeSnapshot || {},
          afterSnapshot: doc.afterSnapshot || {},
          createdAt: doc.createdAt 
            ? (doc.createdAt instanceof Date 
                ? doc.createdAt.toISOString() 
                : new Date(doc.createdAt).toISOString())
            : new Date().toISOString(),
          updatedAt: doc.updatedAt 
            ? (doc.updatedAt instanceof Date 
                ? doc.updatedAt.toISOString() 
                : new Date(doc.updatedAt).toISOString())
            : new Date().toISOString(),
        };
      });

      return {
        data: plainData as any,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    /**
     * Get notifications for a specific employee
     */
    async getNotificationsForEmployee(employeeId: string | Types.ObjectId): Promise<any[]> {
      // Convert to ObjectId
      let employeeObjectId: Types.ObjectId;
      
      if (employeeId instanceof Types.ObjectId) {
        employeeObjectId = employeeId;
      } else if (typeof employeeId === 'string' && Types.ObjectId.isValid(employeeId)) {
        employeeObjectId = new Types.ObjectId(employeeId);
      } else {
        return [];
      }
      
      // Query - MongoDB will match ObjectId correctly
      const notifications = await this.notificationLogModel
        .find({ to: employeeObjectId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
        .exec();
      
      return notifications.map((n: any) => ({
        _id: n._id,
        to: n.to,
        type: n.type,
        message: n.message,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      }));
    }

    /**
     * Create a test notification for debugging
     */
    async createTestNotification(employeeId: string): Promise<any> {
      const employeeObjectId = new Types.ObjectId(employeeId);
      
      const testNotification = await this.notificationLogModel.create({
        to: employeeObjectId,
        type: 'test_notification',
        message: `Test notification created at ${new Date().toISOString()}`,
      });
      
      console.log('[Notification] Test notification created:', {
        notificationId: testNotification._id,
        to: testNotification.to,
        type: testNotification.type,
        message: testNotification.message,
      });
      
      return testNotification;
    }

    /**
     * Debug method to check notifications and SYSTEM_ADMIN users
     */
    async debugNotifications(): Promise<any> {
      // Get all SYSTEM_ADMIN users
      const systemAdmins = await this.employeeSystemRoleModel
        .find({ 
          roles: { $in: [SystemRole.SYSTEM_ADMIN] }, 
          isActive: true 
        })
        .populate('employeeProfileId', 'firstName lastName workEmail employeeNumber')
        .lean()
        .exec();

      // Get all notifications
      const allNotifications = await this.notificationLogModel
        .find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('to', 'firstName lastName workEmail employeeNumber')
        .lean()
        .exec();

      // Get notifications for each SYSTEM_ADMIN
      const adminNotifications = await Promise.all(
        systemAdmins.map(async (admin: any) => {
          const adminId = admin.employeeProfileId?._id || admin.employeeProfileId;
          const notifications = await this.notificationLogModel
            .find({ to: adminId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .exec();
          return {
            admin: {
              id: adminId,
              name: admin.employeeProfileId?.firstName + ' ' + admin.employeeProfileId?.lastName,
              email: admin.employeeProfileId?.workEmail,
            },
            notificationCount: notifications.length,
            notifications: notifications.map((n: any) => ({
              id: n._id,
              type: n.type,
              message: n.message,
              createdAt: n.createdAt,
            })),
          };
        })
      );

      return {
        systemAdmins: systemAdmins.map((admin: any) => ({
          id: admin.employeeProfileId?._id || admin.employeeProfileId,
          name: admin.employeeProfileId?.firstName + ' ' + admin.employeeProfileId?.lastName,
          email: admin.employeeProfileId?.workEmail,
          employeeNumber: admin.employeeProfileId?.employeeNumber,
        })),
        totalNotifications: allNotifications.length,
        recentNotifications: allNotifications.slice(0, 10).map((n: any) => ({
          id: n._id,
          to: n.to?._id || n.to,
          toName: n.to?.firstName + ' ' + n.to?.lastName,
          type: n.type,
          message: n.message,
          createdAt: n.createdAt,
        })),
        adminNotifications,
      };
    }
  }
