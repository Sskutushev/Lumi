-- Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS users_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    storage_used BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Комментарии к таблице users_profile
COMMENT ON TABLE users_profile IS 'Профили пользователей';
COMMENT ON COLUMN users_profile.id IS 'Ссылка на id в auth.users';
COMMENT ON COLUMN users_profile.full_name IS 'Полное имя пользователя';
COMMENT ON COLUMN users_profile.avatar_url IS 'URL аватара пользователя';
COMMENT ON COLUMN users_profile.storage_used IS 'Количество используемого хранилища в байтах';
COMMENT ON COLUMN users_profile.created_at IS 'Дата создания профиля';
COMMENT ON COLUMN users_profile.updated_at IS 'Дата последнего обновления профиля';

-- Таблица проектов
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

-- Комментарии к таблице projects
COMMENT ON TABLE projects IS 'Проекты пользователей';
COMMENT ON COLUMN projects.id IS 'Уникальный идентификатор проекта';
COMMENT ON COLUMN projects.user_id IS 'Ссылка на пользователя, владеющего проектом';
COMMENT ON COLUMN projects.name IS 'Название проекта (максимум 100 символов)';
COMMENT ON COLUMN projects.description IS 'Описание проекта (максимум 500 символов)';
COMMENT ON COLUMN projects.tasks_count IS 'Количество задач в проекте';
COMMENT ON COLUMN projects.completed_tasks_count IS 'Количество завершенных задач в проекте';
COMMENT ON COLUMN projects.created_at IS 'Дата создания проекта';
COMMENT ON COLUMN projects.updated_at IS 'Дата последнего обновления проекта';

-- Таблица задач
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

-- Комментарии к таблице tasks
COMMENT ON TABLE tasks IS 'Задачи пользователей';
COMMENT ON COLUMN tasks.id IS 'Уникальный идентификатор задачи';
COMMENT ON COLUMN tasks.user_id IS 'Ссылка на пользователя, владеющего задачей';
COMMENT ON COLUMN tasks.project_id IS 'Ссылка на проект, к которому принадлежит задача';
COMMENT ON COLUMN tasks.title IS 'Заголовок задачи (максимум 200 символов)';
COMMENT ON COLUMN tasks.description IS 'Краткое описание задачи (максимум 1000 символов)';
COMMENT ON COLUMN tasks.detailed_description IS 'Подробное описание задачи (максимум 5000 символов)';
COMMENT ON COLUMN tasks.completed IS 'Статус завершения задачи';
COMMENT ON COLUMN tasks.priority IS 'Приоритет задачи (low, medium, high)';
COMMENT ON COLUMN tasks.start_date IS 'Дата начала задачи';
COMMENT ON COLUMN tasks.due_date IS 'Дата завершения задачи';
COMMENT ON COLUMN tasks.created_at IS 'Дата создания задачи';
COMMENT ON COLUMN tasks.updated_at IS 'Дата последнего обновления задачи';

-- Включение RLS для всех таблиц
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для таблицы users_profile
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

-- Политики безопасности для таблицы projects
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

-- Политики безопасности для таблицы tasks
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

-- Функция для подсчета используемого хранилища
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

-- Функция для обновления статистики проекта
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

-- Триггер для обновления storage_used при изменении задач
CREATE OR REPLACE FUNCTION update_user_storage_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    old_size BIGINT;
    new_size BIGINT;
BEGIN
    -- Подсчет старого размера для UPDATE/DELETE
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        old_size := COALESCE(LENGTH(OLD.title), 0) +
                    COALESCE(LENGTH(OLD.description), 0) +
                    COALESCE(LENGTH(OLD.detailed_description), 0);
    ELSE
        old_size := 0;
    END IF;

    -- Подсчет нового размера для INSERT/UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        new_size := COALESCE(LENGTH(NEW.title), 0) +
                    COALESCE(LENGTH(NEW.description), 0) +
                    COALESCE(LENGTH(NEW.detailed_description), 0);
    ELSE
        new_size := 0;
    END IF;

    -- Обновление storage_used в профиле пользователя
    IF TG_OP = 'INSERT' THEN
        -- При INSERT добавляем новый размер
        UPDATE users_profile
        SET storage_used = storage_used + new_size
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- При UPDATE обновляем разницу
        UPDATE users_profile
        SET storage_used = storage_used - old_size + new_size
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- При DELETE вычитаем старый размер
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

-- Триггер для обновления статистики проекта при изменении задач
CREATE OR REPLACE FUNCTION update_project_stats_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Обновляем статистику проекта, если задача принадлежит проекту
    IF NEW.project_id IS NOT NULL THEN
        PERFORM update_project_stats(NEW.project_id);
    END IF;

    -- Если задача изменялась (а не только создавалась), возможно изменился проект
    IF TG_OP = 'UPDATE' AND NEW.project_id IS DISTINCT FROM OLD.project_id THEN
        -- Обновляем старый проект, если задача была перемещена
        IF OLD.project_id IS NOT NULL THEN
            PERFORM update_project_stats(OLD.project_id);
        END IF;
    END IF;

    -- Обновляем статистику старого проекта, если задача была перемещена
    IF TG_OP = 'UPDATE' AND OLD.project_id IS NOT NULL AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
        PERFORM update_project_stats(OLD.project_id);
    END IF;

    IF TG_OP = 'DELETE' THEN
        -- Обновляем статистику проекта при удалении задачи
        IF OLD.project_id IS NOT NULL THEN
            PERFORM update_project_stats(OLD.project_id);
        END IF;
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Создание триггеров
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

-- Триггер для обновления поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
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

-- Функция для создания профиля при регистрации пользователя (обновленная)
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO users_profile (id, full_name, avatar_url, storage_used)
    VALUES (
        NEW.id,
        -- Используем COALESCE для безопасного извлечения данных.
        -- Пробуем 'full_name', затем 'name', затем email, и в крайнем случае пустую строку.
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.email,
            ''
        ),
        -- Для avatar_url также используем COALESCE, возвращая NULL если ничего нет.
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        0
    );
    RETURN NEW;
END;
$$;

-- Триггер для автоматического создания профиля при регистрации пользователя
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_profile_for_new_user();

-- Дополнительная политика для Storage (разрешаем пользователям загружать в их папки)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, false, 5242880,
        '{"image/png", "image/jpg", "image/jpeg", "image/gif", "image/webp"}')
ON CONFLICT (id) DO NOTHING;

-- Политики для Storage
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
