# Payroll Business Rules

This document outlines the core business rules that govern payroll logic, compliance, and calculations for the requirements listed in Payroll-System-Req.

## Business Rules Overview

### Business Rules Table

| BR ID | Business Rule Description |
|-------|---------------------------|
| BR 1 | The system must require an active employment contract with a defined role, type (full-time, part-time, hourly, commission-based, etc.), start/end dates, and salary basis before payroll can be processed. Local labor law (Egyptian labor law 2025) must be followed. |
| BR 2 | The system must calculate base salary according to contract terms and role type. |
| BR 3 | Payroll must be processed within defined cycles (monthly, etc.) per contract or region following the local laws. |
| BR 4 | The system must identify the minimum salary bracket(s) enforced through Local Labor Law. |
| BR 5 | The system must identify the payroll income taxes' brackets enforced through Local Tax Law. |
| BR 6 | The system must support multiple tax components (e.g., income tax, exemptions). |
| BR 7 | The system must identify the social insurances' brackets enforced through Social Insurance and Pensions Law. |
| BR 8 | The system must calculate employee and employer social insurance contributions according to the local Social Insurance and Pensions Law, with contribution percentages configurable. The same applies for state-based Health Insurance. **Formulas:** Employee Insurance = GrossSalary × employee_percentage; Employer Insurance = GrossSalary × employer_percentage |
| BR 9 | Payroll Structure must support base pay, allowances, deductions, and other variable pay elements. |
| BR 10 | The system allows for multiple pay scales configurable by grade, department, or location. |
| BR 11 | The system must deduct pay for unpaid leave days based on daily/hourly salary calculations. |
| BR 17 | An auto-generated Payslip should be available through the system with a clear breakdown of components. |
| BR 18 | Payroll results must be reviewed by finance before payment file generation. |
| BR 20 | All payroll records must support local tax law customization (i.e., as per Egyptian labor law 2025 and other laws' requirements). |
| BR 23 | The system must support issuing reports about standard payroll summary, tax reports, and pay slip history. |
| BR 24 | Signing bonuses must be processed only for employees flagged as eligible in their contracts (linked through Employee Profile). |
| BR 25 | Any manual overrides for signing bonuses must require authorization. |
| BR 26 | Termination benefits must not be processed until HR clearance and final approvals are completed. |
| BR 27 | Manual adjustments to termination payouts must require Payroll Specialist approval and full system logging. |
| BR 28 | The system must ensure a signing bonus is disbursed only once unless explicitly authorized. |
| BR 29 | Upon employee termination, the system must automatically calculate termination-related entitlements (e.g., severance pay, end-of-service gratuity, pending compensation) according to contract and local labor law. |
| BR 30 | Payroll processing must support multi-step approval workflow: Payroll Specialist → Payroll Manager → Finance Department. |
| BR 31 | The system needs a breakdown of logic: **A. Payroll Area:** Batch of people for which payroll runs at the same time. **B. Payroll Schemas:** Set of rules and operations defining how payroll is processed. **Formula:** Net Salary = Gross Salary (base pay + allowances) – Taxes – Social/Health Insurance – Other Deductions |
| BR 33 | The system must apply deductions for misconduct penalties (e.g., lateness, asset damage, disciplinary actions) as configured by HR policy, consistent with Egyptian laws. |
| BR 34 | The system must ensure all deductions (taxes, insurance, penalties, unpaid leave, recovery) are applied after gross salary calculation and before net salary. |
| BR 35 | The system must calculate net salary as: Gross Salary – Taxes (Tax = % of Base Salary) – Social/Health Insurance. |
| BR 36 | The system must store all calculation elements (salary base, allowances, taxes, deductions) for auditability and compliance. |
| BR 38 | The system must allow defining allowances with multiple types as part of employment contracts and add them to payroll as part of gross salary, defined per role or contract. |
| BR 39 | Allowance Structure must support and track different types (e.g., transportation, housing, meals, etc.). |
| BR 46 | Employees are enrolled by default to allowances, insurance, and taxes during onboarding or annual enrollment window. |
| BR 56 | The system must support signing bonuses as a distinct payroll component, configurable by contract terms, and subject to approval workflows. Upon employee resignation, the system must automatically calculate: resignation-related entitlements (e.g., accrued leave payout, service completion benefits) and end-of-service benefits according to company policy and labor law. |
| BR 59 | The system must generate gross-to-net breakdown reports for employees and management to validate calculations. |
| BR 60 | Misconduct penalties must not reduce salary below statutory minimum wages. |
| BR 63 | Any payroll initiation or modification (automatic or manual) must go through validation checks (e.g., contract active, no expired approvals, minimum wage compliance) before processing. |
| BR 64 | The system needs to be linked to the organization's and employees' accounts to facilitate payroll processing. |
| BR 66 | Payroll must not be processed if an employee's contract is expired, inactive, or suspended. |

---

## Integration Logic

This section defines how the Payroll module interacts with other HR modules to satisfy the Business Rules above.

### Leaves Module

| Integration Point | Description |
|------------------|-------------|
| Unapproved Leaves | Handles cases of unapproved leaves for deduction calculations. |
| Leave Encashment | Calculates encashment of unused annual leave balance for termination/resignation. |
| Carry-Forward Logic | Manages carry-forward logic for leaves or conversion to compensation (aligned with Egyptian Labor Law 2025). |
| Payroll Deductions | Feeds paid/unpaid leave status to payroll for automatic deductions. |

### Time Management

| Integration Point | Description |
|------------------|-------------|
| Working Hours | Provides working days/hours data for salary calculations. |
| Overtime & Absence | Feeds overtime and absence data directly for salary calculation. |

### Onboarding, Recruitment & Offboarding

| Integration Point | Description |
|------------------|-------------|
| Sign-on Bonuses | Source for sign-on bonuses during onboarding. |
| Severance Pay | Source for severance pay and resignation/termination entitlements. |
| Resignation/Termination | Provides information for calculating exit benefits. |

### Employee Profile Module

| Integration Point | Description |
|------------------|-------------|
| Employment Contracts | Links to employee contracts (base salary, role type). |
| Salary Updates | Auto-updates salary/payroll data when contract changes occur. |
| Role Information | Provides role-based compensation details. |
