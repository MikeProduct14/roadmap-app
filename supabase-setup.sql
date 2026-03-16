-- Создание таблицы для хранения roadmap данных
CREATE TABLE roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  epics JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  next_epic_id INTEGER DEFAULT 1,
  next_task_id INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Включаем Row Level Security (RLS)
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут читать только свои данные
CREATE POLICY "Users can read own roadmap"
  ON roadmaps
  FOR SELECT
  USING (auth.uid() = user_id);

-- Политика: пользователи могут создавать свои данные
CREATE POLICY "Users can insert own roadmap"
  ON roadmaps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут обновлять только свои данные
CREATE POLICY "Users can update own roadmap"
  ON roadmaps
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут удалять только свои данные
CREATE POLICY "Users can delete own roadmap"
  ON roadmaps
  FOR DELETE
  USING (auth.uid() = user_id);

-- Индекс для быстрого поиска по user_id
CREATE INDEX roadmaps_user_id_idx ON roadmaps(user_id);
