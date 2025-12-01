# Lumi API Documentation

This document describes the API interaction layer of the Lumi application, focusing on how the frontend communicates with the Supabase backend. The API layer is built around dedicated modules for each data entity and leverages `@tanstack/react-query` for efficient data management.

## Table of Contents

1.  [Overview](#1-overview)
2.  [API Modules](#2-api-modules)
    - [Profile API (`profile.api.ts`)](#profile-api-profileapits)
    - [Tasks API (`tasks.api.ts`)](#tasks-api-tasksapits)
    - [Projects API (`projects.api.ts`)](#projects-api-projectsapits)
3.  [Data Transfer Objects (DTOs)](#3-data-transfer-objects-dtos)
4.  [Error Handling](#4-error-handling)
5.  [Input Validation and Sanitization](#5-input-validation-and-sanitization)

## 1. Overview

The API layer is responsible for all data interactions with the Supabase backend. It is structured to be modular, testable, and efficient, utilizing `React Query` for caching, synchronization, and state management of server data.

Key characteristics:

- **Modular Design**: Each major data entity (Profile, Task, Project) has its own API module.
- **React Query Integration**: All data fetching and mutations are handled via `useQuery` and `useMutation` hooks, providing features like caching, background re-fetching, and optimistic updates.
- **Centralized Error Handling**: All API calls are wrapped with a custom `ErrorHandler` and `Logger` for consistent error processing and reporting.
- **Security**: Incorporates input validation (`Zod`) and sanitization to prevent common web vulnerabilities.

## 2. API Modules

### Profile API (`profile.api.ts`)

Manages user profile data.

- **`createProfile(userId: string): Promise<UserProfile>`**
  - **Description**: Creates a new user profile. This method is primarily used by the Supabase trigger function `create_profile_for_new_user()` but can be called directly if needed.
  - **Parameters**:
    - `userId` (string): The ID of the user for whom to create the profile.
  - **Returns**: `Promise<UserProfile>` - The newly created user profile.
  - **Throws**: `Error` if profile creation fails.

- **`getProfile(userId: string): Promise<UserProfile>`**
  - **Description**: Retrieves a user's profile. If the profile does not exist, it attempts to create a default one using an `upsert` operation to prevent race conditions.
  - **Parameters**:
    - `userId` (string): The ID of the user whose profile to retrieve.
  - **Returns**: `Promise<UserProfile>` - The user's profile.
  - **Throws**: `Error` if profile retrieval or creation fails.

- **`updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfile>`**
  - **Description**: Updates an existing user profile. If the profile does not exist, it creates one with the provided data.
  - **Parameters**:
    - `userId` (string): The ID of the user whose profile to update.
    - `data` (UpdateProfileDTO): An object containing the fields to update.
  - **Returns**: `Promise<UserProfile>` - The updated user profile.
  - **Throws**: `Error` if profile update fails.

- **`uploadAvatar(userId: string, file: File): Promise<string>`**
  - **Description**: Uploads an avatar image to Supabase Storage and updates the user's `avatar_url` in their profile.
  - **Parameters**:
    - `userId` (string): The ID of the user.
    - `file` (File): The image file to upload.
  - **Returns**: `Promise<string>` - The public URL of the uploaded avatar.
  - **Throws**: `Error` if file size exceeds limit or upload fails.

- **`getStorageStats(userId: string): Promise<StorageStats>`**
  - **Description**: Retrieves storage usage statistics for a user.
  - **Parameters**:
    - `userId` (string): The ID of the user.
  - **Returns**: `Promise<StorageStats>` - An object containing `used`, `limit`, and `percentage` of storage.
  - **Throws**: `Error` if retrieval fails.

### Tasks API (`tasks.api.ts`)

Manages user tasks.

- **`getAll(userId: string, projectId?: string): Promise<Task[]>`**
  - **Description**: Fetches all tasks for a given user, optionally filtered by project.
  - **Parameters**:
    - `userId` (string): The ID of the user.
    - `projectId` (string, optional): The ID of the project to filter tasks by.
  - **Returns**: `Promise<Task[]>` - An array of tasks.
  - **Throws**: `Error` if fetching tasks fails.

- **`getById(id: string): Promise<Task>`**
  - **Description**: Retrieves a single task by its ID.
  - **Parameters**:
    - `id` (string): The ID of the task.
  - **Returns**: `Promise<Task>` - The task object.
  - **Throws**: `Error` if fetching the task fails.

- **`create(task: CreateTaskDTO): Promise<Task>`**
  - **Description**: Creates a new task. Input data is validated and sanitized.
  - **Parameters**:
    - `task` (CreateTaskDTO): The data for the new task.
  - **Returns**: `Promise<Task>` - The newly created task.
  - **Throws**: `Error` if validation fails or task creation fails.

- **`update(id: string, updates: UpdateTaskDTO): Promise<Task>`**
  - **Description**: Updates an existing task. Input data is validated and sanitized.
  - **Parameters**:
    - `id` (string): The ID of the task to update.
    - `updates` (UpdateTaskDTO): An object containing the fields to update.
  - **Returns**: `Promise<Task>` - The updated task.
  - **Throws**: `Error` if validation fails or task update fails.

- **`delete(id: string): Promise<void>`**
  - **Description**: Deletes a task by its ID.
  - **Parameters**:
    - `id` (string): The ID of the task to delete.
  - **Returns**: `Promise<void>`
  - **Throws**: `Error` if task deletion fails.

- **`toggleComplete(id: string): Promise<Task>`**
  - **Description**: Toggles the `completed` status of a task.
  - **Parameters**:
    - `id` (string): The ID of the task.
  - **Returns**: `Promise<Task>` - The updated task.
  - **Throws**: `Error` if toggling status fails.

- **`getStats(userId: string): Promise<UserStats>`**
  - **Description**: Retrieves various statistics for a user's tasks (total, completed, overdue, tasks this week).
  - **Parameters**:
    - `userId` (string): The ID of the user.
  - **Returns**: `Promise<UserStats>` - An object containing task statistics.
  - **Throws**: `Error` if fetching stats fails.

### Projects API (`projects.api.ts`)

Manages user projects.

- **`getAll(userId: string): Promise<Project[]>`**
  - **Description**: Fetches all projects for a given user.
  - **Parameters**:
    - `userId` (string): The ID of the user.
  - **Returns**: `Promise<Project[]>` - An array of projects.
  - **Throws**: `Error` if fetching projects fails.

- **`getById(id: string): Promise<Project>`**
  - **Description**: Retrieves a single project by its ID.
  - **Parameters**:
    - `id` (string): The ID of the project.
  - **Returns**: `Promise<Project>` - The project object.
  - **Throws**: `Error` if fetching the project fails.

- **`create(project: CreateProjectDTO): Promise<Project>`**
  - **Description**: Creates a new project. Input data is validated and sanitized.
  - **Parameters**:
    - `project` (CreateProjectDTO): The data for the new project.
  - **Returns**: `Promise<Project>` - The newly created project.
  - **Throws**: `Error` if validation fails or project creation fails.

- **`update(id: string, updates: UpdateProjectDTO): Promise<Project>`**
  - **Description**: Updates an existing project. Input data is validated and sanitized.
  - **Parameters**:
    - `id` (string): The ID of the project to update.
    - `updates` (UpdateProjectDTO): An object containing the fields to update.
  - **Returns**: `Promise<Project>` - The updated project.
  - **Throws**: `Error` if validation fails or project update fails.

- **`delete(id: string): Promise<void>`**
  - **Description**: Deletes a project by its ID.
  - **Parameters**:
    - `id` (string): The ID of the project to delete.
  - **Returns**: `Promise<void>`
  - **Throws**: `Error` if project deletion fails.

- **`getStats(projectId: string): Promise<ProjectStats>`**
  - **Description**: Retrieves statistics for a specific project (total tasks, completed tasks, overdue tasks).
  - **Parameters**:
    - `projectId` (string): The ID of the project.
  - **Returns**: `Promise<ProjectStats>` - An object containing project statistics.
  - **Throws**: `Error` if fetching stats fails.

## 3. Data Transfer Objects (DTOs)

The following DTOs are defined in `src/types/api.types.ts` and are used across the API layer:

- **`UserProfile`**: Represents a user's profile data.
- **`UpdateProfileDTO`**: Fields for updating a user profile.
- **`StorageStats`**: User storage usage statistics.
- **`Task`**: Represents a task object.
- **`CreateTaskDTO`**: Fields required to create a new task.
- **`UpdateTaskDTO`**: Fields for updating an existing task.
- **`UserStats`**: User task statistics.
- **`Project`**: Represents a project object.
- **`CreateProjectDTO`**: Fields required to create a new project.
- **`UpdateProjectDTO`**: Fields for updating an existing project.
- **`ProjectStats`**: Project task statistics.

## 4. Error Handling

All API methods are wrapped in `try...catch` blocks that utilize a centralized error handling mechanism:

- **`ErrorHandler.handle(error: unknown): AppError`**: Located in `src/lib/errors/ErrorHandler.ts`, this function processes raw errors (e.g., Supabase errors, network errors) and converts them into a standardized `AppError` object.
- **`Logger.error(message: string, error: AppError | unknown)`**: Located in `src/lib/errors/logger.ts`, this function logs detailed error information to the console and can be extended to send errors to monitoring services like Sentry.
- **`AppError`**: A custom error type (defined in `src/lib/errors/errorTypes.ts`) that categorizes errors (e.g., `NETWORK_ERROR`, `VALIDATION_ERROR`, `SERVER_ERROR`) and provides user-friendly messages.

This approach ensures consistent error reporting and allows the UI to display appropriate messages to the user.

## 5. Input Validation and Sanitization

To enhance security and data integrity, all API `create` and `update` methods perform input validation and sanitization:

- **`Zod` Schemas**: Defined in `src/lib/security/securityUtils.ts` (e.g., `taskInputSchema`, `projectInputSchema`), these schemas are used to validate incoming data against predefined rules (e.g., data types, minimum/maximum lengths).
- **`validateUserInput(data: any, schema: ZodSchema)`**: A utility function that throws a `ValidationError` if the input data does not conform to the provided Zod schema.
- **`sanitizeInput(input: string): string`**: A utility function that removes potentially malicious HTML or script content from user-provided strings, preventing XSS attacks.
