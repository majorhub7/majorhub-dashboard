---
name: codebase-analysis-prd
description: Analisa a base de código do projeto para identificar padrões de implementação, arquitetura, infraestrutura de deploy e documentação existente, gerando um PRD.md completo. Use quando precisar entender a estrutura de um projeto, documentar padrões ou preparar uma nova implementação.
---

# Codebase Analysis & PRD Generation

Skill especializada em análise profunda de bases de código para extração de padrões, convenções e práticas de implementação, culminando na geração de um Product Requirements Document (PRD.md) completo e acionável.

## When to use this skill

- Use quando iniciar um novo projeto ou feature e precisar entender a arquitetura existente
- Use para documentar padrões e convenções de um projeto legacy
- Use quando precisar preparar um guia de implementação para novos desenvolvedores
- Use para auditar a estrutura atual antes de propor mudanças arquiteturais
- Use quando precisar criar documentação técnica atualizada do projeto
- Use para identificar débitos técnicos e oportunidades de melhoria
- Use antes de definir requisitos para garantir alinhamento com a base existente

## How to use it

### Fase 1: Descoberta e Mapeamento

**1.1 Identificar o tipo de projeto**
```bash
# Localizar arquivos de configuração raiz
- package.json (Node.js/JavaScript)
- composer.json (PHP)
- requirements.txt / pyproject.toml (Python)
- pom.xml / build.gradle (Java)
- Cargo.toml (Rust)
- go.mod (Go)
```

**1.2 Mapear estrutura de diretórios**
```
Documentar:
- Organização de pastas principais (src/, lib/, app/, etc.)
- Separação entre frontend/backend
- Localização de testes, docs, configs
- Convenções de nomenclatura de pastas
```

**1.3 Identificar stack tecnológico**
```
Extrair de package managers:
- Framework principal e versão
- Bibliotecas core
- Ferramentas de build (Webpack, Vite, etc.)
- Ferramentas de teste
```

### Fase 2: Análise de Documentação

**2.1 Documentos principais**

Buscar e analisar (nesta ordem de prioridade):
1. `README.md` - Setup e visão geral
2. `CONTRIBUTING.md` - Guidelines de contribuição
3. `ARCHITECTURE.md` - Decisões arquiteturais
4. `docs/` - Documentação adicional
5. `CHANGELOG.md` - Histórico
6. `.github/`, `.gitlab/` - Templates e workflows

**2.2 Documentação inline**
```
Procurar por:
- JSDoc, TSDoc (JavaScript/TypeScript)
- PHPDoc (PHP)
- Docstrings (Python)
- Javadoc (Java)
- XML comments (C#)
```

### Fase 3: Análise de Padrões de Código

**3.1 Arquitetura**
```
Identificar padrão:
- MVC (Model-View-Controller)
- MVVM (Model-View-ViewModel)
- Clean Architecture
- Hexagonal Architecture
- Microservices
- Monolith modular
- Serverless

Documentar:
- Separação de camadas
- Fluxo de dados
- Responsabilidades de cada camada
```

**3.2 Convenções de nomenclatura**
```javascript
// Analisar exemplos reais do código:

// Arquivos de componentes
UserProfile.tsx          // PascalCase para componentes React
user-service.js          // kebab-case para serviços
UserRepository.php       // PascalCase para classes PHP

// Variáveis e funções
const userData = {};     // camelCase
function getUserById()   // camelCase
class UserService {}     // PascalCase

// Constantes
const API_BASE_URL = ''; // UPPER_SNAKE_CASE
```

**3.3 Estrutura de arquivos**
```
Identificar padrão de organização:

Opção 1 - Por tipo:
/components
/services
/utils
/models

Opção 2 - Por feature:
/user
  - UserComponent.tsx
  - UserService.ts
  - UserModel.ts
/product
  - ProductComponent.tsx
  - ProductService.ts
```

**3.4 Padrões de design**
```
Procurar por:
- Singleton (getInstance patterns)
- Factory (createX methods)
- Repository (data access layer)
- Observer (event systems)
- Strategy (interchangeable algorithms)
- Decorator (wrappers)
```

### Fase 4: Gerenciamento de Estado

**4.1 Identificar solução**
```javascript
// React
import { createStore } from 'redux';           // Redux
import { observable } from 'mobx';             // MobX
import { createContext } from 'react';         // Context API
import { create } from 'zustand';              // Zustand

// Vue
import { createStore } from 'vuex';            // Vuex
import { defineStore } from 'pinia';           // Pinia
```

**4.2 Documentar estrutura**
```
Para Redux:
- Estrutura de stores/reducers
- Uso de middleware
- Async actions (thunks, sagas)
- Normalização de state

Para outros:
- Organização de stores
- Computed values
- Actions/mutations
```

### Fase 5: UI e Estilização

**5.1 Framework CSS**
```javascript
// Identificar via imports ou configs:
import 'tailwindcss/tailwind.css';        // Tailwind
import { Button } from '@mui/material';   // Material-UI
import 'bootstrap/dist/css/bootstrap.css'; // Bootstrap
import styled from 'styled-components';    // Styled Components
```

**5.2 Metodologia**
```css
/* BEM */
.block__element--modifier {}

/* CSS Modules */
import styles from './Component.module.css';

/* Styled Components */
const StyledButton = styled.button``;
```

**5.3 Sistema de design**
```
Procurar por:
- /design-system ou /components/ui
- Tokens de design (cores, espaçamentos)
- Componentes reutilizáveis
- Storybook ou similar
```

### Fase 6: Infraestrutura e Deploy

**6.1 Variáveis de ambiente**
```bash
# Analisar estrutura de .env files
.env                  # Base
.env.local           # Local overrides
.env.development     # Dev
.env.staging         # Staging
.env.production      # Production

# Documentar padrões:
NEXT_PUBLIC_          # Prefixos para client-side
VITE_                 # Vite env vars
REACT_APP_           # Create React App
```

**6.2 Scripts de build**
```json
// De package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

**6.3 Pipeline CI/CD**
```yaml
# Analisar .github/workflows/*.yml
# ou .gitlab-ci.yml, bitbucket-pipelines.yml

Documentar:
- Triggers (push, PR, tags)
- Jobs e steps
- Ambientes de deploy
- Secrets utilizados
- Checks obrigatórios (testes, lint)
```

**6.4 Containerização**
```dockerfile
# Analisar Dockerfile e docker-compose.yml

Documentar:
- Base image
- Multi-stage builds
- Variáveis de build
- Volumes e redes
- Serviços dependentes
```

**6.5 Plataforma de hospedagem**
```
Identificar via configs:
- vercel.json          # Vercel
- netlify.toml         # Netlify
- railway.json         # Railway
- fly.toml            # Fly.io
- terraform/          # AWS/GCP/Azure
- kubernetes/         # K8s
```

### Fase 7: Dependências e Integrações

**7.1 Catalogar dependências**
```javascript
// Categorizar por propósito:
{
  "dependencies": {
    // Core framework
    "react": "^18.0.0",
    
    // State management
    "zustand": "^4.0.0",
    
    // UI
    "tailwindcss": "^3.0.0",
    
    // API/Data
    "axios": "^1.0.0",
    "react-query": "^3.0.0"
  }
}
```

**7.2 Integrações externas**
```javascript
// Identificar via código:
import Stripe from 'stripe';           // Pagamentos
import sgMail from '@sendgrid/mail';  // Email
import { Auth0Provider } from '@auth0/auth0-react'; // Auth
import analytics from '@segment/analytics-next';    // Analytics

// Documentar:
- Propósito da integração
- Configuração necessária
- Endpoints utilizados
- Webhooks configurados
```

### Fase 8: Testes

**8.1 Framework de testes**
```javascript
// Identificar via package.json e arquivos de teste:
import { describe, it, expect } from 'vitest';     // Vitest
import { test, expect } from '@playwright/test';  // Playwright
import { render } from '@testing-library/react'; // Testing Library
```

**8.2 Cobertura e padrões**
```javascript
// Analisar jest.config.js ou vitest.config.ts
export default {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}
```

**8.3 Tipos de teste**
```
Procurar por:
- *.test.js, *.spec.js      # Unit tests
- *.integration.test.js     # Integration tests
- e2e/, cypress/, playwright/ # E2E tests
```

### Fase 9: Qualidade de Código

**9.1 Linters**
```javascript
// .eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error'
  }
}
```

**9.2 Formatadores**
```javascript
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**9.3 Git hooks**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### Fase 10: Geração do PRD.md

**Estrutura do documento:**

```markdown
# Product Requirements Document

> Gerado automaticamente em: [DATA]
> Base de análise: [BRANCH/COMMIT]

## 1. 📋 Visão Geral

**Projeto:** [Nome]
**Descrição:** [Breve descrição]
**Versão atual:** [Versão do package.json]

### Stack Tecnológico
- **Framework:** [Framework principal e versão]
- **Linguagem:** [Linguagem e versão]
- **Runtime:** [Node, Python, etc.]
- **Database:** [Se identificado]

## 2. 🏗️ Arquitetura

### Padrão Arquitetural
[Descrever padrão identificado]

### Estrutura de Diretórios
```
/src
  /components    - Componentes reutilizáveis
  /pages        - Rotas da aplicação
  /services     - Lógica de negócio
  /utils        - Utilitários
```

### Fluxo de Dados
[Diagrama ou descrição textual do fluxo]

## 3. 💻 Padrões de Implementação

### Convenções de Nomenclatura
- **Arquivos:** [padrão identificado]
- **Componentes:** [padrão identificado]
- **Funções:** [padrão identificado]
- **Variáveis:** [padrão identificado]
- **Constantes:** [padrão identificado]

### Exemplo de Estrutura de Componente
```typescript
// Padrão identificado no projeto
import React from 'react';

interface UserProfileProps {
  userId: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  // Implementação
  return <div>...</div>;
};
```

### Padrões de Design Utilizados
- **[Pattern Name]:** [Onde e como é usado]

## 4. 🎨 UI e Estilização

### Framework CSS
[Nome do framework e versão]

### Metodologia
[BEM, CSS Modules, Styled Components, etc.]

### Sistema de Design
- **Cores:** [Se houver tokens documentados]
- **Tipografia:** [Fontes utilizadas]
- **Espaçamento:** [Sistema de grid/spacing]
- **Componentes:** [Link para Storybook ou lista]

### Responsividade
```css
/* Breakpoints identificados */
mobile: 0-640px
tablet: 641-1024px
desktop: 1025px+
```

## 5. 🔄 Gerenciamento de Estado

### Solução: [Nome da biblioteca]

### Estrutura
```typescript
// Exemplo da estrutura de store identificada
```

### Boas Práticas Observadas
- [Lista de padrões encontrados no código]

## 6. 🚀 Infraestrutura

### Ambientes

| Ambiente | URL | Branch | Deploy |
|----------|-----|--------|--------|
| Dev | [URL] | develop | Automático |
| Staging | [URL] | staging | Automático |
| Production | [URL] | main | Manual |

### Variáveis de Ambiente

```bash
# Desenvolvimento
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# Produção
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
```

### Pipeline CI/CD

```yaml
# Fluxo identificado
1. Trigger: Push to branch
2. Install dependencies
3. Run linter
4. Run tests
5. Build application
6. Deploy to environment
```

### Containerização
[Docker/Kubernetes configs encontradas]

## 7. 🔌 Dependências e Integrações

### Dependências Principais

| Biblioteca | Versão | Propósito |
|------------|--------|-----------|
| react | ^18.2.0 | UI Framework |
| next | ^14.0.0 | Meta-framework |
| zustand | ^4.4.0 | State management |

### Integrações Externas

**Stripe** - Pagamentos
- Configuração: [Detalhes]
- Webhooks: `/api/webhooks/stripe`

**SendGrid** - Email
- Configuração: [Detalhes]
- Templates: [Lista]

## 8. ✅ Testes e Qualidade

### Estratégia de Testes
- **Unit Tests:** Vitest + Testing Library
- **Integration Tests:** Vitest
- **E2E Tests:** Playwright

### Cobertura Atual
- Lines: [X%]
- Branches: [Y%]
- Functions: [Z%]

### Comandos
```bash
npm run test           # Run all tests
npm run test:coverage  # With coverage
npm run test:e2e      # E2E tests
```

### Ferramentas de Qualidade
- **ESLint:** [Config extend]
- **Prettier:** [Configurações principais]
- **Husky:** Pre-commit hooks
- **TypeScript:** Strict mode [enabled/disabled]

## 9. 🔒 Segurança

### Autenticação/Autorização
[Solução utilizada: Auth0, NextAuth, custom, etc.]

### Proteções Implementadas
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ SQL Injection prevention (via ORM)
- ✅ Rate limiting
- ✅ HTTPS enforced

### Gestão de Secrets
[Método: env vars, vault, etc.]

### Recomendações
- [Lista de melhorias sugeridas]

## 10. ⚡ Performance

### Otimizações Atuais
- **Code Splitting:** [Implementado]
- **Lazy Loading:** [Componentes/rotas]
- **Image Optimization:** [Next/Image, etc.]
- **Caching:** [Estratégia]
- **CDN:** [Provedor]

### Métricas
[Se houver Lighthouse ou similar configurado]

## 11. 📖 Guia de Implementação

### Setup do Ambiente

```bash
# Clone o repositório
git clone [URL]

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Rode o servidor de desenvolvimento
npm run dev
```

### Criando um Novo Componente

```bash
# Estrutura esperada
/components
  /UserCard
    - UserCard.tsx
    - UserCard.test.tsx
    - UserCard.module.css
    - index.ts
```

```typescript
// Template seguindo padrões do projeto
import React from 'react';
import styles from './UserCard.module.css';

interface UserCardProps {
  name: string;
}

export const UserCard: React.FC<UserCardProps> = ({ name }) => {
  return (
    <div className={styles.card}>
      <h3>{name}</h3>
    </div>
  );
};
```

### Adicionando uma Nova Feature

1. Criar branch: `git checkout -b feature/nome-da-feature`
2. Implementar seguindo padrões identificados
3. Adicionar testes (mínimo 80% coverage)
4. Rodar `npm run lint` e `npm run test`
5. Commit seguindo [Conventional Commits]
6. Criar Pull Request

### Deploy

**Desenvolvimento:**
```bash
git push origin develop
# Deploy automático via CI/CD
```

**Produção:**
```bash
# 1. Merge para main
# 2. Tag de versão
git tag -a v1.2.3 -m "Release 1.2.3"
git push origin v1.2.3

# 3. Aprovação manual no pipeline
# 4. Deploy para produção
```

### Rollback
```bash
# Via git
git revert [commit-hash]

# Ou via plataforma
vercel rollback [deployment-url]
```

## 12. 📚 Referências

### Documentação Interna
- [README.md](./README.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [API Docs](./docs/api.md)

### Recursos Externos
- [Framework Docs](https://...)
- [Design System](https://...)
- [API Reference](https://...)

## 13. 🎯 Próximos Passos

### Melhorias Recomendadas
- [ ] [Sugestão baseada na análise]
- [ ] [Sugestão baseada na análise]

### Débitos Técnicos
- [ ] [Item identificado]
- [ ] [Item identificado]

### Roadmap Sugerido
**Q1 2025:**
- [Feature/Melhoria]

**Q2 2025:**
- [Feature/Melhoria]

## 14. 📝 Glossário

- **Term:** Definition
- **Abbreviation:** Meaning

## 15. 📎 Anexos

### Diagrama de Componentes
[Se aplicável]

### Exemplo de Configuração
```json
// Exemplo importante encontrado
```

---

**Última atualização:** [Data]
**Analisado por:** Codebase Analysis Skill
**Revisão necessária:** [Sim/Não]
```

### Convenções de Formatação

**Use emojis para seções principais:**
- 📋 Visão Geral
- 🏗️ Arquitetura
- 💻 Código
- 🎨 UI/Design
- 🔄 Estado
- 🚀 Deploy
- 🔌 Integrações
- ✅ Testes
- 🔒 Segurança
- ⚡ Performance
- 📖 Documentação
- 🎯 Próximos Passos

**Code blocks sempre com linguagem especificada:**
```typescript
// Bom
const example = 'with language';
```

**Tabelas para dados estruturados:**

| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Dados    | Dados    | Dados    |

**Listas de checklist para ações:**
- [ ] Item não completado
- [x] Item completado

**Callouts para informações importantes:**

> ⚠️ **Atenção:** Informação crítica

> 💡 **Dica:** Sugestão útil

> 🚨 **Crítico:** Requer ação imediata

### Validação do PRD

Antes de finalizar, verificar:

- [ ] Todas as seções obrigatórias preenchidas
- [ ] Exemplos de código reais (não genéricos)
- [ ] Links funcionando corretamente
- [ ] Informações factuais e verificáveis
- [ ] Linguagem técnica apropriada
- [ ] Sem informações sensíveis (secrets, tokens)
- [ ] Formatação Markdown válida
- [ ] Referências cruzadas corretas

### Output Adicional Opcional

Se necessário, gere também:

**IMPLEMENTATION_GUIDE.md**
- Guia detalhado passo-a-passo
- Exemplos práticos
- Troubleshooting comum

**TECH_DEBT.md**
- Lista priorizada de débitos
- Estimativas de esforço
- Impacto vs complexidade

**SECURITY_AUDIT.md**
- Vulnerabilidades identificadas
- Recomendações de segurança
- Checklist de compliance

## Best Practices

1. **Seja factual:** Base tudo em evidências do código
2. **Use exemplos reais:** Não invente, extraia do código existente
3. **Seja conciso:** Evite redundância
4. **Priorize ação:** O PRD deve ser acionável
5. **Mantenha atualizado:** Indique quando revisão é necessária
6. **Contextualize:** Explique o "porquê" das decisões quando possível
7. **Seja honesto:** Identifique gaps e áreas sem documentação
8. **Valide:** Sempre que possível, cruze informações de múltiplas fontes

## Checklist de Execução

Execute as fases na ordem apresentada:

- [ ] **Fase 1:** Descoberta e mapeamento completo
- [ ] **Fase 2:** Análise de toda documentação existente
- [ ] **Fase 3:** Identificação de padrões de código
- [ ] **Fase 4:** Análise de gerenciamento de estado
- [ ] **Fase 5:** Documentação de UI e estilização
- [ ] **Fase 6:** Mapeamento de infraestrutura e deploy
- [ ] **Fase 7:** Catalogação de dependências e integrações
- [ ] **Fase 8:** Análise de estratégia de testes
- [ ] **Fase 9:** Avaliação de qualidade de código
- [ ] **Fase 10:** Geração do PRD.md completo
- [ ] **Validação:** Revisão final seguindo checklist

## Entregáveis Finais

Ao concluir esta skill, você deve gerar:

1. **PRD.md** (obrigatório) - Documento principal seguindo a estrutura definida
2. **IMPLEMENTATION_GUIDE.md** (api:///absolute/path/to/IMPLEMENTATION_GUIDE.md) (opcional) - Se houver padrões complexos que merecem guia dedicado
3. **TECH_DEBT.md** (api:///absolute/path/to/TECH_DEBT.md) (opcional) - Se débitos técnicos significativos forem identificados
4. **SECURITY_AUDIT.md** (api:///absolute/path/to/SECURITY_AUDIT.md) (opcional) - Se questões de segurança críticas forem encontradas

## Notas Importantes

- Esta skill deve ser executada de forma metódica e sistemática
- Não pule fases, mesmo que pareçam não aplicáveis inicialmente
- Documente explicitamente quando informações não estiverem disponíveis
- Priorize sempre padrões existentes sobre sugestões pessoais
- Mantenha tom neutro e profissional ao identificar problemas
- Use linguagem clara e acessível, mas tecnicamente precisa
- Inclua sempre exemplos concretos extraídos do código real
- Atualize este documento conforme o projeto evolui
