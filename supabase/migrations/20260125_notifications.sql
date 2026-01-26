-- ============================================
-- SISTEMA DE NOTIFICAÇÕES IN-APP
-- Migration: 20260125_notifications
-- ============================================

-- TABELA: notifications
-- Armazena notificações in-app com auto-expiração de 3 dias
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('deadline', 'mention', 'project_created', 'status_changed', 'goal_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  link_type TEXT CHECK (link_type IN ('project', 'goal', 'comment')),
  link_id UUID,
  
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON public.notifications(user_id, read_at) 
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_created 
  ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON public.notifications(user_id, created_at DESC);

-- ============================================
-- TABELA: notification_preferences
-- Preferências individuais de notificação
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  in_app_enabled BOOLEAN DEFAULT true,
  notify_deadlines BOOLEAN DEFAULT true,
  notify_mentions BOOLEAN DEFAULT true,
  notify_project_updates BOOLEAN DEFAULT true,
  notify_goal_completed BOOLEAN DEFAULT true,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas suas notificações
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem atualizar apenas suas notificações
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuários veem apenas suas preferências
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.notification_preferences;
CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas preferências
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.notification_preferences;
CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNÇÃO: create_notification
-- Helper centralizado para criar notificações
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_client_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link_type TEXT DEFAULT NULL,
  p_link_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS void AS $$
DECLARE
  v_prefs RECORD;
BEGIN
  -- Verificar se usuário desabilitou notificações in-app
  SELECT * INTO v_prefs 
  FROM public.notification_preferences 
  WHERE user_id = p_user_id;
  
  -- Se não tem preferências, criar padrão (tudo habilitado)
  IF v_prefs IS NULL THEN
    INSERT INTO public.notification_preferences (user_id) 
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Recarregar preferências
    SELECT * INTO v_prefs 
    FROM public.notification_preferences 
    WHERE user_id = p_user_id;
  END IF;
  
  -- Checar se tipo de notificação está habilitado
  IF COALESCE(v_prefs.in_app_enabled, true) = false THEN
    RETURN; -- In-app desabilitado globalmente
  END IF;
  
  IF (
    (p_type = 'deadline' AND COALESCE(v_prefs.notify_deadlines, true)) OR
    (p_type = 'mention' AND COALESCE(v_prefs.notify_mentions, true)) OR
    (p_type IN ('project_created', 'status_changed') AND COALESCE(v_prefs.notify_project_updates, true)) OR
    (p_type = 'goal_completed' AND COALESCE(v_prefs.notify_goal_completed, true))
  ) THEN
    INSERT INTO public.notifications (
      user_id, client_id, type, title, message, link_type, link_id, metadata
    )
    VALUES (
      p_user_id, p_client_id, p_type, p_title, p_message, p_link_type, p_link_id, p_metadata
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER 1: Notificar sobre prazos próximos
-- Executa diariamente via cron job
CREATE OR REPLACE FUNCTION public.notify_deadline_approaching() RETURNS void AS $$
DECLARE
  goal RECORD;
  manager RECORD;
BEGIN
  -- Buscar metas que vencem amanhã
  FOR goal IN 
    SELECT 
      g.id as goal_id,
      g.text as goal_text,
      g.project_id,
      p.title as project_title, 
      p.client_id
    FROM public.creative_goals g
    JOIN public.projects p ON g.project_id = p.id
    WHERE g.due_date::date = CURRENT_DATE + INTERVAL '1 day'
      AND g.completed = false
      -- Evitar duplicatas (só cria 1 vez por dia)
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.link_id = g.id 
          AND n.type = 'deadline' 
          AND n.created_at::date = CURRENT_DATE
      )
  LOOP
    -- Notificar MANAGER do cliente
    FOR manager IN 
      SELECT id 
      FROM public.users 
      WHERE client_id = goal.client_id 
        AND access_level = 'MANAGER'
    LOOP
      PERFORM public.create_notification(
        manager.id,
        goal.client_id,
        'deadline',
        '⏰ Meta vencendo amanhã',
        goal.goal_text || ' do projeto ' || goal.project_title,
        'goal',
        goal.goal_id,
        jsonb_build_object(
          'project_title', goal.project_title, 
          'project_id', goal.project_id
        )
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER 2: Novo comentário em projeto
CREATE OR REPLACE FUNCTION public.notify_new_comment() RETURNS TRIGGER AS $$
DECLARE
  project RECORD;
  manager RECORD;
  client_user RECORD;
BEGIN
  -- Buscar dados do projeto
  SELECT * INTO project 
  FROM public.projects 
  WHERE id = NEW.project_id;
  
  IF project IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Notificar MANAGER do cliente
  FOR manager IN 
    SELECT id 
    FROM public.users 
    WHERE client_id = project.client_id 
      AND access_level = 'MANAGER'
  LOOP
    PERFORM public.create_notification(
      manager.id,
      project.client_id,
      'mention',
      '💬 Novo comentário',
      NEW.user_name || ' comentou em ' || project.title,
      'project',
      project.id,
      jsonb_build_object('comment_preview', LEFT(NEW.content, 100))
    );
  END LOOP;
  
  -- Notificar CLIENT (dono da conta)
  FOR client_user IN 
    SELECT id 
    FROM public.users 
    WHERE client_id = project.client_id 
      AND access_level = 'CLIENT'
  LOOP
    PERFORM public.create_notification(
      client_user.id,
      project.client_id,
      'mention',
      '💬 Novo comentário no seu projeto',
      NEW.user_name || ' comentou em ' || project.title,
      'project',
      project.id,
      jsonb_build_object('comment_preview', LEFT(NEW.content, 100))
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_comment ON public.project_activities;
CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.project_activities
  FOR EACH ROW
  WHEN (NEW.type = 'comment')
  EXECUTE FUNCTION public.notify_new_comment();

-- ============================================
-- TRIGGER 3: Projeto criado
CREATE OR REPLACE FUNCTION public.notify_project_created() RETURNS TRIGGER AS $$
DECLARE
  client_user RECORD;
BEGIN
  -- Notificar CLIENT (dono da conta)
  FOR client_user IN 
    SELECT id 
    FROM public.users 
    WHERE client_id = NEW.client_id 
      AND access_level = 'CLIENT'
  LOOP
    PERFORM public.create_notification(
      client_user.id,
      NEW.client_id,
      'project_created',
      '🎉 Novo projeto criado',
      NEW.title,
      'project',
      NEW.id,
      jsonb_build_object('status', NEW.status)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_project_created();

-- ============================================
-- TRIGGER 4: Status de projeto alterado
CREATE OR REPLACE FUNCTION public.notify_project_status_changed() RETURNS TRIGGER AS $$
DECLARE
  manager RECORD;
  client_user RECORD;
  status_label TEXT;
BEGIN
  -- Só notifica se status realmente mudou
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Mapeamento amigável de status
  status_label := CASE NEW.status
    WHEN 'In Progress' THEN 'Em Andamento'
    WHEN 'Revision' THEN 'Em Revisão'
    WHEN 'Completed' THEN 'Concluído'
    ELSE NEW.status
  END;
  
  -- Notificar MANAGER
  FOR manager IN 
    SELECT id 
    FROM public.users 
    WHERE client_id = NEW.client_id 
      AND access_level = 'MANAGER'
  LOOP
    PERFORM public.create_notification(
      manager.id,
      NEW.client_id,
      'status_changed',
      '🔄 Status atualizado',
      NEW.title || ' agora está ' || status_label,
      'project',
      NEW.id,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END LOOP;
  
  -- Notificar CLIENT
  FOR client_user IN 
    SELECT id 
    FROM public.users 
    WHERE client_id = NEW.client_id 
      AND access_level = 'CLIENT'
  LOOP
    PERFORM public.create_notification(
      client_user.id,
      NEW.client_id,
      'status_changed',
      '🔄 Projeto atualizado',
      NEW.title || ' agora está ' || status_label,
      'project',
      NEW.id,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_status_changed ON public.projects;
CREATE TRIGGER on_project_status_changed
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_project_status_changed();

-- ============================================
-- TRIGGER 5: Meta concluída
CREATE OR REPLACE FUNCTION public.notify_goal_completed() RETURNS TRIGGER AS $$
DECLARE
  project RECORD;
  manager RECORD;
  client_user RECORD;
BEGIN
  -- Só notifica se foi marcada como concluída agora
  IF OLD.completed = true OR NEW.completed = false THEN
    RETURN NEW;
  END IF;
  
  -- Buscar projeto
  SELECT * INTO project 
  FROM public.projects 
  WHERE id = NEW.project_id;
  
  IF project IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Notificar MANAGER
  FOR manager IN 
    SELECT id 
    FROM public.users 
    WHERE client_id = project.client_id 
      AND access_level = 'MANAGER'
  LOOP
    PERFORM public.create_notification(
      manager.id,
      project.client_id,
      'goal_completed',
      '✅ Meta concluída',
      NEW.text || ' foi concluída em ' || project.title,
      'goal',
      NEW.id,
      jsonb_build_object('project_title', project.title, 'project_id', project.id)
    );
  END LOOP;
  
  -- Notificar CLIENT
  FOR client_user IN 
    SELECT id 
    FROM public.users 
    WHERE client_id = project.client_id 
      AND access_level = 'CLIENT'
  LOOP
    PERFORM public.create_notification(
      client_user.id,
      project.client_id,
      'goal_completed',
      '✅ Meta concluída no seu projeto',
      NEW.text || ' foi concluída',
      'goal',
      NEW.id,
      jsonb_build_object('project_title', project.title, 'project_id', project.id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_goal_completed ON public.creative_goals;
CREATE TRIGGER on_goal_completed
  AFTER UPDATE ON public.creative_goals
  FOR EACH ROW
  WHEN (OLD.completed IS DISTINCT FROM NEW.completed AND NEW.completed = true)
  EXECUTE FUNCTION public.notify_goal_completed();

-- ============================================
-- FUNÇÃO: cleanup_old_notifications
-- Remove notificações com mais de 3 dias (executa via cron)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications() RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '3 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % old notifications', v_deleted_count;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- Garantir que funções são acessíveis via RPC
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_deadline_approaching TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_notifications TO authenticated;

-- ============================================
-- COMENTÁRIOS (Documentação)
COMMENT ON TABLE public.notifications IS 'Notificações in-app com auto-expiração de 3 dias';
COMMENT ON TABLE public.notification_preferences IS 'Preferências individuais de notificação';
COMMENT ON FUNCTION public.create_notification IS 'Helper para criar notificações respeitando preferências do usuário';
COMMENT ON FUNCTION public.notify_deadline_approaching IS 'Notifica sobre metas que vencem em 1 dia (executar via cron diário)';
COMMENT ON FUNCTION public.cleanup_old_notifications IS 'Remove notificações antigas (executar via cron diário às 3h)';
