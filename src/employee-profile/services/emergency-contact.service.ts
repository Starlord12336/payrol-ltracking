import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmergencyContact, EmergencyContactDocument } from '../models/emergency-contact.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../models/employee-profile.schema';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from '../dto';

@Injectable()
export class EmergencyContactService {
  constructor(
    @InjectModel(EmergencyContact.name)
    private emergencyContactModel: Model<EmergencyContactDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  async create(employeeProfileId: string, createDto: CreateEmergencyContactDto, userId: string): Promise<EmergencyContactDocument> {
    // Validate employee exists
    const employee = await this.employeeProfileModel.findById(employeeProfileId).exec();
    if (!employee) {
      throw new NotFoundException(`Employee profile with ID '${employeeProfileId}' not found`);
    }

    const contact = new this.emergencyContactModel({
      ...createDto,
      employeeProfileId: new Types.ObjectId(employeeProfileId),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return contact.save();
  }

  async findAll(employeeProfileId: string, activeOnly: boolean = false): Promise<EmergencyContactDocument[]> {
    const filter: any = { employeeProfileId: new Types.ObjectId(employeeProfileId) };
    if (activeOnly) {
      filter.isActive = true;
    }

    return this.emergencyContactModel
      .find(filter)
      .sort({ priority: 1, createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<EmergencyContactDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid emergency contact ID');
    }

    const contact = await this.emergencyContactModel.findById(id).exec();
    if (!contact) {
      throw new NotFoundException(`Emergency contact with ID '${id}' not found`);
    }

    return contact;
  }

  async update(id: string, updateDto: UpdateEmergencyContactDto, userId: string): Promise<EmergencyContactDocument> {
    const contact = await this.findOne(id);

    const updated = await this.emergencyContactModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDto,
          updatedBy: new Types.ObjectId(userId),
        },
        { new: true, runValidators: true },
      )
      .exec();

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.emergencyContactModel.findByIdAndDelete(id).exec();
  }

  async getPrimaryContact(employeeProfileId: string): Promise<EmergencyContactDocument | null> {
    return this.emergencyContactModel
      .findOne({
        employeeProfileId: new Types.ObjectId(employeeProfileId),
        priority: 'PRIMARY',
        isActive: true,
      })
      .exec();
  }
}

