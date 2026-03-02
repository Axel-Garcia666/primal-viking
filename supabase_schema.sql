-- ==========================================================
-- TaskFlow - Schema de Base de Datos para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ==========================================================

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'personal' CHECK (category IN ('trabajo', 'personal', 'estudio', 'otro')),
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  subtasks JSONB DEFAULT '[]'::jsonb,
  position INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS): cada usuario solo ve SUS propias tareas
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política: el usuario autenticado solo puede acceder a sus propias tareas
CREATE POLICY "Acceso solo a tareas propias"
  ON tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habilitar Realtime en la tabla tasks para sincronización en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Índice para mejorar performance en consultas por user_id
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at DESC);

-- ==========================================================
-- PROFILES (AVATARS)
-- ==========================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  avatar_url TEXT
);

-- Row Level Security para Perfiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
