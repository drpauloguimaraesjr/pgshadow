# Guia: Integração Plaud Note → PGShadow via Zapier

## Passo 1: Gerar API Key no PGShadow

1. Acesse: https://pgshadow.vercel.app/settings
2. Faça login com Google
3. Na seção "Chaves de API":
   - Nome: "Zapier Plaud"
   - Clique em "Gerar Nova Chave"
   - **COPIE A CHAVE AGORA** (você não poderá vê-la novamente!)

## Passo 2: Configurar Zapier

### Trigger (Gatilho)
- **App:** Plaud Note
- **Event:** New Transcription (ou similar)

### Action (Ação)
- **App:** Webhooks by Zapier
- **Event:** POST

### Configuração do Webhook

**URL:**
```
https://pgshadow-production.up.railway.app/api/external/ingest
```

**Headers:**
```
Content-Type: application/json
X-API-KEY: <cole-sua-chave-aqui>
```

**Body (Data):**
```json
{
  "question": "Transcrição Plaud: {{title}}",
  "answer": "{{transcription_text}}",
  "category": "Plaud",
  "tags": ["plaud", "transcricao"],
  "source": "zapier-{{id}}"
}
```

**Nota:** Ajuste os campos `{{title}}` e `{{transcription_text}}` de acordo com os dados que o Plaud Note fornece no Zapier.

## Passo 3: Testar

1. No Zapier, clique em "Test Action"
2. Verifique se retorna `{"success": true, "id": ...}`
3. Acesse https://pgshadow.vercel.app/knowledge para ver a entrada criada

## Detecção Automática de Aulas de Inglês

O sistema já detecta automaticamente se é aula de inglês pelos seguintes critérios:
- Nome do arquivo contém: "english", "inglês", "lesson", "teacher", "student"
- Conteúdo contém essas palavras nos primeiros 500 caracteres

**Aulas de inglês são salvas sem processamento**, apenas como texto completo.

## Processamento Personalizado

Para usar seu prompt específico do AAInclusive:
1. Acesse https://pgshadow.vercel.app/settings
2. (Em breve) Seção "Templates de Prompts"
3. Crie um template com seu prompt customizado
4. Defina como padrão para categoria "medical"

## Troubleshooting

**Erro 401:** Chave de API inválida ou ausente
**Erro 400:** Campos obrigatórios faltando (question, answer)
**Erro 503:** Banco de dados indisponível

## Suporte

Qualquer dúvida, verifique os logs no Railway:
https://railway.app/project/8b45acd7-7264-4697-b093-802f9a022db6
