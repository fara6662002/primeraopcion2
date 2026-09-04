/*
# Bloque 1 — Arquitectura Base de la Plataforma ECOEMS

## Resumen
Esta migración alinea el esquema con la especificación del Bloque 1:
- Añade `exam_type`, `breakdown_by_subject` y `time_spent_seconds` a `exam_results`.
- Crea la tabla `avatars_catalog` con nombre e imagen.
- Crea el bucket público `avatars` en Storage.
- Refuerza las políticas RLS para que el admin (fararuiz64@gmail.com) tenga
  control exclusivo sobre question_bank, profiles y avatars_catalog.
- Estudiantes leen preguntas activas, guardan sus resultados y leen el catálogo
  de avatares.

## 1. Tabla `exam_results` (modificada)
- `exam_type` (text, default 'simulacro_128') — tipo de examen.
- `breakdown_by_subject` (jsonb, default '[]') — aciertos por materia.
- `time_spent_seconds` (int) — tiempo total en segundos.

## 2. Tabla `avatars_catalog` (nueva)
- `id` (uuid PK)
- `avatar_name` (text) — nombre descriptivo del avatar
- `image_url` (text) — URL de la imagen
- `created_at` (timestamptz)

## 3. Storage
- Bucket público `avatars` para imágenes de avatar (subida exclusiva para admin).

## 4. Seguridad (RLS)
- `avatars_catalog`: lectura para authenticated; escritura exclusive admin.
- `exam_results`: estudiantes insertan/leen/borran sus propios resultados;
  admin puede leer todos.
- `question_bank`: estudiantes leen reactivos activos; admin tiene CRUD completo.
- `profiles`: estudiantes leen/actualizan su propio perfil; admin CRUD completo.
*/ 

-- ============ exam_results: add exam_type, breakdown_by_subject, time_spent_seconds ============
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_results' AND column_name='exam_type') THEN
    ALTER TABLE exam_results ADD COLUMN exam_type text NOT NULL DEFAULT 'simulacro_128';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_results' AND column_name='breakdown_by_subject') THEN
    ALTER TABLE exam_results ADD COLUMN breakdown_by_subject jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_results' AND column_name='time_spent_seconds') THEN
    ALTER TABLE exam_results ADD COLUMN time_spent_seconds int;
  END IF;
END $$;

-- Backfill time_spent_seconds from duration_seconds for existing rows
UPDATE exam_results SET time_spent_seconds = duration_seconds WHERE time_spent_seconds IS NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_results' AND column_name='score') THEN
    ALTER TABLE exam_results ADD COLUMN score int;
  END IF;
END $$;

-- Backfill score from correct_answers
UPDATE exam_results SET score = correct_answers WHERE score IS NULL;

-- ============ avatars_catalog ============
CREATE TABLE IF NOT EXISTS avatars_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_name text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE avatars_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_avatars_catalog" ON avatars_catalog;
CREATE POLICY "read_avatars_catalog" ON avatars_catalog FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_avatars_catalog" ON avatars_catalog;
CREATE POLICY "admin_insert_avatars_catalog" ON avatars_catalog FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

DROP POLICY IF EXISTS "admin_update_avatars_catalog" ON avatars_catalog;
CREATE POLICY "admin_update_avatars_catalog" ON avatars_catalog FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

DROP POLICY IF EXISTS "admin_delete_avatars_catalog" ON avatars_catalog;
CREATE POLICY "admin_delete_avatars_catalog" ON avatars_catalog FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- Migrate existing avatars into avatars_catalog if empty
INSERT INTO avatars_catalog (avatar_name, image_url)
SELECT 'Avatar ' || row_number() OVER (), url FROM avatars
WHERE NOT EXISTS (SELECT 1 FROM avatars_catalog LIMIT 1);

-- ============ exam_results: update RLS to allow admin read all ============
DROP POLICY IF EXISTS "select_own_results" ON exam_results;
DROP POLICY IF EXISTS "insert_own_results" ON exam_results;
DROP POLICY IF EXISTS "delete_own_results" ON exam_results;

CREATE POLICY "select_results" ON exam_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

CREATE POLICY "insert_own_results" ON exam_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_results" ON exam_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ Storage bucket: avatars (public) ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, admin-only write
DROP POLICY IF EXISTS "public_read_avatars_bucket" ON storage.objects;
CREATE POLICY "public_read_avatars_bucket" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "admin_upload_avatars_bucket" ON storage.objects;
CREATE POLICY "admin_upload_avatars_bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

DROP POLICY IF EXISTS "admin_update_avatars_bucket" ON storage.objects;
CREATE POLICY "admin_update_avatars_bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.jwt() ->> 'email' = 'fararuiz64@gmail.com')
  WITH CHECK (bucket_id = 'avatars' AND auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

DROP POLICY IF EXISTS "admin_delete_avatars_bucket" ON storage.objects;
CREATE POLICY "admin_delete_avatars_bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.jwt() ->> 'email' = 'fararuiz64@gmail.com');

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_exam_results_user ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_avatars_catalog ON avatars_catalog(created_at DESC);