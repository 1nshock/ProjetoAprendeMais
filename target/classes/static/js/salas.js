// =====================================================================
// DADOS E ESTADO (MODEL)
// =====================================================================
let rooms = [
    { id: 1, nome: "Sala 01", capacidadeAtual: 20, capacidadeMaxima: 40, descricao: "Matemática", senha: "123" },
    { id: 2, nome: "Sala 02", capacidadeAtual: 22, capacidadeMaxima: 40, descricao: "História", senha: "456" },
    { id: 3, nome: "Sala 03", capacidadeAtual: 4, capacidadeMaxima: 40, descricao: "Química", senha: "" },
    { id: 4, nome: "Sala 04", capacidadeAtual: 19, capacidadeMaxima: 40, descricao: "Português", senha: "789" },
];
let nextRoomId = 5;

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
    roomListScroller.innerHTML = '';
    
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

        // Botão Entrar
        const enterBtn = document.createElement('button');
        enterBtn.className = 'room-action-btn action-enter-btn';
        enterBtn.textContent = 'Entrar';
        enterBtn.onclick = () => alert(`Entrando na sala: ${room.nome}`);

        // Botão Editar
        const editBtn = document.createElement('button');
        editBtn.className = 'room-action-btn action-edit-btn';
        editBtn.textContent = 'Editar';
        editBtn.dataset.roomId = room.id;
        editBtn.onclick = () => openFormModal('edit', room);

        // Botão Apagar (Ação Direta)
        const delBtn = document.createElement('button');
        delBtn.className = 'room-action-btn action-delete-btn';
        delBtn.textContent = 'Apagar';
        delBtn.dataset.roomId = room.id;
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteRoom(room.id);
        };

        // Renderização Condicional Limpa
        if (currentMode === 'view') {
            actionsContainer.appendChild(enterBtn);
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
function handleFormSubmit(e) {
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

    if (id) {
        // Modo Edição (Update)
        const roomIndex = rooms.findIndex(r => r.id == id);
        if (roomIndex !== -1) {
            rooms[roomIndex] = { ...rooms[roomIndex], nome, descricao, capacidadeMaxima, senha };
        }
    } else {
        // Modo Criação (Create)
        const newRoom = { id: nextRoomId++, nome, descricao, capacidadeAtual: 0, capacidadeMaxima, senha };
        rooms.push(newRoom);
    }
    
    alert(`Sala ${id ? 'editada' : 'criada'} com sucesso (Simulação)!`);
    setMode('view');
}

// 3. APAGAR SALA
function deleteRoom(id) {
    if (confirm("Tem certeza que deseja apagar esta sala?")) {
        rooms = rooms.filter(room => room.id !== id);
        alert("Sala apagada com sucesso (Simulação)!");
        setMode('view');
    }
}


// =====================================================================
// EVENT LISTENERS GERAIS E INICIALIZAÇÃO
// =====================================================================

createModeBtn.addEventListener('click', () => openFormModal('create')); 
editModeBtn.addEventListener('click', () => setMode('edit')); 
cancelActionBtn.addEventListener('click', () => setMode('view')); 

const createTopBtn = document.getElementById('create-top-btn');
if (createTopBtn) createTopBtn.addEventListener('click', () => openFormModal('create'));

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setMode('view');
});