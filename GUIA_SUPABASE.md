# Guia de Configuração Supabase - PGshadow

## 📋 Passo a Passo

### 1. Criar Projeto no Supabase

✅ Já feito! Você criou o projeto "PGShadow" em South America (São Paulo)

### 2. Pegar Connection String

1. No Supabase, vá em **Settings** → **Database**
2. Procure por **Connection String**
3. Selecione o modo **URI** (não Pooler)
4. Copie a string completa

Vai ser algo assim:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@db.xxx.supabase.com:5432/postgres
```

### 3. Configurar no Projeto

Após pegar a Connection String, vou configurar automaticamente no sistema.

### 4. Aplicar Migrações

Vou rodar o comando para criar as tabelas:
```bash
pnpm db:push
```

Isso vai criar 4 tabelas:
- `users` - Usuários do sistema
- `knowledge_entries` - Consultas (Q&A)
- `categories` - Categorias
- `transcriptions` - Transcrições enviadas

### 5. Adicionar Índices Full-Text (Opcional)

Para busca super rápida, vou adicionar índices especializados:

```sql
-- Índice full-text para busca em português
CREATE INDEX idx_knowledge_search 
ON knowledge_entries 
USING GIN (to_tsvector('portuguese', question || ' ' || answer));

-- Índice para busca por usuário
CREATE INDEX idx_knowledge_user ON knowledge_entries(userId);

-- Índice para busca por categoria
CREATE INDEX idx_knowledge_category ON knowledge_entries(category);
```

## 🚀 Após Configuração

O sistema estará pronto para:
- ✅ Armazenar consultas
- ✅ Busca ultra-rápida (10-30ms)
- ✅ Processamento de transcrições
- ✅ API pública para integração

## 📊 Monitoramento

No Supabase você pode:
- Ver todas as tabelas em **Table Editor**
- Executar queries SQL em **SQL Editor**
- Monitorar performance em **Database** → **Performance**
- Ver logs em **Logs**

## 🔒 Segurança

- ✅ Conexão SSL automática
- ✅ Senha forte gerada pelo Supabase
- ✅ Firewall configurado
- ✅ Backups automáticos

---

**Aguardando a Connection String para continuar!** 🎯
