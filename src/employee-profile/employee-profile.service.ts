// src/employee-profile/employee-profile.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from './models/employee-profile.schema';
import { Candidate, CandidateDocument } from './models/candidate.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleDocument,
} from './models/employee-system-role.schema';

import {
  EmployeeStatus,
  SystemRole,
  ProfileChangeStatus,
} from './enums/employee-profile.enums';

import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';
import { SubmitChangeRequestDto } from './dto/submit-change-request.dto';
import { ReviewChangeRequestDto } from './dto/review-change-request.dto';
import { SearchEmployeeProfilesDto } from './dto/search-employee-profiles.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UpdateEmployeeProfileAsHrDto } from './dto/update-employee-profile-as-hr.dto';
import { OrganizationStructureService } from '../organization-structure/organization-structure.service';

@Injectable()
export class EmployeeProfileService {
  private profilePictureBucket: GridFSBucket;
  private meetingsBucket: GridFSBucket;
  private readonly MEETINGS_FILENAME = 'one-on-one-meetings.json';

  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly profileModel: Model<EmployeeProfileDocument>,

    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,

    @InjectModel(EmployeeProfileChangeRequest.name)
    private readonly changeRequestModel: Model<EmployeeProfileChangeRequest>,

    @InjectModel(EmployeeSystemRole.name)
    private readonly roleModel: Model<EmployeeSystemRoleDocument>,

    @InjectConnection() private connection: Connection,

    private readonly orgStructureService: OrganizationStructureService,
  ) {
    // Initialize GridFS bucket for profile pictures
    // This creates collections: profile_pictures.files and profile_pictures.chunks
    this.profilePictureBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'profile_pictures',
    });
    // Initialize GridFS bucket for meetings (to check if employee has meeting with manager)
    this.meetingsBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'one_on_one_meetings',
    });
  }

  // =====================================
  // ROLE / PERMISSION HELPERS
  // =====================================
  // Note: Role-based authorization is handled by @Roles() decorators in the controller.
  // These methods are kept for backward compatibility but are no longer needed
  // since the JWT-based RolesGuard already validates UserRole from the token.

  // Public helper for controller (kept for backward compatibility)
  // The actual authorization is handled by @Roles() decorators in the controller
  async ensureHrAccess(requestingProfileId: string) {
    // Authorization is already handled by RolesGuard in the controller
    // This method is kept for backward compatibility but does nothing
    if (!Types.ObjectId.isValid(requestingProfileId)) {
      throw new ForbiddenException('Invalid employee profile ID');
    }
  }

  /**
   * Verify that an employee is viewing their manager's profile
   * Used for allowing employees to view their manager's info (e.g., for meetings)
   * Allows viewing:
   * 1. Direct supervisor (supervisorPositionId matches manager's primaryPositionId)
   * 2. Department head (manager's primaryPositionId matches department's headPositionId)
   * 3. Manager who has scheduled a meeting with the employee
   */
  async verifyManagerAccess(employeeId: string, managerProfileId: string): Promise<void> {
    if (!Types.ObjectId.isValid(employeeId) || !Types.ObjectId.isValid(managerProfileId)) {
      throw new ForbiddenException('Invalid employee or manager profile ID');
    }

    // Get the employee's profile
    const employee = await this.profileModel.findById(employeeId).lean().exec();
    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    // Get the manager's profile
    const manager = await this.profileModel.findById(managerProfileId).lean().exec();
    if (!manager) {
      throw new NotFoundException('Manager profile not found');
    }

    if (!manager.primaryPositionId) {
      throw new ForbiddenException(
        'You can only view your manager\'s profile. This profile does not have a position assigned.',
      );
    }

    // Check 1: Is this the direct supervisor?
    if (employee.supervisorPositionId) {
      if (
        employee.supervisorPositionId.toString() === manager.primaryPositionId.toString()
      ) {
        return; // Allowed - this is the direct supervisor
      }
    }

    // Check 2: Is this the department head?
    if (employee.primaryDepartmentId) {
      try {
        const department = await this.orgStructureService.findDepartmentById(
          employee.primaryDepartmentId.toString(),
        );
        if (department?.headPositionId) {
          if (
            department.headPositionId.toString() === manager.primaryPositionId.toString()
          ) {
            return; // Allowed - this is the department head
          }
        }
      } catch (error) {
        // Department not found, continue to next check
      }
    }

    // Check 3: Does this manager have a meeting scheduled with the employee?
    // Check directly via GridFS to avoid circular dependency
    try {
      const files = await this.meetingsBucket
        .find({ filename: this.MEETINGS_FILENAME })
        .sort({ uploadDate: -1 })
        .limit(1)
        .toArray();

      if (files.length > 0) {
        const file = files[0];
        const downloadStream = this.meetingsBucket.openDownloadStream(file._id);
        
        const chunks: Buffer[] = [];
        for await (const chunk of downloadStream) {
          chunks.push(chunk);
        }
        
        const data = Buffer.concat(chunks).toString('utf-8');
        const meetings = JSON.parse(data);
        
        const hasMeetingWithManager = meetings.some((m: any) => {
          const meetingEmployeeId = m.employeeId?.toString() || m.employeeId;
          const meetingManagerId = m.managerId?.toString() || m.managerId;
          const requestedEmployeeId = employeeId.toString();
          const requestedManagerId = managerProfileId.toString();
          return meetingEmployeeId === requestedEmployeeId && meetingManagerId === requestedManagerId;
        });
        
        if (hasMeetingWithManager) {
          return; // Allowed - manager has scheduled a meeting with employee
        }
      }
    } catch (error) {
      // If we can't check meetings, continue (don't fail)
      // This is not critical - other checks will handle authorization
    }

    // If none of the checks passed, deny access
    throw new ForbiddenException(
      'You can only view your direct manager\'s, department head\'s, or meeting manager\'s profile. This profile does not match your manager.',
    );
  }

  // =====================================
  // PROFILE VIEWING
  // =====================================

  /**
   * Get own profile - supports both employees and candidates
   */
  async getMyProfile(userId: string, userType: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    if (userType === 'candidate') {
      const profile = await this.candidateModel
        .findById(userId)
        .lean()
        .exec();

      if (!profile) {
        throw new NotFoundException('Candidate profile not found');
      }

      return profile;
    } else {
      // Default to employee
      const profile = await this.profileModel
        .findById(userId)
        .lean()
        .exec();

      if (!profile) {
        throw new NotFoundException('Employee profile not found');
      }

      return profile;
    }
  }

  async getOwnProfile(employeeProfileId: string) {
    if (!Types.ObjectId.isValid(employeeProfileId)) {
      throw new NotFoundException('Invalid employee profile ID');
    }

    const profile = await this.profileModel
      .findById(employeeProfileId)
      .lean()
      .exec();

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    return profile;
  }

  async getProfileById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid employee profile ID');
    }

    const profile = await this.profileModel.findById(id).lean().exec();
    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }
    return profile;
  }

  async getAllProfiles(requestingProfileId: string) {
    // Role authorization is handled by @Roles() decorator in the controller
    const profiles = await this.profileModel
      .find({})
      .populate('primaryDepartmentId', 'name code')
      .populate('primaryPositionId', 'title code')
      .lean()
      .exec();
    
    // Fetch roles for all employees
    const employeeIds = profiles.map((p: any) => new Types.ObjectId(p._id));
    const systemRoles = await this.roleModel
      .find({ employeeProfileId: { $in: employeeIds }, isActive: true })
      .lean()
      .exec();
    
    // Map roles to employees
    const rolesMap = new Map();
    systemRoles.forEach((sr: any) => {
      // Handle both ObjectId and string formats
      let empId: string;
      if (sr.employeeProfileId) {
        if (typeof sr.employeeProfileId === 'object' && sr.employeeProfileId._id) {
          empId = sr.employeeProfileId._id.toString();
        } else if (typeof sr.employeeProfileId === 'object') {
          empId = sr.employeeProfileId.toString();
        } else {
          empId = sr.employeeProfileId.toString();
        }
        if (empId) {
          rolesMap.set(empId, sr.roles || []);
        }
      }
    });
    
    // Attach roles to profiles and ensure proper formatting
    const profilesWithRoles = profiles.map((profile: any) => {
      const profileId = profile._id?.toString() || profile._id;
      const roles = rolesMap.get(profileId) || [];
      
      // Ensure primaryDepartmentId and primaryPositionId are properly formatted
      // When populated with .lean(), they should be objects, but if null they stay null
      return {
        ...profile,
        roles,
        // Keep the populated fields as-is (they should be objects if populated, null if not)
        primaryDepartmentId: profile.primaryDepartmentId || null,
        primaryPositionId: profile.primaryPositionId || null,
      };
    });
    
    return profilesWithRoles;
  }

  async getTeamProfiles(managerProfileId: string) {
    if (!Types.ObjectId.isValid(managerProfileId)) {
      throw new NotFoundException('Invalid manager profile ID');
    }

    // ⚠️ Auth disabled here on purpose for the project
    // await this.ensureHasRole(managerProfileId, this.MANAGER_ROLES);

    const manager = await this.profileModel
      .findById(managerProfileId)
      .lean()
      .exec();

    if (!manager) {
      throw new NotFoundException('Manager profile not found');
    }

    if (!manager.primaryPositionId) {
      return [];
    }

    const team = await this.profileModel
      .find({
        supervisorPositionId: manager.primaryPositionId,
        status: EmployeeStatus.ACTIVE,
      })
      .select(
        'firstName lastName fullName personalEmail mobilePhone primaryDepartmentId primaryPositionId status',
      )
      .lean()
      .exec();

    return team;
  } // =====================================
  // SEARCH & FILTER (NO AUTH FOR PROJECT)
  // =====================================
  async searchProfiles(dto: SearchEmployeeProfilesDto) {
    const andConditions: any[] = [];
    const orConditions: any[] = [];

    // --- Name ---
    if (dto.fullName) {
      const nameRegex = { $regex: dto.fullName, $options: 'i' };
      orConditions.push(
        { fullName: nameRegex },
        { 'personalInfo.fullName': nameRegex },
      );
    }

    // --- National ID ---
    if (dto.nationalId) {
      orConditions.push(
        { nationalId: dto.nationalId },
        { 'personalInfo.nationalId': dto.nationalId },
      );
    }

    // --- Status / contract / work type ---
    if (dto.status) andConditions.push({ status: dto.status });
    if (dto.contractType)
      andConditions.push({ contractType: dto.contractType });
    if (dto.workType) andConditions.push({ workType: dto.workType });

    // --- Department filter ---
    if (dto.departmentId) {
      andConditions.push({
        primaryDepartmentId: new Types.ObjectId(dto.departmentId),
      });
    }

    // --- Position filter ---
    if (dto.positionId) {
      andConditions.push({
        primaryPositionId: new Types.ObjectId(dto.positionId),
      });
    }

    // --- Pay Grade filter ---
    if (dto.payGradeId) {
      andConditions.push({ payGradeId: new Types.ObjectId(dto.payGradeId) });
    }

    // --- Email filters ---
    if (dto.personalEmail) {
      orConditions.push({
        personalEmail: { $regex: dto.personalEmail, $options: 'i' },
      });
    }
    if (dto.workEmail) {
      orConditions.push({
        workEmail: { $regex: dto.workEmail, $options: 'i' },
      });
    }

    // --- Phone filters ---
    if (dto.mobilePhone) {
      orConditions.push({
        mobilePhone: { $regex: dto.mobilePhone, $options: 'i' },
      });
    }
    if (dto.homePhone) {
      orConditions.push({
        homePhone: { $regex: dto.homePhone, $options: 'i' },
      });
    }

    // --- Filter building ---
    const filter: any = {};
    if (andConditions.length > 0) filter.$and = andConditions;
    if (orConditions.length > 0) filter.$or = orConditions;

    return await this.profileModel.find(filter).lean().exec();
  }

  // =====================================
  // SELF-SERVICE: CONTACT INFO
  // =====================================

  async updateOwnContactInfo(
    userId: string,
    dto: UpdateContactInfoDto,
    userType: string = 'employee',
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    const update: Record<string, any> = {};

    if (dto.personalEmail !== undefined) {
      update.personalEmail = dto.personalEmail;
    }
    if (dto.mobilePhone !== undefined) {
      update.mobilePhone = dto.mobilePhone;
    }
    if (dto.homePhone !== undefined) {
      update.homePhone = dto.homePhone;
    }
    if (dto.workEmail !== undefined) {
      update.workEmail = dto.workEmail;
    }

    if (userType === 'candidate') {
      if (Object.keys(update).length === 0) {
        const existing = await this.candidateModel.findById(userId).lean().exec();
        if (!existing) {
          throw new NotFoundException('Candidate profile not found');
        }
        return existing;
      }

      const updated = await this.candidateModel
        .findByIdAndUpdate(userId, { $set: update }, { new: true })
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Candidate profile not found');
      }

      return updated;
    } else {
      if (Object.keys(update).length === 0) {
        const existing = await this.profileModel.findById(userId).lean().exec();
        if (!existing) {
          throw new NotFoundException('Employee profile not found');
        }
        return existing;
      }

      const updated = await this.profileModel
        .findByIdAndUpdate(userId, { $set: update }, { new: true })
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Employee profile not found');
      }

      return updated;
    }
  }

  // =====================================
  // SELF-SERVICE: ADDRESS
  // =====================================

  async updateOwnAddress(
    userId: string,
    dto: UpdateAddressDto,
    userType: string = 'employee',
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    const update: any = {};

    if (dto.city !== undefined) {
      update['address.city'] = dto.city;
    }
    if (dto.streetAddress !== undefined) {
      update['address.streetAddress'] = dto.streetAddress;
    }
    if (dto.country !== undefined) {
      update['address.country'] = dto.country;
    }

    if (userType === 'candidate') {
      if (Object.keys(update).length === 0) {
        const existing = await this.candidateModel.findById(userId).lean().exec();
        if (!existing) {
          throw new NotFoundException('Candidate profile not found');
        }
        return existing;
      }

      const updated = await this.candidateModel
        .findByIdAndUpdate(userId, { $set: update }, { new: true })
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Candidate profile not found');
      }

      return updated;
    } else {
      if (Object.keys(update).length === 0) {
        const existing = await this.profileModel.findById(userId).lean().exec();
        if (!existing) {
          throw new NotFoundException('Employee profile not found');
        }
        return existing;
      }

      const updated = await this.profileModel
        .findByIdAndUpdate(userId, { $set: update }, { new: true })
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Employee profile not found');
      }

      return updated;
    }
  }

  // =====================================
  // SELF-SERVICE: PROFILE PICTURE
  // =====================================

  async updateOwnProfilePicture(
    userId: string,
    dto: UpdateProfilePictureDto,
    userType: string = 'employee',
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    if (userType === 'candidate') {
      const updated = await this.candidateModel
        .findByIdAndUpdate(
          userId,
          { $set: { profilePictureUrl: dto.profilePictureUrl } },
          { new: true },
        )
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Candidate profile not found');
      }

      return updated;
    } else {
      const updated = await this.profileModel
        .findByIdAndUpdate(
          userId,
          { $set: { profilePictureUrl: dto.profilePictureUrl } },
          { new: true },
        )
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Employee profile not found');
      }

      return updated;
    }
  }

  // =====================================
  // PROFILE PICTURE GRIDFS UPLOAD/DOWNLOAD
  // =====================================

  /**
   * Upload profile picture to GridFS
   * Stores GridFS file ID in profilePictureUrl field (as string)
   */
  async uploadProfilePicture(
    userId: string,
    file: any, // Express.Multer.File - file buffer from memory storage
    userType: string = 'employee',
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    // Validate user exists
    let user;
    if (userType === 'candidate') {
      user = await this.candidateModel.findById(userId).lean().exec();
      if (!user) throw new NotFoundException('Candidate not found');
    } else {
      user = await this.profileModel.findById(userId).lean().exec();
      if (!user) throw new NotFoundException('Employee profile not found');
    }

    // Upload file to GridFS
    const filename = `${userId}-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    // Create upload stream
    const uploadStream = this.profilePictureBucket.openUploadStream(filename, {
      metadata: {
        userId,
        userType,
        originalName: file.originalname,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      },
    });

    // Convert buffer to readable stream
    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null); // End the stream

    const { fileId } = await new Promise<{ fileId: string; filename: string }>(
      (resolve, reject) => {
        readableStream
          .pipe(uploadStream)
          .on('finish', () => {
            resolve({
              fileId: uploadStream.id.toString(),
              filename,
            });
          })
          .on('error', (error) => {
            reject(error);
          });
      },
    );

    // Store GridFS file ID in profilePictureUrl field (no schema change needed)
    if (userType === 'candidate') {
      await this.candidateModel.findByIdAndUpdate(
        userId,
        { $set: { profilePictureUrl: fileId } },
        { new: true },
      );
    } else {
      await this.profileModel.findByIdAndUpdate(
        userId,
        { $set: { profilePictureUrl: fileId } },
        { new: true },
      );
    }

    return {
      fileId,
      filename,
      message: 'Profile picture uploaded successfully',
    };
  }

  /**
   * Get profile picture file stream from GridFS
   * @param userId - The user ID (employee or candidate)
   * @param userType - 'employee' or 'candidate'
   * @returns File stream and metadata
   */
  async getProfilePictureFile(userId: string, userType: string = 'employee') {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    // Get user profile to find profilePictureUrl
    let user;
    if (userType === 'candidate') {
      user = await this.candidateModel.findById(userId).lean().exec();
      if (!user) throw new NotFoundException('Candidate not found');
    } else {
      user = await this.profileModel.findById(userId).lean().exec();
      if (!user) throw new NotFoundException('Employee profile not found');
    }

    const profilePictureUrl = (user as any).profilePictureUrl;
    if (!profilePictureUrl) {
      throw new NotFoundException('Profile picture not found');
    }

    // Check if profilePictureUrl is a GridFS file ID (24 hex characters = ObjectId)
    if (!this.isGridFSFile(profilePictureUrl)) {
      // If it's not a GridFS ID, it might be a URL - return null to indicate external URL
      throw new NotFoundException('Profile picture is stored externally (URL), not in GridFS');
    }

    const fileMetadata = await this.getGridFSFileMetadata(profilePictureUrl);
    if (!fileMetadata) throw new NotFoundException('Profile picture file not found in GridFS');

    const fileStream = this.downloadProfilePictureFromGridFS(profilePictureUrl);

    return {
      stream: fileStream,
      metadata: fileMetadata,
    };
  }

  /**
   * Download a profile picture file from GridFS
   * @param fileId - The GridFS file ID (as string from profilePictureUrl)
   * @returns Readable stream of the file
   */
  private downloadProfilePictureFromGridFS(fileId: string): Readable {
    const objectId = new Types.ObjectId(fileId);
    return this.profilePictureBucket.openDownloadStream(objectId);
  }

  /**
   * Get file metadata from GridFS
   * @param fileId - The GridFS file ID (as string)
   * @returns File metadata
   */
  private async getGridFSFileMetadata(fileId: string): Promise<any | null> {
    const objectId = new Types.ObjectId(fileId);
    const files = await this.profilePictureBucket.find({ _id: objectId }).toArray();
    return files.length > 0 ? files[0] : null;
  }

  /**
   * Check if profilePictureUrl is a GridFS ID (ObjectId format)
   */
  private isGridFSFile(profilePictureUrl: string): boolean {
    // GridFS file IDs are MongoDB ObjectIds (24 hex characters)
    return /^[0-9a-fA-F]{24}$/.test(profilePictureUrl);
  }

  // =====================================
  // SELF-SERVICE: COMBINED PROFILE UPDATE
  // =====================================

  async updateMyProfile(
    userId: string,
    dto: UpdateMyProfileDto,
    userType: string = 'employee',
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    const update: Record<string, any> = {};

    // Contact info
    if (dto.personalEmail !== undefined) {
      update.personalEmail = dto.personalEmail;
    }
    if (dto.mobilePhone !== undefined) {
      update.mobilePhone = dto.mobilePhone;
    }
    if (dto.homePhone !== undefined) {
      update.homePhone = dto.homePhone;
    }
    if (dto.workEmail !== undefined) {
      update.workEmail = dto.workEmail;
    }

    // Address
    if (dto.city !== undefined) {
      update['address.city'] = dto.city;
    }
    if (dto.streetAddress !== undefined) {
      update['address.streetAddress'] = dto.streetAddress;
    }
    if (dto.country !== undefined) {
      update['address.country'] = dto.country;
    }

    // Profile picture
    if (dto.profilePictureUrl !== undefined) {
      update.profilePictureUrl = dto.profilePictureUrl;
    }

    // Biography (US-E2-12)
    if (dto.biography !== undefined) {
      update.biography = dto.biography;
    }

    // Use appropriate model based on userType
    if (userType === 'candidate') {
      if (Object.keys(update).length === 0) {
        const existing = await this.candidateModel.findById(userId).lean().exec();
        if (!existing) {
          throw new NotFoundException('Candidate profile not found');
        }
        return existing;
      }

      const updated = await this.candidateModel
        .findByIdAndUpdate(userId, { $set: update }, { new: true })
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Candidate profile not found');
      }

      return updated;
    } else {
      if (Object.keys(update).length === 0) {
        const existing = await this.profileModel.findById(userId).lean().exec();
        if (!existing) {
          throw new NotFoundException('Employee profile not found');
        }
        return existing;
      }

      const updated = await this.profileModel
        .findByIdAndUpdate(userId, { $set: update }, { new: true })
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Employee profile not found');
      }

      return updated;
    }
  }

  // =====================================
  // CHANGE REQUESTS
  // =====================================

  async submitChangeRequest(
    employeeProfileId: string,
    dto: SubmitChangeRequestDto,
  ) {
    if (!Types.ObjectId.isValid(employeeProfileId)) {
      throw new NotFoundException('Invalid employee profile ID');
    }

    const profile = await this.profileModel
      .findById(employeeProfileId)
      .lean()
      .exec();

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    const now = new Date();
    const requestId = `EPR-${now.getFullYear()}-${Date.now()}`;

    const doc = await this.changeRequestModel.create({
      requestId,
      employeeProfileId: new Types.ObjectId(employeeProfileId),
      requestDescription: dto.requestDescription,
      reason: dto.reason,
      status: ProfileChangeStatus.PENDING,
      submittedAt: now,
    });

    return {
      id: String(doc._id),
      requestId: doc.requestId,
      status: doc.status,
      submittedAt: doc.submittedAt,
    };
  }

  async getMyChangeRequests(employeeProfileId: string) {
    if (!Types.ObjectId.isValid(employeeProfileId)) {
      throw new NotFoundException('Invalid employee profile ID');
    }

    const requests = await this.changeRequestModel
      .find({ employeeProfileId: new Types.ObjectId(employeeProfileId) })
      .sort({ submittedAt: -1 })
      .lean()
      .exec();

    return requests;
  }

  async getPendingChangeRequests(requestingProfileId: string) {
    // Role authorization is handled by @Roles() decorator in the controller
    const requests = await this.changeRequestModel
      .find({ status: ProfileChangeStatus.PENDING })
      .sort({ submittedAt: -1 })
      .lean()
      .exec();

    return requests;
  }

  async reviewChangeRequest(
    requestingProfileId: string,
    requestId: string,
    dto: ReviewChangeRequestDto,
  ) {
    // Role authorization is handled by @Roles() decorator in the controller

    if (!Types.ObjectId.isValid(requestId)) {
      throw new NotFoundException('Invalid change request ID');
    }

    const request = await this.changeRequestModel.findById(requestId).exec();
    if (!request) {
      throw new NotFoundException('Change request not found');
    }

    if (request.status !== ProfileChangeStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING requests can be reviewed (approved/rejected)',
      );
    }

    // Only allow APPROVED / REJECTED when reviewing
    if (
      dto.status !== ProfileChangeStatus.APPROVED &&
      dto.status !== ProfileChangeStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Status must be APPROVED or REJECTED when reviewing a request',
      );
    }

    request.status = dto.status;
    request.processedAt = new Date();
    if (dto.reason) {
      request.reason = dto.reason;
    }

    await request.save();

    return {
      requestId: request.requestId,
      status: request.status,
      processedAt: request.processedAt,
    };
  }
  // src/employee-profile/employee-profile.service.ts

  async updateEmployeeProfileAsHr(
    profileId: string,
    dto: UpdateEmployeeProfileAsHrDto,
  ) {
    if (!Types.ObjectId.isValid(profileId)) {
      throw new NotFoundException('Invalid employee profile ID');
    }

    const update: Record<string, any> = {};

    const dateFields = [
      'dateOfBirth',
      'dateOfHire',
      'contractStartDate',
      'contractEndDate',
      'statusEffectiveFrom',
      'lastAppraisalDate',
    ];

    const objectIdFields = [
      'primaryPositionId',
      'primaryDepartmentId',
      'supervisorPositionId',
      'payGradeId',
      'lastAppraisalRecordId',
      'lastAppraisalCycleId',
      'lastAppraisalTemplateId',
    ];

    // Handle name synchronization
    // Priority: If individual name components are provided, use them to compute fullName
    // If only fullName is provided, parse it into components
    const hasIndividualNames =
      dto.firstName !== undefined ||
      dto.middleName !== undefined ||
      dto.lastName !== undefined;
    const hasFullName = dto.fullName !== undefined;

    if (hasIndividualNames) {
      // Get current profile to use existing values for components not being updated
      const currentProfile = await this.profileModel.findById(profileId).lean().exec();
      if (!currentProfile) {
        throw new NotFoundException('Employee profile not found');
      }

      // Use provided values or existing values
      const firstName = dto.firstName ?? (currentProfile as any).firstName ?? '';
      const middleName = dto.middleName ?? (currentProfile as any).middleName;
      const lastName = dto.lastName ?? (currentProfile as any).lastName ?? '';

      // Compute fullName from components
      const computedFullName = middleName
        ? `${firstName} ${middleName} ${lastName}`.trim()
        : `${firstName} ${lastName}`.trim();

      // Update individual components if provided
      if (dto.firstName !== undefined) update.firstName = firstName;
      if (dto.middleName !== undefined) update.middleName = middleName;
      if (dto.lastName !== undefined) update.lastName = lastName;
      
      // Always update fullName when individual components are updated
      update.fullName = computedFullName;
    } else if (hasFullName && !hasIndividualNames) {
      // Parse fullName into components (simple parsing: split by spaces)
      const nameParts = dto.fullName.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        update.firstName = nameParts[0];
        update.lastName = nameParts[nameParts.length - 1];
        update.middleName =
          nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined;
        update.fullName = dto.fullName.trim();
      } else {
        // If only one word, treat as firstName
        update.firstName = dto.fullName.trim();
        update.lastName = '';
        update.fullName = dto.fullName.trim();
      }
    }

    for (const key of Object.keys(dto)) {
      const value = (dto as any)[key];
      if (value === undefined || value === null) continue;

      // Skip name fields as they're handled above
      if (['firstName', 'middleName', 'lastName', 'fullName'].includes(key)) {
        continue;
      }

      if (dateFields.includes(key)) {
        update[key] = new Date(value as string);
      } else if (objectIdFields.includes(key)) {
        update[key] = new Types.ObjectId(value as string);
      } else if (
        key === 'city' ||
        key === 'streetAddress' ||
        key === 'country'
      ) {
        // nested address
        const map: Record<string, string> = {
          city: 'address.city',
          streetAddress: 'address.streetAddress',
          country: 'address.country',
        };
        update[map[key]] = value;
      } else {
        update[key] = value;
      }
    }

    const updated = await this.profileModel
      .findByIdAndUpdate(profileId, { $set: update }, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Employee profile not found');
    }

    // Sync roles if position or department was updated
    if (dto.primaryPositionId !== undefined || dto.primaryDepartmentId !== undefined) {
      // Run role sync asynchronously to avoid blocking the response
      this.orgStructureService.syncEmployeeRoles(profileId).catch((error) => {
        console.error('Error syncing employee roles after profile update:', error);
      });
    }

    return updated;
  }
}
