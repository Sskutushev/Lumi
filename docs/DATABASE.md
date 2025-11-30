# Lumi Database Schema

This document outlines the database schema, policies, and functions for the Lumi application, managed by Supabase.

## Table of Contents

- [Schema](#schema)
  - [users_profile](#users_profile)
  - [projects](#projects)
  - [tasks](#tasks)
- [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
  - [users_profile Policies](#users_profile-policies)
  - [projects Policies](#projects-policies)
  - [tasks Policies](#tasks-policies)
- [Storage](#storage)
  - [buckets: avatars](#buckets-avatars)
  - [Storage Policies](#storage-policies)
- [Database Functions](#database-functions)
  - [calculate_user_storage()](#calculate_user_storage)
  - [update_project_stats()](#update_project_stats)
  - [create_profile_for_new_user()](#create_profile_for_new_user)
  - [update_updated_at_column()](#update_updated_at_column)
- [Database Triggers](#database-triggers)
  - [on_auth_user_created](#on_auth_user_created)
  - [user_storage_trigger](#user_storage_trigger)
  - [project_stats_trigger](#project_stats_trigger)
  - [updated_at Triggers](#updated_at-triggers)

---

## Schema

### `users_profile`

Stores user profile information, linked to the `auth.users` table.

| Column         | Type                     | Constraints                               | Description                               |
|----------------|--------------------------|-------------------------------------------|-------------------------------------------|
| `id`           | `UUID`                   | **Primary Key**, Foreign Key to `auth.users.id` | Links to the authentication user record.  |
| `full_name`    | `TEXT`                   |                                           | The user's full name.                     |
| `avatar_url`   | `TEXT`                   |                                           | URL for the user's avatar image.          |
| `storage_used` | `BIGINT`                 | `DEFAULT 0`                               | Total storage used by the user in bytes.  |
| `created_at`   | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()`                           | Timestamp of profile creation.            |
| `updated_at`   | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()`                           | Timestamp of the last profile update.     |

### `projects`

Stores user-created projects to organize tasks.

| Column                  | Type                     | Constraints                               | Description                               |
|-------------------------|--------------------------|-------------------------------------------|-------------------------------------------|
| `id`                    | `UUID`                   | **Primary Key**, `DEFAULT gen_random_uuid()`| Unique identifier for the project.        |
| `user_id`               | `UUID`                   | **Not Null**, Foreign Key to `auth.users.id`  | The user who owns the project.            |
| `name`                  | `TEXT`                   | **Not Null**, `LENGTH <= 100`             | The name of the project.                  |
| `description`           | `TEXT`                   | `LENGTH <= 500`                           | A brief description of the project.       |
| `tasks_count`           | `INTEGER`                | `DEFAULT 0`                               | Total number of tasks in the project.     |
| `completed_tasks_count` | `INTEGER`                | `DEFAULT 0`                               | Number of completed tasks in the project. |
| `created_at`            | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()`                           | Timestamp of project creation.            |
| `updated_at`            | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()`                           | Timestamp of the last project update.     |

### `tasks`

Stores individual to-do items.

| Column                 | Type                     | Constraints                               | Description                               |
|------------------------|--------------------------|-------------------------------------------|-------------------------------------------|
| `id`                   | `UUID`                   | **Primary Key**, `DEFAULT gen_random_uuid()`| Unique identifier for the task.           |
| `user_id`              | `UUID`                   | **Not Null**, Foreign Key to `auth.users.id`  | The user who owns the task.               |
| `project_id`           | `UUID`                   | Foreign Key to `projects.id` (on delete SET NULL) | The project this task belongs to.         |
| `title`                | `TEXT`                   | **Not Null**, `LENGTH <= 200`             | The title of the task.                    |
| `description`          | `TEXT`                   | `LENGTH <= 1000`                          | A short description of the task.          |
| `detailed_description` | `TEXT`                   | `LENGTH <= 5000`                          | A more detailed description of the task.  |
| `completed`            | `BOOLEAN`                | `DEFAULT FALSE`                           | Whether the task is completed.            |
| `priority`             | `TEXT`                   | `DEFAULT 'medium'`, `CHECK IN ('low', 'medium', 'high')` | The priority of the task.                 |
| `start_date`           | `DATE`                   |                                           | The start date of the task.               |
| `due_date`             | `DATE`                   |                                           | The due date of the task.                 |
| `created_at`           | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()`                           | Timestamp of task creation.               |
| `updated_at`           | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()`                           | Timestamp of the last task update.        |

---

## Row Level Security (RLS) Policies

RLS is enabled for all tables (`users_profile`, `projects`, `tasks`) to ensure data privacy.

### `users_profile` Policies

- **Users can view own profile**: Allows authenticated users to `SELECT` their own profile.
- **Users can update own profile**: Allows authenticated users to `UPDATE` their own profile.
- **Users can insert own profile**: Allows authenticated users to `INSERT` their own profile record.

### `projects` Policies

- **Users can view own projects**: Allows authenticated users to `SELECT` their own projects.
- **Users can insert own projects**: Allows authenticated users to `INSERT` projects for themselves.
- **Users can update own projects**: Allows authenticated users to `UPDATE` their own projects.
- **Users can delete own projects**: Allows authenticated users to `DELETE` their own projects.

### `tasks` Policies

- **Users can view own tasks**: Allows authenticated users to `SELECT` their own tasks.
- **Users can insert own tasks**: Allows authenticated users to `INSERT` tasks for themselves.
- **Users can update own tasks**: Allows authenticated users to `UPDATE` their own tasks.
- **Users can delete own tasks**: Allows authenticated users to `DELETE` their own tasks.

---

## Storage

### Buckets: `avatars`

A public bucket for storing user avatar images.

- **File Size Limit**: 5MB
- **Allowed MIME types**: `image/png`, `image/jpg`, `image/jpeg`, `image/gif`, `image/webp`

### Storage Policies

- **Allow users to read own avatars**: Allows authenticated users to `SELECT` any avatar.
- **Allow users to insert own avatars**: Allows authenticated users to `INSERT` an avatar into a folder matching their `user_id`.
- **Allow users to update own avatars**: Allows authenticated users to `UPDATE` an avatar in a folder matching their `user_id`.
- **Allow users to delete own avatars**: Allows authenticated users to `DELETE` an avatar from a folder matching their `user_id`.

---

## Database Functions

### `calculate_user_storage()`

- **Returns**: `BIGINT`
- **Description**: Calculates the total storage used by a user based on the `LENGTH` of text fields in their tasks.

### `update_project_stats()`

- **Returns**: `VOID`
- **Description**: Updates the `tasks_count` and `completed_tasks_count` for a given project.

### `create_profile_for_new_user()`

- **Returns**: `TRIGGER`
- **Description**: Automatically creates a new `users_profile` record when a new user signs up in `auth.users`. It populates the profile with metadata from the user registration if available.

### `update_updated_at_column()`

- **Returns**: `TRIGGER`
- **Description**: A generic function that updates the `updated_at` column to the current timestamp.

---

## Database Triggers

### `on_auth_user_created`

- **Event**: `AFTER INSERT` on `auth.users`
- **Action**: Executes `create_profile_for_new_user()` to create a corresponding user profile.

### `user_storage_trigger`

- **Event**: `AFTER INSERT OR UPDATE OR DELETE` on `tasks`
- **Action**: Executes `update_user_storage_trigger()` which dynamically recalculates the user's `storage_used` in their `users_profile` based on the size of task text fields.

### `project_stats_trigger`

- **Event**: `AFTER INSERT OR UPDATE OR DELETE` on `tasks`
- **Action**: Executes `update_project_stats_trigger()` which calls `update_project_stats()` to keep project statistics up-to-date when tasks are added, removed, or moved between projects.

### `updated_at` Triggers

- **Event**: `BEFORE UPDATE` on `users_profile`, `projects`, and `tasks`.
- **Action**: Executes `update_updated_at_column()` to automatically set the `updated_at` field on every update.
