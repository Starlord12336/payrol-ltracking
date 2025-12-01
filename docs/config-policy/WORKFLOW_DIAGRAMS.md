# Payroll Configuration & Policy - Workflow & Architecture Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PAYROLL CONFIG & POLICY SUBSYSTEM                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│  CORE CONFIG  │          │  COMPLIANCE   │          │    SYSTEM     │
│   ENTITIES    │          │  & BENEFITS   │          │  & TRACKING   │
└───────────────┘          └───────────────┘          └───────────────┘
        │                           │                           │
    ┌───┴────┐                  ┌───┴────┐                  ┌───┴────┐
    ▼        ▼                  ▼        ▼                  ▼        ▼
┌────────┐ ┌─────────┐    ┌──────────┐ ┌─────────┐   ┌─────────┐ ┌──────────┐
│Pay     │ │Allowance│    │Insurance │ │Payroll  │   │Pay Type │ │Termina-  │
│Grades  │ │         │    │Brackets  │ │Policies │   │         │ │tion      │
└────────┘ └─────────┘    └──────────┘ └─────────┘   └─────────┘ │Benefits  │
┌────────┐                ┌──────────┐               ┌─────────┐ └──────────┘
│Tax     │                │Signing   │               │Company  │ ┌──────────┐
│Rules   │                │Bonus     │               │Settings │ │Audit     │
└────────┘                └──────────┘               └─────────┘ │Trail     │
                                                                  └──────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    ▼
                        ┌───────────────────────┐
                        │  APPROVAL WORKFLOW    │
                        │       ENGINE          │
                        └───────────────────────┘
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
                ┌───────────────┐       ┌───────────────┐
                │  VALIDATION   │       │  AUDIT TRAIL  │
                │    SERVICE    │       │    SERVICE    │
                └───────────────┘       └───────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SUBSYSTEMS                               │
└─────────────────────────────────────────────────────────────────────────┘
        │                    │                    │                    │
        │                    │                    │                    │
   [Employee            [Org                 [Time              [Onboarding/
    Profile]            Structure]            Mgmt]              Offboarding]
        │                    │                    │                    │
        │                    │                    │                    │
        └────────────────────┼────────────────────┼────────────────────┘
                             │                    │
                             ▼                    ▼
                    ┌─────────────────────────────────────┐
                    │   PAYROLL CONFIG & POLICY API       │
                    │         (Controllers)               │
                    └─────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
            │  Services   │  │  Services   │  │  Services   │
            │  (Business  │  │  (Business  │  │  (Business  │
            │   Logic)    │  │   Logic)    │  │   Logic)    │
            └─────────────┘  └─────────────┘  └─────────────┘
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
            │  Approval   │  │ Validation  │  │  Audit      │
            │  Workflow   │  │  Service    │  │  Trail      │
            └─────────────┘  └─────────────┘  └─────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────────┐
                    │       MongoDB Database              │
                    │  (Schemas/Collections/Documents)    │
                    └─────────────────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────────┐
                    │      PAYROLL EXECUTION              │
                    │    (Downstream Consumer)            │
                    └─────────────────────────────────────┘
```

---

## Approval Workflow State Machine

```
                    ┌───────────────┐
                    │     DRAFT     │ ◄─────┐
                    └───────┬───────┘       │
                            │               │
                            │ submit()      │
                            ▼               │
                    ┌───────────────┐       │
                    │   PENDING     │       │ reject()
                    │   APPROVAL    │       │
                    └───────┬───────┘       │
                            │               │
                  ┌─────────┴─────────┐     │
                  │                   │     │
        approve() │         reject()  │     │
                  ▼                   └─────┘
          ┌───────────────┐
          │   APPROVED    │
          └───────────────┘
                  │
                  │ (used in payroll execution)
                  ▼
          [Active in System]


Legend:
━━━━ : Normal flow
- - - : Rejection flow
```

---

## Configuration Lifecycle Flow

```
Step 1: CREATE
┌──────────────────────────────────────────────────────────┐
│ Payroll Specialist creates new configuration            │
│ Status: DRAFT                                            │
│ Actions: CREATE, READ, UPDATE, DELETE                    │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
Step 2: SUBMIT FOR APPROVAL
┌──────────────────────────────────────────────────────────┐
│ Payroll Specialist submits for approval                 │
│ Status: PENDING_APPROVAL                                 │
│ Actions: READ only                                       │
│ Notification sent to Payroll Manager                     │
└──────────────────┬───────────────────────────────────────┘
                   │
            ┌──────┴──────┐
            │             │
            ▼             ▼
Step 3a: APPROVE      Step 3b: REJECT
┌─────────────────┐  ┌────────────────────────────────────┐
│ Payroll Manager │  │ Payroll Manager rejects            │
│ approves        │  │ with reason                        │
│                 │  │ Status: DRAFT                      │
│ Status: APPROVED│  │ Payroll Specialist notified        │
└────────┬────────┘  │ Can edit and resubmit              │
         │           └────────────────────────────────────┘
         │
         ▼
Step 4: ACTIVE IN SYSTEM
┌──────────────────────────────────────────────────────────┐
│ Configuration is now active and used in payroll          │
│ execution                                                 │
│ Actions: READ only (versioning for changes)              │
│ Audit trail maintained                                   │
└──────────────────────────────────────────────────────────┘
```

---

## Module Interaction Diagram

```
                    ┌─────────────────────────┐
                    │  Approval Workflow      │
                    │  Engine (Cross-cutting) │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐        ┌───────────────┐       ┌───────────────┐
│  Pay Grades   │        │  Allowances   │       │  Tax Rules    │
│               │        │               │       │               │
│  submits to   │        │  submits to   │       │  submits to   │
│  workflow     │        │  workflow     │       │  workflow     │
└───────┬───────┘        └───────┬───────┘       └───────┬───────┘
        │                        │                        │
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Validation Service     │
                    │  (Cross-cutting)        │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐        ┌───────────────┐       ┌───────────────┐
│  Insurance    │        │  Policies     │       │  Pay Types    │
│  Brackets     │        │               │       │               │
│               │        │  validates    │       │  validates    │
│  validates    │        │  rules        │       │  amounts      │
└───────┬───────┘        └───────┬───────┘       └───────┬───────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Audit Trail Service    │
                    │  (Logs all changes)     │
                    └─────────────────────────┘
```

---

## User Interaction Flow

### Payroll Specialist Workflow

```
1. Login to System
        ↓
2. Navigate to Payroll Config
        ↓
3. Select Configuration Type
        ↓
   ┌────┴────┐
   │ Choose: │
   ├─────────┤
   │ • Pay Grade
   │ • Allowance
   │ • Tax Rule
   │ • Policy
   │ etc.
   └────┬────┘
        ↓
4. Create New Configuration
        ↓
   ┌────────────────┐
   │ Fill Form:     │
   │ • Name         │
   │ • Amount       │
   │ • Description  │
   │ • Rules        │
   └────┬───────────┘
        ↓
5. Save as DRAFT
        ↓
   ┌────┴────┐
   │ Options:│
   ├─────────┤
   │ • Edit  │ ──► Back to Step 4
   │ • Delete│ ──► Confirm & Delete
   │ • Submit│ ──► Continue below
   └────┬────┘
        ↓
6. Submit for Approval
        ↓
7. Wait for Manager Review
        ↓
   ┌────────┴─────────┐
   │                  │
   ▼                  ▼
APPROVED          REJECTED
   │                  │
   │                  └──► Edit & Resubmit (Back to Step 4)
   │
   └──► Configuration Active
```

### Payroll Manager Workflow

```
1. Login to System
        ↓
2. Navigate to Approvals Dashboard
        ↓
3. View Pending Approvals List
        ↓
   ┌────────────────────┐
   │ Pending Items:     │
   │ • Pay Grade #123   │
   │ • Allowance #456   │
   │ • Tax Rule #789    │
   └────────┬───────────┘
            ↓
4. Select Item to Review
        ↓
5. View Details
        ↓
   ┌────────────────────┐
   │ Review:            │
   │ • Configuration    │
   │ • Created By       │
   │ • Date Submitted   │
   │ • Validation Status│
   └────────┬───────────┘
            ↓
6. Make Decision
        ↓
   ┌────┴────┐
   │ Choose: │
   ├─────────┤
   │ Approve │ ──► Configuration becomes APPROVED
   │    or   │
   │ Reject  │ ──► Enter Reason → Notify Specialist
   └─────────┘
```

---

## Integration Flow with Other Subsystems

### 1. Onboarding Integration (Signing Bonus)

```
ONBOARDING MODULE                    CONFIG & POLICY MODULE
─────────────────                    ──────────────────────

New Employee Hired
Contract Signed
        │
        ├──► Event: NewHireCreated
        │    {
        │      employeeId,
        │      position,
        │      contractDate
        │    }
        │
        └────────────────────────────────────┐
                                             │
                                             ▼
                              ┌──────────────────────────┐
                              │ Signing Bonus Service    │
                              │ Receives Event           │
                              └──────────┬───────────────┘
                                         │
                              Query: Get Signing Bonus
                              WHERE position = :position
                              AND status = APPROVED
                                         │
                                         ▼
                              ┌──────────────────────────┐
                              │ Return Bonus Amount      │
                              └──────────┬───────────────┘
                                         │
        ┌────────────────────────────────┘
        │
        ▼
PAYROLL EXECUTION MODULE
────────────────────────
Process First Payroll
Include Signing Bonus
```

### 2. Offboarding Integration (Termination Benefits)

```
OFFBOARDING MODULE                   CONFIG & POLICY MODULE
──────────────────                   ──────────────────────

Employee Exits
Clearance Complete
        │
        ├──► Event: EmployeeOffboarding
        │    {
        │      employeeId,
        │      exitDate,
        │      exitReason
        │    }
        │
        └────────────────────────────────────┐
                                             │
                                             ▼
                              ┌──────────────────────────┐
                              │ Termination Benefits     │
                              │ Service Receives Event   │
                              └──────────┬───────────────┘
                                         │
                              Query: Get Termination Benefits
                              WHERE status = APPROVED
                                         │
                                         ▼
                              ┌──────────────────────────┐
                              │ Calculate Final          │
                              │ Settlement Amount        │
                              └──────────┬───────────────┘
                                         │
        ┌────────────────────────────────┘
        │
        ▼
PAYROLL EXECUTION MODULE
────────────────────────
Process Final Payroll
Include Termination Benefits
```

### 3. Payroll Execution Integration (Normal Flow)

```
PAYROLL EXECUTION MODULE             CONFIG & POLICY MODULE
────────────────────────             ──────────────────────

Initiate Payroll Run
        │
        ├──► Request: Get All Active Configs
        │    {
        │      configTypes: [
        │        'payGrades',
        │        'allowances',
        │        'taxRules',
        │        'insuranceBrackets',
        │        'policies'
        │      ]
        │    }
        │
        └────────────────────────────────────┐
                                             │
                                             ▼
                              ┌──────────────────────────┐
                              │ Config Service           │
                              │ Aggregates All APPROVED  │
                              │ Configurations           │
                              └──────────┬───────────────┘
                                         │
                              Query: WHERE status = APPROVED
                              GROUP BY configType
                                         │
                                         ▼
                              ┌──────────────────────────┐
                              │ Return Configuration Set │
                              │ {                        │
                              │   payGrades: [...],      │
                              │   allowances: [...],     │
                              │   taxRules: [...],       │
                              │   insurances: [...],     │
                              │   policies: [...]        │
                              │ }                        │
                              └──────────┬───────────────┘
                                         │
        ┌────────────────────────────────┘
        │
        ▼
Calculate Salaries
Apply Configurations
Generate Payslips
```

---

## Database Relationships Diagram

```
┌──────────────────────┐
│   EmployeeProfile    │
│   (External Schema)  │
└──────────┬───────────┘
           │
           │ createdBy
           │ approvedBy
           │
    ┌──────┴───────┬──────────┬──────────┬──────────┬──────────┐
    │              │          │          │          │          │
    ▼              ▼          ▼          ▼          ▼          ▼
┌────────┐   ┌─────────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐
│Pay     │   │Allowance│ │Tax     │ │Insurance │ │Payroll │ │Signing  │
│Grades  │   │         │ │Rules   │ │Brackets  │ │Policies│ │Bonus    │
└────────┘   └─────────┘ └────────┘ └──────────┘ └────────┘ └─────────┘
    │              │          │          │          │          │
    └──────┬───────┴──────────┴──────────┴──────────┴──────────┘
           │
           │ entityId, entityType
           │
           ▼
    ┌──────────────┐
    │  AuditLog    │
    │  (Tracks all │
    │   changes)   │
    └──────────────┘


Notes:
- All config entities reference EmployeeProfile for createdBy and approvedBy
- AuditLog tracks changes to all config entities
- No direct relationships between config entities (they're independent)
```

---

## Approval Workflow Decision Tree

```
                    Configuration Submitted
                            │
                            ▼
                    ┌───────────────┐
                    │ Validate Data │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
         ┌──────────┐           ┌──────────┐
         │ Valid?   │           │ Invalid? │
         └────┬─────┘           └────┬─────┘
              │ YES                  │ NO
              │                      ▼
              │              Return Error to User
              │              (Fix & Resubmit)
              │
              ▼
      ┌───────────────┐
      │ Route to      │
      │ Approver      │
      └───────┬───────┘
              │
      ┌───────┴────────────────────┐
      │                            │
      ▼                            ▼
┌──────────────┐            ┌──────────────┐
│ Payroll      │            │ HR Manager   │
│ Manager      │            │ (Insurance   │
│ (Most Configs)│           │  only)       │
└──────┬───────┘            └──────┬───────┘
       │                           │
       └─────────┬─────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Manager       │
         │ Reviews       │
         └───────┬───────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
   ┌─────────┐      ┌─────────┐
   │ Approve │      │ Reject  │
   └────┬────┘      └────┬────┘
        │                │
        │                ▼
        │        ┌───────────────┐
        │        │ Add Rejection │
        │        │ Reason        │
        │        └───────┬───────┘
        │                │
        │                ▼
        │        ┌───────────────┐
        │        │ Notify        │
        │        │ Specialist    │
        │        └───────┬───────┘
        │                │
        │                ▼
        │        Return to DRAFT
        │        (Can edit & resubmit)
        │
        ▼
┌───────────────┐
│ Status:       │
│ APPROVED      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Audit Log     │
│ Created       │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Notify        │
│ Specialist    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Available for │
│ Use in Payroll│
└───────────────┘
```

---

## Error Handling Flow

```
API Request
    │
    ▼
┌─────────────────┐
│ Validation Pipe │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
Valid?      Invalid?
    │          │
    │          └──► Return 400 Bad Request
    │               {
    │                 "statusCode": 400,
    │                 "message": ["error details"],
    │                 "error": "Bad Request"
    │               }
    │
    ▼
┌─────────────────┐
│ Authorization   │
│ Guard           │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
Authorized? Unauthorized?
    │          │
    │          └──► Return 403 Forbidden
    │               {
    │                 "statusCode": 403,
    │                 "message": "Forbidden",
    │                 "error": "Insufficient permissions"
    │               }
    │
    ▼
┌─────────────────┐
│ Business Logic  │
│ Execution       │
└────────┬────────┘
         │
    ┌────┴─────────────────┐
    │                      │
    ▼                      ▼
Success?            Business Rule Error?
    │                      │
    │                      └──► Return 422 Unprocessable Entity
    │                           {
    │                             "statusCode": 422,
    │                             "message": "Cannot delete approved config",
    │                             "error": "Business Rule Violation"
    │                           }
    │
    ▼
┌─────────────────┐
│ Return 200/201  │
│ Success         │
└─────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Environment                │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Load       │  │   NestJS     │  │   MongoDB    │
│   Balancer   │─▶│   Server 1   │─▶│   Cluster    │
└──────────────┘  └──────────────┘  └──────────────┘
        │         ┌──────────────┐         │
        └────────▶│   NestJS     │─────────┘
                  │   Server 2   │
                  └──────────────┘

┌─────────────────────────────────────────────────────────┐
│               Monitoring & Logging                       │
│  • Application Logs (Winston/Bunyan)                    │
│  • Performance Metrics (Prometheus/Grafana)              │
│  • Error Tracking (Sentry)                               │
│  • Audit Trail Storage (MongoDB)                         │
└─────────────────────────────────────────────────────────┘
```

---

## Summary

This document provides visual representations of:

1. **System Architecture** - How modules are organized
2. **Data Flow** - How data moves through the system
3. **Approval Workflows** - State transitions and approvals
4. **User Interactions** - Step-by-step user journeys
5. **Integration Flows** - How we connect with other subsystems
6. **Database Relationships** - How data is structured
7. **Error Handling** - How errors are managed
8. **Deployment** - Production architecture

Use these diagrams to:

- Understand the big picture
- Design your module implementation
- Communicate with team members
- Document integration points
- Plan testing scenarios

**Next Steps**:

1. Review these diagrams
2. Refer to PAYROLL_CONFIG_POLICY_IMPLEMENTATION_GUIDE.md for detailed module specs
3. Check MODULES_SUMMARY.md for team distribution
4. Start implementation!
