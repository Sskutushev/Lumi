-- User profiles table
CREATE TABLE IF NOT EXISTS users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    storage_used BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments for users_profile table
COMMENT ON TABLE users_profile IS 'User profiles';
COMMENT ON COLUMN users_profile.id IS 'Reference to id in auth.users';
COMMENT ON COLUMN users_profile.full_name IS 'Full name of the user';
COMMENT ON COLUMN users_profile.avatar_url IS 'URL of the user''s avatar';
COMMENT ON COLUMN users_profile.storage_used IS 'Amount of storage used in bytes';
COMMENT ON COLUMN users_profile.created_at IS 'Profile creation date';
COMMENT ON COLUMN users_profile.updated_at IS 'Profile last update date';

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (LENGTH(name) <= 100),
    description TEXT CHECK (LENGTH(description) <= 500),
    tasks_count INTEGER DEFAULT 0,
    completed_tasks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments for projects table
COMMENT ON TABLE projects IS 'User projects';
COMMENT ON COLUMN projects.id IS 'Unique project identifier';
COMMENT ON COLUMN projects.user_id IS 'Reference to the user who owns the project';
COMMENT ON COLUMN projects.name IS 'Project name (maximum 100 characters)';
COMMENT ON COLUMN projects.description IS 'Project description (maximum 500 characters)';
COMMENT ON COLUMN projects.tasks_count IS 'Number of tasks in the project';
COMMENT ON COLUMN projects.completed_tasks_count IS 'Number of completed tasks in the project';
COMMENT ON COLUMN projects.created_at IS 'Project creation date';
COMMENT ON COLUMN projects.updated_at IS 'Project last update date';

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL CHECK (LENGTH(title) <= 200),
    description TEXT CHECK (LENGTH(description) <= 1000),
    detailed_description TEXT CHECK (LENGTH(detailed_description) <= 5000),
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments for tasks table
COMMENT ON TABLE tasks IS 'User tasks';
COMMENT ON COLUMN tasks.id IS 'Unique task identifier';
COMMENT ON COLUMN tasks.user_id IS 'Reference to the user who owns the task';
COMMENT ON COLUMN tasks.project_id IS 'Reference to the project the task belongs to';
COMMENT ON COLUMN tasks.title IS 'Task title (maximum 200 characters)';
COMMENT ON COLUMN tasks.description IS 'Brief task description (maximum 1000 characters)';
COMMENT ON COLUMN tasks.detailed_description IS 'Detailed task description (maximum 5000 characters)';
COMMENT ON COLUMN tasks.completed IS 'Task completion status';
COMMENT ON COLUMN tasks.priority IS 'Task priority (low, medium, high)';
COMMENT ON COLUMN tasks.start_date IS 'Task start date';
COMMENT ON COLUMN tasks.due_date IS 'Task due date';
COMMENT ON COLUMN tasks.created_at IS 'Task creation date';
COMMENT ON COLUMN tasks.updated_at IS 'Task last update date';

-- Enable RLS for all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Security policies for users_profile table
DROP POLICY IF EXISTS "Users can view own profile" ON users_profile;
CREATE POLICY "Users can view own profile" ON users_profile
FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;
CREATE POLICY "Users can update own profile" ON users_profile
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;
CREATE POLICY "Users can insert own profile" ON users_profile
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Security policies for projects table
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects" ON projects
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects" ON projects
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Security policies for tasks table
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks" ON tasks
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks" ON tasks
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks" ON tasks
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks" ON tasks
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Function to calculate used storage
CREATE OR REPLACE FUNCTION calculate_user_storage(user_id_param UUID)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    total_storage BIGINT;
BEGIN
    SELECT COALESCE(SUM(
        COALESCE(LENGTH(title), 0) +
        COALESCE(LENGTH(description), 0) +
        COALESCE(LENGTH(detailed_description), 0)
    ), 0)
    INTO total_storage
    FROM tasks
    WHERE user_id = user_id_param;

    RETURN total_storage;
END;
$$;

-- Function to update project statistics
CREATE OR REPLACE FUNCTION update_project_stats(project_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE projects
    SET
        tasks_count = (
            SELECT COUNT(*)
            FROM tasks
            WHERE project_id = project_id_param
        ),
        completed_tasks_count = (
            SELECT COUNT(*)
            FROM tasks
            WHERE project_id = project_id_param AND completed = true
        ),
        updated_at = NOW()
    WHERE id = project_id_param;
END;
$$;

-- Trigger to update storage_used on task change
CREATE OR REPLACE FUNCTION update_user_storage_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    old_size BIGINT;
    new_size BIGINT;
BEGIN
    -- Calculate old size for UPDATE/DELETE
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        old_size := COALESCE(LENGTH(OLD.title), 0) +
                    COALESCE(LENGTH(OLD.description), 0) +
                    COALESCE(LENGTH(OLD.detailed_description), 0);
    ELSE
        old_size := 0;
    END IF;

    -- Calculate new size for INSERT/UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        new_size := COALESCE(LENGTH(NEW.title), 0) +
                    COALESCE(LENGTH(NEW.description), 0) +
                    COALESCE(LENGTH(NEW.detailed_description), 0);
    ELSE
        new_size := 0;
    END IF;

    -- Update storage_used in user profile
    IF TG_OP = 'INSERT' THEN
        -- On INSERT, add the new size
        UPDATE users_profile
        SET storage_used = storage_used + new_size
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- On UPDATE, update the difference
        UPDATE users_profile
        SET storage_used = storage_used - old_size + new_size
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- On DELETE, subtract the old size
        UPDATE users_profile
        SET storage_used = storage_used - old_size
        WHERE id = OLD.user_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Trigger to update project statistics on task change
CREATE OR REPLACE FUNCTION update_project_stats_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update project statistics if task belongs to a project
    IF NEW.project_id IS NOT NULL THEN
        PERFORM update_project_stats(NEW.project_id);
    END IF;

    -- If task was modified (not just created), project might have changed
    IF TG_OP = 'UPDATE' AND NEW.project_id IS DISTINCT FROM OLD.project_id THEN
        -- Update old project if task was moved
        IF OLD.project_id IS NOT NULL THEN
            PERFORM update_project_stats(OLD.project_id);
        END IF;
    END IF;

    -- Update old project's statistics if task was moved
    IF TG_OP = 'UPDATE' AND OLD.project_id IS NOT NULL AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
        PERFORM update_project_stats(OLD.project_id);
    END IF;

    IF TG_OP = 'DELETE' THEN
        -- Update project statistics on task deletion
        IF OLD.project_id IS NOT NULL THEN
            PERFORM update_project_stats(OLD.project_id);
        END IF;
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS user_storage_trigger ON tasks;
CREATE TRIGGER user_storage_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_user_storage_trigger();

DROP TRIGGER IF EXISTS project_stats_trigger ON tasks;
CREATE TRIGGER project_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stats_trigger();

-- Trigger to update updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating updated_at
DROP TRIGGER IF EXISTS update_users_profile_updated_at ON users_profile;
CREATE TRIGGER update_users_profile_updated_at
    BEFORE UPDATE ON users_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user registration (updated)
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO users_profile (id, full_name, avatar_url, storage_used)
    VALUES (
        NEW.id,
        -- Use COALESCE for safe data extraction.
        -- Try 'full_name', then 'name', then email, and finally an empty string as a fallback.
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.email,
            ''
        ),
        -- Also use COALESCE for avatar_url, returning NULL if nothing is there.
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        0
    );
    RETURN NEW;
END;
$$;

-- Trigger to automatically create profile on user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_for_new_user();

-- Additional policy for Storage (allow users to upload to their folders)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, false, 5242880,
        '{"image/png", "image/jpg", "image/jpeg", "image/gif", "image/webp"}')
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage
DROP POLICY IF EXISTS "Allow users to read own avatars" ON storage.objects;
CREATE POLICY "Allow users to read own avatars" ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow users to insert own avatars" ON storage.objects;
CREATE POLICY "Allow users to insert own avatars" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow users to update own avatars" ON storage.objects;
CREATE POLICY "Allow users to update own avatars" ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow users to delete own avatars" ON storage.objects;
CREATE POLICY "Allow users to delete own avatars" ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
