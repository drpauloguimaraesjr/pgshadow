# 🚀 Guia Completo: Resolver Problema de Credenciais OpenAI + Melhorar Raciocínio da IA

## 📋 Problema Identificado

**Erro:** `Credentials could not be decrypted. The likely reason is that a different "encryptionKey" was used to encrypt the data.`

**Causa:** As credenciais do OpenAI foram criptografadas com uma chave diferente da atual no n8n (comum após migração, backup/restore ou mudança de ambiente).

---

## ✅ Solução 1: Reconfigurar Credenciais (Mais Simples)

### Passo a Passo:

1. **Ir em Credentials no n8n**
   - Menu lateral → Credentials
   - Procurar por "OpenAI account 4" (ID: `z0yk9XmZziIdGBaN`)

2. **Criar Nova Credencial**
   - Clicar em "+ Add Credential"
   - Selecionar "OpenAI API"
   - Nome: `OpenAI NutriBuddy`
   - API Key: Cole sua chave da OpenAI

3. **Atualizar o Nó**
   - Abrir o nó "7. Análise IA (OpenAI)"
   - Na seção "Credentials", selecionar a nova credencial criada
   - Salvar o workflow

---

## ✅ Solução 2: Usar HTTP Request (Mais Controle)

### Vantagens:
- ✅ Não depende de credenciais criptografadas do n8n
- ✅ Mais controle sobre parâmetros da API
- ✅ Funciona mesmo com problemas de encryptionKey
- ✅ Permite usar modelos mais recentes

### Implementação:

**Substituir o nó "7. Análise IA (OpenAI)" por:**

```json
{
  "name": "7. Análise IA (HTTP Request)",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.openai.com/v1/chat/completions",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer SUA_CHAVE_OPENAI_AQUI"
        }
      ]
    },
    "sendBody": true,
    "contentType": "json",
    "specifyBody": "json",
    "jsonBody": "={{ \n  JSON.stringify({\n    \"model\": \"gpt-4o\",\n    \"messages\": [\n      {\n        \"role\": \"system\",\n        \"content\": \"Você é um assistente nutricional especializado do NutriBuddy. Analise mensagens de pacientes e forneça respostas em JSON.\"\n      },\n      {\n        \"role\": \"user\",\n        \"content\": $json.context\n      }\n    ],\n    \"max_tokens\": 500,\n    \"temperature\": 0.7\n  })\n}}",
    "options": {}
  }
}
```

**Atualizar o nó "8. Parse Análise IA":**

```javascript
// Parse resposta da IA via HTTP Request
const currentItem = $('6. Construir Contexto IA').first().json;
const httpResponse = $input.first().json;

// Extrair conteúdo da resposta OpenAI
const aiResponse = httpResponse.choices?.[0]?.message?.content || '{}';

console.log('=== RESPOSTA IA (HTTP) ===');
console.log(aiResponse);

let parsed;
try {
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    parsed = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error('JSON não encontrado');
  }
} catch (error) {
  console.error('Erro ao fazer parse:', error);
  parsed = {
    urgencia: 'baixa',
    sentimento: 'neutro',
    categoria: 'duvida_alimentacao',
    deve_responder: true,
    resposta: aiResponse
  };
}

return {
  json: {
    ...currentItem,
    urgencia: parsed.urgencia || 'baixa',
    sentimento: parsed.sentimento || 'neutro',
    categoria: parsed.categoria || 'duvida_alimentacao',
    deve_responder: parsed.deve_responder !== false,
    resposta: parsed.resposta || aiResponse
  }
};
```

---

## 🧠 Como Melhorar o Raciocínio/Conhecimento da IA

### 1. **Melhorar o Prompt no Nó "6. Construir Contexto IA"**

Atualmente o contexto está genérico. Veja como melhorar:

#### **Versão Atual (Limitada):**
```
Você é um assistente nutricional inteligente do NutriBuddy.
```

#### **Versão Melhorada (Mais Específica):**

```javascript
const context = `
Você é a NutriBuddy AI, assistente nutricional especializada em:
- Análise de aderência a planos alimentares prescritos
- Educação nutricional baseada em evidências científicas
- Suporte motivacional para mudança de hábitos alimentares
- Identificação de situações que requerem atenção do nutricionista

CONTEXTO DO PACIENTE:
Nome: ${conversation.patientName || 'Paciente'}
ID: ${currentItem.patientId}

PLANO ALIMENTAR PRESCRITO:
${dietInfo}

META DIÁRIA DE MACRONUTRIENTES:
- Proteínas: ${dietPlan.macros?.protein || 'N/A'}g
- Carboidratos: ${dietPlan.macros?.carbs || 'N/A'}g
- Gorduras: ${dietPlan.macros?.fats || 'N/A'}g
- Calorias: ${dietPlan.macros?.calories || 'N/A'}kcal

HISTÓRICO RECENTE DA CONVERSA:
${formattedHistory}

MENSAGEM ATUAL DO PACIENTE:
"${currentItem.content}"

DIRETRIZES DE RESPOSTA:

1. **ADERÊNCIA À DIETA PRESCRITA**
   - Se o alimento/refeição ESTÁ no plano → Confirme, elogie e reforce benefícios
   - Se NÃO está no plano → Explique gentilmente o motivo e sugira alternativas do plano
   - Seja específico sobre porções, horários e preparações

2. **TOM E ABORDAGEM**
   - Use linguagem acolhedora, empática e motivacional
   - Evite julgamentos ou tom autoritário
   - Celebre pequenas vitórias e progressos
   - Reconheça dificuldades sem minimizá-las

3. **EDUCAÇÃO NUTRICIONAL**
   - Explique BREVEMENTE o "porquê" das recomendações
   - Relacione alimentos com os objetivos do paciente
   - Use analogias simples quando necessário

4. **IDENTIFICAÇÃO DE URGÊNCIAS**
   - Sintomas físicos graves → urgencia: "alta"
   - Dificuldades emocionais significativas → urgencia: "media"
   - Dúvidas normais → urgencia: "baixa"

5. **LIMITES DE ATUAÇÃO**
   - NÃO prescreva dietas ou faça mudanças no plano
   - NÃO diagnostique condições médicas
   - Encaminhe ao nutricionista quando necessário

FORMATO DE RESPOSTA (JSON VÁLIDO):
{
  "urgencia": "baixa|media|alta",
  "sentimento": "positivo|neutro|negativo|preocupado|ansioso",
  "categoria": "duvida_alimentacao|relato_progresso|dificuldade|urgencia_saude|solicitacao_mudanca",
  "deve_responder": true,
  "resposta": "Sua resposta aqui (máximo 200 palavras, tom acolhedor e educativo)"
}

EXEMPLO DE BOA RESPOSTA:
{
  "urgencia": "baixa",
  "sentimento": "positivo",
  "categoria": "duvida_alimentacao",
  "deve_responder": true,
  "resposta": "Que legal que você está pensando em suas escolhas alimentares! 🌟 Sobre o doce: no seu plano atual não há doces incluídos, pois estamos priorizando alimentos que ajudam você a atingir suas metas de ${dietPlan.macros?.calories}kcal com equilíbrio de macronutrientes. No entanto, você pode aproveitar a banana do seu lanche (já inclusa no plano!) que é naturalmente doce e traz fibras e potássio. Se a vontade de doce persistir, vale conversar com seu nutricionista sobre incluir alguma opção estratégica no plano. Você está indo muito bem! 💪"
}
`;
```

### 2. **Adicionar Sistema de Memória de Contexto**

Criar um nó que armazena informações importantes sobre o paciente:

```javascript
// Nó: "Enriquecer Contexto com Memória"
const currentItem = $input.first().json;

// Buscar informações adicionais que podem ajudar
const patientContext = {
  objetivos: "Emagrecimento saudável", // Buscar do banco
  restricoes: [], // Alergias, intolerâncias
  preferencias: [], // Alimentos favoritos
  historico_dificuldades: [] // Padrões identificados
};

return {
  json: {
    ...currentItem,
    patientContext
  }
};
```

### 3. **Usar Modelos Mais Avançados**

Se estiver usando HTTP Request, pode testar:
- `gpt-4o` (atual, bom custo-benefício)
- `gpt-4-turbo` (mais rápido)
- `gpt-4` (mais preciso, mais caro)

### 4. **Ajustar Temperatura e Tokens**

```json
{
  "temperature": 0.7,  // 0.7 = equilibrado | 0.3 = mais focado | 0.9 = mais criativo
  "max_tokens": 500,   // Aumentar para 800 se precisar respostas mais completas
  "top_p": 0.9         // Adicionar para mais consistência
}
```

### 5. **Adicionar Exemplos Few-Shot no Prompt**

Incluir exemplos de boas respostas no contexto ajuda a IA a entender o padrão:

```javascript
const fewShotExamples = `
EXEMPLOS DE RESPOSTAS IDEAIS:

Exemplo 1 - Dúvida sobre alimento não permitido:
Paciente: "Posso comer pizza?"
Resposta: {
  "urgencia": "baixa",
  "sentimento": "neutro",
  "categoria": "duvida_alimentacao",
  "deve_responder": true,
  "resposta": "Entendo a vontade de pizza! No seu plano atual, não temos pizza incluída porque estamos focando em alimentos que te ajudam a atingir ${calorias}kcal de forma equilibrada. Mas você pode criar uma 'pizza fit' em casa usando pão integral do seu café da manhã como base, com frango desfiado do almoço e vegetais! Ou podemos conversar com seu nutricionista sobre incluir uma refeição livre estratégica. O que acha?"
}

Exemplo 2 - Relato de progresso:
Paciente: "Consegui comer tudo certinho hoje!"
Resposta: {
  "urgencia": "baixa",
  "sentimento": "positivo",
  "categoria": "relato_progresso",
  "deve_responder": true,
  "resposta": "Que conquista incrível! 🎉 Seguir o plano alimentar certinho mostra seu comprometimento com seus objetivos. Cada dia de aderência é um passo importante para resultados duradouros. Continue assim e não esqueça de beber bastante água (você tem 2.100ml distribuídos no dia). Estou aqui para te apoiar sempre! 💪"
}
`;

// Adicionar ao contexto
const context = `${fewShotExamples}\n\n${restoDoConte\u00fado}`;
```

---

## 🎯 Checklist de Implementação

- [ ] Resolver problema de credenciais (Solução 1 ou 2)
- [ ] Melhorar prompt do nó "6. Construir Contexto IA"
- [ ] Adicionar exemplos few-shot
- [ ] Ajustar temperatura e max_tokens
- [ ] Testar com mensagens reais
- [ ] Monitorar qualidade das respostas
- [ ] Iterar e refinar baseado no feedback

---

## 🔧 Testando as Mudanças

1. **Teste Manual:**
   - Enviar mensagem de teste via webhook
   - Verificar logs do nó "8. Parse Análise IA"
   - Avaliar qualidade da resposta

2. **Mensagens de Teste Sugeridas:**
   ```
   - "Posso comer doce?"
   - "Estou com muita fome entre as refeições"
   - "Consegui seguir a dieta hoje!"
   - "Não gosto de brócolis, posso trocar?"
   - "Estou me sentindo tonto"
   ```

3. **Métricas de Qualidade:**
   - ✅ Resposta está em JSON válido?
   - ✅ Tom é acolhedor e educativo?
   - ✅ Referencia o plano alimentar do paciente?
   - ✅ Classifica urgência corretamente?
   - ✅ Respeita limites de atuação?

---

## 📚 Recursos Adicionais

- [Documentação OpenAI API](https://platform.openai.com/docs/api-reference)
- [Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

---

## 💡 Dicas Finais

1. **Itere Gradualmente:** Faça uma mudança por vez e teste
2. **Monitore Custos:** Respostas mais longas = mais tokens = mais custo
3. **Colete Feedback:** Peça aos nutricionistas/pacientes opinião sobre as respostas
4. **Versione o Workflow:** Duplique antes de fazer mudanças grandes
5. **Use Variáveis de Ambiente:** Para API keys e configurações sensíveis

---

**Precisa de ajuda com alguma etapa específica? Estou aqui! 🚀**
