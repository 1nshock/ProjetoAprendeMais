// Configuração do backend
const BACKEND_URL = 'http://localhost:8080/api';

// Elementos do DOM
const menuContainer = document.getElementById('menu');
const formProfessor = document.getElementById('form-professor');
const formInstituicao = document.getElementById('form-instituicao');
const formAluno = document.getElementById('form-aluno');

// Mostrar menu inicial
function showMenu() {
    menuContainer.style.display = 'block';
    formProfessor.style.display = 'none';
    formInstituicao.style.display = 'none';
    formAluno.style.display = 'none';
}

// Mostrar formulário específico
function showForm(type) {
    menuContainer.style.display = 'none';
    formProfessor.style.display = type === 'professor' ? 'block' : 'none';
    formInstituicao.style.display = type === 'instituicao' ? 'block' : 'none';
    formAluno.style.display = type === 'aluno' ? 'block' : 'none';
}

// Extrair dados básicos (username/password) do formulário
function getBasicAuthData(formElement, tipo) {
    const formData = new FormData(formElement);
    
    // Para aluno: usar RA como username
    // Para professor: usar nome como username (simplificado)
    // Para instituição: usar código como username
    
    let username;
    if (tipo === 'aluno') {
        username = formData.get('ra') || formData.get('nome');
    } else if (tipo === 'professor') {
        username = formData.get('cpf');
    } else if (tipo === 'instituicao') {
        username = formData.get('codigo');
    }
    
    const password = formData.get('password');
    
    return { username, password };
}

// Validar senha antes de enviar
function validatePassword(password) {
    if (!password || password.length < 6) {
        alert('Senha deve ter pelo menos 6 caracteres');
        return false;
    }
    return true;
}

// Handler para envio de formulário
async function handleSubmit(event, tipo) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const { username, password } = getBasicAuthData(form, tipo);
    
    // Validação básica
    if (!username || !password) {
        alert(`Por favor, preencha todos os campos obrigatórios`);
        return;
    }
    
    if (!validatePassword(password)) {
        return;
    }
    
    try {
        // Registrar usuário no backend
        const response = await fetch(`${BACKEND_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                passwordConfirm: password,
                tipo: tipo.toLowerCase()
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            console.log('Usuário criado com ID:', data.userId);
            
            // Aguardar um pouco antes de salvar dados adicionais
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Salvar dados adicionais na tabela específica
            await saveAdditionalData(formData, tipo, data.userId);
            
            alert(`✓ ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} cadastrado com sucesso!\nID: ${data.userId}`);
            form.reset();
            showMenu();
        } else {
            alert(`✗ Erro no cadastro: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro ao registrar:', error);
        alert('Erro de conexão com o servidor');
    }
}

// Função para salvar dados adicionais
async function saveAdditionalData(formData, tipo, userId) {
    const endpoint = tipo === 'professor' ? '/professor' : 
                    tipo === 'aluno' ? '/aluno' : 
                    tipo === 'instituicao' ? '/instituicao' : null;
    
    if (!endpoint) {
        console.log('Endpoint não encontrado para tipo:', tipo);
        return;
    }
    
    let requestData = { userId };
    
    if (tipo === 'professor') {
        requestData = {
            userId: userId,
            nome: formData.get('nome') || '',
            cpf: formData.get('cpf') || '',
            email: formData.get('email') || '',
            instituicao: formData.get('instituicao') || '',
            codigoDocente: formData.get('codigo_docente') || ''
        };
        console.log('Professor data:', requestData);
    } else if (tipo === 'aluno') {
        requestData = {
            userId: userId,
            nome: formData.get('nome') || '',
            ra: formData.get('ra') || '',
            email: formData.get('email') || ''
        };
        console.log('Aluno data:', requestData);
    } else if (tipo === 'instituicao') {
        requestData = {
            userId: userId,
            nomeUnidade: formData.get('nome_unidade') || '',
            codigo: formData.get('codigo') || '',
            cnpj: formData.get('cnpj') || '',
            tipoInstituicao: formData.get('tipo') || '',
            cep: formData.get('cep') || '',
            numero: formData.get('numero') || '',
            telefone: formData.get('telefone') || '',
            emailContato: formData.get('email_contato') || ''
        };
        console.log('Instituição data:', requestData);
    }
    
    const url = `${BACKEND_URL}${endpoint}`;
    console.log('Enviando POST para:', url);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.text();
        console.log('Status:', response.status);
        console.log('Resposta:', result);
        
        if (!response.ok) {
            console.error('Erro ao salvar dados adicionais:', result);
        }
    } catch (error) {
        console.error('Erro ao fazer fetch:', error);
    }
}

// Inicializar na página
document.addEventListener('DOMContentLoaded', () => {
    showMenu();
});
