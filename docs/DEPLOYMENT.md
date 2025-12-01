# Deployment Guide for Lumi

This document outlines the procedures for deploying the Lumi application to a production environment, including environment variable configuration, build processes, and monitoring setup.

## Table of Contents

1.  [Deployment Platform](#1-deployment-platform)
2.  [Environment Variables](#2-environment-variables)
3.  [Build Process](#3-build-process)
4.  [Continuous Integration/Continuous Deployment (CI/CD)](#4-continuous-integrationcontinuous-deployment-cicd)
5.  [Monitoring and Analytics](#5-monitoring-and-analytics)
6.  [Database Migrations](#6-database-migrations)
7.  [Production Checklist](#7-production-checklist)

## 1. Deployment Platform

Lumi is designed to be easily deployable on platforms like **Vercel** for the frontend and **Supabase** for the backend. This guide primarily focuses on Vercel for frontend deployment.

## 2. Environment Variables

Production deployments require specific environment variables to be configured securely. These should **never** be committed to version control.

### Required Environment Variables

- `VITE_SUPABASE_URL`: The URL of your Supabase project.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase project's `anon` public key.
- `VITE_SENTRY_DSN`: (Optional) Your Sentry DSN for error tracking.
- `VITE_YANDEX_METRIKA_ID`: (Optional) Your Yandex Metrika counter ID for analytics.

### Configuration on Vercel

1.  Go to your Vercel project dashboard.
2.  Navigate to "Settings" -> "Environment Variables".
3.  Add each required environment variable with its corresponding production value. Ensure they are configured for the correct environments (e.g., "Production", "Preview", "Development").

## 3. Build Process

The application is built using Vite. The production build process generates optimized static assets.

To create a production build locally:

```bash
npm run build
```

This command will:

- Compile TypeScript files.
- Bundle and minify JavaScript, CSS, and other assets.
- Perform tree-shaking to remove unused code.
- Generate a Service Worker for PWA capabilities.

The output will be in the `dist/` directory.

## 4. Continuous Integration/Continuous Deployment (CI/CD)

The project uses GitHub Actions for CI/CD. A basic workflow is configured to run tests on every push and pull request to the `main` and `develop` branches.

### `ci.yml` Workflow

The `ci.yml` file (located in `.github/workflows/ci.yml`) defines the CI process:

- **Triggers**: Runs on `push` and `pull_request` events to `main` and `develop` branches.
- **Steps**:
  1.  Checks out the code.
  2.  Sets up Node.js (version 18).
  3.  Installs project dependencies (`npm install`).
  4.  Runs unit and component tests (`npm test`).

**Note**: E2E tests are planned but not yet integrated into the CI pipeline due to setup complexities.

## 5. Monitoring and Analytics

For production, monitoring and analytics are crucial for understanding application health and user behavior.

- **Sentry**: Integrated for real-time error tracking and performance monitoring. Ensure `VITE_SENTRY_DSN` is configured in your production environment variables.
- **Yandex Metrika**: Integrated for web analytics. Ensure `VITE_YANDEX_METRIKA_ID` is configured.
- **Custom Performance Logging**: `src/lib/monitoring/performanceLogger.ts` captures detailed performance metrics.

## 6. Database Migrations

Database schema changes are managed through SQL migration files in `supabase/migrations/`.

- **Applying Migrations**: When deploying to a new environment or updating the schema, ensure the latest SQL migration scripts are applied to your Supabase project. This is typically done via the Supabase dashboard's SQL Editor.

## 7. Production Checklist

Before deploying to production, ensure the following:

- [ ] All environment variables are correctly configured on the deployment platform.
- [ ] The latest database schema and RLS policies are applied to your Supabase project.
- [ ] All unit and component tests pass successfully.
- [ ] (If implemented) E2E tests pass successfully.
- [ ] Code coverage meets the required threshold.
- [ ] Performance metrics (e.g., Lighthouse scores) are acceptable.
- [ ] Accessibility audits pass.
- [ ] Sentry and analytics integrations are correctly configured and reporting data.
- [ ] Review `vercel.json` for appropriate security headers and caching strategies.
- [ ] Consider setting up automatic backups for your Supabase database.
- [ ] Implement a rollback strategy in case of deployment issues.
