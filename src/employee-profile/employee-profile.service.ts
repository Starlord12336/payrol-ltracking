// src/employee-profile/employee-profile.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly profileModel: Model<EmployeeProfileDocument>,

    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,

    @InjectModel(EmployeeProfileChangeRequest.name)
    private readonly changeRequestModel: Model<EmployeeProfileChangeRequest>,

    @InjectModel(EmployeeSystemRole.name)
    private readonly roleModel: Model<EmployeeSystemRoleDocument>,
  ) {}

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
    const profiles = await this.profileModel.find({}).lean().exec();
    return profiles;
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

    for (const key of Object.keys(dto)) {
      const value = (dto as any)[key];
      if (value === undefined || value === null) continue;

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

    return updated;
  }
}
