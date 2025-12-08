// src/employee-profile/employee-profile.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../auth';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SystemRole } from './enums/employee-profile.enums';

import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';
import { SubmitChangeRequestDto } from './dto/submit-change-request.dto';
import { ReviewChangeRequestDto } from './dto/review-change-request.dto';
import { SearchEmployeeProfilesDto } from './dto/search-employee-profiles.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UpdateEmployeeProfileAsHrDto } from './dto/update-employee-profile-as-hr.dto';

@Controller('employee-profile')
@UseGuards(JwtAuthGuard)
export class EmployeeProfileController {
  constructor(
    private readonly employeeProfileService: EmployeeProfileService,
  ) {}

  // =====================================
  // SELF — PROFILE
  // =====================================

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    const profile = await this.employeeProfileService.getMyProfile(
      user.userid.toString(),
      user.userType || 'employee', // Default to employee for backward compatibility
    );

    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }

  // =====================================
  // SELF — COMBINED UPDATE
  // =====================================

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateMyProfileDto,
  ) {
    const updated = await this.employeeProfileService.updateMyProfile(
      user.userid.toString(),
      body,
      user.userType || 'employee', // Default to employee for backward compatibility
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    };
  }

  // =====================================
  // SELF — SPECIFIC UPDATES
  // =====================================

  @Patch('me/contact')
  @HttpCode(HttpStatus.OK)
  async updateMyContactInfo(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateContactInfoDto,
  ) {
    const updated = await this.employeeProfileService.updateOwnContactInfo(
      user.userid.toString(),
      body,
      user.userType || 'employee',
    );

    const responseData: any = {
      personalEmail: updated.personalEmail,
      mobilePhone: updated.mobilePhone,
      homePhone: updated.homePhone,
    };

    // workEmail only exists for employees, not candidates
    if (user.userType !== 'candidate' && 'workEmail' in updated) {
      responseData.workEmail = (updated as any).workEmail;
    }

    return {
      success: true,
      message: 'Contact information updated successfully',
      data: responseData,
    };
  }

  @Patch('me/address')
  @HttpCode(HttpStatus.OK)
  async updateMyAddress(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateAddressDto,
  ) {
    const updated = await this.employeeProfileService.updateOwnAddress(
      user.userid.toString(),
      body,
      user.userType || 'employee',
    );

    return {
      success: true,
      message: 'Address updated successfully',
      data: {
        address: updated.address,
      },
    };
  }

  @Patch('me/profile-picture')
  @HttpCode(HttpStatus.OK)
  async updateMyProfilePicture(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateProfilePictureDto,
  ) {
    const updated = await this.employeeProfileService.updateOwnProfilePicture(
      user.userid.toString(),
      body,
      user.userType || 'employee',
    );

    return {
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePictureUrl: updated.profilePictureUrl,
      },
    };
  }

  // =====================================
  // SELF — CHANGE REQUESTS
  // =====================================

  @Post('me/change-requests')
  @HttpCode(HttpStatus.CREATED)
  async submitMyChangeRequest(
    @CurrentUser() user: JwtPayload,
    @Body() body: SubmitChangeRequestDto,
  ) {
    const result = await this.employeeProfileService.submitChangeRequest(
      user.employeeId?.toString() || user.userid.toString(),
      body,
    );

    return {
      success: true,
      message: 'Change request submitted successfully',
      data: result,
    };
  }

  @Get('me/change-requests')
  @HttpCode(HttpStatus.OK)
  async getMyChangeRequests(@CurrentUser() user: JwtPayload) {
    const requests = await this.employeeProfileService.getMyChangeRequests(
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Change requests retrieved successfully',
      data: requests,
    };
  }

  // =====================================
  // MANAGER / HR VIEWS
  // =====================================

  @Get('team')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(
    SystemRole.DEPARTMENT_HEAD,
    SystemRole.HR_MANAGER,
    SystemRole.HR_ADMIN,
    SystemRole.SYSTEM_ADMIN,
  )
  async getTeamProfiles(@CurrentUser() user: JwtPayload) {
    const team = await this.employeeProfileService.getTeamProfiles(
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Team profiles retrieved successfully',
      data: team,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async getAllProfiles(@CurrentUser() user: JwtPayload) {
    const employees = await this.employeeProfileService.getAllProfiles(
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'All employee profiles retrieved successfully',
      data: employees,
    };
  }

  // =====================================
  // HR — SEARCH (NO AUTH, ABOVE :id)
  // =====================================

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async searchProfiles(@Query() query: SearchEmployeeProfilesDto) {
    const results = await this.employeeProfileService.searchProfiles(query);

    return {
      success: true,
      message: 'Employee profiles search completed successfully',
      data: results,
    };
  }

  // =====================================
  // HR — CHANGE REQUESTS (MUST BE BEFORE :id)
  // =====================================

  @Get('hr/change-requests/pending')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async getPendingChangeRequests(@CurrentUser() user: JwtPayload) {
    const pending = await this.employeeProfileService.getPendingChangeRequests(
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Pending change requests retrieved successfully',
      data: pending,
      meta: { count: pending.length },
    };
  }

  // =====================================
  // HR — VIEW A PROFILE BY ID
  // =====================================

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async getProfileById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.employeeProfileService.ensureHrAccess(
      user.employeeId?.toString() || user.userid.toString(),
    );

    const profile = await this.employeeProfileService.getProfileById(id);

    return {
      success: true,
      message: 'Employee profile retrieved successfully',
      data: profile,
    };
  }

  @Patch('hr/change-requests/:id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async reviewChangeRequest(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: ReviewChangeRequestDto,
  ) {
    const result = await this.employeeProfileService.reviewChangeRequest(
      user.employeeId?.toString() || user.userid.toString(),
      id,
      body,
    );

    return {
      success: true,
      message: 'Change request reviewed successfully',
      data: result,
    };
  }

  // =====================================
  // HR — DIRECT UPDATE (AS HR)
  // =====================================
  @Patch(':id/hr')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
  async updateProfileAsHr(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateEmployeeProfileAsHrDto,
  ) {
    const updated = await this.employeeProfileService.updateEmployeeProfileAsHr(
      id,
      body,
    );

    return {
      success: true,
      message: 'Employee profile updated successfully by HR',
      data: updated,
    };
  }
}
