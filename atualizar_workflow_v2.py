#!/usr/bin/env python3
"""
Script para atualizar o workflow NutriBuddy - VERSÃO CONCISA E NATURAL
"""

import json

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
        
        # Novo código CONCISO e NATURAL
        novo_codigo = '''// Dados da mensagem
const currentItem = $('1. Validar e Processar').first().json;
const conversation = $('3. Buscar Conversa').first().json;
const history = $('4. Buscar Histórico').first().json.messages || [];
const dietPlan = $('5. Buscar Dieta do Paciente').first().json || {};

// Histórico formatado
const formattedHistory = history
  .slice(-5)
  .map(msg => `${msg.senderRole === 'patient' ? 'Paciente' : 'Você'}: ${msg.content}`)
  .join('\\n');

// Formatar dieta
const dietInfo = dietPlan.meals ? 
  dietPlan.meals.map(meal => 
    `${meal.name} (${meal.time}): ${meal.foods.map(f => f.name).join(', ')}`
  ).join('\\n') : 
  'Sem dieta cadastrada';

const hasDiet = dietPlan.meals && dietPlan.meals.length > 0;

// PROMPT CONCISO E NATURAL
const context = `Você é nutricionista assistente do ${conversation.patientName || 'paciente'}.

DIETA ATUAL:
${dietInfo}

METAS DIÁRIAS: ${dietPlan.macros?.protein || 0}g proteína, ${dietPlan.macros?.carbs || 0}g carbo, ${dietPlan.macros?.fats || 0}g gordura, ${dietPlan.macros?.calories || 0}kcal

CONVERSA RECENTE:
${formattedHistory || 'Primeira mensagem'}

MENSAGEM: "${currentItem.content}"

INSTRUÇÕES:
- Responda como se fosse o próprio nutricionista (não mencione que é IA)
- Seja direto e conciso (máximo 100 palavras)
- Use linguagem natural e amigável
- ${hasDiet ? 'Se perguntar sobre alimento: diga se está na dieta e porquê' : 'Informe que ainda não tem dieta cadastrada'}
- Se for urgência médica (tontura, dor, vômito): marque urgencia "alta"
- Não use emojis em excesso (máximo 1)

RESPONDA APENAS EM JSON:
{
  "urgencia": "baixa|media|alta",
  "sentimento": "positivo|neutro|negativo",
  "categoria": "duvida_alimentacao|relato_progresso|dificuldade|urgencia_saude",
  "deve_responder": true,
  "resposta": "sua resposta direta aqui"
}`;

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
        print("   ✅ Prompt atualizado: CONCISO e NATURAL")
    
    # Remover credenciais problemáticas
    if node['name'] in ['7. Análise IA (OpenAI)', '10a. IA Gera Resposta']:
        print(f"\n🔧 Atualizando nó: {node['name']}")
        if 'credentials' in node:
            del node['credentials']
            print("   ✅ Credencial removida")

# Atualizar nome
workflow['name'] = "🚀 Chat IA - NutriBuddy (PRODUÇÃO - v3 Concisa)"

# Salvar
with open('/home/ubuntu/workflow_nutribuddy_final.json', 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2, ensure_ascii=False)

print("\n" + "="*60)
print("✅ WORKFLOW ATUALIZADO - VERSÃO CONCISA E NATURAL!")
print("="*60)
print(f"\n📁 Arquivo: workflow_nutribuddy_final.json")
print(f"📊 Total de nós: {len(workflow['nodes'])}")
print("\n🎯 Características da IA:")
print("   ✅ Respostas curtas e diretas (máx 100 palavras)")
print("   ✅ Linguagem natural, não robótica")
print("   ✅ Não menciona que é IA")
print("   ✅ Tom de nutricionista humano")
print("   ✅ Sem emojis excessivos")
print("\n" + "="*60)
