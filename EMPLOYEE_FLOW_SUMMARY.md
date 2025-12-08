# Employee Flow - From Employee's Perspective
## Based on HR System Requirements Analysis

---

## 📋 **OVERVIEW: Complete Employee Journey**

The employee lifecycle in the HR system follows this path:
1. **Candidate** → Apply for jobs
2. **Onboarding** → Become an employee (Status: **PROBATION**)
3. **Active Employee** → Work and use system features
4. **Offboarding** → Exit the company

---

## 🎯 **PHASE 1: CANDIDATE REGISTRATION & APPLICATION**

### **1.1 Self-Registration as Candidate**
- **Action**: Candidate registers via `/auth/register` endpoint
- **Default Status**: `APPLIED` (automatically set)
- **What happens**:
  - Candidate provides: email, password, personal info (name, national ID, etc.)
  - System creates candidate profile with `candidateNumber`
  - Status is set to `APPLIED` by default
  - Candidate can login immediately (APPLIED status allows login)

### **1.2 Application Process**
- **Action**: Candidate applies for job positions
- **What candidate can do**:
  - Upload CV and documents
  - Track application status in real-time
  - Receive automated status updates (APPLIED → SCREENING → INTERVIEW → OFFER_SENT → OFFER_ACCEPTED → HIRED)
  - View status dashboard
  - Receive rejection notifications if not selected

### **1.3 Status Progression (Candidate)**
```
APPLIED → SCREENING → INTERVIEW → OFFER_SENT → OFFER_ACCEPTED → HIRED
```
- **Can Login**: ✅ All statuses except `REJECTED` and `WITHDRAWN`
- **Cannot Login**: ❌ `REJECTED`, `WITHDRAWN`

---

## 🚀 **PHASE 2: ONBOARDING (Candidate → Employee Transition)**

### **2.1 Offer Acceptance Triggers Onboarding**
- **Trigger**: When candidate accepts offer and signs contract
- **What happens**:
  - System automatically triggers Onboarding module
  - HR Employee uploads signed contract
  - **ONB-002**: Employee Profile is created from contract

### **2.2 Employee Profile Creation (ONB-002)**
- **Key Requirement Found in Excel**:
  > **"Employee Profile (EP) Activated with unique ID. Employee status set to 'Probation'."**
  
- **What happens**:
  - Employee profile is created with unique `employeeNumber`
  - **Status is set to `PROBATION`** (NOT ACTIVE!)
  - Profile includes: Name, ID, DOB, Date of Hire, Contract Type
  - System provisions initial access

### **2.3 Onboarding Tasks (New Hire Perspective)**
- **What employee receives**:
  - Onboarding task checklist (ONB-004)
  - Reminders for pending tasks (ONB-005)
  - Document upload requirements (ONB-007)
  - Access to onboarding tracker

- **What employee must do**:
  - View onboarding steps tracker
  - Upload required documents (IDs, contracts, certifications)
  - Complete compliance forms
  - Wait for system access provisioning

### **2.4 System Access & Resources**
- **Automatic provisioning**:
  - IT access (email, systems, payroll access)
  - Physical resources (desk, equipment, ID badge)
  - Payroll initiation (based on contract)
  - Signing bonus processing (if applicable)

---

## 👤 **PHASE 3: ACTIVE EMPLOYEE (After Probation)**

### **3.1 Status Transition**
- **Initial Status**: `PROBATION` (set during onboarding)
- **After Probation Period**: Status changes to `ACTIVE`
- **Login Rules**:
  - ✅ `ACTIVE` status → Can login
  - ❌ `PROBATION` status → **CANNOT login** (based on current code: only ACTIVE can login)
  - ❌ Other statuses (INACTIVE, SUSPENDED, etc.) → Cannot login

### **3.2 Employee Self-Service Features**

#### **Profile Management**
- View full employee profile
- Update contact information (phone, address)
- Upload profile picture
- Add biography
- Request corrections to critical data (name, national ID, position, marital status)
- View appraisal history

#### **Leave Management**
- Submit leave requests
- Attach supporting documents
- View leave balance (accrued, taken, remaining, pending, carry-over)
- View leave history
- Filter by type/date/status
- Receive notifications on approval/rejection
- Submit post-leave requests (within grace period)

#### **Payroll Self-Service**
- View and download payslips
- See payslip status (paid, disputed)
- View base salary according to contract
- See detailed deductions (tax, insurance)
- View compensation for unused leave
- Track claims and disputes
- Access salary history
- Download tax documents

#### **Time Management**
- Clock in/out using ID
- View attendance records
- Submit correction requests for missed punches
- Track permission requests

#### **Performance Management**
- View assigned appraisal forms
- Submit self-assessment
- View final ratings and feedback
- Access past appraisal history
- Flag concerns about ratings (within 7-day window)

---

## 🚪 **PHASE 4: OFFBOARDING (Employee Exit)**

### **4.1 Resignation Process**
- **Employee Action**: Submit resignation request with reasoning
- **Workflow**: Manager → Finance → HR approval
- **What happens**:
  - Last working day recorded
  - Clearance process initiated
  - Multi-department sign-offs (IT, Finance, Facilities, Line Manager)

### **4.2 Termination Process**
- **System Action**: Access revocation
- **What happens**:
  - System access revoked (OFF-007)
  - **Employee login disabled**
  - **Profile status updated to `INACTIVE`** (Fired/Terminated/Resigned)
  - Asset recovery process
  - Final payroll settlement

### **4.3 Exit Settlements**
- Final leave balance calculation
- Severance pay processing
- Benefits settlement
- Clearance completion

---

## ⚠️ **KEY FINDINGS & DISCREPANCIES**

### **1. Registration Endpoint vs Onboarding Process**

**Current Implementation**:
- `/auth/register` endpoint defaults employee status to `ACTIVE`
- Frontend can pass any status value

**Requirements (From Excel)**:
- **ONB-002** (Onboarding process) should set status to `PROBATION`
- This happens when HR creates employee profile from signed contract

**Issue Identified**:
- The public `/auth/register` endpoint may be for different use cases
- The onboarding process (ONB-002) is the official way employees are created
- There's a discrepancy: Registration defaults to ACTIVE, but requirements say PROBATION

### **2. Login Restrictions**

**Current Code**:
- Employees can ONLY login if status is `ACTIVE`
- This means `PROBATION` employees **CANNOT login**!

**Requirements Implication**:
- If employees start with `PROBATION` status, they cannot login until status changes to `ACTIVE`
- This might be intentional (probationary employees need approval before system access)
- OR it might be a bug that needs fixing

### **3. Status Flow Summary**

**Candidate Statuses** (Can login):
- ✅ APPLIED, SCREENING, INTERVIEW, OFFER_SENT, OFFER_ACCEPTED, HIRED

**Employee Statuses** (Can login):
- ✅ ACTIVE only
- ❌ PROBATION, INACTIVE, ON_LEAVE, SUSPENDED, RETIRED, TERMINATED

---

## 📝 **RECOMMENDATIONS**

1. **Clarify Registration Purpose**:
   - Is `/auth/register` for self-registration or admin creation?
   - Should it default to `PROBATION` instead of `ACTIVE`?

2. **Review Login Rules**:
   - Should `PROBATION` employees be able to login?
   - If yes, update `canLogin` function in `user-registry.service.ts`

3. **Status Security**:
   - Prevent frontend from setting inappropriate statuses during registration
   - Only allow `ACTIVE` or `PROBATION` for new employees

4. **Onboarding Integration**:
   - Ensure ONB-002 process sets status to `PROBATION` as per requirements
   - Link registration endpoint to onboarding workflow if needed

---

## 🔄 **COMPLETE FLOW DIAGRAM**

```
CANDIDATE PHASE:
Register → APPLIED → Apply for Jobs → SCREENING → INTERVIEW → OFFER_SENT → OFFER_ACCEPTED

ONBOARDING PHASE:
Contract Signed → ONB-002 → Employee Profile Created → Status: PROBATION
→ Complete Onboarding Tasks → System Access Provisioned

EMPLOYEE PHASE:
PROBATION → (After Review) → ACTIVE → Use System Features
  ├─ Profile Management
  ├─ Leave Requests
  ├─ Payroll Viewing
  ├─ Time Tracking
  └─ Performance Reviews

OFFBOARDING PHASE:
Resignation/Termination Request → Clearance → Access Revoked → Status: INACTIVE
```

---

## 📚 **REFERENCES FROM EXCEL**

- **Sheet: Recuritment, Row 29**: "Employee status set to 'Probation'"
- **Sheet: Employee Profile, Row 4**: Status controls system access
- **Sheet: Recuritment, Row 41**: Termination sets status to Inactive

