# Performance Module - Complete Testing Guide

## 🎯 Complete User Story Flow Testing

This guide walks you through testing all performance module user stories in the correct order.

---

## 📋 **STEP 1: Setup (HR Manager)**

### REQ-PP-01: Configure Templates
**Role:** HR Manager  
**Action:**
1. Go to Performance → Templates
2. Click "Create Template"
3. Fill in:
   - Template name (e.g., "Annual Performance Review")
   - Rating scale (e.g., 5-point scale: 1-5)
   - Add sections and criteria
   - Set weights
4. Save template

**Expected:** Template created and visible in list

---

### REQ-PP-02: Create Cycle
**Role:** HR Manager  
**Action:**
1. Go to Performance → Cycles
2. Click "Create Cycle"
3. Fill in:
   - Cycle name (e.g., "Q1 2025 Annual Performance")
   - Start date
   - End date
   - Cycle type (Annual/Probationary)
4. Save cycle (status: PLANNED)
5. Click "Activate" button (status: ACTIVE)

**Expected:** Cycle created and activated

---

## 📝 **STEP 2: Assignment (HR Employee)**

### REQ-PP-05: Assign Appraisal
**Role:** HR Employee  
**Action:**
1. Go to Performance → Assignments
2. Click "Assign Template"
3. Select:
   - Template (from Step 1)
   - Cycle (from Step 1)
   - Employee(s) to assign
   - Due date
   - Manager (optional - auto-detects if not specified)
4. Click "Create Assignment"

**Expected:** 
- Assignment created
- Status: NOT_STARTED
- Employee receives notification (check notification bell 🔔)

---

## 👤 **STEP 3: Employee Actions**

### REQ-PP-07: Acknowledge Assignment
**Role:** Employee (the one who was assigned)  
**Action:**
1. Log in as the assigned employee
2. Check notification bell 🔔 - should see "New appraisal assigned"
3. Go to Performance → My Performance
4. Find the assignment card
5. Click "Acknowledge" button
6. Confirm acknowledgment

**Expected:**
- Assignment status changes to: ACKNOWLEDGED
- Notification disappears
- Assignment card shows "Acknowledged" status

---

### REQ-AE-01: View Appraisal Form
**Role:** Employee  
**Action:**
1. Still in Performance → My Performance
2. Click on the assignment card
3. View the template details:
   - Sections
   - Criteria
   - Rating scale
   - Instructions

**Expected:** Full template details displayed

---

### REQ-AE-02: Submit Self-Assessment
**Role:** Employee  
**Action:**
1. On the assignment card, click "Submit Self-Assessment"
2. Fill in ratings for each criterion:
   - Select rating (based on template's rating scale)
   - Add comments/justifications
3. Upload supporting documents (if needed)
4. Click "Submit"

**Expected:**
- Assignment status changes to: SUBMITTED
- Self-assessment saved
- Manager can now review

---

## 👔 **STEP 4: Manager Actions (Line Manager/DEPARTMENT_HEAD)**

### REQ-PP-13: View Assigned Forms
**Role:** Line Manager (Department Head)  
**Action:**
1. Log in as the employee's manager (Department Head)
2. Go to Performance → Team Reviews
3. See list of direct reports with assignments

**Expected:** List shows employees with assignments

---

### REQ-AE-03: Complete Manager Rating
**Role:** Line Manager  
**Action:**
1. In Team Reviews, click on an employee's assignment
2. Click "Review" or "Complete Evaluation"
3. Fill in manager ratings:
   - Rate each criterion (can differ from employee's self-assessment)
   - Add overall comments
4. Click "Save" or "Submit"

**Expected:**
- Manager ratings saved
- Overall score calculated
- Assignment status: SUBMITTED (if employee already submitted) or stays NOT_STARTED

---

### REQ-AE-04: Add Feedback/Comments
**Role:** Line Manager  
**Action:**
1. While reviewing, add:
   - Strengths
   - Areas for improvement
   - Development recommendations
   - Examples
2. Save evaluation

**Expected:** All feedback saved and visible

---

### REQ-PP-12: Set Objectives (Optional)
**Role:** Line Manager  
**Action:**
1. During evaluation, set goals/objectives for next period
2. Add development plans

**Expected:** Objectives saved

---

## 📊 **STEP 5: HR Employee Monitoring**

### REQ-AE-06: Monitor Progress
**Role:** HR Employee  
**Action:**
1. Log back in as HR Employee
2. Go to Performance → Assignments
3. View assignment list:
   - See status of all assignments
   - Filter by cycle, status, etc.
4. Check progress dashboard (if available)

**Expected:** 
- See all assignments and their statuses
- Track completion progress

---

## 🔔 **STEP 6: Publishing (HR Manager)**

### Publish Cycle
**Role:** HR Manager  
**Action:**
1. Log in as HR Manager
2. Go to Performance → Cycles
3. Find the active cycle
4. Click "Publish" button

**Expected:**
- Cycle status: PUBLISHED
- Assignment status: PUBLISHED
- Employees can now view final ratings

---

## 👤 **STEP 7: Employee Final View**

### REQ-OD-01: View Final Ratings
**Role:** Employee  
**Action:**
1. Log in as employee
2. Go to Performance → My Performance
3. Click on published assignment
4. View:
   - Final ratings (manager's ratings)
   - Overall score
   - Manager's feedback
   - Development recommendations

**Expected:** Complete evaluation visible

---

### REQ-AE-07: Flag Concern (Optional)
**Role:** Employee  
**Action:**
1. If employee disagrees with rating
2. Click "Flag Concern" or "Create Dispute"
3. Fill in:
   - Concern description
   - Reason
4. Submit dispute

**Expected:**
- Dispute created
- Status: PENDING
- HR Manager notified

---

## 👔 **STEP 8: Manager Advanced Actions**

### REQ-OD-03: Flag High Performer
**Role:** Line Manager  
**Action:**
1. Log in as manager
2. Go to Performance → Team Reviews
3. Find high-performing employee
4. Click "Flag High Performer" (if available)

**Expected:** Employee flagged for promotion consideration

---

### REQ-OD-05: Initiate PIP (Optional)
**Role:** Line Manager  
**Action:**
1. For underperforming employee
2. Click "Create Performance Improvement Plan"
3. Fill in PIP details
4. Submit

**Expected:** PIP created

---

## 👥 **STEP 9: HR Manager Actions**

### REQ-AE-10: View Consolidated Dashboard
**Role:** HR Manager  
**Action:**
1. Log in as HR Manager
2. Go to Performance → Consolidated Dashboard
3. View:
   - Overall completion rates
   - Department-wise progress
   - Status breakdown

**Expected:** Dashboard shows completion metrics

---

### REQ-OD-07: Resolve Dispute
**Role:** HR Manager  
**Action:**
1. If dispute was created (Step 7)
2. Go to Performance → Disputes
3. Click on dispute
4. Review details
5. Make decision:
   - Approve (adjust rating)
   - Reject (keep original)
   - Request more info
6. Add resolution comments
7. Resolve dispute

**Expected:**
- Dispute status: RESOLVED
- Rating updated (if approved)
- Employee notified

---

## 📤 **STEP 10: Export & Reporting**

### REQ-AE-11: Export Summaries
**Role:** HR Employee  
**Action:**
1. Log in as HR Employee
2. Go to Performance → Assignments
3. Click "Export" or find export option
4. Export appraisal summaries

**Expected:** CSV/Excel file downloaded

---

### REQ-OD-06: Generate Outcome Report
**Role:** HR Employee  
**Action:**
1. Find "Generate Report" or "Export Report" option
2. Select cycle
3. Generate report

**Expected:** Report generated with outcomes

---

## 📚 **STEP 11: History**

### REQ-OD-08: View History
**Role:** Employee or Manager  
**Action:**
1. Go to Performance → History
2. View past appraisals
3. See multi-cycle trends

**Expected:** Historical data displayed

---

## ✅ **Testing Checklist**

### Setup Phase
- [ ] HR Manager creates template
- [ ] HR Manager creates cycle
- [ ] HR Manager activates cycle

### Assignment Phase
- [ ] HR Employee assigns to employee(s)
- [ ] Notification sent to employee

### Employee Phase
- [ ] Employee acknowledges assignment
- [ ] Employee views appraisal form
- [ ] Employee submits self-assessment

### Manager Phase
- [ ] Manager views assigned forms
- [ ] Manager completes ratings
- [ ] Manager adds feedback
- [ ] Manager flags high performer (optional)
- [ ] Manager creates PIP (optional)

### HR Monitoring
- [ ] HR Employee monitors progress
- [ ] HR Employee exports summaries

### Publishing & Final
- [ ] HR Manager publishes cycle
- [ ] Employee views final ratings
- [ ] Employee creates dispute (optional)
- [ ] HR Manager resolves dispute (if created)

### Reporting
- [ ] HR Employee exports reports
- [ ] View history/trends

---

## 🔍 **Key Things to Test**

1. **Status Flow:**
   - NOT_STARTED → ACKNOWLEDGED → SUBMITTED → PUBLISHED → ACKNOWLEDGED

2. **Role Permissions:**
   - HR Employee can only assign (not create templates)
   - HR Manager can create templates/cycles
   - Line Manager can only review their direct reports
   - Employee can only see their own assignments

3. **Rating Calculations:**
   - Self-assessment ratings
   - Manager ratings
   - Overall score calculation
   - Weighted averages

4. **Notifications:**
   - Assignment notification
   - Submission notification
   - Publishing notification
   - Dispute notification

5. **Data Integrity:**
   - Employees must have department
   - Employees must have manager
   - Templates must be active
   - Cycles must be active

---

## 🐛 **Common Issues to Watch For**

1. **403 Forbidden:** Check if role has permission
2. **Missing Data:** Check if employee has department/position
3. **No Manager:** Check org structure for reporting lines
4. **Template Inactive:** Ensure template is active
5. **Cycle Not Active:** Ensure cycle is activated

---

## 📝 **Notes**

- You can test with multiple employees
- You can test dispute flow by creating a dispute
- History view shows past appraisals
- Export functionality generates reports
- All actions are logged for audit

---

**Happy Testing! 🚀**

