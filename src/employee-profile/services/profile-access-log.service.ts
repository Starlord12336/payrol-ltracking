import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProfileAccessLog, ProfileAccessLogDocument, AccessAction } from '../models/profile-access-log.schema';

@Injectable()
export class ProfileAccessLogService {
  constructor(
    @InjectModel(ProfileAccessLog.name)
    private accessLogModel: Model<ProfileAccessLogDocument>,
  ) {}

  /**
   * Log profile access
   */
  async logAccess(
    employeeProfileId: string,
    accessedBy: string,
    action: AccessAction,
    isAuthorized: boolean = true,
    details?: string,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ProfileAccessLogDocument> {
    const log = new this.accessLogModel({
      employeeProfileId: new Types.ObjectId(employeeProfileId),
      accessedBy: new Types.ObjectId(accessedBy),
      action,
      isAuthorized,
      details,
      reason,
      ipAddress,
      userAgent,
    });

    return log.save();
  }

  /**
   * Get access logs for an employee profile
   */
  async getProfileAccessLogs(employeeProfileId: string, limit: number = 100): Promise<ProfileAccessLogDocument[]> {
    return this.accessLogModel
      .find({ employeeProfileId: new Types.ObjectId(employeeProfileId) })
      .populate('accessedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get access logs by user
   */
  async getUserAccessLogs(accessedBy: string, limit: number = 100): Promise<ProfileAccessLogDocument[]> {
    return this.accessLogModel
      .find({ accessedBy: new Types.ObjectId(accessedBy) })
      .populate('employeeProfileId', 'firstName lastName employeeNumber')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get unauthorized access attempts
   */
  async getUnauthorizedAccess(limit: number = 100): Promise<ProfileAccessLogDocument[]> {
    return this.accessLogModel
      .find({ isAuthorized: false })
      .populate('accessedBy', 'firstName lastName email')
      .populate('employeeProfileId', 'firstName lastName employeeNumber')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get access statistics
   */
  async getAccessStatistics(employeeProfileId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    const filter: any = {};
    if (employeeProfileId) {
      filter.employeeProfileId = new Types.ObjectId(employeeProfileId);
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const logs = await this.accessLogModel.find(filter).exec();

    const stats = {
      totalAccesses: logs.length,
      authorized: logs.filter(l => l.isAuthorized).length,
      unauthorized: logs.filter(l => !l.isAuthorized).length,
      byAction: {
        VIEW: logs.filter(l => l.action === AccessAction.VIEW).length,
        UPDATE: logs.filter(l => l.action === AccessAction.UPDATE).length,
        DELETE: logs.filter(l => l.action === AccessAction.DELETE).length,
        EXPORT: logs.filter(l => l.action === AccessAction.EXPORT).length,
      },
      uniqueUsers: new Set(logs.map(l => l.accessedBy.toString())).size,
    };

    return stats;
  }
}

