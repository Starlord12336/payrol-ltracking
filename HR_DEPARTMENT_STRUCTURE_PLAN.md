# HR Department Structure and Seeding Plan

## Understanding the Hierarchy

Based on the user stories, here's how I understand the roles:

### HR_MANAGER (Managerial Role)
- **Responsibilities**: Finalizes approvals, manages processes, configures templates, makes decisions
- **User Stories**: 
  - Reviews and finalizes leave requests (REQ-025)
  - Overrides manager decisions (REQ-026)
  - Configures appraisal templates (REQ-PP-01)
  - Defines appraisal cycles (REQ-PP-02)
  - Configures shift types (TM-02)
- **Role Type**: Managerial/Decision-making

### HR_ADMIN (Administrative Role)
- **Responsibilities**: Edits data, assigns roles, configures policies, handles administrative tasks
- **User Stories**:
  - Edits any part of employee profile (US-EP-04)
  - Assigns roles and access permissions (US-E7-05)
  - Initiates leave configuration (REQ-001)
  - Configures leave types, accrual rates, etc. (REQ-003, REQ-006, etc.)
- **Role Type**: Administrative/Configuration

### HR_EMPLOYEE (Operational Role)
- **Responsibilities**: Performs day-to-day operational tasks
- **User Stories**:
  - Tracks candidates (REC-008)
  - Schedules interviews (REC-010)
  - Assigns appraisal forms (REQ-PP-05)
  - Monitors appraisal progress (REQ-AE-06)
- **Role Type**: Operational/Execution

## Proposed HR Department Structure

```
HR Department (code: 'HR')
│
├── HR Manager Position (HR-MGR-001) [HEAD POSITION]
│   ├── Employee: HR Manager
│   ├── System Roles: HR_MANAGER + DEPARTMENT_HEAD (auto-assigned)
│   └── Reports to: (Could be CEO/Executive, or no one if top-level)
│
├── HR Admin Position (HR-ADM-001)
│   ├── Employee: HR Admin
│   ├── System Roles: HR_ADMIN + DEPARTMENT_EMPLOYEE (auto-assigned)
│   └── Reports to: HR Manager Position (reportsToPositionId)
│
└── HR Employee Position (HR-EMP-001)
    ├── Employee: HR Employee
    ├── System Roles: HR_EMPLOYEE + DEPARTMENT_EMPLOYEE (auto-assigned)
    └── Reports to: HR Manager Position (reportsToPositionId)
```

## Key Points

1. **HR Manager is the HEAD of HR Department**:
   - HR Manager's position is set as `headPositionId` of HR department
   - This automatically gives HR Manager the `DEPARTMENT_HEAD` role
   - HR Manager has BOTH `HR_MANAGER` role (functional) AND `DEPARTMENT_HEAD` role (organizational)

2. **HR Admin and HR Employee are NOT heads**:
   - They are regular employees in HR department
   - They have their functional roles (HR_ADMIN, HR_EMPLOYEE)
   - They automatically get `DEPARTMENT_EMPLOYEE` role because they're in a department
   - They report to HR Manager (via `reportsToPositionId`)

3. **Role Assignment Logic**:
   - **Functional Roles** (HR_MANAGER, HR_ADMIN, HR_EMPLOYEE): Manually assigned
   - **Organizational Roles** (DEPARTMENT_HEAD, DEPARTMENT_EMPLOYEE): Auto-assigned based on position/department
   - An employee can have MULTIPLE roles (e.g., HR_MANAGER + DEPARTMENT_HEAD)

## Seeding Plan

### Step 1: Ensure HR Department Exists
- Check if HR department exists (code: 'HR')
- Create if doesn't exist
- Ensure it's active

### Step 2: Create Positions in HR Department

**Position 1: HR Manager**
- Code: `HR-MGR-001`
- Title: `HR Manager`
- Department: HR Department
- `reportsToPositionId`: null (top-level, or could report to CEO if exists)

**Position 2: HR Admin**
- Code: `HR-ADM-001`
- Title: `HR Administrator`
- Department: HR Department
- `reportsToPositionId`: HR Manager Position

**Position 3: HR Employee**
- Code: `HR-EMP-001`
- Title: `HR Specialist` or `HR Coordinator`
- Department: HR Department
- `reportsToPositionId`: HR Manager Position

### Step 3: Set HR Manager as Head of HR Department
- Set HR Manager Position as `headPositionId` of HR Department
- This triggers automatic assignment of `DEPARTMENT_HEAD` role to HR Manager

### Step 4: Create Employee Profiles

**Employee 1: HR Manager**
- Create employee profile
- Assign to HR Department (`primaryDepartmentId`)
- Assign to HR Manager Position (`primaryPositionId`)
- Manually assign `HR_MANAGER` role
- `DEPARTMENT_HEAD` role will be auto-assigned (because position is headPositionId)

**Employee 2: HR Admin**
- Create employee profile
- Assign to HR Department (`primaryDepartmentId`)
- Assign to HR Admin Position (`primaryPositionId`)
- Manually assign `HR_ADMIN` role
- `DEPARTMENT_EMPLOYEE` role will be auto-assigned (because in department)

**Employee 3: HR Employee**
- Create employee profile
- Assign to HR Department (`primaryDepartmentId`)
- Assign to HR Employee Position (`primaryPositionId`)
- Manually assign `HR_EMPLOYEE` role
- `DEPARTMENT_EMPLOYEE` role will be auto-assigned (because in department)

### Step 5: Sync Roles
- Call `syncEmployeeRoles()` for each employee to ensure roles are properly assigned
- This ensures organizational roles (DEPARTMENT_HEAD, DEPARTMENT_EMPLOYEE) are correctly assigned

## Why This Structure?

1. **Clear Hierarchy**: HR Manager manages the department, others report to them
2. **Role Separation**: Functional roles (what they can do) vs Organizational roles (where they are)
3. **Automatic Role Assignment**: Organizational roles are auto-assigned based on structure
4. **Flexibility**: Can add more HR employees later with same structure
5. **Compliance**: All HR roles are in HR department as required

## Questions to Clarify

1. **Should HR Admin report to HR Manager, or be at same level?**
   - My proposal: HR Admin reports to HR Manager (typical org structure)
   - Alternative: HR Admin could be at same level (if they're senior admin)

2. **Should HR Employee report to HR Manager or HR Admin?**
   - My proposal: HR Employee reports to HR Manager (flat structure)
   - Alternative: HR Employee could report to HR Admin (hierarchical)

3. **Do we need multiple HR Employees in seeder?**
   - Currently planning: 1 HR Employee
   - Could add more if needed for testing

## Implementation Details

The seeder will:
1. Create/ensure HR department
2. Create 3 positions in HR department
3. Set HR Manager position as head
4. Create 3 employees
5. Assign employees to positions and departments
6. Assign functional roles manually
7. Sync roles to ensure organizational roles are assigned
8. Result: Proper HR department structure with all roles correctly assigned

