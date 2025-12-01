import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployeeNote, EmployeeNoteDocument, NoteVisibility } from '../models/employee-note.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../models/employee-profile.schema';
import { CreateEmployeeNoteDto, UpdateEmployeeNoteDto } from '../dto';

@Injectable()
export class EmployeeNoteService {
  constructor(
    @InjectModel(EmployeeNote.name)
    private employeeNoteModel: Model<EmployeeNoteDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  async create(employeeProfileId: string, createDto: CreateEmployeeNoteDto, userId: string, userRoles: string[]): Promise<EmployeeNoteDocument> {
    // Validate employee exists
    const employee = await this.employeeProfileModel.findById(employeeProfileId).exec();
    if (!employee) {
      throw new NotFoundException(`Employee profile with ID '${employeeProfileId}' not found`);
    }

    const note = new this.employeeNoteModel({
      ...createDto,
      employeeProfileId: new Types.ObjectId(employeeProfileId),
      followUpDate: createDto.followUpDate ? new Date(createDto.followUpDate) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return note.save();
  }

  async findAll(
    employeeProfileId: string,
    userId: string,
    userRoles: string[],
    category?: string,
    requiresFollowUp?: boolean,
  ): Promise<EmployeeNoteDocument[]> {
    const filter: any = { employeeProfileId: new Types.ObjectId(employeeProfileId) };

    // Filter by visibility based on user role
    const isHr = userRoles.some(r => r.includes('HR') || r.includes('ADMIN'));
    const isManager = userRoles.some(r => r.includes('MANAGER'));

    if (!isHr && !isManager) {
      // Regular employees can only see PUBLIC notes
      filter.visibility = NoteVisibility.PUBLIC;
    } else if (isManager && !isHr) {
      // Managers can see MANAGER_ONLY, HR_AND_MANAGER, and PUBLIC
      filter.visibility = { $in: [NoteVisibility.MANAGER_ONLY, NoteVisibility.HR_AND_MANAGER, NoteVisibility.PUBLIC] };
    }
    // HR can see all notes

    if (category) {
      filter.category = category;
    }

    if (requiresFollowUp !== undefined) {
      filter.requiresFollowUp = requiresFollowUp;
    }

    return this.employeeNoteModel
      .find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('followedUpBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string, userRoles: string[]): Promise<EmployeeNoteDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid note ID');
    }

    const note = await this.employeeNoteModel
      .findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('followedUpBy', 'firstName lastName')
      .exec();

    if (!note) {
      throw new NotFoundException(`Note with ID '${id}' not found`);
    }

    // Check visibility
    const isHr = userRoles.some(r => r.includes('HR') || r.includes('ADMIN'));
    const isManager = userRoles.some(r => r.includes('MANAGER'));

    if (note.visibility === NoteVisibility.HR_ONLY && !isHr) {
      throw new ForbiddenException('You do not have permission to view this note');
    }
    if (note.visibility === NoteVisibility.MANAGER_ONLY && !isManager && !isHr) {
      throw new ForbiddenException('You do not have permission to view this note');
    }
    if (note.visibility === NoteVisibility.PUBLIC) {
      // Anyone can view
    }

    return note;
  }

  async update(id: string, updateDto: UpdateEmployeeNoteDto, userId: string, userRoles: string[]): Promise<EmployeeNoteDocument> {
    const note = await this.findOne(id, userId, userRoles);

    const updateData: any = { ...updateDto };
    if (updateDto.followUpDate) {
      updateData.followUpDate = new Date(updateDto.followUpDate);
    }
    if (updateDto.followedUpAt) {
      updateData.followedUpAt = new Date(updateDto.followedUpAt);
      updateData.followedUpBy = new Types.ObjectId(userId);
    }
    updateData.updatedBy = new Types.ObjectId(userId);

    const updated = await this.employeeNoteModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .populate('followedUpBy', 'firstName lastName')
      .exec();

    return updated;
  }

  async delete(id: string, userId: string, userRoles: string[]): Promise<void> {
    await this.findOne(id, userId, userRoles);
    await this.employeeNoteModel.findByIdAndDelete(id).exec();
  }

  async getPendingFollowUps(userId: string, userRoles: string[]): Promise<EmployeeNoteDocument[]> {
    const isHr = userRoles.some(r => r.includes('HR') || r.includes('ADMIN'));
    const isManager = userRoles.some(r => r.includes('MANAGER'));

    const filter: any = {
      requiresFollowUp: true,
      isFollowedUp: false,
      followUpDate: { $lte: new Date() },
    };

    // Filter by visibility
    if (!isHr && !isManager) {
      return [];
    } else if (isManager && !isHr) {
      filter.visibility = { $in: [NoteVisibility.MANAGER_ONLY, NoteVisibility.HR_AND_MANAGER, NoteVisibility.PUBLIC] };
    }

    return this.employeeNoteModel
      .find(filter)
      .populate('employeeProfileId', 'firstName lastName employeeNumber')
      .populate('createdBy', 'firstName lastName')
      .sort({ followUpDate: 1 })
      .exec();
  }
}

