# Deployment do Sistema de Notificações

## 📋 Passo a Passo

### 1. Executar Migration SQL no Supabase

1. Acesse o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto (Major Hub)
3. Vá em **Database** → **SQL Editor**
4. Clique em **New Query**
5. Cole todo o conteúdo do arquivo `supabase/migrations/20260125_notifications.sql`
6. Execute clicando em **Run** (ou `Ctrl+Enter`)

**Verificação**:
```sql
-- Verificar se tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('notifications', 'notification_preferences');

-- Verificar triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table IN ('projects', 'project_activities', 'creative_goals');
```

---

### 2. Configurar Cron Job para Cleanup

1. No Supabase Dashboard, vá em **Database** → **Cron Jobs**
2. Clique em **New  Cron Job**
3. Configure:
   - **Name**: `cleanup-notifications`
   - **Schedule**: `0 3 * * *` (todo dia às 3h da manhã)
   - **Command**: `SELECT public.cleanup_old_notifications();`
4. Salve

**Verificação Manual**:
```sql
-- Testar função de cleanup manualmente
SELECT public.cleanup_old_notifications();
```

---

### 3. Verificar Deploys (Frontend já está pronto)

O código frontend já foi integrado no projeto. Você só precisa garantir que está rodando:

```bash
# Se ainda não está rodando
npm run dev
```

A aplicação já deve estar acessível em `http://localhost:5173` (ou a porta configurada).

---

### 4. Teste Manual Rápido

#### Opção A: Teste com Trigger de Comentário (Mais Rápido)

1. Faça login no Major Hub
2. Abra um projeto existente
3. Adicione um comentário na timeline
4. **Verifique**: O sino no header deve mostrar badge vermelho com "1"
5. Clique no sino → Painel deve abrir com a notificação "💬 Novo comentário"

#### Opção B: Teste com Trigger de Prazo

1. Crie uma meta com `due_date` = **amanhã**:
   ```sql
   -- Executar no SQL Editor do Supabase
   INSERT INTO creative_goals (
     project_id, 
     text, 
     type, 
     due_date, 
     completed
   ) VALUES (
     '<ID_DO_PROJETO>', 
     'Meta de teste para notificações', 
     'campaign', 
     CURRENT_DATE + INTERVAL '1 day', 
     false
   );
   
   -- Disparar trigger manualmente
   SELECT public.notify_deadline_approaching();
   ```

2. Atualize a página do Major Hub
3. Verifique o sino com notificação

#### Opção C: Criar Notificação de Teste Diretamente

```sql
-- Criar notificação de teste (substitua <USER_ID> e <CLIENT_ID>)
SELECT public.create_notification(
  '<USER_ID>'::uuid,
  '<CLIENT_ID>'::uuid,
  'project_created',
  '🎉 Teste de Notificação',
  'Este é um teste do sistema de notificações in-app',
  'project',
  NULL,
  '{}'::jsonb
);
```

---

### 5. Configurar Realtime (Se Necessário)

O Supabase Realtime deve estar habilitado por padrão. Para verificar:

1. Vá em **Database** → **Replication**
2. Certifique-se que a tabela `notifications` está na lista
3. Se não estiver, clique em **Add Table** e adicione `public.notifications`

---

## 🔍 Troubleshooting

### Notificações não aparecem

1. **Verifique se a migration foi executada**:
   ```sql
   SELECT * FROM notifications LIMIT 5;
   ```

2. **Verifique RLS**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

3. **Verifique console do navegador** (F12) para erros de WebSocket

### Badge não atualiza em tempo real

1. Verifique que **Realtime está habilitado** para a tabela `notifications`
2. Veja console do navegador para erros: `Realtime connection failed`

### Erros de TypeScript

Os 3 warnings restantes no `useNotifications.ts` são normais antes de executar a migration SQL. Eles desaparecerão automaticamente quando o schema do Supabase for sincronizado após o deploy.

---

## ✅ Checklist Final

- [ ] Migration SQL executada com sucesso
- [ ] Cron job configurado (opcional, mas recomendado)
- [ ] Realtime habilitado para `notifications`
- [ ] Teste manual passou (notificação aparece no sino)
- [ ] Badge contador funcionando
- [ ] Clicar na notificação navega para o projeto correto

---

**Pronto! Sistema de notificações funcionando! 🔔🎉**
