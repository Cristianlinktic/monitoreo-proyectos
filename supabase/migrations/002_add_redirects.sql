-- ============================================================
-- Redirects de formularios por proyecto
-- Cada proyecto guarda una lista de { nombre, url }
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS redirects JSONB NOT NULL DEFAULT '[]'::jsonb;
