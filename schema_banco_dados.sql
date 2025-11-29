-- ============================================
-- SCHEMA DO BANCO DE DADOS - BASE DE CONHECIMENTO
-- ============================================

-- Tabela principal de conhecimento
CREATE TABLE IF NOT EXISTS knowledge_base (
  id VARCHAR(50) PRIMARY KEY,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  tags JSON,
  patient_id VARCHAR(50),
  prescriber_id VARCHAR(50),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_categoria (categoria),
  INDEX idx_prescriber (prescriber_id),
  INDEX idx_ativo (ativo),
  INDEX idx_timestamp (timestamp),
  FULLTEXT INDEX idx_pergunta_fulltext (pergunta)
);

-- ============================================
-- ÍNDICES PARA BUSCA RÁPIDA
-- ============================================

-- Para PostgreSQL (busca por similaridade)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX idx_pergunta_trgm ON knowledge_base USING gin (pergunta gin_trgm_ops);

-- ============================================
-- EXEMPLO DE DADOS INICIAIS
-- ============================================

INSERT INTO knowledge_base (id, pergunta, resposta, categoria, tags) VALUES
('kb_001', 'Posso comer doce?', 'Doces não estão no plano porque estamos focando em alimentos que ajudam nas suas metas. Mas você pode aproveitar a banana do lanche que é naturalmente doce e traz fibras.', 'duvida_alimentacao', '["doce", "carboidrato", "vontade"]'),

('kb_002', 'Posso substituir o brócolis?', 'Sim, você pode trocar por couve-flor, abobrinha ou vagem. Todas têm perfil nutricional similar. Mantenha a mesma porção.', 'substituicao', '["brócolis", "substituição", "vegetais"]'),

('kb_003', 'Estou com muita fome entre as refeições', 'Isso pode indicar que precisamos ajustar as porções ou distribuição de macros. Enquanto isso, beba mais água e tente antecipar o próximo lanche em 30 minutos. Vamos conversar para ajustar o plano.', 'dificuldade', '["fome", "saciedade", "ajuste"]'),

('kb_004', 'Consegui seguir tudo hoje!', 'Ótimo trabalho! Seguir o plano certinho é o caminho para resultados consistentes. Continue assim.', 'relato_progresso', '["aderência", "progresso", "motivação"]'),

('kb_005', 'Posso tomar café com açúcar?', 'Prefira adoçante ou café sem açúcar para não comprometer suas metas de carboidratos. Se preferir, use uma pequena quantidade de mel (5g) contabilizando nos carbos do dia.', 'duvida_alimentacao', '["café", "açúcar", "adoçante"]'),

('kb_006', 'Esqueci de comer no horário', 'Sem problemas. Coma assim que lembrar e ajuste os próximos horários. O importante é manter a sequência das refeições sem pular nenhuma.', 'dificuldade', '["horário", "esquecimento", "rotina"]'),

('kb_007', 'Posso comer pizza no final de semana?', 'Podemos incluir uma refeição livre estratégica no plano. Vamos conversar para ajustar sem comprometer seus resultados. Enquanto isso, que tal fazer uma pizza fit com pão integral?', 'duvida_alimentacao', '["pizza", "refeição livre", "final de semana"]'),

('kb_008', 'Não gosto de ovo', 'Podemos substituir por outra fonte de proteína como peito de frango, atum ou queijo cottage. Vou ajustar seu plano.', 'substituicao', '["ovo", "proteína", "substituição"]'),

('kb_009', 'Estou me sentindo tonto', 'Tontura precisa de atenção. Entre em contato comigo ou com seu médico o quanto antes. Enquanto isso, hidrate-se e descanse. Se piorar, procure atendimento médico.', 'urgencia_saude', '["tontura", "urgência", "sintomas"]'),

('kb_010', 'Posso aumentar a quantidade de proteína?', 'Vamos avaliar seus resultados antes de fazer ajustes. O plano atual está balanceado para suas metas. Se sentir necessidade, podemos conversar sobre ajustes após 2 semanas.', 'duvida_alimentacao', '["proteína", "ajuste", "macros"]');

-- ============================================
-- QUERY DE EXEMPLO PARA BUSCA
-- ============================================

-- Busca simples por palavra-chave
-- SELECT * FROM knowledge_base 
-- WHERE LOWER(pergunta) LIKE '%doce%' 
-- AND ativo = true 
-- ORDER BY timestamp DESC 
-- LIMIT 3;

-- Busca com FULLTEXT (MySQL)
-- SELECT *, MATCH(pergunta) AGAINST('posso comer doce' IN NATURAL LANGUAGE MODE) as relevance
-- FROM knowledge_base
-- WHERE MATCH(pergunta) AGAINST('posso comer doce' IN NATURAL LANGUAGE MODE)
-- AND ativo = true
-- ORDER BY relevance DESC
-- LIMIT 3;

-- Busca com similaridade (PostgreSQL)
-- SELECT *, similarity(pergunta, 'posso comer doce') as relevance
-- FROM knowledge_base
-- WHERE similarity(pergunta, 'posso comer doce') > 0.3
-- AND ativo = true
-- ORDER BY relevance DESC
-- LIMIT 3;
