import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Dependent, DependentDocument } from '../models/dependent.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../models/employee-profile.schema';
import { CreateDependentDto, UpdateDependentDto } from '../dto';

@Injectable()
export class DependentService {
  constructor(
    @InjectModel(Dependent.name)
    private dependentModel: Model<DependentDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  async create(employeeProfileId: string, createDto: CreateDependentDto, userId: string): Promise<DependentDocument> {
    // Validate employee exists
    const employee = await this.employeeProfileModel.findById(employeeProfileId).exec();
    if (!employee) {
      throw new NotFoundException(`Employee profile with ID '${employeeProfileId}' not found`);
    }

    const dependent = new this.dependentModel({
      ...createDto,
      employeeProfileId: new Types.ObjectId(employeeProfileId),
      dateOfBirth: new Date(createDto.dateOfBirth),
      insuranceStartDate: createDto.insuranceStartDate ? new Date(createDto.insuranceStartDate) : undefined,
      insuranceEndDate: createDto.insuranceEndDate ? new Date(createDto.insuranceEndDate) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return dependent.save();
  }

  async findAll(employeeProfileId: string, activeOnly: boolean = false): Promise<DependentDocument[]> {
    const filter: any = { employeeProfileId: new Types.ObjectId(employeeProfileId) };
    if (activeOnly) {
      filter.isActive = true;
    }

    return this.dependentModel
      .find(filter)
      .sort({ dateOfBirth: 1 })
      .exec();
  }

  async findOne(id: string): Promise<DependentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid dependent ID');
    }

    const dependent = await this.dependentModel.findById(id).exec();
    if (!dependent) {
      throw new NotFoundException(`Dependent with ID '${id}' not found`);
    }

    return dependent;
  }

  async update(id: string, updateDto: UpdateDependentDto, userId: string): Promise<DependentDocument> {
    const dependent = await this.findOne(id);

    const updateData: any = { ...updateDto };
    if (updateDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateDto.dateOfBirth);
    }
    if (updateDto.insuranceStartDate) {
      updateData.insuranceStartDate = new Date(updateDto.insuranceStartDate);
    }
    if (updateDto.insuranceEndDate) {
      updateData.insuranceEndDate = new Date(updateDto.insuranceEndDate);
    }
    updateData.updatedBy = new Types.ObjectId(userId);

    const updated = await this.dependentModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.dependentModel.findByIdAndDelete(id).exec();
  }

  async getInsuranceCoverage(employeeProfileId: string): Promise<any> {
    const dependents = await this.findAll(employeeProfileId, true);
    
    const coverage = {
      totalDependents: dependents.length,
      covered: dependents.filter(d => d.insuranceStatus === 'COVERED').length,
      notCovered: dependents.filter(d => d.insuranceStatus === 'NOT_COVERED').length,
      pending: dependents.filter(d => d.insuranceStatus === 'PENDING').length,
      expired: dependents.filter(d => d.insuranceStatus === 'EXPIRED').length,
      dependents: dependents.map(d => ({
        id: d._id,
        fullName: d.fullName,
        relationship: d.relationship,
        insuranceStatus: d.insuranceStatus,
        insuranceProvider: d.insuranceProvider,
        insuranceStartDate: d.insuranceStartDate,
        insuranceEndDate: d.insuranceEndDate,
      })),
    };

    return coverage;
  }
}

