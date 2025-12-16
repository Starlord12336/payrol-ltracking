# Template Delete Permission Analysis

## User Story
**REQ-PP-01**: "HR Manager configures standardized appraisal templates and rating scales."

## Analysis
The word "configures" in the user story typically implies full CRUD operations:
- **Create** - HR Manager creates templates ✅
- **Read** - HR Manager views templates ✅
- **Update** - HR Manager updates templates ✅
- **Delete** - HR Manager should be able to delete templates ✅

## Current Implementation
- **Backend Guard**: `HR_ADMIN` only ❌
- **Frontend**: Delete button visible to all who can view templates (HR_MANAGER)

## Decision
Since REQ-PP-01 says "HR Manager configures" templates, and we've made Create and Update `HR_MANAGER` only, **Delete should also be `HR_MANAGER` only** for consistency.

## Change Made
✅ Changed backend guard from `HR_ADMIN` → `HR_MANAGER` for template deletion

This ensures:
1. Consistency with Create/Update operations
2. HR Manager has full control over template lifecycle
3. Matches the intent of "configures" in the user story

