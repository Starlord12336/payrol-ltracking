import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { JobTemplate, JobTemplateDocument } from './models/job-template.schema';
import {
  Position,
  PositionDocument,
} from '../organization-structure/models/position.schema';
import {
  Department,
  DepartmentDocument,
} from '../organization-structure/models/department.schema';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { Application, ApplicationDocument } from './models/application.schema';
import {
  ApplicationStatusHistory,
  ApplicationStatusHistoryDocument,
} from './models/application-history.schema';
import { ApplicationStatus } from './enums/application-status.enum';
import {
  JobRequisition,
  JobRequisitionDocument,
} from './models/job-requisition.schema';
import {
  Document as DocModel,
  DocumentDocument,
} from './models/document.schema';
import { DocumentType } from './enums/document-type.enum';
import {
  Candidate,
  CandidateDocument,
} from '../employee-profile/models/candidate.schema';
import * as fs from 'fs';
import * as path from 'path';
import { promises as fsp } from 'fs';
import { Interview, InterviewDocument } from './models/interview.schema';
import { Referral, ReferralDocument } from './models/referral.schema';
import { Offer, OfferDocument } from './models/offer.schema';
import { InterviewMethod } from './enums/interview-method.enum';
import { InterviewStatus } from './enums/interview-status.enum';
import { Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { Onboarding, OnboardingDocument } from './models/onboarding.schema';
import { Contract, ContractDocument } from './models/contract.schema';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole } from '../employee-profile/models/employee-system-role.schema';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { NotificationLog } from '../time-management/models/notification-log.schema';
import {
  EmployeeStatus,
  ContractType,
} from '../employee-profile/enums/employee-profile.enums';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UploadOnboardingDocumentDto } from './dto/upload-onboarding-document.dto';
import {
  CreateOnboardingTaskDto,
  UpdateTaskStatusDto,
} from './dto/onboarding-task.dto';
import { CreateProvisionDto } from './dto/create-provision.dto';
import { ApproveProvisionDto } from './dto/approve-provision.dto';
import { RejectProvisionDto } from './dto/reject-provision.dto';
import { CreateAccessDto } from './dto/create-access.dto';
import { ApproveAccessDto } from './dto/approve-access.dto';
import { RevokeAccessDto } from './dto/revoke-access.dto';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { AssignEquipmentDto } from './dto/assign-equipment.dto';
import { ReturnEquipmentDto } from './dto/return-equipment.dto';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { TriggerPayrollDto } from './dto/trigger-payroll.dto';
import { CreateBenefitsDto } from './dto/create-benefits.dto';
import { ApproveBenefitsDto } from './dto/approve-benefits.dto';
import { OnboardingTaskStatus } from './enums/onboarding-task-status.enum';
import {
  TerminationRequest,
  TerminationRequestDocument,
} from './models/termination-request.schema';
import {
  ClearanceChecklist,
  ClearanceChecklistDocument,
} from './models/clearance-checklist.schema';
import { TerminationInitiation } from './enums/termination-initiation.enum';
import { TerminationStatus } from './enums/termination-status.enum';
import { ApprovalStatus } from './enums/approval-status.enum';
import {
  InitiateTerminationReviewDto,
  PerformanceDataForReviewDto,
} from './dto/initiate-termination-review.dto';
import {
  CreateOffboardingChecklistDto,
  UpdateOffboardingChecklistDto,
  OffboardingChecklistResponseDto,
  OffboardingChecklistSummaryDto,
} from './dto/offboarding-checklist.dto';

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);
  private cvBucket: GridFSBucket;

  constructor(
    @InjectModel(JobTemplate.name)
    private jobTemplateModel: Model<JobTemplateDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(JobRequisition.name)
    private jobRequisitionModel: Model<JobRequisitionDocument>,
    @InjectModel(DocModel.name)
    private documentModel: Model<DocumentDocument>,
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(ApplicationStatusHistory.name)
    private applicationHistoryModel: Model<ApplicationStatusHistoryDocument>,
    @InjectModel(Interview.name)
    private interviewModel: Model<InterviewDocument>,
    @InjectModel(Referral.name)
    private referralModel: Model<ReferralDocument>,
    @InjectModel(Offer.name)
    private offerModel: Model<OfferDocument>,
    @InjectModel('AssessmentResult')
    private assessmentResultModel: Model<any>,
    @InjectModel(Onboarding.name)
    private onboardingModel: Model<OnboardingDocument>,
    @InjectModel(Contract.name)
    private contractModel: Model<ContractDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<any>,
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<any>,
    @InjectModel(EmployeeSystemRole.name)
    private employeeSystemRoleModel: Model<any>,
    @InjectModel(TerminationRequest.name)
    private terminationRequestModel: Model<TerminationRequestDocument>,
    @InjectModel(ClearanceChecklist.name)
    private clearanceChecklistModel: Model<ClearanceChecklistDocument>,
    @InjectConnection() private connection: Connection,
  ) {
    // Initialize GridFS bucket for CVs
    // This creates collections: cvs.files and cvs.chunks
    this.cvBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'cvs',
    });
  }

  private templatesDir = path.join(
    process.cwd(),
    'data',
    'hiring-process-templates',
  );
  private assessmentFormsDir = path.join(
    process.cwd(),
    'data',
    'assessment-forms',
  );
  private assessmentResponsesDir = path.join(
    process.cwd(),
    'data',
    'assessment-responses',
  );
  private panelMembersDir = path.join(process.cwd(), 'data', 'panel-members');
  private panelAvailabilityDir = path.join(
    process.cwd(),
    'data',
    'panel-availability',
  );
  private consentsDir = path.join(process.cwd(), 'data', 'consents');

  private async ensureTemplatesDir() {
    await fsp.mkdir(this.templatesDir, { recursive: true });
  }

  private templatePath(key: string) {
    return path.join(this.templatesDir, `${key}.json`);
  }

  private assessmentFormPath(key: string) {
    return path.join(this.assessmentFormsDir, `${key}.json`);
  }

  private assessmentResponsePath(interviewId: string, fileName: string) {
    return path.join(
      this.assessmentResponsesDir,
      String(interviewId),
      fileName,
    );
  }

  private panelMemberPath(panelMemberId: string) {
    return path.join(this.panelMembersDir, `${panelMemberId}.json`);
  }

  private panelAvailabilityPath(panelMemberId: string) {
    return path.join(this.panelAvailabilityDir, `${panelMemberId}.json`);
  }

  private consentPath(candidateId: string, fileName: string) {
    return path.join(this.consentsDir, String(candidateId), fileName);
  }

  async saveProcessTemplate(
    key: string,
    payload: { name: string; stages: string[] },
  ) {
    await this.ensureTemplatesDir();
    const file = this.templatePath(key);
    await fsp.writeFile(file, JSON.stringify(payload, null, 2));
    return payload;
  }

  async readProcessTemplate(key: string) {
    const file = this.templatePath(key);
    try {
      const txt = await fsp.readFile(file, 'utf8');
      return JSON.parse(txt) as { name: string; stages: string[] };
    } catch (err) {
      return null;
    }
  }

  async listProcessTemplates() {
    await this.ensureTemplatesDir();
    const files = await fsp.readdir(this.templatesDir);
    const result: Array<{ key: string; name: string; stages: string[] }> = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const key = f.replace(/\.json$/, '');
      const t = await this.readProcessTemplate(key);
      if (t) result.push({ key, name: t.name, stages: t.stages });
    }
    return result;
  }

  async deleteProcessTemplate(key: string) {
    const file = this.templatePath(key);
    try {
      await fsp.unlink(file);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Assessment form templates (file-backed, per-role). No DB schema changes.
  private async ensureAssessmentFormsDir() {
    await fsp.mkdir(this.assessmentFormsDir, { recursive: true });
  }

  private async ensureAssessmentResponsesDir() {
    await fsp.mkdir(this.assessmentResponsesDir, { recursive: true });
  }

  async saveAssessmentForm(
    key: string,
    payload: {
      name: string;
      role?: string;
      positionCode?: string;
      criteria: Array<{ key: string; label: string; weight?: number }>;
    },
  ) {
    await this.ensureAssessmentFormsDir();
    const file = this.assessmentFormPath(key);
    await fsp.writeFile(file, JSON.stringify(payload, null, 2));
    return payload;
  }

  async readAssessmentForm(key: string) {
    const file = this.assessmentFormPath(key);
    try {
      const txt = await fsp.readFile(file, 'utf8');
      return JSON.parse(txt) as {
        name: string;
        role?: string;
        positionCode?: string;
        criteria: Array<{ key: string; label: string; weight?: number }>;
      };
    } catch (err) {
      return null;
    }
  }

  async listAssessmentForms() {
    await this.ensureAssessmentFormsDir();
    const files = await fsp.readdir(this.assessmentFormsDir);
    const result: Array<{
      key: string;
      name: string;
      role?: string;
      criteriaCount: number;
    }> = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const key = f.replace(/\.json$/, '');
      const t = await this.readAssessmentForm(key);
      if (t)
        result.push({
          key,
          name: t.name,
          role: t.role,
          criteriaCount: t.criteria?.length ?? 0,
        });
    }
    return result;
  }

  async deleteAssessmentForm(key: string) {
    const file = this.assessmentFormPath(key);
    try {
      await fsp.unlink(file);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Submit structured assessment responses: store full responses to disk and save computed score to AssessmentResult (no schema change)
  async submitStructuredAssessment(
    interviewId: string,
    interviewerId: string,
    formKey: string,
    responses: Record<string, number>,
    comments?: string,
  ) {
    const interview = await this.interviewModel.findById(interviewId).exec();
    if (!interview) throw new NotFoundException('Interview not found');

    const form = await this.readAssessmentForm(formKey);
    if (!form) throw new NotFoundException('Assessment form not found');

    // compute weighted average if weights provided, otherwise simple average
    let totalWeight = 0;
    let weightedSum = 0;
    let count = 0;
    for (const c of form.criteria || []) {
      const val = Number(responses[c.key] ?? 0);
      const w = c.weight ?? 1;
      weightedSum += val * w;
      totalWeight += w;
      count += 1;
    }
    const avg =
      count === 0
        ? null
        : Math.round((weightedSum / (totalWeight || count)) * 100) / 100;

    // ensure responses dir for this interview
    await this.ensureAssessmentResponsesDir();
    const interviewDir = path.join(
      this.assessmentResponsesDir,
      String(interview._id),
    );
    await fsp.mkdir(interviewDir, { recursive: true });
    const ts = Date.now();
    const fileName = `${ts}-${String(interviewerId)}.json`;
    const filePath = path.join(interviewDir, fileName);
    const payload = {
      interviewId: String(interview._id),
      interviewerId,
      formKey,
      formDefinition: form,
      responses,
      computedScore: avg,
      comments,
      submittedAt: new Date().toISOString(),
    };
    await fsp.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

    // create AssessmentResult using existing schema: store average score and a short comment with file reference
    const created = await this.assessmentResultModel.create({
      interviewId: interview._id,
      interviewerId,
      score: avg,
      comments: `structured-response-file:${path.relative(process.cwd(), filePath)}${comments ? ' | ' + comments : ''}`,
    });

    // record history
    await this.applicationHistoryModel.create({
      applicationId: interview.applicationId,
      oldStage: `Interview: ${interview.stage}`,
      newStage: `Structured Feedback Submitted`,
      oldStatus: null,
      newStatus: null,
      changedBy: interviewerId,
    });

    // prepare notification payload
    const notification = {
      interviewId: String(interview._id),
      applicationId: String(interview.applicationId),
      formKey,
      responsesFile: path.relative(process.cwd(), filePath),
      computedScore: avg,
      submittedAt: payload.submittedAt,
    };

    return { created, notification };
  }

  async listStructuredResponses(interviewId: string) {
    const dir = path.join(this.assessmentResponsesDir, String(interviewId));
    try {
      const files = await fsp.readdir(dir);
      const out: Array<{
        file: string;
        path: string;
        summary?: {
          interviewerId?: string;
          computedScore?: number;
          submittedAt?: string;
        };
      }> = [];
      for (const f of files) {
        if (!f.endsWith('.json')) continue;
        const p = path.join(dir, f);
        try {
          const txt = await fsp.readFile(p, 'utf8');
          const obj = JSON.parse(txt);
          out.push({
            file: f,
            path: path.relative(process.cwd(), p),
            summary: {
              interviewerId: obj.interviewerId,
              computedScore: obj.computedScore,
              submittedAt: obj.submittedAt,
            },
          });
        } catch (e) {
          out.push({ file: f, path: path.relative(process.cwd(), p) });
        }
      }
      return out;
    } catch (err) {
      return [];
    }
  }

  async getStructuredResponse(interviewId: string, fileName: string) {
    const p = this.assessmentResponsePath(interviewId, fileName);
    try {
      const txt = await fsp.readFile(p, 'utf8');
      return JSON.parse(txt);
    } catch (err) {
      throw new NotFoundException('Response file not found');
    }
  }

  // Referral handling (no schema changes)
  async createReferral(
    referringEmployeeId: string,
    candidateId: string,
    opts?: { role?: string; level?: string },
  ) {
    // validate candidate exists
    const candidate = await this.candidateModel
      .findById(candidateId)
      .lean()
      .exec();
    if (!candidate) throw new NotFoundException('Candidate not found');

    const created = await this.referralModel.create({
      referringEmployeeId,
      candidateId,
      role: opts?.role || null,
      level: opts?.level || null,
    });

    // record history on application(s) if any exist for this candidate
    const apps = await this.applicationModel.find({ candidateId }).exec();
    for (const a of apps) {
      await this.applicationHistoryModel.create({
        applicationId: a._id,
        oldStage: null,
        newStage: 'Referral Tagged',
        oldStatus: a.status ?? null,
        newStatus: a.status ?? null,
        changedBy: referringEmployeeId,
      });
    }

    return created;
  }

  async getReferralsForCandidate(candidateId: string) {
    return this.referralModel.find({ candidateId }).lean().exec();
  }

  async listReferrals() {
    return this.referralModel.find().lean().exec();
  }

  async getReferralById(id: string) {
    return this.referralModel.findById(id).lean().exec();
  }

  // Prioritize an application if the candidate is a referral. If `expedite` is true we optionally move stage forward.
  async prioritizeApplication(
    applicationId: string,
    opts?: { changedBy?: string; expedite?: boolean; expediteToStage?: string },
  ) {
    const app = await this.applicationModel.findById(applicationId).exec();
    if (!app) throw new NotFoundException('Application not found');
    const referrals = await this.getReferralsForCandidate(
      String(app.candidateId),
    );
    const isReferred = referrals && referrals.length > 0;

    const payload: any = {
      applicationId: String(app._id),
      isReferred,
      referralsCount: referrals.length,
    };
    if (!isReferred) return payload;

    const primary = referrals[0];
    payload.primaryReferral = primary;

    if (opts?.expedite) {
      // Decide target stage: user-specified or default to 'Interview'
      const target = opts.expediteToStage || 'Interview';
      await this.applicationHistoryModel.create({
        applicationId: app._id,
        oldStage: null,
        newStage: `Priority Expedited: ${target}`,
        oldStatus: app.status ?? null,
        newStatus: app.status ?? null,
        changedBy: opts?.changedBy || primary.referringEmployeeId || null,
      });
      // Optionally advance if target provided — call existing advanceApplicationStage with newStage
      await this.advanceApplicationStage(String(app._id), {
        newStage: target,
        changedBy: opts?.changedBy || String(primary.referringEmployeeId),
      });
      payload.expeditedTo = target;
    }

    return payload;
  }

  // REC-028: Candidate consent logging (file-backed, no schema changes)
  private async ensureConsentsDir() {
    await fsp.mkdir(this.consentsDir, { recursive: true });
  }

  async saveConsent(
    candidateId: string,
    granted: boolean,
    type = 'personal',
    givenBy?: string,
    details?: string,
  ) {
    await this.ensureConsentsDir();
    const candidateDir = path.join(this.consentsDir, String(candidateId));
    await fsp.mkdir(candidateDir, { recursive: true });
    const ts = Date.now();
    const fileName = `${ts}-${granted ? 'granted' : 'revoked'}.json`;
    const filePath = path.join(candidateDir, fileName);
    const payload = {
      candidateId: String(candidateId),
      granted,
      type,
      givenBy: givenBy || null,
      details: details || null,
      consentedAt: new Date().toISOString(),
    };
    await fsp.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

    // audit: record history for any existing applications of this candidate
    const apps = await this.applicationModel.find({ candidateId }).exec();
    for (const a of apps) {
      await this.applicationHistoryModel.create({
        applicationId: a._id,
        oldStage: null,
        newStage: granted ? 'Consent Granted' : 'Consent Revoked',
        oldStatus: a.status ?? null,
        newStatus: a.status ?? null,
        changedBy: givenBy || null,
      });
    }

    return { file: path.relative(process.cwd(), filePath), payload };
  }

  async listConsents(candidateId: string) {
    const dir = path.join(this.consentsDir, String(candidateId));
    try {
      const files = await fsp.readdir(dir);
      const out: Array<{ file: string; path: string; data?: any }> = [];
      for (const f of files) {
        if (!f.endsWith('.json')) continue;
        const p = path.join(dir, f);
        try {
          const txt = await fsp.readFile(p, 'utf8');
          out.push({
            file: f,
            path: path.relative(process.cwd(), p),
            data: JSON.parse(txt),
          });
        } catch (e) {
          out.push({ file: f, path: path.relative(process.cwd(), p) });
        }
      }
      return out;
    } catch (err) {
      return [];
    }
  }

  async getLatestConsent(candidateId: string) {
    const list = await this.listConsents(candidateId);
    if (!list || !list.length) return null;
    list.sort((a, b) => b.file.localeCompare(a.file));
    return list[0];
  }

  async getConsentFile(candidateId: string, fileName: string) {
    const p = this.consentPath(candidateId, fileName);
    try {
      const txt = await fsp.readFile(p, 'utf8');
      return JSON.parse(txt);
    } catch (err) {
      throw new NotFoundException('Consent file not found');
    }
  }

  async createJobTemplate(dto: CreateJobTemplateDto) {
    let title = dto.title;
    let department = dto.department;

    if (dto.positionCode) {
      const position = await this.positionModel
        .findOne({ code: dto.positionCode })
        .lean()
        .exec();
      if (!position) {
        throw new NotFoundException('Position not found');
      }
      title = position.title;

      if (position.departmentId) {
        const dept = await this.departmentModel
          .findById(position.departmentId)
          .lean()
          .exec();
        if (dept) {
          department = dept.name;
        } else {
          department = position.departmentId.toString();
        }
      }
    }

    const created = await this.jobTemplateModel.create({
      title,
      department,
      qualifications: dto.qualifications || [],
      skills: dto.skills || [],
      description: dto.description,
    });

    return created;
  }

  async findAllJobTemplates() {
    return this.jobTemplateModel.find().lean().exec();
  }

  async findJobTemplateById(id: string) {
    return this.jobTemplateModel.findById(id).exec();
  }

  // Create a job requisition from a template (or without template)
  async createJobRequisition(dto: CreateJobRequisitionDto, hiringManagerId: string) {
    // Validate template exists if provided
    if (dto.templateId) {
      const template = await this.jobTemplateModel
        .findById(dto.templateId)
        .lean()
        .exec();
      if (!template) {
        throw new NotFoundException('Job template not found');
      }
    }

    // Generate requisition ID if not provided
    let requisitionId = dto.requisitionId;
    if (!requisitionId) {
      const year = new Date().getFullYear();
      const prefix = `REQ-${year}-`;
      const latest = await this.jobRequisitionModel
        .findOne({ requisitionId: new RegExp(`^${prefix}`) })
        .sort({ requisitionId: -1 })
        .exec();
      
      let sequence = 1;
      if (latest && latest.requisitionId) {
        const lastSequence = parseInt(
          latest.requisitionId.split('-').pop() || '0',
          10,
        );
        sequence = lastSequence + 1;
      }
      requisitionId = `${prefix}${sequence.toString().padStart(4, '0')}`;
    }

    // Check if requisition ID already exists
    const existing = await this.jobRequisitionModel
      .findOne({ requisitionId })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Job requisition with ID '${requisitionId}' already exists`,
      );
    }

    const requisition = await this.jobRequisitionModel.create({
      requisitionId,
      templateId: dto.templateId ? new Types.ObjectId(dto.templateId) : undefined,
      openings: dto.openings,
      location: dto.location,
      hiringManagerId: new Types.ObjectId(hiringManagerId),
      publishStatus: 'draft', // Always start as draft
    });

    return requisition;
  }

  // Preview a job requisition assembled with employer-brand content
  async previewJobRequisition(requisitionId: string) {
    // Support both MongoDB _id and requisitionId string
    let requisition;
    if (Types.ObjectId.isValid(requisitionId) && requisitionId.length === 24) {
      // Valid MongoDB ObjectId - use findById
      requisition = await this.jobRequisitionModel
        .findById(new Types.ObjectId(requisitionId))
        .lean()
        .exec();
    } else {
      // Not a valid ObjectId - search by requisitionId field
      requisition = await this.jobRequisitionModel
        .findOne({ requisitionId: requisitionId })
        .lean()
        .exec();
    }
    if (!requisition) throw new NotFoundException('Job requisition not found');

    let template: any = null;
    if (requisition.templateId) {
      template = await this.jobTemplateModel
        .findById(requisition.templateId)
        .lean()
        .exec();
    }

    // Employer-brand content (no schema changes) — use env or sensible defaults
    const brand = {
      companyName: process.env.COMPANY_NAME || 'Your Company',
      logoUrl: process.env.COMPANY_LOGO_URL || null,
      agencyTagline:
        process.env.COMPANY_TAGLINE || 'Join our team and make an impact.',
    };

    const preview = {
      requisitionId: requisition.requisitionId || requisition._id,
      title: template?.title || '',
      department: template?.department || null,
      location: requisition.location || null,
      openings: requisition.openings || 0,
      qualifications: template?.qualifications || [],
      skills: template?.skills || [],
      description: template?.description || null,
      postingDate: requisition.postingDate || null,
      expiryDate: requisition.expiryDate || null,
      brand,
    };

    return preview;
  }

  // Publish a job requisition — sets publishStatus and posting/expiry dates
  async publishJobRequisition(
    requisitionId: string,
    opts?: { expiryDays?: number },
  ) {
    // Support both MongoDB _id and requisitionId string
    let requisition;
    if (Types.ObjectId.isValid(requisitionId) && requisitionId.length === 24) {
      // Valid MongoDB ObjectId - use findById
      requisition = await this.jobRequisitionModel
        .findById(new Types.ObjectId(requisitionId))
        .exec();
    } else {
      // Not a valid ObjectId - search by requisitionId field
      requisition = await this.jobRequisitionModel
        .findOne({ requisitionId: requisitionId })
        .exec();
    }
    if (!requisition) throw new NotFoundException('Job requisition not found');

    requisition.publishStatus = 'published';
    if (!requisition.postingDate) requisition.postingDate = new Date();
    if (!requisition.expiryDate) {
      const days = opts?.expiryDays ?? 30;
      const expiry = new Date(requisition.postingDate);
      expiry.setDate(expiry.getDate() + days);
      requisition.expiryDate = expiry;
    }

    await requisition.save();
    return requisition;
  }

  // Store uploaded CV document for a candidate using GridFS (no schema changes)
  // GridFS file ID is stored in the existing filePath field as a string
  async uploadCandidateCV(
    candidateId: string,
    file: any, // Express.Multer.File - file buffer from memory storage
  ) {
    // validate candidate exists
    const candidate = await this.candidateModel
      .findById(candidateId)
      .lean()
      .exec();
    if (!candidate) throw new NotFoundException('Candidate not found');

    // Upload file to GridFS
    const filename = `${candidateId}-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    // Create upload stream
    const uploadStream = this.cvBucket.openUploadStream(filename, {
      metadata: {
        candidateId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      },
    });

    // Convert buffer to readable stream
    const readableStream = new Readable();
    readableStream.push(file.buffer);
    readableStream.push(null); // End the stream

    const { fileId } = await new Promise<{ fileId: string; filename: string }>(
      (resolve, reject) => {
        readableStream
          .pipe(uploadStream)
          .on('finish', () => {
            resolve({
              fileId: uploadStream.id.toString(),
              filename,
            });
          })
          .on('error', (error) => {
            reject(error);
          });
      },
    );

    // Store GridFS file ID in filePath field (no schema change needed)
    const doc = await this.documentModel.create({
      ownerId: candidateId,
      type: DocumentType.CV,
      filePath: fileId, // Store GridFS file ID as string in existing filePath field
      uploadedAt: new Date(),
    });

    return {
      ...doc.toObject(),
      filename, // Include filename in response
    };
  }

  /**
   * Get CV file stream from GridFS
   * @param documentId - The document ID
   * @returns File stream and metadata
   */
  async getCVFile(documentId: string) {
    const doc = await this.documentModel.findById(documentId).exec();
    if (!doc) throw new NotFoundException('Document not found');
    
    // Check if filePath is a GridFS file ID (24 hex characters = ObjectId)
    if (!this.isGridFSFile(doc.filePath)) {
      throw new NotFoundException('CV file not found in GridFS');
    }

    const fileMetadata = await this.getGridFSFileMetadata(doc.filePath);
    if (!fileMetadata) throw new NotFoundException('CV file not found');

    const fileStream = this.downloadCVFromGridFS(doc.filePath);

    return {
      stream: fileStream,
      metadata: fileMetadata,
      document: doc,
    };
  }

  /**
   * Download a CV file from GridFS
   * @param fileId - The GridFS file ID (as string from filePath)
   * @returns Readable stream of the file
   */
  private downloadCVFromGridFS(fileId: string): Readable {
    const objectId = new Types.ObjectId(fileId);
    return this.cvBucket.openDownloadStream(objectId);
  }

  /**
   * Get file metadata from GridFS
   * @param fileId - The GridFS file ID (as string)
   * @returns File metadata
   */
  private async getGridFSFileMetadata(fileId: string): Promise<any | null> {
    const objectId = new Types.ObjectId(fileId);
    const files = await this.cvBucket.find({ _id: objectId }).toArray();
    return files.length > 0 ? files[0] : null;
  }

  /**
   * Check if filePath is a GridFS ID (ObjectId format)
   */
  private isGridFSFile(filePath: string): boolean {
    // GridFS file IDs are MongoDB ObjectIds (24 hex characters)
    return /^[0-9a-fA-F]{24}$/.test(filePath);
  }

  // Candidate applies to a job requisition. Optionally include a documentId (CV) previously uploaded.
  async applyToRequisition(
    candidateId: string,
    requisitionId: string,
    opts?: { documentId?: string },
  ) {
    // validate candidate and requisition
    const candidate = await this.candidateModel
      .findById(candidateId)
      .lean()
      .exec();
    if (!candidate) throw new NotFoundException('Candidate not found');

    const requisition = await this.jobRequisitionModel
      .findById(requisitionId)
      .exec();
    if (!requisition) throw new NotFoundException('Job requisition not found');

    const application = await this.applicationModel.create({
      candidateId,
      requisitionId,
    });

    // record initial history entry
    await this.applicationHistoryModel.create({
      applicationId: application._id,
      oldStage: null,
      newStage: 'Screening',
      oldStatus: null,
      newStatus: application.status ?? null,
      changedBy: candidateId,
    });

    return { application, attachedDocumentId: opts?.documentId ?? null };
  }

  // Advance an application's stage using a default hiring process template
  // This does not change any DB schema — templates are internal defaults.
  async advanceApplicationStage(
    applicationId: string,
    opts?: { newStage?: string; changedBy?: string; templateKey?: string },
  ) {
    let defaultStages = [
      'Screening',
      'Shortlisting',
      'Interview',
      'Offer',
      'Hired',
    ];
    if (opts?.templateKey) {
      const tpl = await this.readProcessTemplate(opts.templateKey);
      if (tpl?.stages && tpl.stages.length) {
        defaultStages = tpl.stages;
      }
    }

    const application = await this.applicationModel
      .findById(applicationId)
      .exec();
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // determine last known stage from history
    const lastHistory = await this.applicationHistoryModel
      .findOne({ applicationId: application._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const lastStageName =
      opts?.newStage ??
      lastHistory?.newStage ??
      mapStageEnumToName(application.currentStage);

    let nextStageName: string;
    if (opts?.newStage) {
      nextStageName = opts.newStage;
    } else if (!lastStageName) {
      nextStageName = defaultStages[0];
    } else {
      const idx = defaultStages.indexOf(lastStageName);
      if (idx === -1) {
        nextStageName = defaultStages[0];
      } else if (idx + 1 < defaultStages.length) {
        nextStageName = defaultStages[idx + 1];
      } else {
        nextStageName = defaultStages[defaultStages.length - 1];
      }
    }

    // prepare changedBy: prefer provided, then assignedHr, otherwise fallback to application._id
    const changedBy =
      opts?.changedBy || (application as any).assignedHr || application._id;

    // record history (history fields are free-form strings, schema unchanged)
    await this.applicationHistoryModel.create({
      applicationId: application._id,
      oldStage: lastHistory?.newStage ?? null,
      newStage: nextStageName,
      oldStatus: application.status ?? null,
      newStatus: application.status ?? null,
      changedBy,
    });

    // If final stage 'Hired', update application.status to HIRED
    const isHired =
      typeof nextStageName === 'string' &&
      nextStageName.toLowerCase() === 'hired';
    if (isHired) {
      application.status = ApplicationStatus.HIRED;
      await application.save();
    }

    // compute progress
    const total = defaultStages.length;
    const pos = Math.max(0, defaultStages.indexOf(nextStageName));
    const progress = Math.round(((pos + 1) / total) * 100);

    return {
      applicationId: application._id,
      newStage: nextStageName,
      progress,
    };
  }

  // Get current status and progress for an application
  async getApplicationStatus(applicationId: string) {
    const defaultStages = [
      'Screening',
      'Shortlisting',
      'Interview',
      'Offer',
      'Hired',
    ];
    const application = await this.applicationModel
      .findById(applicationId)
      .lean()
      .exec();
    if (!application) throw new NotFoundException('Application not found');

    const lastHistory = await this.applicationHistoryModel
      .findOne({ applicationId: application._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const currentStageName =
      mapStageEnumToName(application.currentStage) ??
      lastHistory?.newStage ??
      null;
    const stageIndex = currentStageName
      ? Math.max(0, defaultStages.indexOf(currentStageName))
      : -1;
    const progress =
      stageIndex === -1
        ? 0
        : Math.round(((stageIndex + 1) / defaultStages.length) * 100);

    return {
      applicationId: application._id,
      status: application.status,
      currentStage: currentStageName,
      progress,
    };
  }

  // List applications for a candidate
  async listApplicationsForCandidate(candidateId: string) {
    const apps = await this.applicationModel
      .find({ candidateId })
      .lean()
      .exec();
    return apps.map((a) => ({
      id: a._id,
      requisitionId: a.requisitionId,
      currentStage: a.currentStage,
      status: a.status,
    }));
  }

  // Get application status history
  async getApplicationHistory(applicationId: string) {
    return this.applicationHistoryModel
      .find({ applicationId })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }

  // Prepare a notification payload for candidate about their application status
  async prepareCandidateNotification(applicationId: string) {
    const application = await this.applicationModel
      .findById(applicationId)
      .lean()
      .exec();
    if (!application) throw new NotFoundException('Application not found');

    const candidate = await this.candidateModel
      .findById(application.candidateId)
      .lean()
      .exec();
    if (!candidate) throw new NotFoundException('Candidate not found');

    const statusObj = await this.getApplicationStatus(applicationId);

    const message = `Hello ${candidate.fullName || candidate.firstName},\n\nYour application for requisition ${String(application.requisitionId)} is currently at stage: ${statusObj.currentStage || 'N/A'} with status: ${statusObj.status}. Progress: ${statusObj.progress}%\n\nThank you.`;

    return {
      to: candidate.personalEmail || null,
      subject: `Application update for ${String(application.requisitionId)}`,
      body: message,
    };
  }

  // Internal rejection templates — stored in code to avoid schema changes
  private rejectionTemplates: Record<
    string,
    { subject: string; body: string }
  > = {
    default: {
      subject:
        'Application Update from ' +
        (process.env.COMPANY_NAME || 'Our Company'),
      body:
        'Hello {{name}},\n\nThank you for your interest in the role ({{requisitionId}}). After careful consideration, we will not be moving forward with your application at this time. Reason: {{reason}}\n\nWe appreciate your time and wish you the best in your job search.\n\nSincerely,\n' +
        (process.env.COMPANY_NAME || 'The Team'),
    },
    no_experience: {
      subject: 'Update on your application',
      body:
        'Hello {{name}},\n\nWe appreciate your interest. After reviewing your application for {{requisitionId}}, we found that your recent experience does not match the specific requirements for this role. Reason: {{reason}}\n\nThank you for applying.\n' +
        (process.env.COMPANY_NAME || 'The Team'),
    },
  };

  async prepareRejectionNotification(
    applicationId: string,
    opts?: { templateKey?: string; reason?: string },
  ) {
    const application = await this.applicationModel
      .findById(applicationId)
      .lean()
      .exec();
    if (!application) throw new NotFoundException('Application not found');

    const candidate = await this.candidateModel
      .findById(application.candidateId)
      .lean()
      .exec();
    if (!candidate) throw new NotFoundException('Candidate not found');

    const templateKey = opts?.templateKey || 'default';
    const template =
      this.rejectionTemplates[templateKey] || this.rejectionTemplates.default;
    const reason = opts?.reason || 'Not a fit at this time';

    const body = template.body
      .replace('{{name}}', candidate.fullName || candidate.firstName || '')
      .replace('{{requisitionId}}', String(application.requisitionId))
      .replace('{{reason}}', reason);

    const subject = template.subject;

    return {
      to: candidate.personalEmail || null,
      subject,
      body,
    };
  }

  async rejectApplication(
    applicationId: string,
    opts?: { templateKey?: string; reason?: string; changedBy?: string },
  ) {
    const application = await this.applicationModel
      .findById(applicationId)
      .exec();
    if (!application) throw new NotFoundException('Application not found');

    const lastHistory = await this.applicationHistoryModel
      .findOne({ applicationId: application._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const reason = opts?.reason || 'Not a fit at this time';
    const changedBy =
      opts?.changedBy || (application as any).assignedHr || application._id;

    await this.applicationHistoryModel.create({
      applicationId: application._id,
      oldStage: lastHistory?.newStage ?? null,
      newStage: 'Rejected',
      oldStatus: application.status ?? null,
      newStatus: `${ApplicationStatus.REJECTED}${reason ? ' - ' + reason : ''}`,
      changedBy,
    });

    application.status = ApplicationStatus.REJECTED;
    await application.save();

    const payload = await this.prepareRejectionNotification(applicationId, {
      templateKey: opts?.templateKey,
      reason,
    });
    return { applicationId: application._id, notification: payload };
  }

  // Schedule an interview for an application.
  // Accepts either panel user IDs (to store in schema) or panelEmails for invitations.
  async scheduleInterview(
    applicationId: string,
    opts: {
      stage: string;
      scheduledDate: string | Date;
      method?: InterviewMethod | string;
      panelIds?: string[];
      panelEmails?: string[];
      durationMinutes?: number;
      videoLink?: string;
      createdBy?: string;
      templateKey?: string;
    },
  ) {
    const application = await this.applicationModel
      .findById(applicationId)
      .exec();
    if (!application) throw new NotFoundException('Application not found');

    const scheduledDate =
      typeof opts.scheduledDate === 'string'
        ? new Date(opts.scheduledDate)
        : opts.scheduledDate;

    const interview = await this.interviewModel.create({
      applicationId: application._id,
      stage: opts.stage,
      scheduledDate,
      method: opts.method || InterviewMethod.VIDEO,
      panel: opts.panelIds || [],
      videoLink: opts.videoLink,
      status: InterviewStatus.SCHEDULED,
      calendarEventId: undefined,
    });

    // record history entry
    await this.applicationHistoryModel.create({
      applicationId: application._id,
      oldStage: null,
      newStage: `Interview Scheduled: ${opts.stage}`,
      oldStatus: application.status ?? null,
      newStatus: application.status ?? null,
      changedBy:
        opts.createdBy || (application as any).assignedHr || application._id,
    });

    // Prepare invitation payload (not sent) with candidate email and panelEmails if provided
    const candidate = await this.candidateModel
      .findById(application.candidateId)
      .lean()
      .exec();
    const attendees: Array<{ email?: string; name?: string }> = [];
    if (candidate?.personalEmail)
      attendees.push({
        email: candidate.personalEmail,
        name: candidate.fullName || candidate.firstName,
      });
    if (opts.panelEmails)
      for (const e of opts.panelEmails) attendees.push({ email: e });

    const invite = {
      interviewId: interview._id,
      applicationId: application._id,
      stage: opts.stage,
      when: scheduledDate,
      durationMinutes: opts.durationMinutes ?? 60,
      method: opts.method || InterviewMethod.VIDEO,
      videoLink:
        opts.videoLink ||
        (opts.method === InterviewMethod.VIDEO
          ? `https://video.example.com/${String(interview._id)}`
          : undefined),
      attendees,
      description: `Interview for requisition ${String(application.requisitionId)} at stage ${opts.stage}`,
    };

    return { interview, invite };
  }

  // Save feedback (assessment result) for an interview
  async saveAssessmentResult(
    interviewId: string,
    interviewerId: string,
    score: number,
    comments?: string,
  ) {
    const interview = await this.interviewModel.findById(interviewId).exec();
    if (!interview) throw new NotFoundException('Interview not found');

    // create assessment result document (uses existing AssessmentResult schema)
    const created = await this.assessmentResultModel.create({
      interviewId: interview._id,
      interviewerId,
      score,
      comments,
    });

    // record a history entry for the related application
    await this.applicationHistoryModel.create({
      applicationId: interview.applicationId,
      oldStage: `Interview: ${interview.stage}`,
      newStage: `Feedback Submitted`,
      oldStatus: null,
      newStatus: null,
      changedBy: interviewerId,
    });

    // compute aggregate feedback for the interview
    const all = await this.assessmentResultModel
      .find({ interviewId: interview._id })
      .lean()
      .exec();
    const total = all.length;
    const avg = total
      ? Math.round(
          (all.reduce((s: number, r: any) => s + (r.score || 0), 0) / total) *
            100,
        ) / 100
      : null;

    // prepare a lightweight notification payload for time-management / notification system
    const payload = {
      interviewId: String(interview._id),
      applicationId: String(interview.applicationId),
      newFeedback: { interviewerId, score, comments },
      aggregate: {
        averageScore: avg,
        submissions: total,
        panelCount: (interview.panel || []).length,
      },
      when: interview.scheduledDate,
    };

    return { created, aggregate: payload.aggregate, notification: payload };
  }

  async listAssessmentResults(interviewId: string) {
    return this.assessmentResultModel.find({ interviewId }).lean().exec();
  }

  async getInterviewFeedbackSummary(interviewId: string) {
    const interview = await this.interviewModel
      .findById(interviewId)
      .lean()
      .exec();
    if (!interview) throw new NotFoundException('Interview not found');
    const feedbacks = await this.assessmentResultModel
      .find({ interviewId: interview._id })
      .lean()
      .exec();
    const total = feedbacks.length;
    const avg = total
      ? Math.round(
          (feedbacks.reduce((s: number, r: any) => s + (r.score || 0), 0) /
            total) *
            100,
        ) / 100
      : null;
    return {
      interview,
      feedbacks,
      aggregate: {
        averageScore: avg,
        submissions: total,
        panelCount: (interview.panel || []).length,
      },
    };
  }

  // REC-009: Recruitment progress dashboard across open positions (no schema changes)
  async getRecruitmentDashboard() {
    // consider open positions as published requisitions
    const requisitions = await this.jobRequisitionModel
      .find({ publishStatus: 'published' })
      .lean()
      .exec();
    const defaultStages = [
      'Screening',
      'Shortlisting',
      'Interview',
      'Offer',
      'Hired',
    ];

    let totalOpenPositions = 0;
    let totalApplications = 0;
    let totalProgressSum = 0;
    let totalProgressCount = 0;

    const items: Array<any> = [];
    for (const r of requisitions) {
      totalOpenPositions += r.openings || 0;
      // get template title if present
      let template: any = null;
      if (r.templateId)
        template = await this.jobTemplateModel
          .findById(r.templateId)
          .lean()
          .exec();

      const apps = await this.applicationModel
        .find({ requisitionId: r._id })
        .lean()
        .exec();
      const applicationsCount = apps.length;
      totalApplications += applicationsCount;

      const statusCounts: Record<string, number> = {};
      let progressSum = 0;
      let progressCount = 0;
      for (const a of apps) {
        const lastHistory = await this.applicationHistoryModel
          .findOne({ applicationId: a._id })
          .sort({ createdAt: -1 })
          .lean()
          .exec();
        const currentStageName =
          mapStageEnumToName(a.currentStage) ?? lastHistory?.newStage ?? null;
        const stageIndex = currentStageName
          ? Math.max(0, defaultStages.indexOf(currentStageName))
          : -1;
        const progress =
          stageIndex === -1
            ? 0
            : Math.round(((stageIndex + 1) / defaultStages.length) * 100);
        progressSum += progress;
        progressCount += 1;
        statusCounts[a.status || 'UNKNOWN'] =
          (statusCounts[a.status || 'UNKNOWN'] || 0) + 1;
      }

      const avgProgress =
        progressCount === 0
          ? 0
          : Math.round((progressSum / progressCount) * 100) / 100;
      totalProgressSum += progressSum;
      totalProgressCount += progressCount;

      items.push({
        requisitionId: r.requisitionId || r._id,
        title: template?.title || 'Untitled',
        department: template?.department || null,
        location: r.location || null,
        openings: r.openings || 0,
        applicationsCount,
        statusCounts,
        averageProgress: avgProgress,
        postingDate: r.postingDate || null,
        expiryDate: r.expiryDate || null,
      });
    }

    const overallAvgProgress =
      totalProgressCount === 0
        ? 0
        : Math.round((totalProgressSum / totalProgressCount) * 100) / 100;

    return {
      totalOpenRequisitions: requisitions.length,
      totalOpenPositions,
      totalApplications,
      overallAverageProgress: overallAvgProgress,
      items,
    };
  }

  // Offer management and approvals (REC-014) — reuse existing Offer schema, no DB schema changes
  async createOffer(payload: {
    applicationId: string;
    candidateId: string;
    hrEmployeeId?: string;
    grossSalary: number;
    signingBonus?: number;
    benefits?: string[];
    conditions?: string;
    insurances?: string;
    content?: string;
    role?: string;
    deadline?: string | Date;
  }) {
    const app = await this.applicationModel
      .findById(payload.applicationId)
      .exec();
    if (!app) throw new NotFoundException('Application not found');
    const candidate = await this.candidateModel
      .findById(payload.candidateId)
      .lean()
      .exec();
    if (!candidate) throw new NotFoundException('Candidate not found');

    const offer = await this.offerModel.create({
      applicationId: app._id,
      candidateId: payload.candidateId,
      hrEmployeeId: payload.hrEmployeeId,
      grossSalary: payload.grossSalary,
      signingBonus: payload.signingBonus,
      benefits: payload.benefits,
      conditions: payload.conditions,
      insurances: payload.insurances,
      content: payload.content,
      role: payload.role,
      deadline: payload.deadline ? new Date(payload.deadline) : undefined,
      approvers: [],
      finalStatus: undefined,
    });

    await this.applicationHistoryModel.create({
      applicationId: app._id,
      oldStage: null,
      newStage: 'Offer Created',
      oldStatus: app.status ?? null,
      newStatus: ApplicationStatus.OFFER,
      changedBy: payload.hrEmployeeId || null,
    });

    // Optionally update application to OFFER
    app.status = ApplicationStatus.OFFER;
    await app.save();

    return offer;
  }

  async findOfferById(id: string) {
    return this.offerModel.findById(id).lean().exec();
  }

  async listOffers(filter?: { applicationId?: string; candidateId?: string }) {
    const q: any = {};
    if (filter?.applicationId) q.applicationId = filter.applicationId;
    if (filter?.candidateId) q.candidateId = filter.candidateId;
    return this.offerModel.find(q).lean().exec();
  }

  async addOfferApproverAction(
    offerId: string,
    employeeId: string,
    role: string,
    status: string,
    comment?: string,
  ) {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    const action = {
      employeeId,
      role,
      status,
      actionDate: new Date(),
      comment,
    } as any;
    offer.approvers = offer.approvers || [];
    offer.approvers.push(action);
    await offer.save();

    // record history
    await this.applicationHistoryModel.create({
      applicationId: offer.applicationId,
      oldStage: 'Offer Approval',
      newStage: `Offer Approval: ${status}`,
      oldStatus: null,
      newStatus: null,
      changedBy: employeeId,
    });

    return { offerId: String(offer._id), action };
  }

  async finalizeOffer(offerId: string) {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    const approvers = offer.approvers || [];
    const anyRejected = approvers.some(
      (a: any) =>
        String(a.status).toLowerCase() === 'rejected' ||
        String(a.status).toLowerCase() === 'rejected',
    );
    const final = anyRejected ? 'rejected' : 'approved';
    offer.finalStatus = final as any;
    await offer.save();

    // update application accordingly
    const app = await this.applicationModel
      .findById(offer.applicationId)
      .exec();
    if (app) {
      if (final === 'approved') {
        app.status = ApplicationStatus.HIRED;
        await app.save();
        await this.applicationHistoryModel.create({
          applicationId: app._id,
          oldStage: null,
          newStage: 'Offer Finalized: Approved',
          oldStatus: null,
          newStatus: ApplicationStatus.HIRED,
          changedBy: null,
        });
      } else {
        app.status = ApplicationStatus.REJECTED;
        await app.save();
        await this.applicationHistoryModel.create({
          applicationId: app._id,
          oldStage: null,
          newStage: 'Offer Finalized: Rejected',
          oldStatus: null,
          newStatus: ApplicationStatus.REJECTED,
          changedBy: null,
        });
      }
    }

    return { offerId: String(offer._id), finalStatus: offer.finalStatus };
  }

  async candidateRespondOffer(
    offerId: string,
    response: 'accepted' | 'rejected',
  ) {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) throw new NotFoundException('Offer not found');
    offer.applicantResponse = response as any;
    if (response === 'accepted') {
      offer.candidateSignedAt = new Date();
    }
    await offer.save();

    // record history and possibly finalize
    await this.applicationHistoryModel.create({
      applicationId: offer.applicationId,
      oldStage: null,
      newStage: `Offer Responded: ${response}`,
      oldStatus: null,
      newStatus: null,
      changedBy: String(offer.candidateId),
    });

    return offer;
  }

  // REC-018: Generate offer letter, prepare send payload, and collect electronic signature
  async generateOfferLetter(offerId: string, options?: { template?: string }) {
    const offer = await this.offerModel.findById(offerId).lean().exec();
    if (!offer) throw new NotFoundException('Offer not found');
    const candidate = await this.candidateModel
      .findById(String(offer.candidateId))
      .lean()
      .exec();

    // Use provided template or offer.content as template
    const rawTemplate = options?.template || offer.content || '';

    // Simple placeholder replacement
    const cand: any = candidate as any;
    const mapping: Record<string, any> = {
      candidateName:
        cand?.name ||
        (cand?.firstName
          ? `${cand.firstName} ${cand.lastName || ''}`
          : 'Candidate'),
      role: offer.role || '',
      grossSalary: offer.grossSalary,
      signingBonus: offer.signingBonus || '',
      benefits: Array.isArray(offer.benefits)
        ? offer.benefits.join(', ')
        : offer.benefits || '',
      conditions: offer.conditions || '',
      insurances: offer.insurances || '',
      deadline: offer.deadline
        ? new Date(offer.deadline).toLocaleDateString()
        : '',
      today: new Date().toLocaleDateString(),
    };

    let letter = rawTemplate;
    Object.keys(mapping).forEach((k) => {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, 'gi');
      letter = letter.replace(re, String(mapping[k] ?? ''));
    });

    return {
      letter,
      meta: { offerId, candidateId: String(offer.candidateId) },
    };
  }

  async prepareOfferSendPayload(offerId: string) {
    const offer = await this.offerModel.findById(offerId).lean().exec();
    if (!offer) throw new NotFoundException('Offer not found');
    const candidate = await this.candidateModel
      .findById(String(offer.candidateId))
      .lean()
      .exec();

    const { letter } = await this.generateOfferLetter(offerId);

    const to =
      (candidate as any)?.email || (candidate as any)?.contactEmail || null;
    const subject = `Offer for ${offer.role || 'the position'}`;
    const body = `Dear ${(candidate as any)?.name || (candidate as any)?.firstName || 'Candidate'},\n\nPlease find your offer attached.\n\nBest regards,\nHR Team`;

    const payload = {
      to,
      subject,
      body,
      attachments: [
        {
          filename: `offer-${offerId}.txt`,
          content: letter,
          contentType: 'text/plain',
        },
      ],
      meta: { offerId, candidateId: String(offer.candidateId) },
    };

    return payload;
  }

  async submitOfferSignature(
    offerId: string,
    signature: {
      type: 'image' | 'typed';
      data: string;
      signerName?: string;
      signedAt?: string;
    },
  ) {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    const candidateId = String(offer.candidateId);
    const basePath = path.join(
      process.cwd(),
      'data',
      'offer-signatures',
      offerId,
    );
    await fs.promises.mkdir(basePath, { recursive: true });

    const ts = Date.now();
    let signatureFile: string | null = null;
    if (signature.type === 'image') {
      // data is base64 image (data:image/png;base64,... or raw base64)
      const raw = signature.data.replace(/^data:image\/(png|jpeg);base64,/, '');
      const buf = Buffer.from(raw, 'base64');
      const filename = `${ts}-signature.png`;
      signatureFile = path.join(basePath, filename);
      await fs.promises.writeFile(signatureFile, buf);
    } else {
      // typed signature - store as JSON
      const filename = `${ts}-signature.json`;
      signatureFile = path.join(basePath, filename);
      await fs.promises.writeFile(
        signatureFile,
        JSON.stringify(
          {
            signerName: signature.signerName || null,
            typed: signature.data,
            signedAt: signature.signedAt || new Date().toISOString(),
          },
          null,
          2,
        ),
      );
    }

    // update offer record: mark as accepted and set signed timestamp
    offer.applicantResponse = 'accepted' as any;
    offer.candidateSignedAt = signature.signedAt
      ? new Date(signature.signedAt)
      : new Date();
    await offer.save();

    // record history (changedBy: candidateId required by schema - try to use candidateId)
    try {
      await this.applicationHistoryModel.create({
        applicationId: offer.applicationId,
        oldStage: null,
        newStage: 'Offer Signed',
        oldStatus: null,
        newStatus: null,
        changedBy: candidateId,
      });
    } catch (e) {
      // best-effort: if schema expects ObjectId, pass null may still work in some setups; ignore errors here
    }

    return { offerId, signatureFile };
  }

  async listOfferSignatures(offerId: string) {
    const basePath = path.join(
      process.cwd(),
      'data',
      'offer-signatures',
      offerId,
    );
    try {
      const files = await fs.promises.readdir(basePath);
      return files.map((f) => ({ file: f, path: path.join(basePath, f) }));
    } catch (e) {
      return [];
    }
  }

  // REC-029: Pre-boarding tasks (file-backed, no schema changes)
  async triggerPreboarding(
    offerId: string,
    options?: {
      startDate?: string;
      tasks?: Array<{
        title: string;
        description?: string;
        assignee?: 'candidate' | 'hr';
        dueDays?: number;
      }>;
    },
  ) {
    const offer = await this.offerModel.findById(offerId).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    // ensure offer accepted
    const accepted =
      String(offer.applicantResponse || '').toLowerCase() === 'accepted' ||
      !!offer.candidateSignedAt;
    if (!accepted)
      throw new Error('Offer not accepted; cannot trigger pre-boarding');

    const basePath = path.join(process.cwd(), 'data', 'preboarding', offerId);
    await fsp.mkdir(basePath, { recursive: true });

    const start = options?.startDate ? new Date(options.startDate) : new Date();
    const ts = Date.now();

    const defaultTasks = [
      {
        title: 'Sign employment contract',
        description: 'Electronically sign the official employment contract.',
        assignee: 'candidate',
        dueDays: 3,
      },
      {
        title: 'Complete tax and payroll forms',
        description: 'Provide tax information and bank details for payroll.',
        assignee: 'candidate',
        dueDays: 5,
      },
      {
        title: 'Upload ID documents',
        description: 'Upload government-issued ID for verification.',
        assignee: 'candidate',
        dueDays: 5,
      },
      {
        title: 'Benefits enrollment',
        description: 'Choose benefit options and enroll.',
        assignee: 'candidate',
        dueDays: 7,
      },
      {
        title: 'IT access & equipment request',
        description: 'Request laptop, accounts and access rights.',
        assignee: 'hr',
        dueDays: 10,
      },
      {
        title: 'Payroll setup',
        description: 'HR to configure payroll for the new hire.',
        assignee: 'hr',
        dueDays: 10,
      },
    ];

    const tasksSource =
      options?.tasks && options.tasks.length ? options.tasks : defaultTasks;
    const tasks: Array<any> = [];
    for (let i = 0; i < tasksSource.length; i++) {
      const t = tasksSource[i];
      const due = new Date(start);
      if (t.dueDays) due.setDate(due.getDate() + (t.dueDays || 0));
      const id = `${ts}-${i}`;
      tasks.push({
        id,
        title: t.title,
        description: t.description || null,
        assignee: t.assignee || 'candidate',
        dueDate: due.toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    }

    const filePath = path.join(basePath, 'tasks.json');
    await fsp.writeFile(
      filePath,
      JSON.stringify(
        { offerId, createdAt: new Date().toISOString(), tasks },
        null,
        2,
      ),
      'utf8',
    );

    // record history entry on application
    try {
      await this.applicationHistoryModel.create({
        applicationId: offer.applicationId,
        oldStage: null,
        newStage: 'Pre-boarding Started',
        oldStatus: null,
        newStatus: null,
        changedBy: offer.hrEmployeeId || null,
      });
    } catch (e) {
      // ignore best-effort
    }

    return {
      offerId,
      tasksFile: path.relative(process.cwd(), filePath),
      tasks,
    };
  }

  async listPreboardingTasks(offerId: string) {
    const basePath = path.join(process.cwd(), 'data', 'preboarding', offerId);
    const filePath = path.join(basePath, 'tasks.json');
    try {
      const txt = await fsp.readFile(filePath, 'utf8');
      return JSON.parse(txt);
    } catch (e) {
      return { offerId, tasks: [] };
    }
  }

  async completePreboardingTask(
    offerId: string,
    taskId: string,
    completedBy?: string,
  ) {
    const basePath = path.join(process.cwd(), 'data', 'preboarding', offerId);
    const filePath = path.join(basePath, 'tasks.json');
    try {
      const txt = await fsp.readFile(filePath, 'utf8');
      const obj = JSON.parse(txt);
      const tasks: any[] = obj.tasks || [];
      const idx = tasks.findIndex((t) => String(t.id) === String(taskId));
      if (idx === -1) throw new NotFoundException('Task not found');
      tasks[idx].status = 'completed';
      tasks[idx].completedAt = new Date().toISOString();
      tasks[idx].completedBy = completedBy || null;
      await fsp.writeFile(
        filePath,
        JSON.stringify(
          { offerId, updatedAt: new Date().toISOString(), tasks },
          null,
          2,
        ),
        'utf8',
      );

      // record history
      try {
        await this.applicationHistoryModel.create({
          applicationId: obj.applicationId || null,
          oldStage: null,
          newStage: `Preboarding Task Completed: ${tasks[idx].title}`,
          oldStatus: null,
          newStatus: null,
          changedBy: completedBy || null,
        });
      } catch (e) {
        // ignore
      }

      return tasks[idx];
    } catch (e) {
      throw new NotFoundException('Preboarding tasks not found');
    }
  }

  async getInterview(interviewId: string) {
    return this.interviewModel.findById(interviewId).lean().exec();
  }

  async updateInterview(
    interviewId: string,
    updates: Partial<{
      scheduledDate: Date | string;
      method: InterviewMethod | string;
      videoLink?: string;
      status?: InterviewStatus | string;
    }>,
  ) {
    const doc = await this.interviewModel.findById(interviewId).exec();
    if (!doc) throw new NotFoundException('Interview not found');
    if (updates.scheduledDate)
      doc.scheduledDate =
        typeof updates.scheduledDate === 'string'
          ? new Date(updates.scheduledDate)
          : (updates.scheduledDate as Date);
    if (updates.method) doc.method = updates.method as any;
    if (updates.videoLink !== undefined) doc.videoLink = updates.videoLink;
    if (updates.status !== undefined) doc.status = updates.status as any;
    await doc.save();
    return doc;
  }

  async cancelInterview(
    interviewId: string,
    opts?: { reason?: string; changedBy?: string },
  ) {
    const doc = await this.interviewModel.findById(interviewId).exec();
    if (!doc) throw new NotFoundException('Interview not found');
    doc.status = InterviewStatus.CANCELLED;
    await doc.save();

    // record in history
    await this.applicationHistoryModel.create({
      applicationId: doc.applicationId,
      oldStage: `Interview: ${doc.stage}`,
      newStage: `Interview Cancelled`,
      oldStatus: null,
      newStatus: `cancelled${opts?.reason ? ' - ' + opts.reason : ''}`,
      changedBy: opts?.changedBy || null,
    });

    return doc;
  }

  // Panel member management (file-backed, no DB schema changes)
  private async ensurePanelMembersDir() {
    await fsp.mkdir(this.panelMembersDir, { recursive: true });
  }

  private async ensurePanelAvailabilityDir() {
    await fsp.mkdir(this.panelAvailabilityDir, { recursive: true });
  }

  async registerPanelMember(
    panelMemberId: string,
    payload: {
      name: string;
      email?: string;
      role?: string;
      expertise?: string[];
    },
  ) {
    await this.ensurePanelMembersDir();
    const file = this.panelMemberPath(panelMemberId);
    const data = {
      panelMemberId,
      name: payload.name,
      email: payload.email || null,
      role: payload.role || null,
      expertise: payload.expertise || [],
      registeredAt: new Date().toISOString(),
    };
    await fsp.writeFile(file, JSON.stringify(data, null, 2));
    return data;
  }

  async getPanelMember(panelMemberId: string) {
    const file = this.panelMemberPath(panelMemberId);
    try {
      const txt = await fsp.readFile(file, 'utf8');
      return JSON.parse(txt);
    } catch (err) {
      return null;
    }
  }

  async listPanelMembers() {
    await this.ensurePanelMembersDir();
    const files = await fsp.readdir(this.panelMembersDir);
    const result: any[] = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const id = f.replace(/\.json$/, '');
      const member = await this.getPanelMember(id);
      if (member) result.push(member);
    }
    return result;
  }

  // Panel availability: time slots per day (e.g., "2025-12-01" -> [ "09:00-10:00", "14:00-15:00" ])
  async setPanelAvailability(
    panelMemberId: string,
    availability: Record<string, string[]>,
  ) {
    await this.ensurePanelAvailabilityDir();
    const file = this.panelAvailabilityPath(panelMemberId);
    const data = {
      panelMemberId,
      availability,
      lastUpdated: new Date().toISOString(),
    };
    await fsp.writeFile(file, JSON.stringify(data, null, 2));
    return data;
  }

  async getPanelAvailability(panelMemberId: string) {
    const file = this.panelAvailabilityPath(panelMemberId);
    try {
      const txt = await fsp.readFile(file, 'utf8');
      return JSON.parse(txt);
    } catch (err) {
      return null;
    }
  }

  async listPanelAvailability(panelMemberIds: string[]) {
    const result: Record<string, any> = {};
    for (const id of panelMemberIds) {
      result[id] = await this.getPanelAvailability(id);
    }
    return result;
  }

  // Panel coordination report: lists panel members assigned to interview, their availability, and feedback collected
  async getPanelCoordinationReport(interviewId: string) {
    const interview = await this.interviewModel
      .findById(interviewId)
      .lean()
      .exec();
    if (!interview) throw new NotFoundException('Interview not found');

    const panelIds = (interview.panel || []).map((p) => String(p));
    const panelMembers: Array<{
      member: any;
      availability: any;
      feedbackSubmitted: boolean;
      score?: number;
    }> = [];

    for (const id of panelIds) {
      const member = await this.getPanelMember(id);
      const availability = await this.getPanelAvailability(id);
      // check if this panel member has submitted feedback
      const feedback = await this.assessmentResultModel
        .findOne({ interviewId: interview._id, interviewerId: id })
        .lean()
        .exec();
      const fbData = feedback as any;
      panelMembers.push({
        member: member || { panelMemberId: id },
        availability,
        feedbackSubmitted: !!feedback,
        score: fbData?.score || undefined,
      });
    }

    const feedbacks = await this.assessmentResultModel
      .find({ interviewId: interview._id })
      .lean()
      .exec();
    const feedbackCount = feedbacks.length;
    const avgScore =
      feedbackCount > 0
        ? Math.round(
            (feedbacks.reduce((s: number, f: any) => s + (f.score || 0), 0) /
              feedbackCount) *
              100,
          ) / 100
        : null;

    return {
      interviewId: String(interview._id),
      applicationId: String(interview.applicationId),
      stage: interview.stage,
      scheduledDate: interview.scheduledDate,
      panelMembers,
      feedbackSummary: {
        totalPanelCount: panelIds.length,
        feedbackSubmittedCount: feedbackCount,
        averageScore: avgScore,
      },
    };
  }

  // Check common availability across panel for a date range
  async findCommonAvailability(
    panelMemberIds: string[],
    dateRange: { startDate: string; endDate: string },
  ) {
    const availabilities = await this.listPanelAvailability(panelMemberIds);
    const commonSlots: Record<string, string[]> = {};

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const slotsForDate: Set<string> = new Set();

      let firstDay = true;
      for (const memberId of panelMemberIds) {
        const avail = availabilities[memberId];
        if (!avail) continue;
        const slots = avail.availability?.[dateStr] || [];
        const slotSet = new Set<string>(slots as string[]);

        if (firstDay) {
          for (const s of slotSet) slotsForDate.add(s);
          firstDay = false;
        } else {
          const toRemove: string[] = [];
          for (const s of slotsForDate) {
            if (!slotSet.has(s)) toRemove.push(s);
          }
          for (const s of toRemove) slotsForDate.delete(s);
        }
      }
      if (slotsForDate.size > 0) {
        commonSlots[dateStr] = Array.from(slotsForDate).sort();
      }
    }

    return { panelMemberIds, dateRange, commonSlots };
  }

  // ============ ONBOARDING SERVICE METHODS ============

  // ------------------ Setup & Checklist (ONB-001) ------------------
  async createChecklist(dto: CreateChecklistDto) {
    const tasks = (dto.taskNames || []).map((name) => ({
      name,
      department: dto.departmentId || null,
      status: OnboardingTaskStatus.PENDING,
      deadline: this.calculateDeadline(5),
    }));

    const onboarding = await this.onboardingModel.create({
      employeeId: null,
      contractId: null,
      template: {
        name: dto.templateName,
        description: dto.description || null,
        departmentId: dto.departmentId || null,
        createdAt: new Date(),
      },
      tasks,
      completed: false,
    });

    this.logger.debug(`Checklist template created: ${onboarding._id}`);
    return {
      success: true,
      checklistId: onboarding._id,
      taskCount: tasks.length,
    };
  }

  // ------------------ Contract Access (ONB-002) ------------------
  async getContractDetails(contractId: string) {
    const contract = await this.contractModel.findById(contractId).exec();
    if (!contract) throw new NotFoundException('Contract not found');

    const offer = await this.offerModel.findById(contract.offerId).exec();
    if (!offer)
      throw new BadRequestException('Linked offer not found for this contract');

    const candidate = await this.candidateModel
      .findById(offer.candidateId)
      .exec();
    if (!candidate)
      throw new BadRequestException(
        'Linked candidate not found for this offer',
      );

    const fullySigned = !!(
      contract.employeeSignedAt && contract.employerSignedAt
    );
    if (!fullySigned)
      throw new BadRequestException(
        'Contract must be signed by both employee and employer before profile creation',
      );

    if (!candidate.firstName || !candidate.lastName || !candidate.nationalId) {
      throw new BadRequestException(
        'Candidate profile incomplete: missing firstName, lastName, or nationalId',
      );
    }

    const startDate = this.calculateStartDate(contract.acceptanceDate);

    return {
      contractId: contract._id,
      offerId: offer._id,
      candidateId: candidate._id,
      candidateFirstName: candidate.firstName,
      candidateLastName: candidate.lastName,
      candidateNationalId: candidate.nationalId,
      candidateEmail: candidate.personalEmail,
      candidateGender: candidate.gender,
      candidateDateOfBirth: candidate.dateOfBirth,
      role: contract.role,
      grossSalary: contract.grossSalary,
      signingBonus: contract.signingBonus,
      benefits: contract.benefits,
      acceptanceDate: contract.acceptanceDate,
      startDate,
      employeeSignedAt: contract.employeeSignedAt,
      employerSignedAt: contract.employerSignedAt,
      isValidForProfileCreation: fullySigned,
    };
  }

  async createEmployeeProfileFromContract(
    contractId: string,
    createdBy: string,
  ) {
    const contractDetails = await this.getContractDetails(contractId);

    const existingProfile = await this.employeeModel
      .findOne({ nationalId: contractDetails.candidateNationalId })
      .lean()
      .exec();
    if (existingProfile) {
      throw new ConflictException(
        `Employee profile already exists for national ID: ${contractDetails.candidateNationalId}. Profile ID: ${(existingProfile as any)._id}`,
      );
    }

    const employeeNumber = await this.generateEmployeeNumber();

    const profile = await this.employeeModel.create({
      employeeNumber,
      firstName: contractDetails.candidateFirstName,
      lastName: contractDetails.candidateLastName,
      nationalId: contractDetails.candidateNationalId,
      workEmail: contractDetails.candidateEmail,
      dateOfHire: contractDetails.startDate,
      contractStartDate: contractDetails.startDate,
      contractType: ContractType.FULL_TIME_CONTRACT,
      status: EmployeeStatus.PROBATION, // ONB-002: Employee status set to 'Probation' per requirements
      gender: contractDetails.candidateGender,
      dateOfBirth: contractDetails.candidateDateOfBirth,
      profilePictureUrl: null,
    });

    this.logger.log(
      `Employee profile created from contract ${contractId}: ${profile._id} (${employeeNumber})`,
    );

    return {
      success: true,
      profileId: profile._id,
      employeeNumber,
      message: `Employee profile created successfully. Employee #: ${employeeNumber}`,
    };
  }

  // ------------------ Tracker (ONB-004) ------------------
  async getTracker(employeeId: string) {
    const employeeIdObj = new Types.ObjectId(employeeId);
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: employeeIdObj })
      .exec();
    if (!onboarding)
      throw new NotFoundException(
        `No onboarding found for employee ${employeeId}`,
      );

    const total = onboarding.tasks.length;
    const completed = onboarding.tasks.filter(
      (t: any) => t.status === OnboardingTaskStatus.COMPLETED,
    ).length;

    const enrichedTasks = (onboarding.tasks || []).map(
      (t: any, idx: number) => {
        let meta: any = {};
        try {
          if (
            t.notes &&
            typeof t.notes === 'string' &&
            t.notes.startsWith('{')
          ) {
            meta = JSON.parse(t.notes);
          }
        } catch (e) {
          meta = { raw: t.notes };
        }

        return {
          _id: t._id,
          name: t.name,
          department: t.department,
          status: t.status,
          deadline: t.deadline,
          completedAt: t.completedAt,
          sequence: meta.sequence || idx + 1,
          description: meta.description || null,
          owner: meta.owner || null,
          estimatedHours: meta.estimatedHours || null,
          notes: meta.raw || t.notes,
          documentId: t.documentId,
          isBlocked: meta.isBlocked || false,
          prerequisiteTaskIndex: meta.prerequisiteTaskIndex || null,
        };
      },
    );

    const nextTaskIndex = enrichedTasks.findIndex(
      (t: any) => t.status === OnboardingTaskStatus.PENDING && !t.isBlocked,
    );
    const nextTask = nextTaskIndex >= 0 ? enrichedTasks[nextTaskIndex] : null;

    return {
      success: true,
      employeeId: onboarding.employeeId,
      contractId: onboarding.contractId,
      tasks: enrichedTasks,
      progress: {
        completed,
        total,
        percentage: total ? (completed / total) * 100 : 0,
      },
      nextTask,
      nextTaskIndex: nextTaskIndex >= 0 ? nextTaskIndex : null,
      completed: onboarding.completed,
      completedAt: onboarding.completedAt,
    };
  }

  async populateDepartmentTasks(employeeId: string, departmentId?: string) {
    const employeeIdObj = new Types.ObjectId(employeeId);
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: employeeIdObj })
      .exec();
    if (!onboarding)
      throw new NotFoundException(
        `Onboarding not found for employee ${employeeId}`,
      );

    let dept = departmentId;
    if (!dept) {
      const emp = await this.employeeModel
        .findById(employeeIdObj)
        .lean()
        .exec();
      dept = (emp as any)?.primaryDepartmentId?.toString();
    }

    const deptTemplates = this.getDepartmentTaskTemplates(dept);

    const existingNames = (onboarding.tasks || []).map((t: any) => t.name);
    const newTasks = deptTemplates.filter(
      (t: any) => !existingNames.includes(t.name),
    );

    newTasks.forEach((template: any) => {
      const meta = {
        sequence: template.sequence,
        description: template.description,
        owner: template.owner,
        estimatedHours: template.estimatedHours,
        createdAt: new Date().toISOString(),
      };
      onboarding.tasks.push({
        name: template.name,
        department: template.department,
        status: OnboardingTaskStatus.PENDING,
        deadline: this.calculateDeadline(template.daysToComplete || 5),
        notes: JSON.stringify(meta),
      });
    });

    await onboarding.save();
    this.logger.log(
      `Department tasks added for employee ${employeeId} (dept: ${dept}). Total tasks: ${onboarding.tasks.length}`,
    );

    return {
      success: true,
      tasksAdded: newTasks.length,
      totalTasks: onboarding.tasks.length,
    };
  }

  private getDepartmentTaskTemplates(departmentId?: string): any[] {
    const baseWorkflow = [
      {
        name: 'Complete Onboarding Checklist',
        department: 'General',
        sequence: 1,
        description: 'Review and complete the onboarding checklist with HR.',
        owner: 'HR',
        estimatedHours: 2,
        daysToComplete: 1,
      },
      {
        name: 'Set Up IT Access',
        department: 'General',
        sequence: 2,
        description: 'Receive computer, phone, and system credentials from IT.',
        owner: 'IT',
        estimatedHours: 1,
        daysToComplete: 1,
      },
    ];

    const financeTemplates = [
      {
        name: 'Finance System Training',
        department: 'Finance',
        sequence: 3,
        description: 'Complete Finance module training in LMS.',
        owner: 'Finance',
        estimatedHours: 4,
        daysToComplete: 3,
      },
      {
        name: 'Compliance & Tax Training',
        department: 'Finance',
        sequence: 4,
        description: 'Mandatory tax and compliance training.',
        owner: 'Finance',
        estimatedHours: 2,
        daysToComplete: 2,
      },
    ];

    const hrTemplates = [
      {
        name: 'HR Policies & Procedures',
        department: 'HR',
        sequence: 3,
        description: 'Review HR policies, leave policies, and benefits.',
        owner: 'HR',
        estimatedHours: 3,
        daysToComplete: 2,
      },
      {
        name: 'Employee Handbook Review',
        department: 'HR',
        sequence: 4,
        description: 'Sign off on employee handbook.',
        owner: 'HR',
        estimatedHours: 1,
        daysToComplete: 1,
      },
    ];

    const itTemplates = [
      {
        name: 'IT Security Training',
        department: 'IT',
        sequence: 3,
        description: 'Complete IT security and data protection training.',
        owner: 'IT',
        estimatedHours: 2,
        daysToComplete: 1,
      },
      {
        name: 'Network & System Access',
        department: 'IT',
        sequence: 4,
        description: 'Set up network access and VPN credentials.',
        owner: 'IT',
        estimatedHours: 1,
        daysToComplete: 1,
      },
    ];

    if (departmentId?.toLowerCase().includes('finance')) {
      return [...baseWorkflow, ...financeTemplates];
    } else if (departmentId?.toLowerCase().includes('hr')) {
      return [...baseWorkflow, ...hrTemplates];
    } else if (departmentId?.toLowerCase().includes('it')) {
      return [...baseWorkflow, ...itTemplates];
    }

    return baseWorkflow;
  }

  // ------------------ Tasks & Reminders (ONB-005) ------------------
  async createTask(employeeId: string, dto: CreateOnboardingTaskDto) {
    const employeeIdObj = new Types.ObjectId(employeeId);
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: employeeIdObj })
      .exec();
    if (!onboarding)
      throw new NotFoundException(
        `Onboarding record not found for employee ${employeeId}`,
      );

    const sequence = dto.sequence || onboarding.tasks.length + 1;

    const meta = {
      sequence,
      description: dto.description || null,
      owner: dto.owner || null,
      estimatedHours: dto.estimatedHours || null,
      isBlocked: dto.isBlocked || false,
      prerequisiteTaskIndex: dto.prerequisiteTaskIndex || null,
      createdAt: new Date().toISOString(),
    };

    const task = {
      name: dto.name,
      department: dto.department,
      status: dto.status || OnboardingTaskStatus.PENDING,
      deadline: dto.deadline || this.calculateDeadline(5),
      notes: JSON.stringify(meta),
    };

    onboarding.tasks.push(task);
    await onboarding.save();

    this.logger.log(
      `Task "${dto.name}" created for employee ${employeeId} (sequence: ${sequence})`,
    );

    return {
      success: true,
      task,
      taskIndex: onboarding.tasks.length - 1,
      nextReminder: this.calculateNextReminder(),
    };
  }

  async updateTaskStatus(
    employeeId: string,
    taskIndex: number,
    dto: UpdateTaskStatusDto,
  ) {
    const employeeIdObj = new Types.ObjectId(employeeId);
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: employeeIdObj })
      .exec();
    if (!onboarding)
      throw new NotFoundException(
        `Onboarding not found for employee ${employeeId}`,
      );
    if (!onboarding.tasks[taskIndex])
      throw new NotFoundException(`Task not found at index ${taskIndex}`);

    const task = onboarding.tasks[taskIndex];
    task.status = dto.status;
    if (dto.notes) {
      let meta: any = {};
      try {
        if (
          task.notes &&
          typeof task.notes === 'string' &&
          task.notes.startsWith('{')
        ) {
          meta = JSON.parse(task.notes);
        }
      } catch (e) {
        meta = { raw: task.notes };
      }
      meta.updatedNotes = dto.notes;
      meta.updatedAt = new Date().toISOString();
      task.notes = JSON.stringify(meta);
    }
    if (dto.status === OnboardingTaskStatus.COMPLETED)
      task.completedAt = dto.completedAt || new Date();

    if (
      onboarding.tasks.every(
        (t: any) => t.status === OnboardingTaskStatus.COMPLETED,
      )
    ) {
      onboarding.completed = true;
      onboarding.completedAt = new Date();
    }

    await onboarding.save();
    this.logger.log(
      `Task ${taskIndex} status updated to ${dto.status} for employee ${employeeId}`,
    );

    return {
      success: true,
      status: task.status,
      completedAt: task.completedAt,
    };
  }

  async sendTaskReminder(employeeId: string, taskIndex: number) {
    const employeeIdObj = new Types.ObjectId(employeeId);
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: employeeIdObj })
      .exec();
    if (!onboarding)
      throw new NotFoundException(
        `Onboarding not found for employee ${employeeId}`,
      );
    if (!onboarding.tasks[taskIndex])
      throw new NotFoundException(`Task not found at index ${taskIndex}`);

    const task = onboarding.tasks[taskIndex];

    let meta: any = {};
    try {
      if (
        task.notes &&
        typeof task.notes === 'string' &&
        task.notes.startsWith('{')
      ) {
        meta = JSON.parse(task.notes);
      }
    } catch (e) {
      meta = {};
    }

    const taskOwner = meta.owner || 'HR';

    const employee = await this.employeeModel
      .findById(employeeIdObj)
      .lean()
      .exec();

    try {
      const employeeNotif = await this.notificationLogModel.create({
        to: employeeIdObj,
        type: 'task_reminder',
        message: `Reminder: Task "${task.name}" is due on ${task.deadline?.toDateString() || 'N/A'}. Please complete it.`,
      });
      this.logger.log(
        `Task reminder sent to employee ${employeeId} for task "${task.name}" (notification: ${employeeNotif._id})`,
      );

      const ownerNotif = await this.notificationLogModel.create({
        to: employeeIdObj,
        type: 'task_owner_reminder',
        message: `Follow-up: Task "${task.name}" assigned to employee ${employeeId} is due on ${task.deadline?.toDateString() || 'N/A'}. Responsible party: ${taskOwner}.`,
      });
      this.logger.log(
        `Task owner reminder created for task "${task.name}" (notification: ${ownerNotif._id})`,
      );

      meta.lastReminderSentAt = new Date().toISOString();
      meta.reminderCount = (meta.reminderCount || 0) + 1;
      task.notes = JSON.stringify(meta);
      await onboarding.save();

      return {
        success: true,
        message: `Reminders sent to employee and task owner (${taskOwner})`,
        sentAt: new Date(),
        taskName: task.name,
        taskOwner,
        employee: employee
          ? { id: (employee as any)._id, email: (employee as any).workEmail }
          : null,
      };
    } catch (err) {
      this.logger.error(
        `Failed to send reminder for task "${task.name}":`,
        err as any,
      );
      throw new BadRequestException(
        'Failed to send reminder. Please try again.',
      );
    }
  }

  async autoSendRemindersForUpcomingDeadlines() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const onboardings = await this.onboardingModel
      .find({ completed: false })
      .lean()
      .exec();

    let remindersSent = 0;

    for (const onboarding of onboardings) {
      for (let idx = 0; idx < onboarding.tasks.length; idx++) {
        const task = onboarding.tasks[idx];

        if (
          task.status === OnboardingTaskStatus.PENDING &&
          task.deadline &&
          new Date(task.deadline) < tomorrow
        ) {
          let meta: any = {};
          try {
            if (
              task.notes &&
              typeof task.notes === 'string' &&
              task.notes.startsWith('{')
            ) {
              meta = JSON.parse(task.notes);
            }
          } catch (e) {
            meta = {};
          }

          const lastReminder = meta.lastReminderSentAt
            ? new Date(meta.lastReminderSentAt)
            : null;
          const hoursSinceLastReminder = lastReminder
            ? (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60)
            : 24;

          if (hoursSinceLastReminder > 12) {
            try {
              await this.notificationLogModel.create({
                to: onboarding.employeeId,
                type: 'deadline_reminder',
                message: `Auto-reminder: Task "${task.name}" deadline is ${task.deadline?.toDateString()}. Please complete it soon.`,
              });

              meta.lastReminderSentAt = new Date().toISOString();
              meta.reminderCount = (meta.reminderCount || 0) + 1;
              task.notes = JSON.stringify(meta);

              remindersSent++;
              this.logger.debug(
                `Auto-reminder sent for task "${task.name}" (employee: ${onboarding.employeeId}, deadline: ${task.deadline?.toDateString()})`,
              );
            } catch (err) {
              this.logger.error(
                `Failed to send auto-reminder for task "${task.name}":`,
                err as any,
              );
            }
          }
        }
      }
    }

    if (remindersSent > 0) {
      await Promise.all(
        onboardings.map((ob) =>
          this.onboardingModel.updateOne({ _id: ob._id }, { tasks: ob.tasks }),
        ),
      );
    }

    this.logger.log(
      `Auto-reminder job completed. Sent ${remindersSent} reminders.`,
    );
    return { success: true, remindersSent };
  }

  // ------------------ Document Upload (Initial story) ------------------
  async uploadDocument(dto: UploadOnboardingDocumentDto) {
    const employeeIdObj = new Types.ObjectId(dto.employeeId);

    const employee = await this.employeeModel
      .findById(employeeIdObj)
      .lean()
      .exec();
    if (!employee) {
      throw new NotFoundException(
        `Employee profile not found for ID: ${dto.employeeId}`,
      );
    }

    const doc = await this.documentModel.create({
      ownerId: employeeIdObj,
      type: dto.documentType,
      filePath: dto.filePath,
      uploadedAt: new Date(),
    });

    let onboarding = await this.onboardingModel
      .findOne({ employeeId: employeeIdObj })
      .exec();
    let created = false;
    if (!onboarding) {
      onboarding = await this.onboardingModel.create({
        employeeId: employeeIdObj,
        contractId: null,
        tasks: [],
        completed: false,
      });
      created = true;
    }

    try {
      if (created) {
        await this.populateDepartmentTasks(
          (employee as any)._id.toString(),
          (employee as any)?.primaryDepartmentId?.toString(),
        );
      }
    } catch (err) {
      this.logger.warn(
        `Failed to auto-populate department tasks for employee ${dto.employeeId}: ${err}`,
      );
    }

    try {
      const uploaderNotification = await this.notificationLogModel.create({
        to: employeeIdObj,
        type: 'document_upload',
        message: `Document uploaded: ${dto.documentType}. Document ID: ${doc._id}`,
      });
      this.logger.log(
        `Upload notification recorded (to uploader): ${uploaderNotification._id}`,
      );
    } catch (err) {
      this.logger.error(
        'Failed to record notification for document upload',
        err as any,
      );
    }

    return {
      success: true,
      message: 'Document uploaded and onboarding initiated',
      documentId: doc._id,
      onboardingId: onboarding._id,
      onboardingCreated: created,
    };
  }

  // ------------------ Provisioning (Access & Resources) ------------------
  async createProvisionRequest(employeeId: string, dto: CreateProvisionDto) {
    let onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding) {
      onboarding = await this.onboardingModel.create({
        employeeId: new Types.ObjectId(employeeId),
        contractId: null,
        tasks: [],
        completed: false,
      });
    }

    const meta = {
      resourceType: dto.resourceType,
      details: dto.details || null,
      requestedBy: dto.requestedBy || employeeId,
      createdAt: new Date().toISOString(),
    };

    const task = {
      name: `Provision: ${dto.resourceType}`,
      department: dto.department || 'IT',
      status: OnboardingTaskStatus.PENDING,
      deadline: dto.deadline
        ? new Date(dto.deadline)
        : this.calculateDeadline(7),
      notes: JSON.stringify(meta),
    };

    onboarding.tasks.push(task);
    await onboarding.save();

    return { success: true, taskIndex: onboarding.tasks.length - 1, task };
  }

  async listProvisionRequests(employeeId: string) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .lean()
      .exec();
    if (!onboarding) return { success: true, requests: [] };

    const requests = (onboarding.tasks || [])
      .map((t: any, idx: number) => ({ idx, ...t }))
      .filter(
        (t: any) =>
          typeof t.name === 'string' && t.name.startsWith('Provision:'),
      )
      .map((t: any) => {
        let meta: any = { raw: t.notes };
        try {
          meta = JSON.parse(t.notes);
        } catch (e) {
          meta.raw = t.notes;
        }
        return {
          taskIndex: t.idx,
          name: t.name,
          status: t.status,
          deadline: t.deadline,
          meta,
        };
      });

    return { success: true, requests };
  }

  async approveProvisionRequest(
    employeeId: string,
    taskIndex: number,
    dto: ApproveProvisionDto,
  ) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding || !onboarding.tasks[taskIndex])
      throw new Error('Provisioning request not found');

    const task = onboarding.tasks[taskIndex];
    let meta: any = {};
    try {
      meta = task.notes ? JSON.parse(task.notes) : {};
    } catch (e) {
      meta.raw = task.notes;
    }
    meta.approvedBy = dto.approvedBy;
    if (dto.assignedTo) meta.assignedTo = dto.assignedTo;
    if (dto.assignmentDetails) meta.assignmentDetails = dto.assignmentDetails;
    meta.approvedAt = new Date().toISOString();

    task.status = OnboardingTaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.notes = JSON.stringify(meta);

    if (
      onboarding.tasks.every(
        (t: any) => t.status === OnboardingTaskStatus.COMPLETED,
      )
    ) {
      onboarding.completed = true;
      onboarding.completedAt = new Date();
    }

    await onboarding.save();
    return { success: true, taskIndex, meta };
  }

  async rejectProvisionRequest(
    employeeId: string,
    taskIndex: number,
    dto: RejectProvisionDto,
  ) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding || !onboarding.tasks[taskIndex])
      throw new Error('Provisioning request not found');

    const task = onboarding.tasks[taskIndex];
    let meta: any = {};
    try {
      meta = task.notes ? JSON.parse(task.notes) : {};
    } catch (e) {
      meta.raw = task.notes;
    }
    meta.rejectedBy = dto.rejectedBy;
    meta.rejectionReason = dto.reason;
    if (dto.notes)
      meta.notes = (meta.notes ? meta.notes + '\n' : '') + dto.notes;
    meta.rejectedAt = new Date().toISOString();

    task.status = OnboardingTaskStatus.PENDING;
    task.notes = JSON.stringify(meta);

    await onboarding.save();
    return { success: true, taskIndex, meta };
  }

  // Access provisioning
  async createAccessRequest(employeeId: string, dto: CreateAccessDto) {
    let onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding) {
      onboarding = await this.onboardingModel.create({
        employeeId: new Types.ObjectId(employeeId),
        contractId: null,
        tasks: [],
        completed: false,
      });
    }

    const emp = await this.employeeModel.findById(employeeId).lean().exec();
    const requester =
      dto.requestedBy ||
      (emp
        ? (emp as any)._id
          ? (emp as any)._id.toString()
          : employeeId
        : employeeId);
    const meta = {
      type: 'access',
      resource: dto.resource,
      permissions: dto.permissions || [],
      requestedBy: requester,
      createdAt: new Date().toISOString(),
    };
    const task = {
      name: `Access: ${dto.resource}`,
      department: dto.department || 'IT',
      status: OnboardingTaskStatus.PENDING,
      deadline: this.calculateDeadline(3),
      notes: JSON.stringify(meta),
    };
    onboarding.tasks.push(task);
    await onboarding.save();
    try {
      const recipients = await this.employeeSystemRoleModel
        .find({ roles: { $in: [SystemRole.SYSTEM_ADMIN] }, isActive: true })
        .lean()
        .exec();
      if (recipients && recipients.length) {
        for (const r of recipients) {
          try {
            await this.notificationLogModel.create({
              to: r.employeeProfileId,
              type: 'access_request',
              message: `Access request for employee ${employeeId}: ${dto.resource}. Task: ${task.name}`,
            });
          } catch (e) {
            this.logger.warn(
              `Failed to create provision notification for recipient ${r.employeeProfileId}: ${e}`,
            );
          }
        }
      } else {
        this.logger.debug(
          `No system admin recipients found to notify for provision request (employee ${employeeId})`,
        );
      }
    } catch (err) {
      this.logger.warn(`Failed to lookup system admin recipients: ${err}`);
    }

    return { success: true, taskIndex: onboarding.tasks.length - 1, task };
  }

  async approveAccessRequest(
    employeeId: string,
    taskIndex: number,
    dto: ApproveAccessDto,
  ) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding || !onboarding.tasks[taskIndex])
      throw new Error('Access request not found');
    const task = onboarding.tasks[taskIndex];
    let meta: any = {};
    try {
      meta = task.notes ? JSON.parse(task.notes) : {};
    } catch (e) {
      meta.raw = task.notes;
    }
    const emp = await this.employeeModel.findById(employeeId).lean().exec();
    meta.approvedBy = dto.approvedBy;
    meta.grantedTo =
      dto.grantedTo ||
      (emp ? (emp as any).username || (emp as any).email || null : null);
    meta.grantedAt = new Date().toISOString();
    if (dto.notes)
      meta.notes = (meta.notes ? meta.notes + '\n' : '') + dto.notes;
    task.status = OnboardingTaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.notes = JSON.stringify(meta);
    await onboarding.save();
    return { success: true, taskIndex, meta };
  }

  async revokeAccess(
    employeeId: string,
    taskIndex: number,
    dto: RevokeAccessDto,
  ) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding || !onboarding.tasks[taskIndex])
      throw new Error('Access task not found');
    const task = onboarding.tasks[taskIndex];
    let meta: any = {};
    try {
      meta = task.notes ? JSON.parse(task.notes) : {};
    } catch (e) {
      meta.raw = task.notes;
    }
    const emp = await this.employeeModel.findById(employeeId).lean().exec();
    meta.revokedBy = dto.revokedBy;
    meta.revokedAt = new Date().toISOString();
    if (dto.reason) meta.revocationReason = dto.reason;
    if (!meta.revocationActor)
      meta.revocationActor = emp
        ? (emp as any).username || (emp as any).email
        : null;
    task.notes = JSON.stringify(meta);
    await onboarding.save();
    return { success: true, taskIndex, meta };
  }

  // Equipment tracking
  async createEquipmentRequest(employeeId: string, dto: CreateEquipmentDto) {
    let onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding) {
      onboarding = await this.onboardingModel.create({
        employeeId: new Types.ObjectId(employeeId),
        contractId: null,
        tasks: [],
        completed: false,
      });
    }
    const meta = {
      type: 'equipment',
      itemType: dto.itemType,
      preferredModel: dto.preferredModel || null,
      requestedBy: dto.requestedBy || employeeId,
      createdAt: new Date().toISOString(),
    };
    const task = {
      name: `Equipment: ${dto.itemType}`,
      department: 'Facilities',
      status: OnboardingTaskStatus.PENDING,
      deadline: this.calculateDeadline(7),
      notes: JSON.stringify(meta),
    };
    onboarding.tasks.push(task);
    await onboarding.save();
    return { success: true, taskIndex: onboarding.tasks.length - 1, task };
  }

  async assignEquipment(
    employeeId: string,
    taskIndex: number,
    dto: AssignEquipmentDto,
  ) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding || !onboarding.tasks[taskIndex])
      throw new Error('Equipment request not found');
    const task = onboarding.tasks[taskIndex];
    let meta: any = {};
    try {
      meta = task.notes ? JSON.parse(task.notes) : {};
    } catch (e) {
      meta.raw = task.notes;
    }
    meta.assignedBy = dto.assignedBy;
    if (dto.assetTag) meta.assetTag = dto.assetTag;
    if (dto.notes) meta.assignmentNotes = dto.notes;
    meta.assignedAt = new Date().toISOString();
    task.status = OnboardingTaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.notes = JSON.stringify(meta);
    await onboarding.save();
    return { success: true, taskIndex, meta };
  }

  async returnEquipment(
    employeeId: string,
    taskIndex: number,
    dto: ReturnEquipmentDto,
  ) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding || !onboarding.tasks[taskIndex])
      throw new Error('Equipment task not found');
    const task = onboarding.tasks[taskIndex];
    let meta: any = {};
    try {
      meta = task.notes ? JSON.parse(task.notes) : {};
    } catch (e) {
      meta.raw = task.notes;
    }
    meta.returnedBy = dto.returnedBy;
    if (dto.assetTag) meta.returnedAssetTag = dto.assetTag;
    if (dto.notes) meta.returnNotes = dto.notes;
    meta.returnedAt = new Date().toISOString();
    task.notes = JSON.stringify(meta);
    await onboarding.save();
    return { success: true, taskIndex, meta };
  }

  // Payroll initiation
  async createPayrollInitiation(employeeId: string, dto: CreatePayrollDto) {
    let onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding) {
      onboarding = await this.onboardingModel.create({
        employeeId: new Types.ObjectId(employeeId),
        contractId: null,
        tasks: [],
        completed: false,
      });
    }

    const meta = {
      type: 'payroll',
      payrollType: dto.payrollType,
      amount: dto.amount || null,
      frequency: dto.frequency || null,
      initiatedBy: dto.initiatedBy || employeeId,
      createdAt: new Date().toISOString(),
    };
    const task = {
      name: `Payroll: ${dto.payrollType}`,
      department: 'Payroll',
      status: OnboardingTaskStatus.PENDING,
      deadline: this.calculateDeadline(3),
      notes: JSON.stringify(meta),
    };
    onboarding.tasks.push(task);
    await onboarding.save();
    return { success: true, taskIndex: onboarding.tasks.length - 1, task };
  }

  async triggerPayroll(
    employeeId: string,
    taskIndex: number,
    dto: TriggerPayrollDto,
  ) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding || !onboarding.tasks[taskIndex])
      throw new Error('Payroll task not found');
    const task = onboarding.tasks[taskIndex];
    let meta: any = {};
    try {
      meta = task.notes ? JSON.parse(task.notes) : {};
    } catch (e) {
      meta.raw = task.notes;
    }
    meta.triggeredBy = dto.triggeredBy;
    if (dto.notes) meta.triggerNotes = dto.notes;
    meta.triggeredAt = new Date().toISOString();
    task.status = OnboardingTaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.notes = JSON.stringify(meta);
    await onboarding.save();
    return { success: true, taskIndex, meta };
  }

  // Benefits initiation
  async createBenefitsRequest(employeeId: string, dto: CreateBenefitsDto) {
    let onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding) {
      onboarding = await this.onboardingModel.create({
        employeeId: new Types.ObjectId(employeeId),
        contractId: null,
        tasks: [],
        completed: false,
      });
    }
    const meta = {
      type: 'benefits',
      planType: dto.planType,
      options: dto.options || [],
      initiatedBy: dto.initiatedBy || employeeId,
      createdAt: new Date().toISOString(),
    };
    const task = {
      name: `Benefits: ${dto.planType}`,
      department: 'Benefits',
      status: OnboardingTaskStatus.PENDING,
      deadline: this.calculateDeadline(5),
      notes: JSON.stringify(meta),
    };
    onboarding.tasks.push(task);
    await onboarding.save();
    return { success: true, taskIndex: onboarding.tasks.length - 1, task };
  }

  async approveBenefitsRequest(
    employeeId: string,
    taskIndex: number,
    dto: ApproveBenefitsDto,
  ) {
    const onboarding = await this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
    if (!onboarding || !onboarding.tasks[taskIndex])
      throw new Error('Benefits request not found');
    const task = onboarding.tasks[taskIndex];
    let meta: any = {};
    try {
      meta = task.notes ? JSON.parse(task.notes) : {};
    } catch (e) {
      meta.raw = task.notes;
    }
    meta.approvedBy = dto.approvedBy;
    if (dto.enrollmentId) meta.enrollmentId = dto.enrollmentId;
    if (dto.notes) meta.approvalNotes = dto.notes;
    meta.approvedAt = new Date().toISOString();
    task.status = OnboardingTaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.notes = JSON.stringify(meta);
    await onboarding.save();
    return { success: true, taskIndex, meta };
  }

  // Document verification
  async listPendingDocuments() {
    const docs = await this.documentModel.find().lean().exec();
    const pending: any[] = [];

    for (const d of docs) {
      const found = await this.onboardingModel
        .findOne({
          'tasks.documentId': new Types.ObjectId(d._id),
          'tasks.status': OnboardingTaskStatus.COMPLETED,
        })
        .lean()
        .exec();
      if (!found) pending.push(d);
    }

    return { success: true, pendingDocuments: pending };
  }

  async verifyDocument(documentId: string, verifiedBy: string, notes?: string) {
    const document = await this.documentModel.findById(documentId).exec();
    if (!document) throw new NotFoundException('Document not found');

    const onboarding = await this.onboardingModel
      .findOne({ 'tasks.documentId': document._id })
      .exec();
    if (onboarding) {
      onboarding.tasks = onboarding.tasks.map((t: any) => {
        if (
          t.documentId &&
          t.documentId.toString() === document._id.toString()
        ) {
          t.status = OnboardingTaskStatus.COMPLETED;
          t.completedAt = new Date();
          let meta: any = {};
          try {
            if (
              t.notes &&
              typeof t.notes === 'string' &&
              t.notes.startsWith('{')
            )
              meta = JSON.parse(t.notes);
            else meta.raw = t.notes;
          } catch (e) {
            meta = { raw: t.notes };
          }
          meta.verifiedBy = verifiedBy;
          meta.verifiedAt = new Date().toISOString();
          if (notes) meta.verificationNotes = notes;
          meta.documentId = document._id;
          t.notes = JSON.stringify(meta);
        }
        return t;
      });
      if (
        onboarding.tasks.every(
          (tt: any) => tt.status === OnboardingTaskStatus.COMPLETED,
        )
      ) {
        onboarding.completed = true;
        onboarding.completedAt = new Date();
      }
      await onboarding.save();
      return {
        success: true,
        documentId: document._id,
        onboardingId: onboarding._id,
      };
    }

    let ownerOnboarding = await this.onboardingModel
      .findOne({ employeeId: document.ownerId })
      .exec();
    if (!ownerOnboarding) {
      ownerOnboarding = await this.onboardingModel.create({
        employeeId: document.ownerId,
        contractId: null,
        tasks: [],
        completed: false,
      });
    }

    const createdMeta = {
      verifiedBy,
      verifiedAt: new Date().toISOString(),
      verificationNotes: notes || null,
      documentId: document._id,
      createdAt: new Date().toISOString(),
    };

    ownerOnboarding.tasks.push({
      name: `Verified document (${document.type})`,
      department: null,
      status: OnboardingTaskStatus.COMPLETED,
      deadline: new Date(),
      completedAt: new Date(),
      notes: JSON.stringify(createdMeta),
      documentId: document._id,
    });
    await ownerOnboarding.save();
    return {
      success: true,
      documentId: document._id,
      onboardingId: ownerOnboarding._id,
    };
  }

  async rejectDocument(
    documentId: string,
    verifiedBy: string,
    rejectionReason: string,
    notes?: string,
  ) {
    const document = await this.documentModel.findById(documentId).exec();
    if (!document) throw new NotFoundException('Document not found');

    const onboarding = await this.onboardingModel
      .findOne({ 'tasks.documentId': document._id })
      .exec();
    if (onboarding) {
      onboarding.tasks = onboarding.tasks.map((t: any) => {
        if (
          t.documentId &&
          t.documentId.toString() === document._id.toString()
        ) {
          t.status = OnboardingTaskStatus.PENDING;
          let meta: any = {};
          try {
            if (
              t.notes &&
              typeof t.notes === 'string' &&
              t.notes.startsWith('{')
            )
              meta = JSON.parse(t.notes);
            else meta.raw = t.notes;
          } catch (e) {
            meta = { raw: t.notes };
          }
          meta.rejectedBy = verifiedBy;
          meta.rejectionReason = rejectionReason;
          if (notes) meta.rejectionNotes = notes;
          meta.rejectedAt = new Date().toISOString();
          meta.documentId = document._id;
          t.notes = JSON.stringify(meta);
        }
        return t;
      });
      await onboarding.save();
      return {
        success: true,
        documentId: document._id,
        onboardingId: onboarding._id,
      };
    }

    let ownerOnboarding = await this.onboardingModel
      .findOne({ employeeId: document.ownerId })
      .exec();
    if (!ownerOnboarding) {
      ownerOnboarding = await this.onboardingModel.create({
        employeeId: document.ownerId,
        contractId: null,
        tasks: [],
        completed: false,
      });
    }

    const rejectionMeta = {
      rejectedBy: verifiedBy,
      rejectionReason,
      rejectionNotes: notes || null,
      documentId: document._id,
      rejectedAt: new Date().toISOString(),
    };

    ownerOnboarding.tasks.push({
      name: `Document rejected (${document.type})`,
      department: null,
      status: OnboardingTaskStatus.PENDING,
      deadline: new Date(),
      notes: JSON.stringify(rejectionMeta),
      documentId: document._id,
    });
    await ownerOnboarding.save();
    return {
      success: true,
      documentId: document._id,
      onboardingId: ownerOnboarding._id,
    };
  }

  // Helpers (Extended)
  private calculateDeadline(days = 5) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  private calculateNextReminder() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  }

  private calculateStartDate(acceptance: Date) {
    if (!acceptance) return null;
    const d = new Date(acceptance);
    d.setDate(d.getDate() + 1);
    return d;
  }

  private async generateEmployeeNumber(): Promise<string> {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomSuffix = String(Math.floor(Math.random() * 10000)).padStart(
      4,
      '0',
    );
    const candidateNumber = `EMP-${yy}${mm}${dd}-${randomSuffix}`;

    const exists = await this.employeeModel
      .findOne({ employeeNumber: candidateNumber })
      .lean()
      .exec();
    if (exists) {
      const newSuffix = String(Math.floor(Math.random() * 10000)).padStart(
        4,
        '0',
      );
      return `EMP-${yy}${mm}${dd}-${newSuffix}`;
    }

    return candidateNumber;
  }

  // ============ TERMINATION & OFFBOARDING METHODS ============

  /**
   * Initiate a termination review based on performance data or manager request
   * This allows HR Managers to create termination reviews with performance justification
   */
  async initiateTerminationReview(
    dto: InitiateTerminationReviewDto,
    hrManagerId: Types.ObjectId,
  ): Promise<TerminationRequest> {
    // Fetch performance data for the employee
    const performanceData = await this.getEmployeePerformanceData(
      dto.employeeId,
    );

    // Validate that we have sufficient performance justification
    if (
      !performanceData ||
      (performanceData.warningsCount === 0 &&
        performanceData.lowPerformanceIndicators.length === 0 &&
        !performanceData.recentAppraisalScore)
    ) {
      throw new BadRequestException(
        'Cannot initiate termination review without performance data (warnings or low performance scores)',
      );
    }

    // Create termination request
    const terminationRequest = new this.terminationRequestModel({
      employeeId: dto.employeeId,
      contractId: dto.contractId,
      initiator: TerminationInitiation.HR,
      reason: dto.reason,
      employeeComments: dto.employeeComments,
      hrComments: dto.hrComments,
      status: TerminationStatus.PENDING,
    });

    return await terminationRequest.save();
  }

  /**
   * Get employee performance data including appraisal records and warnings
   * This retrieves warnings and low performance scores from the Performance Management subsystem
   */
  async getEmployeePerformanceData(
    employeeId: Types.ObjectId,
  ): Promise<PerformanceDataForReviewDto> {
    try {
      // Mock data structure - In production, this would call Performance subsystem API
      const performanceData: PerformanceDataForReviewDto = {
        employeeId,
        warningsCount: 0,
        lowPerformanceIndicators: [],
        appraisalRecordIds: [],
      };
      return performanceData;
    } catch (error) {
      // If performance service is unavailable, return empty performance data
      console.error('Error fetching performance data:', error);
      return {
        employeeId,
        warningsCount: 0,
        lowPerformanceIndicators: [],
        appraisalRecordIds: [],
      };
    }
  }

  /**
   * Get all termination reviews for an employee
   */
  async getTerminationReviewsForEmployee(
    employeeId: Types.ObjectId,
  ): Promise<TerminationRequest[]> {
    return await this.terminationRequestModel
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all pending termination reviews
   */
  async getPendingTerminationReviews(): Promise<TerminationRequest[]> {
    return await this.terminationRequestModel
      .find({ status: TerminationStatus.PENDING })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get a specific termination review with performance data
   */
  async getTerminationReviewWithPerformance(
    terminationRequestId: Types.ObjectId,
  ): Promise<{
    terminationRequest: TerminationRequest;
    performanceData: PerformanceDataForReviewDto;
  }> {
    const terminationRequest = await this.terminationRequestModel
      .findById(terminationRequestId)
      .exec();

    if (!terminationRequest) {
      throw new NotFoundException('Termination request not found');
    }

    const performanceData = await this.getEmployeePerformanceData(
      terminationRequest.employeeId,
    );

    return {
      terminationRequest,
      performanceData,
    };
  }

  /**
   * Update termination review status
   */
  async updateTerminationReviewStatus(
    terminationRequestId: Types.ObjectId,
    status: TerminationStatus,
    hrComments?: string,
  ): Promise<TerminationRequest | null> {
    const updateData: any = { status };
    if (hrComments) {
      updateData.hrComments = hrComments;
    }

    return await this.terminationRequestModel
      .findByIdAndUpdate(terminationRequestId, updateData, { new: true })
      .exec();
  }

  /**
   * OFF-007: Record access revocation for terminated employee
   * Requirement: "System Admin/System revokes system/account access upon termination; Profile set to Inactive."
   */
  async revokeTerminatedEmployeeAccess(
    terminationId: Types.ObjectId,
    employeeId: Types.ObjectId,
    revokedBy: Types.ObjectId,
    accessType: string,
    comments?: string,
  ): Promise<any> {
    const terminationRequest = await this.terminationRequestModel
      .findById(terminationId)
      .exec();

    if (!terminationRequest) {
      throw new NotFoundException('Termination request not found');
    }

    if (terminationRequest.employeeId.toString() !== employeeId.toString()) {
      throw new BadRequestException(
        'Employee ID does not match the termination request',
      );
    }

    // Update termination request
    const updatedTermination = await this.terminationRequestModel
      .findByIdAndUpdate(
        terminationId,
        {
          status: 'TERMINATED',
          accessRevocationDate: new Date(),
          accessRevokedBy: revokedBy,
          accessType: accessType || 'ALL',
          hrComments:
            comments ||
            `System and account access revoked on ${new Date().toISOString()}`,
        },
        { new: true },
      )
      .exec();

    // OFF-007: Set employee profile status to INACTIVE when access is revoked
    await this.employeeModel.findByIdAndUpdate(
      employeeId,
      {
        status: EmployeeStatus.INACTIVE,
      },
      { new: true },
    );

    return {
      terminationId: terminationId.toString(),
      employeeId: employeeId.toString(),
      status: 'TERMINATED',
      accessRevoked: true,
      accessType: accessType || 'ALL',
      revokedBy: revokedBy.toString(),
      revokedAt: new Date(),
      comments,
      profileStatusUpdated: true,
      newProfileStatus: EmployeeStatus.INACTIVE,
    };
  }

  /**
   * OFF-007: Get terminated employees with revoked access
   */
  async getTerminatedEmployeesWithRevokedAccess(): Promise<any[]> {
    const terminatedEmployees = await this.terminationRequestModel
      .find({
        status: 'TERMINATED',
        accessRevocationDate: { $exists: true },
      })
      .sort({ accessRevocationDate: -1 })
      .exec();

    return terminatedEmployees.map((term: any) => ({
      terminationId: term._id.toString(),
      employeeId: term.employeeId.toString(),
      status: term.status,
      accessType: term.accessType || 'ALL',
      revokedBy: term.accessRevokedBy?.toString() || 'System',
      revokedAt: term.accessRevocationDate,
      reason: term.reason,
    }));
  }

  /**
   * OFF-007: Get access revocation history for specific employee
   */
  async getEmployeeAccessRevocationHistory(
    employeeId: Types.ObjectId,
  ): Promise<any> {
    const terminations = await this.terminationRequestModel
      .find({
        employeeId,
        accessRevocationDate: { $exists: true },
      })
      .sort({ accessRevocationDate: -1 })
      .exec();

    if (terminations.length === 0) {
      return {
        employeeId: employeeId.toString(),
        accessRevoked: false,
        message: 'No access revocation records found for this employee',
      };
    }

    const latestRevocation: any = terminations[0];

    return {
      employeeId: employeeId.toString(),
      accessRevoked: true,
      revocations: terminations.map((term: any) => ({
        terminationId: term._id.toString(),
        revokedAt: term.accessRevocationDate,
        revokedBy: term.accessRevokedBy?.toString() || 'System',
        accessType: term.accessType || 'ALL',
        reason: term.reason,
      })),
      latestRevocation: {
        revokedAt: latestRevocation.accessRevocationDate,
        revokedBy: latestRevocation.accessRevokedBy?.toString() || 'System',
        accessType: latestRevocation.accessType || 'ALL',
      },
    };
  }

  /**
   * OFF-006: Create offboarding checklist for employee exit
   */
  async createOffboardingChecklist(
    dto: CreateOffboardingChecklistDto,
  ): Promise<ClearanceChecklist> {
    const terminationRequest = await this.terminationRequestModel
      .findById(dto.terminationId)
      .exec();

    if (!terminationRequest) {
      throw new NotFoundException('Termination request not found');
    }

    const defaultDepartments = ['IT', 'Finance', 'Facilities', 'HR', 'Admin'];
    const items = defaultDepartments.map((dept) => ({
      department: dept,
      status: ApprovalStatus.PENDING,
      comments: '',
      updatedBy: null,
      updatedAt: new Date(),
    }));

    const equipmentList = [
      { name: 'Laptop', returned: false, condition: '' },
      { name: 'Monitor', returned: false, condition: '' },
      { name: 'Keyboard & Mouse', returned: false, condition: '' },
      { name: 'Phone', returned: false, condition: '' },
      { name: 'ID Badge/Card', returned: false, condition: '' },
      { name: 'Access Cards', returned: false, condition: '' },
      { name: 'Keys', returned: false, condition: '' },
    ];

    const offboardingChecklist = new this.clearanceChecklistModel({
      terminationId: dto.terminationId,
      items,
      equipmentList,
      cardReturned: false,
    });

    return await offboardingChecklist.save();
  }

  /**
   * Get offboarding checklist for a termination
   */
  async getOffboardingChecklist(
    terminationId: Types.ObjectId,
  ): Promise<OffboardingChecklistResponseDto> {
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId })
      .exec();

    if (!checklist) {
      throw new NotFoundException('Offboarding checklist not found');
    }

    return this.mapToResponseDto(checklist);
  }

  /**
   * Update department approval status in offboarding checklist
   */
  async updateDepartmentApproval(
    terminationId: Types.ObjectId,
    department: string,
    status: ApprovalStatus,
    comments?: string,
    updatedBy?: Types.ObjectId,
  ): Promise<OffboardingChecklistResponseDto> {
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId })
      .exec();

    if (!checklist) {
      throw new NotFoundException('Offboarding checklist not found');
    }

    const itemIndex = checklist.items.findIndex(
      (item: any) => item.department === department,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Department '${department}' not found in checklist`,
      );
    }

    checklist.items[itemIndex].status = status;
    if (comments !== undefined) {
      checklist.items[itemIndex].comments = comments;
    }
    checklist.items[itemIndex].updatedBy = updatedBy || null;
    checklist.items[itemIndex].updatedAt = new Date();

    await checklist.save();
    return this.mapToResponseDto(checklist);
  }

  /**
   * Update equipment return status
   */
  async updateEquipmentReturn(
    terminationId: Types.ObjectId,
    equipmentUpdates: Array<{
      name: string;
      returned: boolean;
      condition?: string;
    }>,
  ): Promise<OffboardingChecklistResponseDto> {
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId })
      .exec();

    if (!checklist) {
      throw new NotFoundException('Offboarding checklist not found');
    }

    for (const update of equipmentUpdates) {
      const equipmentIndex = checklist.equipmentList.findIndex(
        (eq: any) => eq.name === update.name,
      );

      if (equipmentIndex !== -1) {
        checklist.equipmentList[equipmentIndex].returned = update.returned;
        if (update.condition !== undefined) {
          checklist.equipmentList[equipmentIndex].condition = update.condition;
        }
      }
    }

    const cardEquipment = checklist.equipmentList.find(
      (eq: any) => eq.name === 'ID Badge/Card' || eq.name === 'Access Cards',
    );
    if (cardEquipment) {
      checklist.cardReturned = cardEquipment.returned;
    }

    await checklist.save();
    return this.mapToResponseDto(checklist);
  }

  /**
   * Get offboarding checklist summary
   */
  async getOffboardingChecklistSummary(
    terminationId: Types.ObjectId,
  ): Promise<OffboardingChecklistSummaryDto> {
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId })
      .exec();

    if (!checklist) {
      throw new NotFoundException('Offboarding checklist not found');
    }

    const totalItems = checklist.items.length;
    const approvedItems = checklist.items.filter(
      (item: any) => item.status === ApprovalStatus.APPROVED,
    ).length;
    const pendingItems = checklist.items.filter(
      (item: any) => item.status === ApprovalStatus.PENDING,
    ).length;
    const rejectedItems = checklist.items.filter(
      (item: any) => item.status === ApprovalStatus.REJECTED,
    ).length;

    const completionPercentage =
      totalItems > 0 ? (approvedItems / totalItems) * 100 : 0;

    const totalEquipment = checklist.equipmentList.length;
    const equipmentReturned = checklist.equipmentList.filter(
      (eq: any) => eq.returned,
    ).length;

    let overallStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'INCOMPLETE';
    if (completionPercentage === 100 && equipmentReturned === totalEquipment) {
      overallStatus = 'COMPLETED';
    } else if (completionPercentage === 0 && equipmentReturned === 0) {
      overallStatus = 'PENDING';
    } else if (rejectedItems > 0) {
      overallStatus = 'INCOMPLETE';
    } else {
      overallStatus = 'IN_PROGRESS';
    }

    return {
      totalItems,
      approvedItems,
      pendingItems,
      rejectedItems,
      completionPercentage,
      equipmentReturned,
      totalEquipment,
      cardReturned: checklist.cardReturned,
      overallStatus,
    };
  }

  /**
   * Mark offboarding as completed
   */
  async completeOffboarding(
    terminationId: Types.ObjectId,
  ): Promise<OffboardingChecklistResponseDto> {
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId })
      .exec();

    if (!checklist) {
      throw new NotFoundException('Offboarding checklist not found');
    }

    const allApproved = checklist.items.every(
      (item: any) => item.status === ApprovalStatus.APPROVED,
    );
    const allEquipmentReturned = checklist.equipmentList.every(
      (eq: any) => eq.returned,
    );

    if (!allApproved || !allEquipmentReturned) {
      throw new BadRequestException(
        'Cannot complete offboarding: all items must be approved and equipment returned',
      );
    }

    await this.terminationRequestModel.findByIdAndUpdate(
      terminationId,
      { status: TerminationStatus.APPROVED },
      { new: true },
    );

    return this.mapToResponseDto(checklist);
  }

  /**
   * Helper method to map ClearanceChecklist to response DTO
   */
  private mapToResponseDto(checklist: any): OffboardingChecklistResponseDto {
    return {
      _id: checklist._id.toString(),
      terminationId: checklist.terminationId.toString(),
      items: checklist.items || [],
      equipmentList: checklist.equipmentList || [],
      cardReturned: checklist.cardReturned || false,
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt,
    };
  }

  /**
   * OFF-010: Update department clearance status
   */
  async updateClearanceStatus(
    terminationId: Types.ObjectId,
    department: string,
    status: string,
    updatedBy: Types.ObjectId,
    comments?: string,
  ): Promise<any> {
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId })
      .exec();

    if (!checklist) {
      throw new NotFoundException('Offboarding checklist not found');
    }

    const itemIndex = checklist.items.findIndex(
      (item: any) => item.department === department,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Department '${department}' not found in clearance list`,
      );
    }

    checklist.items[itemIndex].status = status;
    checklist.items[itemIndex].comments =
      comments || checklist.items[itemIndex].comments;
    checklist.items[itemIndex].updatedBy = updatedBy;
    checklist.items[itemIndex].updatedAt = new Date();

    await checklist.save();

    return {
      terminationId: terminationId.toString(),
      department,
      status,
      updatedAt: new Date(),
    };
  }

  /**
   * OFF-010: Get full clearance status for termination
   */
  async getFullClearanceStatus(terminationId: Types.ObjectId): Promise<any> {
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId })
      .exec();

    if (!checklist) {
      throw new NotFoundException('Offboarding checklist not found');
    }

    const terminationRequest = await this.terminationRequestModel
      .findById(terminationId)
      .exec();

    const items = checklist.items || [];
    const totalDepts = items.length;
    const approvedItems = items.filter(
      (item: any) => item.status === 'APPROVED',
    ).length;
    const pendingItems = items.filter(
      (item: any) => item.status === 'PENDING',
    ).length;
    const rejectedItems = items.filter(
      (item: any) => item.status === 'REJECTED',
    ).length;

    const clearanceCompletion =
      totalDepts > 0 ? ((approvedItems + rejectedItems) / totalDepts) * 100 : 0;
    const allApproved = approvedItems === totalDepts && rejectedItems === 0;

    const pendingDepartments = items
      .filter((item: any) => item.status === 'PENDING')
      .map((item: any) => item.department);

    const rejectedDepartments = items
      .filter((item: any) => item.status === 'REJECTED')
      .map((item: any) => item.department);

    const approvedDepartments = items
      .filter((item: any) => item.status === 'APPROVED')
      .map((item: any) => item.department);

    return {
      terminationId: terminationId.toString(),
      employeeId: terminationRequest?.employeeId.toString() || 'Unknown',
      fullyClearedStatus: allApproved,
      clearanceCompletion,
      allApproved,
      pendingDepartments,
      rejectedDepartments,
      approvedDepartments,
      summary: {
        totalDepartments: totalDepts,
        approvedCount: approvedItems,
        pendingCount: pendingItems,
        rejectedCount: rejectedItems,
      },
    };
  }

  /**
   * OFF-010: Get pending clearances
   */
  async getPendingClearances(): Promise<any[]> {
    const checklists = await this.clearanceChecklistModel
      .find({
        'items.status': 'PENDING',
      })
      .exec();

    return checklists.map((checklist: any) => {
      const pendingItems = checklist.items.filter(
        (item: any) => item.status === 'PENDING',
      );

      return {
        terminationId: checklist.terminationId.toString(),
        pendingDepartments: pendingItems.map((item: any) => item.department),
        pendingCount: pendingItems.length,
        totalDepartments: checklist.items.length,
      };
    });
  }

  /**
   * OFF-010: Get fully cleared terminations
   */
  async getFullyClearedTerminations(): Promise<any[]> {
    const checklists = await this.clearanceChecklistModel.find({}).exec();
    const results: any[] = [];

    for (const checklist of checklists) {
      const items = checklist.items || [];
      const allApproved = items.every(
        (item: any) => item.status === 'APPROVED',
      );

      if (allApproved && items.length > 0) {
        const terminationRequest = await this.terminationRequestModel
          .findById(checklist.terminationId)
          .exec();

        results.push({
          terminationId: checklist.terminationId.toString(),
          employeeId: terminationRequest?.employeeId.toString() || 'Unknown',
          departmentCount: items.length,
        });
      }
    }

    return results;
  }

  /**
   * OFF-010: Verify if employee is fully cleared
   */
  async isEmployeeFullyCleared(
    terminationId: Types.ObjectId,
  ): Promise<boolean> {
    const checklist = await this.clearanceChecklistModel
      .findOne({ terminationId })
      .exec();

    if (!checklist) {
      return false;
    }

    const items = checklist.items || [];
    return (
      items.length > 0 && items.every((item: any) => item.status === 'APPROVED')
    );
  }

  /**
   * OFF-013: Send offboarding notification
   */
  async sendOffboardingNotification(
    terminationId: Types.ObjectId,
    dto: any,
    hrManagerId: Types.ObjectId,
  ): Promise<any> {
    const terminationRequest = await this.terminationRequestModel
      .findById(terminationId)
      .exec();

    if (!terminationRequest) {
      throw new NotFoundException('Termination request not found');
    }

    const finalPayCalculation = await this.calculateFinalPay(
      terminationRequest.employeeId,
      terminationRequest.terminationDate || new Date(),
    );

    const leaveBalance = await this.getLeaveBalance(
      terminationRequest.employeeId,
    );
    const benefits = await this.getEmployeeBenefits(
      terminationRequest.employeeId,
    );

    const notificationData = {
      terminationId,
      employeeId: terminationRequest.employeeId,
      notificationType: dto.notificationType || 'FINAL_PAY_CALCULATION',
      recipientDepartments: dto.recipientDepartments || [
        'HR',
        'Payroll',
        'Finance',
      ],
      finalPayCalculation,
      leaveBalance,
      benefitsTermination: benefits,
      notificationStatus: 'SENT',
      sentAt: new Date(),
      sentBy: hrManagerId,
    };

    const updated = await this.terminationRequestModel
      .findByIdAndUpdate(
        terminationId,
        {
          $set: {
            offboardingNotifications: notificationData,
            notificationSentDate: new Date(),
            notificationSentBy: hrManagerId,
          },
        },
        { new: true },
      )
      .exec();

    return this.mapNotificationToResponseDto(updated as any);
  }

  /**
   * OFF-013: Calculate final pay
   */
  async calculateFinalPay(
    employeeId: Types.ObjectId,
    terminationDate: Date,
  ): Promise<any> {
    const baseSalary = 50000;
    const leaveBalance = await this.getLeaveBalance(employeeId);

    const leaveEncashmentAmount =
      leaveBalance.balanceLeaveDays * (baseSalary / 30);

    const deductions = {
      pendingLoans: 0,
      advanceSalary: 0,
      otherDeductions: [],
      totalDeductions: 0,
    };

    const netFinalPayment = leaveEncashmentAmount - deductions.totalDeductions;

    return {
      terminationId: employeeId.toString(),
      employeeId: employeeId.toString(),
      terminationDate,
      baseSalary,
      netFinalPayment,
      calculatedAt: new Date(),
    };
  }

  /**
   * OFF-013: Get leave balance for employee
   */
  async getLeaveBalance(employeeId: Types.ObjectId): Promise<any> {
    return {
      employeeId: employeeId.toString(),
      totalLeaveDays: 30,
      usedLeaveDays: 10,
      balanceLeaveDays: 20,
      encashmentRate: 100,
      calculatedAt: new Date(),
    };
  }

  /**
   * OFF-013: Get employee benefits information
   */
  async getEmployeeBenefits(employeeId: Types.ObjectId): Promise<any> {
    return {
      terminationId: employeeId.toString(),
      employeeId: employeeId.toString(),
      terminationDate: new Date(),
      benefits: [
        {
          benefitId: 'health-001',
          benefitType: 'HEALTH_INSURANCE',
          benefitName: 'Health Insurance Plan',
          terminationDate: new Date(),
        },
        {
          benefitId: 'life-001',
          benefitType: 'LIFE_INSURANCE',
          benefitName: 'Life Insurance',
          terminationDate: new Date(),
        },
      ],
      notificationSent: false,
    };
  }

  /**
   * OFF-013: Trigger benefits termination for employee
   */
  async triggerBenefitsTermination(
    terminationId: Types.ObjectId,
    terminationDate: Date,
  ): Promise<any> {
    const terminationRequest = await this.terminationRequestModel
      .findById(terminationId)
      .exec();

    if (!terminationRequest) {
      throw new NotFoundException('Termination request not found');
    }

    const updated = await this.terminationRequestModel
      .findByIdAndUpdate(
        terminationId,
        {
          $set: {
            benefitsTerminationTriggered: true,
            benefitsTerminationDate: terminationDate,
            benefitsTerminationTriggeredAt: new Date(),
            benefitsTerminationStatus: 'INITIATED',
          },
        },
        { new: true },
      )
      .exec();

    return {
      terminationId,
      benefitsTerminationTriggered: true,
      benefitsTerminationDate: terminationDate,
      triggeredAt: new Date(),
      status: 'SUCCESS',
    };
  }

  /**
   * OFF-013: Get offboarding notification history
   */
  async getOffboardingNotificationHistory(
    terminationId: Types.ObjectId,
  ): Promise<any> {
    const terminationRequest = await this.terminationRequestModel
      .findById(terminationId)
      .exec();

    if (!terminationRequest) {
      throw new NotFoundException('Termination request not found');
    }

    const notificationHistory =
      (terminationRequest as any).notificationsHistory || [];
    const recentNotification = (terminationRequest as any)
      .offboardingNotifications;

    const allNotifications = recentNotification
      ? [recentNotification, ...notificationHistory]
      : notificationHistory;

    const sentNotifications = allNotifications.filter(
      (notif: any) => notif.notificationStatus === 'SENT',
    );

    return {
      terminationId: terminationId.toString(),
      employeeId: terminationRequest.employeeId.toString(),
      totalNotificationsSent: sentNotifications.length,
    };
  }

  /**
   * Helper method to map notification data to response DTO
   */
  private mapNotificationToResponseDto(notification: any): any {
    return {
      _id: notification._id.toString(),
      terminationId: notification._id.toString(),
      employeeId: notification.employeeId.toString(),
      notificationType:
        notification.offboardingNotifications?.notificationType ||
        'FINAL_PAY_CALCULATION',
      notificationStatus:
        notification.offboardingNotifications?.notificationStatus || 'PENDING',
      sentAt: notification.notificationSentDate,
      createdAt: notification.createdAt,
    };
  }

  /**
   * OFF-018: Submit resignation request
   */
  async submitResignationRequest(
    employeeId: Types.ObjectId,
    dto: any,
  ): Promise<any> {
    const resignationData = {
      employeeId,
      initiator: 'EMPLOYEE',
      reason: dto.resignationReason,
      employeeComments: dto.additionalComments,
      status: 'PENDING',
      resignationType: 'VOLUNTARY',
      lastWorkingDay:
        dto.lastWorkingDay || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      noticePeriodinDays: dto.noticePeriodinDays || 30,
      resignationSubmittedAt: new Date(),
      resignationSubmittedBy: employeeId,
      attachments: dto.attachments || [],
    };

    const newResignation = new this.terminationRequestModel({
      ...resignationData,
      contractId: new Types.ObjectId(),
    });

    const savedResignation = await newResignation.save();

    return {
      _id: savedResignation._id.toString(),
      employeeId: employeeId.toString(),
      resignationReason: dto.resignationReason,
      status: 'PENDING',
      submittedAt: resignationData.resignationSubmittedAt,
    };
  }

  /**
   * OFF-019: Get resignation status
   */
  async getResignationStatus(resignationId: Types.ObjectId): Promise<any> {
    const resignation = await this.terminationRequestModel
      .findById(resignationId)
      .exec();

    if (!resignation) {
      throw new NotFoundException('Resignation request not found');
    }

    const resignData = resignation as any;

    return {
      _id: resignationId.toString(),
      employeeId: resignData.employeeId.toString(),
      status: resignData.status,
    };
  }

  /**
   * OFF-019: Track resignation request
   */
  async trackResignationRequest(resignationId: Types.ObjectId): Promise<any> {
    const resignation = await this.terminationRequestModel
      .findById(resignationId)
      .exec();

    if (!resignation) {
      throw new NotFoundException('Resignation request not found');
    }

    const resignData = resignation as any;

    return {
      resignationId: resignationId.toString(),
      employeeId: resignData.employeeId.toString(),
      currentStatus: resignData.status,
    };
  }

  /**
   * OFF-019: Get resignation history
   */
  async getResignationHistory(resignationId: Types.ObjectId): Promise<any> {
    const resignation = await this.terminationRequestModel
      .findById(resignationId)
      .exec();

    if (!resignation) {
      throw new NotFoundException('Resignation request not found');
    }

    const resignData = resignation as any;

    return {
      resignationId: resignationId.toString(),
      employeeId: resignData.employeeId.toString(),
      resignationReason: resignData.reason,
      currentStatus: resignData.status,
    };
  }

  /**
   * OFF-018/019: Update resignation status
   */
  async updateResignationStatus(
    resignationId: Types.ObjectId,
    status: string,
    comments?: string,
    updatedBy?: Types.ObjectId,
  ): Promise<any> {
    const resignation = await this.terminationRequestModel
      .findById(resignationId)
      .exec();

    if (!resignation) {
      throw new NotFoundException('Resignation request not found');
    }

    const resignData = resignation as any;
    const oldStatus = resignData.status;

    const updateData: any = {
      status,
    };

    if (status === 'APPROVED') {
      updateData.resignationApprovedAt = new Date();
      updateData.resignationApprovedBy = updatedBy;
    } else if (status === 'REJECTED') {
      updateData.resignationRejectionDate = new Date();
      updateData.resignationRejectionReason = comments;
    }

    await this.terminationRequestModel
      .findByIdAndUpdate(resignationId, { $set: updateData }, { new: true })
      .exec();

    return {
      resignationId: resignationId.toString(),
      previousStatus: oldStatus,
      newStatus: status,
      updatedAt: new Date(),
    };
  }

  /**
   * OFF-018/019: Get employee resignations
   */
  async getEmployeeResignations(employeeId: Types.ObjectId): Promise<any> {
    const resignations = await this.terminationRequestModel
      .find({
        employeeId,
        initiator: 'EMPLOYEE',
      })
      .exec();

    const totalCount = resignations.length;
    const pendingCount = resignations.filter(
      (r: any) => r.status === 'PENDING',
    ).length;
    const approvedCount = resignations.filter(
      (r: any) => r.status === 'APPROVED',
    ).length;

    return {
      employeeId: employeeId.toString(),
      totalResignations: totalCount,
      pendingResignations: pendingCount,
      approvedResignations: approvedCount,
    };
  }
}

function mapStageEnumToName(stage?: unknown): string | undefined {
  if (!stage) return undefined;
  const s = String(stage).toLowerCase();
  if (s === 'screening') return 'Screening';
  if (s === 'department_interview' || s === 'hr_interview') return 'Interview';
  if (s === 'offer') return 'Offer';
  return undefined;
}
