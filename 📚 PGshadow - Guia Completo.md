# 📚 PGshadow - Guia Completo

Sistema independente de base de conhecimento profissional com processamento automático via IA.

---

## 🎯 O Que É o PGshadow?

PGshadow é um sistema standalone que permite você:

1. **Armazenar** suas consultas profissionais (perguntas e respostas)
2. **Processar** transcrições automaticamente com IA
3. **Buscar** conhecimento similar rapidamente
4. **Integrar** com outros projetos via API

---

## 🚀 Como Usar

### 1. Interface Web

Acesse o sistema pelo navegador e faça login.

#### **Dashboard**
- Visualize estatísticas gerais
- Acesse ações rápidas
- Veja consultas recentes

#### **Upload de Transcrições**
1. Clique em "Upload"
2. Selecione arquivo .txt com transcrição da consulta
3. Sistema processa automaticamente e extrai Q&A

#### **Gerenciar Consultas**
- Visualize todas as consultas
- Edite perguntas e respostas
- Adicione categorias e tags
- Exclua entradas (soft delete)

#### **Buscar**
- Digite palavras-chave
- Sistema busca em perguntas e respostas
- Resultados ordenados por relevância

#### **Categorias**
- Crie categorias personalizadas
- Organize suas consultas
- Defina cores para identificação visual

---

### 2. Processamento via Email

Configure um email dedicado que envia automaticamente para o PGshadow.

#### **Configuração no n8n:**

1. Importe o workflow `workflow_pgshadow_email.json`
2. Configure credenciais IMAP do email
3. Defina variáveis de ambiente:
   - `PGSHADOW_URL`: URL do seu PGshadow (ex: https://pgshadow.manus.space)
   - `PGSHADOW_USER_ID`: Seu ID de usuário

4. Ative o workflow

#### **Como Funciona:**

```
Email recebido
    ↓
n8n detecta novo email
    ↓
Extrai: assunto, corpo, remetente
    ↓
Envia para PGshadow API
    ↓
IA processa e extrai Q&A
    ↓
Salva automaticamente no banco
```

#### **Exemplo de Email:**

```
Para: consultas@seudominio.com
Assunto: Consulta - Dúvida sobre doces

Paciente perguntou se pode comer doce.

Respondi que doces não estão no plano porque estamos
priorizando alimentos que ajudam nas metas de 1790kcal.
Sugeri aproveitar a banana do lanche que é naturalmente
doce e traz fibras.
```

---

### 3. API Pública

Use o PGshadow em outros projetos via API.

#### **Endpoints Disponíveis:**

##### **1. Buscar Conhecimento**
```http
GET /api/trpc/api.search?input={"query":"posso comer doce","userId":1,"limit":10}
```

**Resposta:**
```json
{
  "result": {
    "data": [
      {
        "id": 1,
        "question": "Posso comer doce?",
        "answer": "Doces não estão no plano...",
        "category": "duvida_alimentacao",
        "tags": ["doce", "carboidrato"]
      }
    ]
  }
}
```

##### **2. Adicionar Entrada**
```http
POST /api/trpc/api.addEntry
Content-Type: application/json

{
  "userId": 1,
  "question": "Posso substituir brócolis?",
  "answer": "Sim, pode substituir por couve-flor...",
  "category": "substituicao",
  "tags": ["vegetais", "substituicao"]
}
```

##### **3. Processar Email**
```http
POST /api/trpc/api.processEmail
Content-Type: application/json

{
  "userId": 1,
  "subject": "Consulta sobre doces",
  "body": "Paciente perguntou...",
  "from": "paciente@email.com"
}
```

---

### 4. Integração com Workflows n8n

#### **Workflow de Integração Genérica**

Importe `workflow_pgshadow_integration.json` para criar um webhook que:

- Recebe requisições de outros projetos
- Busca ou adiciona conhecimento
- Retorna resultados via webhook

**Exemplo de Uso:**

```javascript
// De qualquer projeto, chame:
const response = await fetch('https://seu-n8n.com/webhook/pgshadow-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'search',
    query: 'posso comer doce',
    userId: 1,
    limit: 5
  })
});

const results = await response.json();
```

#### **Workflow NutriBuddy Integrado**

Importe `workflow_nutribuddy_com_pgshadow.json` para:

1. Receber mensagem do paciente
2. Buscar consultas similares no PGshadow
3. Usar como contexto para IA
4. Gerar resposta personalizada

**Fluxo:**

```
Mensagem do paciente
    ↓
Busca 3 consultas similares no PGshadow
    ↓
Constrói contexto com:
  - Dieta do paciente
  - Suas consultas anteriores similares
  - Mensagem atual
    ↓
IA gera resposta usando SEU conhecimento
    ↓
Responde ao paciente
```

---

## 🔧 Variáveis de Ambiente

Configure estas variáveis no n8n:

```env
# URL do PGshadow
PGSHADOW_URL=https://pgshadow.manus.space

# Seu ID de usuário no PGshadow
PGSHADOW_USER_ID=1
```

---

## 📊 Casos de Uso

### **1. Nutricionista**
- Armazena respostas comuns sobre dietas
- Processa transcrições de consultas
- IA usa conhecimento real nas respostas

### **2. Médico**
- Base de conhecimento de diagnósticos
- Consultas anteriores similares
- Padronização de orientações

### **3. Consultor**
- Biblioteca de soluções
- Respostas a clientes
- Conhecimento organizacional

### **4. Educador**
- Banco de perguntas frequentes
- Respostas padronizadas
- Material de referência

---

## 🎯 Benefícios

✅ **Consistência** - Respostas baseadas no SEU conhecimento real  
✅ **Escalabilidade** - Reutilize em múltiplos projetos  
✅ **Automação** - Processamento via email ou API  
✅ **Inteligência** - IA aprende com suas consultas  
✅ **Organização** - Categorias, tags, busca  
✅ **Independência** - Sistema standalone, não depende de outros projetos  

---

## 🔐 Segurança

- Autenticação via Manus OAuth
- Dados isolados por usuário
- API pública requer userId
- Soft delete (dados nunca são perdidos)

---

## 📈 Roadmap

- [ ] Sistema de confirmação por email
- [ ] API com autenticação via token
- [ ] Exportação de dados (JSON, CSV)
- [ ] Importação em massa
- [ ] Busca por similaridade semântica (embeddings)
- [ ] Sugestões automáticas de categorias
- [ ] Analytics e insights

---

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Teste os workflows de exemplo
3. Consulte os logs do n8n
4. Entre em contato com suporte

---

**Desenvolvido com ❤️ para profissionais que valorizam seu conhecimento**
