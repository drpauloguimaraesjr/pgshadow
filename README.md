# PGShadow - Sistema de Base de Conhecimento

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/pgshadow
OWNER_OPEN_ID=admin
```

### 2. Banco de Dados

Execute o SQL em `schema_banco_dados.sql` no seu MySQL para criar as tabelas.

### 3. Instalar Dependências

```bash
npm install
```

### 4. Rodar o Projeto

**Desenvolvimento (Frontend + Backend):**
```bash
npm run dev
```

O servidor estará em `http://localhost:3000`

## Estrutura do Projeto

```
PGShadow/
├── src/                    # Frontend React
│   ├── pages/             # Páginas da aplicação
│   ├── components/        # Componentes reutilizáveis
│   ├── lib/               # Utilitários e configurações
│   └── hooks/             # React hooks customizados
├── server/                # Backend Node.js
│   ├── _core/            # Configurações do servidor
│   ├── routers.ts        # Rotas tRPC
│   ├── db.ts             # Queries do banco
│   └── schema.ts         # Schema Drizzle ORM
└── shared/               # Código compartilhado
```

## Funcionalidades

- ✅ Upload de transcrições
- ✅ Extração automática de Q&A com IA
- ✅ Busca inteligente
- ✅ Categorização
- ✅ API pública para integração
- ✅ Webhook para receber dados externos
