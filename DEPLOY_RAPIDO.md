# 🚀 Deploy Rápido - PGShadow

## Passo a Passo (15 minutos)

### 1. Supabase (Banco de Dados) - 5 min

1. Acesse https://supabase.com e faça login
2. Clique em **New Project**
3. Preencha:
   - Nome: `pgshadow`
   - Database Password: (escolha uma senha forte)
   - Region: South America (São Paulo)
4. Aguarde criar (~2 min)
5. Vá em **SQL Editor** (ícone na lateral)
6. Clique em **New Query**
7. Cole TODO o conteúdo do arquivo `supabase-schema.sql`
8. Clique em **Run** (ou F5)
9. Vá em **Settings** > **Database** > **Connection String**
10. Copie a **URI** (formato: `postgresql://postgres:[YOUR-PASSWORD]@...`)
11. ✅ Guarde essa string!

### 2. Railway (Backend) - 5 min

1. Acesse https://railway.app e faça login com GitHub
2. Clique em **New Project**
3. Escolha **Deploy from GitHub repo**
4. Selecione o repositório `PGShadow`
5. Railway vai detectar automaticamente e começar o deploy
6. Clique no serviço criado
7. Vá em **Variables** e adicione:
   ```
   DATABASE_URL=cole_aqui_a_string_do_supabase
   OWNER_OPEN_ID=admin
   PORT=3000
   ```
8. Vá em **Settings** > **Networking** > **Generate Domain**
9. ✅ Copie a URL gerada (ex: `pgshadow-production.up.railway.app`)

### 3. Vercel (Frontend) - 5 min

1. Acesse https://vercel.com e faça login com GitHub
2. Clique em **Add New...** > **Project**
3. Selecione o repositório `PGShadow`
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`
5. Em **Environment Variables**, adicione:
   ```
   VITE_API_URL=https://sua-url-do-railway.railway.app
   ```
6. Clique em **Deploy**
7. Aguarde o build (~2 min)
8. ✅ Pronto! Clique em **Visit** para ver seu app

### 4. Conectar Frontend ao Backend

1. Volte no **Vercel**
2. Vá em **Settings** > **Environment Variables**
3. Edite `VITE_API_URL` e cole a URL do Railway
4. Vá em **Deployments** e clique em **Redeploy**

## ✅ Checklist Final

- [ ] Supabase criado e schema executado
- [ ] Railway com variáveis configuradas
- [ ] Vercel com VITE_API_URL configurada
- [ ] Testar a aplicação acessando a URL da Vercel

## 🐛 Problemas Comuns

**Erro 500 no backend?**
- Verifique se a `DATABASE_URL` está correta no Railway
- Veja os logs em Railway > Deployments > View Logs

**Frontend não conecta?**
- Verifique se `VITE_API_URL` está correta na Vercel
- Certifique-se de que a URL do Railway está acessível

**Banco não conecta?**
- Verifique se executou o SQL no Supabase
- Teste a connection string localmente primeiro

## 📝 Próximos Passos

1. Configure autenticação real (OAuth)
2. Adicione chave de API da OpenAI para processamento de transcrições
3. Configure CORS no Railway se necessário
