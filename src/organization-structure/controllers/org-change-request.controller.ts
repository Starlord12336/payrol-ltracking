import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { OrgChangeRequestService } from '../services/org-change-request.service';
import {
  CreateOrgChangeRequestDto,
  UpdateOrgChangeRequestDto,
  QueryOrgChangeRequestDto,
  ReviewOrgChangeRequestDto,
  ApproveOrgChangeRequestDto,
} from '../dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../auth';
import { UserRole } from '../../shared/schemas/user.schema';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Controller('organization-structure/change-requests')
@UseGuards(JwtAuthGuard)
export class OrgChangeRequestController {
  constructor(private readonly changeRequestService: OrgChangeRequestService) {}

  /**
   * Create a new change request
   * POST /api/organization-structure/change-requests
   * Roles: HR_ADMIN, SYSTEM_ADMIN, DEPARTMENT_MANAGER
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async create(
    @Body() createDto: CreateOrgChangeRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const changeRequest = await this.changeRequestService.create(createDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Change request created successfully',
      data: changeRequest,
    };
  }

  /**
   * Get all change requests with filters and pagination
   * GET /api/organization-structure/change-requests
   */
  @Get()
  async findAll(@Query() queryDto: QueryOrgChangeRequestDto) {
    const result = await this.changeRequestService.findAll(queryDto);
    
    return {
      success: true,
      message: 'Change requests retrieved successfully',
      ...result,
    };
  }

  /**
   * Get change request by ID
   * GET /api/organization-structure/change-requests/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const changeRequest = await this.changeRequestService.findOne(id);
    
    return {
      success: true,
      message: 'Change request retrieved successfully',
      data: changeRequest,
    };
  }

  /**
   * Get change request by request number
   * GET /api/organization-structure/change-requests/number/:requestNumber
   */
  @Get('number/:requestNumber')
  async findByRequestNumber(@Param('requestNumber') requestNumber: string) {
    const changeRequest = await this.changeRequestService.findByRequestNumber(requestNumber);
    
    return {
      success: true,
      message: 'Change request retrieved successfully',
      data: changeRequest,
    };
  }

  /**
   * Update a change request (only DRAFT status)
   * PUT /api/organization-structure/change-requests/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN, Requestor
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrgChangeRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const changeRequest = await this.changeRequestService.update(id, updateDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Change request updated successfully',
      data: changeRequest,
    };
  }

  /**
   * Submit a draft change request for review
   * POST /api/organization-structure/change-requests/:id/submit
   * Roles: HR_ADMIN, SYSTEM_ADMIN, Requestor
   */
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async submitForReview(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const changeRequest = await this.changeRequestService.submitForReview(id, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Change request submitted for review successfully',
      data: changeRequest,
    };
  }

  /**
   * Review a change request (HR Manager)
   * POST /api/organization-structure/change-requests/:id/review
   * Roles: HR_ADMIN, HR_MANAGER
   */
  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN)
  async review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewOrgChangeRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const changeRequest = await this.changeRequestService.review(id, reviewDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Change request reviewed successfully',
      data: changeRequest,
    };
  }

  /**
   * Approve a change request (System Admin)
   * POST /api/organization-structure/change-requests/:id/approve
   * Roles: SYSTEM_ADMIN
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveOrgChangeRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const changeRequest = await this.changeRequestService.approve(id, approveDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Change request approved successfully',
      data: changeRequest,
    };
  }

  /**
   * Reject a change request
   * POST /api/organization-structure/change-requests/:id/reject
   * Roles: HR_ADMIN, HR_MANAGER, SYSTEM_ADMIN
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER, UserRole.SYSTEM_ADMIN)
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const changeRequest = await this.changeRequestService.reject(id, reason, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Change request rejected successfully',
      data: changeRequest,
    };
  }

  /**
   * Implement an approved change request
   * POST /api/organization-structure/change-requests/:id/implement
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Post(':id/implement')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async implement(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const changeRequest = await this.changeRequestService.implement(id, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Change request implemented successfully',
      data: changeRequest,
    };
  }

  /**
   * Cancel a change request
   * DELETE /api/organization-structure/change-requests/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN, Requestor
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_MANAGER)
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const changeRequest = await this.changeRequestService.cancel(id, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Change request cancelled successfully',
      data: changeRequest,
    };
  }
}

