// ============================================
// EXEMPLO DE ENDPOINTS PARA API NUTRIBUDDY
// ============================================

const express = require('express');
const router = express.Router();

// Middleware de autenticação
const verificarWebhookSecret = (req, res, next) => {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== 'nutribuddy-secret-2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ============================================
// ENDPOINT 1: SALVAR CONSULTA NA BASE
// ============================================

router.post('/api/n8n/knowledge-base', verificarWebhookSecret, async (req, res) => {
  try {
    const { pergunta, resposta, categoria, tags, patientId, prescriberId } = req.body;
    
    // Validar campos obrigatórios
    if (!pergunta || !resposta || !categoria) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: pergunta, resposta, categoria' 
      });
    }
    
    // Gerar ID único
    const id = `kb_${Date.now()}`;
    
    // Salvar no banco (exemplo com MySQL/MariaDB)
    const query = `
      INSERT INTO knowledge_base 
      (id, pergunta, resposta, categoria, tags, patient_id, prescriber_id, timestamp, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)
    `;
    
    await db.execute(query, [
      id,
      pergunta,
      resposta,
      categoria,
      JSON.stringify(tags || []),
      patientId || null,
      prescriberId || null
    ]);
    
    res.json({
      success: true,
      message: 'Consulta cadastrada com sucesso',
      id: id
    });
    
  } catch (error) {
    console.error('Erro ao salvar consulta:', error);
    res.status(500).json({ 
      error: 'Erro ao salvar consulta',
      details: error.message 
    });
  }
});

// ============================================
// ENDPOINT 2: BUSCAR CONSULTAS SIMILARES
// ============================================

router.get('/api/n8n/knowledge-base/search', verificarWebhookSecret, async (req, res) => {
  try {
    const { query, limit = 3 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Parâmetro query é obrigatório' });
    }
    
    // Opção 1: Busca simples por LIKE (funciona em qualquer banco)
    const sqlQuery = `
      SELECT 
        id,
        pergunta,
        resposta,
        categoria,
        tags,
        timestamp
      FROM knowledge_base
      WHERE LOWER(pergunta) LIKE ?
      AND ativo = true
      ORDER BY timestamp DESC
      LIMIT ?
    `;
    
    const results = await db.execute(sqlQuery, [
      `%${query.toLowerCase()}%`,
      parseInt(limit)
    ]);
    
    // Opção 2: Busca com FULLTEXT (MySQL - mais precisa)
    /*
    const sqlQuery = `
      SELECT 
        id,
        pergunta,
        resposta,
        categoria,
        tags,
        MATCH(pergunta) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM knowledge_base
      WHERE MATCH(pergunta) AGAINST(? IN NATURAL LANGUAGE MODE)
      AND ativo = true
      ORDER BY relevance DESC
      LIMIT ?
    `;
    
    const results = await db.execute(sqlQuery, [query, query, parseInt(limit)]);
    */
    
    // Opção 3: Busca com similaridade (PostgreSQL - mais avançada)
    /*
    const sqlQuery = `
      SELECT 
        id,
        pergunta,
        resposta,
        categoria,
        tags,
        similarity(pergunta, $1) as relevance
      FROM knowledge_base
      WHERE similarity(pergunta, $1) > 0.3
      AND ativo = true
      ORDER BY relevance DESC
      LIMIT $2
    `;
    
    const results = await db.query(sqlQuery, [query, parseInt(limit)]);
    */
    
    res.json({
      success: true,
      query: query,
      results: results
    });
    
  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar consultas',
      details: error.message 
    });
  }
});

// ============================================
// ENDPOINT 3: LISTAR TODAS AS CONSULTAS (OPCIONAL)
// ============================================

router.get('/api/n8n/knowledge-base', verificarWebhookSecret, async (req, res) => {
  try {
    const { prescriberId, categoria, limit = 50 } = req.query;
    
    let query = `
      SELECT 
        id,
        pergunta,
        resposta,
        categoria,
        tags,
        prescriber_id,
        timestamp
      FROM knowledge_base
      WHERE ativo = true
    `;
    
    const params = [];
    
    if (prescriberId) {
      query += ' AND prescriber_id = ?';
      params.push(prescriberId);
    }
    
    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const results = await db.execute(query, params);
    
    res.json({
      success: true,
      total: results.length,
      results: results
    });
    
  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({ 
      error: 'Erro ao listar consultas',
      details: error.message 
    });
  }
});

// ============================================
// ENDPOINT 4: ATUALIZAR CONSULTA (OPCIONAL)
// ============================================

router.put('/api/n8n/knowledge-base/:id', verificarWebhookSecret, async (req, res) => {
  try {
    const { id } = req.params;
    const { pergunta, resposta, categoria, tags, ativo } = req.body;
    
    const query = `
      UPDATE knowledge_base
      SET 
        pergunta = COALESCE(?, pergunta),
        resposta = COALESCE(?, resposta),
        categoria = COALESCE(?, categoria),
        tags = COALESCE(?, tags),
        ativo = COALESCE(?, ativo),
        updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.execute(query, [
      pergunta || null,
      resposta || null,
      categoria || null,
      tags ? JSON.stringify(tags) : null,
      ativo !== undefined ? ativo : null,
      id
    ]);
    
    res.json({
      success: true,
      message: 'Consulta atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar consulta',
      details: error.message 
    });
  }
});

// ============================================
// ENDPOINT 5: DELETAR CONSULTA (SOFT DELETE)
// ============================================

router.delete('/api/n8n/knowledge-base/:id', verificarWebhookSecret, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete (marca como inativo)
    const query = `
      UPDATE knowledge_base
      SET ativo = false, updated_at = NOW()
      WHERE id = ?
    `;
    
    await db.execute(query, [id]);
    
    res.json({
      success: true,
      message: 'Consulta removida com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover consulta:', error);
    res.status(500).json({ 
      error: 'Erro ao remover consulta',
      details: error.message 
    });
  }
});

module.exports = router;

// ============================================
// EXEMPLO DE USO NO APP PRINCIPAL
// ============================================

/*
const express = require('express');
const app = express();
const knowledgeBaseRoutes = require('./routes/knowledge-base');

app.use(express.json());
app.use(knowledgeBaseRoutes);

app.listen(3000, () => {
  console.log('API rodando na porta 3000');
});
*/
