# Frontend Structure Overview

This document outlines the frontend structure for the HR Management System.

## Directory Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── modules/                 # Module-specific pages
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
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── styles/                  # Global styles and theme
│   │   ├── globals.css
│   │   └── theme.ts
│   ├── utils/                   # Utility functions
│   │   ├── api.ts              # API client (axios)
│   │   ├── format.ts           # Formatting utilities
│   │   ├── validation.ts       # Validation utilities
│   │   └── index.ts
│   ├── hooks/                   # Shared React hooks
│   │   ├── useAuth.ts
│   │   └── index.ts
│   ├── types/                   # Shared TypeScript types
│   │   ├── common.ts
│   │   └── index.ts
│   └── constants/               # Shared constants
│       └── index.ts
│
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Module Structure

Each module under `app/modules/` follows this structure:

```
module-name/
├── page.tsx              # Main page component
├── components/           # Module-specific components
├── types/               # Module-specific types
└── [additional folders] # Other module-specific resources
```

## Shared Resources

All shared UI components, styles, utilities, and types are located in the `shared/` directory. These resources are available to all modules and ensure consistency across the application.

### Components

- **Button**: Primary button component with multiple variants
- **Card**: Container component with warm styling
- **Input**: Form input with validation support
- **Modal**: Modal dialog component

### Styles

- **globals.css**: Global CSS with warm color palette
- **theme.ts**: TypeScript theme object with design tokens

### Utilities

- **api.ts**: Centralized axios instance for API calls
- **format.ts**: Date, currency, and number formatting
- **validation.ts**: Form validation utilities

## Design System

The application uses a warm, cozy color palette:

- **Backgrounds**: Warm whites (#fef9f3, #fff8ee)
- **Primary**: Terracotta orange (#e76f51)
- **Accent**: Teal green (#2a9d8f)
- **Success**: Warm green (#8ac926)
- **Warning**: Golden orange (#ff9f1c)
- **Borders**: Light warm gray (#e2dcd0)

### Design Principles

- **Rounded Corners**: 16px radius for soft edges
- **Generous Padding**: Ample breathing room
- **Soft Shadows**: Warm orange-tinted drop shadows
- **Bold Typography**: 700-900 weights for hierarchy
- **High Contrast**: Readable but not harsh

## Usage Examples

### Using Shared Components

```tsx
import { Button, Card, Input } from '@/shared/components';

export default function MyPage() {
  return (
    <Card padding="lg" shadow="warm">
      <Input label="Email" type="email" />
      <Button variant="primary" size="lg">Submit</Button>
    </Card>
  );
}
```

### Using API Client

```tsx
import { apiClient } from '@/shared/utils/api';

const fetchEmployees = async () => {
  const response = await apiClient.get('/employee-profile');
  return response.data;
};
```

### Using Theme

```tsx
import { theme } from '@/shared/styles/theme';

const styles = {
  backgroundColor: theme.colors.primary.main,
  borderRadius: theme.borderRadius.lg,
};
```

## Development Guidelines

1. **Module Independence**: Each module should be self-contained with its own components and types
2. **Shared Resources**: Use shared components, utilities, and styles from `shared/` directory
3. **Consistency**: Follow the design system for colors, spacing, and typography
4. **Type Safety**: Use TypeScript types from `shared/types` and module-specific types
5. **API Calls**: Use the centralized `apiClient` from `shared/utils/api`

