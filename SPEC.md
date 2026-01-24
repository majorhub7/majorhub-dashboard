# Especificação Técnica (SPEC.md)

> Baseado em: PRD.md  
> Gerado em: 23/01/2026  
> Objetivo: Implementar backend real com Supabase (Auth + Database)

---

## 1. 📋 Visão Geral

### Objetivo Principal
Migrar a aplicação Major Hub de dados mockados para um backend real utilizando Supabase, implementando:
- ✅ Autenticação real com Supabase Auth
- ✅ Persistência de dados com PostgreSQL
- ✅ Row Level Security (RLS) para multi-tenant
- ✅ Serviço de API centralizado

### Impacto na Arquitetura
- **Antes:** useState + dados em `constants.tsx`
- **Depois:** Supabase Client + PostgreSQL + RLS

---

## 2. 🆕 Arquivos a Criar

### 2.1 `services/supabase.ts`

**Status**: 🆕 CRIAR  
**Propósito**: Cliente Supabase centralizado  
**Dependências**: `@supabase/supabase-js`

**Implementação**:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

---

### 2.2 `types/database.ts`

**Status**: 🆕 CRIAR  
**Propósito**: Tipos TypeScript gerados pelo Supabase  
**Dependências**: Gerado via CLI

**Implementação**:
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          access_level: 'MANAGER' | 'CLIENT'
          avatar_url: string | null
          bio: string | null
          client_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      clients: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      projects: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          image_url: string | null
          status: 'In Progress' | 'Revision' | 'Completed'
          due_date: string | null
          progress: number
          priority: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      creative_goals: {
        Row: {
          id: string
          project_id: string
          text: string
          description: string | null
          completed: boolean
          status: 'Pendente' | 'Em Andamento' | 'Em Revisão' | 'Concluído'
          type: 'video' | 'design' | 'campaign'
          due_date: string | null
          responsible_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['creative_goals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['creative_goals']['Insert']>
      }
      documents: {
        Row: {
          id: string
          project_id: string | null
          goal_id: string | null
          name: string
          type: 'pdf' | 'figma' | 'image' | 'video'
          url: string
          size: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          name: string
          type: 'group' | 'private'
          avatar: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          text: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
    }
  }
}
```

---

### 2.3 `hooks/useAuth.ts`

**Status**: 🆕 CRIAR  
**Propósito**: Hook de autenticação centralizado  
**Dependências**: `services/supabase.ts`

**Implementação**:
```typescript
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setAuthState(prev => ({ ...prev, session, user: session?.user ?? null, loading: false }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        setAuthState(prev => ({ 
          ...prev, 
          session, 
          user: session?.user ?? null,
          profile: session ? prev.profile : null 
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setAuthState(prev => ({ ...prev, profile: data }));
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, profile: null, session: null, loading: false });
  };

  return {
    ...authState,
    signIn,
    signOut,
  };
}
```

---

### 2.4 `hooks/useProjects.ts`

**Status**: 🆕 CRIAR  
**Propósito**: Hook para gerenciar projetos  
**Dependências**: `services/supabase.ts`

**Implementação**:
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

export function useProjects(clientId: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    fetchProjects();
  }, [clientId]);

  const fetchProjects = async () => {
    if (!clientId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const createProject = async (project: ProjectInsert) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    if (data) setProjects(prev => [data, ...prev]);
    return data;
  };

  const updateProject = async (id: string, updates: Partial<ProjectInsert>) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setProjects(prev => prev.map(p => p.id === id ? data : p));
    }
    return data;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
```

---

### 2.5 `hooks/useClients.ts`

**Status**: 🆕 CRIAR  
**Propósito**: Hook para gerenciar clientes  
**Dependências**: `services/supabase.ts`

**Implementação**:
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database';

type Client = Database['public']['Tables']['clients']['Row'];

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (!error && data) {
      setClients(data);
    }
    setLoading(false);
  };

  const createClient = async (name: string, logoUrl?: string) => {
    const { data, error } = await supabase
      .from('clients')
      .insert({ name, logo_url: logoUrl })
      .select()
      .single();

    if (error) throw error;
    if (data) setClients(prev => [...prev, data]);
    return data;
  };

  return {
    clients,
    loading,
    createClient,
    refetch: fetchClients,
  };
}
```

---

## 3. ✏️ Arquivos a Modificar

### 3.1 `.env.local`

**Status**: ✏️ MODIFICAR  
**Modificações necessárias**:

1. **Adicionar variáveis Supabase**
   - Localização: Após GEMINI_API_KEY
   - Código:
   ```bash
   # Supabase
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   - Justificativa: Necessário para conexão com Supabase

---

### 3.2 `package.json`

**Status**: ✏️ MODIFICAR  
**Modificações necessárias**:

1. **Adicionar dependência Supabase**
   - Localização: dependencies
   - Código:
   ```json
   {
     "dependencies": {
       "react": "^19.2.3",
       "@google/genai": "^1.37.0",
       "react-dom": "^19.2.3",
       "@supabase/supabase-js": "^2.45.0"
     }
   }
   ```
   - Justificativa: Cliente oficial do Supabase

---

### 3.3 `components/LoginView.tsx`

**Status**: ✏️ MODIFICAR  
**Modificações necessárias**:

1. **Substituir login simulado por Supabase Auth**
   - Localização: handleSubmit (linha ~14-27)
   - Código atual:
   ```typescript
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     setLoading(true);

     // Simulação de login
     setTimeout(() => {
       const success = onLogin(email);
       if (!success) {
         setError('Credenciais inválidas. Verifique seu e-mail e senha.');
       }
       setLoading(false);
     }, 800);
   };
   ```
   - Código novo:
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     setLoading(true);

     try {
       const { error } = await onLogin(email, password);
       if (error) {
         setError('Credenciais inválidas. Verifique seu e-mail e senha.');
       }
     } catch (err) {
       setError('Erro ao conectar. Tente novamente.');
     } finally {
       setLoading(false);
     }
   };
   ```
   - Justificativa: Integração com autenticação real

2. **Atualizar interface de props**
   - Localização: LoginViewProps (linha ~4-6)
   - Código atual:
   ```typescript
   interface LoginViewProps {
     onLogin: (email: string) => boolean;
   }
   ```
   - Código novo:
   ```typescript
   interface LoginViewProps {
     onLogin: (email: string, password: string) => Promise<{ error: Error | null }>;
   }
   ```

---

### 3.4 `App.tsx`

**Status**: ✏️ MODIFICAR  
**Modificações necessárias**:

1. **Importar hooks de autenticação e dados**
   - Localização: Topo do arquivo (linhas 1-23)
   - Código a adicionar após imports existentes:
   ```typescript
   import { useAuth } from './hooks/useAuth';
   import { useProjects } from './hooks/useProjects';
   import { useClients } from './hooks/useClients';
   ```

2. **Substituir estado mockado por hooks**
   - Localização: Dentro do componente App (linhas 25-37)
   - Código atual:
   ```typescript
   const [currentUser, setCurrentUser] = useState<User | null>(null);
   const [clients, setClients] = useState<ClientAccount[]>(INITIAL_CLIENTS);
   const [users, setUsers] = useState<Record<string, User>>(TEST_USERS);
   const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);
   const [activeTab, setActiveTab] = useState('dashboard');
   const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
   ```
   - Código novo:
   ```typescript
   const { user, profile, loading: authLoading, signIn, signOut } = useAuth();
   const { clients, loading: clientsLoading } = useClients();
   const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);
   const [activeTab, setActiveTab] = useState('dashboard');
   const { 
     projects, 
     loading: projectsLoading, 
     createProject, 
     updateProject 
   } = useProjects(selectedClient?.id ?? null);
   ```

3. **Atualizar handleLogin**
   - Localização: handleLogin function (linhas 88-95)
   - Código atual:
   ```typescript
   const handleLogin = (email: string) => {
     const user = users[email];
     if (user) {
       setCurrentUser(user);
       setActiveTab('dashboard');
     }
     return !!user;
   };
   ```
   - Código novo:
   ```typescript
   const handleLogin = async (email: string, password: string) => {
     return await signIn(email, password);
   };
   ```

4. **Atualizar condição de loading**
   - Localização: Antes do return principal (linha ~120)
   - Código a adicionar:
   ```typescript
   if (authLoading) {
     return (
       <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
         <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
   }

   if (!user || !profile) return <LoginView onLogin={handleLogin} />;
   ```

5. **Usar profile ao invés de currentUser**
   - Localização: Todo o arquivo
   - Substituir: `currentUser` por `profile`
   - Justificativa: Profile contém dados do usuário autenticado do Supabase

---

### 3.5 `types.ts`

**Status**: ✏️ MODIFICAR  
**Modificações necessárias**:

1. **Adicionar tipos compatíveis com Database**
   - Localização: Final do arquivo
   - Código a adicionar:
   ```typescript
   // Re-export database types for compatibility
   export type { Database } from './types/database';
   
   // Helper type to convert database row to frontend type
   export function mapUserFromDb(dbUser: Database['public']['Tables']['users']['Row']): User {
     return {
       id: dbUser.id,
       name: dbUser.name,
       role: dbUser.role,
       accessLevel: dbUser.access_level,
       avatarUrl: dbUser.avatar_url || '',
       bio: dbUser.bio || undefined,
       email: dbUser.email,
       clientId: dbUser.client_id || undefined,
     };
   }
   ```

---

## 4. 🗑️ Arquivos a Remover/Deprecar

### `constants.tsx` (Parcial)

**Status**: ⚠️ DEPRECAR PARCIALMENTE  
**Impacto**: Remover dados mockados, manter apenas constantes de UI

**Itens a remover**:
- `CLIENT_ACCOUNTS`
- `TEST_USERS`
- `PROJECTS`
- `INITIAL_CONVERSATIONS`
- `INITIAL_MESSAGES`

**Itens a manter**:
- `TEAM_MEMBERS` (temporário até migração completa)
- `INITIAL_INSPIRATION`
- `RECENT_ACTIVITIES`

---

## 5. 🗄️ Migrações de Banco de Dados

### 5.1 Criar Tabelas Principais

```sql
-- Habilitar RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Tabela de clientes
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários (perfis)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'Membro',
  access_level TEXT NOT NULL CHECK (access_level IN ('MANAGER', 'CLIENT')),
  avatar_url TEXT,
  bio TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Revision', 'Completed')),
  due_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de metas criativas
CREATE TABLE public.creative_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Andamento', 'Em Revisão', 'Concluído')),
  type TEXT NOT NULL CHECK (type IN ('video', 'design', 'campaign')),
  due_date DATE,
  responsible_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de documentos
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.creative_goals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'figma', 'image', 'video')),
  url TEXT NOT NULL,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conversas
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group', 'private')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_creative_goals_project_id ON public.creative_goals(project_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_users_client_id ON public.users(client_id);
```

---

### 5.2 Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Função helper para obter access_level do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_access_level()
RETURNS TEXT AS $$
  SELECT access_level FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Função helper para obter client_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS UUID AS $$
  SELECT client_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Políticas para CLIENTS
CREATE POLICY "managers_full_access_clients" ON public.clients
  FOR ALL USING (public.get_user_access_level() = 'MANAGER');

CREATE POLICY "clients_read_own_client" ON public.clients
  FOR SELECT USING (id = public.get_user_client_id());

-- Políticas para USERS
CREATE POLICY "users_read_own_profile" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "managers_read_all_users" ON public.users
  FOR SELECT USING (public.get_user_access_level() = 'MANAGER');

CREATE POLICY "users_update_own_profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Políticas para PROJECTS
CREATE POLICY "managers_full_access_projects" ON public.projects
  FOR ALL USING (public.get_user_access_level() = 'MANAGER');

CREATE POLICY "clients_read_own_projects" ON public.projects
  FOR SELECT USING (client_id = public.get_user_client_id());

-- Políticas para CREATIVE_GOALS
CREATE POLICY "managers_full_access_goals" ON public.creative_goals
  FOR ALL USING (public.get_user_access_level() = 'MANAGER');

CREATE POLICY "clients_read_own_goals" ON public.creative_goals
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE client_id = public.get_user_client_id()
    )
  );

-- Políticas para DOCUMENTS
CREATE POLICY "managers_full_access_documents" ON public.documents
  FOR ALL USING (public.get_user_access_level() = 'MANAGER');

CREATE POLICY "clients_read_own_documents" ON public.documents
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects WHERE client_id = public.get_user_client_id()
    )
  );
```

---

## 6. ✅ Checklist de Implementação

### Ordem de Execução

1. [ ] **Setup Supabase**
   - Criar projeto no Supabase
   - Obter URL e anon key

2. [ ] **Configuração**
   - Atualizar `.env.local` com variáveis Supabase
   - Instalar `@supabase/supabase-js`

3. [ ] **Database**
   - Executar migrações SQL
   - Configurar RLS policies

4. [ ] **Tipos e Serviços**
   - Criar `types/database.ts`
   - Criar `services/supabase.ts`

5. [ ] **Hooks**
   - Criar `hooks/useAuth.ts`
   - Criar `hooks/useClients.ts`
   - Criar `hooks/useProjects.ts`

6. [ ] **Componentes**
   - Atualizar `LoginView.tsx`
   - Atualizar `App.tsx`

7. [ ] **Cleanup**
   - Remover dados mockados de `constants.tsx`
   - Atualizar `types.ts`

8. [ ] **Testes Manuais**
   - Testar login/logout
   - Testar CRUD de projetos
   - Testar RLS (MANAGER vs CLIENT)

---

## 7. ⚠️ Breaking Changes

| Mudança | Impacto | Migração |
|---------|---------|----------|
| Login agora é async | Props de LoginView mudam | Atualizar chamadas |
| Dados não são mais mockados | Banco precisa ter dados | Inserir dados iniciais |
| currentUser → profile | Renomear em todos os lugares | Find & Replace |

---

## 8. 📊 Comandos Úteis

```bash
# Instalar dependências
npm install @supabase/supabase-js

# Gerar tipos do Supabase (opcional)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# Rodar migrações (via Supabase CLI)
npx supabase db push
```

---

**Última atualização:** 23/01/2026  
**Gerado por:** Skill prd-para-spec  
**Status:** Pronto para implementação
