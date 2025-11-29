# 📚 Sistema de Base de Conhecimento - Guia Completo

## 🎯 O Que É

Um sistema que permite **você ensinar a IA** com suas próprias consultas e orientações. A IA vai usar suas respostas anteriores como referência para manter consistência.

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│  SEU SISTEMA (Interface Web)                        │
│  - Formulário para cadastrar consultas              │
│  - Lista de consultas cadastradas                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ POST (webhook)
                  ▼
┌─────────────────────────────────────────────────────┐
│  WORKFLOW 1: Cadastrar Base de Conhecimento         │
│  - Valida entrada                                   │
│  - Salva no banco de dados                          │
│  - Retorna confirmação                              │
└─────────────────────────────────────────────────────┘
                  │
                  │ Salva em
                  ▼
┌─────────────────────────────────────────────────────┐
│  BANCO DE DADOS (API NutriBuddy)                    │
│  Tabela: knowledge_base                             │
│  - id, pergunta, resposta, categoria, tags          │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ Busca quando necessário
                  ▼
┌─────────────────────────────────────────────────────┐
│  WORKFLOW 2: Chat IA (Principal)                    │
│  - Recebe mensagem do paciente                      │
│  - Busca consultas similares na base                │
│  - IA usa como referência                           │
│  - Responde com consistência                        │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Passo 1: Criar Endpoint na API

Você precisa criar 2 endpoints na sua API NutriBuddy:

### **Endpoint 1: Salvar Consulta**
```
POST /api/n8n/knowledge-base
Headers: X-Webhook-Secret: nutribuddy-secret-2024
```

**Estrutura do banco:**
```sql
CREATE TABLE knowledge_base (
  id VARCHAR(50) PRIMARY KEY,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  categoria VARCHAR(50),
  tags JSON,
  patient_id VARCHAR(50),
  prescriber_id VARCHAR(50),
  timestamp DATETIME,
  ativo BOOLEAN DEFAULT true
);
```

### **Endpoint 2: Buscar Consultas Similares**
```
GET /api/n8n/knowledge-base/search?query={texto}&limit=3
Headers: X-Webhook-Secret: nutribuddy-secret-2024
```

**Resposta esperada:**
```json
{
  "results": [
    {
      "id": "kb_1234567890",
      "pergunta": "Posso comer doce?",
      "resposta": "Doces não estão no plano porque...",
      "categoria": "duvida_alimentacao",
      "relevance": 0.95
    }
  ]
}
```

**Lógica de busca:**
- Use busca por similaridade (ex: PostgreSQL com pg_trgm)
- Ou busca por palavras-chave
- Retorne as 3 mais relevantes

---

## 📋 Passo 2: Criar Interface no Seu Sistema

### **Formulário de Cadastro**

Crie uma aba no seu sistema admin com este formulário:

```html
<form id="cadastrar-consulta">
  <h2>📚 Cadastrar Consulta de Referência</h2>
  
  <label>Pergunta do Paciente:</label>
  <textarea name="pergunta" required 
    placeholder="Ex: Posso comer doce?"></textarea>
  
  <label>Sua Resposta (será usada como referência):</label>
  <textarea name="resposta" required 
    placeholder="Ex: Doces não estão no plano porque..."></textarea>
  
  <label>Categoria:</label>
  <select name="categoria" required>
    <option value="duvida_alimentacao">Dúvida sobre Alimentação</option>
    <option value="relato_progresso">Relato de Progresso</option>
    <option value="dificuldade">Dificuldade</option>
    <option value="urgencia_saude">Urgência de Saúde</option>
    <option value="substituicao">Substituição de Alimentos</option>
  </select>
  
  <label>Tags (opcional):</label>
  <input type="text" name="tags" 
    placeholder="Ex: doce, carboidrato, vontade">
  
  <button type="submit">Salvar Consulta</button>
</form>
```

### **JavaScript para Enviar**

```javascript
document.getElementById('cadastrar-consulta').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    pergunta: formData.get('pergunta'),
    resposta: formData.get('resposta'),
    categoria: formData.get('categoria'),
    tags: formData.get('tags').split(',').map(t => t.trim()),
    prescriberId: getCurrentUserId() // Seu ID
  };
  
  try {
    const response = await fetch('https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-cadastrar-conhecimento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Consulta cadastrada com sucesso!');
      e.target.reset();
    }
  } catch (error) {
    alert('❌ Erro ao cadastrar consulta');
    console.error(error);
  }
});
```

---

## 📋 Passo 3: Importar Workflows no n8n

### **Workflow 1: Cadastro**
1. Importe `workflow_cadastro_conhecimento.json`
2. Ative o workflow
3. Anote a URL do webhook

### **Workflow 2: Chat Principal**
1. Importe `workflow_nutribuddy_com_kb.json`
2. Adicione credenciais OpenAI
3. Ative o workflow

---

## 🎯 Como Funciona na Prática

### **Exemplo de Uso:**

#### **1. Você cadastra uma consulta:**
```
Pergunta: "Posso comer doce?"
Resposta: "Doces não estão no plano porque estamos focando em alimentos 
          que ajudam nas suas metas. Mas você pode aproveitar a banana 
          do lanche que é naturalmente doce."
Categoria: duvida_alimentacao
Tags: doce, carboidrato, vontade
```

#### **2. Paciente pergunta algo similar:**
```
Paciente: "Posso comer chocolate?"
```

#### **3. Sistema busca na base:**
```
Encontrou: "Posso comer doce?" (95% similar)
```

#### **4. IA usa como referência:**
```
IA: "Chocolate não está no plano porque estamos focando em alimentos 
     que ajudam nas suas metas. Mas você pode aproveitar a banana do 
     lanche que é naturalmente doce e traz fibras."
```

**Resultado:** Resposta consistente com seu estilo!

---

## 📊 Estrutura de Dados Recomendada

### **Campos Obrigatórios:**
- `pergunta` (string): Pergunta do paciente
- `resposta` (string): Sua resposta de referência
- `categoria` (string): Categoria da consulta

### **Campos Opcionais:**
- `tags` (array): Tags para busca
- `patientId` (string): ID do paciente específico
- `prescriberId` (string): Seu ID
- `ativo` (boolean): Se está ativo ou arquivado

---

## 🔍 Melhorando a Busca

### **Opção 1: Busca Simples (Palavras-chave)**
```javascript
// No seu endpoint /search
const query = req.query.query.toLowerCase();
const results = await db.query(`
  SELECT * FROM knowledge_base 
  WHERE LOWER(pergunta) LIKE '%${query}%'
  AND ativo = true
  ORDER BY timestamp DESC
  LIMIT 3
`);
```

### **Opção 2: Busca Avançada (PostgreSQL)**
```sql
-- Instalar extensão
CREATE EXTENSION pg_trgm;

-- Criar índice
CREATE INDEX idx_pergunta_trgm ON knowledge_base 
USING gin (pergunta gin_trgm_ops);

-- Buscar com similaridade
SELECT *, similarity(pergunta, $1) as relevance
FROM knowledge_base
WHERE similarity(pergunta, $1) > 0.3
AND ativo = true
ORDER BY relevance DESC
LIMIT 3;
```

### **Opção 3: Busca com IA (Embeddings)**
- Use OpenAI Embeddings para busca semântica
- Mais preciso mas mais complexo

---

## 📝 Exemplo de Interface Completa

```html
<!DOCTYPE html>
<html>
<head>
  <title>Base de Conhecimento - NutriBuddy</title>
  <style>
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    textarea { width: 100%; min-height: 100px; margin: 10px 0; }
    button { padding: 10px 20px; background: #4CAF50; color: white; }
    .consulta-item { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📚 Base de Conhecimento</h1>
    
    <!-- Formulário de Cadastro -->
    <form id="form-cadastro">
      <h2>Cadastrar Nova Consulta</h2>
      <label>Pergunta:</label>
      <textarea name="pergunta" required></textarea>
      
      <label>Resposta:</label>
      <textarea name="resposta" required></textarea>
      
      <label>Categoria:</label>
      <select name="categoria">
        <option value="duvida_alimentacao">Dúvida Alimentação</option>
        <option value="substituicao">Substituição</option>
        <option value="dificuldade">Dificuldade</option>
      </select>
      
      <button type="submit">Salvar</button>
    </form>
    
    <!-- Lista de Consultas -->
    <div id="lista-consultas">
      <h2>Consultas Cadastradas</h2>
      <div id="consultas"></div>
    </div>
  </div>
  
  <script>
    // Cadastrar
    document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      const response = await fetch('SUA_URL_WEBHOOK_AQUI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: formData.get('pergunta'),
          resposta: formData.get('resposta'),
          categoria: formData.get('categoria')
        })
      });
      
      if (response.ok) {
        alert('✅ Salvo!');
        e.target.reset();
        carregarConsultas();
      }
    });
    
    // Listar
    async function carregarConsultas() {
      const response = await fetch('/api/n8n/knowledge-base');
      const data = await response.json();
      
      const html = data.results.map(c => `
        <div class="consulta-item">
          <strong>P:</strong> ${c.pergunta}<br>
          <strong>R:</strong> ${c.resposta}<br>
          <small>Categoria: ${c.categoria}</small>
        </div>
      `).join('');
      
      document.getElementById('consultas').innerHTML = html;
    }
    
    carregarConsultas();
  </script>
</body>
</html>
```

---

## ✅ Checklist de Implementação

- [ ] Criar tabela `knowledge_base` no banco
- [ ] Criar endpoint POST `/api/n8n/knowledge-base`
- [ ] Criar endpoint GET `/api/n8n/knowledge-base/search`
- [ ] Importar workflow de cadastro no n8n
- [ ] Importar workflow principal atualizado
- [ ] Criar interface no sistema admin
- [ ] Testar cadastro de consulta
- [ ] Testar busca automática
- [ ] Cadastrar primeiras 10-20 consultas comuns

---

## 🎯 Benefícios

✅ **Consistência:** IA responde igual a você  
✅ **Aprendizado:** Sistema melhora com o tempo  
✅ **Controle:** Você define o tom e conteúdo  
✅ **Escalabilidade:** Quanto mais consultas, melhor  
✅ **Personalização:** Cada nutricionista pode ter sua base  

---

**Pronto para implementar! Qualquer dúvida, me avise! 🚀**
