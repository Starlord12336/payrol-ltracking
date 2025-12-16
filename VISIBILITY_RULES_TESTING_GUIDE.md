# Visibility Rules Testing Guide

## 🎯 Purpose
This guide provides step-by-step instructions to test that visibility rules are properly enforced when viewing performance appraisals.

---

## 📋 Prerequisites

Before testing, ensure you have:
1. ✅ Backend server running
2. ✅ Frontend server running
3. ✅ Database seeded with test users
4. ✅ At least one completed and published appraisal

---

## 🧪 Test Scenario 1: Hide Final Rating from Employees

### Goal
Verify that employees cannot see their final rating when a visibility rule restricts it.

### Step-by-Step Instructions

#### Step 1: Login as SYSTEM_ADMIN
1. Navigate to `http://localhost:3001`
2. Login with SYSTEM_ADMIN credentials:
   - **Email**: `david.rodriguez@company.com`
   - **Password**: `Racker123`

#### Step 2: Create Visibility Rule
1. Navigate to **Performance** module
2. Click on **Visibility Rules** tab (should be default)
3. Click **Create Visibility Rule** button
4. Fill in the form:
   - **Name**: `Hide Final Rating from Employees`
   - **Description**: `Final rating visible only to HR and Managers`
   - **Field Type**: Select `FINAL_RATING`
   - **Allowed Roles**: 
     - ✅ Check: `HR Manager`
     - ✅ Check: `HR Employee`
     - ✅ Check: `Department Head`
     - ❌ **UNCHECK**: `Department Employee`
     - ❌ **UNCHECK**: `System Admin` (optional, for testing)
   - **Is Active**: ✅ Checked
5. Click **Create**

#### Step 3: Verify Rule Created
- ✅ Rule should appear in the list
- ✅ Status should show "Active"

#### Step 4: Login as DEPARTMENT_EMPLOYEE
1. Logout from SYSTEM_ADMIN
2. Login with an employee account that has a published appraisal:
   - **Note**: You may need to use an employee account that has been assigned an appraisal and has it published
   - **Email**: Use any employee account (or create one via HR Employee)
   - **Password**: `Racker123`
   - **Alternative**: Use HR Employee account (`david.kim@company.com`) which also has `DEPARTMENT_EMPLOYEE` role

#### Step 5: View Final Rating
1. Navigate to **Performance** module
2. Click **My Performance** tab
3. Find an assignment with status **PUBLISHED**
4. Click **View Final Rating** button
5. **Expected Result**:
   - ✅ Modal opens
   - ✅ **"Overall Performance Rating"** section should be **HIDDEN** or show **"N/A"**
   - ✅ **"Detailed Performance Ratings"** may be visible (if ratings rule allows)
   - ✅ Other sections (Manager Summary, Strengths, etc.) may be visible based on their rules

#### Step 6: Login as HR_MANAGER
1. Logout from employee account
2. Login with HR Manager account:
   - **Email**: `michael.chen@company.com`
   - **Password**: `Racker123`

#### Step 7: View Same Appraisal as HR Manager
1. Navigate to **Performance** module
2. Go to **Consolidated Dashboard** or find the same employee's appraisal
3. View the final rating
4. **Expected Result**:
   - ✅ **"Overall Performance Rating"** section should be **VISIBLE**
   - ✅ Total score and rating label should be displayed

---

## 🧪 Test Scenario 2: Hide Manager Summary from Employees

### Goal
Verify that employees cannot see manager summary when restricted.

### Step-by-Step Instructions

#### Step 1: Login as SYSTEM_ADMIN
1. Login with SYSTEM_ADMIN credentials

#### Step 2: Update Manager Summary Rule
1. Navigate to **Performance** → **Visibility Rules**
2. Find the rule: **"Manager Summary - Default"**
3. Click **Edit**
4. In **Allowed Roles**:
   - ✅ Keep: `HR Manager`
   - ✅ Keep: `HR Employee`
   - ✅ Keep: `Department Head`
   - ❌ **REMOVE**: `Department Employee`
5. Click **Update**

#### Step 3: Login as DEPARTMENT_EMPLOYEE
1. Logout and login as employee

#### Step 4: View Final Rating
1. Navigate to **Performance** → **My Performance**
2. Click **View Final Rating** on a published appraisal
3. **Expected Result**:
   - ✅ **"Manager Summary"** section should be **HIDDEN**
   - ✅ Other sections may still be visible

#### Step 5: Login as DEPARTMENT_HEAD (Manager)
1. Logout and login as the employee's manager

#### Step 6: View Same Appraisal
1. Navigate to **Performance** → **Team Reviews**
2. View the same employee's appraisal
3. **Expected Result**:
   - ✅ **"Manager Summary"** section should be **VISIBLE**

---

## 🧪 Test Scenario 3: Hide Ratings from Employees

### Goal
Verify that employees cannot see detailed ratings when restricted.

### Step-by-Step Instructions

#### Step 1: Login as SYSTEM_ADMIN
1. Login with SYSTEM_ADMIN credentials

#### Step 2: Create/Update Ratings Rule
1. Navigate to **Performance** → **Visibility Rules**
2. Find or create rule for **"Ratings"**
3. Set **Allowed Roles**:
   - ✅ `HR Manager`
   - ✅ `HR Employee`
   - ✅ `Department Head`
   - ❌ **REMOVE**: `Department Employee`
4. Save

#### Step 3: Login as DEPARTMENT_EMPLOYEE
1. Logout and login as employee

#### Step 4: View Final Rating
1. Navigate to **Performance** → **My Performance**
2. Click **View Final Rating**
3. **Expected Result**:
   - ✅ **"Detailed Performance Ratings"** section should be **HIDDEN** or empty
   - ✅ Individual rating items should not be displayed

#### Step 5: Login as HR_MANAGER
1. Logout and login as HR Manager

#### Step 6: View Same Appraisal
1. View the same employee's appraisal
2. **Expected Result**:
   - ✅ **"Detailed Performance Ratings"** section should be **VISIBLE**
   - ✅ All rating items should be displayed

---

## 🧪 Test Scenario 4: Hide Comments from Ratings

### Goal
Verify that rating comments can be hidden separately from ratings.

### Step-by-Step Instructions

#### Step 1: Login as SYSTEM_ADMIN
1. Login with SYSTEM_ADMIN credentials

#### Step 2: Create Comments Rule
1. Navigate to **Performance** → **Visibility Rules**
2. Click **Create Visibility Rule**
3. Fill in:
   - **Name**: `Hide Rating Comments from Employees`
   - **Field Type**: `COMMENTS`
   - **Allowed Roles**:
     - ✅ `HR Manager`
     - ✅ `HR Employee`
     - ✅ `Department Head`
     - ❌ **UNCHECK**: `Department Employee`
4. Save

#### Step 3: Login as DEPARTMENT_EMPLOYEE
1. Logout and login as employee

#### Step 4: View Final Rating
1. Navigate to **Performance** → **My Performance**
2. Click **View Final Rating**
3. **Expected Result**:
   - ✅ Ratings may be visible (if ratings rule allows)
   - ✅ **"Manager Comments"** within each rating should be **HIDDEN**

#### Step 5: Login as DEPARTMENT_HEAD
1. Logout and login as manager

#### Step 6: View Same Appraisal
1. View the same employee's appraisal
2. **Expected Result**:
   - ✅ **"Manager Comments"** should be **VISIBLE** in each rating

---

## 🧪 Test Scenario 5: Multiple Rules Combined

### Goal
Test multiple visibility rules working together.

### Step-by-Step Instructions

#### Step 1: Login as SYSTEM_ADMIN
1. Login with SYSTEM_ADMIN credentials

#### Step 2: Configure Multiple Rules
Set up these rules:

**Rule 1: Final Rating**
- Field: `FINAL_RATING`
- Allowed: `HR Manager`, `HR Employee`, `Department Head`
- **NOT**: `Department Employee`

**Rule 2: Manager Summary**
- Field: `MANAGER_SUMMARY`
- Allowed: `HR Manager`, `HR Employee`
- **NOT**: `Department Employee`, `Department Head`

**Rule 3: Strengths**
- Field: `STRENGTHS`
- Allowed: `HR Manager`, `HR Employee`, `Department Head`, `Department Employee`
- (Everyone can see)

**Rule 4: Improvement Areas**
- Field: `IMPROVEMENT_AREAS`
- Allowed: `HR Manager`, `HR Employee`, `Department Head`
- **NOT**: `Department Employee`

#### Step 3: Login as DEPARTMENT_EMPLOYEE
1. Logout and login as employee

#### Step 4: View Final Rating
1. Navigate to **Performance** → **My Performance**
2. Click **View Final Rating**
3. **Expected Result**:
   - ❌ **Final Rating**: HIDDEN
   - ❌ **Manager Summary**: HIDDEN
   - ✅ **Strengths**: VISIBLE
   - ❌ **Improvement Areas**: HIDDEN

#### Step 5: Login as DEPARTMENT_HEAD
1. Logout and login as manager

#### Step 6: View Same Appraisal
1. View the same employee's appraisal
2. **Expected Result**:
   - ✅ **Final Rating**: VISIBLE
   - ❌ **Manager Summary**: HIDDEN (HR only)
   - ✅ **Strengths**: VISIBLE
   - ✅ **Improvement Areas**: VISIBLE

#### Step 7: Login as HR_MANAGER
1. Logout and login as HR Manager

#### Step 8: View Same Appraisal
1. View the same employee's appraisal
2. **Expected Result**:
   - ✅ **Final Rating**: VISIBLE
   - ✅ **Manager Summary**: VISIBLE
   - ✅ **Strengths**: VISIBLE
   - ✅ **Improvement Areas**: VISIBLE

---

## 🧪 Test Scenario 6: Inactive Rules

### Goal
Verify that inactive rules don't affect visibility.

### Step-by-Step Instructions

#### Step 1: Login as SYSTEM_ADMIN
1. Login with SYSTEM_ADMIN credentials

#### Step 2: Create and Deactivate Rule
1. Create a rule to hide `FINAL_RATING` from `Department Employee`
2. **Deactivate** the rule (uncheck "Is Active")
3. Save

#### Step 3: Login as DEPARTMENT_EMPLOYEE
1. Logout and login as employee

#### Step 4: View Final Rating
1. Navigate to **Performance** → **My Performance**
2. Click **View Final Rating**
3. **Expected Result**:
   - ✅ **Final Rating** should be **VISIBLE** (rule is inactive, so default behavior applies)
   - ✅ Default behavior: if no active rule exists, field is visible

---

## 🧪 Test Scenario 7: No Rule Exists (Default Behavior)

### Goal
Verify that if no rule exists for a field, it's visible by default.

### Step-by-Step Instructions

#### Step 1: Login as SYSTEM_ADMIN
1. Login with SYSTEM_ADMIN credentials

#### Step 2: Delete All Rules for a Field
1. Navigate to **Performance** → **Visibility Rules**
2. Delete all rules for `STRENGTHS` field (if any exist)

#### Step 3: Login as DEPARTMENT_EMPLOYEE
1. Logout and login as employee

#### Step 4: View Final Rating
1. Navigate to **Performance** → **My Performance**
2. Click **View Final Rating**
3. **Expected Result**:
   - ✅ **Strengths** section should be **VISIBLE** (default: visible when no rule exists)

---

## ✅ Verification Checklist

After running all test scenarios, verify:

- [ ] **Rule Creation**: Can create visibility rules as SYSTEM_ADMIN
- [ ] **Rule Update**: Can update existing rules
- [ ] **Rule Deletion**: Can delete rules
- [ ] **Field Hiding**: Restricted fields are hidden from unauthorized roles
- [ ] **Field Showing**: Allowed fields are visible to authorized roles
- [ ] **Multiple Rules**: Multiple rules work together correctly
- [ ] **Inactive Rules**: Inactive rules don't affect visibility
- [ ] **Default Behavior**: Fields without rules are visible by default
- [ ] **Comments**: Rating comments can be hidden separately
- [ ] **Ratings**: Individual ratings can be hidden
- [ ] **Manager Summary**: Manager summary can be restricted
- [ ] **Final Rating**: Final rating can be hidden from employees

---

## 🐛 Troubleshooting

### Issue: Fields are still visible when they shouldn't be

**Possible Causes**:
1. Rule is not active (check "Is Active" checkbox)
2. User role is still in "Allowed Roles" list
3. Backend not applying rules (check server logs)
4. Frontend caching (hard refresh browser)

**Solutions**:
1. Verify rule is active in Visibility Rules list
2. Double-check allowed roles in the rule
3. Check backend logs for errors
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Fields are hidden when they shouldn't be

**Possible Causes**:
1. Rule is too restrictive
2. User role not in allowed roles
3. Multiple conflicting rules

**Solutions**:
1. Check rule configuration
2. Verify user's role in database
3. Review all active rules for the field

### Issue: Rule changes not taking effect

**Possible Causes**:
1. Backend not restarted
2. Frontend not refreshed
3. Database not updated

**Solutions**:
1. Restart backend server
2. Hard refresh frontend (Ctrl+Shift+R)
3. Check database for rule updates

---

## 📝 Notes

- **Default Behavior**: If no active rule exists for a field, it's visible to everyone
- **Role Priority**: The first role in the user's roles array is used for visibility checks
- **Field Mapping**:
  - `FINAL_RATING` → `totalScore` and `overallRatingLabel`
  - `RATINGS` → `ratings` array
  - `MANAGER_SUMMARY` → `managerSummary`
  - `STRENGTHS` → `strengths`
  - `IMPROVEMENT_AREAS` → `improvementAreas`
  - `COMMENTS` → `comments` within each rating entry
- **Frontend**: Already handles missing fields gracefully (conditional rendering)

---

## 🎯 Quick Test Summary

**Minimum Test** (5 minutes):
1. **Login as SYSTEM_ADMIN** (`david.rodriguez@company.com` / `Racker123`)
2. Navigate to **Performance** → **Visibility Rules**
3. **Create rule**: 
   - Name: `Hide Final Rating from Employees`
   - Field Type: `FINAL_RATING`
   - Allowed Roles: ✅ `HR Manager`, ✅ `HR Employee`, ✅ `Department Head`
   - ❌ **UNCHECK**: `Department Employee`
4. **Login as HR Employee** (`david.kim@company.com` / `Racker123`) - has `DEPARTMENT_EMPLOYEE` role
5. Navigate to **Performance** → **My Performance**
6. Click **View Final Rating** on a published appraisal
7. **Expected**: Overall Performance Rating section should be **HIDDEN** or show "N/A"
8. **Login as HR Manager** (`michael.chen@company.com` / `Racker123`)
9. View the same appraisal
10. **Expected**: Overall Performance Rating section should be **VISIBLE**

If this works, the enforcement logic is functioning correctly! ✅

---

## 📝 Test Credentials Reference

| Role | Email | Password |
|------|-------|----------|
| **System Admin** | `david.rodriguez@company.com` | `Racker123` |
| **HR Manager** | `michael.chen@company.com` | `Racker123` |
| **HR Employee** | `david.kim@company.com` | `Racker123` |
| **HR Admin** | `sarah.anderson@company.com` | `Racker123` |

**Note**: HR Employee (`david.kim@company.com`) also has `DEPARTMENT_EMPLOYEE` role, so you can use it to test employee visibility restrictions.

