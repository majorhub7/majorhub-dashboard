-- Seed data for Project: Campanha de lançamento do Workshop
-- Project ID: 296f3c15-32ec-4370-950f-cfe48134b190
-- User ID: 9b2f15ee-3956-4f17-be8a-f1034fba5f10

-- Insert Creative Goals
INSERT INTO public.creative_goals (id, project_id, text, type, status, due_date, responsible_id, completed, description, created_at)
VALUES 
    (gen_random_uuid(), '296f3c15-32ec-4370-950f-cfe48134b190', 'Vídeo Teaser do Workshop', 'video', 'Em Andamento', CURRENT_DATE + INTERVAL '2 days', '9b2f15ee-3956-4f17-be8a-f1034fba5f10', false, 'Criar um vídeo curto de 30s para anúncios.', NOW()),
    (gen_random_uuid(), '296f3c15-32ec-4370-950f-cfe48134b190', 'Landing Page Design', 'design', 'Pendente', CURRENT_DATE + INTERVAL '5 days', '9b2f15ee-3956-4f17-be8a-f1034fba5f10', false, 'Layout da página de captura de leads.', NOW()),
    (gen_random_uuid(), '296f3c15-32ec-4370-950f-cfe48134b190', 'E-mail Marketing Sequence', 'campaign', 'Concluído', CURRENT_DATE - INTERVAL '1 day', '9b2f15ee-3956-4f17-be8a-f1034fba5f10', true, 'Sequência de 3 emails de aquecimento.', NOW());

-- Insert Documents
INSERT INTO public.documents (id, project_id, name, type, url, size, created_at)
VALUES
    (gen_random_uuid(), '296f3c15-32ec-4370-950f-cfe48134b190', 'Briefing_V1.pdf', 'pdf', 'https://example.com/briefing.pdf', '2.4 MB', NOW()),
    (gen_random_uuid(), '296f3c15-32ec-4370-950f-cfe48134b190', 'Assets_Visuais.zip', 'image', 'https://example.com/assets.zip', '150 MB', NOW());

-- Insert Project Activities
INSERT INTO public.project_activities (id, project_id, user_name, user_avatar, type, content, timestamp)
VALUES
    (gen_random_uuid(), '296f3c15-32ec-4370-950f-cfe48134b190', 'CMO Major Hub', 'https://github.com/shadcn.png', 'comment', 'Precisamos focar na conversão da LP.', NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), '296f3c15-32ec-4370-950f-cfe48134b190', 'System', '', 'system', 'Projeto criado', NOW() - INTERVAL '1 day');
