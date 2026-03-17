-- ============================================================
-- Roadmap App — Supabase Setup
-- Выполни этот скрипт в SQL Editor: Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. Таблица профилей пользователей
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  phone TEXT,
  role TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. Триггер: создаём профиль при регистрации
-- БАГ 7 FIX: создаём запись с email/name, phone и role остаются NULL
-- (пользователь заполнит их в форме ProfileForm)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING; -- не перезаписываем если уже есть
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Таблица roadmaps
-- БАГ 10 FIX: добавлена колонка settings JSONB
-- ============================================================
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  epics JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  next_epic_id INTEGER DEFAULT 5,
  next_task_id INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roadmap"
  ON roadmaps FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmap"
  ON roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap"
  ON roadmaps FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmap"
  ON roadmaps FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 4. Индексы
-- ============================================================
CREATE INDEX IF NOT EXISTS roadmaps_user_id_idx ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- ============================================================
-- 5. Если таблица roadmaps уже существует без колонки settings —
--    добавь её вручную:
--    ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
-- ============================================================
