# PGShadow - Deploy Guide

## 🚀 Deploy Rápido (Vercel + Railway + Supabase)

### 1️⃣ Supabase (Banco de Dados PostgreSQL)

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **SQL Editor** e execute o schema (veja `supabase-schema.sql`)
3. Copie a **Connection String** em Settings > Database > Connection String (URI)
4. Guarde essa URL, você vai precisar dela

### 2️⃣ Railway (Backend API)

1. Acesse [railway.app](https://railway.app)
2. Clique em **New Project** > **Deploy from GitHub repo**
3. Conecte este repositório
4. Configure as variáveis de ambiente:
   ```
   DATABASE_URL=sua_connection_string_do_supabase
   OWNER_OPEN_ID=admin
   PORT=3000
   ```
5. Railway vai detectar automaticamente o `package.json` e fazer deploy
6. Copie a URL pública do seu backend (ex: `https://seu-app.railway.app`)

### 3️⃣ Vercel (Frontend)

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New** > **Project**
3. Importe este repositório do GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Adicione variável de ambiente:
   ```
   VITE_API_URL=https://seu-app.railway.app
   ```
6. Deploy! 🎉

### 4️⃣ Conectar Frontend ao Backend

Após o deploy, atualize a URL da API no frontend (arquivo `src/lib/trpc.ts`)

## 📝 Checklist

- [ ] Criar projeto no Supabase
- [ ] Executar schema SQL no Supabase
- [ ] Deploy do backend no Railway
- [ ] Configurar variáveis de ambiente no Railway
- [ ] Deploy do frontend na Vercel
- [ ] Testar a aplicação

## 🔧 Troubleshooting

**Erro de CORS?**
- Adicione as origens permitidas no Railway (variável `ALLOWED_ORIGINS`)

**Banco não conecta?**
- Verifique se a connection string do Supabase está correta
- Certifique-se de usar a string com `?sslmode=require`

**Build falha na Vercel?**
- Verifique se todas as dependências estão no `package.json`
- Rode `npm run build` localmente primeiro
