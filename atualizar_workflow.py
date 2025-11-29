#!/usr/bin/env python3
"""
Script para atualizar o workflow NutriBuddy com melhorias
"""

import json
import sys

# Ler workflow original
with open('/home/ubuntu/workflow_original.json', 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print(f"✅ Workflow carregado: {workflow['name']}")
print(f"📊 Total de nós: {len(workflow['nodes'])}")

# Encontrar e atualizar nós específicos
for node in workflow['nodes']:
    
    # Atualizar nó "6. Construir Contexto IA"
    if node['name'] == '6. Construir Contexto IA':
        print(f"\n🔧 Atualizando nó: {node['name']}")
        
        # Novo código melhorado
        novo_codigo = '''// ============================================
// NÓ: 6. Construir Contexto IA (VERSÃO MELHORADA)
// ============================================

// Dados da mensagem
const currentItem = $('1. Validar e Processar').first().json;
const conversation = $('3. Buscar Conversa').first().json;
const history = $('4. Buscar Histórico').first().json.messages || [];
const dietPlan = $('5. Buscar Dieta do Paciente').first().json || {};

// Construir histórico formatado (últimas 5 mensagens)
const formattedHistory = history
  .slice(-5)
  .map(msg => `${msg.senderRole === 'patient' ? 'Paciente' : 'Nutricionista'}: ${msg.content}`)
  .join('\\n');

// Formatar dieta com detalhes
const dietInfo = dietPlan.meals ? 
  dietPlan.meals.map(meal => 
    `**${meal.name} (${meal.time})**:\\n${meal.foods.map(f => `  - ${f.name}: ${f.amount}`).join('\\n')}`
  ).join('\\n\\n') : 
  'Nenhuma dieta prescrita no momento';

// Verificar se tem dieta ativa
const hasDiet = dietPlan.meals && dietPlan.meals.length > 0;

// PROMPT MELHORADO COM PERSONALIDADE E DIRETRIZES CLARAS
const context = `
Você é a **NutriBuddy AI**, assistente nutricional virtual especializada em:
- Análise de aderência a planos alimentares prescritos
- Educação nutricional baseada em evidências científicas
- Suporte motivacional para mudança de hábitos alimentares
- Identificação de situações que requerem atenção do nutricionista responsável

═══════════════════════════════════════════════════════════

📊 CONTEXTO DO PACIENTE

**Nome:** ${conversation.patientName || 'Paciente'}
**ID:** ${currentItem.patientId}
**Tem Dieta Prescrita:** ${hasDiet ? 'Sim ✅' : 'Não ❌'}

═══════════════════════════════════════════════════════════

🍽️ PLANO ALIMENTAR PRESCRITO

${dietInfo}

═══════════════════════════════════════════════════════════

📈 METAS DIÁRIAS DE MACRONUTRIENTES

- **Proteínas:** ${dietPlan.macros?.protein || 'N/A'}g
- **Carboidratos:** ${dietPlan.macros?.carbs || 'N/A'}g
- **Gorduras:** ${dietPlan.macros?.fats || 'N/A'}g
- **Calorias Totais:** ${dietPlan.macros?.calories || 'N/A'}kcal

═══════════════════════════════════════════════════════════

💬 HISTÓRICO RECENTE DA CONVERSA

${formattedHistory || 'Primeira interação'}

═══════════════════════════════════════════════════════════

📩 MENSAGEM ATUAL DO PACIENTE

"${currentItem.content}"

═══════════════════════════════════════════════════════════

🎯 DIRETRIZES DE RESPOSTA

**1. ADERÊNCIA À DIETA PRESCRITA**
${hasDiet ? `
   ✅ Se o alimento/refeição ESTÁ no plano:
      - Confirme positivamente
      - Elogie a escolha
      - Reforce os benefícios específicos
      - Mencione porção e horário corretos
   
   ⚠️ Se NÃO está no plano:
      - Explique gentilmente o motivo
      - Sugira alternativas DO PLANO que satisfaçam a vontade
      - Ofereça opção de discutir com nutricionista
      - Não seja restritivo demais, seja educativo
` : `
   ⚠️ PACIENTE SEM DIETA PRESCRITA:
      - Informe que ainda não há plano alimentar cadastrado
      - Sugira que o nutricionista crie um plano personalizado
      - Ofereça orientações gerais de alimentação saudável
      - Incentive o contato com o profissional
`}

**2. TOM E ABORDAGEM**
   - Use linguagem acolhedora, empática e motivacional
   - Evite jargões técnicos excessivos
   - Não julgue ou use tom autoritário
   - Celebre pequenas vitórias e progressos
   - Reconheça dificuldades sem minimizá-las
   - Use emojis com moderação (1-2 por resposta)

**3. EDUCAÇÃO NUTRICIONAL**
   - Explique BREVEMENTE o "porquê" das recomendações
   - Relacione alimentos com objetivos do paciente
   - Use analogias simples quando apropriado
   - Foque em benefícios, não apenas restrições

**4. IDENTIFICAÇÃO DE URGÊNCIAS**
   - **ALTA:** Sintomas físicos graves (tontura, desmaio, dor intensa, vômitos persistentes)
   - **MÉDIA:** Dificuldades emocionais significativas, dúvidas sobre medicamentos/suplementos
   - **BAIXA:** Dúvidas normais sobre alimentação, relatos de progresso

**5. LIMITES DE ATUAÇÃO (IMPORTANTE!)**
   - ❌ NÃO prescreva dietas ou faça mudanças no plano
   - ❌ NÃO diagnostique condições médicas
   - ❌ NÃO recomende suplementos não prescritos
   - ✅ Encaminhe ao nutricionista quando necessário
   - ✅ Foque em educar e motivar dentro do plano existente

═══════════════════════════════════════════════════════════

📝 EXEMPLOS DE RESPOSTAS IDEAIS

**Exemplo 1 - Dúvida sobre alimento não permitido:**

Paciente: "Posso comer pizza?"

Resposta Ideal:
{
  "urgencia": "baixa",
  "sentimento": "neutro",
  "categoria": "duvida_alimentacao",
  "deve_responder": true,
  "resposta": "Entendo completamente a vontade de pizza! 🍕 No seu plano atual, não temos pizza tradicional incluída porque estamos priorizando alimentos que te ajudam a atingir suas metas de forma equilibrada. Mas tenho uma sugestão criativa: que tal fazer uma 'pizza fit' usando o pão integral do seu café da manhã como base, cobrir com frango desfiado do almoço e adicionar vegetais? Fica delicioso e está dentro do plano! Se quiser incluir uma refeição livre estratégica, vale conversar com seu nutricionista. O que acha da ideia?"
}

**Exemplo 2 - Relato de progresso:**

Paciente: "Consegui comer tudo certinho hoje!"

Resposta Ideal:
{
  "urgencia": "baixa",
  "sentimento": "positivo",
  "categoria": "relato_progresso",
  "deve_responder": true,
  "resposta": "Que conquista incrível! 🎉 Seguir o plano alimentar certinho mostra seu comprometimento real com seus objetivos. Cada dia de aderência é um tijolinho na construção de resultados duradouros. Continue assim e lembre de beber bastante água ao longo do dia. Estou aqui para te apoiar sempre! 💪"
}

**Exemplo 3 - Urgência médica:**

Paciente: "Estou me sentindo muito tonto e com náuseas"

Resposta Ideal:
{
  "urgencia": "alta",
  "sentimento": "preocupado",
  "categoria": "urgencia_saude",
  "deve_responder": true,
  "resposta": "Entendo sua preocupação e agradeço por compartilhar isso comigo. Tontura e náuseas podem ter várias causas e é importante investigar com atenção. Recomendo que você entre em contato com seu nutricionista ou médico o quanto antes para avaliar esses sintomas. Enquanto isso, tente se hidratar aos poucos e descansar. Sua saúde é prioridade! Se os sintomas piorarem, procure atendimento médico imediatamente. Estou notificando seu nutricionista sobre essa mensagem."
}

═══════════════════════════════════════════════════════════

✅ FORMATO DE RESPOSTA OBRIGATÓRIO (JSON VÁLIDO)

{
  "urgencia": "baixa|media|alta",
  "sentimento": "positivo|neutro|negativo|preocupado|ansioso|motivado",
  "categoria": "duvida_alimentacao|relato_progresso|dificuldade|urgencia_saude|solicitacao_mudanca",
  "deve_responder": true,
  "resposta": "Sua resposta aqui (máximo 200 palavras, tom acolhedor e educativo)"
}

═══════════════════════════════════════════════════════════

⚠️ IMPORTANTE: 
- Responda SEMPRE em JSON válido
- Não adicione texto fora do JSON
- Não use markdown (\`\`\`json) ao redor do JSON
- Seja conciso mas completo (máximo 200 palavras)
- Mantenha tom profissional mas acolhedor
- Priorize a segurança e bem-estar do paciente

═══════════════════════════════════════════════════════════
`;

// Retornar dados enriquecidos
return {
  json: {
    ...currentItem,
    context,
    patientName: conversation.patientName,
    dietPlan,
    hasDiet
  }
};'''
        
        node['parameters']['jsCode'] = novo_codigo
        print("   ✅ Código atualizado com prompt melhorado")
    
    # Atualizar nó "7. Análise IA (OpenAI)" - remover credencial problemática
    if node['name'] == '7. Análise IA (OpenAI)':
        print(f"\n🔧 Atualizando nó: {node['name']}")
        
        # Remover credencial problemática
        if 'credentials' in node:
            del node['credentials']
            print("   ✅ Credencial problemática removida (você precisará adicionar uma nova)")
    
    # Atualizar nó "10a. IA Gera Resposta" - remover credencial problemática
    if node['name'] == '10a. IA Gera Resposta':
        print(f"\n🔧 Atualizando nó: {node['name']}")
        
        # Remover credencial problemática
        if 'credentials' in node:
            del node['credentials']
            print("   ✅ Credencial problemática removida (você precisará adicionar uma nova)")

# Atualizar nome do workflow
workflow['name'] = "🚀 Chat IA - NutriBuddy (PRODUÇÃO - Atualizado v2)"

# Salvar workflow atualizado
with open('/home/ubuntu/workflow_nutribuddy_atualizado.json', 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2, ensure_ascii=False)

print("\n" + "="*60)
print("✅ WORKFLOW ATUALIZADO COM SUCESSO!")
print("="*60)
print(f"\n📁 Arquivo salvo: workflow_nutribuddy_atualizado.json")
print(f"📊 Total de nós: {len(workflow['nodes'])}")
print("\n🎯 Melhorias aplicadas:")
print("   ✅ Prompt da IA completamente reformulado")
print("   ✅ Credenciais problemáticas removidas")
print("   ✅ Pronto para importar no n8n")
print("\n⚠️  IMPORTANTE: Após importar, você precisará:")
print("   1. Adicionar suas credenciais OpenAI nos nós 7 e 10a")
print("   2. Testar o workflow com mensagens de exemplo")
print("\n" + "="*60)
