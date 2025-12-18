# Change Request Management - Frontend Implementation Plan

## 🎯 Overview

Add Change Request Management to the Organization Structure module. Users can propose changes that need approval before being implemented.

---

## 📁 File Structure (What to Create)

```
app/modules/organization-structure/
├── page.tsx (existing - main page)
├── change-requests/
│   ├── page.tsx (NEW - list of all change requests)
│   ├── page.module.css (NEW)
│   ├── components/
│   │   ├── ChangeRequestList.tsx (NEW - table/list component)
│   │   ├── CreateChangeRequestForm.tsx (NEW - form to create request)
│   │   ├── ChangeRequestDetails.tsx (NEW - view single request)
│   │   ├── ReviewChangeRequest.tsx (NEW - approve/reject component)
│   │   └── ChangeRequestFilters.tsx (NEW - filter by status/type)
│   └── types/
│       └── index.ts (NEW - TypeScript types)
├── api/
│   └── orgStructureApi.ts (existing - ADD change request functions)
└── types/
    └── index.ts (existing - ADD change request types)
```

---

## 🔄 User Flow & Navigation

### Flow 1: Creating a Change Request

```
Organization Structure Page
  ↓
User clicks "Create Change Request" button (new button in header)
  ↓
Opens Modal OR Navigate to: /modules/organization-structure/change-requests/new
  ↓
CreateChangeRequestForm Component
  ├── Select Request Type (dropdown)
  │   ├── NEW_DEPARTMENT
  │   ├── UPDATE_DEPARTMENT
  │   ├── NEW_POSITION
  │   ├── UPDATE_POSITION
  │   └── CLOSE_POSITION
  ├── Fill Details (based on type)
  ├── Add Reason (required)
  └── Click "Save as Draft" or "Submit for Review"
      ↓
      If "Save as Draft": Status = DRAFT
      If "Submit": Status = SUBMITTED
      ↓
      Redirect to Change Requests List
```

### Flow 2: Viewing Change Requests

```
Organization Structure Page
  ↓
User clicks "Change Requests" tab/button (new navigation)
  ↓
Change Requests List Page (/modules/organization-structure/change-requests)
  ├── Shows table/list of all requests
  ├── Filters: Status, Type, Search
  ├── Each row shows:
  │   ├── Request Number (ORG-2024-0001)
  │   ├── Type (NEW_DEPARTMENT, etc.)
  │   ├── Status (DRAFT, SUBMITTED, APPROVED, etc.)
  │   ├── Requested By (person name)
  │   ├── Date
  │   └── Actions button
  ↓
User clicks on a request
  ↓
Change Request Details Page/Modal
  ├── Shows all request information
  ├── Shows status history
  ├── Shows approver comments
  └── Action buttons (based on status and user role)
```

### Flow 3: Reviewing/Approving Requests

```
HR Manager/Admin views Change Requests List
  ↓
Sees requests with status = SUBMITTED
  ↓
Clicks on a request
  ↓
Change Request Details View
  ├── Shows request details
  ├── Shows who requested it
  └── Shows Review Section:
      ├── "Approve" button
      ├── "Reject" button
      └── Comments field
  ↓
User clicks "Approve" or "Reject"
  ↓
Confirmation modal
  ↓
API call to approve/reject
  ↓
Status updates
  ↓
Refresh list
```

---

## 🎨 UI/UX Design Ideas

### Option 1: Tab-Based Navigation (Recommended)

```
┌─────────────────────────────────────────────────────┐
│  Organization Structure                             │
├─────────────────────────────────────────────────────┤
│  [Departments] [Change Requests] ← Tabs            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Content based on selected tab                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Main Page Structure:**
```tsx
// page.tsx
<Tabs>
  <Tab name="Departments">
    <DepartmentList />
  </Tab>
  <Tab name="Change Requests">
    <ChangeRequestList />
  </Tab>
</Tabs>
```

### Option 2: Separate Page with Navigation

```
Organization Structure Page
  ├── Header with buttons:
  │   ├── "Departments" (current view)
  │   ├── "Change Requests" (new button)
  │   └── "+ Add Department"
  │
  └── When "Change Requests" clicked:
      → Navigate to /modules/organization-structure/change-requests
      → Shows Change Requests List Page
```

### Option 3: Modal-Based (Simpler)

```
Organization Structure Page
  ├── Add button: "Create Change Request"
  │   → Opens Modal with CreateChangeRequestForm
  │
  └── Add button: "View Change Requests"
      → Opens Modal with ChangeRequestList
      → Can click on request to see details
```

**Recommendation: Option 1 (Tabs)** - Cleanest and most organized

---

## 📋 Component Breakdown

### 1. ChangeRequestList Component

**Purpose:** Display all change requests in a table/list

**Features:**
- Table with columns:
  - Request Number (ORG-2024-0001)
  - Type (badge: NEW_DEPARTMENT, UPDATE_POSITION, etc.)
  - Status (badge with color: DRAFT, SUBMITTED, APPROVED, etc.)
  - Requested By (person name)
  - Date Created
  - Actions (View, Edit if DRAFT, etc.)
- Filters:
  - Status dropdown (All, DRAFT, SUBMITTED, APPROVED, REJECTED)
  - Type dropdown (All, NEW_DEPARTMENT, etc.)
  - Search by request number
- Pagination
- "Create New Request" button

**Props:**
```tsx
interface ChangeRequestListProps {
  onViewRequest: (id: string) => void;
  onCreateRequest: () => void;
}
```

---

### 2. CreateChangeRequestForm Component

**Purpose:** Form to create a new change request

**Features:**
- Request Type dropdown (required)
  - NEW_DEPARTMENT
  - UPDATE_DEPARTMENT
  - NEW_POSITION
  - UPDATE_POSITION
  - CLOSE_POSITION
- Dynamic fields based on type:
  - **NEW_DEPARTMENT**: Department code, name, description, cost center
  - **UPDATE_DEPARTMENT**: Select department + fields to update
  - **NEW_POSITION**: Position code, title, department, reporting position
  - **UPDATE_POSITION**: Select position + fields to update
  - **CLOSE_POSITION**: Select position + reason
- Reason field (required, textarea)
- Details field (optional, textarea)
- Buttons:
  - "Save as Draft" (creates with DRAFT status)
  - "Submit for Review" (creates with SUBMITTED status)
  - "Cancel"

**Props:**
```tsx
interface CreateChangeRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}
```

---

### 3. ChangeRequestDetails Component

**Purpose:** View details of a single change request

**Features:**
- Display all request information:
  - Request Number
  - Type
  - Status (with badge)
  - Requested By (person name)
  - Date Created
  - Submitted Date (if submitted)
  - Details
  - Reason
  - Target Department/Position (if applicable)
- Status History Timeline:
  - Created → DRAFT
  - Submitted → SUBMITTED (by who, when)
  - Reviewed → APPROVED/REJECTED (by who, when, comments)
- Action buttons (based on status and user role):
  - **DRAFT**: Edit, Submit, Cancel
  - **SUBMITTED** (if HR role): Approve, Reject
  - **APPROVED/REJECTED**: View only

**Props:**
```tsx
interface ChangeRequestDetailsProps {
  requestId: string;
  onClose: () => void;
  onUpdate: () => void;
}
```

---

### 4. ReviewChangeRequest Component

**Purpose:** Component for HR to approve/reject requests

**Features:**
- Shows request details (read-only)
- Approve button
- Reject button
- Comments field (optional)
- Confirmation before submitting

**Props:**
```tsx
interface ReviewChangeRequestProps {
  requestId: string;
  onApprove: (comments?: string) => void;
  onReject: (reason: string) => void;
}
```

---

## 🔗 Integration with Existing Code

### Update Main Page (page.tsx)

**Add Tab Navigation:**
```tsx
// Add state for active tab
const [activeTab, setActiveTab] = useState<'departments' | 'change-requests'>('departments');

// Add tabs UI
<Tabs>
  <Tab onClick={() => setActiveTab('departments')}>
    Departments
  </Tab>
  <Tab onClick={() => setActiveTab('change-requests')}>
    Change Requests
  </Tab>
</Tabs>

// Show content based on tab
{activeTab === 'departments' && <DepartmentList />}
{activeTab === 'change-requests' && <ChangeRequestList />}
```

### Update API File (orgStructureApi.ts)

**Add new functions:**
```tsx
// Create change request
export async function createChangeRequest(data: CreateChangeRequestDto)

// Get all change requests
export async function getChangeRequests(params?: {...})

// Get change request by ID
export async function getChangeRequestById(id: string)

// Update change request (draft only)
export async function updateChangeRequest(id: string, data: UpdateChangeRequestDto)

// Submit for review
export async function submitChangeRequest(id: string)

// Review (approve/reject)
export async function reviewChangeRequest(id: string, approved: boolean, comments?: string)

// Approve (system admin only)
export async function approveChangeRequest(id: string, comments?: string)

// Reject
export async function rejectChangeRequest(id: string, reason: string)

// Cancel
export async function cancelChangeRequest(id: string)
```

### Update Types (types/index.ts)

**Add new types:**
```tsx
export enum ChangeRequestType {
  NEW_DEPARTMENT = 'NEW_DEPARTMENT',
  UPDATE_DEPARTMENT = 'UPDATE_DEPARTMENT',
  NEW_POSITION = 'NEW_POSITION',
  UPDATE_POSITION = 'UPDATE_POSITION',
  CLOSE_POSITION = 'CLOSE_POSITION',
}

export enum ChangeRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  IMPLEMENTED = 'IMPLEMENTED',
}

export interface ChangeRequest {
  _id: string;
  requestNumber: string;
  requestType: ChangeRequestType;
  status: ChangeRequestStatus;
  targetDepartmentId?: string;
  targetPositionId?: string;
  details?: string;
  reason?: string;
  requestedByEmployeeId: string;
  submittedByEmployeeId?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎯 Step-by-Step Implementation Order

### Phase 1: Basic Setup
1. ✅ Add types to `types/index.ts`
2. ✅ Add API functions to `orgStructureApi.ts`
3. ✅ Create `change-requests/` folder structure

### Phase 2: List View
4. ✅ Create `ChangeRequestList` component
5. ✅ Create list page or integrate into main page
6. ✅ Add filters and search

### Phase 3: Create Form
7. ✅ Create `CreateChangeRequestForm` component
8. ✅ Handle different request types dynamically
9. ✅ Add validation

### Phase 4: Details & Review
10. ✅ Create `ChangeRequestDetails` component
11. ✅ Create `ReviewChangeRequest` component
12. ✅ Add status-based actions

### Phase 5: Integration
13. ✅ Add tabs/navigation to main page
14. ✅ Connect all components
15. ✅ Add role-based permissions
16. ✅ Test full workflow

---

## 🎨 UI Mockup Ideas

### Change Requests List Table

```
┌─────────────────────────────────────────────────────────────────┐
│  Change Requests                    [+ Create Request]         │
├─────────────────────────────────────────────────────────────────┤
│  Filters: [Status: All ▼] [Type: All ▼] [Search: ____]        │
├─────────────────────────────────────────────────────────────────┤
│  #        │ Type          │ Status    │ Requested By │ Date    │
├───────────┼───────────────┼───────────┼──────────────┼─────────┤
│ ORG-0001  │ NEW_DEPT      │ SUBMITTED │ Sarah        │ Jan 15  │
│           │ [Badge: Blue] │ [Badge:   │              │         │
│           │               │  Yellow]  │              │         │
│           │               │           │              │ [View]  │
├───────────┼───────────────┼───────────┼──────────────┼─────────┤
│ ORG-0002  │ UPDATE_POS    │ DRAFT     │ Mike         │ Jan 16  │
│           │ [Badge: Green]│ [Badge:   │              │         │
│           │               │  Gray]    │              │         │
│           │               │           │              │ [Edit]  │
└─────────────────────────────────────────────────────────────────┘
```

### Create Request Form

```
┌─────────────────────────────────────────────────────┐
│  Create Change Request                              │
├─────────────────────────────────────────────────────┤
│  Request Type: [NEW_DEPARTMENT ▼]                  │
│                                                     │
│  Department Code: [____]                           │
│  Department Name: [____]                           │
│  Description: [____]                               │
│  Cost Center: [____]                               │
│                                                     │
│  Reason: * [Required field]                        │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Details (Optional):                                │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  [Save as Draft]  [Submit for Review]  [Cancel]   │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Role-Based Access

**Who can do what:**

- **HR_ADMIN, SYSTEM_ADMIN, DEPARTMENT_HEAD:**
  - ✅ Create change requests
  - ✅ Edit DRAFT requests
  - ✅ Submit requests
  - ✅ Cancel their own requests

- **HR_ADMIN, HR_MANAGER, SYSTEM_ADMIN:**
  - ✅ View all requests
  - ✅ Review/Approve/Reject SUBMITTED requests

- **SYSTEM_ADMIN only:**
  - ✅ Final approval (approve endpoint)

---

## 💡 Quick Implementation Tips

1. **Start Simple:**
   - First, build the list view
   - Then the create form
   - Then details/review

2. **Reuse Components:**
   - Use existing Modal, Card, Button components
   - Use existing form patterns from CreateDepartmentForm

3. **Status Badges:**
   - DRAFT: Gray
   - SUBMITTED: Yellow/Orange
   - APPROVED: Green
   - REJECTED: Red
   - CANCELED: Gray
   - IMPLEMENTED: Blue

4. **Request Number Format:**
   - Backend auto-generates: `ORG-2024-0001`
   - Just display it, don't create it

5. **Dynamic Forms:**
   - Show different fields based on selected request type
   - Use conditional rendering

---

## ✅ Summary

**What to build:**
1. Change Requests List (table with filters)
2. Create Request Form (with dynamic fields)
3. Request Details View (with actions)
4. Review Component (approve/reject)
5. Integration with main page (tabs or navigation)

**Where:**
- New folder: `app/modules/organization-structure/change-requests/`
- Update: `page.tsx`, `api/orgStructureApi.ts`, `types/index.ts`

**Flow:**
Create → Draft → Submit → Review → Approve/Reject → Implement

Does this plan make sense? Ready to start implementing? 🚀

