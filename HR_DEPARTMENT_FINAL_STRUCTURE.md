# HR Department Final Structure - CONFIRMED

## ✅ CONFIRMED HIERARCHY

```
HR Department (code: 'HR')
│
├── HR Manager Position (HR-MGR-001) [HEAD POSITION - TOP LEVEL]
│   ├── Employee: HR Manager
│   ├── System Roles: 
│   │   - HR_MANAGER (functional, manually assigned)
│   │   - DEPARTMENT_HEAD (organizational, auto-assigned because position is headPositionId)
│   ├── Reports to: null (top-level, or CEO if exists)
│   └── Responsibilities: Finalizes approvals, manages processes, configures templates
│
├── HR Admin Position (HR-ADM-001) [UNDER HR MANAGER]
│   ├── Employee: HR Admin
│   ├── System Roles:
│   │   - HR_ADMIN (functional, manually assigned)
│   │   - DEPARTMENT_EMPLOYEE (organizational, auto-assigned because in department)
│   ├── Reports to: HR Manager Position (reportsToPositionId = HR-MGR-001)
│   └── Responsibilities: Edits profiles, assigns roles, configures policies
│
└── HR Employee Position (HR-EMP-001) [UNDER HR MANAGER]
    ├── Employee: HR Employee
    ├── System Roles:
    │   - HR_EMPLOYEE (functional, manually assigned)
    │   - DEPARTMENT_EMPLOYEE (organizational, auto-assigned because in department)
    ├── Reports to: HR Manager Position (reportsToPositionId = HR-MGR-001)
    └── Responsibilities: Tracks candidates, schedules interviews, assigns appraisals
```

## Key Confirmations

1. ✅ **HR Manager is HEAD of HR Department** (top level)
2. ✅ **HR Admin is UNDER HR Manager** (reports to HR Manager)
3. ✅ **HR Employee is UNDER HR Manager** (reports to HR Manager)
4. ✅ **All three are in HR Department** (required)
5. ✅ **HR Manager gets DEPARTMENT_HEAD role automatically** (because position is headPositionId)
6. ✅ **HR Admin and HR Employee get DEPARTMENT_EMPLOYEE role automatically** (because they're in department)

## Role Assignment Summary

| Employee | Functional Role (Manual) | Organizational Role (Auto) | Position | Reports To |
|----------|------------------------|----------------------------|----------|------------|
| HR Manager | HR_MANAGER | DEPARTMENT_HEAD | HR-MGR-001 (HEAD) | null |
| HR Admin | HR_ADMIN | DEPARTMENT_EMPLOYEE | HR-ADM-001 | HR-MGR-001 |
| HR Employee | HR_EMPLOYEE | DEPARTMENT_EMPLOYEE | HR-EMP-001 | HR-MGR-001 |

## Implementation Details

### Position Creation Order
1. Create HR Manager Position first (HR-MGR-001)
2. Create HR Admin Position (HR-ADM-001) with `reportsToPositionId = HR-MGR-001`
3. Create HR Employee Position (HR-EMP-001) with `reportsToPositionId = HR-MGR-001`

### Department Head Assignment
- Set HR Manager Position (HR-MGR-001) as `headPositionId` of HR Department
- This automatically assigns `DEPARTMENT_HEAD` role to HR Manager when `syncEmployeeRoles()` is called

### Employee Assignment
- Assign each employee to their respective position
- Assign each employee to HR Department
- Manually assign functional roles (HR_MANAGER, HR_ADMIN, HR_EMPLOYEE)
- Call `syncEmployeeRoles()` to auto-assign organizational roles

## Why This Structure is Correct

1. **User Stories Support This**:
   - HR Manager finalizes and manages (decision-making role)
   - HR Admin configures and edits (administrative role, reports to manager)
   - HR Employee executes tasks (operational role, reports to manager)

2. **Organizational Logic**:
   - Manager manages the department (head)
   - Admin handles administrative tasks (reports to manager)
   - Employee does operational work (reports to manager)

3. **System Logic**:
   - Head position gets DEPARTMENT_HEAD role automatically
   - Non-head positions in department get DEPARTMENT_EMPLOYEE role automatically
   - Reporting structure is clear via `reportsToPositionId`

## Testing Impact

When testing through frontend UI:
- HR Manager will see HR Admin and HR Employee in their team (because they're department head)
- HR Admin will see they report to HR Manager
- HR Employee will see they report to HR Manager
- Organization chart will show correct hierarchy
- Role-based access will work correctly based on this structure

