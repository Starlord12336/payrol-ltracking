# HR System Frontend

Frontend application for the HR Management System built with Next.js 14, TypeScript, and a warm, cozy design system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env

# Run development server (runs on port 3001 by default)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Default Ports:**
- Frontend: `http://localhost:3001` (Next.js default)
- Backend: `http://localhost:3000` (NestJS default)

---

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── login/                    # Login page
│   ├── register/                # Registration page
│   └── modules/                  # Module-specific pages
│       ├── employee-profile/
│       ├── leaves/
│       ├── organization-structure/
│       ├── payroll-configuration/
│       ├── payroll-execution/
│       ├── payroll-tracking/
│       ├── performance/
│       ├── recruitment/
│       └── time-management/
│
├── shared/                       # Shared resources (used by all modules)
│   ├── components/              # Reusable UI components
│   ├── styles/                  # Global styles and theme
│   ├── utils/                   # Utility functions (API client, formatting, etc.)
│   ├── hooks/                   # Shared React hooks
│   ├── types/                   # TypeScript types
│   └── constants/               # Constants (endpoints, routes, etc.)
│
└── .env                         # Environment variables
```

---

## 📦 Central Import Pattern

### ⚠️ IMPORTANT: Always Import from Central Index Files

**All shared resources are exported through central `index.ts` files. Always import from these:**

```tsx
// ✅ CORRECT - Import from central index files
import { Button, Card, Input, Modal, ProtectedRoute } from '@/shared/components';
import { useAuth, useAuthNoCheck } from '@/shared/hooks';
import { API_ENDPOINTS, ENV } from '@/shared/constants';
import { apiClient } from '@/shared/utils/api';
import type { AuthUser, LoginDto } from '@/shared/types';

// ❌ WRONG - Don't import directly from subfolders
import { Button } from '@/shared/components/Button/Button';
import { useAuth } from '@/shared/hooks/useAuth';
```

### Central Index Files

- **Components:** `@/shared/components` → Exports all UI components
- **Hooks:** `@/shared/hooks` → Exports all React hooks
- **Constants:** `@/shared/constants` → Exports API endpoints, env vars
- **Types:** `@/shared/types` → Exports all TypeScript types
- **Utils:** `@/shared/utils/api` → Exports API client

**Why?**
- ✅ Single source of truth
- ✅ Easier refactoring
- ✅ Consistent imports across teams
- ✅ Better tree-shaking

---

## 🎨 Shared UI Components

All teams use shared components from `shared/components/` to maintain UI consistency across modules.

**Always import from:** `@/shared/components`

### Available Components

#### Button
```tsx
import { Button } from '@/shared/components';

<Button variant="primary" size="lg" onClick={handleClick}>
  Submit
</Button>
```

**Variants:** `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `outline`, `ghost`  
**Sizes:** `sm`, `md`, `lg`  
**Props:** `fullWidth`, `isLoading`, `disabled`

#### Card
```tsx
import { Card } from '@/shared/components';

<Card padding="lg" shadow="warm" hover>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>
```

**Props:**
- `padding`: `none` | `sm` | `md` | `lg`
- `shadow`: `none` | `sm` | `md` | `lg` | `warm`
- `hover`: boolean (adds hover effect)

#### Input
```tsx
import { Input } from '@/shared/components';

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="Enter your email address"
  required
  fullWidth
/>
```

**Props:** `label`, `error`, `helperText`, `fullWidth`, `required`, all standard input props

#### Modal
```tsx
import { Modal } from '@/shared/components';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Modal content</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string (optional)
- `size`: `sm` | `md` | `lg` | `xl`

#### ProtectedRoute
```tsx
import { ProtectedRoute } from '@/shared/components';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

**Props:**
- `children`: React.ReactNode (required)
- `redirectTo?`: string (defaults to `/login`)
- `showLoading?`: boolean (defaults to `true`)
- `loadingComponent?`: React.ReactNode

**⚠️ Always use this for protected pages!**

### Design System

**Colors:**
- Backgrounds: Warm whites (`#fef9f3`, `#fff8ee`)
- Primary: Terracotta orange (`#e76f51`)
- Accent: Teal green (`#2a9d8f`)
- Success: Warm green (`#8ac926`)
- Warning: Golden orange (`#ff9f1c`)
- Borders: Light warm gray (`#e2dcd0`)

**Typography:**
- Font: Inter
- Weights: 300-900 (bold for headings: 700-900)

**Spacing:**
- Consistent spacing scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)

**Border Radius:**
- Default: 16px (cozy rounded corners)

**Shadows:**
- Warm orange-tinted shadows for depth

---

## 🌐 API Calls

### How API Calls Work

All API calls go through a centralized API client (`shared/utils/api.ts`) that:
- Automatically includes cookies (for authentication)
- Handles errors (401 redirects to login)
- Uses the base URL from `.env`

### Making API Calls

```tsx
import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';

// GET request
const response = await apiClient.get(API_ENDPOINTS.EMPLOYEE_PROFILE);
const employees = response.data;

// POST request
const result = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
  email: 'user@example.com',
  password: 'password123'
});

// PUT request
await apiClient.put(`/employee-profile/${id}`, updatedData);

// DELETE request
await apiClient.delete(`/employee-profile/${id}`);
```

### Why `.env` is Extremely Important

The `.env` file tells the frontend **where your backend is located**. Without it, API calls will fail!

**What happens:**
1. You call `apiClient.get('/auth/me')`
2. API client reads `NEXT_PUBLIC_API_URL` from `.env`
3. Makes request to: `http://localhost:3000/auth/me` (or your configured URL)

**If `.env` is missing or wrong:**
- ❌ API calls go to wrong URL
- ❌ Authentication fails
- ❌ Data fetching fails
- ❌ Application breaks

**Always set `.env` before running the app!**

```env
# .env file (REQUIRED)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Different environments:**
```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Production
NEXT_PUBLIC_API_URL=https://api.yourcompany.com
```

**Important:**
- Must restart dev server after changing `.env`
- Variable must start with `NEXT_PUBLIC_` to be accessible in browser
- Never commit `.env` to git (it's in `.gitignore`)

---

## 🔐 Authentication System

### Overview

The frontend uses **cookie-based JWT authentication** with automatic 401 handling. The system includes:
- **Two auth hooks** for different use cases
- **ProtectedRoute component** for route protection
- **Centralized API client** with automatic redirects
- **Centralized auth API** functions

### ⚠️ IMPORTANT: Always Use Protected Routes

**For ALL protected pages, you MUST use the `ProtectedRoute` component:**

```tsx
import { ProtectedRoute } from '@/shared/components';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Your protected content here</div>
    </ProtectedRoute>
  );
}
```

**Why?**
- ✅ Automatic redirect to login if not authenticated
- ✅ Shows loading state while checking auth
- ✅ Prevents flash of protected content
- ✅ Works even if subteams forget to add guards

**Example: Employee Profile (already implemented)**
```tsx
// app/modules/employee-profile/page.tsx
import { ProtectedRoute } from '@/shared/components';

function EmployeeProfileContent() {
  // Your page content
}

export default function EmployeeProfilePage() {
  return (
    <ProtectedRoute>
      <EmployeeProfileContent />
    </ProtectedRoute>
  );
}
```

### Authentication Hooks

#### 1. `useAuth` - For Protected Pages

**Use this in:** Dashboards, layouts, and protected pages (NOT login/register)

```tsx
import { useAuth } from '@/shared/hooks/useAuth';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // ProtectedRoute handles redirect

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**What it does:**
- Calls `/auth/me` on mount to check authentication
- Returns user data, loading state, and auth methods
- Use with `ProtectedRoute` for automatic redirects

#### 2. `useAuthNoCheck` - For Login/Register Pages ONLY

**Use this ONLY in:** `/login` and `/register` pages

```tsx
import { useAuthNoCheck } from '@/shared/hooks/useAuthNoCheck';

export default function LoginPage() {
  const { login, isLoading, error } = useAuthNoCheck();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Redirects to home automatically
    } catch (err) {
      // Show error
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**What it does:**
- Checks if user is already logged in → redirects to home
- If not logged in → allows login/register
- On successful login → redirects to home
- Shows proper error messages (no redirect on auth endpoints)

### How Authentication Works

#### The Flow

1. **User Logs In:**
   ```tsx
   const { login } = useAuthNoCheck(); // On login page
   await login({ email: 'user@example.com', password: 'password123' });
   ```
   - Frontend sends credentials to `/auth/login`
   - Backend validates and creates JWT token
   - Backend sets httpOnly cookie with token
   - Backend returns user data
   - Frontend stores user data in React state
   - Redirects to home

2. **Browser Stores Cookie:**
   - Cookie name: `token`
   - Cookie value: JWT token
   - httpOnly: true (JavaScript CANNOT access it - secure!)
   - Automatically sent with every request

3. **Making Authenticated Requests:**
   ```tsx
   import { apiClient } from '@/shared/utils/api';
   
   // Just make API calls normally
   const data = await apiClient.get('/employee-profile');
   // Cookie is automatically included!
   ```
   - Browser automatically includes cookie
   - Backend validates cookie
   - Returns data if valid
   - **If 401 → automatic redirect to `/login`** (except on auth endpoints)

4. **Getting Current User:**
   ```tsx
   const { user, isAuthenticated } = useAuth(); // On protected pages
   // Automatically fetches from /auth/me on component mount
   ```

5. **Logout:**
   ```tsx
   const { logout } = useAuth();
   await logout();
   // Backend clears cookie, frontend clears state, redirects to login
   ```

### Automatic 401 Handling

The API client automatically handles 401 errors:

**Protected Routes (any API call):**
- 401 response → automatic redirect to `/login`
- Works even if subteams don't add guards
- Safety net for all protected routes

**Auth Endpoints (login/register/me/change-password):**
- 401 response → NO redirect
- Shows proper error messages
- Prevents redirect loops

### ProtectedRoute Component

**Always wrap protected pages with `ProtectedRoute`:**

```tsx
import { ProtectedRoute } from '@/shared/components';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

**Props:**
- `children`: Content to protect (required)
- `redirectTo?`: Custom redirect path (defaults to `/login`)
- `showLoading?`: Show loading state (defaults to `true`)
- `loadingComponent?`: Custom loading component

**Examples:**

```tsx
// Basic usage
<ProtectedRoute>
  <MyPage />
</ProtectedRoute>

// Custom redirect
<ProtectedRoute redirectTo="/custom-login">
  <MyPage />
</ProtectedRoute>

// Custom loading
<ProtectedRoute loadingComponent={<MyLoader />}>
  <MyPage />
</ProtectedRoute>

// No loading (if page handles its own)
<ProtectedRoute showLoading={false}>
  <MyPage />
</ProtectedRoute>
```

### Available Auth Methods

```tsx
// useAuth (for protected pages)
const {
  user,              // Current user data
  isLoading,         // Loading state
  error,             // Error message
  isAuthenticated,   // Boolean: is user logged in?
  login,             // Login function
  register,          // Register function
  logout,            // Logout function
  changePassword,    // Change password function
  refreshUser,       // Refresh user data
} = useAuth();

// useAuthNoCheck (for login/register pages)
const {
  user,              // Current user data
  isLoading,         // Loading state
  error,             // Error message
  isAuthenticated,   // Boolean: is user logged in?
  login,             // Login function (redirects on success)
  register,          // Register function (redirects on success)
} = useAuthNoCheck();
```

### Change Password

```tsx
import { useAuth } from '@/shared/hooks/useAuth';

const { changePassword } = useAuth();

await changePassword({
  currentPassword: 'oldpassword',
  newPassword: 'newpassword123',
});
```

**Note:** The employee profile page includes a change password modal that:
- Verifies current password before allowing change
- Shows clear error messages
- Validates new password requirements

### Backend Endpoints

- `POST /auth/login` - Login (public)
- `POST /auth/register` - Register (public)
- `GET /auth/me` - Get current user (protected)
- `POST /auth/logout` - Logout (protected)
- `POST /auth/change-password` - Change password (protected)

### Key Points

✅ **Frontend DOES:**
- Send login credentials
- Store user data in React state
- Include cookies in requests (via `withCredentials: true`)
- Call `/auth/me` to get current user
- Automatically redirect on 401 (except auth endpoints)

❌ **Frontend DOES NOT:**
- Create JWT tokens (backend does this)
- Store tokens in localStorage (browser cookie stores it)
- Read cookies (can't - they're httpOnly)
- Manage token expiration (backend handles this)

✅ **Backend DOES:**
- Create JWT tokens
- Set httpOnly cookies
- Validate cookies on protected routes
- Extract user info from JWT

✅ **Browser DOES:**
- Store cookie automatically
- Send cookie with requests automatically
- Protect cookie from JavaScript (httpOnly)

---

## 📦 Module Structure

Each module (employee-profile, leaves, etc.) has its own folder under `app/modules/`:

```
module-name/
├── page.tsx              # Main page component
├── components/           # Module-specific components
└── types/               # Module-specific types
```

**Example (with ProtectedRoute):**
```tsx
// app/modules/employee-profile/page.tsx
'use client';

import { Card, Button, ProtectedRoute } from '@/shared/components';
import { useAuth } from '@/shared/hooks';
import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';

function EmployeeProfileContent() {
  const { user } = useAuth();
  
  return (
    <Card padding="lg">
      <h1>Employee Profile</h1>
      <p>Welcome, {user?.email}</p>
      {/* Module content */}
    </Card>
  );
}

// ⚠️ Always wrap with ProtectedRoute!
export default function EmployeeProfilePage() {
  return (
    <ProtectedRoute>
      <EmployeeProfileContent />
    </ProtectedRoute>
  );
}
```

**Key Points:**
- ✅ Always use `ProtectedRoute` for protected pages
- ✅ Import from central index files (`@/shared/components`, `@/shared/hooks`, etc.)
- ✅ Keep module-specific code in module folder
- ✅ Use shared components for UI consistency

---

## 🛠️ Development

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**That's it!** The default works for development.

### Available Scripts

```bash
npm run dev      # Start development server (port 3001)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
npm run type-check  # TypeScript type checking
```

### Project Defaults

- **Frontend Port:** 3001 (Next.js default)
- **Backend Port:** 3000 (NestJS default)
- **API URL:** `http://localhost:3000` (from `.env`)

### Troubleshooting

**API calls failing?**
- ✅ Check `.env` file exists and has `NEXT_PUBLIC_API_URL`
- ✅ Verify backend is running on port 3000
- ✅ Restart dev server after changing `.env`
- ✅ Check browser console for CORS errors

**Authentication not working?**
- ✅ Check backend is running
- ✅ Verify `NEXT_PUBLIC_API_URL` in `.env` matches backend URL
- ✅ Check browser DevTools → Application → Cookies (should see `token` cookie)
- ✅ Ensure CORS is configured on backend to allow credentials

**Components not importing?**
- ✅ Use `@/shared/components` for shared components
- ✅ Check TypeScript paths in `tsconfig.json`
- ✅ Restart TypeScript server in your IDE

---

## 📚 Additional Resources

- **Shared Components:** `shared/components/`
- **API Client:** `shared/utils/api.ts`
- **Constants:** `shared/constants/index.ts`
- **Types:** `shared/types/`
- **Hooks:** `shared/hooks/`

---

## 🎯 Key Takeaways

1. **Always set `.env`** - Without it, API calls fail
2. **Always use ProtectedRoute** - Wrap ALL protected pages with `<ProtectedRoute>`
3. **Import from central index files** - Use `@/shared/components`, `@/shared/hooks`, etc.
4. **Use shared components** - Maintains UI consistency
5. **Cookies are automatic** - No manual token management needed
6. **Module structure** - Each team works in their module folder
7. **Default ports** - Frontend 3001, Backend 3000
8. **401 handling is automatic** - API client redirects on 401 (except auth endpoints)

---

## 📝 Notes

- All shared resources are in `shared/` directory
- Each module is self-contained in `app/modules/`
- Environment variables must start with `NEXT_PUBLIC_`
- Restart dev server after changing `.env`
- Never commit `.env` to git
