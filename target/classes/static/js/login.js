// Backend URL (ajuste conforme necessário)
const BACKEND_URL = 'http://localhost:8080/api/login';

// Verificar se usuário já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  const username = sessionStorage.getItem('username');
  const tipo = sessionStorage.getItem('tipo');
  
  if (username) {
    updateUserDisplay(username, tipo);
  }
  
  // Abrir/fechar modal de login
  const openLoginBtn = document.getElementById('openLogin');
  const closeLoginBtn = document.getElementById('closeLogin');
  const loginModal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  
  if (openLoginBtn) {
    openLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginModal) loginModal.style.display = 'flex';
    });
  }

  if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', () => {
      if (loginModal) loginModal.style.display = 'none';
    });
  }

  // Fechar modal ao clicar fora
  window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      loginModal.style.display = 'none';
    }
  });

  // Processar login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.ok) {
          alert(`Bem-vindo, ${data.username}! (${data.tipo})`);
          sessionStorage.setItem('userId', data.userId);
          sessionStorage.setItem('username', data.username);
          sessionStorage.setItem('tipo', data.tipo);
          
          updateUserDisplay(data.username, data.tipo);
          
          if (loginModal) loginModal.style.display = 'none';
          loginForm.reset();
        } else {
          alert('Usuário ou senha incorretos!');
        }
      } catch (error) {
        console.error('Erro ao conectar com o servidor:', error);
        alert('Erro ao conectar com o servidor! Certifique-se que o backend está rodando em http://localhost:8080');
      }
    });
  }
});

// Função para atualizar a exibição do usuário
function updateUserDisplay(username, tipo) {
  const openLoginBtn = document.getElementById('openLogin');
  const userDisplay = document.getElementById('userDisplay');
  
  if (openLoginBtn && userDisplay) {
    openLoginBtn.style.display = 'none';
    userDisplay.style.display = 'inline';
    userDisplay.textContent = `👤 ${username} (${tipo})`;
    userDisplay.style.cursor = 'pointer';
    
    // Aplicar cor conforme tema
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    userDisplay.style.color = isDarkMode ? '#fff' : '#333';
    
    // Adicionar opção de logout
    userDisplay.addEventListener('click', () => {
      const logout = confirm('Deseja fazer logout?');
      if (logout) {
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('tipo');
        openLoginBtn.style.display = 'inline';
        userDisplay.style.display = 'none';
        alert('Você foi desconectado!');
      }
    });
  }
}

