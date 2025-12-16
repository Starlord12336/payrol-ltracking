# Role Organization Structure Analysis

## Understanding Role Structure from User Stories

### Role Categories

#### 1. Organization Structure-Based Roles (Auto-Assigned)
These roles are **automatically assigned** based on an employee's position in the organization structure:

- **`DEPARTMENT_HEAD`**: 
  - Auto-assigned when employee's `primaryPositionId` is set as `headPositionId` of a department
  - Represents "Line Manager" in user stories
  - Can view team members, approve leaves, review appraisals for their team
  - **NOT** mutually exclusive with other roles (e.g., HR Manager can also be a department head)

- **`DEPARTMENT_EMPLOYEE`**:
  - Auto-assigned when employee has `primaryDepartmentId` OR `primaryPositionId`
  - Represents regular employees in any department
  - Can view own profile, submit leave requests, view own appraisals
  - **NOT** mutually exclusive with DEPARTMENT_HEAD (a head is still an employee)

#### 2. HR Functional Roles (Manually Assigned, Must Be in HR Department)
These roles are **manually assigned** by HR Admin, but employees with these roles **MUST** be assigned to HR department:

- **`HR_ADMIN`** (Highest HR Authority):
  - **User Stories**: 
    - Searches employee data (US-E6-03)
    - Edits any part of employee profile (US-EP-04)
    - Reviews and approves employee-submitted profile changes (US-E2-03)
    - Assigns roles and access permissions (US-E7-05)
    - Initiates leave configuration (REQ-001, REQ-003, REQ-006, etc.)
  - **Organization Structure**: Must be in HR department
  - **Position**: Should have position like "HR Administrator" in HR department

- **`HR_MANAGER`** (HR Operations Manager):
  - **User Stories**:
    - Defines job description templates (REC-003)
    - Establishes hiring process templates (REC-004)
    - Monitors recruitment progress (REC-009)
    - Manages job offers and approvals (REC-014)
    - Creates onboarding checklists (ONB-001)
    - Initiates termination reviews (OFF-001)
    - Configures appraisal templates (REQ-PP-01)
    - Defines appraisal cycles (REQ-PP-02)
    - Reviews and finalizes leave requests (REQ-025)
    - Overrides manager decisions (REQ-026)
    - Configures shift types (TM-02)
    - Configures overtime rules (TM-10)
  - **Organization Structure**: Must be in HR department
  - **Position**: Should have position like "HR Manager" in HR department (typically head of HR department)

- **`HR_EMPLOYEE`** (HR Operational Staff):
  - **User Stories**:
    - Previews and publishes jobs (REC-023)
    - Tags candidates as referrals (REC-030)
    - Tracks candidates through stages (REC-008)
    - Uses structured assessment forms (REC-020)
    - Schedules interview invitations (REC-010)
    - Coordinates interview panels (REC-021)
    - Provides feedback/interview scores (REC-011)
    - Uses rejection templates (REC-022)
    - Generates and sends offer letters (REC-018)
    - Reserves equipment/assets (ONB-012)
    - Assigns appraisal forms/templates (REQ-PP-05)
    - Monitors appraisal progress (REQ-AE-06)
  - **Organization Structure**: Must be in HR department
  - **Position**: Should have position like "HR Specialist" or "HR Coordinator" in HR department

#### 3. Other Functional Roles
These roles are functional and may or may not be in HR department:

- **`PAYROLL_MANAGER`**, **`PAYROLL_SPECIALIST`**: Payroll operations
- **`RECRUITER`**: May be in HR department or separate recruitment department
- **`SYSTEM_ADMIN`**: System administration (may not be in any specific department)
- **`LEGAL_POLICY_ADMIN`**: Legal and policy administration
- **`FINANCE_STAFF`**: Finance operations (typically in Finance department)

## Current Implementation Analysis

### ✅ What's Working

1. **Auto-Assignment of Organization Structure Roles**:
   - `syncEmployeeRoles()` automatically assigns `DEPARTMENT_HEAD` when position is head of department
   - `syncEmployeeRoles()` automatically assigns `DEPARTMENT_EMPLOYEE` when employee has department/position
   - Roles are synced when employee's position/department changes

2. **Role-Based Access Control**:
   - Guards check for required roles
   - Multiple roles can be required (e.g., HR_MANAGER OR HR_ADMIN)

### ❌ What's Missing

1. **HR Roles Not Enforced to Be in HR Department**:
   - Currently, HR_ADMIN, HR_MANAGER, HR_EMPLOYEE can be assigned to ANY department
   - No validation that HR roles must be in HR department
   - No automatic assignment to HR department when HR role is assigned

2. **Seeder Only Assigns HR_MANAGER**:
   - Seeder only creates HR Manager and assigns to HR department
   - No HR Admin or HR Employee in seeder
   - Need to ensure all HR roles are properly seeded

3. **No Role-Organization Structure Validation**:
   - No check when assigning HR role that employee is in HR department
   - No automatic department assignment when HR role is assigned
   - No warning/error if HR role is assigned but employee is not in HR department

## Required Fixes

### 1. Enforce HR Roles Must Be in HR Department

**When assigning HR roles (HR_ADMIN, HR_MANAGER, HR_EMPLOYEE):**
- Validate that employee's `primaryDepartmentId` is HR department
- If not in HR department, either:
  - Automatically assign to HR department, OR
  - Throw error requiring manual assignment to HR department first

**When assigning employee to HR department:**
- Check if employee has HR role
- If yes, ensure role is properly assigned

### 2. Update Seeder to Create All HR Roles

**Create in seeder:**
- HR Admin (with HR_ADMIN role, in HR department)
- HR Manager (with HR_MANAGER role, in HR department) - ✅ Already done
- HR Employee (with HR_EMPLOYEE role, in HR department)

**For each HR role:**
- Create appropriate position in HR department
- Assign employee to HR department
- Assign employee to position
- Assign system role

### 3. Add Role-Organization Structure Sync

**Enhance `syncEmployeeRoles()` to:**
- Check if employee has HR role (HR_ADMIN, HR_MANAGER, HR_EMPLOYEE)
- If yes, ensure employee is in HR department
- If not, log warning or auto-assign (based on business rules)

**Add validation when assigning roles:**
- When HR Admin assigns HR role, validate department assignment
- When System Admin assigns employee to department, check if HR role needs to be removed

## Role Hierarchy and Reporting Structure

### HR Department Structure

```
HR Department
├── HR Manager (HR_MANAGER role, headPositionId)
│   ├── Reports to: (could be CEO or another executive)
│   └── Manages: HR Admin, HR Employees
├── HR Admin (HR_ADMIN role)
│   ├── Reports to: HR Manager
│   └── Can: Edit profiles, assign roles, configure policies
└── HR Employee (HR_EMPLOYEE role)
    ├── Reports to: HR Manager (or HR Admin, depending on structure)
    └── Can: Track candidates, schedule interviews, assign appraisals
```

### Other Departments Structure

```
Any Department (e.g., Finance, IT, Sales)
├── Department Head (DEPARTMENT_HEAD role, headPositionId)
│   ├── Reports to: (higher level manager or executive)
│   └── Manages: Department Employees
└── Department Employees (DEPARTMENT_EMPLOYEE role)
    ├── Reports to: Department Head
    └── Can: View own profile, submit leaves, view appraisals
```

### Key Points

1. **HR Manager is typically the head of HR department**:
   - HR Manager's position should be set as `headPositionId` of HR department
   - HR Manager can have both `HR_MANAGER` role AND `DEPARTMENT_HEAD` role (for HR department)

2. **HR roles are functional, not organizational**:
   - HR_ADMIN, HR_MANAGER, HR_EMPLOYEE are functional roles (what they can do)
   - DEPARTMENT_HEAD, DEPARTMENT_EMPLOYEE are organizational roles (where they are in structure)
   - An employee can have BOTH functional and organizational roles

3. **Role Assignment Flow**:
   - **Organization Structure Roles**: Auto-assigned based on position/department
   - **HR Functional Roles**: Manually assigned by HR Admin, but must be in HR department
   - **Other Functional Roles**: Manually assigned, may be in any department

## Next Steps

1. ✅ Understand role structure and user stories
2. ⏳ Update seeder to create all HR roles properly
3. ⏳ Add validation to ensure HR roles are in HR department
4. ⏳ Add automatic department assignment when HR role is assigned
5. ⏳ Update role sync to validate HR department assignment
6. ⏳ Test role assignments and organization structure relationships

