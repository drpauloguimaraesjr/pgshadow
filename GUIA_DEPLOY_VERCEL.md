# Guia de Deploy - PGshadow no Vercel

## ⚠️ Importante: Limitação do Vercel

O Vercel tem uma limitação importante para este projeto:

**Vercel Serverless Functions têm timeout de 10 segundos no plano grátis.**

Para o PGshadow funcionar completamente (processamento de transcrições com IA pode levar mais tempo), você tem 2 opções:

---

## 🎯 Opção 1: Deploy Completo no Railway (Recomendado)

**Vantagens:**
- ✅ Sem limite de timeout
- ✅ Backend + Frontend juntos
- ✅ Mais simples de configurar
- ✅ Custo: ~$5-10/mês

**Como fazer:**
1. Criar conta no Railway: https://railway.app
2. Conectar GitHub
3. Fazer push do código
4. Railway detecta automaticamente e faz deploy

---

## 🎯 Opção 2: Vercel (Frontend) + Railway (Backend)

**Vantagens:**
- ✅ Usa sua conta Vercel
- ✅ Frontend super rápido no Vercel
- ✅ Backend sem limites no Railway

**Desvantagens:**
- ❌ Precisa gerenciar 2 serviços
- ❌ Configuração mais complexa

### Passo a Passo:

#### 1. Deploy Backend no Railway

```bash
# Criar railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/api/health"
```

#### 2. Deploy Frontend no Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Na pasta do projeto
vercel

# Seguir instruções
```

#### 3. Configurar Variáveis

**No Railway (Backend):**
- `DATABASE_URL` - Connection string do Supabase
- Todas as outras variáveis Manus

**No Vercel (Frontend):**
- `VITE_API_URL` - URL do backend no Railway
- Variáveis VITE_* do Manus

---

## 🚀 Opção 3: Render (Alternativa Gratuita)

**Vantagens:**
- ✅ Plano grátis generoso
- ✅ Sem timeout nas APIs
- ✅ Tudo junto (como Railway)

**Desvantagens:**
- ❌ Servidor "hiberna" após inatividade (primeiro acesso lento)

### Como fazer:

1. Criar conta: https://render.com
2. New → Web Service
3. Conectar GitHub
4. Configurar:
   - Build: `pnpm build`
   - Start: `pnpm start`
   - Adicionar variáveis de ambiente

---

## 💡 Minha Recomendação

**Para você começar:**

### **Railway (Opção 1)** ⭐

**Por quê:**
1. Mais simples (tudo em um lugar)
2. Sem limitações de timeout
3. Fácil de escalar depois
4. $5/mês é muito barato para o que oferece

---

## 📋 Checklist Pré-Deploy

Antes de fazer deploy em qualquer plataforma:

- [ ] Connection String do Supabase configurada
- [ ] Rodar `pnpm db:push` localmente para criar tabelas
- [ ] Testar localmente com `pnpm dev`
- [ ] Fazer commit de todas as mudanças
- [ ] Push para GitHub

---

## 🔐 Variáveis de Ambiente Necessárias

```bash
# Banco de Dados
DATABASE_URL=postgresql://...

# Manus OAuth (copiar do ambiente atual)
JWT_SECRET=
OAUTH_SERVER_URL=
VITE_APP_ID=
VITE_OAUTH_PORTAL_URL=
OWNER_OPEN_ID=
OWNER_NAME=

# Manus APIs (copiar do ambiente atual)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_KEY=
VITE_FRONTEND_FORGE_API_URL=

# Analytics (copiar do ambiente atual)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
VITE_APP_LOGO=
VITE_APP_TITLE=PGshadow
```

---

**Qual opção você prefere? Posso te ajudar com qualquer uma!** 🚀
