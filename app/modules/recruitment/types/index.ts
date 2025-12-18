/**
 * Recruitment Module Types
 */

export interface PublishRequisitionDto {
    expiryDays?: number;
}

export interface JobApplication {
    _id: string;
    candidateId: string;
    candidateName?: string; // Populated from candidate data
    candidate?: {
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    requisitionId: string;
    requisitionTitle?: string;
    requisition?: {
        jobTitle?: string;
        department?: string;
    };
    currentStage: string;
    stage?: string; // Alias or computed
    status: 'active' | 'rejected' | 'hired' | 'withdrawn' | 'offer_accepted' | 'offer';
    history?: {
        stage: string;
        status: string;
        changedBy: string;
        date: string;
    }[];
    createdAt: string;
    appliedDate?: string; // Alias for createdAt
    updatedAt: string;
    attachment?: string; // Document ID of the CV
}

export interface SalaryRange {
    min?: number;
    max?: number;
    currency?: string;
}

export interface JobTemplate {
    _id?: string;
    title: string;
    department: string;
    description: string;
    qualifications: string[];
    skills: string[]; // Required by backend
    openings: number; // Required by backend
    location: string; // Required by backend
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateJobTemplateDto {
    title: string;
    department: string;
    description: string;
    qualifications: string[];
    skills: string[]; // Required by backend
    openings: number; // Required by backend
    location: string; // Required by backend
    positionCode?: string;
}

export interface JobRequisition {
    _id?: string;
    requisitionId?: string; // e.g. REQ-2025-001
    jobTitle: string;
    department: string;
    hiringManagerId?: string;
    description: string;
    qualifications: string[];
    salary?: SalaryRange;
    location?: string;
    employmentType?: string;
    numberOfPositions: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'DRAFT' | 'OPEN' | 'FILLED' | 'CANCELLED' | 'PUBLISHED';
    publishStatus?: 'unpublished' | 'published';
    postingDate?: string;
    expiryDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateJobRequisitionDto {
    jobTitle: string;
    department: string;
    description: string;
    qualifications: string[];
    salary?: SalaryRange;
    location?: string;
    employmentType?: string;
    numberOfPositions: number;
    urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ProcessTemplate {
    key: string;
    name: string;
    stages: string[];
}

export interface CreateProcessTemplateDto {
    name: string;
    stages: string[];
}

export interface ScheduleInterviewDto {
    applicationId: string;
    stage: string;
    scheduledDate: string;
    method: 'in-person' | 'video' | 'phone';
    panelEmails: string[];
    durationMinutes: number;
    videoLink?: string;
}

export interface Interview {
    _id: string;
    applicationId: string;
    stage: string;
    scheduledDate: string;
    method: 'in-person' | 'video' | 'phone';
    panel: string[];
    videoLink?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    feedbackId?: string;
}

export interface FeedbackDto {
    interviewerId: string;
    score: number;
    comments?: string;
}

export interface AssessmentCriteria {
    key: string;
    label: string;
    weight: number;
}

export interface AssessmentForm {
    key: string;
    name: string;
    role?: string;
    criteria: AssessmentCriteria[];
}

export interface StructuredFeedbackDto {
    interviewerId: string;
    formKey: string;
    responses: Record<string, number>;
    comments?: string;
}

export interface PanelMember {
    _id: string; // or id
    name: string;
    email: string;
    role: string;
    expertise: string[];
}

export interface PanelAvailability {
    [date: string]: string[]; // "YYYY-MM-DD": ["10:00", "11:00"]
}

export interface Referral {
    _id: string;
    candidateId: string;
    referringEmployeeId: string;
    role?: string;
    level?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'hired';
    createdAt: string;
}

export interface CreateReferralDto {
    referringEmployeeId: string;
    role?: string;
    level?: string;
}

export interface RecruitmentDashboard {
    openRequisitions: number;
    activeApplications: number;
    interviewsScheduled: number;
    hiredCount: number;
    applicationsByStage: { stage: string; count: number }[];
    recentActivity: {
        id: string;
        message: string;
        date: string;
        type: 'application' | 'interview' | 'requisition';
    }[];
}

export interface ConsentLog {
    file: string;
    path: string;
    data: {
        candidateId: string;
        granted: boolean;
        type: string;
        givenBy: string | null;
        details: string | null;
        consentedAt: string;
    };
}

export interface CreateOfferDto {
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
    deadline?: string;
}

export interface AddOfferApproverDto {
    employeeId: string;
    role: string;
    status: string; // 'approved' | 'rejected' | 'pending'
    comment?: string;
}

export interface Offer {
    _id: string;
    applicationId: string;
    candidateId: string;
    status: 'draft' | 'pending_approval' | 'approved' | 'sent_to_candidate' | 'accepted' | 'rejected_by_candidate';
    grossSalary: number;
    approvals: {
        employeeId: string;
        role: string;
        status: string;
        comment?: string;
    }[];
    content: string; // The offer letter details
    deadline: string;
    role?: string;
    signingBonus?: number;
    benefits?: string[];
    conditions?: string;
    insurances?: string;
    finalStatus?: string;
    candidateSignedAt?: string;
    hrSignedAt?: string;
    managerSignedAt?: string;
}

export interface SubmitResignationRequestDto {
    employeeId: string;
    resignationReason: string;
    lastWorkingDay?: string;
    noticePeriodinDays?: number;
    additionalComments?: string;
}

export interface ResignationRequest {
    _id: string;
    employeeId: string;
    resignationReason: string;
    status: string; // 'PENDING', 'APPROVED', 'REJECTED'
    submittedAt: string;
    lastWorkingDay?: string;
}

export interface PreboardingTask {
    title: string;
    description?: string;
    assignee?: 'candidate' | 'hr';
    dueDays?: number;
    completed?: boolean;
    completedAt?: string;
    completedBy?: string;
    _id?: string;
}

export interface TriggerPreboardingDto {
    startDate?: string;
    tasks?: PreboardingTask[];
}

export interface CreateChecklistDto {
    templateName: string;
    description?: string;
    departmentId?: string;
    taskNames?: string[];
}

export interface OnboardingChecklist {
    _id: string;
    templateName: string;
    description?: string;
    departmentId?: string;
    taskNames: string[];
}

// ONB-001: Create Onboarding
export interface OnboardingTaskInput {
    name: string;
    department?: string;
    deadline?: string;
    documentId?: string;
    notes?: string;
}

export interface CreateEmployeeOnboardingDto {
    employeeId: string;
    contractId: string;
    tasks?: OnboardingTaskInput[];
}

export enum DocumentType {
    CV = 'cv',
    CONTRACT = 'contract',
    ID = 'id',
    CERTIFICATE = 'certificate',
    RESIGNATION = 'resignation',
}

export interface UploadOnboardingDocumentDto {
    employeeId: string;
    documentType: DocumentType;
    filePath: string;
}

export interface OnboardingDocument {
    _id: string;
    employeeId: string;
    documentType: DocumentType;
    filePath: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadedAt: string;
}

export interface ContractDetails {
    // Just a basic map for now as backend returns composite
    [key: string]: any;
}

export interface OnboardingTrackerTask {
    _id: string;
    name: string;
    department?: string;
    status: 'pending' | 'completed' | 'skipped';
    deadline?: string;
    completedAt?: string;
    description?: string;
    owner?: string;
    notes?: string;
    estimatedHours?: number;
    isBlocked?: boolean;
    sequence: number;
}

export interface OnboardingTrackerResponse {
    success: boolean;
    employeeId: string;
    contractId?: string;
    tasks: OnboardingTrackerTask[];
    progress: {
        completed: number;
        total: number;
        percentage: number;
    };
    nextTask: OnboardingTrackerTask | null;
    completed: boolean;
    completedAt?: string;
}

// Equipment Provisioning (ONB-007)
export interface CreateEquipmentDto {
    itemType: string;
    preferredModel?: string;
    requestedBy?: string;
}

export interface AssignEquipmentDto {
    assignedBy: string;
    assetTag?: string;
    notes?: string;
}

export interface EquipmentRequest {
    taskIndex: number;
    itemType: string;
    preferredModel?: string;
    requestedBy?: string;
    status: 'pending' | 'assigned' | 'returned';
    assetTag?: string;
    assignedBy?: string;
    assignedAt?: string;
    notes?: string;
}

// Offboarding (ONB-012)
export interface OffboardingChecklistSummary {
    terminationId: string;
    employeeId: string;
    totalItems: number;
    completedItems: number;
    pendingItems: number;
    percentComplete: number;
    departments: Array<{
        name: string;
        status: 'pending' | 'approved' | 'rejected';
        updatedAt?: string;
    }>;
    equipment: Array<{
        name: string;
        returned: boolean;
        condition?: string;
    }>;
    isComplete: boolean;
}

// Benefits Enrollment (ONB-018)
export interface CreateBenefitsDto {
    planType: string;
    options?: string[];
    initiatedBy?: string;
}

export interface ApproveBenefitsDto {
    approvedBy: string;
    enrollmentId?: string;
    notes?: string;
}

// Signing Bonus (ONB-019)
export interface SigningBonus {
    _id: string;
    positionName: string;
    amount: number;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
    createdBy?: string;
    approvedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Termination Review (OFF-001)
export interface TerminationReview {
    _id: string;
    employeeId: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    initiator: string;
    hrComments?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InitiateTerminationReviewDto {
    employeeId: string;
    reason: string;
    initiator?: string;
}
