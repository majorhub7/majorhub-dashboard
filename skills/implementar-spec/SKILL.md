---
name: implementar-spec
description: Lê o arquivo SPEC.md e implementa todas as mudanças especificadas, criando, modificando e removendo arquivos conforme necessário. Limpa o contexto antes de começar e executa as mudanças em ordem lógica.
---

# Skill: Implementar Especificação Técnica

Ao implementar uma especificação técnica, siga este processo rigoroso:

## Preparação Inicial

### 1. Limpar Contexto
**SEMPRE execute isso primeiro, antes de qualquer outra ação:**

```
🧹 LIMPEZA DE CONTEXTO
- Fechar todos os arquivos abertos
- Limpar histórico de edições
- Resetar estado da sessão
- Verificar working directory
```

**Como fazer**:
- Remova referências a arquivos anteriores
- Não carregue código não relacionado
- Comece com contexto limpo e focado apenas na SPEC.md

### 2. Ler e Validar SPEC.md
- Ler o arquivo SPEC.md completamente
- Validar que todas as seções estão presentes
- Identificar dependências entre arquivos
- Criar ordem de execução otimizada

## Processo de Implementação

### Fase 1: Análise e Planejamento

1. **Mapear Dependências**
   - Listar todos os arquivos na ordem correta
   - Identificar dependências entre mudanças
   - Verificar se há conflitos potenciais

2. **Criar Checklist de Implementação**
   ```
   ☐ Configurações (package.json, .env, etc)
   ☐ Tipos e interfaces
   ☐ Utilitários
   ☐ Serviços e modelos
   ☐ Componentes base
   ☐ Componentes compostos
   ☐ Páginas e rotas
   ☐ Testes
   ```

### Fase 2: Execução Ordenada

Para cada arquivo na especificação:

#### A. Arquivos NOVOS (🆕 CRIAR)

1. **Verificar se o diretório existe**
   - Criar diretórios necessários se não existirem

2. **Criar o arquivo**
   - Usar o caminho exato da SPEC
   - Implementar código completo do snippet
   - Adicionar imports necessários
   - Incluir comentários de documentação

3. **Validar criação**
   - Verificar sintaxe
   - Confirmar que o arquivo foi criado
   - Testar imports se possível

**Template de execução**:
```
📄 CRIANDO: caminho/do/arquivo.ext
├─ ✓ Diretório verificado
├─ ✓ Arquivo criado
├─ ✓ Código implementado
└─ ✓ Sintaxe validada
```

#### B. Arquivos EXISTENTES (✏️ MODIFICAR)

1. **Abrir e ler o arquivo**
   - Carregar conteúdo atual
   - Identificar seções a modificar

2. **Aplicar mudanças sequencialmente**
   - Seguir ordem da SPEC
   - Uma modificação por vez
   - Preservar código não mencionado

3. **Validar cada mudança**
   - Verificar sintaxe após cada modificação
   - Garantir que imports ainda funcionam
   - Confirmar lógica preservada

**Template de execução**:
```
✏️ MODIFICANDO: caminho/do/arquivo.ext
├─ ✓ Arquivo lido
├─ ✓ Mudança 1/3 aplicada
├─ ✓ Mudança 2/3 aplicada
├─ ✓ Mudança 3/3 aplicada
└─ ✓ Arquivo salvo e validado
```

#### C. Arquivos para REMOVER (🗑️)

1. **Verificar dependências**
   - Confirmar que nenhum arquivo ativo depende dele
   - Alertar sobre possíveis breaking changes

2. **Remover arquivo**
   - Deletar o arquivo
   - Atualizar imports em outros arquivos se necessário

**Template de execução**:
```
🗑️ REMOVENDO: caminho/do/arquivo.ext
├─ ✓ Dependências verificadas
├─ ✓ Arquivo removido
└─ ⚠️ Revisar imports em: [lista de arquivos]
```

### Fase 3: Validação Final

1. **Verificar todas as mudanças**
   ```
   ✓ Todos os arquivos criados
   ✓ Todas as modificações aplicadas
   ✓ Arquivos removidos conforme SPEC
   ✓ Sem erros de sintaxe
   ✓ Dependências resolvidas
   ```

2. **Gerar relatório de implementação**
   - Listar todos os arquivos afetados
   - Indicar status de cada mudança
   - Alertar sobre pendências ou avisos

## Checklist de Qualidade

Antes de finalizar, verificar:

- **Completude**: Todas as mudanças da SPEC foram implementadas?
- **Sintaxe**: Todos os arquivos estão sintaticamente corretos?
- **Imports**: Todas as dependências estão importadas?
- **Consistência**: O código segue o padrão do projeto?
- **Documentação**: Comentários importantes foram adicionados?
- **Testes**: Arquivos de teste foram criados/atualizados?

## Tratamento de Erros

Se encontrar problemas durante a implementação:

1. **Erro de Sintaxe**
   - Pausar implementação
   - Corrigir o erro imediatamente
   - Validar correção antes de continuar

2. **Arquivo Não Encontrado**
   - Verificar caminho na SPEC
   - Criar diretórios faltantes
   - Tentar novamente

3. **Conflito de Dependências**
   - Identificar a origem do conflito
   - Consultar SPEC para ordem correta
   - Ajustar ordem de implementação

4. **SPEC Incompleta**
   - Alertar sobre informações faltantes
   - Solicitar clarificação
   - Não prosseguir sem informação necessária

## Formato de Relatório Final

```markdown
# 📋 RELATÓRIO DE IMPLEMENTAÇÃO

## ✅ Arquivos Criados (X)
- `caminho/arquivo1.ext` - Criado com sucesso
- `caminho/arquivo2.ext` - Criado com sucesso

## ✏️ Arquivos Modificados (Y)
- `caminho/arquivo3.ext` - 3 mudanças aplicadas
- `caminho/arquivo4.ext` - 2 mudanças aplicadas

## 🗑️ Arquivos Removidos (Z)
- `caminho/arquivo5.ext` - Removido

## ⚠️ Avisos e Observações
- [Listar avisos importantes]

## 🎯 Status Final
✓ Implementação completa
✓ Sem erros de sintaxe
✓ Dependências resolvidas
⚠️ [Pendências, se houver]

## 📝 Próximos Passos Sugeridos
1. Executar testes
2. Revisar código implementado
3. Testar funcionalidade end-to-end
4. Fazer commit das mudanças
```

## Princípios Importantes

1. **Sempre limpe o contexto primeiro** - Não carregue arquivos desnecessários
2. **Siga a SPEC fielmente** - Não improvise ou adicione funcionalidades extras
3. **Uma mudança por vez** - Valide cada passo antes do próximo
4. **Documente problemas** - Registre qualquer desvio ou dificuldade
5. **Preserve código existente** - Só altere o que está especificado
6. **Valide constantemente** - Verifique sintaxe após cada modificação
7. **Comunique claramente** - Mostre progresso e status a cada etapa
