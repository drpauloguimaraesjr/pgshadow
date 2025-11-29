#!/usr/bin/env python3
"""
Atualizar workflow principal para usar base de conhecimento
"""

import json

# Ler workflow original
with open('/home/ubuntu/workflow_original.json', 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print(f"✅ Workflow carregado: {workflow['name']}")

# Criar novo nó para buscar base de conhecimento
novo_no_buscar_kb = {
    "parameters": {
        "url": "=https://nutribuddy.dog/api/n8n/knowledge-base/search?query={{ encodeURIComponent($('1. Validar e Processar').first().json.content) }}&limit=3",
        "sendHeaders": True,
        "headerParameters": {
            "parameters": [
                {
                    "name": "X-Webhook-Secret",
                    "value": "nutribuddy-secret-2024"
                }
            ]
        },
        "options": {}
    },
    "id": "buscar-conhecimento",
    "name": "4b. Buscar Base de Conhecimento",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [-1632, 128]
}

# Adicionar novo nó
workflow['nodes'].append(novo_no_buscar_kb)

# Atualizar nó "6. Construir Contexto IA"
for node in workflow['nodes']:
    if node['name'] == '6. Construir Contexto IA':
        print(f"\n🔧 Atualizando nó: {node['name']}")
        
        novo_codigo = '''// Dados da mensagem
const currentItem = $('1. Validar e Processar').first().json;
const conversation = $('3. Buscar Conversa').first().json;
const history = $('4. Buscar Histórico').first().json.messages || [];
const dietPlan = $('5. Buscar Dieta do Paciente').first().json || {};

// NOVO: Buscar base de conhecimento
const knowledgeBase = $('4b. Buscar Base de Conhecimento').first().json.results || [];

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

// NOVO: Formatar consultas de referência
const referenceConsults = knowledgeBase.length > 0 ?
  knowledgeBase.map(kb => 
    `P: "${kb.pergunta}"\\nR: "${kb.resposta}"`
  ).join('\\n\\n') :
  'Nenhuma consulta similar encontrada';

// PROMPT COM BASE DE CONHECIMENTO
const context = `Você é nutricionista assistente do ${conversation.patientName || 'paciente'}.

DIETA ATUAL:
${dietInfo}

METAS DIÁRIAS: ${dietPlan.macros?.protein || 0}g proteína, ${dietPlan.macros?.carbs || 0}g carbo, ${dietPlan.macros?.fats || 0}g gordura, ${dietPlan.macros?.calories || 0}kcal

CONSULTAS ANTERIORES SIMILARES (USE COMO REFERÊNCIA):
${referenceConsults}

CONVERSA RECENTE:
${formattedHistory || 'Primeira mensagem'}

MENSAGEM ATUAL: "${currentItem.content}"

INSTRUÇÕES:
- Use as consultas anteriores como referência para manter consistência
- Se houver consulta similar, adapte a resposta mantendo o mesmo estilo
- Responda como nutricionista (não mencione que é IA)
- Seja direto e conciso (máximo 100 palavras)
- ${hasDiet ? 'Se perguntar sobre alimento: diga se está na dieta e porquê' : 'Informe que ainda não tem dieta cadastrada'}
- Se for urgência médica: marque urgencia "alta"
- Máximo 1 emoji

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
    hasDiet,
    knowledgeBaseUsed: knowledgeBase.length > 0
  }
};'''
        
        node['parameters']['jsCode'] = novo_codigo
        print("   ✅ Código atualizado com busca na base de conhecimento")
    
    # Remover credenciais problemáticas
    if node['name'] in ['7. Análise IA (OpenAI)', '10a. IA Gera Resposta']:
        if 'credentials' in node:
            del node['credentials']

# Atualizar conexões para incluir novo nó
for node in workflow['nodes']:
    if node['name'] == '4. Buscar Histórico':
        # Adicionar conexão para o novo nó
        if 'connections' not in workflow:
            workflow['connections'] = {}
        
        # Conectar "4. Buscar Histórico" -> "4b. Buscar Base de Conhecimento"
        workflow['connections']['4. Buscar Histórico'] = {
            "main": [
                [
                    {
                        "node": "5. Buscar Dieta do Paciente",
                        "type": "main",
                        "index": 0
                    },
                    {
                        "node": "4b. Buscar Base de Conhecimento",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        }

# Atualizar nome
workflow['name'] = "🚀 Chat IA - NutriBuddy (PRODUÇÃO - v4 com Base de Conhecimento)"

# Salvar
with open('/home/ubuntu/workflow_nutribuddy_com_kb.json', 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2, ensure_ascii=False)

print("\n" + "="*60)
print("✅ WORKFLOW ATUALIZADO COM BASE DE CONHECIMENTO!")
print("="*60)
print(f"\n📁 Arquivo: workflow_nutribuddy_com_kb.json")
print(f"📊 Total de nós: {len(workflow['nodes'])}")
print("\n🎯 Novos recursos:")
print("   ✅ Busca automática na base de conhecimento")
print("   ✅ IA usa suas consultas como referência")
print("   ✅ Mantém consistência nas respostas")
print("\n" + "="*60)
