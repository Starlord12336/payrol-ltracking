import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserType } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Types } from 'mongoose';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import {
  EmployeeStatus,
  CandidateStatus,
} from '../employee-profile/enums/employee-profile.enums';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { Candidate } from '../employee-profile/models/candidate.schema';
import { UserRegistryService } from './services/user-registry.service';
import { EmployeeSystemRole } from '../employee-profile/models/employee-system-role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRegistryService: UserRegistryService,
    @InjectModel(EmployeeSystemRole.name)
    private employeeSystemRoleModel: Model<any>,
  ) {}

  /**
   * Register a new user (works with ANY registered user type)
   * This method is generic and works with any registered user type
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; userType: UserType }> {
    // Check if email already exists (checks ALL registered user types)
    const existingUserByEmail = await this.findUserByEmail(registerDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if national ID already exists (checks ALL registered user types)
    const existingUserByNationalId = await this.findUserByNationalId(
      registerDto.nationalId,
    );
    if (existingUserByNationalId) {
      throw new ConflictException('National ID already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Determine user type (default to candidate for public registration)
    const userType: UserType = registerDto.userType || 'candidate';

    // Get registry for this user type
    const registry = this.userRegistryService.getUserType(userType);
    if (!registry) {
      throw new BadRequestException(
        `User type '${userType}' is not registered`,
      );
    }

    // Generate full name
    const fullName = registerDto.middleName
      ? `${registerDto.firstName} ${registerDto.middleName} ${registerDto.lastName}`
      : `${registerDto.firstName} ${registerDto.lastName}`;

    // Build base user data (common to all UserProfileBase)
    const baseUserData: any = {
      firstName: registerDto.firstName,
      middleName: registerDto.middleName,
      lastName: registerDto.lastName,
      fullName,
      nationalId: registerDto.nationalId,
      password: hashedPassword,
      personalEmail: registerDto.email,
      gender: registerDto.gender,
      maritalStatus: registerDto.maritalStatus,
      dateOfBirth: registerDto.dateOfBirth
        ? new Date(registerDto.dateOfBirth)
        : undefined,
      mobilePhone: registerDto.mobilePhone,
    };

    // Add type-specific fields based on user type
    if (userType === 'employee') {
      const employeeNumber =
        registerDto.employeeNumber || (await this.generateEmployeeNumber());
      baseUserData.workEmail = registerDto.workEmail || registerDto.email;
      baseUserData.employeeNumber = employeeNumber;
      baseUserData.dateOfHire = registerDto.dateOfHire
        ? new Date(registerDto.dateOfHire)
        : new Date();
      baseUserData.status = registerDto.status || EmployeeStatus.ACTIVE;
    } else if (userType === 'candidate') {
      const candidateNumber =
        registerDto.candidateNumber || (await this.generateCandidateNumber());
      baseUserData.candidateNumber = candidateNumber;
      baseUserData.applicationDate = registerDto.applicationDate
        ? new Date(registerDto.applicationDate)
        : new Date();
      
      // Validate candidate status - only allow APPLIED during registration
      // REJECTED and WITHDRAWN should only be set by HR/admin, not during self-registration
      if (
        registerDto.candidateStatus &&
        (registerDto.candidateStatus === CandidateStatus.REJECTED ||
          registerDto.candidateStatus === CandidateStatus.WITHDRAWN)
      ) {
        throw new BadRequestException(
          'Invalid candidate status. Cannot register with REJECTED or WITHDRAWN status.',
        );
      }
      
      baseUserData.status =
        registerDto.candidateStatus || CandidateStatus.APPLIED;
    }

    // Create user using registry model
    await registry.model.create(baseUserData);

    return { message: `${userType} registered successfully`, userType };
  }

  /**
   * Sign in a user (Employee or Candidate)
   */
  async signIn(loginDto: LoginDto): Promise<{
    access_token: string;
    payload: {
      userid: Types.ObjectId;
      roles: SystemRole[];
      email: string;
      userType: UserType;
      employeeNumber?: string;
      candidateNumber?: string;
      nationalId: string;
    };
  }> {
    // Find user by email (checks both EmployeeProfile and Candidate)
    const userResult = await this.findUserByEmail(loginDto.email);

    if (!userResult) {
      throw new NotFoundException('User not found');
    }

    const { user, userType } = userResult;

    // Check if user has a password set
    if (!user.password) {
      throw new UnauthorizedException(
        'Password not set. Please contact administrator.',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status using registry's canLogin function
    const registry = this.userRegistryService.getUserType(userType);
    if (!registry) {
      throw new UnauthorizedException(
        `User type '${userType}' is not registered`,
      );
    }

    if (registry.canLogin && !registry.canLogin(user)) {
      const status = (user as any).status || 'unknown';
      throw new UnauthorizedException(
        `Account status is ${status}. Please contact administrator.`,
      );
    }

    // Get user roles using registry
    let roles: SystemRole[] = [];
    if (registry.getDefaultRoles) {
      const defaultRoles = await Promise.resolve(
        registry.getDefaultRoles(user),
      );
      roles = defaultRoles as SystemRole[];
    }

    // For employees, also check EmployeeSystemRole collection
    if (userType === 'employee') {
      const systemRoles = await this.getEmployeeRoles(user._id);
      if (systemRoles.length > 0) {
        roles = systemRoles;
      }
    }

    // Create JWT payload
    const userAny = user as any;
    const payload: any = {
      userid: user._id,
      employeeId: user._id, // Alias for backward compatibility with existing controllers
      sub: user._id.toString(), // JWT standard 'sub' claim (as string for compatibility)
      roles: roles,
      email: userAny.workEmail || user.personalEmail,
      userType: userType,
      nationalId: user.nationalId,
    };

    // Add type-specific identifier using registry
    if (registry.getUserIdentifier) {
      const identifier = registry.getUserIdentifier(user);
      if (identifier) {
        // Use a generic field name or type-specific
        payload[`${userType}Number`] = identifier;
      }
    }

    // Generate JWT token
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      payload,
    };
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    userId: Types.ObjectId,
    userType: UserType,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const userResult = await this.findUserById(userId, userType);

    if (!userResult || !userResult.password) {
      throw new NotFoundException('User not found or password not set');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userResult.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password based on user type
    const registry = this.userRegistryService.getUserType(userType);
    if (!registry) {
      throw new BadRequestException(
        `User type '${userType}' is not registered`,
      );
    }
    await registry.model.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Find user by email across all registered user types
   */
  private async findUserByEmail(
    email: string,
  ): Promise<{ user: any; userType: UserType } | null> {
    const allModels = this.userRegistryService.getAllModels();

    for (const { model, type, registry } of allModels) {
      const user = await model
        .findOne({
          $or: [{ personalEmail: email }, { workEmail: email }],
        })
        .lean()
        .exec();

      if (user) {
        return { user, userType: type as UserType };
      }
    }

    return null;
  }

  /**
   * Find user by national ID across all registered user types
   */
  private async findUserByNationalId(nationalId: string): Promise<any> {
    const allModels = this.userRegistryService.getAllModels();

    for (const { model } of allModels) {
      const user = await model.findOne({ nationalId }).lean().exec();
      if (user) {
        return user;
      }
    }

    return null;
  }

  /**
   * Find user by ID and type
   */
  private async findUserById(
    userId: Types.ObjectId,
    userType: UserType,
  ): Promise<any> {
    const registry = this.userRegistryService.getUserType(userType);
    if (!registry) {
      return null;
    }
    return await registry.model.findById(userId).lean().exec();
  }

  /**
   * Get employee roles from EmployeeSystemRole collection
   */
  private async getEmployeeRoles(
    employeeId: Types.ObjectId,
  ): Promise<SystemRole[]> {
    const systemRole = (await this.employeeSystemRoleModel
      .findOne({ employeeProfileId: employeeId, isActive: true })
      .lean()
      .exec()) as any;

    if (!systemRole || !systemRole.roles) {
      return [];
    }

    return systemRole.roles;
  }

  /**
   * Generate a unique employee number
   * Simple implementation - you may want to improve this
   */
  private async generateEmployeeNumber(): Promise<string> {
    const prefix = 'EMP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate a unique candidate number
   */
  private async generateCandidateNumber(): Promise<string> {
    const prefix = 'CAND';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}
