# Development Guide

## Getting Started

### Installing Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_YM_COUNTER_ID=your_yandex_metrika_counter_id (optional)
VITE_SENTRY_DSN=your_sentry_dsn (optional)
```

### Running in Development Mode

```bash
npm run dev
```

## Project Structure

### Components

- `src/components/common/` - reusable components
- `src/components/layout/` - layout components
- `src/components/auth/` - authentication components
- `src/components/landing/` - landing page components

### Hooks

- `src/hooks/queries/` - React Query hooks for queries
- `src/hooks/mutations/` - React Query hooks for mutations
- `src/hooks/use*` - custom hooks

### API Layer

- `src/lib/api/` - modules for API interaction
- `src/lib/query/` - React Query configuration
- `src/lib/errors/` - error handling
- `src/lib/security/` - security utilities
- `src/lib/realtime/` - real-time updates

## Development Process

### Adding New Functionality

1. Create data types in `src/types/api.types.ts`
2. Implement the API layer in `src/lib/api/`
3. Create React Query hooks in `src/hooks/`
4. Develop components in `src/components/`
5. Integrate into pages in `src/pages/`

### Testing

#### Unit Tests

```bash
npm run test
```

#### Component Testing

Uses React Testing Library:

- `src/**/__tests__/*` or `src/**/*test.*`

### Styling and Formatting

#### TypeScript

- Strict typing is used
- All functions must have defined parameter and return types

#### Linting

```bash
npm run lint
```

#### Formatting

```bash
npm run format
```

## Git Workflow

### Branches

- `main` - main branch, only via PR
- `feature/*` - for new functionality
- `bugfix/*` - for bug fixes
- `hotfix/*` - for critical fixes

### Commit messages

We use conventional commits:

- `feat:` - new feature
- `fix:` - bug fix
- `refactor:` - refactoring
- `docs:` - documentation
- `test:` - tests

Example:

```
feat(auth): add social login with Google and GitHub
```

### Pull Requests

- Title should describe changes
- In the description, specify:
  - What was changed
  - Why changes were made
  - How to test changes

## Code Quality

### Checks

Before creating a PR, ensure that:

- All tests pass
- Code adheres to the linter
- Types are correctly described
- There are no console errors

### Code Review

- Check performance
- Evaluate security
- Ensure accessibility
- Check test coverage
