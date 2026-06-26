-- ============================================================
-- MONITOREO DE PROYECTOS - Schema inicial
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------
-- TABLA: projects
-- Información base de cada proyecto/página web
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT        NOT NULL,
  maquetador    TEXT,
  plugins       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  url           TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- TABLA: monitoring_entries
-- Registro diario de monitoreo por proyecto
-- Cada fila = un proyecto en una fecha específica
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_entries (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  fecha                DATE        NOT NULL DEFAULT CURRENT_DATE,

  -- Imágenes (URLs de Supabase Storage)
  ssl_imagen_url       TEXT,
  rendimiento_imagen_url TEXT,

  -- Campos de texto
  rendimiento_score    TEXT,           -- Ej: "9/10", "Bueno", "Crítico"
  estabilidad_diseno   TEXT,           -- Ej: "Todos funcionales"
  pruebas_formularios  TEXT,           -- Ej: "OK", "Falla formulario contacto"
  backup               TEXT,           -- Descripción del backup
  notas                TEXT,           -- Notas generales
  tareas_ejecutar      TEXT,           -- Tareas pendientes

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Una sola entrada por proyecto por día
  CONSTRAINT unique_project_fecha UNIQUE (project_id, fecha)
);

-- -------------------------------------------------------
-- ÍNDICES
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_monitoring_project_id ON monitoring_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_fecha       ON monitoring_entries(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_projects_nombre        ON projects(nombre);

-- -------------------------------------------------------
-- FUNCIÓN: actualizar updated_at automáticamente
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_monitoring_updated_at
  BEFORE UPDATE ON monitoring_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -------------------------------------------------------
-- STORAGE: bucket para imágenes
-- Crea el bucket 'monitoring-images' como público
-- -------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('monitoring-images', 'monitoring-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: permitir lectura pública de imágenes
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'monitoring-images');

-- Policy: permitir subir imágenes (ajustar con auth si se agrega)
CREATE POLICY "Allow uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'monitoring-images');

-- Policy: permitir eliminar imágenes
CREATE POLICY "Allow deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'monitoring-images');

-- -------------------------------------------------------
-- PERMISOS: acceso al rol anon (sin autenticación por ahora)
-- -------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT ALL ON TABLE projects TO anon, authenticated;
GRANT ALL ON TABLE monitoring_entries TO anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- -------------------------------------------------------
-- RLS (Row Level Security) - Desactivado por ahora
-- Activar cuando se agregue autenticación
-- -------------------------------------------------------
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE monitoring_entries ENABLE ROW LEVEL SECURITY;
