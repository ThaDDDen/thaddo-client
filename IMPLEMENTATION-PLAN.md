# ThaDDo Client - Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for building the ThaDDo Next.js client application with authentication and full CRUD operations.

**Application Type:** Personal, self-hosted PWA (Progressive Web App)

**Tech Stack:**
- Next.js (App Router) with PWA support
- TanStack Query (React Query) - Data fetching and caching
- Zustand - Global state management (if needed)
- shadcn/ui - UI components
- Tailwind CSS - Styling
- next-pwa - PWA functionality

---

## Phase 1: Project Setup & Dependencies

### 1.1 Install Core Dependencies
Install the essential packages needed for the application:

```bash
# TanStack Query
pnpm add @tanstack/react-query @tanstack/react-query-devtools

# Zustand (state management)
pnpm add zustand

# Form handling and validation
pnpm add react-hook-form zod @hookform/resolvers

# HTTP client
pnpm add axios

# Date handling
pnpm add date-fns

# PWA support
pnpm add next-pwa
pnpm add -D webpack
```

### 1.2 Install shadcn/ui
Initialize and install shadcn/ui components:

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Install commonly needed components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add toast
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add tabs
```

---

## Phase 2: Project Structure & Configuration

### 2.1 Create Folder Structure
Set up the recommended folder structure:

```
thaddo-client/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── tasks/
│   │   ├── task-lists/
│   │   └── layout.tsx
│   ├── api/          # API route handlers if needed
│   └── layout.tsx
├── components/
│   ├── ui/           # shadcn components (auto-generated)
│   ├── auth/
│   ├── tasks/
│   ├── task-lists/
│   ├── pwa/          # PWA-specific components (install prompt, update banner, etc.)
│   └── shared/
├── lib/
│   ├── api/          # API client and endpoints
│   ├── hooks/        # Custom React hooks
│   ├── stores/       # Zustand stores
│   ├── types/        # TypeScript types
│   ├── utils/        # Utility functions
│   └── validations/  # Zod schemas
├── config/
│   └── api.config.ts # API configuration
└── public/
    ├── icons/        # PWA icons (192x192, 512x512, etc.)
    ├── manifest.json # PWA manifest
    └── favicon.ico
```

### 2.2 Environment Variables
Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2.3 Configure PWA
Update `next.config.ts` to include PWA configuration:

```typescript
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable in dev mode
  // runtimeCaching, // Optional: add custom runtime caching rules
});

export default config({
  // Your existing Next.js config
});
```

Create `public/manifest.json`:

```json
{
  "name": "ThaDDo - Task Manager",
  "short_name": "ThaDDo",
  "description": "Personal task and todo management application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add PWA meta tags to `app/layout.tsx`:

```tsx
<head>
  <meta name="application-name" content="ThaDDo" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="ThaDDo" />
  <meta name="description" content="Personal task and todo management" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#000000" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
</head>
```

**Note:** You'll need to create app icons and place them in `public/icons/` directory.

### 2.4 Configure TanStack Query
Create `lib/providers/query-provider.tsx` to wrap the app with QueryClientProvider.

---

## Phase 3: Type Definitions

### 3.1 Create TypeScript Types
Create `lib/types/` directory with the following files based on your server API:

**Files to create:**
- `lib/types/common.ts` - Base types (BaseEntity, BaseAuditableEntity)
- `lib/types/auth.ts` - Auth types (LoginRequest, AccessTokenResponse) - Note: No RegisterRequest needed for personal app
- `lib/types/task.ts` - Task types (TaskDto, CreateTaskRequest, UpdateTaskRequest, TaskPriority enum)
- `lib/types/task-list.ts` - TaskList types (TaskListDto, CreateTaskListRequest, UpdateTaskListRequest)
- `lib/types/todo-item.ts` - TodoItem types (TodoItemDto, CreateTodoItemCommand)
- `lib/types/index.ts` - Export all types

---

## Phase 4: API Client Setup

### 4.1 Create Axios Instance
Create `lib/api/axios.ts`:
- Configure base URL
- Add request interceptor to attach JWT token
- Add response interceptor to handle errors and token refresh
- Handle 401 responses (logout on invalid token)

### 4.2 Create Auth Store (Zustand)
Create `lib/stores/auth-store.ts`:
- Store: accessToken, refreshToken, user info
- Actions: setTokens, clearTokens, isAuthenticated
- Persist tokens to localStorage/sessionStorage

### 4.3 Create API Service Modules
Create separate service files for each resource:

**`lib/api/auth.api.ts`** - Authentication endpoints:
- `login(email, password)`
- `refreshToken(refreshToken)`
- `logout()`

**Note:** No registration endpoint needed for personal, self-hosted application.

**`lib/api/tasks.api.ts`** - Task CRUD:
- `getTasks(startDate?, endDate?)`
- `getTask(id)`
- `createTask(data)`
- `updateTask(id, data)`
- `deleteTask(id)`

**`lib/api/task-lists.api.ts`** - TaskList CRUD:
- `getTaskLists()`
- `getTaskList(id)`
- `createTaskList(data)`
- `updateTaskList(id, data)`
- `deleteTaskList(id)`

**`lib/api/todo-items.api.ts`** - TodoItem CRUD:
- `getTodoItems()`
- `getTodoItem(id)`
- `createTodoItem(data)`

---

## Phase 5: TanStack Query Hooks

### 5.1 Create Query Hooks
Create custom hooks using TanStack Query in `lib/hooks/`:

**`lib/hooks/use-auth.ts`**:
- `useLogin()` - Mutation for login
- `useLogout()` - Function to clear tokens and invalidate queries

**`lib/hooks/use-tasks.ts`**:
- `useTasks(startDate?, endDate?)` - Query for task list
- `useTask(id)` - Query for single task
- `useCreateTask()` - Mutation for creating task
- `useUpdateTask()` - Mutation for updating task
- `useDeleteTask()` - Mutation for deleting task

**`lib/hooks/use-task-lists.ts`**:
- `useTaskLists()` - Query for task lists
- `useTaskList(id)` - Query for single task list
- `useCreateTaskList()` - Mutation for creating task list
- `useUpdateTaskList()` - Mutation for updating task list
- `useDeleteTaskList()` - Mutation for deleting task list

**`lib/hooks/use-todo-items.ts`**:
- `useTodoItems()` - Query for todo items
- `useTodoItem(id)` - Query for single todo item
- `useCreateTodoItem()` - Mutation for creating todo item

### 5.2 Configure Query Keys
Create `lib/api/query-keys.ts` to centralize query key management:

```typescript
export const queryKeys = {
  auth: ['auth'],
  tasks: {
    all: ['tasks'],
    list: (filters?: unknown) => ['tasks', 'list', filters],
    detail: (id: number) => ['tasks', 'detail', id],
  },
  taskLists: {
    all: ['taskLists'],
    list: () => ['taskLists', 'list'],
    detail: (id: number) => ['taskLists', 'detail', id],
  },
  todoItems: {
    all: ['todoItems'],
    list: () => ['todoItems', 'list'],
    detail: (id: number) => ['todoItems', 'detail', id],
  },
}
```

---

## Phase 6: Validation Schemas

### 6.1 Create Zod Schemas
Create `lib/validations/` directory with validation schemas:

**`lib/validations/auth.schema.ts`**:
- `loginSchema` - Validate email and password for login

**`lib/validations/task.schema.ts`**:
- `createTaskSchema` - Validate task creation
- `updateTaskSchema` - Validate task updates

**`lib/validations/task-list.schema.ts`**:
- `createTaskListSchema` - Validate task list creation
- `updateTaskListSchema` - Validate task list updates

**`lib/validations/todo-item.schema.ts`**:
- `createTodoItemSchema` - Validate todo item creation

---

## Phase 7: Authentication UI

### 7.1 Create Auth Layout
Create `app/(auth)/layout.tsx`:
- Centered layout for login page
- Redirect to dashboard if already authenticated

### 7.2 Build Login Page
Create `app/(auth)/login/page.tsx`:
- Simple login form with email and password fields
- Use react-hook-form with Zod validation
- Use `useLogin()` hook
- Store tokens on success
- Redirect to dashboard
- Clean, minimal design (personal use only)

**Note:** No registration page needed - this is a personal, self-hosted application. User account should be created directly on the server or through server configuration.

### 7.3 Create Auth Guard
Create `components/auth/auth-guard.tsx`:
- Check if user is authenticated
- Redirect to login if not authenticated
- Show loading state while checking

---

## Phase 8: Dashboard Layout

### 8.1 Create Dashboard Layout
Create `app/(dashboard)/layout.tsx`:
- Wrap with AuthGuard
- Include navigation sidebar/header
- Logout button
- Display user info

### 8.2 Create Navigation Components
Create `components/shared/`:
- `sidebar.tsx` - Navigation sidebar
- `header.tsx` - Top header with user menu
- `nav-link.tsx` - Active link component

---

## Phase 9: Tasks Feature

### 9.1 Create Task List Page
Create `app/(dashboard)/tasks/page.tsx`:
- Display list of tasks
- Filters: date range, priority, completion status
- Search functionality
- Buttons: Create new task
- Loading and error states

### 9.2 Create Task Components
Create `components/tasks/`:

**`task-list.tsx`**:
- Display tasks in a list/grid
- Show task details (title, description, due date, priority)
- Action buttons (edit, delete, mark complete)

**`task-card.tsx`**:
- Individual task card component
- Display all task properties
- Quick actions

**`task-form.tsx`**:
- Reusable form for creating/editing tasks
- Fields: title, description, due date, priority, task list
- Use react-hook-form with Zod validation
- Date picker for due date
- Priority select dropdown

**`task-dialog.tsx`**:
- Dialog wrapper for task form
- Used for create and edit operations

**`task-filters.tsx`**:
- Filter controls for task list
- Date range picker
- Priority filter
- Completion status filter

### 9.3 Create Task Detail Page (Optional)
Create `app/(dashboard)/tasks/[id]/page.tsx`:
- Show full task details
- Edit inline or in dialog
- Show subtasks if applicable
- Show associated task list

---

## Phase 10: Task Lists Feature

### 10.1 Create Task Lists Page
Create `app/(dashboard)/task-lists/page.tsx`:
- Display all task lists
- Each list shows its color and task count
- Button to create new task list
- Loading and error states

### 10.2 Create Task List Components
Create `components/task-lists/`:

**`task-list-grid.tsx`**:
- Display task lists in a grid
- Show color, title, task count
- Action buttons (edit, delete)

**`task-list-card.tsx`**:
- Individual task list card
- Color indicator
- Quick view of tasks

**`task-list-form.tsx`**:
- Form for creating/editing task lists
- Fields: title, color (color picker)
- Use react-hook-form with Zod validation

**`task-list-dialog.tsx`**:
- Dialog wrapper for task list form

### 10.3 Create Task List Detail Page
Create `app/(dashboard)/task-lists/[id]/page.tsx`:
- Show task list with all its tasks
- Filter and sort tasks within the list
- Add task to list
- Edit list properties

---

## Phase 11: Todo Items Feature (Optional)

### 11.1 Create Todo Items Page
Create `app/(dashboard)/todo-items/page.tsx`:
- Simple list of todo items
- Quick add input
- Loading and error states

### 11.2 Create Todo Components
Create `components/todo-items/`:

**`todo-list.tsx`**:
- Display todo items
- Simple list view

**`todo-form.tsx`**:
- Simple form with just title field
- Inline creation

---

## Phase 12: UI Enhancements

### 12.1 Add Loading States
- Skeleton loaders for lists
- Loading spinners for mutations
- Optimistic updates where appropriate

### 12.2 Add Error Handling
- Toast notifications for errors
- Error boundaries
- Retry mechanisms

### 12.3 Add Empty States
- Empty state components for when no data exists
- Call-to-action to create first item

### 12.4 Add Confirmation Dialogs
- Confirm before deleting tasks/lists
- Confirm before logging out

---

## Phase 13: Additional Features

### 13.1 Implement Search
- Global search across tasks
- Debounced search input

### 13.2 Implement Sorting
- Sort tasks by: due date, priority, created date
- Sort task lists by name or created date

### 13.3 Implement Pagination (if needed)
- If task list grows large
- Infinite scroll or traditional pagination

### 13.4 Add Keyboard Shortcuts
- Quick task creation (Ctrl+N)
- Quick search (Ctrl+K)
- Navigation shortcuts

---

## Phase 14: PWA Features

### 14.1 Offline Support
- Configure service worker caching strategies
- Add offline indicator to UI
- Queue mutations when offline (persist to IndexedDB)
- Sync queued mutations when back online

### 14.2 Install Prompt
- Create install prompt component
- Detect if app is installable
- Show install button/banner
- Handle installation events

### 14.3 Update Notifications
- Detect when new version is available
- Show update notification to user
- Implement "Update Available" banner
- Allow user to trigger update

### 14.4 App Icons & Splash Screens
- Create app icons (192x192, 512x512)
- Generate additional icon sizes if needed
- Create splash screens for iOS
- Test install experience on different devices

### 14.5 Background Sync (Optional)
- Implement background sync for task updates
- Periodic background sync for fetching new data
- Handle sync events in service worker

---

## Phase 15: Polish & Optimization

### 15.1 Performance Optimization
- Implement proper cache invalidation
- Prefetch on hover for detail pages
- Optimize re-renders with React.memo where needed
- Optimize bundle size for PWA

### 15.2 Accessibility
- Ensure all forms are keyboard accessible
- Proper ARIA labels
- Focus management in dialogs

### 15.3 Responsive Design
- Ensure mobile responsiveness (critical for PWA)
- Test on different screen sizes
- Optimize touch interactions for mobile
- Test gesture support (swipe actions, etc.)

### 15.4 Dark Mode (if desired)
- Implement theme toggle
- Persist theme preference
- Ensure all components support both themes
- Update manifest.json theme_color based on theme

---

## Phase 16: Testing & Documentation

### 16.1 Testing Setup (Optional)
- Set up testing library
- Write unit tests for hooks
- Write integration tests for key flows
- Test PWA functionality on different devices

### 16.2 PWA Testing
- Test on iOS (Safari)
- Test on Android (Chrome)
- Test offline functionality
- Test install/uninstall flow
- Test update mechanism
- Audit with Lighthouse PWA score

### 16.3 Documentation
- Document component API
- Add JSDoc comments to functions
- Create usage examples
- Document deployment process for self-hosting

---

## Additional Considerations

### Token Refresh Strategy
- Implement automatic token refresh before expiration
- Handle refresh token expiration (force logout)
- Queue requests during token refresh

### Error Recovery
- Retry failed requests
- Handle network errors gracefully
- Provide clear error messages

### State Synchronization
- Handle concurrent updates
- Implement optimistic updates for better UX
- Use TanStack Query's built-in features for cache synchronization

### Security
- Never log sensitive information
- Implement CSRF protection if needed
- Validate all user inputs
- Sanitize data before rendering

---

## Recommended Implementation Order

1. **Phase 1-2**: Setup, dependencies, and PWA configuration (2-3 hours)
2. **Phase 3-4**: Types and API client (2-3 hours)
3. **Phase 5-6**: Query hooks and validations (2-3 hours)
4. **Phase 7**: Authentication UI (2-3 hours) - Simplified without registration
5. **Phase 8**: Dashboard layout (1-2 hours)
6. **Phase 9**: Tasks feature (4-6 hours)
7. **Phase 10**: Task lists feature (3-4 hours)
8. **Phase 11**: Todo items feature (1-2 hours) - Optional
9. **Phase 12**: UI enhancements (2-3 hours)
10. **Phase 13**: Additional features (2-4 hours)
11. **Phase 14**: PWA features (3-5 hours)
12. **Phase 15**: Polish and optimization (2-3 hours)
13. **Phase 16**: Testing and documentation (2-4 hours)

**Total estimated time**: 28-45 hours of focused development

---

## Notes

- This is a **personal, self-hosted application** - no registration flow needed
- User account should be created on the server side before using the client
- Focus on **PWA functionality** for mobile-first experience
- Start with authentication and basic CRUD operations for tasks before moving to advanced features
- Test each feature thoroughly before moving to the next phase
- Keep the UI simple initially, then enhance progressively
- Use TanStack Query DevTools during development for debugging
- Test PWA functionality frequently (install, offline, updates)
- Commit changes frequently with meaningful messages
- Consider adding a loading state provider for global loading indicators
- Consider implementing toast notifications early as they're useful throughout development
- Test on actual mobile devices, not just browser dev tools

---

## Server API Reference

**Base URL**: `http://localhost:5000/api`

**Authentication**: Bearer token in Authorization header (for protected endpoints)

### Endpoints Summary

**Auth** (`/api/Auth`):
- POST `/login` - Login user (returns JWT)
- POST `/refresh` - Refresh access token

**Note:** Registration endpoint exists on server but is not used in this personal app. Create user account directly on the server.

**Tasks** (`/api/Tasks`):
- GET `/` - List all tasks (optional: startDate, endDate query params)
- GET `/{id}` - Get single task
- POST `/` - Create task (requires auth)
- PUT `/{id}` - Update task (requires auth)
- DELETE `/{id}` - Delete task (requires auth)

**Task Lists** (`/api/TaskLists`):
- GET `/` - List all task lists
- GET `/{id}` - Get single task list
- POST `/` - Create task list (requires auth)
- PUT `/{id}` - Update task list (requires auth)
- DELETE `/{id}` - Delete task list (requires auth)

**Todo Items** (`/api/TodoItems`):
- GET `/` - List all todo items
- GET `/{id}` - Get single todo item
- POST `/` - Create todo item (requires auth)

### Server Models Reference

See `lib/types/` files for TypeScript type definitions matching the server's C# models.

---

## Self-Hosting Deployment Guide

Since this is a personal, self-hosted application, consider these deployment options:

### Option 1: Docker (Recommended)
- Create a `Dockerfile` for the Next.js app
- Use multi-stage build to optimize image size
- Serve via nginx or Next.js standalone mode
- Deploy alongside your server using docker-compose

### Option 2: Static Export + CDN
- Use `next build` with static export if possible
- Deploy to any static hosting (Netlify, Vercel, Cloudflare Pages)
- Ensure proper CORS configuration on server

### Option 3: VPS Deployment
- Deploy to your own VPS (DigitalOcean, Linode, etc.)
- Use PM2 or systemd to keep the app running
- Use nginx as reverse proxy
- Configure SSL with Let's Encrypt

### PWA Requirements for Production
- **HTTPS is required** for PWA features to work (except localhost)
- Ensure proper CORS headers from your API server
- Configure proper cache headers for service worker
- Test install and offline functionality in production environment

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NODE_ENV=production
```

### Build Command
```bash
pnpm build
pnpm start
```

### Considerations
- Keep the server and client on same domain/subdomain to avoid CORS issues
- Use a reverse proxy (nginx) to route `/api/*` to server and `/` to client
- Ensure WebSocket connections work if you add real-time features later
- Set up proper logging and monitoring for production
- Consider using a CDN for static assets
