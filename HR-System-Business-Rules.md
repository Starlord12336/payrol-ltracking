# HR System Business Rules (BR)

This document outlines the business logic, constraints, and validation rules for the HR System, categorized by module.

## 1. Recruitment Process Rules
| BR ID | Business Rule Description |
| :--- | :--- |
| **BR 2** | Each job requisition must include Job details (title, department, location, openings) and Qualifications and skills needed. |
| **BR 6** | The system must allow automatic posting of approved requisitions to internal and external career sites. |
| **BR 9** | Each application must be tracked through defined stages (e.g., Screening, Shortlisting, Interview, Offer, Hired). |
| **BR 10** | The system must allow adding comments and ratings at each stage. |
| **BR 11** | Recruiters and hiring managers must be notified of status changes via alerts or workflow emails. |
| **BR 12** | The system must support the storage/upload of applications with resumes, creating the organization's talent pool. |
| **BR 14** | Electronic screening includes rule-based filters. Tie-Breaking Rules should be predetermined. |
| **BR 19(a-d)** | Recruiters must be able to schedule interviews by selecting time slots/panel members. Interviewers receive auto-invites; candidates receive auto-notifications. |
| **BR 20** | Panels need to possess the knowledge and/or training to conduct the needed interviews/selection tests. |
| **BR 21** | Assessment criteria must be pre-set and agreed upon. |
| **BR 22** | Feedback at each stage must be submitted by the panel/interviewers to ensure accuracy. |
| **BR 23** | The system needs to allow/house multiple assessment tools to be used. |
| **BR 25** | Tie-Breaking Rules could be based on Internal candidate preference. |
| **BR 26(a-d)** | The system supports issuing editable offer letters. Approval from related parties is required before sending. Offer acceptance triggers the Onboarding module. |
| **BR 27** | Candidate Status Tracking must be easily visualized and up-to-date in real-time. |
| **BR 28** | Storing the talent pool requires applicant authorization. Data handling must comply with GDPR/labor laws. |
| **BR 33** | Multiple reports could be generated (e.g., time-to-hire, source effectiveness). |
| **BR 36** | The system must send automated alerts/emails to candidates regarding status updates. |
| **BR 37** | The system must support email templates (e.g., rejection). Communication logs must be stored in the applicant profile. |
| **NFR-33** | All data handling must comply with privacy laws. |

## 2. Onboarding & Offboarding Rules
| BR ID | Business Rule Description |
| :--- | :--- |
| **BR 3(c)** | Upon termination, employee profile status must update to Inactive. |
| **BR 4** | Termination reviews based on performance must follow due process (e.g., warnings). |
| **BR 6** | Employee separation can be triggered by resignation. A clearly identified approval workflow is required (Employee > Manager > Finance > HR). |
| **BR 7** | Documents (IDs, contracts) must be collected and verified by HR before the first working day. |
| **BR 8** | Onboarding task checklists must be created to ensure new hires complete all steps. |
| **BR 9(a-c)** | Auto-onboarding tasks generated for HR (Payroll/Benefits), IT (Email/System Access), and Admin (Workspace/ID). Payroll initiation and signing bonuses must process automatically based on contract. |
| **BR 11(a,b)** | The orientation program must include an onboarding workflow and support department-specific tasks. |
| **BR 12** | The system must support sending reminders for tasks and tracking delivery status. |
| **BR 13(a-c)** | Clearance checklists are required across departments (IT, HR, Admin, Finance). Final approvals must be filed to HR to complete offboarding. |
| **BR 14** | Final settlements depend on clearance status updates from departments. |
| **BR 17(a,b)** | Employee profiles are created based on signed contract details. |
| **BR 19** | System access revocation is mandatory upon termination. |
| **BR 20** | IT access (email, laptop) must be automated. "No show" allows for onboarding cancellation/termination of the created profile. |

## 3. Organizational Structure Rules
| BR ID | Business Rule Description |
| :--- | :--- |
| **BR 5** | Unique IDs are required for all entities (Departments, Positions). |
| **BR 10** | A Position must have a Position ID, Job Key, Pay Grade, and Department ID. |
| **BR 12** | Positions cannot be deleted if historical employee assignments exist; they can only be "delimited." |
| **BR 16** | Position status includes Frozen/Inactive. |
| **BR 22** | Changes must retain version history and audit logs with timestamp and user ID. |
| **BR 24** | Organizational structure must be viewable as a graphical chart. |
| **BR 30** | Creation of a position requires Cost Center and Reporting Manager assignment. |
| **BR 36** | All structural changes must be made via workflow approval. |
| **BR 37** | Historical records must be preserved using delimiting. |
| **BR 41** | Access must be role-based: Direct Managers see their team only; Employees see their own structure. |
| **REQ-OSM-09**| Validation rules must prevent circular reporting lines, duplicate positions, or mismatched department assignments. |

## 4. Employee Profile Rules
| BR ID | Business Rule Description |
| :--- | :--- |
| **BR 2(a-r)** | System must record specific PII and job data. Phone, Email, and Address are mandatory. |
| **BR 3(b-j)** | Required fields: Date of Hire, Contract Type, Education Details. Employee Status (Active, On Leave, Suspended, Retired) controls system access. |
| **BR 10c** | Pay Grade/Band definitions must be linked to the profile. |
| **BR 16** | Appraisal records (Date, Type, Score) are saved on the profile. |
| **BR 18b** | Privacy restrictions apply to Line Managers regarding sensitive employee data. |
| **BR 20a** | Only authorized roles can create/modify profile data. |
| **BR 22** | All edits, changes, and cancellations must be timestamped and audit-trailed. |
| **BR 36** | Profile changes (e.g., name, marital status) require workflow approval. |
| **BR 41b** | Direct Managers see their team only. |
| **NFR-14** | All users shall authenticate via secure login and role-based access control. |

## 5. Leaves Management Rules
| BR ID | Business Rule Description |
| :--- | :--- |
| **BR 1** | HR/System Admin must define 'Leave types' (Annual, Sick, Maternity, etc.) with unique codes. |
| **BR 5** | A criterion date must be set for vacation resets (e.g., Hire date, First Vacation Date). |
| **BR 7** | Vacation Packages (e.g., Foreigner vs. Local) must be defined with specific entitlements per labor law. |
| **BR 9/10** | $Monthly\ Accrual = (Number\ of\ eligible\ months\ worked) \times (Monthly\ Rate)$. Carry-over rules, expiration dates, and caps must be set. |
| **BR 11** | Accrual must pause during unpaid leave and suspensions. |
| **BR 14** | System display must show Accrued, Taken, and Available balance (reflecting Pending/Carry-over). |
| **BR 17** | Manual adjustments must be traced with timestamp, User ID, and reason. |
| **BR 20/42** | Rounding methods (Arithmetic, Up, Down) must be defined. Both actual and rounded values are stored. |
| **BR 22/44/52**| Approved leaves must sync with payroll in real-time. $Unpaid\ Leave\ Deduction = (\frac{Base\ Salary}{Work\ Days\ in\ Month}) \times Unpaid\ Leave\ Days$. |
| **BR 23** | Leave duration is calculated net of non-working days (holidays/weekends). |
| **BR 24** | Multi-level approval chains are defined per position (e.g., Manager → HR → Director). |
| **BR 25** | Requests must pass through predefined, role-based approval. |
| **BR 27** | Automated notifications for submission, approval, rejection, complaint, or cancellation. |
| **BR 28** | If a request is pending > 48 hrs, the system must issue an alert or escalate. |
| **BR 29** | If Total Leave > Entitlement, the system must convert to unpaid or block the request. |
| **BR 31** | System checks for overlapping dates and balance availability. |
| **BR 32** | Leave balance updates in real-time upon submission, approval, or cancellation. |
| **BR 39/41** | Sick leave tracks cumulatively over a 3-year cycle (max 360 days). Maternity leave counts are tracked. |
| **BR 48** | Negative balances are not allowed unless explicitly permitted by HR override. |
| **BR 53** | Final Settlement Encashment: $Encashment = Daily\ Salary\ Rate \times min(Unused\ Leave\ Days, 30)$. |
| **BR 54** | Documentation (e.g., medical certificate) is required for specific leave types (Sick > 1 day). |
| **BR 55** | HR can configure "Leave Block Periods" (e.g., end-of-year closing) to prevent requests. |

## 6. Time Management Rules
| BR ID | Business Rule Description |
| :--- | :--- |
| **BR-TM-01** | Roles for time management are defined by System Admin. Managers/HR approve permissions. |
| **BR-TM-02** | Shifts are assigned per employee for a defined term with statuses (Approved, Cancelled, Expired). |
| **BR-TM-03** | System supports multiple shift types (Normal, Split, Overnight, Mission, Rotational). |
| **BR-TM-04** | System supports multiple shift names (Fixed Core, Flex-Time, Custom Weekly Patterns). |
| **BR-TM-05** | Schedules assignable by Department, Position, or Individual. |
| **BR-TM-06** | Time capture via Biometric, Web, Mobile (GPS), or Manual Input (with audit trail). |
| **BR-TM-07** | Attendance data follows HR rounding rules (nearest interval, floor/ceiling). |
| **BR-TM-08** | Overtime/Short Time calculated according to policy (types, categories, rules). |
| **BR-TM-09** | Early/Lateness follows rules for grace periods, penalty thresholds, and escalation. |
| **BR-TM-10** | System restricts early/late clock-ins based on configured shifts. |
| **BR-TM-11** | System allows multiple punches per day OR First-In/Last-Out logic. |
| **BR-TM-12** | Clock-ins tagged with location, terminal ID, or device. |
| **BR-TM-13** | Devices must sync automatically once online. |
| **BR-TM-14** | Missed punches/late sign-ins handled via auto-flagging, notification, or payroll blocking. |
| **BR-TM-15** | Correction requests (reason + time) submitted via ESS, routed to Line Manager. |
| **BR-TM-16** | Permission policies define types of Over/Short time (Early In, Late Out, Out of Hours). |
| **BR-TM-17** | Permissions tied to valid dates (contract start, financial calendar). |
| **BR-TM-18** | Over/Short time permissions can be Accepted/Rejected, impacting payroll. |
| **BR-TM-19** | Vacation packages, national holidays, and rest days must link to shift schedules. |
| **BR-TM-20** | Unreviewed requests auto-escalate after defined time or before payroll cutoff. |
| **BR-TM-22** | Time management data must sync daily with payroll, benefits, and leaves. |
| **BR-TM-24** | All time edits/cancellations must be timestamped and audit-tracked. |

## 7. Performance Management Rules
| BR ID | Business Rule Description |
| :--- | :--- |
| **BR 1** | Appraisal cycles (annual, semi-annual, probationary) are defined by HR. |
| **BR 3** | Outcome reports and archived data are used for audit/traceability. |
| **BR 6** | Employee Appraisals are saved on the profile (Date, method, rating, score). |
| **BR 7(a)** | Manager completes structured ratings for direct reports. |
| **BR 11** | HR dashboard tracks appraisal completion across departments. |
| **BR 14** | Standardized KPI definitions used for consistency. |
| **BR 15(a-c)** | Line manager sets/reviews objectives based on Departmental objectives and Job descriptions. |
| **BR 20** | Standardized appraisal templates and rating scales are configured by HR. |
| **BR 22** | Assignment alerts sent upon form distribution. |
| **BR 26** | Managers add comments and examples to ratings. |
| **BR 27(a,b)** | Employees view final ratings/feedback. Employees acknowledge assigned objectives. |
| **BR 31** | Employees have the right to file a formal appeal/dispute within a pre-set window. |
| **BR 32** | Appeals must be reviewed by HR; outcomes (Deny/Approve & Change) must be logged. |
| **BR 33(c)** | Line Manager flags high-performers for promotion (Succession/HiPo flag). |
| **BR 35** | PIPs (Performance Improvement Plans) are retained as manual documentation. |
| **BR 36(a,b)** | Notifications sent for assigned objectives, flags, and reminder alerts. |
| **BR 41(d)** | Line Manager views assigned appraisal forms. |
| **BR 46** | HR Manager consolidated dashboard tracks completion; Ad-hoc reporting enabled. |