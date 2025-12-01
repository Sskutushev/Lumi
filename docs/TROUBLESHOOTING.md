# Troubleshooting Guide for Lumi

This guide provides solutions to common issues you might encounter while developing or running the Lumi application.

## Table of Contents

1.  [General Issues](#1-general-issues)
2.  [Installation Issues](#2-installation-issues)
3.  [Supabase/Backend Issues](#3-supabasebackend-issues)
4.  [Frontend/UI Issues](#4-frontendui-issues)
5.  [Testing Issues](#5-testing-issues)
6.  [Performance Issues](#6-performance-issues)

## 1. General Issues

### Application not starting or blank screen

- **Check console for errors**: Open your browser's developer console (F12) and look for any error messages.
- **Verify environment variables**: Ensure your `.env.local` file is correctly configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Reinstall dependencies**: Run `npm install` to ensure all packages are correctly installed.
- **Clear browser cache**: Sometimes old cached files can cause issues.

## 2. Installation Issues

### `npm install` fails or times out

- **Check network connection**: Ensure you have a stable internet connection.
- **Clear npm cache**: Run `npm cache clean --force` and try `npm install` again.
- **Node.js version**: Verify you are using Node.js v18 or higher.
- **Proxy issues**: If you are behind a corporate proxy, configure npm to use it.

### `npx husky install` fails

- This command is deprecated. Husky should be initialized automatically via the `prepare` script in `package.json` during `npm install`. If you encounter issues, ensure `npm install` ran successfully.
- Manually check if `.husky/` directory and its hooks (`pre-commit`, `commit-msg`) exist and have executable permissions.

## 3. Supabase/Backend Issues

### "Database error saving new user" during registration

- **Cause**: This typically happens if the `create_profile_for_new_user()` function in your Supabase migrations does not have `SECURITY DEFINER` set, preventing it from bypassing RLS policies during profile creation.
- **Solution**: Ensure your `supabase/migrations/01_create_tables_and_policies_fixed.sql` file (or equivalent) has `SECURITY DEFINER` added to the `create_profile_for_new_user()` function. Re-run the migration in your Supabase SQL Editor.

### RLS policy violations

- **Error message**: You might see errors like "permission denied for table users_profile" or similar.
- **Cause**: Your RLS policies might be too restrictive or incorrectly configured.
- **Solution**: Review your RLS policies in the Supabase dashboard for the affected tables (`users_profile`, `projects`, `tasks`). Ensure they allow authenticated users to perform the necessary `SELECT`, `INSERT`, `UPDATE`, `DELETE` operations on their own data (`auth.uid() = id` or `auth.uid() = user_id`).

### API calls failing (e.g., `Failed to get tasks`)

- **Check network**: Ensure your application can reach the Supabase API URL.
- **Supabase project status**: Verify your Supabase project is running and healthy in the Supabase dashboard.
- **API keys**: Double-check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env.local` file.
- **Database schema**: Ensure your database schema matches the expected structure, including tables, columns, and RLS policies.
- **Server logs**: Check Supabase logs for any backend errors.

## 4. Frontend/UI Issues

### Component not rendering or unexpected behavior

- **Check browser console**: Look for React errors or warnings.
- **React DevTools**: Use the React Developer Tools browser extension to inspect component state and props.
- **State management**: Verify that local component state, Zustand store, and React Query cache are holding the expected data.
- **CSS issues**: Use browser developer tools to inspect CSS and ensure styles are applied correctly (Tailwind CSS).

### `TaskItem` import error in tests

- **Cause**: The `TaskItem` component was refactored and moved to `src/components/TaskItem.tsx`. Old test files might be referencing an incorrect path.
- **Solution**: Update any test files (e.g., `src/components/__tests__/TaskItem.test.tsx`) to import `TaskItem` from `../../components/TaskItem`.

## 5. Testing Issues

### Unit/Component tests failing

- **Supabase mocking**: If API tests are failing with `TypeError: supabase.from(...).xyz is not a function`, it means the Supabase client is not being mocked correctly. Ensure your test setup (`src/test/setup.ts` or individual test files) properly mocks the `supabase` object with all necessary methods (`from`, `select`, `insert`, `update`, `delete`, `upsert`, `eq`, `single`, `order`, `rpc`, `storage`).
- **React Query setup**: Ensure `QueryClientProvider` is correctly set up in your test wrappers for hooks and components that use React Query.
- **Syntax errors in test files**: Check for any parsing errors in your test files, especially related to JSX or TypeScript configuration.
- **Outdated snapshots**: If using snapshot testing, update snapshots if changes are intentional.

### E2E tests not running or failing

- **Cypress/Playwright installation**: Ensure the E2E testing framework is correctly installed. If installation times out, check network or try again.
- **Test environment**: Verify the application is running on the correct URL/port for E2E tests.
- **Selectors**: Check if element selectors in your E2E tests are still valid after UI changes.

## 6. Performance Issues

### Slow loading times or unresponsive UI

- **Browser DevTools Performance tab**: Profile the application to identify bottlenecks (e.g., long tasks, excessive re-renders).
- **Lighthouse/PageSpeed Insights**: Run audits to get actionable insights on performance, accessibility, and best practices.
- **Bundle size**: Use `rollup-plugin-visualizer` (run `npm run build` and check `stats.html`) to identify large dependencies and optimize imports.
- **Network requests**: Monitor network requests in DevTools to identify slow API calls or large asset downloads.
- **React Query**: Ensure proper caching strategies (`staleTime`, `cacheTime`) are configured.
