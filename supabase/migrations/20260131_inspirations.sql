-- ============================================
-- INSPIRAÇÕES - Curadoria criativa de referências
-- ============================================

-- Tabela principal de inspirações
CREATE TABLE IF NOT EXISTS inspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instagram_url TEXT NOT NULL,
  embed_html TEXT,
  thumbnail_url TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags (híbrido: sistema + custom)
CREATE TABLE IF NOT EXISTS inspiration_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  is_system BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'))
);

-- Junção inspiração ↔ tags
CREATE TABLE IF NOT EXISTS inspiration_tag_links (
  inspiration_id UUID REFERENCES inspirations(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES inspiration_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (inspiration_id, tag_id)
);

-- Junção inspiração ↔ projetos
CREATE TABLE IF NOT EXISTS inspiration_projects (
  inspiration_id UUID REFERENCES inspirations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (inspiration_id, project_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_inspirations_user_id ON inspirations(user_id);
CREATE INDEX IF NOT EXISTS idx_inspirations_created_at ON inspirations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspiration_tags_user_id ON inspiration_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_inspiration_tags_is_system ON inspiration_tags(is_system);

-- Tags padrão do sistema
INSERT INTO inspiration_tags (name, color, is_system) VALUES
  ('Copy', '#f59e0b', TRUE),
  ('Hook', '#ef4444', TRUE),
  ('Criativo', '#8b5cf6', TRUE),
  ('Storytelling', '#06b6d4', TRUE),
  ('Oferta', '#22c55e', TRUE),
  ('Transição', '#ec4899', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_tag_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_projects ENABLE ROW LEVEL SECURITY;

-- Inspirations: Usuários veem e gerenciam suas próprias inspirações
CREATE POLICY "Users can view own inspirations" ON inspirations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inspirations" ON inspirations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inspirations" ON inspirations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inspirations" ON inspirations
  FOR DELETE USING (auth.uid() = user_id);

-- Tags: sistema visíveis para todos, custom apenas para o dono
CREATE POLICY "Users see system and own tags" ON inspiration_tags
  FOR SELECT USING (is_system = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON inspiration_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can update own tags" ON inspiration_tags
  FOR UPDATE USING (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can delete own tags" ON inspiration_tags
  FOR DELETE USING (auth.uid() = user_id AND is_system = FALSE);

-- Tag Links: baseado na ownership da inspiração
CREATE POLICY "Users can manage own inspiration tags" ON inspiration_tag_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM inspirations 
      WHERE inspirations.id = inspiration_tag_links.inspiration_id 
      AND inspirations.user_id = auth.uid()
    )
  );

-- Project Links: baseado na ownership da inspiração
CREATE POLICY "Users can manage own inspiration projects" ON inspiration_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM inspirations 
      WHERE inspirations.id = inspiration_projects.inspiration_id 
      AND inspirations.user_id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_inspiration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inspiration_updated_at
  BEFORE UPDATE ON inspirations
  FOR EACH ROW
  EXECUTE FUNCTION update_inspiration_updated_at();
