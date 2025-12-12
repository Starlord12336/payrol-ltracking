# User Credentials for Testing

All users are seeded with the same password: **Password123!**

## Candidate

- **Email:** candidate@test.com
- **Password:** Password123!
- **Role:** Job Candidate
- **Type:** Candidate

## Employees

### 1. System Administrator
- **Email:** system.admin@test.com
- **Password:** Password123!
- **Role:** System Admin
- **Type:** Employee

### 2. HR Administrator
- **Email:** hr.admin@test.com
- **Password:** Password123!
- **Role:** HR Admin
- **Type:** Employee

### 3. HR Manager
- **Email:** hr.manager@test.com
- **Password:** Password123!
- **Role:** HR Manager
- **Type:** Employee

### 4. HR Employee
- **Email:** hr.employee@test.com
- **Password:** Password123!
- **Role:** HR Employee
- **Type:** Employee

### 5. Department Head
- **Email:** dept.head@test.com
- **Password:** Password123!
- **Role:** department head
- **Type:** Employee

### 6. Department Employee
- **Email:** dept.employee@test.com
- **Password:** Password123!
- **Role:** department employee
- **Type:** Employee

### 7. Payroll Specialist
- **Email:** payroll.specialist@test.com
- **Password:** Password123!
- **Role:** Payroll Specialist
- **Type:** Employee

### 8. Payroll Manager
- **Email:** payroll.manager@test.com
- **Password:** Password123!
- **Role:** Payroll Manager
- **Type:** Employee

### 9. Recruiter
- **Email:** recruiter@test.com
- **Password:** Password123!
- **Role:** Recruiter
- **Type:** Employee

### 10. Finance Staff
- **Email:** finance.staff@test.com
- **Password:** Password123!
- **Role:** Finance Staff
- **Type:** Employee

### 11. Legal & Policy Admin
- **Email:** legal.admin@test.com
- **Password:** Password123!
- **Role:** Legal & Policy Admin
- **Type:** Employee

---

## Running the Seed

```bash
# Make sure your MongoDB connection string is set in .env or update MONGODB_URI in seed-users.ts
npm run seed:users
```

Or manually:

```bash
ts-node -r tsconfig-paths/register src/seeds/seed-users.ts
```

---

## Notes

- All users have unique national IDs
- All employees have status: ACTIVE
- All employees have contract type: FULL_TIME_CONTRACT
- All employees have work type: FULL_TIME
- The seed script will clear existing seed data (users with EMP-SEED- or CAND-SEED- prefixes) before creating new ones

