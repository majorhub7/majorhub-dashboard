---
name: gemini-integration
description: Integra Google Gemini AI em projetos web. Use quando precisar adicionar capacidades de IA generativa, chat, análise de imagens, geração de conteúdo ou processamento de linguagem natural usando a API do Gemini.
---

# Gemini Integration Skill

Esta skill ajuda a integrar a API do Google Gemini (Gemini Pro, Gemini Pro Vision) em projetos web, incluindo configuração, implementação de chat, análise multimodal e otimizações.

## When to use this skill

- Use this when o usuário precisa adicionar IA generativa ao projeto
- This is helpful for implementar chatbots, assistentes virtuais ou interfaces conversacionais
- Use quando precisar processar e analisar imagens com IA
- This is helpful for gerar conteúdo, textos, código ou resumos automaticamente
- Use quando o usuário quiser análise multimodal (texto + imagem)
- This is helpful for integrar IA em Next.js, React, Vue, Node.js ou aplicações full-stack

## How to use it

### 1. Setup Inicial e Configuração

#### Obter API Key

```bash
# 1. Acesse: https://makersuite.google.com/app/apikey
# 2. Crie um projeto no Google Cloud
# 3. Gere uma API Key
# 4. Ative a Generative Language API
```

**Instrução para o agente:** Sempre oriente o usuário a proteger a API key e nunca expô-la no código cliente.

#### Instalação de Dependências

```bash
# Opção 1: SDK Oficial do Google
npm install @google/generative-ai

# Opção 2: Para projetos server-side apenas
npm install @google-cloud/vertexai

# Dependências adicionais úteis
npm install dotenv          # Variáveis de ambiente
npm install axios           # Requisições HTTP (alternativa)
```

#### Configuração de Variáveis de Ambiente

```env
# .env (server-side)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX

# .env.local (Next.js)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX

# Para uso no cliente (NÃO RECOMENDADO)
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Convenção Crítica:** 
- ✅ Use API key no **servidor** (API Routes, Server Components, Backend)
- ❌ **NUNCA** exponha API key no código cliente
- ✅ Crie endpoints de API intermediários

### 2. Implementação Base por Framework

#### Next.js 13+ (App Router) - Server-Side

```javascript
// app/api/gemini/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { prompt, model = 'gemini-1.5-flash' } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    const geminiModel = genAI.getGenerativeModel({ model });
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      text,
      model,
      tokensUsed: response.usageMetadata 
    });
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
```

```javascript
// app/components/ChatInterface.jsx
'use client';

import { useState } from 'react';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage = { role: 'assistant', content: data.text };
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: 'Erro ao processar mensagem' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="loading">Pensando...</div>}
      </div>
      
      <form onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Enviar
        </button>
      </form>
    </div>
  );
}
```

#### Node.js + Express (Backend)

```javascript
// server.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Endpoint de chat simples
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(message);
    const response = await result.response;
    
    res.json({ 
      reply: response.text(),
      metadata: response.usageMetadata 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de chat com histórico
app.post('/api/chat-history', async (req, res) => {
  try {
    const { messages } = req.body; // [{ role: 'user', parts: [{ text: '...' }] }]
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({ history: messages });
    
    const lastMessage = messages[messages.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    
    res.json({ 
      reply: response.text(),
      history: await chat.getHistory() 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

#### React + Vite (Frontend com Proxy)

```javascript
// src/hooks/useGemini.js
import { useState } from 'react';

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = async (prompt) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Falha na requisição');
      }

      const data = await response.json();
      return data.text;
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateContent, loading, error };
}
```

```javascript
// vite.config.js - Configurar proxy
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}
```

### 3. Funcionalidades Avançadas

#### Chat com Streaming (Respostas em Tempo Real)

```javascript
// app/api/gemini/stream/route.js (Next.js)
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  const { prompt } = await request.json();
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContentStream(prompt);
        
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

```javascript
// Cliente para consumir stream
async function streamChat(prompt, onChunk) {
  const response = await fetch('/api/gemini/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        onChunk(data.text);
      }
    }
  }
}
```

#### Análise de Imagens (Vision)

```javascript
// app/api/gemini/vision/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const prompt = formData.get('prompt') || 'Descreva esta imagem';

    // Converter imagem para base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: image.type
        }
      }
    ]);

    const response = await result.response;
    
    return NextResponse.json({ 
      description: response.text() 
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

```javascript
// Componente de upload de imagem
'use client';

export default function ImageAnalyzer() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', 'Analise esta imagem em detalhes');

    try {
      const response = await fetch('/api/gemini/vision', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data.description);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={analyzeImage}
        disabled={loading}
      />
      {loading && <p>Analisando...</p>}
      {result && <div>{result}</div>}
    </div>
  );
}
```

#### Chat com Contexto e Histórico

```javascript
// lib/gemini-chat.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiChat {
  constructor(apiKey, systemInstruction = '') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.systemInstruction = systemInstruction;
    this.history = [];
  }

  async startChat(initialHistory = []) {
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: this.systemInstruction 
    });
    
    this.chat = this.model.startChat({
      history: initialHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });
    
    return this;
  }

  async sendMessage(message) {
    const result = await this.chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    this.history = await this.chat.getHistory();
    
    return {
      text,
      history: this.history,
      usage: response.usageMetadata
    };
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    return this.startChat();
  }
}
```

```javascript
// app/api/gemini/chat/route.js
import { GeminiChat } from '@/lib/gemini-chat';

const chatInstances = new Map();

export async function POST(request) {
  const { message, sessionId, systemPrompt } = await request.json();
  
  // Criar ou recuperar instância de chat
  if (!chatInstances.has(sessionId)) {
    const chat = new GeminiChat(
      process.env.GEMINI_API_KEY,
      systemPrompt || 'Você é um assistente prestativo.'
    );
    await chat.startChat();
    chatInstances.set(sessionId, chat);
  }
  
  const chat = chatInstances.get(sessionId);
  const response = await chat.sendMessage(message);
  
  return NextResponse.json(response);
}
```

### 4. Configurações de Segurança e Otimização

#### Rate Limiting

```javascript
// lib/rate-limiter.js
const rateLimitMap = new Map();

export function rateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  
  // Filtrar requisições antigas
  const recentRequests = userRequests.filter(
    time => now - time < windowMs
  );
  
  if (recentRequests.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: recentRequests[0] + windowMs
    };
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  
  return {
    allowed: true,
    remaining: maxRequests - recentRequests.length,
    resetTime: now + windowMs
  };
}
```

```javascript
// app/api/gemini/route.js com rate limiting
import { rateLimit } from '@/lib/rate-limiter';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const limit = rateLimit(ip, 10, 60000); // 10 req/min
  
  if (!limit.allowed) {
    return NextResponse.json(
      { 
        error: 'Rate limit excedido',
        resetIn: Math.ceil((limit.resetTime - Date.now()) / 1000)
      },
      { status: 429 }
    );
  }
  
  // ... resto da lógica
}
```

#### Validação e Sanitização de Input

```javascript
// lib/validation.js
export function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt inválido');
  }
  
  if (prompt.length > 10000) {
    throw new Error('Prompt muito longo (máx 10000 caracteres)');
  }
  
  // Remover caracteres perigosos
  const sanitized = prompt
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
  
  if (sanitized.length === 0) {
    throw new Error('Prompt vazio após sanitização');
  }
  
  return sanitized;
}
```

#### Content Filtering (Safety Settings)

```javascript
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
  ]
});
```

### 5. Modelos Disponíveis e Quando Usar

| Modelo | Uso Recomendado | Contexto | Custo |
|--------|----------------|----------|-------|
| `gemini-1.5-flash` | Chat, análise rápida, uso geral | 1M tokens | Mais barato |
| `gemini-1.5-pro` | Tarefas complexas, raciocínio avançado | 2M tokens | Médio |
| `gemini-1.0-pro` | Legacy, compatibilidade | 32k tokens | Barato |

**Convenção:** Use `gemini-1.5-flash` como padrão para a maioria dos casos.

### 6. Tratamento de Erros

```javascript
// lib/gemini-errors.js
export class GeminiError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.details = details;
  }
}

export function handleGeminiError(error) {
  // Quota exceeded
  if (error.message?.includes('quota')) {
    return new GeminiError(
      'Limite de uso da API excedido',
      'QUOTA_EXCEEDED',
      { retryAfter: 3600 }
    );
  }
  
  // Invalid API key
  if (error.message?.includes('API key')) {
    return new GeminiError(
      'API key inválida ou não configurada',
      'INVALID_API_KEY',
      {}
    );
  }
  
  // Content blocked
  if (error.message?.includes('blocked')) {
    return new GeminiError(
      'Conteúdo bloqueado pelos filtros de segurança',
      'CONTENT_BLOCKED',
      { reason: error.message }
    );
  }
  
  // Generic error
  return new GeminiError(
    'Erro ao processar requisição',
    'UNKNOWN_ERROR',
    { original: error.message }
  );
}
```

### 7. Testes

```javascript
// __tests__/gemini.test.js
import { POST } from '@/app/api/gemini/route';

describe('Gemini API', () => {
  it('should generate content from prompt', async () => {
    const request = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Hello, world!' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data).toHaveProperty('text');
    expect(typeof data.text).toBe('string');
  });

  it('should handle missing prompt', async () => {
    const request = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### 8. Exemplos de Uso Prático

#### Gerador de Resumos

```javascript
export async function generateSummary(text) {
  const prompt = `
    Resuma o seguinte texto em 3 pontos principais:
    
    ${text}
    
    Formato da resposta:
    • Ponto 1
    • Ponto 2
    • Ponto 3
  `;
  
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  
  return await response.json();
}
```

#### Assistente de Código

```javascript
export async function explainCode(code, language) {
  const prompt = `
    Explique o seguinte código ${language} de forma clara e didática:
    
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Inclua:
    1. O que o código faz
    2. Como funciona
    3. Possíveis melhorias
  `;
  
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  
  return await response.json();
}
```

#### Análise de Sentimento

```javascript
export async function analyzeSentiment(text) {
  const prompt = `
    Analise o sentimento do seguinte texto e classifique como:
    POSITIVO, NEGATIVO ou NEUTRO
    
    Texto: "${text}"
    
    Responda apenas com a classificação e um score de 0 a 1.
    Formato: CLASSIFICAÇÃO | SCORE
  `;
  
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  
  const data = await response.json();
  const [sentiment, score] = data.text.split('|').map(s => s.trim());
  
  return { sentiment, score: parseFloat(score) };
}
```

### 9. Checklist de Implementação

```markdown
## Gemini Integration Checklist

### Setup
- [ ] API key obtida do Google AI Studio
- [ ] Dependência @google/generative-ai instalada
- [ ] Variável de ambiente GEMINI_API_KEY configurada
- [ ] API key NÃO exposta no código cliente

### Implementação
- [ ] Endpoint de API criado (server-side)
- [ ] Validação de input implementada
- [ ] Tratamento de erros configurado
- [ ] Rate limiting implementado
- [ ] Safety settings configuradas

### Segurança
- [ ] API key em variável de ambiente
- [ ] Validação e sanitização de prompts
- [ ] Rate limiting ativo
- [ ] Content filtering habilitado
- [ ] HTTPS em produção

### Otimização
- [ ] Modelo adequado selecionado (flash vs pro)
- [ ] Streaming implementado para respostas longas
- [ ] Cache de respostas (se aplicável)
- [ ] Limites de tokens configurados

### Testes
- [ ] Testes unitários escritos
- [ ] Testes de integração funcionando
- [ ] Casos de erro testados
- [ ] Performance validada
```

### 10. Troubleshooting

#### Erro: "API key not valid"
```javascript
// Verificar se a variável está carregada
console.log('API Key existe?', !!process.env.GEMINI_API_KEY);

// Verificar se não há espaços extras
const apiKey = process.env.GEMINI_API_KEY?.trim();
```

#### Erro: "Quota exceeded"
```javascript
// Implementar retry com backoff exponencial
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

#### Erro: "Response blocked by safety filters"
```javascript
// Ajustar safety settings
safetySettings: [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  }
]
```

## Recursos de Referência

- Documentação oficial: https://ai.google.dev/docs
- API Reference: https://ai.google.dev/api
- Models: https://ai.google.dev/models/gemini
- Safety: https://ai.google.dev/docs/safety_setting_gemini
- Pricing: https://ai.google.dev/pricing
