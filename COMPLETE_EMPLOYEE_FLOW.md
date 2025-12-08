# Complete Employee Flow - From Requirements
## Comprehensive Employee Lifecycle Journey

---

## 📊 **OVERVIEW: The Complete Employee Journey**

```
CANDIDATE → ONBOARDING → ACTIVE EMPLOYEE → OFFBOARDING
   ↓            ↓              ↓                ↓
 APPLIED    PROBATION      ACTIVE          INACTIVE
```

---

## 🎯 **PHASE 1: CANDIDATE (Application & Hiring Process)**

### **1.1 Candidate Registration**
- **Action**: Candidate self-registers via `/auth/register`
- **Default Status**: `APPLIED`
- **What Happens**:
  - Candidate provides: email, password, personal info (name, national ID, etc.)
  - System creates candidate profile with `candidateNumber`
  - Status automatically set to `APPLIED`
  - Candidate can login immediately

### **1.2 Job Application Process**

#### **Step 1: Job Posting**
- HR Manager defines job requisitions (REC-003)
- Job details include: title, department, location, openings, qualifications
- HR Employee publishes jobs on company careers page (REC-023)
- Jobs automatically posted to internal/external career sites

#### **Step 2: Candidate Applies**
- Candidate uploads CV and applies for positions (REC-007)
- Application stored in talent pool
- Candidate receives application confirmation

#### **Step 3: Application Tracking**
- HR Employee tracks candidates through hiring stages (REC-008)
- Stages: `APPLIED` → `SCREENING` → `SHORTLISTING` → `INTERVIEW` → `OFFER_SENT` → `OFFER_ACCEPTED` → `HIRED`
- System sends automated status updates to candidates (REC-017)
- Candidates can view real-time status dashboard

#### **Step 4: Interview Process**
- HR Employee schedules interviews (REC-010)
- System sends calendar invites to interviewers and candidates
- Interview panels coordinated (REC-021)
- Structured assessment and scoring forms used (REC-020)
- Feedback and ratings collected at each stage (REC-011)

#### **Step 5: Offer Management**
- HR Manager manages job offers and approvals (REC-014)
- HR Employee generates and sends e-signed offer letters (REC-018)
- Offer includes: compensation, benefits, start date
- Candidate can accept or reject offer
- Communication logs stored

#### **Step 6: Offer Acceptance**
- When candidate accepts offer and signs contract:
  - **Trigger**: Onboarding module automatically initiated (REC-029)
  - System transitions candidate to onboarding phase
  - Contract data used to populate employee profile

### **1.3 Candidate Status Flow**
```
APPLIED → SCREENING → INTERVIEW → OFFER_SENT → OFFER_ACCEPTED → HIRED
                                                                    ↓
                                                              ONBOARDING
```

**Login Rules**:
- ✅ Can login: `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER_SENT`, `OFFER_ACCEPTED`, `HIRED`
- ❌ Cannot login: `REJECTED`, `WITHDRAWN`

---

## 🚀 **PHASE 2: ONBOARDING (New Hire Setup)**

### **2.1 Onboarding Initiation**
- **Trigger**: Offer acceptance and contract signing
- **Who**: HR Employee uploads signed contract
- **Action**: System creates Employee Profile (ONB-002)

### **2.2 Employee Profile Creation (ONB-002)**
- **Key Requirement**:
  > "Employee Profile (EP) Activated with unique ID. **Employee status set to 'Probation'**."
  
- **What Happens**:
  - Employee profile created with unique `employeeNumber`
  - **Status set to `PROBATION`** (NOT ACTIVE)
  - Profile populated from contract: Name, ID, DOB, Date of Hire, Contract Type
  - Initial system access provisioned

### **2.3 Onboarding Checklist Creation (ONB-001)**
- HR Manager creates onboarding task checklist
- Tasks assigned to new hire and responsible departments
- Checklist customizable per role/department

### **2.4 New Hire Tasks**

#### **Document Upload (ONB-007)**
- New Hire views onboarding tracker (ONB-004)
- Receives reminders for pending tasks (ONB-005)
- Uploads required documents:
  - IDs
  - Contracts
  - Certifications
  - Compliance forms
- Documents stored in Employee Profile
- System sends notifications for pending tasks

#### **System Access Provisioning (ONB-009, ONB-013)**
- **IT Access** (Automated):
  - Email account created
  - System access granted (payroll, internal systems)
  - Laptop/equipment allocation
  - SSO/authentication setup
  
- **Physical Resources** (ONB-012):
  - Workspace/desk assignment
  - ID badge creation
  - Access cards issued
  
- **Scheduled Revocation**: System schedules automatic access revocation upon future exit

### **2.5 Payroll Initiation (ONB-018, ONB-019)**
- System automatically handles payroll initiation based on contract start date
- Signing bonuses automatically processed (if applicable)
- Payroll module receives contract details
- Tasks generated for Payroll Specialist

### **2.6 Onboarding Completion**
- All tasks completed
- Documents verified by HR
- System access active
- Employee ready to start work

**Note**: Employee status remains `PROBATION` during onboarding period.

---

## 👤 **PHASE 3: ACTIVE EMPLOYEE (Employment Period)**

### **3.1 Status Transition: Probation → Active**
- **Initial Status**: `PROBATION` (set during onboarding)
- **After Probation Review**: Status changes to `ACTIVE`
- **Login Rules**:
  - ✅ `ACTIVE` status → Can login
  - ❌ `PROBATION` status → **Cannot login** (current implementation)
  - ❌ Other statuses (INACTIVE, SUSPENDED, etc.) → Cannot login

### **3.2 Employee Self-Service Features**

#### **A. Profile Management**

**View Profile (US-E2-04)**
- View full employee profile
- See: PII, employment details, position, department, pay grade
- View appraisal history

**Update Contact Info (US-E2-05)**
- Update phone number
- Update address
- Update email (personal)
- Changes saved immediately

**Profile Picture & Bio (US-E2-12)**
- Upload profile picture
- Add short biography
- Changes saved immediately

**Request Profile Corrections (US-E6-02, US-E2-06)**
- Request changes to critical data:
  - Name
  - National ID
  - Position
  - Department
  - Marital Status
- Request goes through approval workflow
- HR reviews and approves/rejects

#### **B. Leave Management**

**Submit Leave Request (REQ-015)**
- Submit leave with details:
  - Leave type (Annual, Sick, Mission, etc.)
  - Dates
  - Justification
  - Attachments (e.g., doctor's note)
- System validates against entitlement
- If total leave > entitlement → converts to unpaid or blocks

**Attach Supporting Documents (REQ-016)**
- Upload required documents:
  - Medical certificate (for sick leave > 1 day)
  - Maternity leave documents
  - Bereavement proof
  - Other required documentation

**Modify/Cancel Pending Requests (REQ-017, REQ-018)**
- Modify pending leave requests
- Cancel before final approval
- System recalculates balance if approved leaves canceled

**View Leave Balance (REQ-031)**
- View current balance:
  - Accrued vacation days
  - Vacation days taken
  - Vacation balance available
  - Pending requests
  - Carry-over days

**View Leave History (REQ-032, REQ-033)**
- View past leave requests
- Filter by: type, date range, status
- Sort by various parameters

**Receive Notifications (REQ-019)**
- Notified when request is:
  - Approved
  - Rejected
  - Returned for correction
  - Modified

**Post-Leave Request (REQ-031)**
- Submit leave request after taking leave (within grace period)
- For emergency situations

#### **C. Payroll Self-Service**

**View Payslips (REQ-PY-1, REQ-PY-2)**
- View and download payslips online
- See payslip status (paid, disputed)
- Access salary history

**View Salary Details (REQ-PY-3)**
- View base salary according to contract
- See compensation for unused/encashed leave days
- View transportation/commuting compensation

**View Deductions (REQ-PY-8, REQ-PY-9, REQ-PY-10, REQ-PY-11)**
- Detailed tax deductions with law/rule applied
- Insurance deductions itemized
- Salary deductions due to misconduct/unapproved absenteeism
- Deductions for unpaid leave days

**View Contributions (REQ-PY-14)**
- View employer contributions (insurance, pension, allowances)
- See full benefits package

**Dispute & Claims (REQ-PY-16, REQ-PY-17, REQ-PY-18)**
- Dispute payroll errors (over-deductions, missing bonuses)
- Submit expense reimbursement claims
- Track approval and payment status of claims/disputes

**Tax Documents (REQ-PY-15)**
- Download tax documents (annual tax statement)
- Use for official purposes

#### **D. Time Management**

**Clock In/Out (BR-TM-06)**
- Clock in/out using ID
- System validates against assigned shifts
- Attendance records created and timestamped

**View Attendance Records**
- View attendance history
- See clock-in/out times
- View shift assignments

**Submit Correction Requests (BR-TM-15)**
- Submit correction requests for missing/incorrect punches
- Provide reason and time
- Track approval status
- Routed to Line Manager for approval

**View Shift Schedule**
- View assigned shifts
- See shift types (Normal, Split, Overnight, Rotational)
- View shift statuses (Approved, Cancelled, Expired)

#### **E. Performance Management**

**View Assigned Appraisal Forms (REQ-AE-01)**
- View assigned appraisal forms
- See related objectives
- Access templates

**Submit Self-Assessment (REQ-AE-02)**
- Submit self-assessment
- Attach supporting documents
- Provide evidence of achievements

**View Final Ratings (REQ-OD-01)**
- View final ratings and feedback
- See development notes
- Understand performance and next steps

**Access Appraisal History (REQ-OD-08)**
- View past appraisal history
- See multi-cycle trend views
- Track performance over time

**Flag Concerns (REQ-AE-07)**
- Flag or raise concerns about ratings
- File formal appeal within 7-day window
- Dispute recorded in system

**View Dispute Resolution (REQ-OD-07)**
- View dispute resolution outcome
- See if objection was approved or denied
- View final rating (original or adjusted)

### **3.3 Manager Features (For Managers)**

**View Team Profiles (US-E4-01, US-E4-02)**
- View team members' profiles (excluding sensitive info)
- See summary of team's job titles and departments
- Filtered by direct reporting line hierarchy

**Approve/Reject Leave Requests (REQ-021, REQ-022)**
- Review leave requests
- Approve or reject based on operational needs
- Delegate approvals if needed

**Filter Team Leave Data (REQ-035)**
- Filter and sort leave data by:
  - Leave type
  - Date range
  - Department
  - Status

**Flag Irregular Patterns (REQ-039)**
- Flag irregular leaving patterns
- Monitor for corrective actions

**Performance Reviews**
- Review employee self-assessments
- Provide manager feedback
- Complete appraisal forms
- Schedule 1-on-1 meetings

### **3.4 HR Admin Features**

**Master Data Management (US-EP-04)**
- Edit any part of employee profile
- Modify: PII, Pay Grade, Status, Hire Date
- Configure system rules

**Review Change Requests (US-E2-03)**
- Review employee-submitted profile changes
- Approve or reject requests
- Apply changes to master record

**Assign Roles & Permissions (US-E7-05)**
- Assign roles and access permissions
- Configure role-based access control

**Deactivate Profile (US-EP-05)**
- Deactivate employee profile upon termination/resignation
- Set status to INACTIVE

**Search Employees (US-E6-03)**
- Search for employee data
- Filter by various criteria

### **3.5 Status Management During Employment**

**Employee Statuses**:
- `ACTIVE` - Can login, full system access
- `PROBATION` - Cannot login (current implementation)
- `ON_LEAVE` - Cannot login
- `SUSPENDED` - Cannot login
- `RETIRED` - Cannot login
- `INACTIVE` - Cannot login
- `TERMINATED` - Cannot login

**Status Changes**:
- Status changes trigger automatic updates:
  - Payroll (block payment if suspended/terminated)
  - Time Management (sync status updates)
  - Leaves (affect leave eligibility)
  - System Access (revoke if inactive)

---

## 🚪 **PHASE 4: OFFBOARDING (Exit Process)**

### **4.1 Separation Initiation**

#### **Resignation Process (OFF-018, OFF-019)**
- **Employee Action**: Submit resignation request with reasoning
- **Workflow**: Employee → Line Manager → Finance → HR
- **What Happens**:
  - Last working day recorded
  - Resignation reason stored
  - Offboarding approval workflow initiated
  - Employee can track resignation request status

#### **Termination Process (OFF-001)**
- **HR Action**: HR initiates termination review
- **What Happens**:
  - Termination justification recorded
  - Review process initiated
  - Approval workflow triggered

### **4.2 Clearance Process (OFF-006, OFF-010)**

**Multi-Department Sign-offs**:
- **IT**: System access revocation
- **Finance**: Final settlement approval
- **Facilities**: Asset recovery
- **Line Manager**: Final approval
- **HR**: Final clearance

**Clearance Checklist**:
- All departments must complete sign-offs
- Status tracked for each department
- Final approval/signature form filed to HR
- Clearance completion required before final payroll release

### **4.3 Access Revocation (OFF-007)**
- **System Admin Action**: Revoke system and account access
- **What Happens**:
  - Employee login disabled
  - System access revoked
  - Email access revoked
  - Profile status updated to `INACTIVE` (Fired/Terminated/Resigned)
  - Scheduled access revocation executed

### **4.4 Asset Recovery**
- Physical assets collected:
  - Laptop/equipment
  - ID badge
  - Access cards
  - Company property
- Asset recovery tracked in system

### **4.5 Final Settlement (OFF-013)**

**Leave Balance Settlement**:
- Unused leave balance reviewed
- Options:
  - Encashment (convert to pay)
  - Carry forward (if allowed)
  - Forfeit (if policy requires)

**Benefits Termination**:
- Benefits plans auto-terminated
- Final benefits calculated

**Final Pay Calculation**:
- Payroll module triggered (OFF-023, OFF-024)
- Final settlement processed:
  - Final salary payment
  - Unused leave encashment
  - Severance pay (if applicable)
  - Termination benefits (if applicable)
  - Deductions applied

**Final Payslip**:
- Final payslip generated
- All settlements itemized
- Employee receives final payslip

### **4.6 Offboarding Completion**
- All clearances completed
- Assets recovered
- Access revoked
- Final settlement processed
- Employee profile status: `INACTIVE`
- Position marked as "Vacant" in organizational structure

---

## 📊 **COMPLETE STATUS FLOW DIAGRAM**

```
CANDIDATE PHASE:
┌─────────────────────────────────────────────────────────┐
│ Register → APPLIED → Apply for Jobs                     │
│   ↓                                                      │
│ SCREENING → INTERVIEW → OFFER_SENT                      │
│   ↓                                                      │
│ OFFER_ACCEPTED → HIRED                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
ONBOARDING PHASE:
┌─────────────────────────────────────────────────────────┐
│ Contract Signed → ONB-002 → Employee Profile Created    │
│   ↓                                                      │
│ Status: PROBATION                                        │
│   ↓                                                      │
│ Complete Onboarding Tasks → System Access Provisioned    │
└─────────────────────────────────────────────────────────┘
                          ↓
ACTIVE EMPLOYEE PHASE:
┌─────────────────────────────────────────────────────────┐
│ PROBATION → (After Review) → ACTIVE                     │
│   ↓                                                      │
│ Use System Features:                                     │
│   • Profile Management                                   │
│   • Leave Requests                                       │
│   • Payroll Viewing                                      │
│   • Time Tracking                                        │
│   • Performance Reviews                                   │
│                                                          │
│ Status Changes:                                          │
│   ACTIVE → ON_LEAVE → ACTIVE                            │
│   ACTIVE → SUSPENDED → ACTIVE                           │
└─────────────────────────────────────────────────────────┘
                          ↓
OFFBOARDING PHASE:
┌─────────────────────────────────────────────────────────┐
│ Resignation/Termination Request                         │
│   ↓                                                      │
│ Clearance Process (Multi-Dept Sign-offs)                │
│   ↓                                                      │
│ Access Revoked → Status: INACTIVE                       │
│   ↓                                                      │
│ Final Settlement (Leave, Benefits, Pay)                │
│   ↓                                                      │
│ Offboarding Complete                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 **KEY TRANSITIONS & TRIGGERS**

### **Candidate → Employee**
- **Trigger**: Offer acceptance and contract signing
- **Action**: ONB-002 creates Employee Profile
- **Status**: `PROBATION`
- **System**: Onboarding module triggered

### **Probation → Active**
- **Trigger**: Probation review completion
- **Action**: HR updates status to `ACTIVE`
- **Result**: Employee can now login

### **Active → On Leave**
- **Trigger**: Leave request approved
- **Action**: Status updated to `ON_LEAVE`
- **Result**: Cannot login, payroll adjusted

### **Active → Suspended**
- **Trigger**: HR admin action
- **Action**: Status updated to `SUSPENDED`
- **Result**: Cannot login, payroll blocked

### **Active → Inactive (Exit)**
- **Trigger**: Resignation/Termination
- **Action**: Clearance process → Access revoked
- **Result**: Status `INACTIVE`, cannot login, final settlement

---

## 📋 **REQUIREMENTS SUMMARY BY PHASE**

### **Phase 1: Candidate**
- REC-003: Job posting
- REC-007: Candidate application
- REC-008: Application tracking
- REC-010: Interview scheduling
- REC-017: Status updates
- REC-018: Offer management
- REC-029: Onboarding trigger

### **Phase 2: Onboarding**
- ONB-001: Checklist creation
- ONB-002: Profile creation (Status: PROBATION)
- ONB-004: Onboarding tracker
- ONB-005: Reminders
- ONB-007: Document upload
- ONB-009: System access provisioning
- ONB-012: Physical resources
- ONB-013: Automated provisioning
- ONB-018: Payroll initiation
- ONB-019: Signing bonus

### **Phase 3: Active Employee**
- **Profile**: US-E2-04, US-E2-05, US-E2-12, US-E6-02
- **Leaves**: REQ-015 through REQ-042
- **Payroll**: REQ-PY-1 through REQ-PY-18
- **Time**: BR-TM-01 through BR-TM-22
- **Performance**: REQ-PP-02, REQ-AE-01, REQ-OD-01

### **Phase 4: Offboarding**
- OFF-001: Termination initiation
- OFF-006: Offboarding checklist
- OFF-007: Access revocation
- OFF-010: Clearance sign-offs
- OFF-013: Final settlement
- OFF-018: Resignation request
- OFF-019: Resignation tracking

---

## ⚠️ **IMPORTANT NOTES**

1. **Status During Onboarding**: Employee status is `PROBATION`, not `ACTIVE`
2. **Login Restrictions**: Only `ACTIVE` employees can login (current implementation)
3. **Status Changes**: All status changes trigger automatic updates to:
   - Payroll (payment blocking)
   - Time Management (attendance tracking)
   - Leaves (eligibility)
   - System Access (login ability)
4. **Profile Creation**: Employee profiles are created through ONB-002 (onboarding), not public registration
5. **Public Registration**: Users register as candidates, not employees

---

## 📚 **REFERENCES**

- **Sheet: Recuritment**: Onboarding workflow, status transitions
- **Sheet: Recuirtment**: Complete recruitment and onboarding process
- **Sheet: Employee Profile**: Profile management and status control
- **Sheet: Leaves**: Leave management during employment
- **Sheet: Payroll**: Payroll processing and self-service
- **Sheet: Performance**: Performance management and appraisals
- **Sheet: Time Management**: Attendance and time tracking
- **Sheet: Organization Structure**: Position and department management

