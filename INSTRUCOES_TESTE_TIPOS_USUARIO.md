# Teste do Sistema de Múltiplos Tipos de Usuário

## Resumo das Mudanças

✅ Adicionado campo `tipo` na tabela `users` do MySQL
✅ Backend agora aceita 3 tipos de usuário: `aluno`, `professor`, `instituicao`
✅ `Cadastro.html` integrado ao backend via `Cadastro-v2.js`
✅ Login retorna o tipo de usuário na resposta

## Passo 1: Atualizar Banco de Dados

No **phpMyAdmin**, execute este comando SQL:

```sql
ALTER TABLE users ADD COLUMN tipo VARCHAR(50) NOT NULL DEFAULT 'aluno';
```

## Passo 2: Reiniciar o Backend

Execute no terminal:

```powershell
.\run.ps1 clean spring-boot:run
```

Aguarde até ver: `Tomcat started on port(s): 8080`

## Passo 3: Testar Cadastro de Aluno

1. Abra o navegador em: **http://localhost/index.html** (ou seu servidor local)
2. Clique em **"Cadastro"** na página principal → vai para `Cadastro.html`
3. Escolha **"Cadastro de Aluno"**
4. Preencha os campos:
   - **RA**: `aluno001`
   - **Nome**: João Silva
   - **E-mail**: joao@email.com
   - **Senha**: `senha123`
5. Clique em **"Cadastrar Aluno"**

### Resultado Esperado:
- ✅ Mensagem: "Aluno cadastrado com sucesso! ID: [ID]"
- ✅ Novo usuário aparece no phpMyAdmin com `tipo = 'aluno'`

## Passo 4: Testar Cadastro de Professor

1. Em `Cadastro.html`, volte ao menu
2. Escolha **"Cadastro de Professor"**
3. Preencha os campos:
   - **CPF**: `123.456.789-00` (será usado como username)
   - **Nome**: Maria Santos
   - **E-mail**: maria@email.com
   - **Instituição**: Universidade A
   - **Código do Docente**: `DOC001`
   - **Senha**: `senha456`
4. Clique em **"Cadastrar Professor"**

### Resultado Esperado:
- ✅ Mensagem: "Professor cadastrado com sucesso! ID: [ID]"
- ✅ Novo usuário no BD com `tipo = 'professor'`

## Passo 5: Testar Cadastro de Instituição

1. Em `Cadastro.html`, volte ao menu
2. Escolha **"Cadastro de Instituição"**
3. Preencha os campos:
   - **Código**: `INST001` (será usado como username)
   - **Nome da Unidade**: Escola Estadual XYZ
   - **CNPJ**: `00.000.000/0000-00`
   - **Tipo**: Estadual
   - **CEP**: `12345-678`
   - **Número**: 100
   - **Telefone**: `(11) 98765-4321`
   - **E-mail de Contato**: contato@escola.com
   - **Senha**: `senha789`
4. Clique em **"Cadastrar Instituição"**

### Resultado Esperado:
- ✅ Mensagem: "Instituição cadastrado com sucesso! ID: [ID]"
- ✅ Novo usuário no BD com `tipo = 'instituicao'`

## Passo 6: Testar Login com Diferentes Tipos

Volte para `index.html` e teste o login:

### Login como Aluno:
- **Usuário**: `aluno001` (o RA que cadastrou)
- **Senha**: `senha123`
- **Resultado**: Deve mostrar "Bem-vindo, aluno001! (aluno)"

### Login como Professor:
- **Usuário**: `123.456.789-00` (o CPF que cadastrou)
- **Senha**: `senha456`
- **Resultado**: Deve mostrar "Bem-vindo, 123.456.789-00! (professor)"

### Login como Instituição:
- **Usuário**: `INST001` (o código que cadastrou)
- **Senha**: `senha789`
- **Resultado**: Deve mostrar "Bem-vindo, INST001! (instituicao)"

## Verificar no phpMyAdmin

Abra a tabela `users` no phpMyAdmin e confirme que:

```
| id | username       | password  | tipo        |
|----|----------------|-----------|-------------|
| 1  | aluno001       | senha123  | aluno       |
| 2  | 123.456.789-00 | senha456  | professor   |
| 3  | INST001        | senha789  | instituicao |
```

## ⚠️ Próximas Melhorias

- [ ] Adicionar BCrypt para hash de senhas (segurança)
- [ ] Criar tabelas específicas para dados adicionais de cada tipo
- [ ] Adicionar JWT tokens para autenticação persistente
- [ ] Validar CPF, CNPJ, RA em tempo real

## Troubleshooting

### "Erro de conexão com o servidor"
- Certifique-se que o backend está rodando em `http://localhost:8080`
- Verifique se executou `.\run.ps1 clean spring-boot:run` e aguardou o Tomcat iniciar

### "Usuário já existe"
- Tente com um CPF/RA/Código diferente

### Senha não funcionando no login
- Confirme que a senha tem pelo menos 6 caracteres
- Senhas são case-sensitive
