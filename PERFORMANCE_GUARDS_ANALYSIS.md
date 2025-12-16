# Performance Module Guards Analysis

## User Stories vs Current Implementation

### Template Management

**REQ-PP-01**: Template Config - **HR Manager** configures standardized appraisal templates and rating scales.
- **User Story Says**: HR Manager ONLY
- **Current Guard**: HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_MANAGER ONLY ✅

**Template Update**:
- **User Story Says**: HR Manager (implied from REQ-PP-01)
- **Current Guard**: HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_MANAGER ONLY ✅

**Template Delete**:
- **User Story Says**: Not specified, but likely HR Manager or System Admin
- **Current Guard**: HR_ADMIN, SYSTEM_ADMIN
- **Should Be**: HR_MANAGER, SYSTEM_ADMIN (or keep as is if HR_ADMIN is acceptable)

### Cycle Management

**REQ-PP-02**: Cycle Creation - **HR Manager** defines and schedules appraisal cycles (Annual, Probationary).
- **User Story Says**: HR Manager ONLY
- **Current Guard**: HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_MANAGER ONLY ✅

**Cycle Update**:
- **User Story Says**: HR Manager (implied from REQ-PP-02)
- **Current Guard**: HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_MANAGER ONLY ✅

**Cycle Activate**:
- **User Story Says**: HR Manager (implied)
- **Current Guard**: HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_MANAGER ONLY ✅

**Cycle Publish**:
- **User Story Says**: HR Manager (implied)
- **Current Guard**: HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_MANAGER ONLY ✅

**Cycle Close**:
- **User Story Says**: HR Manager (implied)
- **Current Guard**: HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_MANAGER ONLY ✅

### Assignment Management

**REQ-PP-05**: Assignment - **HR Employee** assigns appraisal forms/templates to employees and managers.
- **User Story Says**: HR Employee ONLY
- **Current Guard**: HR_EMPLOYEE, HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_EMPLOYEE ONLY ✅

**Assignment Update/Delete**:
- **User Story Says**: HR Employee (implied from REQ-PP-05)
- **Current Guard**: HR_EMPLOYEE, HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_EMPLOYEE ONLY ✅

### Employee Actions

**REQ-PP-07**: Acknowledge Goals - **Employee** receives notification of assigned objectives and acknowledges them.
- **User Story Says**: Employee (DEPARTMENT_EMPLOYEE)
- **Current Guard**: No guard (any authenticated user) ✅
- **Should Be**: DEPARTMENT_EMPLOYEE (should verify it's their own)

**REQ-AE-01**: View Objectives - **Employee** views assigned appraisal form and related objectives.
- **User Story Says**: Employee (DEPARTMENT_EMPLOYEE)
- **Current Guard**: No guard (any authenticated user) ✅
- **Should Be**: DEPARTMENT_EMPLOYEE (should verify it's their own)

**REQ-AE-02**: Self-Assessment - **Employee** submits self-assessment and attaches supporting documents.
- **User Story Says**: Employee (DEPARTMENT_EMPLOYEE)
- **Current Guard**: No guard (any authenticated user) ✅
- **Should Be**: DEPARTMENT_EMPLOYEE (should verify it's their own)

**REQ-OD-01**: Final View - **Employee** views final ratings, feedback, and development notes.
- **User Story Says**: Employee (DEPARTMENT_EMPLOYEE)
- **Current Guard**: No guard (any authenticated user) ✅
- **Should Be**: DEPARTMENT_EMPLOYEE (should verify it's their own)

### Manager Actions

**REQ-PP-12**: Set Objectives - **Line Manager** sets and reviews employee objectives.
- **User Story Says**: Line Manager (DEPARTMENT_HEAD)
- **Current Guard**: No guard (any authenticated user) ❌
- **Should Be**: DEPARTMENT_HEAD (should verify they're the manager of the employee)

**REQ-PP-13**: View Forms - **Line Manager** views assigned appraisal forms.
- **User Story Says**: Line Manager (DEPARTMENT_HEAD)
- **Current Guard**: No guard (any authenticated user) ❌
- **Should Be**: DEPARTMENT_HEAD (should verify they're the manager)

**REQ-AE-03**: Manager Rating - **Line Manager** completes structured appraisal ratings for direct reports.
- **User Story Says**: Line Manager (DEPARTMENT_HEAD)
- **Current Guard**: No guard (any authenticated user) ❌
- **Should Be**: DEPARTMENT_HEAD (should verify they're the manager of the employee)

**REQ-AE-04**: Feedback/Comments - **Line Manager** adds comments, examples, and development recommendations.
- **User Story Says**: Line Manager (DEPARTMENT_HEAD)
- **Current Guard**: No guard (any authenticated user) ❌
- **Should Be**: DEPARTMENT_HEAD (should verify they're the manager)

**REQ-OD-03**: Promotion Flag - **Line Manager** flags high-performers for promotion consideration.
- **User Story Says**: Line Manager (DEPARTMENT_HEAD)
- **Current Guard**: DEPARTMENT_HEAD, HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: DEPARTMENT_HEAD ONLY ✅

**REQ-OD-05**: PIP Initiation - **Line Manager** initiates Performance Improvement Plans (PIPs).
- **User Story Says**: Line Manager (DEPARTMENT_HEAD)
- **Current Guard**: DEPARTMENT_HEAD, HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: DEPARTMENT_HEAD ONLY ✅

### HR Employee Actions

**REQ-AE-06**: Monitor Progress - **HR Employee** monitors appraisal progress and sends reminders.
- **User Story Says**: HR Employee ONLY
- **Current Guard**: Need to check service implementation
- **Should Be**: HR_EMPLOYEE ONLY ✅

### HR Manager Actions

**REQ-AE-10**: HR Dashboard - **HR Manager** tracks appraisal completion via consolidated dashboard.
- **User Story Says**: HR Manager ONLY
- **Current Guard**: Need to check if there's a dashboard endpoint
- **Should Be**: HR_MANAGER ONLY ✅

**REQ-OD-07**: Dispute Resolution - **HR Manager** resolves disputes between employees and managers.
- **User Story Says**: HR Manager ONLY
- **Current Guard**: HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN ❌
- **Should Be**: HR_MANAGER ONLY ✅

### Dispute Actions

**REQ-AE-07**: Dispute/Flag - **Employee or HR** flags or raises a concern about a rating.
- **User Story Says**: Employee (DEPARTMENT_EMPLOYEE) OR HR (HR_EMPLOYEE)
- **Current Guard**: DEPARTMENT_EMPLOYEE, DEPARTMENT_HEAD, HR_MANAGER, HR_ADMIN, HR_EMPLOYEE, SYSTEM_ADMIN ❌
- **Should Be**: DEPARTMENT_EMPLOYEE, HR_EMPLOYEE ONLY ✅

### History/Trends

**REQ-OD-08**: History/Trends - **Employee/Manager** accesses past appraisal history and trend views.
- **User Story Says**: Employee (DEPARTMENT_EMPLOYEE) OR Manager (DEPARTMENT_HEAD)
- **Current Guard**: Uses RolesGuard but checks in service
- **Should Be**: DEPARTMENT_EMPLOYEE, DEPARTMENT_HEAD ✅

### System Admin Actions

**REQ-OD-16**: Visibility Rules - **System Admin** configures visibility rules for feedback entries.
- **User Story Says**: System Admin ONLY
- **Current Guard**: SYSTEM_ADMIN ONLY ✅
- **Should Be**: SYSTEM_ADMIN ONLY ✅

### Export Actions

**Export Summaries** (REQ-AE-11 implied):
- **User Story Says**: HR Employee exports ad-hoc appraisal summaries
- **Current Guard**: HR_MANAGER, HR_ADMIN, HR_EMPLOYEE, SYSTEM_ADMIN ❌
- **Should Be**: HR_EMPLOYEE ONLY ✅

**Export Outcome Report** (REQ-OD-06 implied):
- **User Story Says**: HR Employee generates outcome reports
- **Current Guard**: HR_MANAGER, HR_ADMIN, HR_EMPLOYEE, SYSTEM_ADMIN ❌
- **Should Be**: HR_EMPLOYEE ONLY ✅

## Summary of Required Changes

### Must Change to HR_MANAGER ONLY:
1. Template Config (Create/Update) - REQ-PP-01
2. Cycle Creation - REQ-PP-02
3. Cycle Update - REQ-PP-02
4. Cycle Activate - REQ-PP-02
5. Cycle Publish - REQ-PP-02
6. Cycle Close - REQ-PP-02
7. Dispute Resolution - REQ-OD-07
8. HR Dashboard (if exists) - REQ-AE-10

### Must Change to HR_EMPLOYEE ONLY:
1. Assignment (Create/Update/Delete) - REQ-PP-05
2. Monitor Progress - REQ-AE-06
3. Export Summaries - REQ-AE-11
4. Export Outcome Report - REQ-OD-06

### Must Change to DEPARTMENT_HEAD ONLY:
1. Promotion Flag - REQ-OD-03
2. PIP Initiation - REQ-OD-05

### Must Change to DEPARTMENT_EMPLOYEE, HR_EMPLOYEE ONLY:
1. Dispute/Flag - REQ-AE-07

### Need to Add Guards (Currently No Guard):
1. Set Objectives - REQ-PP-12 (should be DEPARTMENT_HEAD)
2. View Forms - REQ-PP-13 (should be DEPARTMENT_HEAD)
3. Manager Rating - REQ-AE-03 (should be DEPARTMENT_HEAD)
4. Feedback/Comments - REQ-AE-04 (should be DEPARTMENT_HEAD)
5. Employee actions should verify they're accessing their own data

