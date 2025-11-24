-- =====================================================================
-- DEPLOY SQL - ProjetoAprendeMais
-- Criação de tabelas para sistema de Salas com controle de alunos
-- =====================================================================

-- 1. Criar tabela salas (se não existir)
CREATE TABLE IF NOT EXISTS salas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    capacidade_atual INT NOT NULL DEFAULT 0,
    capacidade_maxima INT NOT NULL,
    senha VARCHAR(60),
    professor_id BIGINT NOT NULL,
    CONSTRAINT fk_salas_professor FOREIGN KEY (professor_id) REFERENCES users(id)
);

-- 2. Criar tabela salas_alunos para rastrear entrada/saída de alunos
CREATE TABLE IF NOT EXISTS salas_alunos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sala_id BIGINT NOT NULL,
    aluno_id BIGINT NOT NULL,
    data_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_saida DATETIME,
    esta_na_sala BOOLEAN DEFAULT TRUE,
    INDEX idx_sala_aluno_ativo (sala_id, aluno_id, esta_na_sala),
    CONSTRAINT fk_salas_alunos_sala FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE,
    CONSTRAINT fk_salas_alunos_aluno FOREIGN KEY (aluno_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================================
-- Fim do script de deploy
-- =====================================================================
