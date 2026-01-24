# 🚀 Guia de Deploy - MajorHub Dashboard na Vercel

Este guia cobre o deploy completo do MajorHub Dashboard na Vercel, incluindo configuração de variáveis de ambiente e verificação da Supabase Edge Function.

---

## 📋 Pré-requisitos

- [ ] Conta na [Vercel](https://vercel.com)
- [ ] Projeto Supabase ativo com Edge Function `gemini-proxy` deployada
- [ ] Repositório Git (GitHub, GitLab ou Bitbucket)
- [ ] Node.js v18+ instalado localmente (para testes)

---

## 🔧 Parte 1: Preparação Local

### 1.1 Testar Build Local

Antes de fazer o deploy, certifique-se de que o build funciona localmente:

```bash
# Build de produção
npm run build

# Preview do build (opcional)
npm run preview
# Acesse: http://localhost:4173
```

Se houver erros no build, corrija-os antes de prosseguir.

### 1.2 Commit das Mudanças

Certifique-se de que todas as otimizações estão commitadas:

```bash
git add .
git commit -m "chore: preparar projeto para deploy na Vercel"
git push origin main
```

---

## 🌐 Parte 2: Deploy na Vercel

### 2.1 Criar Novo Projeto na Vercel

1. **Acesse**: https://vercel.com/new
2. **Importe seu repositório**:
   - Clique em "Import Git Repository"
   - Selecione o repositório `majorhub-dashboard`
   - Clique em "Import"

### 2.2 Configurar o Deploy

Na tela de configuração:

| Campo | Valor |
|-------|-------|
| **Project Name** | `majorhub-dashboard` (ou nome de sua preferência) |
| **Framework Preset** | Vite |
| **Root Directory** | `./` |
| **Build Command** | `npm run build` (auto-detectado) |
| **Output Directory** | `dist` (auto-detectado) |

> ℹ️ A Vercel deve detectar automaticamente que é um projeto Vite pelo `package.json`

### 2.3 Configurar Variáveis de Ambiente

**IMPORTANTE**: Antes de fazer o deploy, configure as variáveis de ambiente:

1. Clique em **"Environment Variables"**
2. Adicione as seguintes variáveis:

| Nome da Variável | Valor | Onde Obter |
|-----------------|-------|------------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` | [Supabase Dashboard](https://supabase.com/dashboard) → Seu Projeto → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (sua anon key) | [Supabase Dashboard](https://supabase.com/dashboard) → Seu Projeto → Settings → API |

**Configuração Recomendada**:
- Marque **Production**, **Preview** e **Development** para cada variável

> [!WARNING]
> **Não configure `GEMINI_API_KEY` na Vercel!** Esta chave deve estar **apenas** nos secrets da Supabase Edge Function.

### 2.4 Fazer o Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (geralmente 1-2 minutos)
3. Quando concluir, você verá uma tela de sucesso com a URL do seu site

---

## 🔐 Parte 3: Verificar Supabase Edge Function

A aplicação depende da Edge Function `gemini-proxy` para funcionalidades de IA. Vamos verificar se está deployada:

### 3.1 Verificar Edge Function no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Edge Functions** (menu lateral)
4. Verifique se a função **`gemini-proxy`** aparece na lista

**Se a função NÃO estiver deployada**, siga as instruções em [3.2](#32-deployar-edge-function-opcional).

### 3.2 Deployar Edge Function (Opcional)

Se a função não estiver deployada, execute:

```bash
# 1. Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# 2. Login no Supabase
supabase login

# 3. Link com seu projeto
supabase link --project-ref SEU_PROJECT_REF

# 4. Deploy da função gemini-proxy
supabase functions deploy gemini-proxy

# 5. Configurar secret da API Key do Gemini
supabase secrets set GEMINI_API_KEY=sua-chave-gemini-aqui
```

> ℹ️ **PROJECT_REF**: Encontre em Supabase Dashboard → Settings → General → Reference ID

### 3.3 Verificar Configuração da Edge Function

Certifique-se de que a `GEMINI_API_KEY` está configurada nos secrets:

```bash
# Listar secrets configurados
supabase secrets list
```

Você deve ver `GEMINI_API_KEY` na lista.

---

## ✅ Parte 4: Verificação Pós-Deploy

### 4.1 Acessar o Site

1. Clique no link do deploy na Vercel (formato: `https://majorhub-dashboard.vercel.app`)
2. Teste as funcionalidades principais:

- [ ] **Login**: Faça login com suas credenciais do Supabase
- [ ] **Dashboard**: Verifique se o dashboard carrega corretamente
- [ ] **Dados**: Confirme que clientes, projetos e atividades são carregados
- [ ] **Chat IA**: Teste a funcionalidade de chat (se aplicável)

### 4.2 Verificar Logs (Se houver problemas)

**Na Vercel**:
1. Vá em **Deployments** → Selecione o deploy mais recente
2. Clique em **Runtime Logs** para ver logs em tempo real

**No Supabase** (para Edge Function):
1. Vá em **Edge Functions** → `gemini-proxy`
2. Clique em **Logs** para ver requisições e erros

### 4.3 Checklist de Verificação

- [ ] Build completou sem erros
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Login funciona
- [ ] Dados são carregados do Supabase
- [ ] Edge Function `gemini-proxy` está deployada e funcional
- [ ] Não há erros no console do navegador (F12)

---

## 🔄 Parte 5: Deploys Futuros

Após o deploy inicial, qualquer push para a branch `main` irá automaticamente:

1. ✅ Triggerar um novo build na Vercel
2. ✅ Rodar testes (se configurados)
3. ✅ Fazer deploy automático se o build passar

### Preview Deployments

Pushes para outras branches criarão **preview deployments**:
- URL única para testar mudanças
- Não afeta produção
- Ideal para revisar PRs

---

## 🐛 Troubleshooting

### Erro: "Build failed"

**Causa**: Erro de build ou dependências faltando

**Solução**:
1. Verifique os logs do build na Vercel
2. Teste `npm run build` localmente
3. Certifique-se de que todas as dependências estão no `package.json`

### Erro: "Failed to fetch" ou problemas de CORS

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
1. Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas
2. Vá em **Settings** → **Environment Variables** na Vercel
3. Adicione as variáveis faltantes
4. **Redeploy**: Deployments → ⋯ → Redeploy

### Erro: 404 ao navegar diretamente para uma rota

**Causa**: Rewrites de SPA não configurados

**Solução**: Já configurado no `vercel.json`, mas se persistir:
1. Verifique se `vercel.json` está no repositório
2. Confirme que contém a configuração de `rewrites`

### Chat IA não funciona

**Causa**: Edge Function `gemini-proxy` não deployada ou GEMINI_API_KEY não configurada

**Solução**:
1. Siga os passos em [3.2 Deployar Edge Function](#32-deployar-edge-function-opcional)
2. Verifique logs da Edge Function no Supabase
3. Confirme que `GEMINI_API_KEY` está nos secrets do Supabase

---

## 📚 Recursos Úteis

- [Documentação Vercel - Vite](https://vercel.com/docs/frameworks/vite)
- [Documentação Supabase - Edge Functions](https://supabase.com/docs/guides/functions)
- [Troubleshooting Vercel](https://vercel.com/docs/platform/deployments#troubleshooting)

---

## 🎉 Próximos Passos

Após o deploy bem-sucedido:

1. **Domínio Customizado** (Opcional):
   - Vá em **Settings** → **Domains** na Vercel
   - Adicione seu domínio customizado
   
2. **Analytics** (Opcional):
   - Ative Vercel Analytics para monitorar performance
   
3. **Monitoring**:
   - Configure alertas para erros em produção
   - Use Supabase Dashboard para monitorar uso de recursos

---

**Pronto!** 🚀 Seu MajorHub Dashboard está no ar na Vercel!
