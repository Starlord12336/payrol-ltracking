/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Res,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { RecruitmentService } from "./recruitment.service";
import { CreateJobTemplateDto } from "./dto/create-job-template.dto";
import { CreateJobRequisitionDto } from "./dto/create-job-requisition.dto";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { AddOfferApproverDto } from "./dto/add-offer-approver.dto";
import { ScheduleInterviewDto } from "./dto/schedule-interview.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { SystemRole } from "../employee-profile/enums/employee-profile.enums";
import { CreateChecklistDto } from "./dto/create-checklist.dto";
import { UploadOnboardingDocumentDto } from "./dto/upload-onboarding-document.dto";
import {
  CreateOnboardingTaskDto,
  UpdateTaskStatusDto,
} from "./dto/onboarding-task.dto";
import { CreateProvisionDto } from "./dto/create-provision.dto";
import { ApproveProvisionDto } from "./dto/approve-provision.dto";
import { RejectProvisionDto } from "./dto/reject-provision.dto";
import { CreateAccessDto } from "./dto/create-access.dto";
import { ApproveAccessDto } from "./dto/approve-access.dto";
import { RevokeAccessDto } from "./dto/revoke-access.dto";
import { CreateEquipmentDto } from "./dto/create-equipment.dto";
import { AssignEquipmentDto } from "./dto/assign-equipment.dto";
import { ReturnEquipmentDto } from "./dto/return-equipment.dto";
import { CreatePayrollDto } from "./dto/create-payroll.dto";
import { TriggerPayrollDto } from "./dto/trigger-payroll.dto";
import { CreateBenefitsDto } from "./dto/create-benefits.dto";
import { ApproveBenefitsDto } from "./dto/approve-benefits.dto";
import {
  InitiateTerminationReviewDto,
  TerminationReviewResponseDto,
} from "./dto/initiate-termination-review.dto";
import {
  CreateOffboardingChecklistDto,
  OffboardingChecklistResponseDto,
  OffboardingChecklistSummaryDto,
} from "./dto/offboarding-checklist.dto";
import { Types } from "mongoose";
import { TerminationStatus } from "./enums/termination-status.enum";
import { ApprovalStatus } from "./enums/approval-status.enum";

class AdvanceApplicationDto {
  newStage?: string;
  changedBy?: string;
}

@Controller("recruitment")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // REC-003: Job Design & Posting
  @Post("templates")
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async createTemplate(@Body() dto: CreateJobTemplateDto) {
    return this.recruitmentService.createJobTemplate(dto);
  }

  @Get("templates")
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async listTemplates() {
    return this.recruitmentService.findAllJobTemplates();
  }

  @Get("templates/:id")
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE, SystemRole.RECRUITER)
  async getTemplate(@Param("id") id: string) {
    return this.recruitmentService.findJobTemplateById(id);
  }

  // REC-003: Create Job Requisition
  @Post("requisitions")
  @Roles(SystemRole.HR_MANAGER, SystemRole.HR_EMPLOYEE)
  async createRequisition(
    @Body() dto: CreateJobRequisitionDto,
    @CurrentUser() user: any,
  ) {
    // Get hiringManagerId from JWT token
    const hiringManagerId = user.employeeId?.toString() || user.userid.toString();
    return this.recruitmentService.createJobRequisition(dto, hiringManagerId);
  }

  // REC-008: Candidate Tracking
  @Post("applications/:id/advance")
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER, SystemRole.RECRUITER)
  async advanceApplication(
    @Param("id") id: string,
    @Body() body: AdvanceApplicationDto,
  ) {
    return this.recruitmentService.advanceApplicationStage(id, {
      newStage: body.newStage,
      changedBy: body.changedBy,
    });
  }

  // REC-023: Career Page Publishing
  @Get("requisitions/:id/preview")
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  async previewRequisition(@Param("id") id: string) {
    return this.recruitmentService.previewJobRequisition(id);
  }

  @Post("requisitions/:id/publish")
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  async publishRequisition(
    @Param("id") id: string,
    @Body() body: { expiryDays?: number },
  ) {
    return this.recruitmentService.publishJobRequisition(id, {
      expiryDays: body?.expiryDays,
    });
  }

  // REC-017: Candidate status tracking endpoints

  @Get("applications/:id/status")
  async getApplicationStatus(@Param("id") id: string) {
    return this.recruitmentService.getApplicationStatus(id);
  }

  @Get("applications/:id/history")
  async getApplicationHistory(@Param("id") id: string) {
    return this.recruitmentService.getApplicationHistory(id);
  }

  @Get("candidates/:id/applications")
  async listCandidateApplications(@Param("id") id: string) {
    return this.recruitmentService.listApplicationsForCandidate(id);
  }

  @Post("applications/:id/notify")
  async notifyCandidate(@Param("id") id: string) {
    return this.recruitmentService.prepareCandidateNotification(id);
  }

  // REC-022: Rejection templates and automated notifications

  @Get("applications/:id/rejection-preview")
  async rejectionPreview(
    @Param("id") id: string,
    @Body() body: { templateKey?: string; reason?: string },
  ) {
    return this.recruitmentService.prepareRejectionNotification(id, {
      templateKey: body?.templateKey,
      reason: body?.reason,
    });
  }

  @Post("applications/:id/reject")
  async rejectApplication(
    @Param("id") id: string,
    @Body() body: { templateKey?: string; reason?: string; changedBy?: string },
  ) {
    return this.recruitmentService.rejectApplication(id, {
      templateKey: body?.templateKey,
      reason: body?.reason,
      changedBy: body?.changedBy,
    });
  }

  // REC-008: Manage hiring process templates (file-backed, no schema changes)

  @Get("process-templates")
  async listProcessTemplates() {
    return this.recruitmentService.listProcessTemplates();
  }

  @Get("process-templates/:key")
  async getProcessTemplate(@Param("key") key: string) {
    return this.recruitmentService.readProcessTemplate(key);
  }

  @Post("process-templates/:key")
  async createOrUpdateProcessTemplate(
    @Param("key") key: string,
    @Body() body: { name: string; stages: string[] },
  ) {
    return this.recruitmentService.saveProcessTemplate(key, {
      name: body.name,
      stages: body.stages,
    });
  }

  @Delete("process-templates/:key")
  async deleteProcessTemplate(@Param("key") key: string) {
    return this.recruitmentService.deleteProcessTemplate(key);
  }

  // REC-010: Interview scheduling and invitation management

  @Post("interviews/schedule")
  async scheduleInterview(@Body() dto: ScheduleInterviewDto) {
    return this.recruitmentService.scheduleInterview(dto.applicationId, {
      stage: dto.stage,
      scheduledDate: dto.scheduledDate,
      method: dto.method,
      panelIds: dto.panelIds,
      panelEmails: dto.panelEmails,
      durationMinutes: dto.durationMinutes,
      videoLink: dto.videoLink,
      createdBy: dto.createdBy,
      templateKey: dto.templateKey,
    });
  }

  @Get("interviews/:id")
  async getInterview(@Param("id") id: string) {
    return this.recruitmentService.getInterview(id);
  }

  @Put("interviews/:id")
  async updateInterview(
    @Param("id") id: string,
    @Body()
    body: {
      scheduledDate?: string;
      method?: string;
      videoLink?: string;
      status?: string;
    },
  ) {
    return this.recruitmentService.updateInterview(id, {
      scheduledDate: body.scheduledDate,
      method: body.method,
      videoLink: body.videoLink,
      status: body.status,
    });
  }

  @Post("interviews/:id/cancel")
  async cancelInterview(
    @Param("id") id: string,
    @Body() body: { reason?: string; changedBy?: string },
  ) {
    return this.recruitmentService.cancelInterview(id, {
      reason: body.reason,
      changedBy: body.changedBy,
    });
  }

  @Post("interviews/:id/invite")
  async inviteInterview(
    @Param("id") id: string,
    @Body() body: { extraPanelEmails?: string[]; message?: string },
  ) {
    // Prepare invitation payload for an existing interview (does not send emails)
    const interview = await this.recruitmentService.getInterview(id);
    if (!interview) throw new NotFoundException("Interview not found");
    const candidateInfo =
      await this.recruitmentService.prepareCandidateNotification(
        String(interview.applicationId),
      );
    const invite = {
      interview,
      message: body.message || null,
      candidateContact: candidateInfo.to,
      extraPanelEmails: body.extraPanelEmails || [],
    };
    return invite;
  }

  // REC-011: Interview feedback (assessment results)

  @Post("interviews/:id/feedback")
  async submitInterviewFeedback(
    @Param("id") id: string,
    @Body() body: { interviewerId: string; score: number; comments?: string },
  ) {
    return this.recruitmentService.saveAssessmentResult(
      id,
      body.interviewerId,
      body.score,
      body.comments,
    );
  }

  @Get("interviews/:id/feedbacks")
  async listInterviewFeedbacks(@Param("id") id: string) {
    return this.recruitmentService.listAssessmentResults(id);
  }

  @Get("interviews/:id/summary")
  async interviewFeedbackSummary(@Param("id") id: string) {
    return this.recruitmentService.getInterviewFeedbackSummary(id);
  }

  // REC-020: Assessment forms (file-backed) and structured feedback

  @Post("assessment-forms/:key")
  async createOrUpdateAssessmentForm(
    @Param("key") key: string,
    @Body()
    body: {
      name: string;
      role?: string;
      positionCode?: string;
      criteria: Array<{ key: string; label: string; weight?: number }>;
    },
  ) {
    return this.recruitmentService.saveAssessmentForm(key, {
      name: body.name,
      role: body.role,
      positionCode: body.positionCode,
      criteria: body.criteria,
    });
  }

  @Get("assessment-forms")
  async listAssessmentForms() {
    return this.recruitmentService.listAssessmentForms();
  }

  @Get("assessment-forms/:key")
  async getAssessmentForm(@Param("key") key: string) {
    return this.recruitmentService.readAssessmentForm(key);
  }

  @Delete("assessment-forms/:key")
  async deleteAssessmentForm(@Param("key") key: string) {
    return this.recruitmentService.deleteAssessmentForm(key);
  }

  @Post("interviews/:id/feedback-structured")
  async submitStructuredFeedback(
    @Param("id") id: string,
    @Body()
    body: {
      interviewerId: string;
      formKey: string;
      responses: Record<string, number>;
      comments?: string;
    },
  ) {
    return this.recruitmentService.submitStructuredAssessment(
      id,
      body.interviewerId,
      body.formKey,
      body.responses,
      body.comments,
    );
  }

  @Get("interviews/:id/structured-responses")
  async listStructuredResponses(@Param("id") id: string) {
    return this.recruitmentService.listStructuredResponses(id);
  }

  @Get("interviews/:id/structured-responses/:file")
  async getStructuredResponse(
    @Param("id") id: string,
    @Param("file") file: string,
  ): Promise<any> {
    return this.recruitmentService.getStructuredResponse(id, file);
  }

  // REC-021: Interview panel coordination (members, availability, feedback aggregation)

  @Post("panel-members/:id")
  async registerPanelMember(
    @Param("id") id: string,
    @Body()
    body: { name: string; email?: string; role?: string; expertise?: string[] },
  ) {
    return this.recruitmentService.registerPanelMember(id, {
      name: body.name,
      email: body.email,
      role: body.role,
      expertise: body.expertise,
    });
  }

  @Get("panel-members")
  async listPanelMembers() {
    return this.recruitmentService.listPanelMembers();
  }

  @Get("panel-members/:id")
  async getPanelMember(@Param("id") id: string): Promise<any> {
    return this.recruitmentService.getPanelMember(id);
  }

  @Post("panel-members/:id/availability")
  async setPanelAvailability(
    @Param("id") id: string,
    @Body() body: { availability: Record<string, string[]> },
  ) {
    return this.recruitmentService.setPanelAvailability(id, body.availability);
  }

  @Get("panel-members/:id/availability")
  async getPanelAvailability(@Param("id") id: string): Promise<any> {
    return this.recruitmentService.getPanelAvailability(id);
  }

  @Put("panel-members/:id/availability")
  async updatePanelAvailability(
    @Param("id") id: string,
    @Body() body: { availability: Record<string, string[]> },
  ) {
    return this.recruitmentService.setPanelAvailability(id, body.availability);
  }
  @Get("interviews/:id/panel-coordination")
  async getPanelCoordinationReport(@Param("id") id: string) {
    return this.recruitmentService.getPanelCoordinationReport(id);
  }

  @Post("panel-members/common-availability")
  async findCommonAvailability(
    @Body()
    body: {
      panelMemberIds: string[];
      dateRange: { startDate: string; endDate: string };
    },
  ) {
    return this.recruitmentService.findCommonAvailability(
      body.panelMemberIds,
      body.dateRange,
    );
  }

  // Upload candidate CV (multipart/form-data 'file') - Using GridFS
  @Post("candidates/:id/upload-cv")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: undefined, // Use memory storage (no filesystem) - file will be in buffer
      fileFilter: (req: any, file: any, cb: any): void => {
        // Allowed MIME types for CV documents
        const allowedMimeTypes = [
          'application/pdf', // PDF
          'application/msword', // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'text/plain', // .txt
        ];

        // Allowed file extensions (fallback check)
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
        const fileExtension = file.originalname
          ? file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase()
          : '';

        // Check MIME type or file extension
        if (
          allowedMimeTypes.includes(file.mimetype) ||
          allowedExtensions.includes(fileExtension)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only PDF, DOC, DOCX, or TXT files are allowed.',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadCv(
    @Param("id") id: string,
    @UploadedFile() file: any,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Additional file size check
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds the maximum limit of 5MB');
    }

    // Pass file directly (with buffer) to service for GridFS upload
    return this.recruitmentService.uploadCandidateCV(id, file);
  }

  // Download candidate CV from GridFS
  @Get("candidates/:id/cv/:documentId")
  async downloadCV(
    @Param("id") candidateId: string,
    @Param("documentId") documentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { stream, metadata } = await this.recruitmentService.getCVFile(documentId);

    // Set response headers
    res.setHeader('Content-Type', metadata.metadata?.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.metadata?.originalName || metadata.filename}"`);
    res.setHeader('Content-Length', metadata.length);

    // Pipe the stream to response
    stream.pipe(res);
  }

  // Apply to a requisition. Body: { candidateId: string, documentId?: string }
  @Post("requisitions/:id/apply")
  async applyToRequisition(
    @Param("id") id: string,
    @Body() body: { candidateId: string; documentId?: string },
  ) {
    return this.recruitmentService.applyToRequisition(body.candidateId, id, {
      documentId: body.documentId,
    });
  }

  // REC-030: Referral tagging and prioritization (no schema changes)

  @Post("candidates/:id/referral")
  async tagCandidateReferral(
    @Param("id") id: string,
    @Body()
    body: { referringEmployeeId: string; role?: string; level?: string },
  ) {
    return this.recruitmentService.createReferral(
      body.referringEmployeeId,
      id,
      { role: body.role, level: body.level },
    );
  }

  @Get("candidates/:id/referral")
  async getCandidateReferrals(@Param("id") id: string) {
    return this.recruitmentService.getReferralsForCandidate(id);
  }

  @Get("referrals")
  async listReferrals() {
    return this.recruitmentService.listReferrals();
  }

  @Get("referrals/:id")
  async getReferral(@Param("id") id: string) {
    return this.recruitmentService.getReferralById(id);
  }

  // REC-028: Candidate consent endpoints (grant/revoke/list/latest)

  @Post("candidates/:id/consent")
  async grantConsent(
    @Param("id") id: string,
    @Body()
    body: {
      granted: boolean;
      type?: string;
      givenBy?: string;
      details?: string;
    },
  ) {
    return this.recruitmentService.saveConsent(
      id,
      body.granted,
      body.type || "personal",
      body.givenBy,
      body.details,
    );
  }

  @Post("candidates/:id/consent/revoke")
  async revokeConsent(
    @Param("id") id: string,
    @Body() body: { givenBy?: string; details?: string },
  ) {
    return this.recruitmentService.saveConsent(
      id,
      false,
      "personal",
      body.givenBy,
      body.details,
    );
  }

  @Get("candidates/:id/consent")
  async listCandidateConsents(@Param("id") id: string) {
    return this.recruitmentService.listConsents(id);
  }

  @Get("candidates/:id/consent/latest")
  async latestCandidateConsent(@Param("id") id: string) {
    return this.recruitmentService.getLatestConsent(id);
  }

  @Get("candidates/:id/consent/file/:file")
  async getCandidateConsentFile(
    @Param("id") id: string,
    @Param("file") file: string,
  ): Promise<any> {
    return this.recruitmentService.getConsentFile(id, file);
  }

  @Post("applications/:id/prioritize")
  async prioritizeApplication(
    @Param("id") id: string,
    @Body()
    body: { changedBy?: string; expedite?: boolean; expediteToStage?: string },
  ): Promise<any> {
    return this.recruitmentService.prioritizeApplication(id, {
      changedBy: body.changedBy,
      expedite: body.expedite,
      expediteToStage: body.expediteToStage,
    });
  }

  // REC-009: Recruitment dashboard — monitor progress across open positions

  @Get("dashboard")
  async recruitmentDashboard() {
    return this.recruitmentService.getRecruitmentDashboard();
  }

  // Offer endpoints (REC-014)
  @Post("offers")
  async createOffer(@Body() dto: CreateOfferDto) {
    return this.recruitmentService.createOffer(dto);
  }

  @Get("offers")
  async listOffers(
    @Query("applicationId") applicationId?: string,
    @Query("candidateId") candidateId?: string,
  ) {
    return this.recruitmentService.listOffers({ applicationId, candidateId });
  }

  @Get("offers/:id")
  async getOffer(@Param("id") id: string) {
    return this.recruitmentService.findOfferById(id);
  }

  @Post("offers/:id/approvers")
  async addOfferApprover(
    @Param("id") id: string,
    @Body() dto: AddOfferApproverDto,
  ) {
    return this.recruitmentService.addOfferApproverAction(
      id,
      dto.employeeId,
      dto.role,
      dto.status,
      dto.comment,
    );
  }

  @Post("offers/:id/finalize")
  async finalizeOffer(@Param("id") id: string) {
    return this.recruitmentService.finalizeOffer(id);
  }

  @Post("offers/:id/respond")
  async candidateRespondOffer(
    @Param("id") id: string,
    @Body() body: { response: "accepted" | "rejected" },
  ) {
    return this.recruitmentService.candidateRespondOffer(id, body.response);
  }

  // REC-029: Pre-boarding endpoints (file-backed tasks)
  @Post("offers/:id/preboarding/trigger")
  async triggerPreboarding(
    @Param("id") id: string,
    @Body()
    body: {
      startDate?: string;
      tasks?: Array<{
        title: string;
        description?: string;
        assignee?: "candidate" | "hr";
        dueDays?: number;
      }>;
    },
  ) {
    return this.recruitmentService.triggerPreboarding(id, {
      startDate: body?.startDate,
      tasks: body?.tasks,
    });
  }

  @Get("offers/:id/preboarding")
  async listPreboarding(@Param("id") id: string): Promise<any> {
    return this.recruitmentService.listPreboardingTasks(id);
  }

  @Post("offers/:id/preboarding/:taskId/complete")
  async completePreboardingTask(
    @Param("id") id: string,
    @Param("taskId") taskId: string,
    @Body() body: { completedBy?: string },
  ): Promise<any> {
    return this.recruitmentService.completePreboardingTask(
      id,
      taskId,
      body?.completedBy,
    );
  }

  // ============ ONBOARDING ENDPOINTS ============

  @Post("onboarding/create-checklist")
  async createChecklist(@Body() dto: CreateChecklistDto) {
    return this.recruitmentService.createChecklist(dto);
  }

  @Post("onboarding/upload-document")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.JOB_CANDIDATE)
  @ApiOperation({
    summary:
      "Candidate uploads signed contract and required documents to initiate onboarding",
  })
  @ApiBody({ type: UploadOnboardingDocumentDto })
  @ApiResponse({
    status: 201,
    description: "Document uploaded and onboarding initiated.",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid employee ID or document type.",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden: insufficient permissions.",
  })
  async uploadDocument(@Body() dto: UploadOnboardingDocumentDto) {
    return this.recruitmentService.uploadDocument(dto);
  }

  @Get("onboarding/documents/pending")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  async listPendingDocuments() {
    return this.recruitmentService.listPendingDocuments();
  }

  @Post("onboarding/document/:documentId/verify")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  async verifyDocument(
    @Param("documentId") documentId: string,
    @Body() body: any,
  ): Promise<any> {
    // body should include verifiedBy and optional notes
    return this.recruitmentService.verifyDocument(
      documentId,
      body.verifiedBy as string,
      body.notes as string,
    );
  }

  @Post("onboarding/document/:documentId/reject")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  async rejectDocument(
    @Param("documentId") documentId: string,
    @Body() body: any,
  ): Promise<any> {
    // body should include verifiedBy, rejectionReason and optional notes
    return this.recruitmentService.rejectDocument(
      documentId,
      body.verifiedBy as string,
      body.rejectionReason as string,
      body.notes as string,
    );
  }

  @Get("onboarding/contract/:contractId")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  @ApiOperation({
    summary:
      "Get signed contract details (HR only). Retrieves full candidate data for profile creation.",
  })
  @ApiResponse({
    status: 200,
    description: "Contract details with candidate profile data.",
  })
  @ApiResponse({
    status: 400,
    description: "Contract not fully signed or data incomplete.",
  })
  @ApiResponse({ status: 403, description: "Forbidden: HR access only." })
  @ApiResponse({
    status: 404,
    description: "Contract or related offer/candidate not found.",
  })
  async getContract(@Param("contractId") contractId: string) {
    return this.recruitmentService.getContractDetails(contractId);
  }

  @Post("onboarding/contract/:contractId/create-profile")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.HR_MANAGER)
  @ApiOperation({
    summary:
      "Create employee profile from signed contract (HR only). Validates signatures, prevents duplicates, generates employee number.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        createdBy: { type: "string", description: "HR employee ID or name" },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Employee profile created successfully.",
  })
  @ApiResponse({
    status: 400,
    description: "Contract not fully signed or candidate data incomplete.",
  })
  @ApiResponse({ status: 403, description: "Forbidden: HR access only." })
  @ApiResponse({
    status: 404,
    description: "Contract or related data not found.",
  })
  @ApiResponse({
    status: 409,
    description:
      "Conflict: employee profile already exists for this candidate.",
  })
  async createProfileFromContract(
    @Param("contractId") contractId: string,
    @Body() body: { createdBy: string },
  ) {
    return this.recruitmentService.createEmployeeProfileFromContract(
      contractId,
      body.createdBy,
    );
  }

  @Get("onboarding/tracker/:employeeId")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE, SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD)
  @ApiOperation({
    summary:
      "View onboarding progress tracker. Employee sees next steps; HR/Manager can view team trackers.",
  })
  @ApiResponse({
    status: 200,
    description: "Tracker with task list, progress, and next task to complete.",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden: Cannot view other employees' trackers.",
  })
  @ApiResponse({ status: 404, description: "Onboarding not found." })
  async getTracker(
    @Param("employeeId") employeeId: string,
    @Request() req: any,
  ): Promise<any> {
    // Authorization: employee can only view own tracker; HR/Manager can view anyone
    if (
      (req.user?.id as string) !== employeeId &&
      !["HR", "Manager", "SYSTEM_ADMIN"].includes(
        (req.user?.role as string) || "",
      )
    ) {
      throw new ForbiddenException(
        `Cannot view tracker for employee ${employeeId}. Only your own or HR/Manager can access.`,
      );
    }
    return this.recruitmentService.getTracker(employeeId);
  }

  @Post("onboarding/:employeeId/populate-dept-tasks")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD)
  @ApiOperation({
    summary:
      "Populate onboarding with department-specific tasks and training plans (BR 11a,11b).",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        departmentId: {
          type: "string",
          description: "Optional dept ID to override employee's dept",
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Department tasks added." })
  @ApiResponse({ status: 403, description: "Forbidden: HR/Manager only." })
  async populateDepartmentTasks(
    @Param("employeeId") employeeId: string,
    @Body() body: { departmentId?: string },
  ) {
    return this.recruitmentService.populateDepartmentTasks(
      employeeId,
      body.departmentId,
    );
  }

  @Post("onboarding/:employeeId/task")
  async createTask(
    @Param("employeeId") employeeId: string,
    @Body() dto: CreateOnboardingTaskDto,
  ) {
    return this.recruitmentService.createTask(employeeId, dto);
  }

  // Provisioning endpoints
  @Post("onboarding/:employeeId/provision")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async createProvision(
    @Param("employeeId") employeeId: string,
    @Body() dto: CreateProvisionDto,
  ) {
    return this.recruitmentService.createProvisionRequest(employeeId, dto);
  }

  @Get("onboarding/:employeeId/provision")
  async listProvision(@Param("employeeId") employeeId: string) {
    return this.recruitmentService.listProvisionRequests(employeeId);
  }

  @Put("onboarding/:employeeId/provision/:taskIndex/approve")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async approveProvision(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Body() dto: ApproveProvisionDto,
  ) {
    return this.recruitmentService.approveProvisionRequest(
      employeeId,
      parseInt(taskIndex, 10),
      dto,
    );
  }

  @Put("onboarding/:employeeId/provision/:taskIndex/reject")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async rejectProvision(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Body() dto: RejectProvisionDto,
  ) {
    return this.recruitmentService.rejectProvisionRequest(
      employeeId,
      parseInt(taskIndex, 10),
      dto,
    );
  }

  // Access provisioning
  @Post("onboarding/:employeeId/access")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async createAccess(
    @Param("employeeId") employeeId: string,
    @Body() dto: CreateAccessDto,
  ) {
    return this.recruitmentService.createAccessRequest(employeeId, dto);
  }

  @Put("onboarding/:employeeId/access/:taskIndex/approve")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async approveAccess(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Body() dto: ApproveAccessDto,
  ) {
    return this.recruitmentService.approveAccessRequest(
      employeeId,
      parseInt(taskIndex, 10),
      dto,
    );
  }

  @Put("onboarding/:employeeId/access/:taskIndex/revoke")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.SYSTEM_ADMIN)
  async revokeAccess(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Body() dto: RevokeAccessDto,
  ) {
    return this.recruitmentService.revokeAccess(
      employeeId,
      parseInt(taskIndex, 10),
      dto,
    );
  }

  // Equipment flows
  @Post("onboarding/:employeeId/equipment")
  async createEquipment(
    @Param("employeeId") employeeId: string,
    @Body() dto: CreateEquipmentDto,
  ) {
    return this.recruitmentService.createEquipmentRequest(employeeId, dto);
  }

  @Put("onboarding/:employeeId/equipment/:taskIndex/assign")
  async assignEquipment(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Body() dto: AssignEquipmentDto,
  ) {
    return this.recruitmentService.assignEquipment(
      employeeId,
      parseInt(taskIndex, 10),
      dto,
    );
  }

  @Put("onboarding/:employeeId/equipment/:taskIndex/return")
  async returnEquipment(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Body() dto: ReturnEquipmentDto,
  ) {
    return this.recruitmentService.returnEquipment(
      employeeId,
      parseInt(taskIndex, 10),
      dto,
    );
  }

  // Payroll & Benefits initiation
  @Post("onboarding/:employeeId/payroll")
  async createPayroll(
    @Param("employeeId") employeeId: string,
    @Body() dto: CreatePayrollDto,
  ) {
    return this.recruitmentService.createPayrollInitiation(employeeId, dto);
  }

  @Put("onboarding/:employeeId/payroll/:taskIndex/trigger")
  async triggerPayroll(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Body() dto: TriggerPayrollDto,
  ) {
    return this.recruitmentService.triggerPayroll(
      employeeId,
      parseInt(taskIndex, 10),
      dto,
    );
  }

  @Post("onboarding/:employeeId/benefits")
  async createBenefits(
    @Param("employeeId") employeeId: string,
    @Body() dto: CreateBenefitsDto,
  ) {
    return this.recruitmentService.createBenefitsRequest(employeeId, dto);
  }

  @Put("onboarding/:employeeId/benefits/:taskIndex/approve")
  async approveBenefits(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Body() dto: ApproveBenefitsDto,
  ) {
    return this.recruitmentService.approveBenefitsRequest(
      employeeId,
      parseInt(taskIndex, 10),
      dto,
    );
  }

  @Put("onboarding/:employeeId/task/:taskIndex")
  async updateTask(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.recruitmentService.updateTaskStatus(
      employeeId,
      parseInt(taskIndex, 10),
      dto,
    );
  }

  @Post("onboarding/:employeeId/remind/:taskIndex")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.DEPARTMENT_EMPLOYEE)
  @ApiOperation({
    summary:
      "Send task reminder to employee and task owner (HR/Manager/NewHire)",
  })
  @ApiResponse({ status: 200, description: "Reminders sent successfully." })
  @ApiResponse({
    status: 403,
    description: "Forbidden: cannot send reminders for other employees.",
  })
  @ApiResponse({ status: 404, description: "Task or onboarding not found." })
  async remind(
    @Param("employeeId") employeeId: string,
    @Param("taskIndex") taskIndex: string,
    @Request() req: any,
  ): Promise<any> {
    // Authorization: Employee can remind themselves; HR/Manager can remind anyone
    if (
      (req.user?.id as string) !== employeeId &&
      !["HR", "Manager", "SYSTEM_ADMIN"].includes(
        (req.user?.role as string) || "",
      )
    ) {
      throw new ForbiddenException(
        `Cannot send reminders for employee ${employeeId}`,
      );
    }
    return this.recruitmentService.sendTaskReminder(
      employeeId,
      parseInt(taskIndex, 10),
    );
  }

  @Post("onboarding/reminders/auto-send")
  @UseGuards(RolesGuard)
  @Roles(SystemRole.HR_EMPLOYEE, SystemRole.DEPARTMENT_HEAD, SystemRole.SYSTEM_ADMIN)
  @ApiOperation({
    summary:
      "Trigger auto-send of reminders for upcoming deadline tasks (HR/Admin only)",
  })
  @ApiResponse({ status: 200, description: "Auto-reminders sent." })
  @ApiResponse({
    status: 403,
    description: "Forbidden: HR/Manager/Admin only.",
  })
  async autoSendReminders() {
    return this.recruitmentService.autoSendRemindersForUpcomingDeadlines();
  }

  // ============ TERMINATION & OFFBOARDING ENDPOINTS ============

  @Post("termination-reviews/initiate")
  async initiateTerminationReview(
    @Body() dto: InitiateTerminationReviewDto,
  ): Promise<TerminationReviewResponseDto> {
    const result = await this.recruitmentService.initiateTerminationReview(
      dto,
      new Types.ObjectId(),
    );
    return this.mapToTerminationResponseDto(result);
  }

  @Get("employees/:employeeId/performance-data")
  async getEmployeePerformanceData(@Param("employeeId") employeeId: string) {
    return await this.recruitmentService.getEmployeePerformanceData(
      new Types.ObjectId(employeeId),
    );
  }

  @Get("employees/:employeeId/termination-reviews")
  async getTerminationReviewsForEmployee(
    @Param("employeeId") employeeId: string,
  ): Promise<TerminationReviewResponseDto[]> {
    const reviews =
      await this.recruitmentService.getTerminationReviewsForEmployee(
        new Types.ObjectId(employeeId),
      );
    return reviews.map((review) => this.mapToTerminationResponseDto(review));
  }

  @Get("termination-reviews/pending")
  async getPendingTerminationReviews(): Promise<
    TerminationReviewResponseDto[]
  > {
    const reviews =
      await this.recruitmentService.getPendingTerminationReviews();
    return reviews.map((review) => this.mapToTerminationResponseDto(review));
  }

  @Get("termination-reviews/:reviewId")
  async getTerminationReviewWithPerformance(
    @Param("reviewId") reviewId: string,
  ) {
    const { terminationRequest, performanceData } =
      await this.recruitmentService.getTerminationReviewWithPerformance(
        new Types.ObjectId(reviewId),
      );
    return {
      terminationRequest: this.mapToTerminationResponseDto(terminationRequest),
      performanceData,
    };
  }

  @Put("termination-reviews/:reviewId/status")
  async updateTerminationReviewStatus(
    @Param("reviewId") reviewId: string,
    @Body() body: { status: TerminationStatus; hrComments?: string },
  ): Promise<TerminationReviewResponseDto> {
    const result = await this.recruitmentService.updateTerminationReviewStatus(
      new Types.ObjectId(reviewId),
      body.status,
      body.hrComments,
    );
    return this.mapToTerminationResponseDto(result);
  }

  @Post("terminations/:terminationId/revoke-access")
  async revokeTerminatedEmployeeAccess(
    @Param("terminationId") terminationId: string,
    @Body()
    body: {
      employeeId: string;
      revokedBy: string;
      accessType?: string;
      comments?: string;
    },
  ): Promise<any> {
    return await this.recruitmentService.revokeTerminatedEmployeeAccess(
      new Types.ObjectId(terminationId),
      new Types.ObjectId(body.employeeId),
      new Types.ObjectId(body.revokedBy),
      body.accessType || "ALL_ACCESS",
      body.comments || "",
    );
  }

  @Get("terminations/access/revoked")
  async getTerminatedEmployeesWithRevokedAccess(): Promise<any[]> {
    return await this.recruitmentService.getTerminatedEmployeesWithRevokedAccess();
  }

  @Get("employees/:employeeId/access-revocation-history")
  async getEmployeeAccessRevocationHistory(
    @Param("employeeId") employeeId: string,
  ): Promise<any> {
    return await this.recruitmentService.getEmployeeAccessRevocationHistory(
      new Types.ObjectId(employeeId),
    );
  }

  @Post("terminations/:terminationId/offboarding-checklist")
  async createOffboardingChecklist(
    @Param("terminationId") terminationId: string,
  ): Promise<OffboardingChecklistResponseDto> {
    const dto: CreateOffboardingChecklistDto = {
      terminationId: new Types.ObjectId(terminationId),
    };
    const result =
      await this.recruitmentService.createOffboardingChecklist(dto);
    return this.mapOffboardingToResponseDto(result);
  }

  @Get("terminations/:terminationId/offboarding-checklist")
  async getOffboardingChecklist(
    @Param("terminationId") terminationId: string,
  ): Promise<OffboardingChecklistResponseDto> {
    return await this.recruitmentService.getOffboardingChecklist(
      new Types.ObjectId(terminationId),
    );
  }

  @Get("terminations/:terminationId/offboarding-checklist/summary")
  async getOffboardingChecklistSummary(
    @Param("terminationId") terminationId: string,
  ): Promise<OffboardingChecklistSummaryDto> {
    return await this.recruitmentService.getOffboardingChecklistSummary(
      new Types.ObjectId(terminationId),
    );
  }

  @Put(
    "terminations/:terminationId/offboarding-checklist/departments/:department",
  )
  async updateDepartmentApproval(
    @Param("terminationId") terminationId: string,
    @Param("department") department: string,
    @Body()
    body: { status: ApprovalStatus; comments?: string; updatedBy?: string },
  ): Promise<OffboardingChecklistResponseDto> {
    const updatedBy = body.updatedBy
      ? new Types.ObjectId(body.updatedBy)
      : undefined;
    const result = await this.recruitmentService.updateDepartmentApproval(
      new Types.ObjectId(terminationId),
      department,
      body.status,
      body.comments,
      updatedBy,
    );
    return result;
  }

  @Put("terminations/:terminationId/offboarding-checklist/equipment")
  async updateEquipmentReturn(
    @Param("terminationId") terminationId: string,
    @Body()
    body: {
      equipmentUpdates: Array<{
        name: string;
        returned: boolean;
        condition?: string;
      }>;
    },
  ): Promise<OffboardingChecklistResponseDto> {
    const result = await this.recruitmentService.updateEquipmentReturn(
      new Types.ObjectId(terminationId),
      body.equipmentUpdates,
    );
    return result;
  }

  @Post("terminations/:terminationId/offboarding-checklist/complete")
  async completeOffboarding(
    @Param("terminationId") terminationId: string,
  ): Promise<OffboardingChecklistResponseDto> {
    const result = await this.recruitmentService.completeOffboarding(
      new Types.ObjectId(terminationId),
    );
    return result;
  }

  @Put("terminations/:terminationId/clearance/:department")
  async updateClearanceStatus(
    @Param("terminationId") terminationId: string,
    @Param("department") department: string,
    @Body() body: { status: string; comments?: string; approvedBy: string },
  ): Promise<any> {
    const result = await this.recruitmentService.updateClearanceStatus(
      new Types.ObjectId(terminationId),
      department,
      body.status,
      new Types.ObjectId(body.approvedBy),
      body.comments,
    );
    return result;
  }

  @Get("terminations/:terminationId/clearance/status")
  async getFullClearanceStatus(
    @Param("terminationId") terminationId: string,
  ): Promise<any> {
    const result = await this.recruitmentService.getFullClearanceStatus(
      new Types.ObjectId(terminationId),
    );
    return result;
  }

  @Get("clearances/pending")
  async getPendingClearances(): Promise<any> {
    const result = await this.recruitmentService.getPendingClearances();
    return result;
  }

  @Get("clearances/fully-cleared")
  async getFullyClearedTerminations(): Promise<any> {
    const result = await this.recruitmentService.getFullyClearedTerminations();
    return result;
  }

  @Get("terminations/:terminationId/clearance/is-cleared")
  async isEmployeeFullyCleared(
    @Param("terminationId") terminationId: string,
  ): Promise<{ isCleared: boolean }> {
    const isCleared = await this.recruitmentService.isEmployeeFullyCleared(
      new Types.ObjectId(terminationId),
    );
    return { isCleared };
  }

  @Post("terminations/:terminationId/send-offboarding-notification")
  async sendOffboardingNotification(
    @Param("terminationId") terminationId: string,
    @Body()
    body: {
      notificationType?: string;
      recipientDepartments?: string[];
    },
  ): Promise<any> {
    const hrManagerId = new Types.ObjectId();
    const result = await this.recruitmentService.sendOffboardingNotification(
      new Types.ObjectId(terminationId),
      body,
      hrManagerId,
    );
    return result;
  }

  @Get("terminations/:terminationId/final-pay-calculation")
  async calculateFinalPay(
    @Param("terminationId") terminationId: string,
  ): Promise<any> {
    const result = await this.recruitmentService.calculateFinalPay(
      new Types.ObjectId(terminationId),
      new Date(),
    );
    return result;
  }

  @Get("employees/:employeeId/leave-balance")
  async getLeaveBalance(@Param("employeeId") employeeId: string): Promise<any> {
    const result = await this.recruitmentService.getLeaveBalance(
      new Types.ObjectId(employeeId),
    );
    return result;
  }

  @Get("employees/:employeeId/benefits")
  async getEmployeeBenefits(
    @Param("employeeId") employeeId: string,
  ): Promise<any> {
    const result = await this.recruitmentService.getEmployeeBenefits(
      new Types.ObjectId(employeeId),
    );
    return result;
  }

  @Post("terminations/:terminationId/trigger-benefits-termination")
  async triggerBenefitsTermination(
    @Param("terminationId") terminationId: string,
    @Body() body: { terminationDate: string },
  ): Promise<any> {
    const result = await this.recruitmentService.triggerBenefitsTermination(
      new Types.ObjectId(terminationId),
      new Date(body.terminationDate),
    );
    return result;
  }

  @Get("terminations/:terminationId/offboarding-notification-history")
  async getOffboardingNotificationHistory(
    @Param("terminationId") terminationId: string,
  ): Promise<any> {
    const result =
      await this.recruitmentService.getOffboardingNotificationHistory(
        new Types.ObjectId(terminationId),
      );
    return result;
  }

  @Post("resignations/submit")
  async submitResignationRequest(
    @Body()
    body: {
      employeeId: string;
      resignationReason: string;
      lastWorkingDay?: string;
      noticePeriodinDays?: number;
      additionalComments?: string;
      attachments?: string[];
    },
  ): Promise<any> {
    const result = await this.recruitmentService.submitResignationRequest(
      new Types.ObjectId(body.employeeId),
      {
        resignationReason: body.resignationReason,
        lastWorkingDay: body.lastWorkingDay
          ? new Date(body.lastWorkingDay)
          : undefined,
        noticePeriodinDays: body.noticePeriodinDays,
        additionalComments: body.additionalComments,
        attachments: body.attachments,
      },
    );
    return result;
  }

  @Get("resignations/:resignationId/status")
  async getResignationStatus(
    @Param("resignationId") resignationId: string,
  ): Promise<any> {
    const result = await this.recruitmentService.getResignationStatus(
      new Types.ObjectId(resignationId),
    );
    return result;
  }

  @Get("resignations/:resignationId/track")
  async trackResignationRequest(
    @Param("resignationId") resignationId: string,
  ): Promise<any> {
    const result = await this.recruitmentService.trackResignationRequest(
      new Types.ObjectId(resignationId),
    );
    return result;
  }

  @Get("resignations/:resignationId/history")
  async getResignationHistory(
    @Param("resignationId") resignationId: string,
  ): Promise<any> {
    const result = await this.recruitmentService.getResignationHistory(
      new Types.ObjectId(resignationId),
    );
    return result;
  }

  @Put("resignations/:resignationId/status")
  async updateResignationStatus(
    @Param("resignationId") resignationId: string,
    @Body()
    body: {
      status: string;
      comments?: string;
      updatedBy?: string;
    },
  ): Promise<any> {
    const result = await this.recruitmentService.updateResignationStatus(
      new Types.ObjectId(resignationId),
      body.status,
      body.comments,
      body.updatedBy ? new Types.ObjectId(body.updatedBy) : undefined,
    );
    return result;
  }

  @Get("employees/:employeeId/resignations")
  async getEmployeeResignations(
    @Param("employeeId") employeeId: string,
  ): Promise<any> {
    const result = await this.recruitmentService.getEmployeeResignations(
      new Types.ObjectId(employeeId),
    );
    return result;
  }

  private mapToTerminationResponseDto(
    terminationRequest: any,
  ): TerminationReviewResponseDto {
    return {
      _id: terminationRequest._id.toString(),
      employeeId: terminationRequest.employeeId.toString(),
      reason: terminationRequest.reason as string,
      status: terminationRequest.status as string,
      initiator: terminationRequest.initiator as string,
      createdAt: terminationRequest.createdAt as Date,
      updatedAt: terminationRequest.updatedAt as Date,
    };
  }

  private mapOffboardingToResponseDto(
    checklist: any,
  ): OffboardingChecklistResponseDto {
    return {
      _id: checklist._id.toString(),
      terminationId: checklist.terminationId.toString(),
      items: (checklist.items as any[]) || [],
      equipmentList: (checklist.equipmentList as any[]) || [],
      cardReturned: (checklist.cardReturned as boolean) || false,
      createdAt: checklist.createdAt as Date,
      updatedAt: checklist.updatedAt as Date,
    };
  }
}
