# Payroll Configuration & Policy Subsystem - Documentation Index

## 📚 Overview

Welcome to the Payroll Configuration & Policy Subsystem documentation! This subsystem is responsible for establishing and managing all foundational payroll rules, salary structures, tax compliance, and approval workflows for the HR Management System.

**Team**: 3 Members  
**Duration**: 5 Weeks (3 Milestones)  
**Technology**: NestJS + TypeScript + MongoDB

---

## 📖 Documentation Structure

### 🎯 Start Here

1. **[MODULES_SUMMARY.md](./MODULES_SUMMARY.md)** - **READ THIS FIRST!**
   - Quick reference for all 12 modules
   - Team member assignments (3-person distribution)
   - Implementation phases overview
   - Shared components and patterns
   - Quick start guide

2. **[PAYROLL_CONFIG_POLICY_IMPLEMENTATION_GUIDE.md](./PAYROLL_CONFIG_POLICY_IMPLEMENTATION_GUIDE.md)** - **Comprehensive Implementation Guide**
   - Complete module specifications
   - Detailed business rules
   - User stories for each module
   - Database schemas with examples
   - API endpoint designs
   - Integration points with other subsystems
   - Testing strategies

3. **[WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md)** - **Visual Reference**
   - System architecture diagrams
   - Data flow visualizations
   - Approval workflow state machines
   - User interaction flows
   - Integration sequence diagrams
   - Database relationship diagrams

4. **[TASK_TRACKER.md](./TASK_TRACKER.md)** - **Project Management**
   - Detailed task breakdown by week
   - Milestone deliverables
   - Testing checklists
   - Risk management
   - Progress tracking

---

## 🗂️ Module Overview

### Core Configuration Entities (Team Member 1)

1. **Pay Grade Management** - Salary structures by position level
2. **Allowance Management** - Additional salary components
3. **Tax Rules Management** - Tax calculation rules
4. **Approval Workflow Engine** - Cross-cutting approval system

### Compliance & Benefits (Team Member 2)

5. **Insurance Brackets Management** - Social/health insurance
6. **Payroll Policies Management** - Complex policy rules
7. **Signing Bonus Management** - New hire bonuses
8. **Configuration Validation Service** - Cross-module validation

### System & Tracking (Team Member 3)

9. **Pay Type Management** - Payment type definitions
10. **Termination & Resignation Benefits** - Exit benefits
11. **Company-Wide Settings** - Global payroll settings
12. **Audit Trail Service** - Change tracking and logging

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB 5.0+
- NestJS CLI (`npm i -g @nestjs/cli`)
- Git

### Setup Instructions

```bash
# Clone the repository
git clone <repository-url>
cd hr-system-server

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run database migrations (if any)
npm run migration:run

# Seed the database with test data
npm run seed

# Start development server
npm run start:dev
```

### Access Points

- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

---

## 📋 Implementation Roadmap

### Week 1: Foundation (Milestone 1 - Due: 17/11/2025)

- ✅ Set up database schemas (all 9 configuration schemas)
- ✅ Create seed data
- ✅ Establish integration foundation with dummy data
- ✅ All schemas peer-reviewed

### Week 2-3: Business Logic (Milestone 2 - Due: 1/12/2025)

- ✅ Implement all services with CRUD operations
- ✅ Implement approval workflows
- ✅ Create all API controllers
- ✅ Write unit tests (≥80% coverage)
- ✅ Write integration tests (≥70% coverage)
- ✅ Swagger documentation

### Week 4-5: Deployment (Milestone 3 - Due: 15/12/2025)

- ✅ Add pagination, filtering, sorting
- ✅ Optimize database queries
- ✅ Security audit and fixes
- ✅ Deploy to staging
- ✅ Deploy to production
- ✅ Monitoring setup

---

## 🔗 Integration Points

### Depends On (Input Dependencies)

- **Employee Profile**: Employee data, employment status
- **Organization Structure**: Positions, departments, pay grade assignments
- **Recruitment/Onboarding**: Contract details, signing dates (ONB-018, ONB-019)
- **Offboarding**: Termination/resignation dates (OFF-013)
- **Time Management**: Overtime, penalties
- **Leaves**: Leave balances, unpaid days

### Provides To (Output Dependencies)

- **Payroll Execution**: All approved configurations for salary calculations
- **Payroll Tracking**: Policy definitions for payslip display
- **Employee Profile**: Pay grade assignments, benefits eligibility
- **Recruitment**: Signing bonus amounts for offer letters

---

## 📊 Database Schemas

### Configuration Schemas (9 total)

1. `payGrades` - Salary structures by grade
2. `allowances` - Allowance types and amounts
3. `taxRules` - Tax calculation rules
4. `insuranceBrackets` - Insurance contribution brackets
5. `payrollPolicies` - Complex payroll policies
6. `payTypes` - Payment type definitions
7. `signingBonuses` - Position-based signing bonuses
8. `terminationAndResignationBenefits` - Exit benefits
9. `companyWideSettings` - Global settings

### Supporting Schemas

- `auditLogs` - Audit trail for all configuration changes

**Note**: All configuration schemas follow the same pattern with `status` (DRAFT | APPROVED | REJECTED) and audit fields.

---

## 🛡️ Security & Access Control

### Roles

- **Payroll Specialist**: Create, Read, Update (Draft only), Submit
- **Payroll Manager**: Approve/Reject configurations
- **HR Manager**: Manage insurance brackets
- **Legal Admin**: Manage tax rules
- **System Admin**: Manage company-wide settings

### Implementation

- NestJS Guards for RBAC
- JWT authentication (from main system)
- Audit logging for all configuration changes
- Field-level validation

---

## 🧪 Testing Strategy

### Unit Tests (Target: 80% Coverage)

- Service layer methods
- Business rule validations
- State machine transitions
- Mock external dependencies

### Integration Tests (Target: 70% Coverage)

- API endpoints
- Database operations
- Approval workflows
- Role-based access control

### End-to-End Tests

- Complete user workflows
- Integration with other subsystems
- Error scenarios

**Run Tests**:

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📚 API Documentation

### Swagger/OpenAPI

Access interactive API documentation at: `http://localhost:3000/api/docs`

### Standard Endpoint Pattern

```
POST   /api/payroll-config/{resource}              # Create
GET    /api/payroll-config/{resource}              # List all
GET    /api/payroll-config/{resource}/:id          # Get single
PUT    /api/payroll-config/{resource}/:id          # Update
DELETE /api/payroll-config/{resource}/:id          # Delete
POST   /api/payroll-config/{resource}/:id/submit   # Submit for approval
POST   /api/payroll-config/{resource}/:id/approve  # Approve
POST   /api/payroll-config/{resource}/:id/reject   # Reject
```

### Available Resources

- `pay-grades`
- `allowances`
- `tax-rules`
- `insurance-brackets`
- `policies`
- `pay-types`
- `signing-bonuses`
- `termination-benefits`
- `company-settings`
- `audit-logs`

---

## 📝 Business Rules Summary

### Core Rules

- **Minimum Salary**: 6000 EGP (Egyptian minimum wage)
- **Gross ≥ Base**: Gross salary must be greater than or equal to base salary
- **Status Workflow**: DRAFT → PENDING_APPROVAL → APPROVED/REJECTED
- **Edit Restrictions**: Only DRAFT configurations can be edited
- **Approval Required**: All configurations require approval before use

### Compliance Rules

- Tax rates: 0-100%
- Insurance rates: employee + employer ≤ 100%
- Effective dates must be future dates
- All changes must be audit-logged

---

## 🤝 Team Collaboration

### Daily Standups

- Time: [TBD]
- Duration: 15 minutes
- Format: What did you do? What will you do? Any blockers?

### Code Review Process

1. Create feature branch from `main`
2. Implement feature with tests
3. Create Pull Request
4. At least one peer review required
5. All tests must pass
6. Merge to `main`

### Communication Channels

- **Daily Updates**: [Slack/Discord/WhatsApp]
- **Code Reviews**: GitHub Pull Requests
- **Documentation**: Shared docs
- **Issues**: GitHub Issues

---

## 🎯 Success Criteria

### Code Quality

- ✅ Unit test coverage ≥ 80%
- ✅ Integration test coverage ≥ 70%
- ✅ Zero critical security vulnerabilities
- ✅ TypeScript strict mode
- ✅ ESLint zero errors

### Functionality

- ✅ All 12 modules implemented
- ✅ All API endpoints working
- ✅ Approval workflows functional
- ✅ Integration points tested
- ✅ RBAC enforced

### Performance

- ✅ API response < 200ms (simple queries)
- ✅ API response < 500ms (complex queries)
- ✅ Support 100+ concurrent users

### Documentation

- ✅ Swagger 100% complete
- ✅ README with setup
- ✅ Integration guide
- ✅ Deployment guide

---

## 📦 Deliverables

### Milestone 1 (Week 1)

- All database schemas
- Seed data scripts
- Integration foundation
- Schema documentation

### Milestone 2 (Week 2-3)

- All services and controllers
- API endpoints tested
- Unit & integration tests
- Swagger documentation
- Postman collection

### Milestone 3 (Week 4-5)

- Deployed application
- Frontend integration tested
- Load testing completed
- Security audit passed
- Complete documentation

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**

```bash
# Check MongoDB is running
mongosh

# Verify connection string in .env
DATABASE_URL=mongodb://localhost:27017/hr-system
```

**Tests Failing**

```bash
# Clear test database
npm run test:db:reset

# Run tests with verbose output
npm run test -- --verbose
```

**Port Already in Use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run start:dev
```

---

## 📞 Support & Resources

### Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Project Resources

- **Main Project Description**: `sp-project.md`
- **Requirements**: `hr-system-req.md`
- **Schema Examples**: `HR-System-main/src/payroll-configuration/models/`
- **Design Document**: `HR-System-main/openspec/changes/add-payroll-config-policy-setup/design.md`

### Team Contacts

- Team Member 1: [Email/Slack]
- Team Member 2: [Email/Slack]
- Team Member 3: [Email/Slack]

---

## 🔄 Version History

| Version | Date       | Changes                       | Author       |
| ------- | ---------- | ----------------------------- | ------------ |
| 1.0     | 2025-11-26 | Initial documentation created | AI Assistant |

---

## 📄 License

This project is part of the Software Project I, Winter 2025 academic project.

---

## ✅ Getting Started Checklist

- [ ] Read MODULES_SUMMARY.md
- [ ] Review your assigned modules in IMPLEMENTATION_GUIDE.md
- [ ] Study WORKFLOW_DIAGRAMS.md for visual understanding
- [ ] Set up development environment
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Run seed data
- [ ] Verify local setup works
- [ ] Review TASK_TRACKER.md for your tasks
- [ ] Join team communication channels
- [ ] Attend kick-off meeting
- [ ] Start Week 1 tasks!

---

**Good luck with the implementation! 🚀**

For questions or clarifications:

1. Check the relevant documentation file
2. Search GitHub Issues
3. Ask in team communication channel
4. Create a GitHub Issue if needed

**Remember**: Follow the existing schema naming conventions and **DO NOT modify existing schemas** without team discussion!
