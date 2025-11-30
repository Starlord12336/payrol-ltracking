# [cite_start]Software Project I, Winter 2025 [cite: 10]

## [cite_start]Project Description: HR System [cite: 10]

## [cite_start]Executive Summary [cite: 11]

[cite_start]A unified, modular HR platform that covers the full employee lifecycle and everyday HR operations in one place[cite: 12].

[cite_start]At its core is a shared employee and organizational model: every module (Employee Profile, Organizational Structure, Recruitment, Onboarding, Offboarding, Time Management, Leaves, Payroll and Performance Management) reads from and updates the same source of truth so HR teams don’t have to reconcile multiple systems[cite: 13]. [cite_start]The user interface is simple and consistent across modules (dashboards, lists, detail pages, and action-driven modals) so HR staff and managers learn one pattern and can complete tasks quickly and confidently[cite: 13].

---

# [cite_start]Employee Profile, Organization Structure and Performance Sub-system [cite: 14]

## [cite_start]Employee Profile Module [cite: 15]

### [cite_start]Description [cite: 16]

[cite_start]The Employee Profile Management Module serves as the central repository for all employee-related information within the Human Resource Management System[cite: 16]. [cite_start]It maintains accurate, secure, and up-to-date employee master data, acting as the foundation upon which other HR subsystems such as Payroll, Performance, Time Management, and Organizational Structure rely[cite: 17].

[cite_start]This module enables both employees and HR administrators to manage profile data efficiently while enforcing strict data governance and access controls[cite: 18]. [cite_start]Through the self-service interface, employees can view their complete profiles, including personal details, employment information, departmental assignments, and performance history[cite: 19]. [cite_start]They can also update certain non-critical fields such as contact details or profile pictures, with all updates logged and monitored for traceability[cite: 20].

[cite_start]To better understand the module: the FRs, their respective US, the dependencies of this module (inputs and outputs), and its Business Rules are provided[cite: 21].

### [cite_start]Requirements, Dependencies, and Business Rules [cite: 22]

[cite_start]For the requirements of this subsystem, please check the **Employee Profile sheet** in this file: **HR System Requirements file**[cite: 23].

### [cite_start]Employee Profile Module Flow Overview [cite: 25]

[cite_start]This flow covers how employee profile data is viewed, updated, requested for change, and governed through approvals[cite: 26]. [cite_start]It moves left-to-right from employee self-service to manager insight and finally HR/System Admin control[cite: 27].

#### [cite_start]Phases [cite: 28]

- [cite_start]**Phase I: Self-Service Access & Updates (Steps 1-3)**: Employees securely view their profiles, make immediate non-critical updates (e.g., phone, email, photo), and submit formal correction requests for governed fields[cite: 29].
- [cite_start]**Phase II: Manager Insight (Step 4)**: Department Managers see non-sensitive team summaries based on reporting lines with privacy restrictions[cite: 30].
- [cite_start]**Phase III: HR/Admin Processing & Master Data (Steps 5-6)**: HR reviews and approves change requests through workflow, applies edits to master data, and system-syncs downstream modules (Payroll, Time Management, Org Structure) as required[cite: 31].

---

## [cite_start]Organization Structure Module [cite: 32]

### [cite_start]Description [cite: 33]

[cite_start]This module defines how the company is organized[cite: 33]. [cite_start]It allows the System Administrator to create departments and positions, update them when changes happen, and deactivate positions that are no longer needed while keeping their history[cite: 33]. [cite_start]Managers can request changes to reporting lines or positions, and these requests go through an approval process to keep the structure accurate and logical[cite: 34]. [cite_start]Role-based views allow employees and managers to see the org chart appropriately[cite: 35]. [cite_start]Changes automatically update dependent modules (e.g., Payroll, Recruitment, Employee Profiles) to keep data consistent[cite: 36].

### [cite_start]Requirements, Dependencies, and Business Rules [cite: 37]

[cite_start]For the requirements of this subsystem, please check the **Organization Structure sheet** in this file: **HR System Requirements file**[cite: 38].

### [cite_start]Organization Structure Flow [cite: 39]

[cite_start]The Organizational Structure Management (OSM) Module governs how departments, positions, and hierarchical structures are created, updated, and maintained across the HR system[cite: 40]. [cite_start]This ensures that the organizational framework remains accurate and aligned with operational and administrative needs, serving as a foundation for recruitment, payroll, and performance processes[cite: 41].

- [cite_start]**Phase 1: Structure Definition**: The process begins when the System Administrator defines and creates new organizational entities such as departments or positions[cite: 42]. [cite_start]These additions accommodate new roles within the company hierarchy[cite: 43]. [cite_start]Each position is linked to a department and assigned its relevant attributes including identification codes, reporting lines, and pay grades[cite: 43]. [cite_start]Once created, the position becomes available for recruitment and integration into downstream HR functions[cite: 44].
- [cite_start]**Phase 2: Structural Maintenance**: When modifications are needed, the System Administrator performs direct updates or maintenance of existing departments and positions[cite: 45]. [cite_start]This may include renaming, reassigning, or updating attributes such as reporting structures or pay grades[cite: 46]. [cite_start]Structural changes are applied immediately across the system to maintain data consistency between the organizational structure and dependent subsystems[cite: 47].
- [cite_start]**Phase 3: Deactivation and Synchronization**: When a position or department becomes obsolete, the System Administrator deactivates it from the active structure[cite: 49]. [cite_start]Positions with historical employee records are not deleted but are delimited meaning they are closed as of a certain date to preserve organizational history[cite: 50]. [cite_start]These updates ensure the system retains full historical accuracy while keeping the active organizational chart current and synchronized across all modules[cite: 51].

---

## [cite_start]Performance Module [cite: 52]

### [cite_start]Description [cite: 53]

[cite_start]This module is designed to manage the complete employee appraisal (evaluation) cycle in a structured, transparent, and automated way[cite: 53]. [cite_start]Its main aim is to help HR teams, Department managers, and employees participate in fair and consistent performance evaluations that follow standardized rules and processes[cite: 54].

### [cite_start]Requirements, Dependencies, and Business Rules [cite: 55]

[cite_start]For the requirements of this subsystem, please check the **Performance sheet** in this file: **HR System Requirements file**[cite: 56].

### [cite_start]Performance Flow [cite: 57]

[cite_start]The Performance Appraisal Management Module manages the complete lifecycle of employee evaluations, ensuring a structured, fair, and transparent appraisal process[cite: 58]. [cite_start]It integrates multiple stages—from template creation to final archiving—while supporting collaboration between HR, managers, and employees[cite: 59].

- [cite_start]**Phase 1: Planning and Setup**: The process begins when the HR Manager defines standardized appraisal templates[cite: 60]. [cite_start]These templates establish the rating scales, evaluation criteria, and appraisal types (such as annual or probationary), which are then assigned to specific departments or organizational units[cite: 61]. [cite_start]After the templates are finalized, the HR Manager or HR Employee sets up the appraisal cycle, defining its duration, start and end dates, and assigning the appropriate templates to relevant managers[cite: 62]. [cite_start]The organizational structure data determines reviewer hierarchies and reporting lines for each employee[cite: 63].
- [cite_start]**Phase 2: Evaluation and Review**: During the active appraisal cycle, each Department Manager evaluates assigned employees using the approved templates[cite: 64]. [cite_start]The manager provides performance ratings, qualitative comments, and development recommendations[cite: 65]. [cite_start]Attendance and punctuality information from the Time Management module may also inform the assessment[cite: 66]. [cite_start]Throughout this phase, the HR Manager monitors progress through a centralized dashboard, ensuring timely completion of appraisals[cite: 67]. [cite_start]Once all evaluations are finalized, HR publishes the official results to employees[cite: 68].
- [cite_start]**Phase 3: Feedback and Acknowledgment**: Following publication, the Employee reviews their appraisal results, including performance ratings, comments, and development notes[cite: 69]. [cite_start]The system automatically saves the complete appraisal record within the employee profile, maintaining a historical record of performance outcomes for future reference and analytics[cite: 70].
- [cite_start]**Phase 4: Dispute and Resolution**: After receiving results, employees are granted a defined period to raise objections or appeal their evaluations[cite: 71]. [cite_start]If a dispute is submitted, it is routed to the HR Manager for review[cite: 72]. [cite_start]The HR Manager may either uphold the original assessment or adjust the final rating based on the justification provided[cite: 73]. [cite_start]Once resolved, the decision is logged and the finalized rating updated in the system[cite: 74].
- [cite_start]**Phase 5: Closure and Archiving**: When all evaluations and disputes are complete, the system automatically archives the finalized appraisal data[cite: 76]. [cite_start]Historical appraisal records become accessible for reference, reporting, and performance trend analysis[cite: 77]. [cite_start]This ensures long-term data integrity and supports evidence-based HR decision-making across appraisal cycles[cite: 78].

---

# [cite_start]Time Management Subsystem [cite: 79]

### [cite_start]Description [cite: 80]

[cite_start]This module automates scheduling, attendance tracking, and policy enforcement within the HR Management System[cite: 80].

### [cite_start]Requirements, Dependencies, and Business Rules [cite: 81]

[cite_start]For the requirements of this subsystem, please check the **Time Management sheet** in this file: **HR System Requirements file**[cite: 82].

### [cite_start]Time Management Flow [cite: 83]

[cite_start]The Time Management Module automates the administration of employee scheduling, attendance validation, and time-related exceptions[cite: 84]. [cite_start]It ensures accurate time data capture, compliance with working policies, and seamless integration with payroll and leave systems[cite: 85]. [cite_start]The process unfolds across several structured phases[cite: 86].

- [cite_start]**Phase 1: Shift Setup and Scheduling**: The process begins when the HR Manager or System Administrator defines standardized shift configurations such as normal, split, overnight, and rotational types[cite: 87]. [cite_start]These templates establish the foundation for all scheduling and attendance operations[cite: 88]. [cite_start]Once shift types are configured, the HR or System Administrator assigns them to employees individually or in bulk—by department or position—to ensure accurate coverage of all working hours[cite: 89]. [cite_start]Subsequently, the HR Manager defines custom scheduling rules, including flexible hours, rotational work patterns, or compressed workweeks, allowing the organization to adapt to diverse work arrangements[cite: 90]. [cite_start]The system then monitors shift expiry and triggers automated notifications to HR staff to renew or reassign shifts when required[cite: 91].
- [cite_start]**Phase 2: Attendance Recording and Validation**: During daily operations, each Employee records attendance through clock-in and clock-out actions validated against their assigned shift and rest-day schedule[cite: 92]. [cite_start]The system ensures that punches align with scheduled times and automatically generates attendance logs[cite: 93]. [cite_start]In cases of missing or invalid punches, the Line Manager (Head of Department) performs manual corrections to maintain data integrity[cite: 94]. [cite_start]The System Administrator also configures rules for flexible punch handling, defining whether multiple punches per day are allowed or whether only the first-in/last-out pattern applies[cite: 95]. [cite_start]Missed punch alerts are automatically sent to both employees and managers to prompt timely corrections[cite: 96].
- [cite_start]**Phase 3: Policy and Rule Enforcement**: The HR Manager configures policies for overtime, short time, and weekend work, including approval requirements and calculation logic[cite: 97]. [cite_start]Lateness rules are also defined—specifying thresholds, grace periods, and penalties that the system applies automatically[cite: 98]. [cite_start]Repeated lateness is monitored by the HR Administrator or Manager, allowing disciplinary actions or escalation when thresholds are exceeded[cite: 99]. [cite_start]Employees may submit attendance correction requests when discrepancies occur, which follow a structured approval workflow to ensure transparency and traceability[cite: 100].
- [cite_start]**Phase 4: Exception Handling and Workflow Approvals**: All time-related exceptions—such as corrections, permissions, or overtime requests—are reviewed by the Line Manager or HR Administrator[cite: 101]. [cite_start]The workflow supports approvals, rejections, or automatic escalation if pending beyond defined deadlines[cite: 103]. [cite_start]This phase ensures that only validated and approved time data proceeds to payroll processing[cite: 104]. [cite_start]Additionally, the System Administrator or HR Admin defines holiday calendars and weekly rest days, which are integrated with attendance logic to avoid false lateness or penalty triggers[cite: 105]. [cite_start]The HR Manager links employee vacation packages to attendance schedules to reflect leave automatically and maintain synchronized time-off records[cite: 106].
- [cite_start]**Phase 5: Integration, Reporting, and Payroll Closure**: Once attendance and exceptions are validated, the System or HR Administrator synchronizes all relevant data—attendance, overtime, and penalties—with the payroll and leave management systems[cite: 107]. [cite_start]This daily integration ensures that payroll runs use only accurate and approved data[cite: 108]. [cite_start]The HR Officer or Payroll Officer generates detailed reports on overtime, exceptions, and penalties for review, auditing, and compliance[cite: 109]. [cite_start]Before payroll closure, the system automatically escalates any pending time-related approvals to ensure that all records are finalized[cite: 110]. [cite_start]This guarantees accurate and complete payroll processing, closing the time management cycle for the period[cite: 111].

---

# [cite_start]Recruitment Subsystem [cite: 112]

## [cite_start]Recruitment Subsystem Description [cite: 113]

[cite_start]The Recruitment, Onboarding, Offboarding Subsystem manages the entire employee lifecycle, from attracting and hiring talent, through integrating new employees, to facilitating structured and compliant separations[cite: 114]. [cite_start]It ensures that hiring, onboarding, and exit processes are efficient, auditable, and integrated across HR, IT, and payroll systems[cite: 115]. [cite_start]The subsystem automates key HR activities, enhances candidate and employee experiences, and maintains compliance with organizational and legal standards[cite: 116]. [cite_start]By connecting recruitment pipelines to onboarding workflows and offboarding checklists, it guarantees data consistency, seamless transitions, and controlled access management throughout the employment journey[cite: 117]. [cite_start]This module is functionally divided into three core processes, which are tightly integrated with the Employee Profile, Organizational Structure and Payroll[cite: 118].

### [cite_start]Requirements [cite: 119]

[cite_start]For the requirements of this subsystem, please check the **Recruitment sheet** in this file: **HR System Requirements file**[cite: 120].

### [cite_start]Workflow Description [cite: 121]

[cite_start]The workflow represents the logical progression of activities through three interconnected phases[cite: 122]:

- [cite_start]**Phase 1: Recruitment (REC)**: This phase begins with job design and posting, progresses through candidate application, tracking, evaluation, and communication, and concludes with job offer generation and acceptance[cite: 123]. [cite_start]Successful offer acceptance automatically triggers pre-boarding tasks and transitions data to the Onboarding phase[cite: 124].
- [cite_start]**Phase 2: Onboarding (ONB)**: The onboarding phase focuses on transforming the accepted candidate into an active employee[cite: 125]. [cite_start]It includes creating onboarding task checklists, collecting documentation, provisioning access, assigning resources, and initiating payroll and benefits[cite: 126]. [cite_start]Automated notifications guide both HR teams and new hires to ensure readiness before Day 1[cite: 127].
- [cite_start]**Phase 3: Offboarding (OFF)**: This phase manages the structured and compliant exit of employees[cite: 128]. [cite_start]It covers resignation or termination initiation, clearance workflows, access revocation, and final settlements[cite: 129]. [cite_start]Integration with payroll, IT, and facilities ensures that all assets are recovered, benefits are closed, and access rights are securely revoked[cite: 131].

[cite_start]Together, these phases form a closed-loop lifecycle that supports continuous HR operations, linking recruitment decisions directly to onboarding preparation and offboarding compliance[cite: 132]. [cite_start]This ensures traceability, efficiency, and security across the entire employee journey[cite: 133].

---

# [cite_start]Leaves Subsystem [cite: 134]

## [cite_start]Leaves Subsystem Description [cite: 135]

[cite_start]The Leaves Management Module is a core component of the HR system designed to simplify and automate the full leave lifecycle for employees, managers, and HR personnel[cite: 136].

[cite_start]This module serves three primary functions[cite: 137]:

- [cite_start]**Policy Configuration and Compliance**: The system enables HR Administrators to define and manage all leave policies and entitlement structures[cite: 138]. [cite_start]This includes configuring specific leave types (such as Annual, Sick/Medical, Mission, and Marriage leave), setting eligibility rules, accrual rates, maximum carry-over caps, and defining public holidays and blocked days which are automatically considered in leave calculations[cite: 139].
- [cite_start]**Request and Approval Workflow**: Employees utilize a self-service portal to submit new leave requests, modify or cancel existing ones, and upload required supporting documents (e.g., doctor's notes for medical leave)[cite: 140]. [cite_start]Requests follow a multi-level approval chain, typically involving the Direct Manager and the HR Manager (who finalizes the request for compliance verification and can override a manager's decision if needed)[cite: 141].
- [cite_start]**Tracking and Integration**: The module provides real-time visibility for all users to track their current leave balance (Accrued, Taken, Remaining, Pending, Carry-over) and past leave history[cite: 142]. [cite_start]Upon final approval, the system automatically updates leave balances and syncs with the Time Management and Payroll modules to ensure accurate handling of salary deductions, adjustments, and final settlements, such as encashment of unused annual leave[cite: 143]. [cite_start]Managers are also able to monitor and flag irregular leave patterns for corrective action[cite: 144].

### [cite_start]Requirements [cite: 145]

[cite_start]For the requirements of this subsystem, please check the **Leaves sheet** in this file: **HR System Requirements file**[cite: 146].

### [cite_start]Leaves Management Subsystem Workflow [cite: 147]

[cite_start]This detailed workflow outlines the essential steps of the Leaves Management Subsystem, structured across Policy Setup, Request Management, and Monitoring[cite: 148].

- [cite_start]**Phase 1: Policy Configuration and Setup (HR Admin / System Admin)** [cite: 149]
  [cite_start]This foundational phase establishes all leave-related rules, entitlements, and workflows that govern the operation of the Leaves Module[cite: 150].
  1.  [cite_start]**Define Core Leave Types and Categories**: The HR Admin creates leave types such as Annual, Sick, Maternity, and Unpaid Leave (REQ-006), etc.[cite: 151, 152]. [cite_start]Each leave type is assigned a unique code and linked to its relevant category, indicating whether it should be deducted from the employee's annual balance or not[cite: 152].
  2.  [cite_start]**Configure Entitlement Rules**: The HR Admin configures entitlement rules (REQ-007)[cite: 153]. [cite_start]These define how many days an employee is eligible for, based on tenure, grade, or contract type, and must comply with the national labor law[cite: 153, 154]. [cite_start]Vacation Packages (BR 7) are set accordingly, and in some cases, personalized entitlements are assigned to individual employees[cite: 155].
  3.  [cite_start]**Define Accrual, Carry-over, and Reset Parameters**: The HR Admin defines accrual, carry-over, and reset parameters (REQ-003, REQ-040, REQ-041)[cite: 156]. [cite_start]Accrual rules specify whether leave days accumulate monthly, quarterly, or annually[cite: 157]. [cite_start]Importantly, accrual must pause during unpaid leave or suspension (BR 11)[cite: 158]. [cite_start]A criterion date (e.g., Hire Date or Work Receiving Date) is chosen for resetting leave balances each cycle[cite: 159].
  4.  [cite_start]**Configure Approval Workflows and System Integrations**: The System Admin configures approval workflows and system integrations (REQ-009)[cite: 160]. [cite_start]The multi-level approval chain is mapped according to each position in the organizational structure[cite: 161]. [cite_start]Additionally, each leave type is linked to corresponding payroll pay codes (BR 6), ensuring that once approved, leave data syncs automatically with both Payroll and Time Management (REQ-042)[cite: 162].
  5.  [cite_start]**Set Up Organizational Calendars and Blocked Days**: The HR Admin sets up organizational calendars and blocked days (REQ-010)[cite: 163]. [cite_start]National and company holidays are uploaded, and leave block periods are defined (BR 55)[cite: 164]. [cite_start]Leave durations are calculated net of non-working days, ensuring weekends and public holidays are excluded (BR 23)[cite: 165].
  - [cite_start]**Key Outcome**: A fully configured and policy-compliant foundation for leave management, integrating Payroll and Time systems[cite: 166].

- [cite_start]**Phase 2: Leave Request and Approval (Core Transaction Lifecycle)** [cite: 167]
  [cite_start]This phase represents the core transactional flow covering submission, validation, review, and final approval of a leave request[cite: 168].
  1.  [cite_start]**Employee Submission**: An employee submits a leave request (REQ-015)[cite: 169]. [cite_start]The employee selects the leave type, specifies the date range, provides justification, and attaches supporting documentation when required (for example, a medical certificate for sick leave exceeding one day (REQ-016))[cite: 170]. [cite_start]The system allows submission of post-leave requests within a maximum configured grace period (REQ-031)[cite: 171].
  2.  [cite_start]**System Validation**: The system automatically validates the request[cite: 172]. [cite_start]It checks eligibility (BR 8), available balance (BR 31), overlap with existing approved leaves, and potential team scheduling conflicts (BR 28, BR 31)[cite: 172]. [cite_start]If the total requested leave exceeds entitlement, the system either converts the excess to unpaid leave or blocks the request (BR 29)[cite: 173].
  3.  [cite_start]**Managerial Approval**: The request moves to the managerial approval stage[cite: 174]. [cite_start]It is routed to the employee's Line Manager (Department Head), in accordance with the reporting structure (REQ-020)[cite: 175]. [cite_start]The manager reviews and either approves or rejects the request (REQ-021/022)[cite: 176]. [cite_start]Delegation is possible during the manager's absence (REQ-023), and if no action is taken within 48 hours, the request auto-escalates (BR. 28)[cite: 177].
  4.  [cite_start]**HR Compliance Review and Finalization**: The HR Admin performs a compliance review (REQ-025)[cite: 178]. [cite_start]The HR Admin verifies that the request aligns with company policy, validates attached documents (REQ-028), and ensures cumulative limits such as maximum sick leave per year are respected (BR 41)[cite: 179]. [cite_start]In exceptional cases, HR has authority to override a manager's decision (REQ-026)[cite: 180].
  5.  [cite_start]**Synchronization and Notification**: The final step involves system-driven synchronization and notification (REQ-029, REQ-030, REQ-042)[cite: 181]. [cite_start]Once approved, the system updates the employee's leave balance in real time, notifies all stakeholders, blocks the employee's attendance record in the Time Management module, and adjusts payroll components accordingly[cite: 182]. [cite_start]If unapproved absences are later identified, HR may apply retroactive deductions from vacation balances (BR 19)[cite: 183].
  - [cite_start]**Key Outcome**: End-to-end digital handling of leave requests, ensuring compliance, transparency, and automated integration with Payroll and Time Management[cite: 184].

- [cite_start]**Phase 3: Tracking, Monitoring, and Auditing** [cite: 185]
  [cite_start]The final phase ensures ongoing accuracy, compliance, and traceability of all leave-related data[cite: 186].
  1.  [cite_start]**Continuous Accrual and Year-End Processing**: The system continuously accrues leave days for eligible employees (REQ-040), automatically adding them to balances based on employment type and length of service[cite: 187]. [cite_start]At the end of each cycle, the system executes year-end processing (REQ-041), applying carry-forward rules and ensuring caps (e.g., maximum 45 days) and expiry policies are enforced[cite: 188, 190].
  2.  [cite_start]**Manual Adjustments and Audit Trail**: When discrepancies or exceptional cases occur, HR Admins may perform manual adjustments (REQ-013)[cite: 191]. [cite_start]Every manual change is logged with timestamp, HR user ID, and justification to maintain a full audit trail (BR 17)[cite: 192].
  3.  [cite_start]**Final Settlement**: During employee offboarding or termination (OFF-013), HR ensures all remaining leave balances are settled[cite: 193]. [cite_start]Based on final settlement rules (BR 52), remaining days are either encashed or deducted[cite: 194]. [cite_start]The encashment follows the standard formula[cite: 194]:
      [cite_start]$$\text{Encashment Amount} = \text{Daily Salary Rate} \times \text{Number of Unused Leave Days (capped at 30)}$$ [cite: 195, 196]
  - [cite_start]**Key Outcome**: Continuous compliance monitoring and accurate leave reconciliation, ensuring integrity during audits and final settlements[cite: 197].

---

# [cite_start]Payroll Subsystems [cite: 198]

### [cite_start]Description [cite: 199]

[cite_start]The Payroll Module is a core component of the HR system that automates and secures the entire payroll process, from importing employee data and calculating salaries to managing deductions, benefits, and final disbursements[cite: 200]. [cite_start]It enables payroll administrators to ensure timely and accurate payments, compliance with tax and labor regulations, and seamless integration with accounting and banking systems[cite: 201]. [cite_start]Managers gain oversight through payroll summaries, approval workflows, and financial alignment, while employees access self-service features to view payslips, track earnings, and manage tax documents[cite: 202]. [cite_start]With built-in policy compliance, secure role-based access, automated notifications, audit trails, and comprehensive reporting, the module enhances accuracy, transparency, and efficiency in compensation management, supporting both employee satisfaction and institutional accountability[cite: 203].

> [cite_start]**Note**: Payroll is divided into three Subsystems, each of which is related to the other, so make sure to carefully read them to understand the flow[cite: 204].

### [cite_start]Requirements, Dependencies, and Business Rules [cite: 205]

[cite_start]For the requirements of this subsystem, please check the **Payroll sheet** in this file: **HR System Requirements file**[cite: 206].

## [cite_start]Payroll Configuration & Policy Setup subSystem [cite: 207]

### [cite_start]Description [cite: 208]

[cite_start]This business process covers the initial and ongoing setup of payroll rules, ensuring that the system reflects the organization's compensation structure, benefits policies, and statutory requirements[cite: 209]. [cite_start]It includes defining salary structures based on employee contract types, setting up allowances and deductions (such as transportation, taxes, and insurance), and configuring rules for unpaid leave, misconduct penalties[cite: 210]. [cite_start]Legal and policy requirements must also be embedded into the system, ensuring compliance with tax codes, labor laws, and organizational regulations[cite: 211]. [cite_start]The system should support role-based access, allowing authorized payroll administrators to configure rules while restricting sensitive data[cite: 212]. [cite_start]This setup use case establishes the foundation upon which accurate and compliant payroll execution can occur[cite: 212].

[cite_start]This epic establishes the foundation of the payroll system[cite: 213]. [cite_start]It focuses on configuring company-level policies, salary structures, legal rules, and system settings that control every subsequent payroll calculation[cite: 214]. [cite_start]The epic progresses through phases that begin with defining organizational parameters, then expand into taxation, benefits, and compliance automation[cite: 215, 216]. [cite_start]Each phase builds toward a secure, fully validated environment where every configuration is audit-logged and policy-enforced[cite: 217].

### [cite_start]Workflow [cite: 218]

[cite_start]This epic defines all payroll rules, pay structures, and compliance settings that govern salary calculations[cite: 219]. [cite_start]It progresses through five key phases to ensure data integrity, approval control, and legal compliance before execution begins[cite: 220].

- [cite_start]**Phase 1 - Define Structure**: Payroll Specialist configures core elements: pay types, allowances, signing bonuses, and resignation/termination benefits [cite: 221][cite_start]. policies, pay grades[cite: 222].
- [cite_start]**Phase 2 Embed Compliance**: Legal Admin adds tax rules, updates legal changes, and Payroll Specialist set insurance brackets to enforce labor-law compliance[cite: 223].
- [cite_start]**Phase 3- Configure System**: System Admin defines company-wide settings and backup routines to secure configuration data[cite: 224].
- [cite_start]**Phase 4 Approve Configuration**: Payroll Manager reviews and approves or rejects all configurations settings including system admin ones or changes before activation[cite: 225].
- [cite_start]**Phase 5-HR Oversight**: HR Manager reviews, approves or rejects, updates and deletes insurance rules to reflect new policies[cite: 226].

[cite_start]**Outcome**: All payroll setup data becomes validated, version-controlled, and ready for the Payroll Processing epic, ensuring every salary run follows authorized and compliant configurations[cite: 227].

## [cite_start]Payroll Processing & Execution subSystem [cite: 228]

### [cite_start]Description [cite: 229]

[cite_start]This business process governs the monthly or periodic operation of payroll, where employee data is processed into finalized salaries[cite: 230]. [cite_start]Payroll specialists initiate payroll runs, which get gross salary from pay grades, apply all configured deductions (taxes, insurance, penalties), and produce net salaries[cite: 231]. [cite_start]The system must allow simulations of payroll results before confirmation, enabling the payroll manager to identify anomalies (missing bank account, etc) and make corrections prior to execution[cite: 232]. [cite_start]Once validated, the payroll batch can be locked, approved, and passed on for payment processing[cite: 233]. [cite_start]The system should flag exceptions, such as payment failures, retroactive adjustments, or disputed payslips, while maintaining full traceability of actions taken[cite: 234]. [cite_start]Security controls ensure that only authorized personnel can finalize or execute payroll runs, and that data integrity is protected throughout the process[cite: 235]. [cite_start]This use case ensures that salaries are processed accurately, on time, and in full compliance with both company policies and external regulations[cite: 236].

[cite_start]This epic operationalizes the configured rules into actual salary calculations[cite: 237]. [cite_start]It manages end-to-end payroll execution: from initiation, simulation, and validation to final approvals and disbursement[cite: 238]. [cite_start]The workflow evolves through structured phases that add automation, approval layers, and exception handling to ensure every payment is correct, auditable, and timely[cite: 239].

### [cite_start]Workflow [cite: 240]

[cite_start]This epic governs the monthly payroll cycle, converting configured data into finalized salary payments[cite: 241]. [cite_start]It covers initiation, validation, approvals, execution, and exception handling to ensure accurate, timely, and compliant payroll processing[cite: 242]. [cite_start]All operations are traceable, multi-level approved, and aligned with legal and financial controls[cite: 243].

- [cite_start]**Phase 0 Pre-Run Reviews & Approvals**: Payroll Specialists review, edit and approve or reject any pending signing bonuses, resignation, and termination benefits before starting payroll initiation to ensure input data integrity[cite: 245].
- [cite_start]**Phase 1 Payroll Initiation**: Payroll Specialists review the payroll period to approve or reject it to ensure it matches the current cycle[cite: 246]. [cite_start]In case of rejection, they can manually edit the period and restart the initiation[cite: 247]. [cite_start]If approved, Payroll Specialists can directly start payroll initiation[cite: 248].
- [cite_start]**Phase 1.1 - Payroll Draft Generation**: The goal of this phase is to generate a draft version of the payroll run[cite: 249]. [cite_start]It consists of three sub-phases[cite: 250]:
  - [cite_start]**Phase 1.1.A - Fetching Employees and Checking HR Events**: The system fetches employees by department and checks for HR events (normal, new hire, resignation, termination)[cite: 251]. [cite_start]For newly hired employees, signing bonuses are processed in their calculation, while for resigned or terminated employees, termination and resignation benefits are included accordingly[cite: 252].
  - [cite_start]**Phase 1.1.B Salary Calculations**: The goal of this phase is to calculate the net salary after applying penalties if applicable, based on the employee's pay grade[cite: 253].
    - It starts by calculating deductions as:
      [cite_start]$$\text{Net Salary} = \text{Gross (from Pay Grade)} - \text{Taxes} - \text{Insurance}$$ [cite: 254, 255]
    - Then, the final paid salary is calculated as:
      [cite_start]$$\text{Final Salary} = \text{Net} - \text{Penalties (missing hours, unpaid days, etc.)}$$ [cite: 256, 257]
  - [cite_start]**Phase 1.1.C - Draft Generation**: The draft payroll is then generated with all details and full breakdowns[cite: 258].
- [cite_start]**Phase 2 Payroll Draft Review**: The goal of this phase is for the system to automatically flag anomalies such as missing bank details or negative net pay for correction[cite: 259]. [cite_start]The payroll run status becomes **Under Review**[cite: 260].
- [cite_start]**Phase 3 Review & Approval**: The goal of this phase is to close the payroll cycle through a hierarchy of approvals[cite: 261].
  1.  [cite_start]Payroll Specialists review the **Under Review** payroll in the preview dashboard and publish it for Payroll Manager and Finance Staff review and approval[cite: 262].
  2.  [cite_start]Payroll Manager reviews the payroll and resolves any exceptions[cite: 263]. [cite_start]If approved, the status changes to **Waiting Finance Staff Approval**[cite: 263]. [cite_start]In case of rejection, the manager must specify a reason, and Payroll Specialists are notified to restart the cycle after manual adjustments[cite: 264].
  3.  [cite_start]Finance Staff then review the payroll[cite: 265]. [cite_start]If approved, Payroll Manager is notified to lock/freeze the payroll cycle and payment status is **Paid now**[cite: 265]. [cite_start]In case of rejection, Finance Staff must specify a reason, and Payroll Specialists are notified to restart the cycle after adjustments[cite: 266].
  4.  [cite_start]Payroll Manager can exceptionally unfreeze a payroll cycle by entering a justification[cite: 267].
- [cite_start]**Phase 5 Execution**: Upon approval, Payroll Specialists allow the system to automatically generate and distribute detailed payslips according to the defined business rules[cite: 268].

[cite_start]**Outcome**: Payroll data transitions from configured rules to approved, auditable payments[cite: 269]. [cite_start]The process enforces multi-level authorization, legal compliance, and seamless integration with financial subsystems, ensuring accurate and traceable salary disbursements every cycle[cite: 270].

## [cite_start]Payroll Tracking, Transparency & Employee Self-Service subSystem [cite: 271]

### [cite_start]Description [cite: 272]

[cite_start]This business process focuses on employee-facing and oversight features, ensuring transparency, accessibility, and trust in the payroll system[cite: 273]. [cite_start]Employees must be able to securely access their payslips online, with detailed breakdowns of salary components, deductions, and adjustments[cite: 274]. [cite_start]They should also be able to track status of their payroll[cite: 275]. [cite_start]Additionally, the system should allow employees to download historical payslips, generate tax or insurance certificates, and submit inquiries or disputes related to their salary[cite: 276, 277].

[cite_start]This business process closes the loop by empowering employees, enhancing transparency, and embedding compliance oversight into the payroll lifecycle[cite: 278].

### [cite_start]Workflow [cite: 279]

[cite_start]This epic focuses on transparency, employee empowerment, and financial accountability[cite: 280]. [cite_start]It allows employees to access payslips, submit claims, and view deductions while enabling Payroll, Finance, and HR teams to approve, refund, and audit these activities[cite: 281].

- [cite_start]**Phase 1 Employee Self-Service**: Employees can view and download payslips, check payslip status, and see details such as base salary, leave compensation, transportation allowances, tax and insurance deductions, and other itemized contributions or penalties[cite: 282]. [cite_start]They can also view historical salary records, download tax documents, dispute payroll errors, submit reimbursement claims and track claim and dispute status[cite: 283].
- [cite_start]**Phase 2 Operational Reports**: Payroll specialists generate reports by department, Finance Staff produce month-end and year-end summaries, and compile reports on taxes, insurance contributions, and benefits[cite: 284]. [cite_start]These outputs support compliance, cost allocation, and overall payroll performance evaluation[cite: 285].
- [cite_start]**Phase 3 Disputes and Claim Approval/Rejection**: Payroll Specialists review and approve or reject employee disputes and expense claims[cite: 286]. [cite_start]Payroll Managers confirm approvals, while Finance staff are notified of approved records for visibility and further processing[cite: 287].
- [cite_start]**Phase 4 Refund Process**: Finance staff generate refunds for approved disputes and expense claims[cite: 288]. [cite_start]This ensures employees receive reimbursements or corrections automatically in the next payroll cycle, maintaining accountability and audit readiness[cite: 289].

[cite_start]**Outcome**: The workflow establishes a transparent, employee-centric payroll ecosystem[cite: 290]. [cite_start]Employees gain full visibility over their earnings and deductions, while Payroll and Finance teams maintain efficient approval chains, automated refunds, and accurate reporting for compliance and auditing[cite: 290].

---

# [cite_start]Timeline [cite: 292]

- [cite_start]**Milestone 1 (Week 1) Deadline: 17/11/2025** [cite: 293]
  - [cite_start]Set up project structure and design database schema (Models)[cite: 294].
  - [cite_start]Integration Foundation: Each subsystem should effectively communicate with the other dependent subsystems (whether in or out dependency) through dummy data[cite: 295].
- [cite_start]**Milestone 2 (Weeks 2-3) Deadline: 1/12/2025** [cite: 296]
  - [cite_start]Develop the back-end of the application[cite: 297].
- [cite_start]**Milestone 3 (Weeks 4-5) Deadline: 15/12/2025** [cite: 297]
  - [cite_start]Develop the front-end and deploy the application[cite: 298].

[cite_start]Each submission will have its own form and you will be notified with the exact dates through notification system[cite: 299].

# [cite_start]Technology Stack [cite: 300]

- [cite_start]**Frontend**: Nextjs with Typescript[cite: 301].
- [cite_start]**Backend**: Nestjs with Typescript[cite: 302].
- [cite_start]**Database**: MongoDB[cite: 303].
- [cite_start]**Authentication**: JSON Web Tokens (JWT)[cite: 304].
- [cite_start]**Infrastructure**: Deploy on cloud services like Heroku or vercel[cite: 305].
- [cite_start]**Backend-Frontend Integration**: Axios is suggested[cite: 306].

# [cite_start]Deliverables [cite: 307]

- [cite_start]Fully functional HR Management software application deployed to a cloud platform[cite: 308].
- [cite_start]Source code on GitHub with history and branch for each feature[cite: 309].
  - [cite_start]Kindly note that each subsystem will have its own github repo[cite: 310].

---
