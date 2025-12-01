# Authentication System Documentation

## Overview

This authentication system provides JWT-based authentication and role-based authorization for the HR System. It follows the same pattern as the student-management system but is specifically tailored for the HR System's employee profile structure.

## Features

- ✅ JWT-based authentication
- ✅ Cookie-based token storage (httpOnly cookies)
- ✅ Password hashing with bcrypt
- ✅ Role-based authorization
- ✅ Public route decorator
- ✅ Current user decorator
- ✅ Password change functionality
- ✅ Employee status validation

## Architecture

### Module Structure

```
src/auth/
├── auth.module.ts          # Auth module configuration
├── auth.service.ts          # Authentication business logic
├── auth.controller.ts       # Authentication endpoints
├── dto/                     # Data Transfer Objects
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── change-password.dto.ts
├── guards/                  # Route guards
│   ├── jwt-auth.guard.ts    # JWT authentication guard
│   └── roles.guard.ts       # Role-based authorization guard
└── decorators/              # Custom decorators
    ├── public.decorator.ts  # Mark routes as public
    ├── roles.decorator.ts   # Define required roles
    └── current-user.decorator.ts  # Get current user from request
```

## API Endpoints

### Public Endpoints

#### POST `/auth/register`
Register a new employee.

**Request Body:**
```json
{
  "email": "employee@company.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "nationalId": "12345678901234",
  "middleName": "Middle", // optional
  "gender": "MALE", // optional
  "maritalStatus": "SINGLE", // optional
  "dateOfBirth": "1990-01-01", // optional
  "mobilePhone": "+1234567890" // optional
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "message": "Employee registered successfully"
  }
}
```

#### POST `/auth/login`
Sign in an employee.

**Request Body:**
```json
{
  "email": "employee@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "user": {
    "userid": "507f1f77bcf86cd799439011",
    "roles": ["DEPARTMENT_EMPLOYEE"],
    "email": "employee@company.com",
    "employeeNumber": "EMP123456"
  }
}
```

**Note:** The JWT token is automatically set as an httpOnly cookie named `token`.

### Protected Endpoints

All endpoints below require authentication (JWT token in cookie or Authorization header).

#### GET `/auth/me`
Get current user information.

**Response:**
```json
{
  "userid": "507f1f77bcf86cd799439011",
  "email": "employee@company.com",
  "employeeNumber": "EMP123456",
  "roles": ["DEPARTMENT_EMPLOYEE"],
  "nationalId": "12345678901234"
}
```

#### POST `/auth/logout`
Logout the current user (clears the authentication cookie).

**Response:**
```json
{
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

#### POST `/auth/change-password`
Change the current user's password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Password changed successfully"
}
```

## Usage in Controllers

### Making Routes Public

Use the `@Public()` decorator to bypass authentication:

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Public()
  @Get('info')
  getInfo() {
    return { message: 'This is public' };
  }
}
```

### Requiring Authentication

By default, all routes require authentication (global guard is enabled). You can also explicitly use the guard:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get('data')
  getData() {
    return { message: 'This requires authentication' };
  }
}
```

### Role-Based Authorization

Use the `@Roles()` decorator with `RolesGuard` to restrict access by role:

```typescript
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Roles(SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  @Delete('employee/:id')
  deleteEmployee(@Param('id') id: string) {
    // Only HR_MANAGER or SYSTEM_ADMIN can access
  }
}
```

### Accessing Current User

Use the `@CurrentUser()` decorator to get the authenticated user:

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
  @Get('me')
  getMyProfile(@CurrentUser() user: any) {
    // user contains: userid, roles, email, employeeNumber, nationalId
    return user;
  }
}
```

## JWT Payload Structure

The JWT token contains:

```typescript
{
  userid: Types.ObjectId,      // Employee profile ID
  roles: SystemRole[],          // Array of system roles
  email: string,                // Employee email
  employeeNumber: string,       // Employee number
  nationalId: string            // National ID
}
```

## System Roles

Available roles (from `SystemRole` enum):

- `DEPARTMENT_EMPLOYEE` - Regular department employee
- `DEPARTMENT_HEAD` - Department head
- `HR_MANAGER` - HR Manager
- `HR_EMPLOYEE` - HR Employee
- `PAYROLL_SPECIALIST` - Payroll Specialist
- `PAYROLL_MANAGER` - Payroll Manager
- `SYSTEM_ADMIN` - System Administrator
- `LEGAL_POLICY_ADMIN` - Legal & Policy Admin
- `RECRUITER` - Recruiter
- `FINANCE_STAFF` - Finance Staff
- `JOB_CANDIDATE` - Job Candidate
- `HR_ADMIN` - HR Admin

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/hr-system
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **HttpOnly Cookies**: JWT tokens stored in httpOnly cookies to prevent XSS attacks
3. **Secure Cookies**: In production, cookies are marked as secure (HTTPS only)
4. **Token Expiration**: JWT tokens expire after 24 hours (configurable)
5. **Employee Status Check**: Only active employees can log in
6. **Role Validation**: Role-based access control with multiple roles support

## Integration with Employee Profile

The authentication system integrates with:

- **EmployeeProfile**: Main employee schema (extends UserProfileBase)
- **EmployeeSystemRole**: Stores employee roles and permissions
- **UserProfileBase**: Base schema with password, email, nationalId fields

## Notes

- Employee numbers are auto-generated during registration
- Login can use either `workEmail` or `personalEmail`
- Employee must have `ACTIVE` status to log in
- Roles are fetched from `EmployeeSystemRole` collection
- Global JWT guard is enabled by default (use `@Public()` to bypass)

