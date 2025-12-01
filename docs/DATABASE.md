# Lumi Database Documentation

## Schema Overview

The Lumi application uses a PostgreSQL database managed by Supabase. The schema is designed to support user profiles, projects, and tasks, with appropriate relationships and constraints.

### Table `users_profile`

Stores user-specific profile information.

- `id` (UUID): Primary key, references `auth.users(id)` with `ON DELETE CASCADE`. This links the profile directly to the Supabase authentication user.
- `full_name` (TEXT): The full name of the user.
- `avatar_url` (TEXT): URL to the user's avatar image, stored in Supabase Storage.
- `storage_used` (BIGINT, DEFAULT 0): Tracks the amount of storage (in bytes) used by the user for tasks.
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()): Timestamp of profile creation.
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()): Timestamp of the last profile update.

### Table `projects`

Stores user-created projects.

- `id` (UUID, PRIMARY KEY, DEFAULT `gen_random_uuid()`): Unique identifier for the project.
- `user_id` (UUID, NOT NULL): Foreign key referencing `auth.users(id)` with `ON DELETE CASCADE`, indicating the owner of the project.
- `name` (TEXT, NOT NULL, CHECK `LENGTH(name) <= 100`): Name of the project, with a maximum length of 100 characters.
- `description` (TEXT, CHECK `LENGTH(description) <= 500`): Optional description of the project, max 500 characters.
- `tasks_count` (INTEGER, DEFAULT 0): Total number of tasks within this project. Updated by a trigger.
- `completed_tasks_count` (INTEGER, DEFAULT 0): Number of completed tasks within this project. Updated by a trigger.
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()): Timestamp of project creation.
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()): Timestamp of the last project update.

### Table `tasks`

Stores individual tasks associated with users and optionally projects.

- `id` (UUID, PRIMARY KEY, DEFAULT `gen_random_uuid()`): Unique identifier for the task.
- `user_id` (UUID, NOT NULL): Foreign key referencing `auth.users(id)` with `ON DELETE CASCADE`, indicating the owner of the task.
- `project_id` (UUID, REFERENCES `projects(id)` `ON DELETE SET NULL`): Optional foreign key linking the task to a project. If the project is deleted, this field is set to NULL.
- `title` (TEXT, NOT NULL, CHECK `LENGTH(title) <= 200`): Title of the task, max 200 characters.
- `description` (TEXT, CHECK `LENGTH(description) <= 1000`): Short description of the task, max 1000 characters.
- `detailed_description` (TEXT, CHECK `LENGTH(detailed_description) <= 5000`): Detailed description of the task, max 5000 characters.
- `completed` (BOOLEAN, DEFAULT FALSE): Status of the task (completed or not).
- `priority` (TEXT, DEFAULT 'medium', CHECK `priority IN ('low', 'medium', 'high')`): Priority level of the task.
- `start_date` (DATE): Optional start date for the task.
- `due_date` (DATE): Optional due date for the task.
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()): Timestamp of task creation.
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()): Timestamp of the last task update.

## Row Level Security (RLS) Policies

RLS is enabled for `users_profile`, `projects`, and `tasks` tables to ensure data isolation and security. Policies are defined to allow users to only access and modify their own data.

### `users_profile` Policies

- **"Users can view own profile"**: Allows authenticated users to `SELECT` their own profile based on `auth.uid() = id`.
- **"Users can update own profile"**: Allows authenticated users to `UPDATE` their own profile based on `auth.uid() = id`.
- **"Users can insert own profile"**: Allows authenticated users to `INSERT` their own profile based on `auth.uid() = id`.

### `projects` Policies

- **"Users can view own projects"**: Allows authenticated users to `SELECT` their own projects based on `auth.uid() = user_id`.
- **"Users can insert own projects"**: Allows authenticated users to `INSERT` their own projects based on `auth.uid() = user_id`.
- **"Users can update own projects"**: Allows authenticated users to `UPDATE` their own projects based on `auth.uid() = user_id`.
- **"Users can delete own projects"**: Allows authenticated users to `DELETE` their own projects based on `auth.uid() = user_id`.

### `tasks` Policies

- **"Users can view own tasks"**: Allows authenticated users to `SELECT` their own tasks based on `auth.uid() = user_id`.
- **"Users can insert own tasks"**: Allows authenticated users to `INSERT` their own tasks based on `auth.uid() = user_id`.
- **"Users can update own tasks"**: Allows authenticated users to `UPDATE` their own tasks based on `auth.uid() = user_id`.
- **"Users can delete own tasks"**: Allows authenticated users to `DELETE` their own tasks based on `auth.uid() = user_id`.

## Trigger Functions

Several PostgreSQL functions and triggers are implemented to automate data management and maintain data integrity.

### `create_profile_for_new_user()`

- **Purpose**: Automatically creates a corresponding entry in the `users_profile` table whenever a new user registers via Supabase Auth.
- **Mechanism**: This function is triggered `AFTER INSERT` on `auth.users`. It inserts a new row into `users_profile` using the new user's `id` and extracts `full_name` and `avatar_url` from `raw_user_meta_data`.
- **`SECURITY DEFINER`**: Crucially, this function is defined with `SECURITY DEFINER`. This allows the function to execute with the privileges of the user who created it (typically a database superuser), bypassing RLS policies on `users_profile` for this specific operation. This ensures that profile creation succeeds even when the newly registered user does not yet have explicit RLS permissions to insert into `users_profile`.

### `calculate_user_storage(user_id_param UUID)`

- **Purpose**: Calculates the total storage (in bytes) used by a specific user based on the length of text fields in their tasks.
- **Mechanism**: Sums the lengths of `title`, `description`, and `detailed_description` for all tasks belonging to `user_id_param`.

### `update_project_stats(project_id_param UUID)`

- **Purpose**: Updates the `tasks_count` and `completed_tasks_count` for a given project.
- **Mechanism**: Counts tasks and completed tasks associated with `project_id_param` and updates the `projects` table.

### `update_user_storage_trigger()`

- **Purpose**: Automatically updates the `storage_used` field in `users_profile` whenever tasks are inserted, updated, or deleted.
- **Trigger**: `AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW`.
- **Mechanism**: Calculates the size difference based on `NEW` and `OLD` task data and adjusts the `storage_used` for the relevant user.

### `update_project_stats_trigger()`

- **Purpose**: Automatically updates project statistics (`tasks_count`, `completed_tasks_count`) when tasks associated with a project are modified.
- **Trigger**: `AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW`.
- **Mechanism**: Calls `update_project_stats()` for the affected project(s). Handles cases where a task's `project_id` changes.

### `update_updated_at_column()`

- **Purpose**: Generic function to automatically set the `updated_at` timestamp to `NOW()` before an update operation.
- **Trigger**: `BEFORE UPDATE` on `users_profile`, `projects`, and `tasks` tables.

## Supabase Storage Policies

The project utilizes Supabase Storage for managing user avatars.

- **Bucket `avatars`**: A public bucket named 'avatars' is created, allowing image files (`png`, `jpg`, `jpeg`, `gif`, `webp`) up to 5MB.
- **Policies**: RLS policies are applied to `storage.objects` within the `avatars` bucket to ensure users can only read, insert, update, and delete their own avatars, identified by a folder named after their `auth.uid()`.
