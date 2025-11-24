INSERT INTO users (username, password, tipo)
SELECT 'aluno', 'senha123', 'aluno'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'aluno');
