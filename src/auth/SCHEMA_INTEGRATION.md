# Authentication System - Schema Integration Guide

## Overview

The authentication system has been updated to work seamlessly with **all subsystems** that use the `UserProfileBase` schema. It now supports both `EmployeeProfile` and `Candidate` entities, and can be easily extended to support any future entities that extend `UserProfileBase`.

## Supported User Types

### 1. EmployeeProfile
- **Collection**: `employee_profiles`
- **Extends**: `UserProfileBase`
- **Unique Fields**: `employeeNumber`, `workEmail`, `personalEmail`, `nationalId`
- **Status Field**: `status` (EmployeeStatus enum)
- **Roles**: Retrieved from `EmployeeSystemRole` collection

### 2. Candidate
- **Collection**: `candidates`
- **Extends**: `UserProfileBase`
- **Unique Fields**: `candidateNumber`, `personalEmail`, `nationalId`
- **Status Field**: `status` (CandidateStatus enum)
- **Roles**: Default to `JOB_CANDIDATE` role

## Schema Compliance

### UserProfileBase Fields (Required for Auth)
All entities extending `UserProfileBase` must have:
- `firstName` (required)
- `lastName` (required)
- `nationalId` (required, unique)
- `password` (optional, but required for authentication)
- `personalEmail` (optional, but used for login)
- `workEmail` (optional, EmployeeProfile only)

### Registration Requirements

#### For Employees:
```typescript
{
  email: string;              // Sets both personalEmail and workEmail
  password: string;           // Min 6 characters
  firstName: string;         // Required
  lastName: string;          // Required
  nationalId: string;        // Required, unique
  userType: 'employee';      // Optional, defaults to 'candidate' (use 'employee' explicitly for employee registration)
  dateOfHire?: string;       // Optional, defaults to now
  employeeNumber?: string;  // Optional, auto-generated if not provided
  status?: EmployeeStatus;   // Optional, defaults to ACTIVE
  // ... other UserProfileBase fields
}
```

#### For Candidates:
```typescript
{
  email: string;              // Sets personalEmail
  password: string;           // Min 6 characters
  firstName: string;         // Required
  lastName: string;          // Required
  nationalId: string;        // Required, unique
  userType: 'candidate';     // Optional, defaults to 'candidate' for public registration
  applicationDate?: string;  // Optional, defaults to now
  candidateNumber?: string;  // Optional, auto-generated if not provided
  candidateStatus?: CandidateStatus; // Optional, defaults to APPLIED
  // ... other UserProfileBase fields
}
```

## Authentication Flow

### 1. Registration
1. Validates email uniqueness (checks both EmployeeProfile and Candidate)
2. Validates nationalId uniqueness (checks both collections)
3. Hashes password with bcrypt (10 rounds)
4. Creates user in appropriate collection based on `userType`
5. Auto-generates `employeeNumber` or `candidateNumber` if not provided
6. Sets default status if not provided

### 2. Login
1. Searches for user by email in both EmployeeProfile and Candidate collections
2. Verifies password
3. Checks user status:
   - **Employees**: Must be `ACTIVE`
   - **Candidates**: Cannot be `REJECTED` or `WITHDRAWN`
4. Retrieves roles:
   - **Employees**: From `EmployeeSystemRole` collection (defaults to `DEPARTMENT_EMPLOYEE` if none)
   - **Candidates**: Defaults to `JOB_CANDIDATE`
5. Generates JWT token with user information

### 3. JWT Payload Structure
```typescript
{
  userid: Types.ObjectId,      // User ID
  roles: SystemRole[],         // Array of roles
  email: string,               // User email
  userType: 'employee' | 'candidate', // User type
  nationalId: string,          // National ID
  employeeNumber?: string,     // If employee
  candidateNumber?: string    // If candidate
}
```

## Service Methods

### EmployeeProfileService

#### Unified Methods (Work with both types):
- `findByEmail(email)` - Returns `{ user, userType }` or `null`
- `findByNationalId(nationalId)` - Returns `{ user, userType }` or `null`
- `findById(id)` - Returns `{ user, userType }` or `null`
- `updateUser(id, userType, updateData)` - Updates based on user type

#### Type-Specific Methods:
- `createEmployee(data)` - Creates EmployeeProfile
- `createCandidate(data)` - Creates Candidate
- `updateEmployee(id, data)` - Updates EmployeeProfile
- `updateCandidate(id, data)` - Updates Candidate
- `getEmployeeRoles(employeeProfileId)` - Gets roles (employees only)

## Extending to New User Types

To add support for a new user type that extends `UserProfileBase`:

1. **Update EmployeeProfileService**:
   ```typescript
   // Add model injection
   @InjectModel(NewUserType.name)
   private newUserTypeModel: Model<NewUserTypeDocument>,
   
   // Update findByEmail to check new type
   // Update findByNationalId to check new type
   // Add createNewUserType method
   ```

2. **Update AuthService**:
   ```typescript
   // Add new user type to UserType union
   // Update register() to handle new type
   // Update signIn() to handle new type status checks
   // Add generateNewUserTypeNumber() if needed
   ```

3. **Update RegisterDto**:
   ```typescript
   // Add new user type to userType enum
   // Add type-specific fields if needed
   ```

## Status Validation

### Employee Status
- ✅ `ACTIVE` - Can login
- ❌ All other statuses - Cannot login

### Candidate Status
- ✅ `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER_SENT`, `OFFER_ACCEPTED`, `HIRED` - Can login
- ❌ `REJECTED`, `WITHDRAWN` - Cannot login

## Role Assignment

### Employees
- Roles are stored in `EmployeeSystemRole` collection
- Linked via `employeeProfileId`
- If no roles assigned, defaults to `DEPARTMENT_EMPLOYEE`
- Multiple roles can be assigned

### Candidates
- Always assigned `JOB_CANDIDATE` role
- No roles stored in `EmployeeSystemRole` collection
- Single role only

## API Examples

### Register Employee
```bash
POST /auth/register
{
  "email": "employee@company.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "nationalId": "12345678901234",
  "userType": "employee"
}
```

### Register Candidate
```bash
POST /auth/register
{
  "email": "candidate@email.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "nationalId": "98765432109876",
  "userType": "candidate"
}
```

### Login (Works for both types)
```bash
POST /auth/login
{
  "email": "user@email.com",
  "password": "password123"
}
```

### Get Current User
```bash
GET /auth/me
# Returns user info with userType field
```

## Notes

- All user types share the same authentication endpoints
- Email and nationalId must be unique across **all** user types
- Password hashing is consistent across all types
- JWT tokens include `userType` to identify the user's collection
- The system automatically determines user type during login
- Status validation is type-specific

