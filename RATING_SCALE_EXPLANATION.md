# Rating Scale Configuration - Complete Explanation

## Overview

The rating scale configuration determines what rating values employees and managers can select when evaluating performance criteria in an appraisal.

## Rating Scale Components

### 1. **Scale Type** (Required)
- **THREE_POINT**: 3-point rating scale (e.g., 1-3)
- **FIVE_POINT**: 5-point rating scale (e.g., 1-5) - **Most Common**
- **TEN_POINT**: 10-point rating scale (e.g., 1-10)

### 2. **Minimum Value** (Required)
- The lowest rating value that can be selected
- Typically starts at `1` (but can be `0` or any positive number)

### 3. **Maximum Value** (Required)
- The highest rating value that can be selected
- Must be greater than or equal to minimum value
- For standard scales:
  - THREE_POINT: `min=1, max=3`
  - FIVE_POINT: `min=1, max=5`
  - TEN_POINT: `min=1, max=10`

### 4. **Step** (Optional, Default: 1)
- **CRITICAL**: Determines the increment between available rating values
- Controls how many rating options are generated
- **How it works:**
  - The system generates rating options by starting at `min` and adding `step` until reaching `max`
  - Formula: `for (let i = min; i <= max; i += step)`

### 5. **Labels** (Optional)
- Array of text labels that map to rating values
- Used to display human-readable labels instead of just numbers
- Example: `["Poor", "Fair", "Good", "Very Good", "Excellent"]` for a 5-point scale

---

## How Step Works - Examples

### Example 1: Standard 5-Point Scale
```
Type: FIVE_POINT
Min: 1
Max: 5
Step: 1
```
**Generated Rating Options:** `1, 2, 3, 4, 5` (5 options)

### Example 2: 5-Point Scale with Half-Points
```
Type: FIVE_POINT
Min: 1
Max: 5
Step: 0.5
```
**Generated Rating Options:** `1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5` (9 options)

### Example 3: 10-Point Scale
```
Type: TEN_POINT
Min: 1
Max: 10
Step: 1
```
**Generated Rating Options:** `1, 2, 3, 4, 5, 6, 7, 8, 9, 10` (10 options)

### Example 4: Custom Scale with Decimal Steps
```
Type: FIVE_POINT
Min: 1
Max: 5
Step: 0.25
```
**Generated Rating Options:** `1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5` (17 options)

### ❌ Example 5: WRONG Step Value (Current Bug)
```
Type: FIVE_POINT
Min: 1
Max: 5
Step: 1.1  ← WRONG! This doesn't make sense
```
**Generated Rating Options:** `1, 2.1, 3.2, 4.3` (only 4 options, and doesn't reach 5!)

---

## How Labels Map to Ratings

If you provide labels, they map to rating values based on the step:

### Example with Labels:
```
Type: FIVE_POINT
Min: 1
Max: 5
Step: 1
Labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
```

**Mapping:**
- Rating `1` → Label `"Poor"` (labels[0])
- Rating `2` → Label `"Fair"` (labels[1])
- Rating `3` → Label `"Good"` (labels[2])
- Rating `4` → Label `"Very Good"` (labels[3])
- Rating `5` → Label `"Excellent"` (labels[4])

**Formula:** `labelIndex = Math.round((rating - min) / step)`

### Example with Half-Point Steps:
```
Type: FIVE_POINT
Min: 1
Max: 5
Step: 0.5
Labels: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
```

**Mapping:**
- Rating `1` → Label `"Poor"` (labels[0])
- Rating `1.5` → Label `"Poor"` (labels[0]) - rounds to nearest
- Rating `2` → Label `"Fair"` (labels[1])
- Rating `2.5` → Label `"Fair"` (labels[1])
- Rating `3` → Label `"Good"` (labels[2])
- etc.

---

## How Rating and Evaluation Works

### Step 1: Template Creation (HR Manager)
1. HR Manager creates an appraisal template
2. Configures rating scale (type, min, max, step, labels)
3. Defines evaluation criteria (each with optional weight)
4. Example:
   - Rating Scale: `min=1, max=5, step=1`
   - Criteria: "Communication" (weight: 30%), "Technical Skills" (weight: 40%), "Teamwork" (weight: 30%)

### Step 2: Employee Self-Assessment
1. Employee receives appraisal assignment
2. For each criterion, employee selects a rating from available options
3. Available options are generated using: `for (i = min; i <= max; i += step)`
4. Example selections:
   - Communication: `4` (Very Good)
   - Technical Skills: `5` (Excellent)
   - Teamwork: `3` (Good)

### Step 3: Manager Review
1. Manager reviews employee's self-assessment
2. Manager can adjust ratings for each criterion
3. Manager can see the same rating options as employee
4. Manager provides overall rating (0-100%)

### Step 4: Rating Calculation

#### For Each Criterion:
1. **Normalize Rating to Percentage:**
   ```
   normalizedPercentage = ((ratingValue - min) / (max - min)) * 100
   ```
   Example: Rating `4` on 1-5 scale
   - `((4 - 1) / (5 - 1)) * 100 = (3 / 4) * 100 = 75%`

2. **Calculate Weighted Score:**
   ```
   weightedScore = (normalizedPercentage * criterionWeight) / 100
   ```
   Example: Communication criterion with weight 30%
   - `(75 * 30) / 100 = 22.5 points`

#### Total Score:
```
totalScore = sum of all weightedScores
```
Example:
- Communication: 22.5 points (rating 4, weight 30%)
- Technical Skills: 40 points (rating 5, weight 40%)
- Teamwork: 22.5 points (rating 3, weight 30%)
- **Total: 85%**

### Step 5: Final Evaluation
- Total score is stored as percentage (0-100%)
- Rating label is determined using `getRatingLabel()` function
- Appraisal record is created with all ratings and scores

---

## Common Use Cases

### Use Case 1: Standard 5-Point Scale
**Configuration:**
- Type: `FIVE_POINT`
- Min: `1`
- Max: `5`
- Step: `1`
- Labels: `["Poor", "Fair", "Good", "Very Good", "Excellent"]`

**Result:** Employees can select: 1, 2, 3, 4, or 5

### Use Case 2: Detailed 5-Point Scale (Half-Points)
**Configuration:**
- Type: `FIVE_POINT`
- Min: `1`
- Max: `5`
- Step: `0.5`
- Labels: `["Poor", "Fair", "Good", "Very Good", "Excellent"]`

**Result:** Employees can select: 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, or 5 (more granular)

### Use Case 3: 10-Point Scale
**Configuration:**
- Type: `TEN_POINT`
- Min: `1`
- Max: `10`
- Step: `1`
- Labels: `["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]` (or custom labels)

**Result:** Employees can select: 1, 2, 3, 4, 5, 6, 7, 8, 9, or 10

---

## Important Notes

1. **Step Must Make Sense:**
   - For integer scales (1-5, 1-10), step should typically be `1`
   - For decimal scales, step should divide evenly into the range
   - Step of `1.1` on a 1-5 scale is **WRONG** and will not generate proper options

2. **Labels Array Length:**
   - Should match the number of rating options generated
   - If you have 5 options (step=1, min=1, max=5), you should have 5 labels
   - If labels are missing, the system displays the numeric value

3. **Default Values:**
   - **FIXED**: Default step is now `1` (was incorrectly `1.1`)
   - When scale type changes, min/max/step auto-update to defaults

4. **Rating Normalization:**
   - All ratings are normalized to 0-100% for calculation
   - This allows different scales (3-point, 5-point, 10-point) to be compared

5. **Weighted Scoring:**
   - Criteria can have weights (must sum to 100% if used)
   - Final score = weighted average of normalized ratings

---

## Fixed Issues

1. ✅ **Default Step**: Changed from `1.1` to `1` for all scale types
2. ✅ **Auto-Update**: When scale type changes, min/max/step auto-update to sensible defaults
3. ✅ **Step Buttons**: Changed increment/decrement from `±1.0` to `±0.1` for finer control

---

## Summary

**Step** determines the increment between rating values. For standard scales:
- **FIVE_POINT**: step = `1` (gives: 1, 2, 3, 4, 5)
- **THREE_POINT**: step = `1` (gives: 1, 2, 3)
- **TEN_POINT**: step = `1` (gives: 1, 2, 3, ..., 10)

The step value directly controls how many rating options are available to employees and managers during evaluation.

