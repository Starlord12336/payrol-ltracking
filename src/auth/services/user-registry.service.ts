import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserTypeRegistry } from '../interfaces/user-registry.interface';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../../employee-profile/models/employee-profile.schema';
import {
  Candidate,
  CandidateDocument,
} from '../../employee-profile/models/candidate.schema';
import {
  EmployeeStatus,
  CandidateStatus,
  SystemRole,
} from '../../employee-profile/enums/employee-profile.enums';

/**
 * Service to manage all user types that extend UserProfileBase
 * This allows any subsystem to register their user schema
 */
@Injectable()
export class UserRegistryService implements OnModuleInit {
  private userTypes: Map<string, UserTypeRegistry> = new Map();

  constructor(
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
  ) {}

  onModuleInit() {
    // Register EmployeeProfile
    this.registerUserType({
      type: 'employee',
      model: this.employeeProfileModel,
      collectionName: 'employee_profiles',
      canLogin: (user: EmployeeProfileDocument) => {
        return user.status === EmployeeStatus.ACTIVE;
      },
      getDefaultRoles: (user: EmployeeProfileDocument) => {
        // Roles are fetched from EmployeeSystemRole collection
        // This will be handled by the auth service
        return [SystemRole.DEPARTMENT_EMPLOYEE];
      },
      getUserIdentifier: (user: EmployeeProfileDocument) => user.employeeNumber,
    });

    // Register Candidate
    this.registerUserType({
      type: 'candidate',
      model: this.candidateModel,
      collectionName: 'candidates',
      canLogin: (user: CandidateDocument) => {
        return (
          user.status !== CandidateStatus.REJECTED &&
          user.status !== CandidateStatus.WITHDRAWN
        );
      },
      getDefaultRoles: () => {
        return [SystemRole.JOB_CANDIDATE];
      },
      getUserIdentifier: (user: CandidateDocument) => user.candidateNumber,
    });
  }

  /**
   * Register a new user type
   * This can be called by any subsystem to register their user schema
   */
  registerUserType(registry: UserTypeRegistry): void {
    if (this.userTypes.has(registry.type)) {
      throw new Error(`User type '${registry.type}' is already registered`);
    }
    this.userTypes.set(registry.type, registry);
  }

  /**
   * Get all registered user types
   */
  getAllUserTypes(): UserTypeRegistry[] {
    return Array.from(this.userTypes.values());
  }

  /**
   * Get a specific user type registry
   */
  getUserType(type: string): UserTypeRegistry | undefined {
    return this.userTypes.get(type);
  }

  /**
   * Get all models for querying across all user types
   */
  getAllModels(): Array<{
    model: Model<any>;
    type: string;
    registry: UserTypeRegistry;
  }> {
    return Array.from(this.userTypes.entries()).map(([type, registry]) => ({
      model: registry.model,
      type,
      registry,
    }));
  }
}
