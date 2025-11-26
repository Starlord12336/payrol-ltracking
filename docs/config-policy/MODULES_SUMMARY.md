# Payroll Configuration & Policy - Modules Quick Reference

## Team Distribution (3 Members)

### 👤 Team Member 1: Core Configuration Entities

**Focus**: Primary configuration schemas and services

#### Modules Assigned:

1. **Pay Grade Management** - Salary structures by position
2. **Allowance Management** - Allowances (housing, transport, etc.)
3. **Tax Rules Management** - Tax calculation rules
4. **Approval Workflow Engine** - Cross-cutting approval system

**Estimated Effort**: ~35-40 hours

---

### 👤 Team Member 2: Compliance & Benefits

**Focus**: Legal compliance and employee benefits

#### Modules Assigned:

1. **Insurance Brackets Management** - Social/health insurance
2. **Payroll Policies Management** - Complex policy rules
3. **Signing Bonus Management** - New hire bonuses
4. **Configuration Validation Service** - Cross-module validation

**Estimated Effort**: ~35-40 hours

---

### 👤 Team Member 3: System & Tracking

**Focus**: System configuration and audit

#### Modules Assigned:

1. **Pay Type Management** - Payment type definitions
2. **Termination & Resignation Benefits** - Exit benefits
3. **Company-Wide Settings** - Global settings
4. **Audit Trail Service** - Change tracking and logging

**Estimated Effort**: ~30-35 hours

---

## Module Overview Table

| #   | Module Name              | Priority | Status Field | Approval Role   | Integration Points               |
| --- | ------------------------ | -------- | ------------ | --------------- | -------------------------------- |
| 1   | Pay Grade Management     | HIGH     | ✓            | Payroll Manager | Org Structure, Payroll Execution |
| 2   | Allowance Management     | HIGH     | ✓            | Payroll Manager | Payroll Execution                |
| 3   | Tax Rules Management     | HIGH     | ✓            | Payroll Manager | Payroll Execution                |
| 4   | Insurance Brackets       | HIGH     | ✓            | HR Manager      | Payroll Execution                |
| 5   | Payroll Policies         | HIGH     | ✓            | Payroll Manager | Payroll Execution, Time Mgmt     |
| 6   | Pay Type Management      | MEDIUM   | ✓            | Payroll Manager | Payroll Execution                |
| 7   | Signing Bonus            | MEDIUM   | ✓            | Payroll Manager | Onboarding, Payroll Execution    |
| 8   | Termination Benefits     | MEDIUM   | ✓            | Payroll Manager | Offboarding, Payroll Execution   |
| 9   | Company Settings         | LOW      | ✗            | System Admin    | Payroll Execution                |
| 10  | Approval Workflow Engine | HIGH     | N/A          | Cross-cutting   | All Config Modules               |
| 11  | Validation Service       | HIGH     | N/A          | Cross-cutting   | All Config Modules               |
| 12  | Audit Trail Service      | MEDIUM   | N/A          | Cross-cutting   | All Config Modules               |

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**All Members**

- [ ] Set up database schemas
- [ ] Create seed data
- [ ] Establish integration foundation with dummy data
- [ ] Create DTOs and interfaces

### Phase 2: Core Logic (Week 2-3)

**Team Member 1**

- [ ] Implement Pay Grade, Allowance, Tax Rules services
- [ ] Implement Approval Workflow Engine
- [ ] Create controllers for assigned modules
- [ ] Write unit tests

**Team Member 2**

- [ ] Implement Insurance, Policies, Signing Bonus services
- [ ] Implement Validation Service
- [ ] Create controllers for assigned modules
- [ ] Write unit tests

**Team Member 3**

- [ ] Implement Pay Type, Termination Benefits, Company Settings
- [ ] Implement Audit Trail Service
- [ ] Create controllers for assigned modules
- [ ] Write unit tests

### Phase 3: Integration & Testing (Week 2-3 continued)

**All Members**

- [ ] Integration testing
- [ ] API documentation (Swagger)
- [ ] Cross-module testing
- [ ] Performance optimization

### Phase 4: Deployment (Week 4-5)

**All Members**

- [ ] Frontend support
- [ ] Deployment preparation
- [ ] Production deployment
- [ ] Monitoring setup

---

## Key Shared Components

### Enums (All members use these)

```typescript
// ConfigStatus
export enum ConfigStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// PolicyType
export enum PolicyType {
  DEDUCTION = 'Deduction',
  ALLOWANCE = 'Allowance',
  BENEFIT = 'Benefit',
  MISCONDUCT = 'Misconduct',
  LEAVE = 'Leave',
}

// Applicability
export enum Applicability {
  AllEmployees = 'All Employees',
  FULL_TIME = 'Full Time Employees',
  PART_TIME = 'Part Time Employees',
  CONTRACTORS = 'Contractors',
}
```

### Common Schema Fields

```typescript
{
  status: ConfigStatus,
  createdBy: ObjectId,       // ref: EmployeeProfile
  approvedBy: ObjectId,      // ref: EmployeeProfile
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoint Pattern (Standard for all modules)

### Standard CRUD Endpoints

```
POST   /api/payroll-config/{resource}              # Create
GET    /api/payroll-config/{resource}              # List all
GET    /api/payroll-config/{resource}/:id          # Get single
PUT    /api/payroll-config/{resource}/:id          # Update (Draft only)
DELETE /api/payroll-config/{resource}/:id          # Delete (Draft only)
```

### Approval Endpoints

```
POST   /api/payroll-config/{resource}/:id/submit   # Submit for approval
POST   /api/payroll-config/{resource}/:id/approve  # Approve
POST   /api/payroll-config/{resource}/:id/reject   # Reject with reason
```

### Special Endpoints (as needed)

```
GET    /api/payroll-config/{resource}/active       # Get all active items
GET    /api/payroll-config/{resource}/pending      # Get pending approvals
```

---

## Testing Checklist (Per Module)

### Unit Tests

- [ ] Service CRUD operations
- [ ] Validation logic
- [ ] Business rules enforcement
- [ ] Edge cases

### Integration Tests

- [ ] API endpoints
- [ ] Database operations
- [ ] Approval workflow
- [ ] Role-based access control

### End-to-End Tests

- [ ] Complete user workflows
- [ ] Integration with other subsystems
- [ ] Error handling

---

## Integration Dependencies

### Inputs (What we need from other subsystems)

- **Employee Profile**: Employee ID, Employment Status, Contract Type
- **Organization Structure**: Position, Department, Pay Grade Assignment
- **Recruitment/Onboarding**: Contract Details, Signing Date
- **Offboarding**: Termination Date, Resignation Date
- **Time Management**: Overtime Hours, Penalties
- **Leaves**: Leave Balances, Unpaid Days

### Outputs (What we provide to other subsystems)

- **Payroll Execution**: All approved configurations
- **Payroll Tracking**: Policy definitions for display
- **Employee Profile**: Pay grade assignments
- **Recruitment**: Signing bonus amounts

---

## Critical Business Rules Summary

### Salary Rules

- Minimum salary: 6000 EGP (Egyptian minimum wage)
- Gross salary ≥ Base salary
- Pay grades unique per organization

### Approval Rules

- All configs start in DRAFT
- Only DRAFT items can be edited
- Specific roles approve specific configs
- Rejection requires reason and returns to DRAFT

### Compliance Rules

- Tax rates: 0-100%
- Insurance rates: employee + employer ≤ 100%
- Effective dates must be future dates
- All changes must be audit-logged

### Integration Rules

- Only APPROVED configs used in payroll execution
- Signing bonuses auto-trigger on onboarding (ONB-019)
- Termination benefits auto-trigger on offboarding (OFF-013)
- Configuration changes don't affect past payroll runs

---

## Communication & Coordination

### Daily Standups

- What did you complete yesterday?
- What will you work on today?
- Any blockers or dependencies?

### Code Review

- All code must be reviewed by at least one other team member
- Focus on: correctness, consistency, test coverage

### Integration Points

- Team Member 1 & 2: Approval Workflow integration
- Team Member 2 & 3: Validation Service integration
- All Members: Audit Trail integration

---

## Technology Stack

- **Backend**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: class-validator, class-transformer
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI
- **Authentication**: JWT (from main system)

---

## Resources

- **Main Guide**: PAYROLL_CONFIG_POLICY_IMPLEMENTATION_GUIDE.md
- **Project Description**: sp-project.md
- **Requirements**: hr-system-req.md
- **Schema Reference**: HR-System-main/src/payroll-configuration/models/
- **Design Document**: HR-System-main/openspec/changes/add-payroll-config-policy-setup/design.md

---

## Success Metrics

### Code Quality

- Unit test coverage: ≥ 80%
- Integration test coverage: ≥ 70%
- No critical security vulnerabilities
- All TypeScript strict mode compliance

### Functionality

- All 12 modules implemented
- All API endpoints working
- Approval workflows functional
- Integration points tested

### Documentation

- Swagger API docs complete
- README with setup instructions
- Integration guide for other teams

---

## Quick Start for Each Team Member

### Setup (All Members)

```bash
# Clone repository
git clone <repo-url>
cd hr-system-server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your MongoDB connection

# Run in development
npm run start:dev
```

### Your First Task

1. Review your assigned modules in the main guide
2. Set up your module directory structure
3. Implement the database schema
4. Create basic CRUD service
5. Add validation
6. Implement controller
7. Write tests
8. Document API

---

**Quick Questions?**

- Unclear requirements? → Check sp-project.md
- Schema questions? → Check HR-System-main/src/payroll-configuration/models/
- Integration questions? → Coordinate with team members
- Technical questions? → Check design.md

**Remember**:

- Follow the existing schema naming conventions
- **Do NOT modify existing schemas** without asking
- Keep code DRY (Don't Repeat Yourself)
- Document as you go
- Test everything!

Good luck! 🚀
