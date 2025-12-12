# Performance Management - User Stories Extracted

This document contains all user stories related to Performance Management extracted from the HR System Requirements.

---

## 📋 Table of Contents
1. [Performance Planning](#performance-planning)
2. [Appraisal Execution](#appraisal-execution)
3. [Outcomes & Development](#outcomes--development)

---

## 🎯 Performance Planning

### REQ-PP-01: Configure Standardized Appraisal Templates and Rating Scales
- **User Type**: System Administrator
- **Description**: Configure standardized appraisal templates and rating scales
- **Inputs**: None (System Configuration)
- **Outputs**: Analytics (Standardized KPI definitions for consistency)
- **Business Rules**: BR 14, 20

### REQ-PP-05: Assign Appraisal Forms and Templates
- **User Type**: HR / System Administrator
- **Description**: Assign appraisal forms and templates to employees and managers so that setup is efficient
- **Inputs**: 
  - Employee Profile (EP) - Employee list, Status
  - Organizational Structure (OS) - Reviewer chain, reporting lines
- **Outputs**: Notifications (Assignment alerts)
- **Business Rules**: BR 22, 37(a)

### REQ-PP-07: Employee Receives Notifications and Acknowledge
- **User Type**: Employee
- **Description**: Employee receives notifications of my assigned objectives/expectations and acknowledge them
- **Inputs**: Performance Management (PM) - Assigned objectives
- **Outputs**: PM/Audit Log (Acknowledgment status log)
- **Business Rules**: BR 27(b), 36(a)

### REQ-PP-12: Line Manager Sets and Reviews Employee Objectives
- **User Type**: Line Manager
- **Description**: Line manager sets and review employee objectives
- **Inputs**: 
  - Organizational Structure (OS) - Departmental objectives, Job descriptions
- **Outputs**: PM (Goal setting data)
- **Business Rules**: BR 13, 15(a-c)

### REQ-PP-13: Line Manager Views Assigned Appraisal Forms
- **User Type**: Line Manager
- **Description**: Line manager views assigned appraisal forms
- **Inputs**: PM (Assigned appraisal forms)
- **Outputs**: None
- **Business Rules**: BR 41(d)

---

## 📝 Appraisal Execution

### REQ-AE-01: Employee Views Assigned Appraisal Form
- **User Type**: Employee
- **Description**: Employee views assigned appraisal form and related objectives
- **Inputs**: PM (Objectives, templates)
- **Outputs**: None
- **Business Rules**: BR 15(a), 27(a)

### REQ-AE-02: Employee Submits Self-Assessment
- **User Type**: Employee
- **Description**: Employee submits self-assessment and attach supporting documents (Note: Optional/Change)
- **Inputs**: Employee Profile (EP) - Document repository for evidence
- **Outputs**: PM (Self-assessment submission data)
- **Business Rules**: BR 7(b), 22(a)

### REQ-AE-03: Line Manager Completes Appraisal Ratings
- **User Type**: Line Manager
- **Description**: Line Manager accesses and complete structured appraisal ratings for my direct reports
- **Inputs**: Time Management (TM) - Attendance and punctuality data
- **Outputs**: PM (Manager ratings and scores)
- **Business Rules**: BR 7(a), 8, 14, 21

### REQ-AE-04: Line Manager Adds Comments and Recommendations
- **User Type**: Line Manager
- **Description**: Line Manager adds comments, examples and development recommendations
- **Inputs**: None
- **Outputs**: Learning & Development (L&D) - Input for development needs/plans
- **Business Rules**: BR 26, 33(d)

### REQ-AE-06: HR Employee Monitors Appraisal Progress
- **User Type**: HR Employee
- **Description**: HR Employee monitors appraisal progress and send reminders (Note: Changed to HR views submitted entries)
- **Inputs**: None
- **Outputs**: Notifications (Reminder alerts)
- **Business Rules**: BR 23, 36(b)

### REQ-AE-07: Employee or HR Employee Flags Concerns
- **User Type**: Employee, HR Employee
- **Description**: Employee or HR Employee flags or raises a concern about a rating
- **Inputs**: None
- **Outputs**: PM (Dispute log)
- **Business Rules**: BR 31, 32

### REQ-AE-09: System Administrator Updates Policies
- **User Type**: System Administrator
- **Description**: System Administrator updates policies and scoring configurations
- **Inputs**: None
- **Outputs**: None
- **Business Rules**: BR 20, 35

### REQ-AE-10: HR Manager Consolidated Dashboard
- **User Type**: HR Manager
- **Description**: HR Manager consolidated dashboard that tracks appraisal completion
- **Inputs**: Organizational Structure (OS) - Departmental grouping
- **Outputs**: Analytics (Completion dashboard)
- **Business Rules**: BR 11, 46

### REQ-AE-11: HR Employee Exports Appraisal Summaries
- **User Type**: HR Employee
- **Description**: HR Employee exports ad-hoc appraisal summaries
- **Inputs**: 
  - PM (Appraisal data)
  - Organizational Structure (OS) - Filters
- **Outputs**: Analytics (Ad-hoc reporting data feed)
- **Business Rules**: BR 46

---

## 🎯 Outcomes & Development

### REQ-OD-01: Employee Views Final Ratings and Feedback
- **User Type**: Employee
- **Description**: Employee views final ratings, feedback, and development notes
- **Inputs**: PM (Finalized appraisal record)
- **Outputs**: None
- **Business Rules**: BR 6, 27(a), 28

### REQ-OD-03: Line Manager Flags High-Performers
- **User Type**: Line Manager
- **Description**: Line Manager flags high-performers for promotion consideration (Note: Kept as optional note field)
- **Inputs**: PM (High rating outcome)
- **Outputs**: Analytics (Succession/HiPo flag)
- **Business Rules**: BR 33(c), 46

### REQ-OD-05: Line Manager Initiates Performance Improvement Plans
- **User Type**: Line Manager
- **Description**: Line Manager initiates Performance Improvement Plans (PIPs) (Note: Optional, retained as manual documentation)
- **Inputs**: PM (Performance history/low ratings)
- **Outputs**: Learning & Development (L&D) - Create PIP/Development assignments
- **Business Rules**: BR 35, 44

### REQ-OD-06: HR Employee Generates Outcome Reports
- **User Type**: HR Employee
- **Description**: HR Employee generates and export outcome reports
- **Inputs**: PM (Outcome data)
- **Outputs**: Analytics (Reports for audit/traceability)
- **Business Rules**: BR 3, 46

### REQ-OD-07: HR Manager Resolves Disputes
- **User Type**: HR Manager
- **Description**: HR Manager resolves disputes between employees and managers
- **Inputs**: PM (Dispute log)
- **Outputs**: Notifications (Dispute resolution)
- **Business Rules**: BR 31, 32

### REQ-OD-08: Access Past Appraisal History
- **User Type**: Employee, Line Manager
- **Description**: Employee / Line Manager access past appraisal history and multi-cycle trend views
- **Inputs**: PM (Archived data)
- **Outputs**: Analytics (Multi-cycle trend views)
- **Business Rules**: BR 3, 39, 46

### REQ-OD-14: Line Manager Schedules 1-on-1 Meetings
- **User Type**: Line Manager
- **Description**: Line manager schedules 1 on 1 meetings with employees (Note: Optional manual scheduling)
- **Inputs**: None
- **Outputs**: None
- **Business Rules**: BR 46

### REQ-OD-16: System Admin Configures Visibility Rules
- **User Type**: System Administrator
- **Description**: System Admin configures visibility rules for feedback entries
- **Inputs**: None (Configuration Action)
- **Outputs**: Security/Access (Visibility rules enforcement)
- **Business Rules**: BR 41, 42

### REQ-OD-17: HR Employee Receives Automatic Notifications
- **User Type**: HR Employee
- **Description**: HR Employee receives automatic notifications when an appraisal flag (Promotion / At-Risk / Misconduct) is set (Note: Changed to notification when objection filed)
- **Inputs**: PM (Flags set)
- **Outputs**: Notifications (Immediate alerts)
- **Business Rules**: BR 36(a)

---

## 📊 Summary by User Type

### 👤 Employee
- REQ-PP-07: Receive and acknowledge notifications of assigned objectives
- REQ-AE-01: View assigned appraisal form and related objectives
- REQ-AE-02: Submit self-assessment with supporting documents
- REQ-AE-07: Flag or raise concerns about ratings
- REQ-OD-01: View final ratings, feedback, and development notes
- REQ-OD-08: Access past appraisal history and multi-cycle trend views

### 👔 Line Manager
- REQ-PP-12: Set and review employee objectives
- REQ-PP-13: View assigned appraisal forms
- REQ-AE-03: Complete structured appraisal ratings for direct reports
- REQ-AE-04: Add comments, examples and development recommendations
- REQ-OD-03: Flag high-performers for promotion consideration
- REQ-OD-05: Initiate Performance Improvement Plans (PIPs)
- REQ-OD-08: Access past appraisal history and multi-cycle trend views
- REQ-OD-14: Schedule 1-on-1 meetings with employees (Optional)

### 👥 HR Employee
- REQ-AE-06: Monitor appraisal progress and view submitted entries
- REQ-AE-07: Flag or raise concerns about ratings
- REQ-AE-11: Export ad-hoc appraisal summaries
- REQ-OD-06: Generate and export outcome reports
- REQ-OD-17: Receive automatic notifications when appraisal flags are set

### 👔 HR Manager
- REQ-AE-10: View consolidated dashboard tracking appraisal completion
- REQ-OD-07: Resolve disputes between employees and managers

### ⚙️ System Administrator
- REQ-PP-01: Configure standardized appraisal templates and rating scales
- REQ-AE-09: Update policies and scoring configurations
- REQ-OD-16: Configure visibility rules for feedback entries

---

## 🔗 Integration Points

### Inputs from Other Sub-Systems:
- **Employee Profile (EP)**: Employee list, Status, Document repository
- **Organizational Structure (OS)**: Reviewer chain, reporting lines, Departmental objectives, Job descriptions, Departmental grouping
- **Time Management (TM)**: Attendance and punctuality data

### Outputs to Other Sub-Systems:
- **Notifications**: Assignment alerts, Reminder alerts, Dispute resolution, Immediate alerts
- **Analytics**: Standardized KPI definitions, Completion dashboard, Ad-hoc reporting, Succession/HiPo flags, Multi-cycle trend views, Reports for audit
- **Learning & Development (L&D)**: Development needs/plans, PIP/Development assignments
- **PM/Audit Log**: Acknowledgment status log
- **Security/Access**: Visibility rules enforcement

---

## 📌 Business Rules Referenced

- BR 3, 6, 7(a), 7(b), 8, 11, 13, 14, 15(a-c), 20, 21, 22, 22(a), 23, 26, 27(a), 27(b), 28, 31, 32, 33(c), 33(d), 35, 36(a), 36(b), 37(a), 39, 41, 41(d), 42, 44, 46

---

*Document generated from HR System Requirements Excel file*

