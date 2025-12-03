// src/employee-profile/employee-profile.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Delete,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../auth';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../shared/schemas/user.schema';

import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateProfilePictureDto } from './dto/update-profile-picture.dto';
import { SubmitChangeRequestDto } from './dto/submit-change-request.dto';
import { ReviewChangeRequestDto } from './dto/review-change-request.dto';
import { SearchEmployeeProfilesDto } from './dto/search-employee-profiles.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UpdateEmployeeProfileAsHrDto } from './dto/update-employee-profile-as-hr.dto';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto';
import { CreateDependentDto, UpdateDependentDto } from './dto';
import { CreateEmployeeNoteDto, UpdateEmployeeNoteDto } from './dto';
import { AccessAction } from './models/profile-access-log.schema';

// Services
import { EmergencyContactService } from './services/emergency-contact.service';
import { DependentService } from './services/dependent.service';
import { EmployeeNoteService } from './services/employee-note.service';
import { EmployeeHistoryService } from './services/employee-history.service';
import { ProfileAccessLogService } from './services/profile-access-log.service';

@Controller('employee-profile')
@UseGuards(JwtAuthGuard)
export class EmployeeProfileController {
  constructor(
    private readonly employeeProfileService: EmployeeProfileService,
    private readonly emergencyContactService: EmergencyContactService,
    private readonly dependentService: DependentService,
    private readonly employeeNoteService: EmployeeNoteService,
    private readonly employeeHistoryService: EmployeeHistoryService,
    private readonly profileAccessLogService: ProfileAccessLogService,
  ) {}

  // =====================================
  // SELF — PROFILE
  // =====================================

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    const userId = user.employeeId?.toString() || user.userid.toString();
    const profile = await this.employeeProfileService.getOwnProfile(userId);
    
    // Log access
    await this.profileAccessLogService.logAccess(
      userId,
      userId,
      AccessAction.VIEW,
      true,
      'View own profile',
      'Self-service access',
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
    const updated =
      await this.employeeProfileService.updateMyProfile(
        user.employeeId?.toString() || user.userid.toString(),
        body,
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
    const updated =
      await this.employeeProfileService.updateOwnContactInfo(
        user.employeeId?.toString() || user.userid.toString(),
        body,
      );

    return {
      success: true,
      message: 'Contact information updated successfully',
      data: {
        personalEmail: updated.personalEmail,
        mobilePhone: updated.mobilePhone,
        homePhone: updated.homePhone,
        workEmail: updated.workEmail,
      },
    };
  }

  @Patch('me/address')
  @HttpCode(HttpStatus.OK)
  async updateMyAddress(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateAddressDto,
  ) {
    const updated =
      await this.employeeProfileService.updateOwnAddress(
        user.employeeId?.toString() || user.userid.toString(),
        body,
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
    const updated =
      await this.employeeProfileService.updateOwnProfilePicture(
        user.employeeId?.toString() || user.userid.toString(),
        body,
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
    const result =
      await this.employeeProfileService.submitChangeRequest(
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
    const requests =
      await this.employeeProfileService.getMyChangeRequests(user.employeeId?.toString() || user.userid.toString());

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
  @Roles(UserRole.DEPARTMENT_MANAGER, UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getTeamProfiles(
    @CurrentUser() user: JwtPayload,
  ) {
    const team =
      await this.employeeProfileService.getTeamProfiles(user.employeeId?.toString() || user.userid.toString());

    return {
      success: true,
      message: 'Team profiles retrieved successfully',
      data: team,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getAllProfiles(
    @CurrentUser() user: JwtPayload,
  ) {
    const employees =
      await this.employeeProfileService.getAllProfiles(user.employeeId?.toString() || user.userid.toString());

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
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async searchProfiles(@Query() query: SearchEmployeeProfilesDto) {
    const results =
      await this.employeeProfileService.searchProfiles(query);

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
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getPendingChangeRequests(
    @CurrentUser() user: JwtPayload,
  ) {
    const pending =
      await this.employeeProfileService.getPendingChangeRequests(
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
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getProfileById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.employeeProfileService.ensureHrAccess(user.employeeId?.toString() || user.userid.toString());

    const profile = await this.employeeProfileService.getProfileById(id);

    // Log access
    await this.profileAccessLogService.logAccess(
      id,
      user.employeeId?.toString() || user.userid.toString(),
      AccessAction.VIEW,
      true,
      'View employee profile',
      'HR access',
    );

    return {
      success: true,
      message: 'Employee profile retrieved successfully',
      data: profile,
    };
  }

  @Patch('hr/change-requests/:id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async reviewChangeRequest(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: ReviewChangeRequestDto,
  ) {
    const result =
      await this.employeeProfileService.reviewChangeRequest(
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
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async updateProfileAsHr(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateEmployeeProfileAsHrDto,
  ) {
    const updated =
      await this.employeeProfileService.updateEmployeeProfileAsHr(id, body);

  return {
    success: true,
    message: 'Employee profile updated successfully by HR',
    data: updated,
  };
}

  // =====================================
  // EMERGENCY CONTACTS
  // =====================================

  @Post('me/emergency-contacts')
  @HttpCode(HttpStatus.CREATED)
  async createMyEmergencyContact(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateEmergencyContactDto,
  ) {
    const contact = await this.emergencyContactService.create(
      user.employeeId?.toString() || user.userid.toString(),
      body,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Emergency contact created successfully',
      data: contact,
    };
  }

  @Get('me/emergency-contacts')
  @HttpCode(HttpStatus.OK)
  async getMyEmergencyContacts(
    @CurrentUser() user: JwtPayload,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const contacts = await this.emergencyContactService.findAll(
      user.employeeId?.toString() || user.userid.toString(),
      activeOnly === 'true',
    );

    return {
      success: true,
      message: 'Emergency contacts retrieved successfully',
      data: contacts,
    };
  }

  @Get('me/emergency-contacts/primary')
  @HttpCode(HttpStatus.OK)
  async getMyPrimaryContact(@CurrentUser() user: JwtPayload) {
    const contact = await this.emergencyContactService.getPrimaryContact(
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Primary emergency contact retrieved successfully',
      data: contact,
    };
  }

  @Patch('me/emergency-contacts/:id')
  @HttpCode(HttpStatus.OK)
  async updateMyEmergencyContact(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: UpdateEmergencyContactDto,
  ) {
    const contact = await this.emergencyContactService.update(
      id,
      body,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Emergency contact updated successfully',
      data: contact,
    };
  }

  @Delete('me/emergency-contacts/:id')
  @HttpCode(HttpStatus.OK)
  async deleteMyEmergencyContact(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    await this.emergencyContactService.delete(id);

    return {
      success: true,
      message: 'Emergency contact deleted successfully',
    };
  }

  // HR endpoints for emergency contacts
  @Post(':id/emergency-contacts')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async createEmergencyContact(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateEmergencyContactDto,
  ) {
    const contact = await this.emergencyContactService.create(
      id,
      body,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Emergency contact created successfully',
      data: contact,
    };
  }

  @Get(':id/emergency-contacts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async getEmergencyContacts(
    @Param('id') id: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const contacts = await this.emergencyContactService.findAll(id, activeOnly === 'true');

    return {
      success: true,
      message: 'Emergency contacts retrieved successfully',
      data: contacts,
    };
  }

  @Patch(':id/emergency-contacts/:contactId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async updateEmergencyContact(
    @Param('contactId') contactId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateEmergencyContactDto,
  ) {
    const contact = await this.emergencyContactService.update(
      contactId,
      body,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Emergency contact updated successfully',
      data: contact,
    };
  }

  @Delete(':id/emergency-contacts/:contactId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async deleteEmergencyContact(@Param('contactId') contactId: string) {
    await this.emergencyContactService.delete(contactId);

    return {
      success: true,
      message: 'Emergency contact deleted successfully',
    };
  }

  // =====================================
  // DEPENDENTS
  // =====================================

  @Post('me/dependents')
  @HttpCode(HttpStatus.CREATED)
  async createMyDependent(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateDependentDto,
  ) {
    const dependent = await this.dependentService.create(
      user.employeeId?.toString() || user.userid.toString(),
      body,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Dependent created successfully',
      data: dependent,
    };
  }

  @Get('me/dependents')
  @HttpCode(HttpStatus.OK)
  async getMyDependents(
    @CurrentUser() user: JwtPayload,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const dependents = await this.dependentService.findAll(
      user.employeeId?.toString() || user.userid.toString(),
      activeOnly === 'true',
    );

    return {
      success: true,
      message: 'Dependents retrieved successfully',
      data: dependents,
    };
  }

  @Get('me/dependents/insurance')
  @HttpCode(HttpStatus.OK)
  async getMyInsuranceCoverage(@CurrentUser() user: JwtPayload) {
    const coverage = await this.dependentService.getInsuranceCoverage(
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Insurance coverage retrieved successfully',
      data: coverage,
    };
  }

  @Patch('me/dependents/:id')
  @HttpCode(HttpStatus.OK)
  async updateMyDependent(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: UpdateDependentDto,
  ) {
    const dependent = await this.dependentService.update(
      id,
      body,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Dependent updated successfully',
      data: dependent,
    };
  }

  @Delete('me/dependents/:id')
  @HttpCode(HttpStatus.OK)
  async deleteMyDependent(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    await this.dependentService.delete(id);

    return {
      success: true,
      message: 'Dependent deleted successfully',
    };
  }

  // HR endpoints for dependents
  @Post(':id/dependents')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async createDependent(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateDependentDto,
  ) {
    const dependent = await this.dependentService.create(
      id,
      body,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Dependent created successfully',
      data: dependent,
    };
  }

  @Get(':id/dependents')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async getDependents(
    @Param('id') id: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const dependents = await this.dependentService.findAll(id, activeOnly === 'true');

    return {
      success: true,
      message: 'Dependents retrieved successfully',
      data: dependents,
    };
  }

  @Get(':id/dependents/insurance')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getInsuranceCoverage(@Param('id') id: string) {
    const coverage = await this.dependentService.getInsuranceCoverage(id);

    return {
      success: true,
      message: 'Insurance coverage retrieved successfully',
      data: coverage,
    };
  }

  @Patch(':id/dependents/:dependentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async updateDependent(
    @Param('dependentId') dependentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateDependentDto,
  ) {
    const dependent = await this.dependentService.update(
      dependentId,
      body,
      user.employeeId?.toString() || user.userid.toString(),
    );

    return {
      success: true,
      message: 'Dependent updated successfully',
      data: dependent,
    };
  }

  @Delete(':id/dependents/:dependentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async deleteDependent(@Param('dependentId') dependentId: string) {
    await this.dependentService.delete(dependentId);

    return {
      success: true,
      message: 'Dependent deleted successfully',
    };
  }

  // =====================================
  // EMPLOYEE NOTES
  // =====================================

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async createNote(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateEmployeeNoteDto,
  ) {
    const note = await this.employeeNoteService.create(
      id,
      body,
      user.employeeId?.toString() || user.userid.toString(),
      user.roles || [],
    );

    return {
      success: true,
      message: 'Note created successfully',
      data: note,
    };
  }

  @Get(':id/notes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async getNotes(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Query('category') category?: string,
    @Query('requiresFollowUp') requiresFollowUp?: string,
  ) {
    const notes = await this.employeeNoteService.findAll(
      id,
      user.employeeId?.toString() || user.userid.toString(),
      user.roles || [],
      category,
      requiresFollowUp === 'true',
    );

    return {
      success: true,
      message: 'Notes retrieved successfully',
      data: notes,
    };
  }

  @Get('notes/pending-followups')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async getPendingFollowUps(@CurrentUser() user: JwtPayload) {
    const notes = await this.employeeNoteService.getPendingFollowUps(
      user.employeeId?.toString() || user.userid.toString(),
      user.roles || [],
    );

    return {
      success: true,
      message: 'Pending follow-ups retrieved successfully',
      data: notes,
    };
  }

  @Patch(':id/notes/:noteId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async updateNote(
    @Param('noteId') noteId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateEmployeeNoteDto,
  ) {
    const note = await this.employeeNoteService.update(
      noteId,
      body,
      user.employeeId?.toString() || user.userid.toString(),
      user.roles || [],
    );

    return {
      success: true,
      message: 'Note updated successfully',
      data: note,
    };
  }

  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async deleteNote(
    @Param('noteId') noteId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.employeeNoteService.delete(
      noteId,
      user.employeeId?.toString() || user.userid.toString(),
      user.roles || [],
    );

    return {
      success: true,
      message: 'Note deleted successfully',
    };
  }

  // =====================================
  // EMPLOYEE HISTORY
  // =====================================

  @Get(':id/history')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getEmployeeHistory(
    @Param('id') id: string,
    @Query('changeType') changeType?: string,
    @Query('limit') limit?: string,
  ) {
    const history = await this.employeeHistoryService.getEmployeeHistory(
      id,
      changeType as any,
      limit ? parseInt(limit, 10) : 100,
    );

    return {
      success: true,
      message: 'Employee history retrieved successfully',
      data: history,
    };
  }

  @Get(':id/history/snapshot')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getSnapshotAtDate(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    const snapshot = await this.employeeHistoryService.getSnapshotAtDate(
      id,
      new Date(date),
    );

    return {
      success: true,
      message: 'Snapshot retrieved successfully',
      data: snapshot,
    };
  }

  @Get(':id/history/compare')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async compareSnapshots(
    @Param('id') id: string,
    @Query('date1') date1: string,
    @Query('date2') date2: string,
  ) {
    const comparison = await this.employeeHistoryService.compareSnapshots(
      id,
      new Date(date1),
      new Date(date2),
    );

    return {
      success: true,
      message: 'Snapshots compared successfully',
      data: comparison,
    };
  }

  // =====================================
  // ACCESS LOGS
  // =====================================

  @Get(':id/access-logs')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getAccessLogs(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const logs = await this.profileAccessLogService.getProfileAccessLogs(
      id,
      limit ? parseInt(limit, 10) : 100,
    );

    return {
      success: true,
      message: 'Access logs retrieved successfully',
      data: logs,
    };
  }

  @Get('access-logs/statistics')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getAccessStatistics(
    @Query('employeeProfileId') employeeProfileId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const stats = await this.profileAccessLogService.getAccessStatistics(
      employeeProfileId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      success: true,
      message: 'Access statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('access-logs/unauthorized')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_MANAGER, UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async getUnauthorizedAccess(@Query('limit') limit?: string) {
    const logs = await this.profileAccessLogService.getUnauthorizedAccess(
      limit ? parseInt(limit, 10) : 100,
    );

    return {
      success: true,
      message: 'Unauthorized access logs retrieved successfully',
      data: logs,
    };
  }

}
