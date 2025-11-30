# Lumi Application Architecture

This document provides a high-level overview of the Lumi application's architecture, technology stack, and key implementation details.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)
- [API Layer](#api-layer)
- [State Management](#state-management)
- [UI and Theming](#ui-and-theming)
- [Internationalization (i18n)](#internationalization-i18n)
- [Testing](#testing)

---

## Technology Stack

- **Frontend**:
  - **Framework**: React 18
  - **Language**: TypeScript
  - **Build Tool**: Vite
  - **Styling**: Tailwind CSS
  - **Animations**: Framer Motion
  - **UI Components**: `lucide-react` (icons), `sonner` (toast notifications), Radix UI (headless components for popups/dialogs).
- **Backend (BaaS)**:
  - **Provider**: Supabase
  - **Database**: PostgreSQL
  - **Authentication**: Supabase Auth (Email/Password, Google, GitHub)
  - **Storage**: Supabase Storage (for avatars)
  - **Real-time**: Supabase Realtime Subscriptions
- **Testing**:
  - **Framework**: Vitest
  - **Libraries**: React Testing Library, `jsdom`

---

## Project Structure

The project follows a standard Vite + React project structure.

```
/
├── public/         # Static assets
├── src/
│   ├── assets/       # Images, fonts, etc.
│   ├── components/   # Reusable React components
│   │   ├── auth/
│   │   ├── common/
│   │   ├── landing/
│   │   └── layout/
│   ├── hooks/        # Custom React hooks (e.g., useTheme, useClickOutside)
│   ├── i18n/         # Internationalization configuration and locales
│   ├── lib/          # Core libraries and external service integrations
│   │   └── api/      # Abstraction layer for Supabase API calls
│   ├── pages/        # Top-level page components
│   ├── store/        # Global state management (Zustand)
│   ├── styles/       # Global CSS and Tailwind base styles
│   ├── test/         # Test setup and configuration
│   └── types/        # TypeScript type definitions
├── supabase/       # Supabase-specific files, including migrations
└── ...             # Root configuration files
```

---

## Authentication Flow

1.  **Session Check**: On application load, `useAuthStore`'s `checkSession()` is called to verify if an active session exists with Supabase.
2.  **Auth UI**:
    - If a user is not authenticated, the landing page is displayed.
    - The `AuthModal` component handles both Sign Up and Sign In flows.
    - Social login (Google, GitHub) is handled via Supabase's OAuth providers.
3.  **Email Confirmation**: New user sign-ups require email confirmation. Supabase is configured to send a confirmation link to the user's email.
4.  **Profile Creation**: A database trigger (`on_auth_user_created`) on the `auth.users` table automatically creates a corresponding public profile in the `users_profile` table upon successful user registration.

---

## API Layer

- **Location**: `src/lib/api/`
- **Purpose**: To abstract all database and storage interactions away from the UI components. This creates a clean separation of concerns and makes components easier to manage and test.
- **Structure**: The API is modular, with separate files for different data domains:
  - `tasks.api.ts`: All CRUD (Create, Read, Update, Delete) operations for tasks.
  - `projects.api.ts`: All CRUD operations for projects.
  - `profile.api.ts`: Handles fetching/updating user profiles and avatar uploads.
- **Error Handling**: All API methods are wrapped in `try...catch` blocks to handle errors gracefully. Errors are logged to the console and re-thrown to be caught by the calling function, which typically displays a toast notification to the user.

---

## State Management

- **Global State**: `Zustand` is used for managing global application state, primarily for authentication.
  - **`useAuthStore`** (`src/store/authStore.ts`): This store holds the current `user` object, session information, and loading status. It exposes methods like `checkSession` and `signOut`.
- **Local State**: Standard React hooks (`useState`, `useEffect`, `useRef`) are used for managing component-level state (e.g., form inputs, popup visibility, local data).

---

## UI and Theming

- **Styling**: The UI is built with Tailwind CSS, utilizing a utility-first approach.
- **Theming**:
  - A custom light/dark theme system is implemented using CSS variables defined in `src/styles/globals.css`.
  - The `useTheme` hook (`src/hooks/useTheme.ts`) provides functionality to toggle the theme by adding or removing the `.dark` class from the `<html>` element.
- **Responsiveness**: All components are designed to be responsive and work across mobile, tablet, and desktop screen sizes.

---

## Internationalization (i18n)

- **Library**: `react-i18next` is used to manage translations.
- **Configuration**:
  - The main configuration is in `src/i18n/config.ts`.
  - Language JSON files are located in `src/i18n/locales/`.
- **Usage**: The `useTranslation` hook is used within components to access translated strings (`t('key')`).

---

## Testing

- **Framework**: `Vitest` is used for its speed and compatibility with Vite.
- **Environment**: `jsdom` is configured to simulate a browser environment for component testing.
- **Setup**: A setup file (`src/test/setup.ts`) configures `@testing-library/jest-dom` for additional DOM assertions.
- **Coverage**: The primary focus of the test suite is on the API layer (`src/lib/api/`) to ensure data integrity and correct interaction with the Supabase backend.
