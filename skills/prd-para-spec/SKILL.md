---
name: prd-para-spec
description: Lê o arquivo PRD.md e gera uma especificação técnica detalhada (SPEC.md) com caminhos de arquivos, modificações necessárias e snippets de código para implementação. Use quando precisar traduzir requisitos de produto em tarefas técnicas acionáveis.
---

# Skill: PRD para Especificação Técnica

Ao converter um PRD em especificação técnica, siga estes passos:

## Processo de Análise

1. **Ler e Interpretar o PRD**: Compreenda todos os requisitos, funcionalidades e restrições
2. **Identificar Componentes**: Mapeie requisitos para componentes do sistema e arquivos
3. **Definir Alterações**: Especifique o que precisa ser criado, modificado ou removido
4. **Planejar Implementação**: Divida em etapas lógicas e sequenciais

## Estrutura do SPEC.md

### 1. Visão Geral
- Resumo breve da feature/mudança
- Objetivos principais do PRD
- Impacto na arquitetura geral

### 2. Arquivos a Criar
Para cada arquivo novo:
```
#### `caminho/do/arquivo-novo.ext`
**Propósito**: Descrição do que o arquivo faz
**Dependências**: O que importa/requer

**Implementação**:
```language
// Snippet de código completo ou estrutura base
```
```

### 3. Arquivos a Modificar
Para cada arquivo existente:
```
#### `caminho/do/arquivo-existente.ext`
**Modificações necessárias**:

1. **[Seção/Função/Componente]**
   - **O que fazer**: Adicionar/Modificar/Remover
   - **Localização**: Linha aproximada ou contexto
   - **Código**:
   ```language
   // Snippet do código a adicionar/modificar
   ```
   - **Motivo**: Por que essa mudança é necessária
```

### 4. Arquivos a Remover
Liste arquivos que não são mais necessários e o impacto da remoção

## Checklist de Especificação

- **Completude**: Todos os requisitos do PRD estão cobertos?
- **Caminhos corretos**: Os paths dos arquivos seguem a estrutura do projeto?
- **Dependências**: Todas as dependências entre arquivos estão mapeadas?
- **Ordem de implementação**: A sequência de mudanças está lógica?
- **Snippets funcionais**: O código exemplo está correto e funcional?
- **Configurações**: Mudanças em configs, env vars ou build estão documentadas?

## Como Estruturar os Snippets

- Use a sintaxe da linguagem apropriada
- Inclua imports necessários
- Adicione comentários explicativos quando relevante
- Mostre contexto suficiente (não apenas a linha isolada)
- Indique onde inserir o código (início, fim, após linha X)

## Template de Seção de Arquivo

```markdown
### Arquivo: `src/components/NomeComponente.tsx`

**Status**: 🆕 CRIAR | ✏️ MODIFICAR | 🗑️ REMOVER

**Descrição**: [O que este arquivo faz]

**Mudanças**:

1. **Adicionar função de validação**
   - Localização: Após importações, antes do componente principal
   - Código:
   ```typescript
   function validarDados(dados: DadosType): boolean {
     return dados !== null && dados.length > 0;
   }
   ```
   - Justificativa: Necessário para validar entrada do usuário conforme requisito #3 do PRD

2. **Modificar hook useEffect**
   - Localização: Linha ~45, dentro do componente
   - Código atual:
   ```typescript
   useEffect(() => {
     fetchData();
   }, []);
   ```
   - Código novo:
   ```typescript
   useEffect(() => {
     if (validarDados(dados)) {
       fetchData();
     }
   }, [dados]);
   ```
   - Justificativa: Adiciona validação antes de buscar dados
```

## Ordem de Execução Sugerida

1. Configurações e dependências (package.json, .env, etc)
2. Tipos e interfaces (types/, interfaces/)
3. Utilitários e helpers (utils/, helpers/)
4. Modelos e serviços (models/, services/)
5. Componentes base (components/base/)
6. Componentes compostos (components/)
7. Páginas e rotas (pages/, routes/)
8. Testes (*.test.*, *.spec.*)

## Observações Importantes

- Sempre verifique se o caminho do arquivo corresponde à estrutura real do projeto
- Inclua números de versão para dependências novas
- Documente breaking changes claramente
- Indique se há necessidade de migração de dados
- Mencione impactos em performance ou segurança
