# 🚀 Como Importar o Workflow Atualizado

## 📋 Passo a Passo

### 1️⃣ **Fazer Backup do Workflow Atual** (Importante!)

Antes de importar, faça backup do workflow atual:

1. Abra o workflow atual no n8n
2. Clique nos 3 pontinhos (⋮) no canto superior direito
3. Clique em **"Download"**
4. Salve o arquivo como backup

---

### 2️⃣ **Importar o Novo Workflow**

**Opção A: Substituir o workflow existente**
1. Abra o workflow atual no n8n
2. Clique nos 3 pontinhos (⋮)
3. Clique em **"Import from File"**
4. Selecione o arquivo `workflow_nutribuddy_atualizado.json`
5. Confirme a substituição

**Opção B: Criar como novo workflow (Recomendado para testar)**
1. No n8n, vá em **Workflows**
2. Clique em **"Add workflow"** → **"Import from File"**
3. Selecione o arquivo `workflow_nutribuddy_atualizado.json`
4. Renomeie se desejar (ex: "NutriBuddy - Teste v2")

---

### 3️⃣ **Configurar Credenciais OpenAI** (Obrigatório)

Você precisará adicionar credenciais em **2 nós**:

#### **Nó 7: Análise IA (OpenAI)**
1. Clique no nó **"7. Análise IA (OpenAI)"**
2. Na seção **"Credential to connect with"**
3. Clique em **"Select Credential"**
4. Clique em **"+ Create New Credential"**
5. Tipo: **OpenAI API**
6. Nome: `OpenAI NutriBuddy`
7. **API Key:** Cole sua chave da OpenAI
8. Clique em **"Save"**

#### **Nó 10a: IA Gera Resposta**
1. Clique no nó **"10a. IA Gera Resposta"**
2. Repita o mesmo processo acima
3. Ou selecione a credencial já criada

---

### 4️⃣ **Ativar o Workflow**

1. Clique no botão **"Active"** no canto superior direito
2. O workflow estará pronto para receber mensagens

---

### 5️⃣ **Testar o Workflow**

Envie uma mensagem de teste via webhook ou use o botão **"Test workflow"** no n8n.

**Mensagens sugeridas para teste:**
- "Posso comer doce?"
- "Consegui seguir a dieta hoje!"
- "Estou com tontura"
- "Não gosto de brócolis"

---

## ✅ Checklist de Verificação

Após importar, verifique:

- [ ] Workflow importado com sucesso
- [ ] Credenciais OpenAI configuradas no nó 7
- [ ] Credenciais OpenAI configuradas no nó 10a
- [ ] Workflow ativado
- [ ] Teste enviado e resposta recebida
- [ ] Qualidade da resposta está melhor

---

## 🎯 O Que Foi Melhorado

### **Nó 6: Construir Contexto IA**
✅ Prompt completamente reformulado (50 → 500+ palavras)  
✅ Personalidade clara: "NutriBuddy AI"  
✅ Formatação visual melhorada  
✅ Exemplos few-shot (3 exemplos de respostas ideais)  
✅ Diretrizes específicas para cada situação  
✅ Tratamento de casos sem dieta prescrita  
✅ Tom mais acolhedor e educativo  

### **Nós 7 e 10a: Análise IA**
✅ Credenciais problemáticas removidas  
✅ Pronto para receber novas credenciais  

---

## ⚠️ Problemas Comuns

### **"Credenciais não encontradas"**
- **Solução:** Adicione suas credenciais OpenAI nos nós 7 e 10a

### **"Workflow não ativa"**
- **Solução:** Verifique se o webhook está configurado corretamente

### **"Resposta da IA está estranha"**
- **Solução:** Verifique se o modelo está correto (gpt-4o ou gpt-4o-latest)

---

## 📞 Precisa de Ajuda?

Se encontrar algum problema durante a importação, me avise! Estou aqui para ajudar. 🚀

---

**Boa sorte com o novo workflow! 🎉**
