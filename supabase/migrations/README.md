# Supabase Database Migrations

This directory contains SQL migration files for the Lumi project's Supabase database. These files define the database schema, Row Level Security (RLS) policies, and trigger functions.

## Migration Files

### `01_create_tables_and_policies_fixed.sql`

This is the primary migration script that sets up the core database structure and security. It includes:

- **Table Creation**: Defines `users_profile`, `projects`, and `tasks` tables with their respective columns, data types, and constraints.
- **Row Level Security (RLS)**: Enables RLS for all application tables and defines policies to ensure users can only access and modify their own data.
- **Trigger Functions**:
  - `create_profile_for_new_user()`: Automatically creates a user profile upon new user registration, now with `SECURITY DEFINER` to correctly bypass RLS during creation.
  - `calculate_user_storage()`: Function to calculate storage used by a user.
  - `update_project_stats()`: Function to update project task counts.
  - `update_user_storage_trigger()`: Trigger to update user storage on task changes.
  - `update_project_stats_trigger()`: Trigger to update project statistics on task changes.
  - `update_updated_at_column()`: Generic function and triggers to automatically update `updated_at` timestamps.
- **Supabase Storage Configuration**: Sets up the `avatars` storage bucket and its RLS policies.

## Applying Migrations

To apply these migrations to your Supabase project:

1.  Go to your Supabase project dashboard.
2.  Navigate to the "SQL Editor" section.
3.  Open the desired `.sql` migration file from this directory.
4.  Copy the entire content of the SQL file.
5.  Paste it into the Supabase SQL Editor and run the query.

**Note**: Always ensure you understand the changes being applied before running any migration script in a production environment.
