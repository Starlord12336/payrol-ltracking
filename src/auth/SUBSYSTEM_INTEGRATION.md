# Subsystem Integration Guide - Authentication System

## Overview

The authentication system is **completely generic** and works with **ANY schema that extends `UserProfileBase`**. All subsystems can register their user types, and the auth system will automatically work with them.

## Architecture

### User Registry Pattern

The authentication system uses a **registry pattern** where any subsystem can register their user schema. The system then:
- Searches across ALL registered user types during login
- Validates uniqueness across ALL registered user types
- Handles authentication for ANY registered user type

### Key Components

1. **UserRegistryService**: Manages all registered user types
2. **UserTypeRegistry Interface**: Defines how to register a user type
3. **Generic Auth Methods**: Work with any registered user type

## How Subsystems Use Authentication

### For Subsystems That Reference Users

If your subsystem just **references** users (like `LeaveRequest` references `EmployeeProfile`), you don't need to do anything special. The auth system already works with all registered user types.

**Example:**
```typescript
// Your schema
@Schema()
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;
  // ... other fields
}
```

The auth system will work automatically because `EmployeeProfile` is already registered.

### For Subsystems That Create New User Types

If your subsystem creates a **new user type** that extends `UserProfileBase`, you need to register it:

#### Step 1: Create Your User Schema

```typescript
import { UserProfileBase } from '../../employee-profile/models/user-schema';

@Schema({ collection: 'your_user_type', timestamps: true })
export class YourUserType extends UserProfileBase {
  @Prop({ type: String, required: true, unique: true })
  yourUserNumber: string;

  @Prop({ type: String, enum: Object.values(YourStatusEnum) })
  status: YourStatusEnum;

  // ... other fields specific to your user type
}
```

#### Step 2: Register Your User Type

In your module's `onModuleInit` or in a service:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRegistryService } from '../../auth/services/user-registry.service';
import { YourUserType, YourUserTypeDocument } from './models/your-user-type.schema';
import { YourStatusEnum } from './enums/your-status.enum';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

@Injectable()
export class YourModuleService implements OnModuleInit {
  constructor(
    @InjectModel(YourUserType.name)
    private yourUserTypeModel: Model<YourUserTypeDocument>,
    private userRegistryService: UserRegistryService, // Inject from AuthModule
  ) {}

  onModuleInit() {
    // Register your user type
    this.userRegistryService.registerUserType({
      type: 'your_user_type', // Unique identifier
      model: this.yourUserTypeModel,
      collectionName: 'your_user_type',
      
      // Define when users of this type can login
      canLogin: (user: YourUserTypeDocument) => {
        return user.status === YourStatusEnum.ACTIVE;
      },
      
      // Define default roles for this user type
      getDefaultRoles: (user: YourUserTypeDocument) => {
        return [SystemRole.DEPARTMENT_EMPLOYEE]; // Or your custom role
      },
      
      // Define how to get user identifier
      getUserIdentifier: (user: YourUserTypeDocument) => {
        return user.yourUserNumber;
      },
    });
  }
}
```

#### Step 3: Import AuthModule in Your Module

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../../auth/auth.module'; // Import AuthModule
import { YourUserType, YourUserTypeSchema } from './models/your-user-type.schema';
import { YourModuleService } from './your-module.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YourUserType.name, schema: YourUserTypeSchema },
    ]),
    AuthModule, // Import to get UserRegistryService
  ],
  providers: [YourModuleService],
})
export class YourModule {}
```

## Registration Interface

### UserTypeRegistry

```typescript
interface UserTypeRegistry {
  type: string;                    // Unique identifier (e.g., 'employee', 'candidate')
  model: Model<any>;                // Mongoose model
  collectionName: string;          // Collection name
  canLogin?: (user: any) => boolean; // Status validation function
  getDefaultRoles?: (user: any) => string[] | Promise<string[]>; // Default roles
  getUserIdentifier?: (user: any) => string | undefined; // User identifier
}
```

### Required Fields

- **type**: Must be unique across all subsystems
- **model**: Your Mongoose model
- **collectionName**: Your collection name

### Optional Fields

- **canLogin**: Function to check if user can login (default: always true)
- **getDefaultRoles**: Function to get default roles (default: empty array)
- **getUserIdentifier**: Function to get user identifier (default: undefined)

## Examples

### Example 1: Simple User Type

```typescript
// Register a simple user type with minimal configuration
this.userRegistryService.registerUserType({
  type: 'contractor',
  model: this.contractorModel,
  collectionName: 'contractors',
  canLogin: (user) => user.isActive === true,
  getDefaultRoles: () => [SystemRole.DEPARTMENT_EMPLOYEE],
  getUserIdentifier: (user) => user.contractorId,
});
```

### Example 2: Complex User Type with Status Validation

```typescript
// Register with complex status validation
this.userRegistryService.registerUserType({
  type: 'vendor',
  model: this.vendorModel,
  collectionName: 'vendors',
  canLogin: (user) => {
    return (
      user.status === VendorStatus.ACTIVE &&
      user.verified === true &&
      !user.isSuspended
    );
  },
  getDefaultRoles: (user) => {
    if (user.isAdmin) {
      return [SystemRole.SYSTEM_ADMIN];
    }
    return [SystemRole.DEPARTMENT_EMPLOYEE];
  },
  getUserIdentifier: (user) => user.vendorCode,
});
```

## How It Works

### Registration Flow

1. Subsystem module initializes
2. Service's `onModuleInit()` is called
3. Service registers user type with `UserRegistryService`
4. User type is now available for authentication

### Authentication Flow

1. **Login**: System searches ALL registered user types for matching email
2. **Status Check**: Uses `canLogin()` function from registry
3. **Role Assignment**: Uses `getDefaultRoles()` from registry
4. **JWT Generation**: Includes user type and identifier

### Registration Flow

1. **Email Check**: Checks uniqueness across ALL registered user types
2. **National ID Check**: Checks uniqueness across ALL registered user types
3. **User Creation**: Creates user in appropriate collection based on `userType`

## Benefits

✅ **No Code Changes Needed**: Existing subsystems work automatically  
✅ **Easy Integration**: Just register your user type  
✅ **Type Safety**: Full TypeScript support  
✅ **Flexible**: Customize login rules, roles, and identifiers per user type  
✅ **Scalable**: Add unlimited user types without modifying auth code  

## Current Registered User Types

- **employee**: EmployeeProfile (from employee-profile module)
- **candidate**: Candidate (from employee-profile module)

## Best Practices

1. **Unique Type Names**: Use descriptive, unique type names (e.g., `vendor`, `contractor`, `partner`)
2. **Status Validation**: Always implement `canLogin` to prevent unauthorized access
3. **Default Roles**: Provide sensible default roles via `getDefaultRoles`
4. **User Identifier**: Implement `getUserIdentifier` for better user tracking
5. **Error Handling**: Handle registration errors gracefully

## Troubleshooting

### User Type Not Found

**Error**: `User type 'xyz' is not registered`

**Solution**: Make sure you've registered your user type in `onModuleInit()` and imported `AuthModule`.

### Circular Dependency

**Error**: Circular dependency detected

**Solution**: Use `forwardRef()` when importing modules:
```typescript
imports: [forwardRef(() => AuthModule)]
```

### Email Already Exists

**Error**: Email already exists (but you think it doesn't)

**Solution**: The system checks ALL registered user types. Make sure the email isn't used in another user type.

## API Usage

Once registered, your user type works with all auth endpoints:

```bash
# Register user of your type
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "nationalId": "1234567890",
  "userType": "your_user_type"  // Your registered type
}

# Login (works automatically)
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Summary

The authentication system is **100% generic** and works with **any schema extending UserProfileBase**. Simply:

1. Create your schema extending `UserProfileBase`
2. Register it with `UserRegistryService`
3. That's it! Auth works automatically.

No need to modify auth code. No need to hardcode user types. Just register and go!

