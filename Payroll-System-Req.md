# Payroll System Requirements

## Module A: Payroll Configuration & Policy Setup

| Phase | Requirement Name | ID | Inputs Needed | Downstream / Outputs |
|-------|------------------|-----|---------------|----------------------|
| 1. Define Structure | Payroll policies configuration (Create, Edit, View) - Status: Draft | REQ-PY-1 | N/A | N/A |
| | Pay grades (Position, Gross Salary = base Pay + allowances) configuration (Create, Edit, View) - Status: Draft | REQ-PY-2 | Org Structure (Job Grade/Band) | N/A |
| | Pay types configuration (Create, Edit, View) - Status: Draft | REQ-PY-5 | N/A | N/A |
| | Allowance configuration (Create, Edit, View) - Status: Draft | REQ-PY-7 | N/A | N/A |
| | Signing Bonuses and Payroll initiation configuration (Create, Edit, View) - Status: Draft | REQ-PY-19 | Onboarding (Contract details) | Onboarding |
| | Resignation/Termination compensations, benefits, and terms configuration (Create, Edit, View) - Status: Draft | REQ-PY-20 | Offboarding (Severance rules) | Offboarding |
| 2. Embed Compliance | Tax rules and laws (progressive rates, exemptions, thresholds) configuration (Create, View) - Status: Draft | REQ-PY-10 | N/A | N/A |
| | Legal rules update when laws change (Edit) | REQ-PY-12 | N/A | N/A |
| | Insurance brackets configuration with defined salary ranges and contribution percentages (Create, Edit, View) - Status: Draft | REQ-PY-21 | N/A | N/A |
| 3. Configure System | Company-wide settings configuration (pay dates, time zone, currency) (Create, Edit, View) - Status: Draft | REQ-PY-15 | N/A | N/A |
| | Back up data regularly | REQ-PY-16 | N/A | N/A |
| 4. Approve Config | Payroll System configuration approval/rejection (View, Edit, Approve/Reject, Delete) Excluding insurance & company-wide settings | REQ-PY-18 | N/A | N/A |
| 5. HR Oversight | Review and update insurance brackets configuration (Approve/Reject, Edit, View, Delete) | REQ-PY-22 | N/A | N/A |

---

## Module B: Payroll Execution

| Phase | Requirement Name | ID | Inputs Needed |
|-------|------------------|-----|---------------|
| 0. Pre-Run Reviews | Signing bonus review (Approve or Reject) | REQ-PY-28 | N/A |
| | Signing bonus edit | REQ-PY-29 | N/A |
| | Termination and Resignation benefits review (Approve or Reject) | REQ-PY-31 | N/A |
| | Termination and Resignation benefits edit | REQ-PY-32 | N/A |
| 1. Initiate Run | Review Payroll period (Approve or Reject) | REQ-PY-24 | N/A |
| | Edit payroll initiation (period) if rejected | REQ-PY-26 | N/A |
| | Start Automatic processing of payroll initiation | REQ-PY-23 | N/A |
| 1.1. Draft Gen | Payroll Draft Generation | REQ-PY-1 | N/A |
| 1.1.A Fetch Data | Check HR Events (New hire, termination, resigned) | REQ-PY-2 | N/A |
| | Auto processes signing bonus in case of new hire | REQ-PY-27 | Onboarding (Bonus flag) |
| | Auto process resignation and termination benefits | REQ-PY-30 | Offboarding (Resignation status) |
| 1.1.B Calculation | Deductions calculations (Taxes, Insurance) | REQ-PY-3 | N/A |
| | Salary calculation (Net = Gross - Deductions - Penalties + Refunds) | REQ-PY-3 | Time Mgmt (Working hours/OT), Leaves |
| 1.1.C Draft File | Draft generation | REQ-PY-4 | N/A |
| 2. Exceptions | Flag irregularities (sudden spikes, missing accounts, negative net pay) | REQ-PY-5 | N/A |
| 3. Review/Approval | Payroll specialist Review system-generated results in dashboard | REQ-PY-6 | N/A |
| | Manager and finance send for approval (publish) | REQ-PY-12 | N/A |
| | Payroll Manager Review draft & Resolve escalated irregularities | REQ-PY-20 | N/A |
| | Payroll Manager Approval before distribution approval | REQ-PY-22 | N/A |
| | Finance staff Approval payroll distribution (Payment Status: Paid) | REQ-PY-15 | N/A |
| | Payroll Manager view, lock and freeze finalized payroll | REQ-PY-7 | N/A |
| | Payroll Manager unfreeze payrolls after entering reason | REQ-PY-19 | N/A |
| 4. Payslips | System automatically generate and distribute employee payslips | REQ-PY-8 | N/A |

## Module C: Payroll Tracking

| Phase | Requirement Name | ID | Inputs Needed |
|-------|------------------|-----|---------------|
| 1. ESS | View and download payslip online | REQ-PY-1 | N/A |
| | View status and details of payslips | REQ-PY-2 | N/A |
| | View base salary according to employment contract | REQ-PY-3 | Employee Profile |
| | View compensation for unused leave days | REQ-PY-5 | Leaves (Encashment) |
| | View transportation or commuting compensation | REQ-PY-7 | N/A |
| | View detailed tax deductions with rule applied | REQ-PY-8 | N/A |
| | View insurance deductions itemized | REQ-PY-9 | N/A |
| | View salary deductions due to misconduct/absenteeism | REQ-PY-10 | Time Mgmt (Absenteeism) |
| | View deductions for unpaid leave day | REQ-PY-11 | Leaves (Unpaid) |
| | View salary history | REQ-PY-13 | N/A |
| | View employer contributions | REQ-PY-14 | N/A |
| | Download tax documents | REQ-PY-15 | N/A |
| | Dispute payroll errors | REQ-PY-16 | N/A |
| | Submit expense reimbursement claims | REQ-PY-17 | N/A |
| | Track approval/payment status of claims/disputes | REQ-PY-18 | N/A |
| 2. Reports | Generate payroll reports by department | REQ-PY-38 | Org Structure (Cost Center) |
| | Generate month-end and year-end payroll summaries | REQ-PY-29 | N/A |
| | Generate reports about taxes, insurance, benefits | REQ-PY-25 | N/A |
| 3. Disputes | Payroll Specialist view, Approve/Reject Disputes | REQ-PY-39 | N/A |
| | Payroll Manager confirm Dispute Approval (Multi-step) | REQ-PY-40 | N/A |
| | Finance staff notification of approved Dispute | REQ-PY-41 | N/A |
| | Payroll Specialist view, Approve/Reject Expense claims | REQ-PY-42 | N/A |
| | Payroll Manager confirm Expense claims Approval | REQ-PY-43 | N/A |
| | Finance staff notification of approved Expense claims | REQ-PY-44 | N/A |
| 4. Refunds | Generate refund for Disputes on approval | REQ-PY-45 | N/A |
| | Generate refund for Expense claims on approval | REQ-PY-46 | N/A |


---
---

## User Stories

## Configuration & Policy Setup

    REQ-PY-1: As a Payroll Specialist, I want to configure company-level payroll policies (e.g., basic salary types, misconduct penalties, leave policies, allowance) so that the system enforces organizational rules consistently. (create draft, edit draft, view all)

    REQ-PY-2: As a Payroll Specialist, I want to define pay grades, salary, and compensation limits so that managers and payroll specialists cannot exceed policy boundaries.

    REQ-PY-5: As a Payroll Specialist, I want the system to define employee pay types (hourly, daily, weekly, monthly, contract-based) so that salaries are calculated according to the employment agreement.

    REQ-PY-7: As a Payroll Specialist, I want to set allowances (e.g., transportation, housing, etc) so that employees are rewarded for special conditions.

    REQ-PY-10: As a legal & policy admin, I want to define tax rules and laws in the system (e.g., progressive tax rates, exemptions, thresholds) so that payroll always complies with current legislation.

    REQ-PY-12: As a legal & policy admin, I want to update legal rules when laws change, so that future payroll cycles are compliant without manual intervention.

    REQ-PY-15: As a System Admin, I want to set company-wide settings (like pay dates, time zone, and currency) so payroll runs correctly.

    REQ-PY-16: As a System Admin, I want to back up data regularly so nothing is lost.

    REQ-PY-18: As a Payroll Manager, I want to approve payroll module configuration changes so that no unauthorized adjustments impact payroll calculations.

    REQ-PY-19: As a Payroll Specialist, I want to configure policies for signing bonuses, so that new hires are seamlessly incorporated into the company’s payroll system.

    REQ-PY-20: As a Payroll Specialist, I want to configure resignation and termination benefits and their terms, so that the offboarding process for employees is seamless and legally compliant.

    REQ-PY-21: As a Payroll Specialist, I want to configure insurance brackets with defined salary ranges and contribution percentages, so that the system automatically applies the correct insurance deductions.

    REQ-PY-22: As an HR Manager, I want to review and update insurance bracket configurations when policies or regulations change, so that payroll calculations remain accurate.

## Processing & Execution

    REQ-PY-1: As a Payroll Specialist, I want the system to automatically calculate salaries, allowances, deductions, and contributions based on configured rules so that I don’t need to run calculations manually.

    REQ-PY-2: As a Payroll Specialist, I want the system to calculate prorated salaries (for mid-month hires, terminations) so that payments are accurate for partial periods.

    REQ-PY-3: As a Payroll Specialist, I want the system to auto-apply statutory rules (income tax, pension, insurance) so that compliance is ensured without manual intervention.

    REQ-PY-4: As a Payroll Specialist, I want the system to generate draft payroll runs automatically at the end of each cycle so that I only need to review.

    REQ-PY-5: As a Payroll Specialist, I want the system to flag irregularities (e.g., sudden salary spikes, missing bank accounts, negative net pay) so that I can take required action.

    REQ-PY-6: As a Payroll Specialist, I want to review system-generated payroll results in a preview dashboard so that I can confirm accuracy before finalization.

    REQ-PY-7: As a Payroll Manager, I want to lock or freeze finalized payroll runs so that no unauthorized retroactive changes are made.

    REQ-PY-8: As a Payroll Specialist, I want to allow the system to automatically generate and distribute employee payslips so that staff can access their salary details securely.

    REQ-PY-12: As a Payroll Specialist, I want to send the payroll run for approval to Manager and Finance before finalization.

    REQ-PY-15: As Finance Staff, I want to approve payroll disbursements before execution, so that no incorrect payments are made.

    REQ-PY-19: As a Payroll Manager, I want the authority to unfreeze payrolls and give reason under exceptional circumstances.

    REQ-PY-20: As a Payroll Manager, I want to resolve escalated irregularities reported by Payroll Specialists.

    REQ-PY-22: As a Payroll Manager, I want to approve payroll runs so that validation is ensured at the managerial level prior to distribution.

    REQ-PY-23: As a Payroll Specialist, I want the system to automatically process payroll initiation.

    REQ-PY-24: As a Payroll Specialist, I want to review and approve processed payroll initiation.

    REQ-PY-26: As a Payroll Specialist, I want to manually edit payroll initiation when needed.

    REQ-PY-27: As a Payroll Specialist, I want the system to automatically process signing bonuses.

    REQ-PY-28: As a Payroll Specialist, I want to review and approve processed signing bonuses.

    REQ-PY-29: As a Payroll Specialist, I want to manually edit signing bonuses when needed.

    REQ-PY-30: As a Payroll Specialist, I want the system to automatically process benefits upon resignation.

    REQ-PY-31: As a Payroll Specialist, I want to review and approve processed benefits upon resignation.

    REQ-PY-32: As a Payroll Specialist, I want to manually edit benefits upon resignation when needed.

    REQ-PY-33: As a Payroll Specialist, I want the system to automatically process benefits upon termination.

## Tracking, Transparency & Self-Service

    REQ-PY-1: As an Employee, I want to view and download my payslip online so that I can see my monthly salary.

    REQ-PY-2: As an Employee, I want to see status and details of my payslip (paid, disputed) so that I know exactly where my salary is in the payroll process.

    REQ-PY-3: As an Employee, I want to see my base salary according to my employment contract.

    REQ-PY-5: As an Employee, I want to see compensation for unused or encashed leave days.

    REQ-PY-7: As an Employee, I want to see transportation or commuting compensation.

    REQ-PY-8: As an Employee, I want to see detailed tax deductions along with the law or rule applied.

    REQ-PY-9: As an Employee, I want to see insurance deductions itemized.

    REQ-PY-10: As an Employee, I want to see any salary deductions due to misconduct or unapproved absenteeism.

    REQ-PY-11: As an Employee, I want to see deductions for unpaid leave days.

    REQ-PY-13: As an Employee, I want to access my salary history.

    REQ-PY-14: As an Employee, I want to view employer contributions (insurance, pension, allowances).

    REQ-PY-15: As an Employee, I want to download tax documents.

    REQ-PY-16: As an Employee, I want to dispute payroll errors (like over-deductions or missing bonuses).

    REQ-PY-17: As an Employee, I want to submit expense reimbursement claims.

    REQ-PY-18: As an Employee, I want to track the approval and payment status of my claims and disputes.

    REQ-PY-25: As Finance Staff, I want to generate reports about taxes, insurance contributions, and benefits.

    REQ-PY-29: As Finance Staff, I want to generate month-end and year-end payroll summaries.

    REQ-PY-38: As a Payroll Specialist, I want to generate payroll reports by department.

    REQ-PY-39: As Payroll specialist, I want to approve/reject Disputes, so that it can be escalated to payroll manager.

    REQ-PY-40: As Payroll Manager, I want to confirm approval of Disputes, so that finance staff can be notified.

    REQ-PY-41: As Finance staff, I want to view and get notified with approved Disputes, so that adjustments can be done.

    REQ-PY-42: As Payroll specialist, I want to approve/reject expense claims.

    REQ-PY-43: As Payroll Manager, I want to confirm approval of expense claims.

    REQ-PY-44: As Finance staff, I want to view and get notified with approved expense claims.

    REQ-PY-45: As Finance staff I want to generate refund for Disputes on approval so that it will be included in next payroll cycle.

    REQ-PY-46: As Finance staff, I want to generate refund for Expense claims on approval so that it will be included in next payroll cycle.
