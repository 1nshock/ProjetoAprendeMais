// =====================================================================
// DADOS E ESTADO (MODEL)
// =====================================================================
let rooms = [];
const SALAS_API_URL = '/api/salas';

// Variável de Estado de UI
let currentMode = 'view'; 

// =====================================================================
// REFERÊNCIAS DOM
// =====================================================================
const roomListScroller = document.getElementById('room-list-scroller');
const roomListView = document.getElementById('room-list-view');
const createEditFormContainer = document.getElementById('create-edit-form');
const sidebarActions = document.querySelector('.sidebar-actions');
const cancelBtnContainer = document.getElementById('cancel-action-btn-container');

// Botões laterais
const createModeBtn = document.getElementById('create-mode-btn');
const editModeBtn = document.getElementById('edit-mode-btn');
const cancelActionBtn = document.getElementById('cancel-action-btn');
const deleteModeBtn = document.getElementById('delete-mode-btn');

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================
function getCurrentUser() {
    return {
        id: sessionStorage.getItem('userId'),
        username: sessionStorage.getItem('username'),
        tipo: sessionStorage.getItem('tipo')
    };
}

function isUserLoggedIn() {
    return sessionStorage.getItem('userId') !== null;
}

// =====================================================================
// COMUNICACAO COM BACKEND (API)
// =====================================================================
async function parseError(response) {
    try {
        const data = await response.json();
        if (data && typeof data === 'object') {
            const message = data.error || data.message;
            if (message) {
                return new Error(message);
            }
        }
    } catch (_) {
        // Ignora erro de parse
    }
    return new Error(response.statusText || 'Falha na requisicao.');
}

async function fetchRooms() {
    try {
        const response = await fetch(SALAS_API_URL, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw await parseError(response);
        }

        rooms = await response.json();
        console.log('GET /api/salas retornou:', rooms);
        renderRooms();
    } catch (err) {
        console.error('Erro ao carregar salas', err);
        alert(err.message ? `Erro ao carregar salas: ${err.message}` : 'Nao foi possivel carregar as salas.');
    }
}

async function createRoom(payload) {
    const response = await fetch(SALAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw await parseError(response);
    }

    const data = await response.json();
    console.log('POST /api/salas retornou:', data);
    return data;
}

async function updateRoom(id, payload) {
    const response = await fetch(`${SALAS_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw await parseError(response);
    }

    return response.json();
}

async function removeRoom(id) {
    const response = await fetch(`${SALAS_API_URL}/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw await parseError(response);
    }
}

async function entrarSala(id) {
    const response = await fetch(`${SALAS_API_URL}/${id}/entrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw await parseError(response);
    }

    return response.json();
}

async function sairSala(id) {
    const response = await fetch(`${SALAS_API_URL}/${id}/sair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw await parseError(response);
    }

    return response.json();
}

async function listarAlunosSala(id) {
    const response = await fetch(`${SALAS_API_URL}/${id}/alunos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw await parseError(response);
    }

    return response.json();
}

// =====================================================================
// LÓGICA DE GERENCIAMENTO DE ESTADO (CONTROLLER)
// =====================================================================
function setMode(newMode) {
    currentMode = newMode;

    // 1. Visibilidade dos elementos principais
    const isFormMode = (newMode === 'create_form' || newMode === 'edit_form'); 
    const isSelectionMode = (newMode === 'edit'); 

    roomListView.classList.toggle('hidden', isFormMode);
    createEditFormContainer.classList.toggle('hidden', !isFormMode);
    
    // 2. Controle dos painéis laterais (CRUD vs. CANCELAR)
    sidebarActions.classList.toggle('hidden', isSelectionMode || isFormMode);
    
    // O botão CANCELAR lateral deve aparecer SOMENTE no modo 'edit'
    cancelBtnContainer.classList.toggle('hidden', newMode !== 'edit');

    // 3. Renderiza a lista (se não for formulário)
    if (!isFormMode) {
        renderRooms();
    }
}


// =====================================================================
// RENDERIZAÇÃO DA LISTA DE SALAS (VIEW)
// =====================================================================
function renderRooms() {
    console.log('renderRooms chamado com rooms:', rooms);
    roomListScroller.innerHTML = '';
    
    const currentUser = getCurrentUser();
    const isLoggedIn = isUserLoggedIn();
    
    rooms.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';

        const name = document.createElement('span');
        name.className = 'room-card-name';
        name.textContent = room.nome;
        name.setAttribute('data-tooltip', room.descricao || 'Sem descrição.');
        const capacity = document.createElement('span');
        capacity.className = 'room-card-capacity';
        capacity.textContent = `${room.capacidadeAtual}/${room.capacidadeMaxima}`;

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'room-actions-container';

        // Determinar se usuário atual é o professor desta sala
        const isProfessor = isLoggedIn && currentUser.id && String(currentUser.id) === String(room.professorId);
        
        // Botão Entrar
        const enterBtn = document.createElement('button');
        enterBtn.className = 'room-action-btn action-enter-btn';
        enterBtn.textContent = 'Entrar';
        
        // Desabilitar se: não logado OU é professor da sala
        if (!isLoggedIn || isProfessor) {
            enterBtn.disabled = true;
            enterBtn.title = !isLoggedIn ? 'Faça login para entrar' : 'Você é o professor desta sala';
        } else {
            enterBtn.onclick = () => handleEnterRoom(room.id);
        }

        // Botão Sair
        const exitBtn = document.createElement('button');
        exitBtn.className = 'room-action-btn action-exit-btn';
        exitBtn.textContent = 'Sair';
        exitBtn.style.display = 'none'; // TODO: Rastrear se usuário está na sala
        
        // Botão Editar
        const editBtn = document.createElement('button');
        editBtn.className = 'room-action-btn action-edit-btn';
        editBtn.textContent = 'Editar';
        editBtn.dataset.roomId = room.id;
        
        // Desabilitar se não é professor
        if (!isProfessor) {
            editBtn.disabled = true;
            editBtn.title = 'Apenas o professor pode editar';
        } else {
            editBtn.onclick = () => openFormModal('edit', room);
        }

        // Botão Apagar (Ação Direta)
        const delBtn = document.createElement('button');
        delBtn.className = 'room-action-btn action-delete-btn';
        delBtn.textContent = 'Apagar';
        delBtn.dataset.roomId = room.id;
        
        // Desabilitar se não é professor
        if (!isProfessor) {
            delBtn.disabled = true;
            delBtn.title = 'Apenas o professor pode apagar';
        } else {
            delBtn.onclick = (e) => {
                e.stopPropagation();
                deleteRoom(room.id);
            };
        }

        // Botão Ver Alunos (apenas professor)
        const viewStudentsBtn = document.createElement('button');
        viewStudentsBtn.className = 'room-action-btn action-view-students-btn';
        viewStudentsBtn.textContent = 'Ver Alunos';
        
        if (!isProfessor) {
            viewStudentsBtn.disabled = true;
            viewStudentsBtn.title = 'Apenas o professor pode ver alunos';
        } else {
            viewStudentsBtn.onclick = () => handleViewStudents(room.id, room.nome);
        }

        // Renderização Condicional Limpa
        if (currentMode === 'view') {
            actionsContainer.appendChild(enterBtn);
            actionsContainer.appendChild(exitBtn);
            actionsContainer.appendChild(viewStudentsBtn);
            actionsContainer.appendChild(editBtn);
            actionsContainer.appendChild(delBtn);
        } else if (currentMode === 'edit') {
            actionsContainer.appendChild(editBtn);
        } 

        card.appendChild(name);
        card.appendChild(capacity);
        card.appendChild(actionsContainer);
        roomListScroller.appendChild(card);
    });
}

// =====================================================================
// LOGICA DE ENTRADA/SAIDA (ENTER/EXIT)
// =====================================================================
async function handleEnterRoom(roomId) {
    try {
        const sala = await entrarSala(roomId);
        alert('Você entrou na sala com sucesso!');
        console.log('Entrada na sala bem-sucedida:', sala);
        await fetchRooms();
    } catch (err) {
        console.error('Erro ao entrar na sala', err);
        alert(err.message || 'Nao foi possivel entrar na sala.');
    }
}

async function handleExitRoom(roomId) {
    try {
        const sala = await sairSala(roomId);
        alert('Você saiu da sala!');
        console.log('Saida da sala bem-sucedida:', sala);
        await fetchRooms();
    } catch (err) {
        console.error('Erro ao sair da sala', err);
        alert(err.message || 'Nao foi possivel sair da sala.');
    }
}

async function handleViewStudents(roomId, roomName) {
    try {
        const alunos = await listarAlunosSala(roomId);
        
        if (alunos.length === 0) {
            alert('Nenhum aluno entrou nesta sala ainda.');
            return;
        }

        // Criar lista formatada
        let listaAlunos = `Alunos na sala "${roomName}":\n\n`;
        alunos.forEach((aluno, index) => {
            const entrada = new Date(aluno.dataEntrada).toLocaleString('pt-BR');
            listaAlunos += `${index + 1}. ID: ${aluno.alunoId}\n   Entrada: ${entrada}\n`;
        });
        
        alert(listaAlunos);
        console.log('Alunos na sala:', alunos);
    } catch (err) {
        console.error('Erro ao buscar alunos', err);
        alert(err.message || 'Nao foi possivel buscar os alunos.');
    }
}

// =====================================================================
// LOGICA CRUD (OPEN FORM, SUBMIT, DELETE)
// =====================================================================

// 1. ABRIR FORMULARIO (CRIAR ou EDITAR)
function openFormModal(mode, room = null) {
    setMode(mode === 'edit' ? 'edit_form' : 'create_form'); 
    
    const isEdit = mode === 'edit';
    const formTitle = isEdit ? 'Editar Salas' : 'Criar Salas';

    const roomName = isEdit ? room.nome : '';
    const roomDesc = isEdit ? room.descricao : '';
    const roomCapacity = isEdit ? room.capacidadeMaxima : '';
    const roomPassword = isEdit ? room.senha : '';
    
    const MAX_CAPACITY = 40;
    const MIN_CAPACITY = 1;
    
    // Injeção de Template String do Formulário
    createEditFormContainer.innerHTML = `
    <div class="form-wrapper">
        <div class="form-header">
            <h2>${formTitle}</h2>
            <button type="button" onclick="setMode('view')" class="sidebar-btn danger-action form-cancel-btn">
                CANCELAR
            </button>
        </div>
        
        <form id="room-crud-form">
            <input type="hidden" id="room-id" value="${isEdit ? room.id : ''}">
            <div class="input-group"><label for="room-name">NOME</label><input type="text" id="room-name" placeholder="Nome" value="${roomName}" required></div>
            <div class="input-group"><label for="room-description">DESCRIÇÃO</label><input type="text" id="room-description" placeholder="Descrição" value="${roomDesc}"></div>
            <div class="input-group"><label for="room-capacity">CAPACIDADE MÁXIMA</label><input type="number" id="room-capacity" placeholder="Capacidade Máxima" value="${roomCapacity}" required min="${MIN_CAPACITY}" max="${MAX_CAPACITY}"></div>
            
            <div class="input-group">
                <label for="room-password">SENHA</label>
                <div class="password-input-wrapper">
                    <input type="password" id="room-password" placeholder="Senha (opcional)" value="${roomPassword}">
                    <button type="button" id="toggle-password-btn" aria-label="Mostrar senha" class="toggle-password-btn">
                        </button>
                </div>
            </div>
            
            <div class="form-actions form-footer">
                <button type="submit" class="sidebar-btn primary-action confirm-btn">Confirmar</button>
                <button type="button" onclick="setMode('view')" class="sidebar-btn danger-action cancel-btn">Cancelar</button>
            </div>
        </form>
    </div>
    `;
    
    document.getElementById('room-crud-form').addEventListener('submit', handleFormSubmit);
    

    const toggleBtn = document.getElementById('toggle-password-btn');
    const pwdInput = document.getElementById('room-password');

    if (toggleBtn && pwdInput) {
       
        const eyeSvg = {
            open: '👁️', 
            closed: '🔒' 
        };

        // Estado inicial
        toggleBtn.innerHTML = eyeSvg.open;
        toggleBtn.setAttribute('aria-pressed', 'false');

        toggleBtn.addEventListener('click', () => {
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                toggleBtn.innerHTML = eyeSvg.closed;
                toggleBtn.setAttribute('aria-label', 'Ocultar senha');
                toggleBtn.setAttribute('aria-pressed', 'true');
            } else {
                pwdInput.type = 'password';
                toggleBtn.innerHTML = eyeSvg.open;
                toggleBtn.setAttribute('aria-label', 'Mostrar senha');
                toggleBtn.setAttribute('aria-pressed', 'false');
            }
        });
    }
}

// 2. ENVIAR FORMULÁRIO (CONFIRMAR)
async function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('room-id').value;
    const nome = document.getElementById('room-name').value;
    const descricao = document.getElementById('room-description').value;
    const capacidadeMaxima = parseInt(document.getElementById('room-capacity').value);
    const senha = document.getElementById('room-password').value;
    
    const MAX_CAPACITY = 40;
    const MIN_CAPACITY = 1;
    
    if (capacidadeMaxima > MAX_CAPACITY || capacidadeMaxima < MIN_CAPACITY || isNaN(capacidadeMaxima)) {
        alert(`A Capacidade Máxima deve ser um número entre ${MIN_CAPACITY} e ${MAX_CAPACITY}.`);
        return; 
    }

    const existingRoom = id ? rooms.find(r => String(r.id) === String(id)) : null;
    const capacidadeAtualPayload = existingRoom && typeof existingRoom.capacidadeAtual === 'number'
        ? existingRoom.capacidadeAtual
        : 0;

    const payload = {
        nome: nome.trim(),
        descricao,
        capacidadeMaxima,
        capacidadeAtual: capacidadeAtualPayload,
        senha: senha || null
        // professorId não precisa ser enviado - backend pega da sessão
    };

    try {
        if (id) {
            await updateRoom(id, payload);
            alert('Sala editada com sucesso!');
        } else {
            if (payload.capacidadeAtual == null) {
                payload.capacidadeAtual = 0;
            }
            await createRoom(payload);
            alert('Sala criada com sucesso!');
        }

        console.log('Antes de fetchRooms, rooms está:', rooms);
        await fetchRooms();
        console.log('Depois de fetchRooms, rooms está:', rooms);
        setMode('view');
    } catch (err) {
        console.error('Erro ao salvar sala', err);
        alert(err.message || 'Nao foi possivel salvar a sala.');
    }
}

// 3. APAGAR SALA
async function deleteRoom(id) {
    if (confirm("Tem certeza que deseja apagar esta sala?")) {
        try {
            await removeRoom(id);
            alert('Sala apagada com sucesso!');
            await fetchRooms();
            setMode('view');
        } catch (err) {
            console.error('Erro ao remover sala', err);
            alert(err.message || 'Nao foi possivel apagar a sala.');
        }
    }
}


// =====================================================================
// EVENT LISTENERS GERAIS E INICIALIZAÇÃO
// =====================================================================

createModeBtn.addEventListener('click', () => openFormModal('create')); 
editModeBtn.addEventListener('click', () => setMode('edit')); 
cancelActionBtn.addEventListener('click', () => setMode('view')); 
if (deleteModeBtn) {
    deleteModeBtn.addEventListener('click', () => setMode('edit'));
}

const createTopBtn = document.getElementById('create-top-btn');
if (createTopBtn) createTopBtn.addEventListener('click', () => openFormModal('create'));

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setMode('view');
    fetchRooms();
});