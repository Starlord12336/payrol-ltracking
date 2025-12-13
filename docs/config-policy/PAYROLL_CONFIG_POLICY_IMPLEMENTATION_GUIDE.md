# Payroll Configuration & Policy Subsystem - Implementation Guide

## Executive Summary

This document provides a comprehensive breakdown of the **Payroll Configuration & Policy Setup Subsystem** for the HR Management System. The subsystem is responsible for establishing the foundational rules, structures, and compliance settings that govern all payroll calculations and executions.

**Team Responsibility**: Payroll Configuration & Policy Setup  
**Related Subsystems**: Payroll Execution, Payroll Tracking, Employee Profile, Organization Structure, Time Management, Leaves, Recruitment/Onboarding/Offboarding

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Dependencies & Integration Points](#dependencies--integration-points)
3. [Module Breakdown](#module-breakdown)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Database Schemas Reference](#database-schemas-reference)

---

## System Overview

### Purpose

The Payroll Configuration & Policy Setup subsystem establishes the **foundational configuration layer** for the entire payroll system. It ensures that:

- All payroll calculations follow approved organizational policies
- Tax and insurance compliance is automated
- Salary structures are standardized and auditable
- Multi-phase approval workflows enforce governance
- Configuration changes are version-controlled and traceable

### Key Characteristics

- **Multi-role approval workflows** (Payroll Specialist → Payroll Manager → HR Manager)
- **Version control** for all configuration changes
- **Audit trails** for compliance and forensics
- **Status-based lifecycle** (Draft → Approved → Rejected)
- **Integration-ready** data structures for downstream payroll processing

### Workflow Phases (High-Level)

```
Phase 1: Define Structure
├─ Payroll Specialist configures pay types, allowances, bonuses, benefits, policies, pay grades

Phase 2: Embed Compliance
├─ Legal Admin adds tax rules
└─ Payroll Specialist sets insurance brackets

Phase 3: Configure System
└─ System Admin defines company-wide settings

Phase 4: Approve Configuration
└─ Payroll Manager reviews and approves/rejects all configurations

Phase 5: HR Oversight
└─ HR Manager reviews, approves, updates, and manages insurance rules
```

---

## Dependencies & Integration Points

### Inputs (Dependencies from Other Subsystems)

| Source Subsystem           | Data Consumed                                 | Purpose                                              |
| -------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| **Employee Profile**       | Employee ID, Employment Status, Contract Type | Link configurations to employees                     |
| **Organization Structure** | Position, Pay Grade Assignment, Department    | Determine applicable salary structures               |
| **Recruitment/Onboarding** | New Hire Contract Details, Signing Date       | Trigger signing bonus processing (ONB-018, ONB-019)  |
| **Offboarding**            | Termination/Resignation Date, Notice Period   | Calculate termination/resignation benefits (OFF-013) |
| **Time Management**        | Overtime Hours, Penalties, Missing Hours      | Apply deductions in payroll calculations             |
| **Leaves**                 | Leave Balances, Unpaid Leave Days             | Calculate leave-based salary adjustments             |

### Outputs (Provided to Other Subsystems)

| Target Subsystem      | Data Provided                                                               | Purpose                                       |
| --------------------- | --------------------------------------------------------------------------- | --------------------------------------------- |
| **Payroll Execution** | Pay Grades, Tax Rules, Insurance Brackets, Allowances, Deductions, Policies | Enable salary calculation engine              |
| **Payroll Tracking**  | Policy Definitions, Approved Rates                                          | Display payslip breakdowns to employees       |
| **Employee Profile**  | Assigned Pay Grade, Benefits Eligibility                                    | Show compensation details in employee records |
| **Recruitment**       | Signing Bonus Amounts by Position                                           | Include in offer letters                      |
| **Offboarding**       | Termination/Resignation Benefit Rules                                       | Calculate final settlements                   |

---

## Module Breakdown

Below is the detailed breakdown of all modules/services required for the Payroll Configuration & Policy subsystem. Each module is designed to be **independently implementable** and can be assigned to different team members.

---

## Module 1: Pay Grade Management

### Description

Manages the foundational salary structures based on position grades (e.g., Junior TA, Mid TA, Senior TA). Each pay grade defines the base and gross salary for a specific position level.

### Business Rules

- **BR-PG-001**: Pay grade names must be unique across the organization
- **BR-PG-002**: Base salary must be ≥ 6000 EGP (minimum wage)
- **BR-PG-003**: Gross salary must be ≥ Base salary
- **BR-PG-004**: Pay grades must go through approval workflow (Draft → Approved → Rejected)
- **BR-PG-005**: Only approved pay grades can be assigned to positions

### User Stories

- **PY-CONFIG-001**: As a Payroll Specialist, I want to create pay grades with base and gross salaries, so that positions have standardized compensation structures
- **PY-CONFIG-002**: As a Payroll Specialist, I want to edit draft pay grades before submission for approval
- **PY-CONFIG-003**: As a Payroll Manager, I want to review and approve/reject pay grade configurations
- **PY-CONFIG-004**: As a Payroll Specialist, I want to view all pay grades with their approval status
- **PY-CONFIG-005**: As a System, I want to prevent deletion of pay grades that are assigned to active positions

### Database Schema

**Collection**: `payGrades`

```typescript
{
  _id: ObjectId,
  grade: string,              // unique, required
  baseSalary: number,         // min: 6000, required
  grossSalary: number,        // min: 6000, required
  status: ConfigStatus,       // DRAFT | APPROVED | REJECTED
  createdBy: ObjectId,        // ref: EmployeeProfile
  approvedBy: ObjectId,       // ref: EmployeeProfile
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints (Plan)

```
POST   /api/payroll-config/pay-grades              # Create pay grade
GET    /api/payroll-config/pay-grades              # List all pay grades (with filters)
GET    /api/payroll-config/pay-grades/:id          # Get single pay grade
PUT    /api/payroll-config/pay-grades/:id          # Update pay grade (Draft only)
DELETE /api/payroll-config/pay-grades/:id          # Delete pay grade (Draft only)
POST   /api/payroll-config/pay-grades/:id/submit   # Submit for approval
POST   /api/payroll-config/pay-grades/:id/approve  # Approve (Manager only)
POST   /api/payroll-config/pay-grades/:id/reject   # Reject (Manager only)
```

### Implementation Tasks

**Planning**:

- [ ] Design approval workflow state machine
- [ ] Define validation rules for salary ranges
- [ ] Document integration points with Organization Structure

**Design**:

- [ ] Create DTOs (CreatePayGradeDto, UpdatePayGradeDto, ApprovalDto)
- [ ] Design service layer interfaces
- [ ] Plan repository methods

**Implementation**:

- [ ] Implement payGrade schema validation
- [ ] Implement PayGradeService with CRUD operations
- [ ] Implement approval workflow logic
- [ ] Implement PayGradeController with all endpoints
- [ ] Add role-based guards (PayrollSpecialist, PayrollManager)
- [ ] Write unit tests for service layer
- [ ] Write integration tests for API endpoints

---

## Module 2: Allowance Management

### Description

Defines allowances that can be added to employee salaries (e.g., Housing Allowance, Transport Allowance, Meal Allowance).

### Business Rules

- **BR-AL-001**: Allowance names must be unique
- **BR-AL-002**: Allowance amounts must be ≥ 0
- **BR-AL-003**: Allowances must go through approval workflow
- **BR-AL-004**: Only approved allowances can be assigned to employees
- **BR-AL-005**: Allowances are added to gross salary in payroll calculations

### User Stories

- **PY-CONFIG-006**: As a Payroll Specialist, I want to create allowance types with fixed amounts
- **PY-CONFIG-007**: As a Payroll Specialist, I want to edit draft allowances before approval
- **PY-CONFIG-008**: As a Payroll Manager, I want to approve/reject allowance configurations
- **PY-CONFIG-009**: As a Payroll Specialist, I want to view all allowances with their approval status

### Database Schema

**Collection**: `allowances`

```typescript
{
  _id: ObjectId,
  name: string,              // unique, required
  amount: number,            // min: 0, required
  status: ConfigStatus,      // DRAFT | APPROVED | REJECTED
  createdBy: ObjectId,       // ref: EmployeeProfile
  approvedBy: ObjectId,      // ref: EmployeeProfile
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints (Plan)

```
POST   /api/payroll-config/allowances              # Create allowance
GET    /api/payroll-config/allowances              # List all allowances
GET    /api/payroll-config/allowances/:id          # Get single allowance
PUT    /api/payroll-config/allowances/:id          # Update allowance (Draft only)
DELETE /api/payroll-config/allowances/:id          # Delete allowance (Draft only)
POST   /api/payroll-config/allowances/:id/submit   # Submit for approval
POST   /api/payroll-config/allowances/:id/approve  # Approve
POST   /api/payroll-config/allowances/:id/reject   # Reject
```

### Implementation Tasks

**Planning**:

- [ ] Define allowance types taxonomy
- [ ] Document how allowances integrate with payroll calculations

**Design**:

- [ ] Create DTOs for allowance operations
- [ ] Design service interfaces

**Implementation**:

- [ ] Implement allowance schema validation
- [ ] Implement AllowanceService
- [ ] Implement AllowanceController
- [ ] Add approval workflow
- [ ] Add role-based guards
- [ ] Write tests

---

## Module 3: Tax Rules Management

### Description

Manages tax calculation rules including tax rates, brackets, and thresholds for income tax calculations.

### Business Rules

- **BR-TX-001**: Tax rule names must be unique
- **BR-TX-002**: Tax rates must be between 0 and 100 (percentage)
- **BR-TX-003**: Tax rules must be approved before use in payroll
- **BR-TX-004**: Tax calculations must follow Egyptian tax law
- **BR-TX-005**: Tax rules should support progressive tax brackets (future enhancement)

### User Stories

- **PY-CONFIG-010**: As a Legal Admin, I want to create tax rules with rates
- **PY-CONFIG-011**: As a Legal Admin, I want to update tax rules when laws change
- **PY-CONFIG-012**: As a Payroll Manager, I want to approve tax rule changes
- **PY-CONFIG-013**: As a Payroll Specialist, I want to view current active tax rules

### Database Schema

**Collection**: `taxRules`

```typescript
{
  _id: ObjectId,
  name: string,              // unique, required
  description: string,       // optional
  rate: number,              // min: 0, max: 100, required (percentage)
  status: ConfigStatus,      // DRAFT | APPROVED | REJECTED
  createdBy: ObjectId,       // ref: EmployeeProfile
  approvedBy: ObjectId,      // ref: EmployeeProfile
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints (Plan)

```
POST   /api/payroll-config/tax-rules              # Create tax rule
GET    /api/payroll-config/tax-rules              # List all tax rules
GET    /api/payroll-config/tax-rules/:id          # Get single tax rule
PUT    /api/payroll-config/tax-rules/:id          # Update tax rule
DELETE /api/payroll-config/tax-rules/:id          # Delete tax rule (Draft only)
POST   /api/payroll-config/tax-rules/:id/submit   # Submit for approval
POST   /api/payroll-config/tax-rules/:id/approve  # Approve
POST   /api/payroll-config/tax-rules/:id/reject   # Reject
```

### Implementation Tasks

**Planning**:

- [ ] Research Egyptian tax law requirements
- [ ] Design tax bracket structure (if needed)

**Design**:

- [ ] Create DTOs for tax rules
- [ ] Design tax calculation service interface

**Implementation**:

- [ ] Implement taxRules schema
- [ ] Implement TaxRulesService
- [ ] Implement TaxRulesController
- [ ] Add approval workflow
- [ ] Add role-based guards (LegalAdmin, PayrollManager)
- [ ] Write tests

---

## Module 4: Insurance Brackets Management

### Description

Manages social insurance and health insurance brackets with employee and employer contribution rates based on salary ranges.

### Business Rules

- **BR-IN-001**: Insurance bracket names must be unique
- **BR-IN-002**: Salary ranges must not overlap for same insurance type
- **BR-IN-003**: Employee rate + Employer rate must be ≤ 100%
- **BR-IN-004**: Insurance brackets must be approved by HR Manager
- **BR-IN-005**: Insurance calculations must comply with Egyptian social insurance law

### User Stories

- **PY-CONFIG-014**: As a Payroll Specialist, I want to create insurance brackets with min/max salary ranges
- **PY-CONFIG-015**: As a Payroll Specialist, I want to define employee and employer contribution rates
- **PY-CONFIG-016**: As an HR Manager, I want to approve insurance bracket configurations
- **PY-CONFIG-017**: As a Payroll Specialist, I want to view all insurance brackets by salary range

### Database Schema

**Collection**: `insuranceBrackets`

```typescript
{
  _id: ObjectId,
  name: string,              // unique, required (e.g., "Social Insurance", "Health Insurance")
  amount: number,            // min: 0, required
  status: ConfigStatus,      // DRAFT | APPROVED | REJECTED
  minSalary: number,         // required
  maxSalary: number,         // required
  employeeRate: number,      // min: 0, max: 100 (percentage)
  employerRate: number,      // min: 0, max: 100 (percentage)
  createdBy: ObjectId,       // ref: EmployeeProfile
  approvedBy: ObjectId,      // ref: EmployeeProfile (HR Manager)
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints (Plan)

```
POST   /api/payroll-config/insurance-brackets              # Create insurance bracket
GET    /api/payroll-config/insurance-brackets              # List all insurance brackets
GET    /api/payroll-config/insurance-brackets/:id          # Get single insurance bracket
PUT    /api/payroll-config/insurance-brackets/:id          # Update insurance bracket
DELETE /api/payroll-config/insurance-brackets/:id          # Delete (Draft only)
POST   /api/payroll-config/insurance-brackets/:id/submit   # Submit for approval
POST   /api/payroll-config/insurance-brackets/:id/approve  # Approve (HR Manager)
POST   /api/payroll-config/insurance-brackets/:id/reject   # Reject (HR Manager)
```

### Implementation Tasks

**Planning**:

- [ ] Research Egyptian social insurance brackets
- [ ] Document salary range validation logic

**Design**:

- [ ] Create DTOs for insurance brackets
- [ ] Design salary range overlap detection

**Implementation**:

- [ ] Implement insuranceBrackets schema with validations
- [ ] Implement InsuranceBracketsService with range validation
- [ ] Implement InsuranceBracketsController
- [ ] Add approval workflow (HR Manager approval)
- [ ] Add role-based guards
- [ ] Write tests

---

## Module 5: Payroll Policies Management

### Description

Defines organizational payroll policies including deductions, benefits, misconduct penalties, and leave-related policies with rule-based calculations.

### Business Rules

- **BR-PP-001**: Policy names must be unique
- **BR-PP-002**: Policy types: DEDUCTION | ALLOWANCE | BENEFIT | MISCONDUCT | LEAVE
- **BR-PP-003**: Policies can be percentage-based, fixed amount, or threshold-based
- **BR-PP-004**: Applicability: All Employees | Full-Time | Part-Time | Contractors
- **BR-PP-005**: Policies must be approved before activation
- **BR-PP-006**: Effective date must be in the future for new policies

### User Stories

- **PY-CONFIG-018**: As a Payroll Specialist, I want to create payroll policies with rule definitions
- **PY-CONFIG-019**: As a Payroll Specialist, I want to specify policy applicability (who it affects)
- **PY-CONFIG-020**: As a Payroll Specialist, I want to define percentage or fixed amount rules
- **PY-CONFIG-021**: As a Payroll Manager, I want to approve/reject policy configurations
- **PY-CONFIG-022**: As a Payroll Specialist, I want to set effective dates for policies

### Database Schema

**Collection**: `payrollPolicies`

```typescript
{
  _id: ObjectId,
  policyName: string,        // required
  policyType: PolicyType,    // DEDUCTION | ALLOWANCE | BENEFIT | MISCONDUCT | LEAVE
  description: string,       // required
  effectiveDate: Date,       // required
  ruleDefinition: {
    percentage: number,      // 0-100
    fixedAmount: number,     // min: 0
    thresholdAmount: number  // min: 1
  },
  applicability: Applicability,  // All Employees | FULL_TIME | PART_TIME | CONTRACTORS
  status: ConfigStatus,      // DRAFT | APPROVED | REJECTED
  createdBy: ObjectId,       // ref: EmployeeProfile
  approvedBy: ObjectId,      // ref: EmployeeProfile
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints (Plan)

```
POST   /api/payroll-config/policies              # Create policy
GET    /api/payroll-config/policies              # List all policies
GET    /api/payroll-config/policies/:id          # Get single policy
PUT    /api/payroll-config/policies/:id          # Update policy (Draft only)
DELETE /api/payroll-config/policies/:id          # Delete policy (Draft only)
POST   /api/payroll-config/policies/:id/submit   # Submit for approval
POST   /api/payroll-config/policies/:id/approve  # Approve
POST   /api/payroll-config/policies/:id/reject   # Reject
GET    /api/payroll-config/policies/active       # Get all active policies
```

### Implementation Tasks

**Planning**:

- [ ] Define all policy types and their calculation logic
- [ ] Document how policies integrate with payroll execution

**Design**:

- [ ] Create DTOs for policy operations
- [ ] Design rule definition structure
- [ ] Plan policy evaluation engine interface

**Implementation**:

- [ ] Implement payrollPolicies schema with nested RuleDefinition
- [ ] Implement PayrollPoliciesService
- [ ] Implement PayrollPoliciesController
- [ ] Add approval workflow
- [ ] Add applicability filters
- [ ] Add role-based guards
- [ ] Write tests

---

## Module 6: Pay Type Management

### Description

Defines different payment types used in the organization (e.g., Hourly, Daily, Monthly, Commission-based).

### Business Rules

- **BR-PT-001**: Pay type names must be unique
- **BR-PT-002**: Pay type amounts must be ≥ 6000 (for monthly types)
- **BR-PT-003**: Pay types must be approved before assignment
- **BR-PT-004**: Pay types determine calculation frequency in payroll

### User Stories

- **PY-CONFIG-023**: As a Payroll Specialist, I want to create pay types with base amounts
- **PY-CONFIG-024**: As a Payroll Specialist, I want to edit pay types before approval
- **PY-CONFIG-025**: As a Payroll Manager, I want to approve pay type configurations

### Database Schema

**Collection**: `payTypes`

```typescript
{
  _id: ObjectId,
  type: string,              // unique, required
  amount: number,            // min: 6000, required
  status: ConfigStatus,      // DRAFT | APPROVED | REJECTED
  createdBy: ObjectId,       // ref: EmployeeProfile
  approvedBy: ObjectId,      // ref: EmployeeProfile
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints (Plan)

```
POST   /api/payroll-config/pay-types              # Create pay type
GET    /api/payroll-config/pay-types              # List all pay types
GET    /api/payroll-config/pay-types/:id          # Get single pay type
PUT    /api/payroll-config/pay-types/:id          # Update pay type
DELETE /api/payroll-config/pay-types/:id          # Delete (Draft only)
POST   /api/payroll-config/pay-types/:id/approve  # Approve
```

### Implementation Tasks

**Planning**:

- [ ] Define standard pay type categories

**Design**:

- [ ] Create DTOs for pay types

**Implementation**:

- [ ] Implement payType schema
- [ ] Implement PayTypeService
- [ ] Implement PayTypeController
- [ ] Add approval workflow
- [ ] Write tests

---

## Module 7: Signing Bonus Management

### Description

Manages signing bonuses for new hires based on position levels. Automatically triggered when a new employee is onboarded (ONB-019).

### Business Rules

- **BR-SB-001**: Signing bonuses are position-specific
- **BR-SB-002**: Only one signing bonus per position
- **BR-SB-003**: Signing bonus amounts must be ≥ 0
- **BR-SB-004**: Signing bonuses must be approved before use
- **BR-SB-005**: Automatically included in first payroll run for new hires

### User Stories

- **PY-CONFIG-026**: As a Payroll Specialist, I want to configure signing bonuses per position
- **PY-CONFIG-027**: As a Payroll Manager, I want to approve signing bonus amounts
- **PY-CONFIG-028**: As a System, I want to automatically apply signing bonuses to new hire payroll (ONB-019)

### Database Schema

**Collection**: `signingBonuses`

```typescript
{
  _id: ObjectId,
  positionName: string,      // unique, required
  amount: number,            // min: 0, required
  status: ConfigStatus,      // DRAFT | APPROVED | REJECTED
  createdBy: ObjectId,       // ref: EmployeeProfile
  approvedBy: ObjectId,      // ref: EmployeeProfile
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints (Plan)

```
POST   /api/payroll-config/signing-bonuses              # Create signing bonus
GET    /api/payroll-config/signing-bonuses              # List all signing bonuses
GET    /api/payroll-config/signing-bonuses/:id          # Get single signing bonus
PUT    /api/payroll-config/signing-bonuses/:id          # Update
DELETE /api/payroll-config/signing-bonuses/:id          # Delete (Draft only)
POST   /api/payroll-config/signing-bonuses/:id/approve  # Approve
GET    /api/payroll-config/signing-bonuses/position/:name  # Get by position
```

### Implementation Tasks

**Planning**:

- [ ] Document integration with Onboarding module (ONB-019)
- [ ] Define trigger mechanism for new hire detection

**Design**:

- [ ] Create DTOs for signing bonuses
- [ ] Design onboarding event listener interface

**Implementation**:

- [ ] Implement signingBonus schema
- [ ] Implement SigningBonusService
- [ ] Implement SigningBonusController
- [ ] Add approval workflow
- [ ] Implement onboarding event integration
- [ ] Write tests

---

## Module 8: Termination & Resignation Benefits Management

### Description

Manages benefits for employees who resign or are terminated (e.g., End of Service Gratuity). Automatically triggered during offboarding (OFF-013).

### Business Rules

- **BR-TB-001**: Benefit names must be unique
- **BR-TB-002**: Benefit amounts must be ≥ 0
- **BR-TB-003**: Benefits can have terms and conditions
- **BR-TB-004**: Benefits must be approved before use
- **BR-TB-005**: Automatically calculated during final settlement

### User Stories

- **PY-CONFIG-029**: As a Payroll Specialist, I want to configure termination/resignation benefits
- **PY-CONFIG-030**: As a Payroll Specialist, I want to define terms for each benefit type
- **PY-CONFIG-031**: As a Payroll Manager, I want to approve benefit configurations
- **PY-CONFIG-032**: As a System, I want to automatically calculate final settlements using these benefits (OFF-013)

### Database Schema

**Collection**: `terminationAndResignationBenefits`

```typescript
{
  _id: ObjectId,
  name: string,              // unique, required
  amount: number,            // min: 0, required
  terms: string,             // optional
  status: ConfigStatus,      // DRAFT | APPROVED | REJECTED
  createdBy: ObjectId,       // ref: EmployeeProfile
  approvedBy: ObjectId,      // ref: EmployeeProfile
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints (Plan)

```
POST   /api/payroll-config/termination-benefits              # Create benefit
GET    /api/payroll-config/termination-benefits              # List all benefits
GET    /api/payroll-config/termination-benefits/:id          # Get single benefit
PUT    /api/payroll-config/termination-benefits/:id          # Update
DELETE /api/payroll-config/termination-benefits/:id          # Delete (Draft only)
POST   /api/payroll-config/termination-benefits/:id/approve  # Approve
```

### Implementation Tasks

**Planning**:

- [ ] Document integration with Offboarding module (OFF-013)
- [ ] Define final settlement calculation logic

**Design**:

- [ ] Create DTOs for termination benefits
- [ ] Design offboarding event listener interface

**Implementation**:

- [ ] Implement terminationAndResignationBenefits schema
- [ ] Implement TerminationBenefitsService
- [ ] Implement TerminationBenefitsController
- [ ] Add approval workflow
- [ ] Implement offboarding event integration
- [ ] Write tests

---

## Module 9: Company-Wide Settings Management

### Description

Manages global payroll settings including pay dates, timezone, and currency.

### Business Rules

- **BR-CS-001**: Only one active company-wide setting per organization
- **BR-CS-002**: Pay date must be within 1-31
- **BR-CS-003**: Currency is locked to EGP
- **BR-CS-004**: Timezone must be valid IANA timezone
- **BR-CS-005**: Changes require System Admin role

### User Stories

- **PY-CONFIG-033**: As a System Admin, I want to configure company pay date
- **PY-CONFIG-034**: As a System Admin, I want to set the system timezone
- **PY-CONFIG-035**: As a Payroll Specialist, I want to view current company-wide settings

### Database Schema

**Collection**: `companyWideSettings`

```typescript
{
  _id: ObjectId,
  payDate: Date,             // required
  timeZone: string,          // required
  currency: string,          // default: 'EGP', required
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints (Plan)

```
POST   /api/payroll-config/company-settings       # Create/Initialize settings
GET    /api/payroll-config/company-settings       # Get current settings
PUT    /api/payroll-config/company-settings       # Update settings (System Admin)
```

### Implementation Tasks

**Planning**:

- [ ] Define validation rules for pay date and timezone

**Design**:

- [ ] Create DTOs for company settings

**Implementation**:

- [ ] Implement CompanyWideSettings schema
- [ ] Implement CompanySettingsService
- [ ] Implement CompanySettingsController
- [ ] Add role-based guards (SystemAdmin only)
- [ ] Write tests

---

## Module 10: Approval Workflow Engine

### Description

A **cross-cutting service** that manages the approval workflow state machine for all configuration entities.

### Business Rules

- **BR-AW-001**: All configurations start in DRAFT status
- **BR-AW-002**: Only DRAFT items can be edited
- **BR-AW-003**: Approval requires specific roles per configuration type
- **BR-AW-004**: Rejection returns item to DRAFT with reason logged
- **BR-AW-005**: Approved items cannot be edited without creating new version

### User Stories

- **PY-CONFIG-036**: As a Payroll Specialist, I want to submit configurations for approval
- **PY-CONFIG-037**: As a Payroll Manager, I want to see all pending approvals in a dashboard
- **PY-CONFIG-038**: As a Payroll Manager, I want to approve or reject with comments
- **PY-CONFIG-039**: As a System, I want to enforce approval workflows across all config types

### State Machine

```
DRAFT → (submit) → PENDING_APPROVAL → (approve) → APPROVED
                                    ↓ (reject)
                                   DRAFT (with rejection reason)
```

### Implementation Tasks

**Planning**:

- [ ] Design workflow state machine
- [ ] Define role-to-configuration-type mapping

**Design**:

- [ ] Create approval workflow interfaces
- [ ] Design notification system for approvals

**Implementation**:

- [ ] Implement ApprovalWorkflowService
- [ ] Implement state transition logic
- [ ] Add audit logging for all transitions
- [ ] Create approval dashboard endpoint
- [ ] Write tests

---

## Module 11: Configuration Validation Service

### Description

Centralized validation service that enforces business rules across all configuration entities.

### Business Rules

- **BR-CV-001**: All salary-related amounts must be ≥ 6000 EGP
- **BR-CV-002**: Percentages must be between 0-100
- **BR-CV-003**: Date fields must not be in the past (for effective dates)
- **BR-CV-004**: Unique constraints must be enforced
- **BR-CV-005**: Cross-entity validations (e.g., pay grade assigned to position exists)

### Implementation Tasks

**Planning**:

- [ ] Catalog all validation rules across modules

**Design**:

- [ ] Create validation interfaces
- [ ] Design custom validators

**Implementation**:

- [ ] Implement ConfigValidationService
- [ ] Create custom NestJS validators
- [ ] Add validation pipes
- [ ] Write tests

---

## Module 12: Audit Trail Service

### Description

Tracks all configuration changes for compliance and forensics.

### Business Rules

- **BR-AT-001**: All configuration changes must be logged
- **BR-AT-002**: Logs must include: who, what, when, why
- **BR-AT-003**: Logs are immutable
- **BR-AT-004**: Logs must be queryable by entity, user, date range

### Database Schema

**Collection**: `auditLogs`

```typescript
{
  _id: ObjectId,
  entityType: string,        // PayGrade | Allowance | TaxRule | etc.
  entityId: ObjectId,        // ID of the configuration entity
  action: string,            // CREATE | UPDATE | DELETE | APPROVE | REJECT
  actorId: ObjectId,         // ref: EmployeeProfile
  timestamp: Date,           // required
  changes: {                 // before/after snapshot
    before: object,
    after: object
  },
  reason: string,            // optional (for rejections)
  ipAddress: string
}
```

### API Endpoints (Plan)

```
GET    /api/payroll-config/audit-logs              # Query audit logs
GET    /api/payroll-config/audit-logs/entity/:id   # Get logs for specific entity
GET    /api/payroll-config/audit-logs/export       # Export audit logs (CSV/PDF)
```

### Implementation Tasks

**Planning**:

- [ ] Define audit event types

**Design**:

- [ ] Create audit log DTOs
- [ ] Design event listener pattern

**Implementation**:

- [ ] Implement AuditLog schema
- [ ] Implement AuditTrailService
- [ ] Add event listeners to all configuration services
- [ ] Implement audit log query endpoints
- [ ] Write tests

---

## Implementation Roadmap

### Week 1: Foundation & Core Modules (Milestone 1)

**Objective**: Set up project structure, implement database schemas, and establish integration foundation

**Team Member 1**: Database & Schema Setup

- [ ] Set up MongoDB connection and configuration
- [ ] Implement all 9 configuration schemas (Pay Grades, Allowances, Tax Rules, Insurance, Policies, Pay Types, Signing Bonus, Termination Benefits, Company Settings)
- [ ] Add schema validations and indexes
- [ ] Create seed data for testing
- [ ] Set up shared enums (ConfigStatus, PolicyType, Applicability)

**Team Member 2**: Core Service Implementation (Part 1)

- [ ] Implement PayGradeService with CRUD operations
- [ ] Implement AllowanceService with CRUD operations
- [ ] Implement TaxRulesService with CRUD operations
- [ ] Add basic validation logic
- [ ] Create DTOs for all entities

**Team Member 3**: Core Service Implementation (Part 2) + Integration

- [ ] Implement InsuranceBracketsService
- [ ] Implement PayrollPoliciesService
- [ ] Implement PayTypeService
- [ ] Set up integration points with Employee Profile (dummy data)
- [ ] Set up integration points with Organization Structure (dummy data)
- [ ] Document API contracts for downstream subsystems (Payroll Execution)

---

### Week 2-3: Business Logic & Approval Workflows (Milestone 2)

**Objective**: Implement full business logic, approval workflows, and all API endpoints

**Team Member 1**: Approval Workflow & Validation

- [ ] Implement ApprovalWorkflowService with state machine
- [ ] Implement ConfigValidationService
- [ ] Add approval endpoints to all controllers
- [ ] Implement role-based guards (PayrollSpecialist, PayrollManager, HRManager, SystemAdmin)
- [ ] Add notification system for approval events

**Team Member 2**: Remaining Services & Controllers (Part 1)

- [ ] Implement SigningBonusService
- [ ] Implement TerminationBenefitsService
- [ ] Implement CompanySettingsService
- [ ] Create PayGradeController with all endpoints
- [ ] Create AllowanceController with all endpoints
- [ ] Create TaxRulesController with all endpoints

**Team Member 3**: Remaining Controllers & Audit Trail

- [ ] Create InsuranceBracketsController
- [ ] Create PayrollPoliciesController
- [ ] Create PayTypeController
- [ ] Create SigningBonusController
- [ ] Create TerminationBenefitsController
- [ ] Create CompanySettingsController
- [ ] Implement AuditTrailService
- [ ] Add audit logging to all configuration changes
- [ ] Implement audit log query endpoints

**All Team Members**: Testing & Integration

- [ ] Write unit tests for all services (target 80% coverage)
- [ ] Write integration tests for API endpoints
- [ ] Test approval workflows end-to-end
- [ ] Test integration with dummy Employee Profile data
- [ ] Test integration with dummy Organization Structure data
- [ ] Document all APIs in Swagger/OpenAPI
- [ ] Create Postman collection for manual testing

---

### Week 4-5: Frontend Integration & Deployment (Milestone 3)

**Note**: This phase may be handled by frontend team, but backend team should support

**Backend Support Tasks**:

- [ ] Add CORS configuration
- [ ] Implement pagination for list endpoints
- [ ] Add filtering and sorting to GET endpoints
- [ ] Optimize database queries (add indexes if needed)
- [ ] Add request/response logging
- [ ] Implement rate limiting
- [ ] Add API documentation (Swagger UI)
- [ ] Perform security audit
- [ ] Set up deployment configuration
- [ ] Create deployment scripts
- [ ] Deploy to staging environment
- [ ] Conduct load testing
- [ ] Fix any performance issues
- [ ] Deploy to production

---

## Database Schemas Reference

### Complete Schema Summary

| Schema Name                       | Collection                        | Primary Fields                                                       | Status Field | Approval Workflow         |
| --------------------------------- | --------------------------------- | -------------------------------------------------------------------- | ------------ | ------------------------- |
| payGrade                          | payGrades                         | grade, baseSalary, grossSalary                                       | ✓            | PayrollManager            |
| allowance                         | allowances                        | name, amount                                                         | ✓            | PayrollManager            |
| taxRules                          | taxRules                          | name, rate, description                                              | ✓            | PayrollManager            |
| insuranceBrackets                 | insuranceBrackets                 | name, minSalary, maxSalary, employeeRate, employerRate               | ✓            | HRManager                 |
| payrollPolicies                   | payrollPolicies                   | policyName, policyType, ruleDefinition, applicability, effectiveDate | ✓            | PayrollManager            |
| payType                           | payTypes                          | type, amount                                                         | ✓            | PayrollManager            |
| signingBonus                      | signingBonuses                    | positionName, amount                                                 | ✓            | PayrollManager            |
| terminationAndResignationBenefits | terminationAndResignationBenefits | name, amount, terms                                                  | ✓            | PayrollManager            |
| CompanyWideSettings               | companyWideSettings               | payDate, timeZone, currency                                          | ✗            | SystemAdmin (no approval) |

### Common Fields Across Schemas

All configuration schemas share these fields:

```typescript
{
  status: ConfigStatus,      // DRAFT | APPROVED | REJECTED
  createdBy: ObjectId,       // ref: EmployeeProfile
  approvedBy: ObjectId,      // ref: EmployeeProfile
  approvedAt: Date,
  createdAt: Date,           // Auto-generated by Mongoose
  updatedAt: Date            // Auto-generated by Mongoose
}
```

---

## Integration Points with Other Subsystems

### 1. Payroll Execution Subsystem

**Data Flow**: Configuration → Execution

**Consumed Data**:

- Approved Pay Grades → Gross Salary calculation
- Approved Tax Rules → Tax deduction calculation
- Approved Insurance Brackets → Insurance deduction calculation
- Approved Allowances → Allowance addition to salary
- Approved Policies → Deduction/Benefit application
- Approved Signing Bonuses → New hire bonus processing
- Approved Termination Benefits → Final settlement calculation

**Integration Method**:

- Payroll Execution queries approved configurations via service layer
- Only APPROVED status configurations are used in calculations
- Configuration changes don't affect past payroll runs (historical accuracy)

### 2. Employee Profile Subsystem

**Data Flow**: Bidirectional

**Provided to Employee Profile**:

- Assigned Pay Grade
- Benefits eligibility

**Consumed from Employee Profile**:

- Employee ID
- Employment status
- Contract type
- Position assignment

### 3. Organization Structure Subsystem

**Data Flow**: Bidirectional

**Provided to Org Structure**:

- Pay Grades (for position assignment)

**Consumed from Org Structure**:

- Position names (for signing bonuses)
- Department info (for policy applicability)

### 4. Recruitment/Onboarding Subsystem

**Data Flow**: Configuration → Onboarding

**Integration Point: ONB-018, ONB-019**

- When new employee is onboarded, system fetches:
  - Signing bonus for position
  - Pay grade for position
  - Applicable policies
- Triggers payroll initiation for new hire

### 5. Offboarding Subsystem

**Data Flow**: Configuration → Offboarding

**Integration Point: OFF-013**

- When employee exits, system fetches:
  - Termination/resignation benefits
  - Final settlement rules
  - Leave encashment policies
- Calculates final payment

### 6. Time Management Subsystem

**Data Flow**: Time → Configuration (for policies)

**Integration**:

- Overtime policies defined in Payroll Policies
- Penalty policies defined in Payroll Policies
- Time Management provides hours/penalties → Payroll Execution uses policies to calculate

### 7. Leaves Subsystem

**Data Flow**: Leaves → Configuration (for policies)

**Integration**:

- Leave encashment policies defined in Payroll Policies
- Unpaid leave deduction policies
- Leaves provides leave days → Payroll Execution uses policies to calculate adjustments

---

## Security & Access Control

### Role Definitions

| Role                   | Permissions                               | Configuration Types                             |
| ---------------------- | ----------------------------------------- | ----------------------------------------------- |
| **Payroll Specialist** | CREATE, READ, UPDATE (Draft only), SUBMIT | All except Insurance Brackets                   |
| **Payroll Manager**    | READ, APPROVE, REJECT                     | All except Insurance Brackets, Company Settings |
| **HR Manager**         | READ, APPROVE, REJECT, UPDATE, DELETE     | Insurance Brackets only                         |
| **Legal Admin**        | CREATE, READ, UPDATE (Draft only)         | Tax Rules only                                  |
| **System Admin**       | FULL CONTROL                              | Company Settings only                           |

### Implementation

- Use NestJS Guards for role-based access control
- Use NestJS Pipes for validation
- Use Decorators: `@Roles()`, `@RequirePermission()`
- Audit all access attempts

---

## Testing Strategy

### Unit Tests (Target: 80% Coverage)

- Test all service methods independently
- Mock external dependencies (database, other services)
- Test validation logic thoroughly
- Test approval state transitions

### Integration Tests

- Test full API endpoints
- Test database operations
- Test approval workflows end-to-end
- Test role-based access control

### End-to-End Tests

- Test complete user workflows (create → submit → approve)
- Test integration with dummy data from other subsystems
- Test error scenarios and edge cases

---

## Deliverables Checklist

### Code Deliverables

- [ ] All 12 modules implemented
- [ ] All database schemas created and validated
- [ ] All API endpoints implemented
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] API documentation (Swagger) complete
- [ ] Code reviewed and approved

### Documentation Deliverables

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Integration guide for other subsystems
- [ ] Deployment guide
- [ ] User role guide
- [ ] Testing report

### Deployment Deliverables

- [ ] Docker configuration
- [ ] Environment configuration (.env templates)
- [ ] Database migration scripts
- [ ] Seed data scripts
- [ ] CI/CD pipeline configuration
- [ ] Monitoring and logging setup

---

## Glossary

- **Configuration Entity**: Any payroll setup data (Pay Grade, Allowance, Tax Rule, etc.)
- **Approval Workflow**: Multi-step process to validate and approve configuration changes
- **Draft Status**: Initial state of configuration, editable
- **Approved Status**: Configuration is validated and ready for use in payroll
- **Rejected Status**: Configuration was reviewed and rejected, reason logged
- **Audit Trail**: Immutable log of all configuration changes
- **Pay Grade**: Standardized salary structure for a position level
- **Allowance**: Additional payment added to salary
- **Deduction**: Amount subtracted from salary (tax, insurance, penalties)
- **Policy**: Rule-based configuration for calculations
- **Signing Bonus**: One-time payment for new hires
- **Termination Benefit**: Payment during employee exit
- **Company-Wide Settings**: Global payroll parameters

---

## Contact & Support

For questions about this implementation guide:

- Review the sp-project.md for overall project context
- Check HR System Requirements file for detailed user stories
- Refer to HR-System-main/src/payroll-configuration for schema examples
- Consult with Payroll Execution team for integration points

---

**Document Version**: 1.0  
**Last Updated**: November 26, 2025  
**Prepared for**: Payroll Configuration & Policy Team
