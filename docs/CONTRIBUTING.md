# Contributing to Lumi

We welcome contributions to the Lumi project! By following these guidelines, you can help us maintain code quality, consistency, and a smooth development workflow.

## Table of Contents

1.  [Code Style Guide](#1-code-style-guide)
2.  [Git Workflow](#2-git-workflow)
3.  [Pull Request Guidelines](#3-pull-request-guidelines)
4.  [Testing Requirements](#4-testing-requirements)
5.  [Commit Message Convention](#5-commit-message-convention)
6.  [JSDoc Comments](#6-jsdoc-comments)

## 1. Code Style Guide

Lumi uses **Prettier** for code formatting and **ESLint** for linting. These tools are configured to run automatically on pre-commit hooks to ensure consistent code style across the project.

- **Prettier**: Automatically formats your code. Configuration is in `.prettierrc.json`.
- **ESLint**: Identifies and reports on patterns found in JavaScript/TypeScript code. Configuration is in `.eslintrc.cjs`.

To manually run Prettier and ESLint:

```bash
# Format all files
npx prettier --write .

# Lint all files
npx eslint . --fix
```

## 2. Git Workflow

We follow a feature-branch workflow:

1.  **Fork the repository** and clone your fork.
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/your-bug-fix-name`.
3.  **Make your changes** and commit them.
4.  **Push your branch** to your fork.
5.  **Create a Pull Request** to the `main` branch of the upstream repository.

## 3. Pull Request Guidelines

- **One feature/bug fix per PR**: Keep your pull requests focused on a single change.
- **Descriptive title**: Clearly state the purpose of the PR.
- **Detailed description**: Explain what changes you made, why you made them, and how to test them.
- **Link to issues**: If your PR addresses an open issue, link to it (e.g., `Fixes #123`).
- **Pass all tests**: Ensure all unit and E2E tests pass.
- **Code coverage**: Maintain or improve code coverage.
- **Review**: Your PR will be reviewed by maintainers. Be responsive to feedback.

## 4. Testing Requirements

All new features and bug fixes should be accompanied by appropriate tests.

- **Unit Tests**: For individual functions, components, and hooks. Written using **Vitest** and **React Testing Library**.
- **Component Tests**: For React components, ensuring they render correctly and respond to user interactions.
- **E2E Tests**: (Planned) For critical user flows, using **Cypress** or **Playwright**.

To run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

## 5. Commit Message Convention

We use **Conventional Commits** to standardize commit messages. This helps with generating changelogs and understanding the history of the project.

Your commit messages should follow the format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**Examples:**

- `feat(auth): add email/password registration`
- `fix(profile): resolve race condition in getProfile`
- `docs(architecture): update architecture overview`
- `chore(deps): update @tanstack/react-query`

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semicolons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**Commitlint** is configured to enforce these conventions.

## 6. JSDoc Comments

Please add JSDoc comments for all exported functions, components, and complex logic. This improves code readability and maintainability.

**Example:**

```typescript
/**
 * Fetches all tasks for a given user, optionally filtered by project.
 * @param {string} userId - The ID of the user.
 * @param {string} [projectId] - Optional project ID to filter tasks.
 * @returns {Promise<Task[]>} A promise that resolves to an array of tasks.
 * @throws {Error} If the API call fails.
 */
async getAll(userId: string, projectId?: string): Promise<Task[]> {
  // ... implementation ...
}
```
