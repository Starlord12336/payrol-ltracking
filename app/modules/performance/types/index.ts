/**
 * Performance Module Types
 * Define types specific to this module
 */

export enum AppraisalTemplateType {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  PROBATIONARY = 'PROBATIONARY',
  PROJECT = 'PROJECT',
  AD_HOC = 'AD_HOC',
}

export enum AppraisalRatingScaleType {
  THREE_POINT = 'THREE_POINT',
  FIVE_POINT = 'FIVE_POINT',
  TEN_POINT = 'TEN_POINT',
}

/**
 * RatingScaleDefinition - matches backend schema exactly
 */
export interface RatingScaleDefinition {
  type: AppraisalRatingScaleType;
  min: number;
  max: number;
  step?: number;
  labels?: string[];
}

/**
 * EvaluationCriterion - matches backend schema exactly
 */
export interface EvaluationCriterion {
  key: string;
  title: string;
  details?: string;
  weight?: number;
  maxScore?: number;
  required?: boolean;
}

/**
 * AppraisalTemplate - matches backend schema exactly
 */
export interface AppraisalTemplate {
  _id?: string;
  name: string;
  description?: string;
  templateType: AppraisalTemplateType;
  ratingScale: RatingScaleDefinition;
  criteria: EvaluationCriterion[];
  instructions?: string;
  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * CreateAppraisalTemplateDto - matches backend DTO exactly
 */
export interface CreateAppraisalTemplateDto {
  name: string;
  description?: string;
  templateType: AppraisalTemplateType;
  ratingScale: RatingScaleDefinition;
  criteria?: EvaluationCriterion[];
  instructions?: string;
  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];
  isActive?: boolean;
}

/**
 * UpdateAppraisalTemplateDto - matches backend DTO exactly
 */
export interface UpdateAppraisalTemplateDto extends Partial<CreateAppraisalTemplateDto> {
  isActive?: boolean;
}

/**
 * AppraisalAssignmentStatus - matches backend enum
 */
export enum AppraisalAssignmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  PUBLISHED = 'PUBLISHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

/**
 * AppraisalAssignment - matches backend schema
 */
export interface AppraisalAssignment {
  _id?: string;
  cycleId?: string;
  templateId: string;
  employeeProfileId: string;
  managerProfileId: string;
  departmentId: string;
  positionId?: string;
  status: AppraisalAssignmentStatus;
  assignedAt?: string;
  dueDate?: string;
  submittedAt?: string;
  publishedAt?: string;
  latestAppraisalId?: string;
  // Populated fields
  template?: AppraisalTemplate;
  employee?: any;
  manager?: any;
  department?: any;
  position?: any;
  cycle?: any;
}

/**
 * CreateAppraisalAssignmentDto - matches backend DTO
 */
export interface CreateAppraisalAssignmentDto {
  templateId: string;
  cycleId: string;
  employeeProfileIds: string[];
  managerProfileId?: string;
  dueDate?: string;
}

/**
 * BulkAssignTemplateDto - matches backend DTO
 */
export interface BulkAssignTemplateDto {
  templateId: string;
  cycleId: string;
  departmentIds?: string[];
  positionIds?: string[];
  employeeProfileIds?: string[];
  dueDate?: string;
  managerProfileId?: string;
}

/**
 * UpdateAppraisalAssignmentDto - matches backend DTO
 */
export interface UpdateAppraisalAssignmentDto {
  templateId?: string;
  managerProfileId?: string;
  dueDate?: string;
  status?: AppraisalAssignmentStatus;
}

/**
 * AppraisalCycle - matches backend schema
 */
export interface AppraisalCycle {
  _id?: string;
  name: string;
  description?: string;
  cycleType: AppraisalTemplateType;
  startDate: string;
  endDate: string;
  managerDueDate?: string;
  employeeAcknowledgementDueDate?: string;
  status: string; // AppraisalCycleStatus
  publishedAt?: string;
  closedAt?: string;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * CreateAppraisalCycleDto - matches backend DTO
 */
export interface CreateAppraisalCycleDto {
  cycleName: string;
  description?: string;
  appraisalType: string; // AppraisalTemplateType as string
  templateId: string;
  startDate: string;
  endDate: string;
  selfAssessmentDeadline?: string;
  managerReviewDeadline: string;
  hrReviewDeadline?: string;
  disputeDeadline?: string;
  targetEmployeeIds?: string[];
  targetDepartmentIds?: string[];
  targetPositionIds?: string[];
  excludeEmployeeIds?: string[];
}
