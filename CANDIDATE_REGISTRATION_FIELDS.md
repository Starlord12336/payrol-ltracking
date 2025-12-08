# Candidate Registration Fields Analysis

## 📋 Complete Field Mapping

### **Candidate Schema Structure**
The `Candidate` schema extends `UserProfileBase` and adds candidate-specific fields.

---

## ✅ **Fields Available in RegisterDto (Can be sent from Frontend)**

### **Required Fields** (Must be provided)
1. **`email`** (string, valid email)
   - Maps to: `personalEmail` in Candidate schema
   - Used for: Login and communication

2. **`password`** (string, min 6 characters)
   - Maps to: `password` in UserProfileBase
   - Used for: Authentication

3. **`firstName`** (string)
   - Maps to: `firstName` in UserProfileBase (required)
   - Used for: Profile identification

4. **`lastName`** (string)
   - Maps to: `lastName` in UserProfileBase (required)
   - Used for: Profile identification

5. **`nationalId`** (string)
   - Maps to: `nationalId` in UserProfileBase (required, unique)
   - Used for: Unique identification

### **Optional Fields from UserProfileBase** (Can be provided)
6. **`middleName`** (string, optional)
   - Maps to: `middleName` in UserProfileBase
   - Used for: Full name generation

7. **`gender`** (enum: `MALE` | `FEMALE`, optional)
   - Maps to: `gender` in UserProfileBase
   - Used for: Demographics

8. **`maritalStatus`** (enum: `SINGLE` | `MARRIED` | `DIVORCED` | `WIDOWED`, optional)
   - Maps to: `maritalStatus` in UserProfileBase
   - Used for: Demographics

9. **`dateOfBirth`** (string, ISO date format, optional)
   - Maps to: `dateOfBirth` in UserProfileBase (Date)
   - Used for: Age calculation, demographics

10. **`mobilePhone`** (string, optional)
    - Maps to: `mobilePhone` in UserProfileBase
    - Used for: Contact information

### **Candidate-Specific Optional Fields**
11. **`userType`** (enum: `'employee'` | `'candidate'`, optional)
    - Default: `'employee'` (⚠️ **Should be `'candidate'` for public registration**)
    - Used for: Determining registration type

12. **`candidateNumber`** (string, optional)
    - Maps to: `candidateNumber` in Candidate schema
    - Auto-generated if not provided
    - Format: `CAND` + timestamp + random (e.g., `CAND123456789`)

13. **`applicationDate`** (string, ISO date format, optional)
    - Maps to: `applicationDate` in Candidate schema
    - Default: Current date if not provided
    - Used for: Tracking when candidate registered

14. **`candidateStatus`** (enum: `CandidateStatus`, optional)
    - Maps to: `status` in Candidate schema
    - Default: `APPLIED` if not provided
    - Possible values: `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER_SENT`, `OFFER_ACCEPTED`, `HIRED`, `REJECTED`, `WITHDRAWN`
    - ⚠️ **Security concern**: Frontend can set any status (including `REJECTED` or `WITHDRAWN`)

---

## ❌ **Fields in Candidate Schema but NOT in RegisterDto**

These fields exist in the schema but **cannot be set during registration**. They are set later by the system or HR:

1. **`fullName`** (string)
   - Auto-generated from: `firstName` + `middleName` + `lastName`
   - Set by: Backend during registration

2. **`candidateNumber`** (string, required, unique)
   - Auto-generated if not provided in RegisterDto
   - Format: `CAND` + timestamp + random

3. **`status`** (CandidateStatus)
   - Default: `APPLIED`
   - Can be overridden by `candidateStatus` in RegisterDto

4. **`departmentId`** (ObjectId, optional)
   - Not in RegisterDto
   - Set later when candidate applies for a specific position

5. **`positionId`** (ObjectId, optional)
   - Not in RegisterDto
   - Set later when candidate applies for a specific position

6. **`resumeUrl`** (string, optional)
   - Not in RegisterDto
   - Set later when candidate uploads resume/CV

7. **`notes`** (string, optional)
   - Not in RegisterDto
   - Set by HR/admin later

8. **`homePhone`** (string, optional)
   - In UserProfileBase but not in RegisterDto
   - Can be added later via profile update

9. **`address`** (Address object, optional)
   - In UserProfileBase but not in RegisterDto
   - Contains: `city`, `streetAddress`, `country`
   - Can be added later via profile update

10. **`profilePictureUrl`** (string, optional)
    - In UserProfileBase but not in RegisterDto
    - Can be added later via profile update

11. **`accessProfileId`** (ObjectId, optional)
    - In UserProfileBase but not in RegisterDto
    - Set by system for role management

12. **`createdAt`** / **`updatedAt`** (Date)
    - Auto-managed by Mongoose timestamps
    - Not in RegisterDto

---

## 📝 **Example Registration Request (Frontend)**

### **Minimal Registration** (Only Required Fields)
```json
{
  "email": "candidate@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "nationalId": "12345678901234",
  "userType": "candidate"
}
```

### **Complete Registration** (All Available Fields)
```json
{
  "email": "candidate@example.com",
  "password": "password123",
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "nationalId": "12345678901234",
  "gender": "MALE",
  "maritalStatus": "SINGLE",
  "dateOfBirth": "1990-01-15",
  "mobilePhone": "+201234567890",
  "userType": "candidate",
  "applicationDate": "2024-01-15"
  // Note: candidateStatus defaults to APPLIED, don't set it
}
```

---

## ⚠️ **Issues & Recommendations**

### **1. Default userType Should Be 'candidate'**
**Current**: Defaults to `'employee'`  
**Should be**: Defaults to `'candidate'` for public registration

**Location**: `src/auth/auth.service.ts` line 60
```typescript
// Current:
const userType: UserType = registerDto.userType || 'employee';

// Should be:
const userType: UserType = registerDto.userType || 'candidate';
```

### **2. Prevent Frontend from Setting Inappropriate Status**
**Issue**: Frontend can set `candidateStatus` to `REJECTED` or `WITHDRAWN`, which would prevent login.

**Recommendation**: 
- Remove `candidateStatus` from RegisterDto, OR
- Validate that only `APPLIED` can be set during registration

### **3. Missing Fields in RegisterDto**
Consider adding to RegisterDto (optional):
- `homePhone` (from UserProfileBase)
- `address` object (city, streetAddress, country)

These can be added later via profile update, but might be useful during registration.

---

## 🔄 **What Happens During Registration**

1. **Validation**: All required fields validated
2. **Email/NationalId Check**: Ensures uniqueness across all user types
3. **Password Hashing**: Password is hashed with bcrypt
4. **Full Name Generation**: `fullName` auto-generated from name parts
5. **Candidate Number**: Auto-generated if not provided
6. **Status Setting**: Defaults to `APPLIED` if not provided
7. **Application Date**: Defaults to current date if not provided
8. **Profile Creation**: Candidate document created in `candidates` collection
9. **Response**: Returns success message and userType

---

## ✅ **Summary: Required vs Optional**

### **Required (5 fields)**:
- ✅ `email`
- ✅ `password`
- ✅ `firstName`
- ✅ `lastName`
- ✅ `nationalId`
- ✅ `userType` (should be `'candidate'` for public registration)

### **Optional (9 fields)**:
- `middleName`
- `gender`
- `maritalStatus`
- `dateOfBirth`
- `mobilePhone`
- `candidateNumber` (auto-generated if not provided)
- `applicationDate` (defaults to now if not provided)
- `candidateStatus` (defaults to `APPLIED` if not provided)

### **Auto-Generated (Not in RegisterDto)**:
- `fullName`
- `candidateNumber` (if not provided)
- `status` (if `candidateStatus` not provided)
- `applicationDate` (if not provided)
- `createdAt` / `updatedAt`

