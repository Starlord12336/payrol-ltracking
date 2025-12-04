# HR System Requirements Specifications

This document details the functional requirements and user stories for the HR System, excluding the internal Payroll module logic.

## 1. Recruitment Module

| Req ID | Requirement Name | User Story / Functionality |
| :--- | :--- | :--- |
| **REC-003** | Job Design & Posting | HR Manager defines standardized job description templates so postings are consistent. |
| **REC-004** | Hiring Process Templates | HR Manager establishes hiring process templates to automatically update progress percentage (Screening, Interview, Offer, etc.). |
| **REC-023** | Career Page Publishing | HR Employee previews and publishes jobs on the company careers page with employer-brand content. |
| **REC-007** | Candidate Application | Candidate uploads CV and applies for positions to be considered for opportunities. |
| **REC-028** | Consent & Compliance | Candidate gives consent for personal-data processing and background checks (GDPR/Local Law compliance). |
| **REC-030** | Referral Tagging | HR Employee tags candidates as referrals to prioritize them in screening/interviewing. |
| **REC-008** | Candidate Tracking | HR Employee tracks candidates through each stage of the hiring process to manage progress. |
| **REC-009** | Recruitment Analytics | HR Manager monitors recruitment progress across all open positions (Time-to-hire, source effectiveness). |
| **REC-020** | Structured Assessment | HR Employee uses structured assessment/scoring forms per role for consistent, auditable evaluations. |
| **REC-010** | Interview Management | HR Employee schedules interview invitations; system handles calendar invites for panel and candidate. |
| **REC-021** | Panel Coordination | HR Employee coordinates interview panels (members, availability, scoring). |
| **REC-011** | Feedback & Scoring | HR Employee/Panel provides feedback/interview scores for filtration. |
| **REC-017** | Candidate Updates | Candidate receives automated alerts/emails regarding application status updates. |
| **REC-022** | Rejection Notifications | HR Employee uses automated rejection templates to inform candidates respectfully. |
| **REC-014** | Offer Approval | HR Manager manages job offers and financial approvals before sending to candidates. |
| **REC-018** | Digital Offers | HR Employee generates, sends, and collects electronically signed offer letters. |
| **REC-029** | Pre-boarding Trigger | System triggers pre-boarding tasks (contract signing, forms) after offer acceptance. |

## 2. Onboarding Module

| Req ID | Requirement Name | User Story / Functionality |
| :--- | :--- | :--- |
| **ONB-001** | Checklist Creation | HR Manager creates onboarding task checklists assigned to new hires and departments. |
| **ONB-002** | Profile Creation | System creates Employee Profile using data from the signed offer letter/contract. |
| **ONB-004** | New Hire Tracker | New Hire views onboarding steps in a tracker to know what to complete next. |
| **ONB-005** | Reminders | System sends reminders and notifications to New Hire for pending tasks. |
| **ONB-007** | Document Upload | New Hire uploads required documents (ID, certifications) for HR verification. |
| **ONB-009** | IT Provisioning | System Admin/System provisions system access (email, internal systems) automatically. |
| **ONB-012** | Asset Reservation | HR Employee reserves and tracks equipment, desk, and access cards for Day 1 readiness. |
| **ONB-013** | Auto-Provisioning | HR Manager ensures automated account provisioning on start date and scheduled revocation on exit. |
| **ONB-018** | Payroll Initiation | System automatically handles payroll initiation based on contract signing date. |
| **ONB-019** | Signing Bonuses | System automatically triggers processing of signing bonuses based on contract details. |

## 3. Offboarding Module
| Req ID | Requirement Name | User Story / Functionality |
| :--- | :--- | :--- |
| **OFF-001** | Termination Initiation | HR Manager initiates termination reviews based on warnings/performance data; supports resignation requests. |
| **OFF-006** | Clearance Checklist | HR Manager utilizes offboarding checklist for asset recovery (IT assets, IDs). |
| **OFF-007** | Access Revocation | System Admin/System revokes system/account access upon termination; Profile set to Inactive. |
| **OFF-010** | Multi-Dept Sign-off | HR Manager manages exit clearance sign-offs from IT, Finance, Facilities, and Line Manager. |
| **OFF-013** | Final Settlement Trigger | HR Manager sends notification to trigger benefits termination and final pay calculation (unused leave, deductions). |
| **OFF-018** | Resignation Request | Employee submits resignation request with reasoning. |
| **OFF-019** | Resignation Tracking | Employee tracks the status of their resignation request. |

## 4. Organizational Structure Module
| Req ID | Requirement Name | User Story / Functionality |
| :--- | :--- | :--- |
| **REQ-OSM-01** | Structure Creation | System Admin defines and creates departments and positions. |
| **REQ-OSM-02** | Structure Updates | System Admin updates existing departments and positions. |
| **REQ-OSM-05** | Deactivation | System Admin deactivates/removes obsolete roles (delimiting historical records). |
| **REQ-OSM-11** | Change Notification | System notifies managers/stakeholders when structural changes occur. |
| **REQ-SANV-01** | Hierarchy View (Emp) | Employee views the organizational hierarchy chart. |
| **REQ-SANV-02** | Hierarchy View (Mgr) | Manager views their team’s structure and reporting lines. |
| **REQ-OSM-03** | Change Request | Manager submits requests for changes to team assignments/structure. |
| **REQ-OSM-04** | Request Approval | System Admin reviews and approves manager requests for hierarchy changes. |

## 5. Employee Profile Module
| Req ID | Requirement Name | User Story / Functionality |
| :--- | :--- | :--- |
| **US-E2-04** | View Profile | Employee views their full employee profile (PII, Employment details). |
| **US-E2-05** | Update Contact Info | Employee updates contact info (Phone, Address) via Self-Service. |
| **US-E2-12** | Bio & Picture | Employee adds short biography and uploads profile picture. |
| **US-E6-02** | Correction Request | Employee requests data corrections (e.g., job title, department). |
| **US-E4-01** | Team View | Manager views team members’ profiles (excluding sensitive info). |
| **US-E4-02** | Team Summary | Manager sees a summary of team’s job titles and departments. |
| **US-E6-03** | Data Search | HR Admin searches for employee data. |
| **US-EP-04** | Master Data Edit | HR Admin edits any part of an employee’s profile. |
| **US-E2-03** | Change Approval | HR Admin reviews and approves employee-submitted profile changes. |
| **US-EP-05** | Profile Deactivation | HR Admin deactivates profile upon termination/resignation. |
| **US-E7-05** | Role Assignment | HR Admin assigns roles and access permissions to employees. |

## 6. Leaves Management Module

| Req ID | Requirement Name | User Story / Functionality |
| :--- | :--- | :--- |
| **REQ-001** | Policy Config | HR Admin initiates leave configuration (Define Leave Types). |
| **REQ-003** | Settings Config | HR Admin configures accrual rates, carry-over, rounding, and waiting periods. |
| **REQ-006** | Leave Types | HR Admin creates/manages leave types (Annual, Sick, Mission, Maternity, etc.). |
| **REQ-007** | Eligibility Rules | HR Admin sets eligibility (min tenure, employee type) for each leave type. |
| **REQ-008** | Entitlements | HR Admin assigns personalized entitlements/vacation packages. |
| **REQ-009** | Parameters | HR Admin configures max duration, notice periods, and approval workflows. |
| **REQ-010** | Calendar/Blocked Days | HR Admin sets public holidays and blocked days (excluded from count). |
| **REQ-012** | Reset Rules | HR Admin defines legal leave year and balance reset rules. |
| **REQ-013** | Manual Adjustment | HR Admin manually adjusts balances (corrections, grants) with audit logging. |
| **REQ-015** | Submit Request | Employee submits leave request (dates, type, justification). |
| **REQ-016** | Attachments | Employee attaches documents (e.g., doctor’s note) to request. |
| **REQ-020** | Manager Review | Direct Manager reviews assigned leave requests. |
| **REQ-021/022**| Manager Action | Direct Manager approves or rejects leave requests. |
| **REQ-025** | HR Finalization | HR Manager reviews and finalizes approved requests (Compliance check). |
| **REQ-026** | HR Override | HR Manager overrides manager decision in special circumstances. |
| **REQ-027** | Bulk Processing | HR Manager processes multiple leave requests at once. |
| **REQ-029** | Balance Update | System automatically updates leave balances after final approval. |
| **REQ-031** | View Balance | Employee views current leave balance (Accrued, Taken, Remaining). |
| **REQ-034** | Team Balances | Manager views team members' leave balances and upcoming leaves. |
| **REQ-040** | Auto Accrual | System automatically adds leave days to balance based on policy/tenure. |
| **REQ-041** | Auto Carry-Over | System runs year-end carry-forward processes automatically. |
| **REQ-042** | Payroll Sync | System syncs with payroll in real-time for deductions/encashment. |

## 7. Time Management Module

| Req ID | Requirement Name | User Story / Functionality |
| :--- | :--- | :--- |
| **TM-01** | Shift Assignment | Admin assigns shifts to employees (Individual/Dept) and manages statuses. |
| **TM-02** | Shift Config | HR Manager defines shift types (Normal, Split, Overnight) and names. |
| **TM-03** | Custom Rules | HR Manager defines flexible/custom scheduling rules (e.g., 4 days on/3 off). |
| **TM-04** | Expiry Notification | System notifies HR when a shift assignment is nearing expiry. |
| **TM-05** | Clock-In/Out | Employee clocks in/out using ID (Biometric/Web/Mobile). |
| **TM-06** | Manual Correction | Line Manager records/corrects attendance manually. |
| **TM-07** | Flexible Punch | System supports multiple punches per day or First-In/Last-Out logic. |
| **TM-08** | Missed Punch | System flags missed punches and sends alerts to Employee/Manager. |
| **TM-09** | Payroll Sync | Attendance records sync daily with payroll and leave systems. |
| **TM-10** | Overtime Config | HR Manager configures overtime, short-time, and weekend work rules. |
| **TM-11** | Lateness Rules | HR Manager sets grace periods, lateness thresholds, and penalties. |
| **TM-12** | Repeated Lateness | System flags repeated lateness for disciplinary tracking. |
| **TM-13** | Correction Requests | Employee submits correction requests for missing/incorrect punches. |
| **TM-14** | Approval Workflow | Manager/HR reviews corrections/overtime; auto-escalation for delays. |
| **TM-15** | Permission Validation| HR Admin defines limits for permission durations (Early out/Late in). |
| **TM-16** | Vacation Integration | Vacation packages linked to schedules; approved leave reflects in attendance. |
| **TM-17** | Holiday Config | Admin defines holidays/rest days to suppress penalties during those times. |
| **TM-18** | Cut-Off Escalation | Requests escalate automatically if not reviewed before payroll cut-off. |
| **TM-19** | Reporting | HR/Payroll Officer exports overtime and exception reports. |
| **TM-20** | Cross-Module Sync | Attendance data synchronized with Payroll and Leaves modules. |

## 8. Performance Management Module

| Req ID | Requirement Name | User Story / Functionality |
| :--- | :--- | :--- |
| **REQ-PP-01** | Template Config | HR Manager configures standardized appraisal templates and rating scales. |
| **REQ-PP-02** | Cycle Creation | HR Manager defines and schedules appraisal cycles (Annual, Probationary). |
| **REQ-PP-05** | Assignment | HR Employee assigns appraisal forms/templates to employees and managers. |
| **REQ-PP-07** | Acknowledge Goals | Employee receives notification of assigned objectives and acknowledges them. |
| **REQ-PP-12** | Set Objectives | Line Manager sets and reviews employee objectives. |
| **REQ-PP-13** | View Forms | Line Manager views assigned appraisal forms. |
| **REQ-AE-01** | View Objectives | Employee views assigned appraisal form and related objectives. |
| **REQ-AE-02** | Self-Assessment | Employee submits self-assessment and attaches supporting documents. |
| **REQ-AE-03** | Manager Rating | Line Manager completes structured appraisal ratings for direct reports. |
| **REQ-AE-04** | Feedback/Comments | Line Manager adds comments, examples, and development recommendations. |
| **REQ-AE-06** | Monitor Progress | HR Employee monitors appraisal progress and sends reminders. |
| **REQ-AE-07** | Dispute/Flag | Employee or HR flags or raises a concern about a rating. |
| **REQ-AE-10** | HR Dashboard | HR Manager tracks appraisal completion via consolidated dashboard. |
| **REQ-OD-01** | Final View | Employee views final ratings, feedback, and development notes. |
| **REQ-OD-03** | Promotion Flag | Line Manager flags high-performers for promotion consideration. |
| **REQ-OD-05** | PIP Initiation | Line Manager initiates Performance Improvement Plans (PIPs). |
| **REQ-OD-07** | Dispute Resolution | HR Manager resolves disputes between employees and managers. |
| **REQ-OD-08** | History/Trends | Employee/Manager accesses past appraisal history and trend views. |
| **REQ-OD-16** | Visibility Rules | System Admin configures visibility rules for feedback entries. |