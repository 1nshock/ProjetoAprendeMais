// Configuração do backend
const BACKEND_URL = 'http://localhost:8080/api';

// Elementos do DOM
const menuContainer = document.getElementById('menu');
const formProfessor = document.getElementById('form-professor');
const formInstituicao = document.getElementById('form-instituicao');
const formAluno = document.getElementById('form-aluno');

// Mostrar menu inicial
function showMenu() {
    if (menuContainer) menuContainer.style.display = 'block';
    if (formProfessor) formProfessor.style.display = 'none';
    if (formInstituicao) formInstituicao.style.display = 'none';
    if (formAluno) formAluno.style.display = 'none';
}

// Mostrar formulário específico
function showForm(type) {
    if (menuContainer) menuContainer.style.display = 'none';
    if (formProfessor) formProfessor.style.display = type === 'professor' ? 'block' : 'none';
    if (formInstituicao) formInstituicao.style.display = type === 'instituicao' ? 'block' : 'none';
    if (formAluno) formAluno.style.display = type === 'aluno' ? 'block' : 'none';
}

// Extrair dados básicos (username/password) do formulário
function getBasicAuthData(formElement, tipo) {
    const formData = new FormData(formElement);
    
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
            alert(`✓ ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} cadastrado com sucesso!\nID: ${data.userId}`);
            form.reset();
            showMenu();
        } else {
            alert(`✗ Erro no cadastro: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro ao registrar:', error);
        alert('Erro de conexão com o servidor. Certifique-se que o backend está rodando em http://localhost:8080');
    }
}

// Inicializar na página
document.addEventListener('DOMContentLoaded', () => {
    showMenu();
});
