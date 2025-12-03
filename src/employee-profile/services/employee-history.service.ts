import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployeeHistory, EmployeeHistoryDocument, ChangeType } from '../models/employee-history.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../models/employee-profile.schema';

@Injectable()
export class EmployeeHistoryService {
  constructor(
    @InjectModel(EmployeeHistory.name)
    private employeeHistoryModel: Model<EmployeeHistoryDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  /**
   * Log a change to employee history
   */
  async logChange(
    employeeProfileId: string,
    changeType: ChangeType,
    changedBy: string,
    fieldChanges?: Array<{ field: string; oldValue?: any; newValue?: any }>,
    description?: string,
    relatedEntityId?: string,
    relatedEntityType?: string,
    changeReason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<EmployeeHistoryDocument> {
    // Get current profile snapshot
    const profile = await this.employeeProfileModel.findById(employeeProfileId).lean().exec();
    if (!profile) {
      throw new NotFoundException(`Employee profile with ID '${employeeProfileId}' not found`);
    }

    const history = new this.employeeHistoryModel({
      employeeProfileId: new Types.ObjectId(employeeProfileId),
      changeType,
      description,
      fieldChanges: fieldChanges || [],
      profileSnapshot: profile,
      relatedEntityId: relatedEntityId ? new Types.ObjectId(relatedEntityId) : undefined,
      relatedEntityType,
      changedBy: new Types.ObjectId(changedBy),
      changeReason,
      ipAddress,
      userAgent,
    });

    return history.save();
  }

  /**
   * Get all history for an employee
   */
  async getEmployeeHistory(
    employeeProfileId: string,
    changeType?: ChangeType,
    limit: number = 100,
  ): Promise<EmployeeHistoryDocument[]> {
    const filter: any = { employeeProfileId: new Types.ObjectId(employeeProfileId) };
    if (changeType) {
      filter.changeType = changeType;
    }

    return this.employeeHistoryModel
      .find(filter)
      .populate('changedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get history by date range
   */
  async getHistoryByDateRange(
    employeeProfileId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<EmployeeHistoryDocument[]> {
    return this.employeeHistoryModel
      .find({
        employeeProfileId: new Types.ObjectId(employeeProfileId),
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('changedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get point-in-time snapshot
   */
  async getSnapshotAtDate(employeeProfileId: string, date: Date): Promise<any> {
    // Find the most recent history entry before or at the specified date
    const history = await this.employeeHistoryModel
      .findOne({
        employeeProfileId: new Types.ObjectId(employeeProfileId),
        createdAt: { $lte: date },
      })
      .sort({ createdAt: -1 })
      .exec();

    if (history && history.profileSnapshot) {
      return history.profileSnapshot;
    }

    // If no history found, return current profile
    const profile = await this.employeeProfileModel.findById(employeeProfileId).lean().exec();
    if (!profile) {
      throw new NotFoundException(`Employee profile with ID '${employeeProfileId}' not found`);
    }

    return profile;
  }

  /**
   * Compare two points in time
   */
  async compareSnapshots(employeeProfileId: string, date1: Date, date2: Date): Promise<any> {
    const snapshot1 = await this.getSnapshotAtDate(employeeProfileId, date1);
    const snapshot2 = await this.getSnapshotAtDate(employeeProfileId, date2);

    const differences: any = {};
    const allKeys = new Set([...Object.keys(snapshot1), ...Object.keys(snapshot2)]);

    for (const key of allKeys) {
      if (JSON.stringify(snapshot1[key]) !== JSON.stringify(snapshot2[key])) {
        differences[key] = {
          old: snapshot1[key],
          new: snapshot2[key],
        };
      }
    }

    return {
      date1,
      date2,
      snapshot1,
      snapshot2,
      differences,
    };
  }
}

