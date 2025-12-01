# Lumi - Modern Mid+/Senior Level Task Management Application

Lumi is an advanced web application for task management, developed with a focus on clean architecture and modern development practices. The application is built using React with TypeScript and Supabase, emphasizing performance, accessibility, and reliability.

![Lumi Screenshot](https://raw.githubusercontent.com/Sskutushev/Lumi/main/img/pet-project.jpg)

## Key Features

### Architectural Enhancements

- **React Query Integration**: For efficient state management and data caching, significantly reducing API calls and improving responsiveness.
- **Race Condition Fixes**: Implemented in the API layer using a robust UPSERT approach to ensure data consistency.
- **Rendering Optimization**: Achieved through extensive use of `useMemo`, `useCallback`, and `React.memo` to minimize unnecessary re-renders.
- **Comprehensive Error Handling**: A centralized system with various error types and detailed logging ensures a smooth user experience and aids debugging.

### Performance

- **Lazy Loading**: Components are loaded lazily to reduce the initial bundle size and improve Time-to-Interactive.
- **Code Splitting**: Optimizes loading by splitting the application into smaller, on-demand chunks.
- **Memoization**: Extensive use of `useMemo` and `useCallback` for computations and callbacks.
- **Performance Analytics**: Integrated monitoring to track and analyze application performance.

### Security

- **Data Validation**: Robust input validation using Zod schemas prevents common vulnerabilities.
- **User Input Sanitization**: Sanitizes user-provided data to protect against XSS attacks.
- **Authentication Token Verification**: Secure handling of authentication tokens.
- **RLS (Row Level Security)**: Implemented in Supabase to ensure data isolation.
- **XSS and CSRF Protection**: Measures in place to guard against cross-site scripting and request forgery.

### Accessibility (A11y)

- **Full Keyboard Navigation Support**: Ensures all interactive elements are accessible via keyboard.
- **ARIA Attributes**: Used to provide semantic information for screen readers.
- **High Contrast Colors**: Adheres to WCAG guidelines for readability.
- **Adaptive Design**: Responsive design for various screen sizes.
- **Focus Management System**: Guides user focus for improved usability.

### Real-time Interaction

- **Real-time Data Synchronization**: Achieved through Supabase Realtime subscriptions, providing instant updates across clients.
- **Presence Support**: (Planned) To track online statuses of users.
- **Inter-tab Synchronization**: Uses BroadcastChannel API to synchronize data across multiple browser tabs for the same user.

### Advanced Functionality

- **Advanced Filtering and Sorting**: Powerful filtering and sorting options for tasks, including custom criteria.
- **Saved Filters**: Allows users to save and quickly access their preferred filter presets.
- **PWA Support**: Progressive Web App capabilities with offline mode and installability for an app-like experience.
- **Monitoring and Analytics**: Integrated with Sentry for error tracking and Yandex Metrika for user behavior analytics.

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Zustand, @tanstack/react-query
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling**: Tailwind CSS, Framer Motion
- **Testing**: Vitest, React Testing Library (E2E with Cypress/Playwright planned)
- **I18n**: react-i18next
- **Icons**: Lucide React
- **Analytics & Monitoring**: Sentry, Yandex Metrika
- **Code Quality**: Prettier, ESLint, Husky, Lint-staged, Commitlint

## Documentation

Detailed documentation is available in the `/docs/` folder:

- **[Architecture](./docs/ARCHITECTURE.md)**: Detailed overview of the application's architecture.
- **[Database](./docs/DATABASE.md)**: Database schema, RLS policies, and trigger functions.
- **[API](./docs/API.md)**: Documentation for the API interaction layer.
- **[Getting Started](./docs/GETTING_STARTED.md)**: Instructions for setting up and running the project.
- **[Contributing](./docs/CONTRIBUTING.md)**: Guidelines for contributing to the project.
- **[Deployment](./docs/DEPLOYMENT.md)**: Procedures for deploying the application.
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)**: Solutions to common issues.
- **[Performance](./docs/PERFORMANCE.md)**: Details on performance optimizations.

## Getting Started

### Requirements

- Node.js `v18.0.0` or higher
- `npm` `v9.0.0` or higher
- Git

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root based on `.env.example`:

```env
# .env.local

# Required for Supabase integration
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Optional - for Yandex Metrika analytics
VITE_YM_COUNTER_ID="your_yandex_metrika_counter_id"

# Optional - for Sentry error tracking
VITE_SENTRY_DSN="your_sentry_dsn"
```

### 3. Database Setup

Execute the SQL script from the migrations folder in your Supabase console's SQL Editor to set up the database schema, RLS, and functions:

`supabase/migrations/01_create_tables_and_policies_fixed.sql`

Refer to the [Database Documentation](./docs/DATABASE.md) for more details.

### 4. Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 5. Running Tests

```bash
npm test
```

Refer to the [Contributing Guide](./docs/CONTRIBUTING.md) for more details on testing.

## Project Status

The project is in a highly developed state, with most planned features implemented and optimized for production use. All core functionalities are in place, and the application adheres to Mid+/Senior level development standards. Further enhancements include completing E2E testing and comprehensive JSDoc comments.

## Contact

- **Portfolio**: [https://sskutushev.site](https://sskutushev.site)
- **Telegram**: [https://t.me/Sskutushev](https://t.me/Sskutushev)
- **GitHub**: [https://github.com/Sskutushev](https://github.com/Sskutushev)
