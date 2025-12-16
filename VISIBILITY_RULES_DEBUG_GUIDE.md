# Visibility Rules Debugging Guide

## 🐛 Issue: Rules Not Being Applied

If visibility rules are not working, follow these steps to debug:

---

## Step 1: Verify Rule Was Created

### Check Backend Logs
When you create a visibility rule, you should see:
```
Creating visibility rule: [Rule Name] for field [FIELD_TYPE] with allowed roles: [HR Manager]
Successfully saved [X] visibility rules to GridFS
```

### Check Frontend
1. Login as SYSTEM_ADMIN
2. Go to Performance → Visibility Rules
3. Verify your rule appears in the list
4. Check that "Is Active" is ✅ checked

---

## Step 2: Verify Rule is Being Loaded

### Check Backend Logs
When fetching an evaluation, you should see:
```
Loaded [X] visibility rules from GridFS
Found [X] active visibility rules out of [Y] total rules
Applying visibility rules for evaluation [ID] with user roles: [HR Employee, Department Employee]
```

### If You See GridFS Errors
If you see: `FileNotFound: file [ID] was not found`

**Solution**: The rule file is corrupted or missing. Do this:
1. Delete all visibility rules in the UI
2. Create a new rule
3. This will recreate the GridFS file

---

## Step 3: Verify User Roles

### Check What Roles the User Has
The system checks **ALL** user roles, not just the first one.

**HR Employee** typically has:
- `HR Employee`
- `Department Employee` (if they're in a department)

### Check Backend Logs
When viewing an evaluation, you should see:
```
Visibility check for FINAL_RATING: role HR Employee canView=false, allowedRoles=HR Manager
Visibility check for FINAL_RATING: role Department Employee canView=false, allowedRoles=HR Manager
User with roles [HR Employee, Department Employee] cannot view FINAL_RATING
```

---

## Step 4: Test the Rule

### Quick Test Steps:

1. **Login as SYSTEM_ADMIN** (`david.rodriguez@company.com` / `Racker123`)
2. **Create Rule**:
   - Field Type: `FINAL_RATING`
   - Allowed Roles: ✅ **ONLY** `HR Manager`
   - ❌ **UNCHECK** everything else (HR Employee, Department Employee, etc.)
   - Is Active: ✅ Checked
3. **Save the rule**
4. **Check backend logs** - should see "Successfully saved X visibility rules"
5. **Login as HR Employee** (`david.kim@company.com` / `Racker123`)
6. **View Final Rating** on a published appraisal
7. **Check backend logs** - should see visibility checks
8. **Expected**: Final rating should be hidden (totalScore = undefined)

---

## Step 5: Check Backend Logs for Debugging

### Enable Debug Logging
The system now logs:
- When rules are loaded
- When rules are saved
- When visibility is checked for each field
- Which roles are being checked
- Whether access is granted or denied

### What to Look For:

**✅ Good Logs (Rule Working)**:
```
Loaded 4 visibility rules from GridFS
Found 4 active visibility rules out of 4 total rules
Applying visibility rules for evaluation 6940ee1cf018a93f371a6bc2 with user roles: [HR Employee, Department Employee]
Visibility check for FINAL_RATING: role HR Employee canView=false, allowedRoles=HR Manager
Visibility check for FINAL_RATING: role Department Employee canView=false, allowedRoles=HR Manager
User with roles [HR Employee, Department Employee] cannot view FINAL_RATING
```

**❌ Bad Logs (Rule Not Working)**:
```
No visibility rule found for FINAL_RATING, allowing access by default
```
This means the rule wasn't found - check if it was saved correctly.

---

## Step 6: Common Issues and Fixes

### Issue 1: Rule Not Found
**Symptom**: Logs show "No visibility rule found for [FIELD], allowing access by default"

**Causes**:
- Rule wasn't saved (check for errors when creating)
- Rule is inactive (check "Is Active" checkbox)
- GridFS file is corrupted

**Fix**:
1. Delete the rule and recreate it
2. Check backend logs for save errors
3. Verify rule appears in the list

---

### Issue 2: Wrong Field Type
**Symptom**: Rule exists but field is still visible

**Check**:
- Did you select the correct `Field Type`?
- `FINAL_RATING` controls `totalScore` and `overallRatingLabel`
- `OVERALL_SCORE` also controls `totalScore` and `overallRatingLabel`
- If you want to hide the final rating, use `FINAL_RATING`

**Fix**:
- Create a rule for `FINAL_RATING` (not `OVERALL_SCORE`)
- Or create rules for both if you want separate control

---

### Issue 3: User Has Multiple Roles
**Symptom**: User can see field even though one of their roles is restricted

**Explanation**:
- The system checks **ALL** user roles
- If **ANY** role can view the field, access is granted
- Example: If user has `HR Employee` (restricted) and `HR Manager` (allowed), they can view it

**Fix**:
- Make sure **ALL** of the user's roles are restricted in the rule
- Or remove the allowed role from the user's profile

---

### Issue 4: GridFS File Missing
**Symptom**: Error "FileNotFound: file [ID] was not found"

**Fix**:
1. The system will automatically recreate the file with default rules
2. Delete all rules and recreate them
3. Check MongoDB GridFS bucket: `visibility_rules.files` collection

---

## Step 7: Manual Database Check

### Check MongoDB
1. Connect to MongoDB
2. Check collection: `visibility_rules.files`
3. Should see a file with `filename: "visibility-rules.json"`
4. Download and check the JSON content

### Check Rule Content
The JSON should look like:
```json
[
  {
    "id": "1234567890",
    "name": "Hide Final Rating from Employees",
    "fieldType": "FINAL_RATING",
    "allowedRoles": ["HR Manager"],
    "isActive": true
  }
]
```

---

## Step 8: Test with API Directly

### Test Rule Loading
```bash
# Login as SYSTEM_ADMIN first to get token
curl -X GET http://localhost:3000/performance/visibility-rules \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return your rules.

### Test Evaluation with Visibility
```bash
# Login as HR Employee to get token
curl -X GET http://localhost:3000/performance/evaluations/EVALUATION_ID \
  -H "Authorization: Bearer HR_EMPLOYEE_TOKEN"
```

Check the response - `totalScore` should be `null` or missing if rule is working.

---

## ✅ Verification Checklist

- [ ] Rule appears in Visibility Rules list
- [ ] Rule has "Is Active" checked
- [ ] Rule has correct Field Type (`FINAL_RATING`)
- [ ] Rule has correct Allowed Roles (only `HR Manager`)
- [ ] Backend logs show rule was saved
- [ ] Backend logs show rule is being loaded
- [ ] Backend logs show visibility checks when viewing evaluation
- [ ] Backend logs show `canView=false` for restricted role
- [ ] Frontend shows field is hidden (or shows "N/A")

---

## 🎯 Quick Fix Command

If rules are completely broken:

1. **Delete all rules** in the UI
2. **Restart backend server** (this will recreate default rules)
3. **Create your custom rule again**
4. **Test immediately**

---

## 📝 Expected Behavior

### When Rule is Working:
- **HR Employee** views evaluation → `totalScore` is `undefined` in response
- **HR Manager** views same evaluation → `totalScore` has a value
- Backend logs show visibility checks and denials

### When Rule is NOT Working:
- **HR Employee** views evaluation → `totalScore` has a value (should be hidden)
- Backend logs show "No visibility rule found" or "allowing access by default"

---

## 🔍 Debugging Commands

### Check Backend Logs
```bash
# Watch backend logs in real-time
# Look for:
# - "Loaded X visibility rules"
# - "Applying visibility rules"
# - "Visibility check for FINAL_RATING"
# - "canView=false" or "canView=true"
```

### Check Frontend Network Tab
1. Open browser DevTools → Network tab
2. Filter: `evaluations`
3. Click "View Final Rating"
4. Check the response - look for `totalScore` field
5. If `totalScore` is `null` or missing → Rule is working ✅
6. If `totalScore` has a value → Rule is NOT working ❌

---

## 💡 Key Points

1. **All Roles Checked**: System checks ALL user roles, not just the first
2. **Any Role Allowed**: If ANY role can view, access is granted
3. **Default Behavior**: If no rule exists, field is visible (default: allow)
4. **Field Mapping**: `FINAL_RATING` → `totalScore` and `overallRatingLabel`
5. **GridFS Storage**: Rules are stored in MongoDB GridFS, not regular collections

---

## 🚨 If Still Not Working

1. **Check backend logs** for errors
2. **Verify rule is active** in the UI
3. **Check user roles** - make sure they match what's in the rule
4. **Restart backend** to reload rules
5. **Clear browser cache** and hard refresh
6. **Check MongoDB** directly to verify rule was saved

