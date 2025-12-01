# Lumi Project Documentation

## Architecture Overview

### General Structure

The Lumi project follows a standard React application structure, organized for maintainability and scalability:

- `src/` - Contains all source code for the application.
- `src/components/` - Houses reusable UI components, further categorized by functionality (e.g., `auth`, `common`, `landing`, `layout`).
- `src/pages/` - Defines the main views and routes of the application (e.g., `TodoDashboard`, `ProjectView`).
- `src/hooks/` - Custom React hooks for encapsulating reusable logic, including data fetching (`queries`) and data manipulation (`mutations`).
- `src/lib/` - A core library for utilities, API services, error handling, monitoring, and real-time functionalities.
- `src/types/` - Centralized TypeScript type definitions for API responses, components, and application state.
- `src/store/` - Manages global application state using Zustand (e.g., `authStore`).

### Technology Stack

The project leverages a modern and robust technology stack:

- **React 18 with TypeScript**: For building dynamic and type-safe user interfaces.
- **Vite**: As the build tool, offering fast development and optimized production builds.
- **Supabase**: Provides the backend services, including authentication, database, and real-time capabilities.
- **@tanstack/react-query**: For efficient server-state management, caching, and data synchronization.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development and consistent styling.
- **Framer Motion**: For declarative and performant animations.
- **i18next**: For internationalization and localization of the application.
- **Zustand**: A fast and scalable state-management solution for global application state.
- **Zod**: For robust schema validation of input data.
- **Sonner**: For elegant and accessible toast notifications.
- **Lucide React**: A collection of beautiful and customizable open-source icons.

### State Management

The application employs a layered approach to state management:

- **React Hooks**: `useState`, `useReducer`, `useRef`, `useEffect`, `useMemo`, `useCallback` are used for local component state and performance optimizations.
- **Zustand**: Utilized for global application state, particularly for authentication (`authStore`), providing a simple and performant alternative to Redux.
- **React Query**: The primary tool for managing server-side data. It handles caching, revalidation, background fetching, and error handling for API calls, significantly improving application performance and user experience.

### API Interaction Layer

The project features a well-structured API interaction layer:

- **Dedicated API Modules**: Each major entity (e.g., `tasks`, `projects`, `profile`) has its own API module (`src/lib/api/tasks.api.ts`, `src/lib/api/projects.api.ts`, `src/lib/api/profile.api.ts`) for clear separation of concerns.
- **React Query Hooks**: All API calls are wrapped in custom `useQuery` (for fetching) and `useMutation` (for creating, updating, deleting) hooks, providing automatic caching, retry mechanisms, and optimistic updates.
- **Centralized Error Handling**: Integrated with `src/lib/errors/ErrorHandler.ts` and `src/lib/errors/logger.ts` for consistent error reporting and logging across all API interactions.
- **Input Validation and Sanitization**: API calls incorporate `zod` for input validation and `securityUtils.ts` for sanitizing user input before sending data to the backend.

## Patterns and Approaches

### Error Handling

A robust and centralized error handling system ensures a smooth user experience and aids in debugging:

- **`src/lib/errors/ErrorHandler.ts`**: A utility for parsing and classifying different types of errors (e.g., `NetworkError`, `AuthError`, `ValidationError`, `ServerError`).
- **`src/lib/errors/logger.ts`**: Provides consistent logging of errors to the console (and potentially to external monitoring services like Sentry).
- **`src/components/ErrorBoundary.tsx`**: Catches rendering errors in the React component tree and displays a user-friendly fallback UI.
- **Integration with React Query**: `onError` callbacks in `useQuery` and `useMutation` hooks are used to process API-related errors through the `ErrorHandler`.

### Security

Security is addressed at multiple layers:

- **Input Validation**: `zod` schemas are used to validate all user inputs on the frontend, preventing common vulnerabilities like SQL injection and XSS.
- **Input Sanitization**: `securityUtils.ts` provides functions to sanitize user-provided text, removing potentially malicious content.
- **Authentication Token Management**: Supabase handles secure authentication and token management.
- **Row Level Security (RLS)**: Implemented in Supabase to ensure users can only access and modify their own data.
- **Security Headers**: Configured in `vercel.json` to mitigate various web vulnerabilities (e.g., X-Frame-Options, Content-Security-Policy).

### Accessibility (A11y)

The application strives for WCAG 2.1 AA compliance:

- **ARIA Attributes**: Used extensively to provide semantic meaning to UI elements for assistive technologies.
- **Keyboard Navigation**: Ensured throughout the application, allowing users to interact with all elements using only a keyboard.
- **Focus Management**: Implemented for modals and interactive elements using `A11yFocusWrapper.tsx` to guide user focus.
- **Screen Reader Support**: Tested with screen readers to ensure all content and interactions are understandable.
- **Color Contrast**: Adheres to WCAG guidelines for text and interactive elements.

### Performance Optimization

Various techniques are employed to ensure a fast and responsive application:

- **`React.memo`**: Used for pure functional components (e.g., `TaskItem`) to prevent unnecessary re-renders.
- **`useMemo` and `useCallback`**: Applied to memoize expensive computations and callback functions, reducing re-renders and improving component performance.
- **Lazy Loading (Code Splitting)**: Implemented for pages and larger components using dynamic imports to reduce initial bundle size and improve Time-to-Interactive.
- **Bundle Analysis**: `rollup-plugin-visualizer` is used to analyze and optimize the JavaScript bundle size.
- **Image Optimization**: Strategies for responsive images and WebP conversion are considered.
- **React Query Caching**: Significantly reduces API calls and improves data loading times.

### Real-time Interaction

The application supports real-time data synchronization:

- **Supabase Realtime**: Leveraged for subscribing to database changes (INSERT, UPDATE, DELETE) on tasks and projects.
- **`src/lib/realtime/realtimeService.ts`**: Encapsulates the Supabase Realtime client and handles subscriptions.
- **`BroadcastChannel API`**: Used for synchronizing data and state across multiple browser tabs for the same user.
- **Presence System**: (Planned) To track online status and user activity.

### Progressive Web App (PWA) and Offline Mode

The application is configured as a PWA:

- **`vite-plugin-pwa`**: Used to automatically generate a Service Worker and `manifest.json`.
- **Service Worker**: Caches static assets and provides offline capabilities, allowing the application to function even without a network connection.
- **Installability**: Users can install the application to their home screen on supported devices.

### Monitoring and Analytics

Comprehensive monitoring and analytics are in place for production readiness:

- **Sentry**: Integrated for real-time error tracking and performance monitoring (`@sentry/react`, `@sentry/tracing`).
- **`src/lib/monitoring/sentryConfig.ts`**: Configures Sentry with environment-specific settings.
- **`src/lib/monitoring/performanceLogger.ts`**: Captures and reports custom performance metrics to Sentry.
- **`src/lib/analytics/analyticsService.ts`**: Provides a centralized service for tracking user behavior and custom events (integrated with Yandex Metrika and potentially Google Analytics).

### Developer Experience

Tools and practices to enhance developer workflow:

- **Prettier**: Automated code formatting to ensure consistent style across the codebase.
- **Husky**: Git hooks manager to enforce code quality and commit message standards.
- **Lint-staged**: Runs linters and formatters on staged Git files, ensuring only formatted and linted code is committed.
- **Commitlint**: Enforces conventional commit message standards, improving commit history readability.
- **JSDoc**: (Partially implemented, manual effort required) For documenting functions, components, and types, improving code readability and maintainability.
