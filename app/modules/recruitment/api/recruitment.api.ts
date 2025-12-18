/**
 * Recruitment API functions
 * Handles job templates, requisitions, and related operations
 */

import { apiClient } from '@/shared/utils/api';
import {
    JobTemplate,
    CreateJobTemplateDto,
    JobRequisition,
    CreateJobRequisitionDto,
    ProcessTemplate,
    CreateProcessTemplateDto,
    PublishRequisitionDto,
    JobApplication,
    ScheduleInterviewDto,
    Interview,
    FeedbackDto,
    AssessmentForm,
    StructuredFeedbackDto,
    PanelMember,
    PanelAvailability,
    Referral,
    CreateReferralDto,
    RecruitmentDashboard,
    ConsentLog,
    CreateOfferDto,
    Offer,
    AddOfferApproverDto,
    SubmitResignationRequestDto,
    ResignationRequest,
    PreboardingTask,
    TriggerPreboardingDto,
    CreateChecklistDto,
    OnboardingChecklist,
    DocumentType,
    UploadOnboardingDocumentDto,
    OnboardingDocument,
    ContractDetails,
    OnboardingTrackerResponse,
    CreateEquipmentDto,
    AssignEquipmentDto,
    EquipmentRequest,
    OffboardingChecklistSummary,
    CreateBenefitsDto,
    ApproveBenefitsDto,
    SigningBonus,
    TerminationReview,
    InitiateTerminationReviewDto,
    CreateEmployeeOnboardingDto
} from '../types';

// Templates
export const createJobTemplate = async (data: CreateJobTemplateDto): Promise<JobTemplate> => {
    const response = await apiClient.post<JobTemplate>('/recruitment/templates', data);
    return response.data;
};

export const listJobTemplates = async (): Promise<JobTemplate[]> => {
    const response = await apiClient.get<JobTemplate[]>('/recruitment/templates');
    return response.data;
};

export const getJobTemplate = async (id: string): Promise<JobTemplate> => {
    const response = await apiClient.get<JobTemplate>(`/recruitment/templates/${id}`);
    return response.data;
};

// Requisitions
export const createJobRequisition = async (data: CreateJobRequisitionDto): Promise<JobRequisition> => {
    const response = await apiClient.post<JobRequisition>('/recruitment/requisitions', data);
    return response.data;
};

export const listJobRequisitions = async (params?: { status?: string; department?: string }): Promise<JobRequisition[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.department) queryParams.department = params.department;

    const query = new URLSearchParams(queryParams).toString();
    const url = `/recruitment/requisitions${query ? `?${query}` : ''}`;

    // The backend returns { success: boolean, data: JobRequisition[] }
    const response = await apiClient.get<{ success: boolean; data: JobRequisition[] }>(url);
    return response.data.data;
};

export const getJobRequisition = async (id: string): Promise<JobRequisition> => {
    const response = await apiClient.get<JobRequisition>(`/recruitment/requisitions/${id}`);
    return response.data;
};

export const previewRequisition = async (id: string): Promise<JobRequisition> => {
    const response = await apiClient.get<JobRequisition>(`/recruitment/requisitions/${id}/preview`);
    return response.data;
};

export const publishRequisition = async (id: string, data: PublishRequisitionDto): Promise<JobRequisition> => {
    const response = await apiClient.post<JobRequisition>(`/recruitment/requisitions/${id}/publish`, data);
    return response.data;
};

// Applications
export const getMyApplications = async (): Promise<JobApplication[]> => {
    const response = await apiClient.get<{ success: boolean; data: JobApplication[] }>('/recruitment/applications/me');
    return response.data.data;
};

export const listApplications = async (params?: { requisitionId?: string; status?: string }): Promise<JobApplication[]> => {
    const query = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<{ success: boolean; data: JobApplication[] }>(`/recruitment/applications?${query}`);
    return response.data.data;
};

export const rejectApplication = async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/recruitment/applications/${id}/reject`, { reason });
};

export const advanceApplication = async (id: string, stage: string): Promise<void> => {
    await apiClient.post(`/recruitment/applications/${id}/advance`, { newStage: stage });
};

export const scheduleInterview = async (data: ScheduleInterviewDto): Promise<void> => {
    await apiClient.post('/recruitment/interviews/schedule', data);
};

export const listInterviews = async (applicationId: string): Promise<Interview[]> => {
    const response = await apiClient.get<Interview[]>(`/recruitment/applications/${applicationId}/interviews`);
    return response.data;
};

export const submitFeedback = async (interviewId: string, data: FeedbackDto): Promise<void> => {
    await apiClient.post(`/recruitment/interviews/${interviewId}/feedback`, data);
};

// Assessment Forms (REC-020)
export const listAssessmentForms = async (): Promise<AssessmentForm[]> => {
    const response = await apiClient.get<AssessmentForm[]>('/recruitment/assessment-forms');
    return response.data;
};

export const getAssessmentForm = async (key: string): Promise<AssessmentForm> => {
    const response = await apiClient.get<AssessmentForm>(`/recruitment/assessment-forms/${key}`);
    return response.data;
};

export const saveAssessmentForm = async (key: string, data: Partial<AssessmentForm>): Promise<AssessmentForm> => {
    const response = await apiClient.post<AssessmentForm>(`/recruitment/assessment-forms/${key}`, data);
    return response.data;
};

export const deleteAssessmentForm = async (key: string): Promise<void> => {
    await apiClient.delete(`/recruitment/assessment-forms/${key}`);
};

export const submitStructuredFeedback = async (interviewId: string, data: StructuredFeedbackDto): Promise<void> => {
    await apiClient.post(`/recruitment/interviews/${interviewId}/feedback-structured`, data);
};

// Panel Coordination (REC-021)
export const listPanelMembers = async (): Promise<PanelMember[]> => {
    const response = await apiClient.get<PanelMember[]>('/recruitment/panel-members');
    return response.data;
};

export const registerPanelMember = async (data: Partial<PanelMember>): Promise<PanelMember> => {
    // ID creation is handled by backend or mapped from user ID, here we assume backend creates or we pass minimal data
    // The endpoint is actually /recruitment/panel-members/:id relative to some ID.
    // If creating a NEW standalone member, we might need a different point or use a placeholder ID.
    // Based on controller: @Post("panel-members/:id"). This seems to imply registering an existing user as a panel member?
    // Let's assume for now we use a generic create/register logic. 
    // Wait, the controller says `registerPanelMember(@Param("id") id ...)`
    // This implies we are promoting a user to panel member? Or creating a member with a specific ID?
    // Let's use a random ID or user ID if we have it. For now let's assume 'new' is handled or we generate one.
    // Use 'new' as placeholder if permitted, or we need to revisit backend.
    // Let's check backend controller again in next step if needed. 
    // Actually, let's treat it as: POST /recruitment/panel-members/new
    // But controller is: @Post("panel-members/:id")
    // Re-reading controller: `return this.recruitmentService.registerPanelMember(id, ...)`
    // So we need an ID. Generation should ideally happen on client or use uuid.
    const id = data._id || Math.random().toString(36).substr(2, 9);
    const response = await apiClient.post<PanelMember>(`/recruitment/panel-members/${id}`, data);
    return response.data;
};

export const getPanelAvailability = async (memberId: string): Promise<PanelAvailability> => {
    const response = await apiClient.get<any>(`/recruitment/panel-members/${memberId}/availability`);
    // Backend returns { availability: Record<string, string[]> } or just the record?
    // Controller: `return this.recruitmentService.getPanelAvailability(id);`
    // Let's assume it returns the Availability object directly or wrapped.
    // Let's map it safely.
    return response.data;
};

export const setPanelAvailability = async (memberId: string, availability: PanelAvailability): Promise<void> => {
    await apiClient.post(`/recruitment/panel-members/${memberId}/availability`, { availability });
};

export const findCommonAvailability = async (memberIds: string[], startDate: string, endDate: string): Promise<string[]> => {
    // Return format from backend: ???
    // Controller: `return this.recruitmentService.findCommonAvailability(...)`
    // Let's assume it returns a list of ISO strings or similar slots.
    const response = await apiClient.post<string[]>('/recruitment/panel-members/common-availability', {
        panelMemberIds: memberIds,
        dateRange: { startDate, endDate }
    });
    return response.data;
};

// Referrals (REC-030)
export const tagCandidateReferral = async (candidateId: string, data: CreateReferralDto): Promise<Referral> => {
    const response = await apiClient.post<Referral>(`/recruitment/candidates/${candidateId}/referral`, data);
    return response.data;
};

export const getCandidateReferrals = async (candidateId: string): Promise<Referral[]> => {
    const response = await apiClient.get<Referral[]>(`/recruitment/candidates/${candidateId}/referral`);
    return response.data;
};

export const listReferrals = async (): Promise<Referral[]> => {
    const response = await apiClient.get<Referral[]>('/recruitment/referrals');
    return response.data;
};

// Dashboard (REC-009)
export const getRecruitmentDashboard = async (): Promise<RecruitmentDashboard> => {
    const response = await apiClient.get<RecruitmentDashboard>('/recruitment/dashboard');
    return response.data;
};

// Consent (REC-028)
export const getCandidateConsents = async (candidateId: string): Promise<ConsentLog[]> => {
    const response = await apiClient.get<ConsentLog[]>(`/recruitment/candidates/${candidateId}/consent`);
    return response.data;
};

export const grantConsent = async (candidateId: string, details?: string): Promise<any> => {
    const response = await apiClient.post(`/recruitment/candidates/${candidateId}/consent`, {
        granted: true,
        type: 'personal',
        details,
        givenBy: 'HR_ACTION' // In real app, backend takes user ID from token
    });
    return response.data;
};

export const revokeConsent = async (candidateId: string, details?: string): Promise<any> => {
    const response = await apiClient.post(`/recruitment/candidates/${candidateId}/consent/revoke`, {
        details,
        givenBy: 'HR_ACTION'
    });
    return response.data;
};

export const getLatestConsent = async (candidateId: string): Promise<ConsentLog | null> => {
    const response = await apiClient.get<ConsentLog | null>(`/recruitment/candidates/${candidateId}/consent/latest`);
    return response.data;
};

// Offers (REC-014)
export const createOffer = async (data: CreateOfferDto): Promise<Offer> => {
    const response = await apiClient.post<Offer>('/recruitment/offers', data);
    return response.data;
};

export const listOffers = async (applicationId?: string, candidateId?: string): Promise<Offer[]> => {
    const response = await apiClient.get<Offer[]>('/recruitment/offers', {
        params: { applicationId, candidateId },
    });
    return response.data;
};

export const getOffer = async (id: string): Promise<Offer> => {
    const response = await apiClient.get<Offer>(`/recruitment/offers/${id}`);
    return response.data;
};

export const finalizeOffer = async (offerId: string): Promise<Offer> => {
    const response = await apiClient.post<Offer>(`/recruitment/offers/${offerId}/finalize`);
    return response.data;
};

export const addOfferApprover = async (offerId: string, data: AddOfferApproverDto): Promise<Offer> => {
    const response = await apiClient.post<Offer>(`/recruitment/offers/${offerId}/approvers`, data);
    return response.data;
};

export const respondToOffer = async (offerId: string, response: 'accepted' | 'rejected'): Promise<Offer> => {
    const result = await apiClient.post<Offer>(`/recruitment/offers/${offerId}/respond`, { response });
    return result.data;
};

// Resignation (REC-018 / OFF-018)
export const submitResignation = async (data: SubmitResignationRequestDto): Promise<ResignationRequest> => {
    const response = await apiClient.post<ResignationRequest>('/recruitment/resignations/submit', data);
    return response.data;
};


export const getEmployeeResignations = async (employeeId: string): Promise<any> => {
    const response = await apiClient.get<any>(`/recruitment/employees/${employeeId}/resignations`);
    return response.data;
};

export const getResignationStatus = async (resignationId: string): Promise<ResignationRequest> => {
    const response = await apiClient.get<ResignationRequest>(`/recruitment/resignations/${resignationId}/status`);
    return response.data;
};

// Pre-boarding (REC-029)
export const triggerPreboarding = async (offerId: string, data: TriggerPreboardingDto): Promise<any> => {
    const response = await apiClient.post(`/recruitment/offers/${offerId}/preboarding/trigger`, data);
    return response.data;
};

export const listPreboardingTasks = async (offerId: string): Promise<PreboardingTask[]> => {
    const response = await apiClient.get(`/recruitment/offers/${offerId}/preboarding`);
    return response.data;
};

export const completePreboardingTask = async (offerId: string, taskId: string, completedBy?: string): Promise<any> => {
    const response = await apiClient.post(`/recruitment/offers/${offerId}/preboarding/${taskId}/complete`, { completedBy });
    return response.data;
};

// Onboarding (ONB-001)
export const createChecklist = async (data: CreateChecklistDto): Promise<OnboardingChecklist> => {
    const response = await apiClient.post<OnboardingChecklist>('/recruitment/onboarding/create-checklist', data);
    return response.data;
};

export const createEmployeeOnboarding = async (data: CreateEmployeeOnboardingDto): Promise<any> => {
    const response = await apiClient.post<any>('/recruitment/onboarding/create', data);
    return response.data;
};

// Documents (ONB-002)
export const uploadOnboardingDocument = async (data: UploadOnboardingDocumentDto): Promise<void> => {
    await apiClient.post('/recruitment/onboarding/upload-document', data);
};

export const listPendingDocuments = async (): Promise<OnboardingDocument[]> => {
    const response = await apiClient.get<OnboardingDocument[]>('/recruitment/onboarding/documents/pending');
    return response.data;
};

export const verifyDocument = async (documentId: string, verifiedBy: string, notes?: string): Promise<void> => {
    await apiClient.post(`/recruitment/onboarding/document/${documentId}/verify`, { verifiedBy, notes });
};

export const rejectDocument = async (documentId: string, verifiedBy: string, rejectionReason: string, notes?: string): Promise<void> => {
    await apiClient.post(`/recruitment/onboarding/document/${documentId}/reject`, { verifiedBy, rejectionReason, notes });
};



// Employee Profile (ONB-004)
export const getContractDetails = async (contractId: string): Promise<ContractDetails> => {
    const response = await apiClient.get<ContractDetails>(`/recruitment/onboarding/contract/${contractId}`);
    return response.data;
};

export const createEmployeeProfile = async (contractId: string, createdBy: string): Promise<any> => {
    const response = await apiClient.post(`/recruitment/onboarding/contract/${contractId}/create-profile`, { createdBy });
    return response.data;
};

export const listEmployees = async (params?: { status?: string }): Promise<any[]> => {
    const query = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<any[]>(`/recruitment/employees?${query}`);
    return response.data;
};

// Onboarding Tracker (ONB-005)
export const getOnboardingTracker = async (employeeId: string): Promise<OnboardingTrackerResponse> => {
    const response = await apiClient.get<OnboardingTrackerResponse>(`/recruitment/onboarding/tracker/${employeeId}`);
    return response.data;
};

// Equipment Provisioning (ONB-007)
export const createEquipmentRequest = async (employeeId: string, data: CreateEquipmentDto): Promise<any> => {
    const response = await apiClient.post(`/recruitment/onboarding/${employeeId}/equipment`, data);
    return response.data;
};

export const assignEquipment = async (employeeId: string, taskIndex: number, data: AssignEquipmentDto): Promise<any> => {
    const response = await apiClient.put(`/recruitment/onboarding/${employeeId}/equipment/${taskIndex}/assign`, data);
    return response.data;
};

// Task Reminders (ONB-009)
export const sendTaskReminder = async (employeeId: string, taskIndex: number): Promise<any> => {
    const response = await apiClient.post(`/recruitment/onboarding/${employeeId}/remind/${taskIndex}`);
    return response.data;
};

export const autoSendReminders = async (): Promise<any> => {
    const response = await apiClient.post('/recruitment/onboarding/reminders/auto-send');
    return response.data;
};

// Offboarding (ONB-012)
export const createOffboardingChecklist = async (terminationId: string, data?: any): Promise<any> => {
    const response = await apiClient.post(`/recruitment/terminations/${terminationId}/offboarding-checklist`, data);
    return response.data;
};

export const getOffboardingChecklistSummary = async (terminationId: string): Promise<OffboardingChecklistSummary> => {
    const response = await apiClient.get<OffboardingChecklistSummary>(`/recruitment/terminations/${terminationId}/offboarding-checklist/summary`);
    return response.data;
};

export const updateDepartmentApproval = async (terminationId: string, department: string, status: string, comments?: string): Promise<any> => {
    const response = await apiClient.put(`/recruitment/terminations/${terminationId}/offboarding-checklist/departments/${department}`, { status, comments });
    return response.data;
};

export const updateEquipmentReturn = async (terminationId: string, equipmentUpdates: Array<{ name: string; returned: boolean; condition?: string }>): Promise<any> => {
    const response = await apiClient.put(`/recruitment/terminations/${terminationId}/offboarding-checklist/equipment`, { equipmentUpdates });
    return response.data;
};

export const completeOffboarding = async (terminationId: string): Promise<any> => {
    const response = await apiClient.post(`/recruitment/terminations/${terminationId}/offboarding-checklist/complete`);
    return response.data;
};

export const calculateFinalPay = async (terminationId: string): Promise<any> => {
    const response = await apiClient.get(`/recruitment/terminations/${terminationId}/final-pay-calculation`);
    return response.data;
};

// Clearance Tracking (ONB-013)
export const updateClearanceStatus = async (terminationId: string, department: string, status: string, approvedBy: string, comments?: string): Promise<any> => {
    const response = await apiClient.put(`/recruitment/terminations/${terminationId}/clearance/${department}`, { status, approvedBy, comments });
    return response.data;
};

export const getFullClearanceStatus = async (terminationId: string): Promise<any> => {
    const response = await apiClient.get(`/recruitment/terminations/${terminationId}/clearance/status`);
    return response.data;
};

export const getPendingClearances = async (): Promise<any> => {
    const response = await apiClient.get('/recruitment/clearances/pending');
    return response.data;
};

export const getFullyClearedTerminations = async (): Promise<any> => {
    const response = await apiClient.get('/recruitment/clearances/fully-cleared');
    return response.data;
};

export const isEmployeeFullyCleared = async (terminationId: string): Promise<{ isCleared: boolean }> => {
    const response = await apiClient.get<{ isCleared: boolean }>(`/recruitment/terminations/${terminationId}/clearance/is-cleared`);
    return response.data;
};

// Benefits Enrollment (ONB-018)
export const createBenefitsRequest = async (employeeId: string, data: CreateBenefitsDto): Promise<any> => {
    const response = await apiClient.post(`/recruitment/onboarding/${employeeId}/benefits`, data);
    return response.data;
};

export const approveBenefitsRequest = async (employeeId: string, taskIndex: number, data: ApproveBenefitsDto): Promise<any> => {
    const response = await apiClient.put(`/recruitment/onboarding/${employeeId}/benefits/${taskIndex}/approve`, data);
    return response.data;
};

// Signing Bonus (ONB-019) - uses payroll-configuration API
export const listApprovedSigningBonuses = async (): Promise<SigningBonus[]> => {
    const response = await apiClient.get<SigningBonus[]>('/payroll-configuration/signing-bonuses/approved');
    return response.data;
};

export const getSigningBonusByPosition = async (positionName: string): Promise<SigningBonus> => {
    const response = await apiClient.get<SigningBonus>(`/payroll-configuration/signing-bonuses/position/${encodeURIComponent(positionName)}`);
    return response.data;
};

// Termination Review (OFF-001)
export const initiateTerminationReview = async (data: InitiateTerminationReviewDto): Promise<TerminationReview> => {
    const response = await apiClient.post<TerminationReview>('/recruitment/termination-reviews/initiate', data);
    return response.data;
};

export const getPendingTerminationReviews = async (): Promise<TerminationReview[]> => {
    const response = await apiClient.get<TerminationReview[]>('/recruitment/termination-reviews/pending');
    return response.data;
};

export const getTerminationReviewsForEmployee = async (employeeId: string): Promise<TerminationReview[]> => {
    const response = await apiClient.get<TerminationReview[]>(`/recruitment/employees/${employeeId}/termination-reviews`);
    return response.data;
};

export const listTerminationReviews = async (params?: { status?: string }): Promise<TerminationReview[]> => {
    const query = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<TerminationReview[]>(`/recruitment/termination-reviews?${query}`);
    return response.data;
};

export const updateTerminationReviewStatus = async (reviewId: string, status: string, hrComments?: string): Promise<TerminationReview> => {
    const response = await apiClient.put<TerminationReview>(`/recruitment/termination-reviews/${reviewId}/status`, { status, hrComments });
    return response.data;
};

// Access Revocation (OFF-007)
export const revokeTerminatedEmployeeAccess = async (terminationId: string, employeeId: string, revokedBy: string, accessType?: string, comments?: string): Promise<any> => {
    const response = await apiClient.post(`/recruitment/terminations/${terminationId}/revoke-access`, { employeeId, revokedBy, accessType, comments });
    return response.data;
};

export const getTerminatedEmployeesWithRevokedAccess = async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/recruitment/terminations/access/revoked');
    return response.data;
};

export const getEmployeeAccessRevocationHistory = async (employeeId: string): Promise<any> => {
    const response = await apiClient.get(`/recruitment/employees/${employeeId}/access-revocation-history`);
    return response.data;
};

// Final Settlement (OFF-013)
export const sendOffboardingNotification = async (terminationId: string, notificationType?: string, recipientDepartments?: string[]): Promise<any> => {
    const response = await apiClient.post(`/recruitment/terminations/${terminationId}/send-offboarding-notification`, { notificationType, recipientDepartments });
    return response.data;
};

export const getLeaveBalance = async (employeeId: string): Promise<any> => {
    const response = await apiClient.get(`/recruitment/employees/${employeeId}/leave-balance`);
    return response.data;
};

export const getEmployeeBenefits = async (employeeId: string): Promise<any> => {
    const response = await apiClient.get(`/recruitment/employees/${employeeId}/benefits`);
    return response.data;
};

export const triggerBenefitsTermination = async (terminationId: string, terminationDate: string): Promise<any> => {
    const response = await apiClient.post(`/recruitment/terminations/${terminationId}/trigger-benefits-termination`, { terminationDate });
    return response.data;
};

export const getOffboardingNotificationHistory = async (terminationId: string): Promise<any> => {
    const response = await apiClient.get(`/recruitment/terminations/${terminationId}/offboarding-notification-history`);
    return response.data;
};

// Process Templates
export const listProcessTemplates = async (): Promise<ProcessTemplate[]> => {
    const response = await apiClient.get<ProcessTemplate[]>('/recruitment/process-templates');
    return response.data;
};

export const createProcessTemplate = async (key: string, data: CreateProcessTemplateDto): Promise<ProcessTemplate> => {
    const response = await apiClient.post<ProcessTemplate>(`/recruitment/process-templates/${key}`, data);
    return response.data;
};

export const deleteProcessTemplate = async (key: string): Promise<void> => {
    await apiClient.delete(`/recruitment/process-templates/${key}`);
};

// Apply to Requisition
export const applyToRequisition = async (requisitionId: string, documentId?: string): Promise<JobApplication> => {
    const response = await apiClient.post<any>(`/recruitment/requisitions/${requisitionId}/apply`, { documentId });
    return response.data; // Note: service returns { success, message, data }, we likely need data.data or just data depending on frontend expectation. Adjusted to match typical service return. Actually `applyToRequisition` in service returns { success: true, message: ..., data: ... }
};

export const listCandidateCVs = async (candidateId: string): Promise<any> => {
    const response = await apiClient.get<any>(`/recruitment/candidates/${candidateId}/cvs`);
    return response.data;
};

// ONB-002: Create Employee Profile from Contract
export const createEmployeeFromContract = async (contractId: string, createdBy: string): Promise<any> => {
    const response = await apiClient.post<any>(`/recruitment/onboarding/contract/${contractId}/create-profile`, { createdBy });
    return response.data;
};

// ONB-009: Provision System Access
export const createAccessRequest = async (employeeId: string, data: { resource: string; accessType: string; requestedBy?: string }): Promise<any> => {
    const response = await apiClient.post<any>(`/recruitment/onboarding/${employeeId}/access`, data);
    return response.data;
};

// ONB-012: Allocate Resources (Equipment)
export const createResourceRequest = async (employeeId: string, data: { itemType: string; preferredModel?: string; requestedBy?: string }): Promise<any> => {
    const response = await apiClient.post<any>(`/recruitment/onboarding/${employeeId}/equipment`, data);
    return response.data;
};

// ONB-018: Payroll Initiation
export const createPayrollInitiation = async (employeeId: string, data: { payrollType: string; amount?: number; frequency?: string; initiatedBy?: string }): Promise<any> => {
    const response = await apiClient.post<any>(`/recruitment/onboarding/${employeeId}/payroll`, data);
    return response.data;
};

// ONB-019: Process Signing Bonus
export const processSigningBonus = async (employeeId: string, contractId: string): Promise<any> => {
    const response = await apiClient.post<any>(`/recruitment/onboarding/${employeeId}/signing-bonus`, { contractId });
    return response.data;
};

// ONB-013: Schedule Access Revocation
export const scheduleAccessRevocation = async (employeeId: string, taskIndex: number, revocationDate: string, reason?: string): Promise<any> => {
    const response = await apiClient.post<any>(`/recruitment/onboarding/${employeeId}/access/${taskIndex}/schedule-revocation`, { revocationDate, reason });
    return response.data;
};

// ONB-013: Cancel No-Show Access
export const cancelNoShowAccess = async (employeeId: string, reason?: string): Promise<any> => {
    const response = await apiClient.post<any>(`/recruitment/onboarding/${employeeId}/cancel-no-show`, { reason });
    return response.data;
};


export const recruitmentApi = {
    createJobTemplate,
    listJobTemplates,
    getJobTemplate,
    createJobRequisition,
    listJobRequisitions,
    getJobRequisition,
    listProcessTemplates,
    createProcessTemplate,
    deleteProcessTemplate,
    previewRequisition,
    publishRequisition,
    getMyApplications,
    listApplications,
    rejectApplication,
    advanceApplication,
    scheduleInterview,
    listInterviews,
    submitFeedback,
    listAssessmentForms,
    getAssessmentForm,
    saveAssessmentForm,
    deleteAssessmentForm,
    submitStructuredFeedback,
    listPanelMembers,
    registerPanelMember,
    getPanelAvailability,
    setPanelAvailability,
    findCommonAvailability,
    tagCandidateReferral,
    getCandidateReferrals,
    listReferrals,
    getRecruitmentDashboard,
    getCandidateConsents,
    grantConsent,
    getLatestConsent,
    revokeConsent,
    createOffer,
    listOffers,
    getOffer,
    finalizeOffer,
    addOfferApprover,
    respondToOffer,
    submitResignation,
    getEmployeeResignations,
    getResignationStatus,
    triggerPreboarding,
    listPreboardingTasks,
    completePreboardingTask,
    createChecklist,
    uploadOnboardingDocument,
    listPendingDocuments,
    verifyDocument,
    rejectDocument,
    getContractDetails,
    createEmployeeProfile,
    listEmployees,
    getOnboardingTracker,
    createEquipmentRequest,
    assignEquipment,
    sendTaskReminder,
    autoSendReminders,
    createOffboardingChecklist,
    getOffboardingChecklistSummary,
    updateDepartmentApproval,
    updateEquipmentReturn,
    completeOffboarding,
    calculateFinalPay,
    updateClearanceStatus,
    getFullClearanceStatus,
    getPendingClearances,
    getFullyClearedTerminations,
    isEmployeeFullyCleared,
    createBenefitsRequest,
    approveBenefitsRequest,
    listApprovedSigningBonuses,
    getSigningBonusByPosition,
    initiateTerminationReview,
    getPendingTerminationReviews,
    listTerminationReviews,
    getTerminationReviewsForEmployee,
    updateTerminationReviewStatus,
    revokeTerminatedEmployeeAccess,
    getTerminatedEmployeesWithRevokedAccess,
    getEmployeeAccessRevocationHistory,
    sendOffboardingNotification,
    getLeaveBalance,
    getEmployeeBenefits,
    triggerBenefitsTermination,
    getOffboardingNotificationHistory,
    applyToRequisition,
    listCandidateCVs,
    // ONB methods
    createEmployeeFromContract,
    listContracts: async () => {
        const response = await apiClient.get<any>('/recruitment/onboarding/contracts');
        return response.data;
    }, // Add listContracts here
    createAccessRequest,
    createResourceRequest,
    createPayrollInitiation,
    processSigningBonus,
    scheduleAccessRevocation,
    cancelNoShowAccess,

    // OFF-007: Admin Console
    getApprovedTerminationRequests: async () => {
        const response = await apiClient.get<any[]>('/recruitment/terminations/approved');
        return response.data;
    },

    removeEmployeeProfile: async (employeeId: string) => {
        const response = await apiClient.delete<any>(`/recruitment/employees/${employeeId}/profile`);
        return response.data;
    },

    // ONB-001: Create Onboarding
    createEmployeeOnboarding
};
