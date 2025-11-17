// Gerenciar sessão do usuário em todas as páginas
document.addEventListener('DOMContentLoaded', () => {
  const username = sessionStorage.getItem('username');
  const tipo = sessionStorage.getItem('tipo');
  
  if (username) {
    updateUserDisplay(username, tipo);
  }
  
  // Observer para mudanças de tema
  const observer = new MutationObserver(() => {
    if (username) {
      updateUserDisplay(username, tipo);
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-theme', 'class']
  });
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
    
    // Aplicar cor conforme tema - verificar computedStyle
    const isDarkMode = document.body.classList.contains('dark-theme') ||
               document.documentElement.getAttribute('data-theme') === 'dark' || 
               window.matchMedia('(prefers-color-scheme: dark)').matches;
    userDisplay.style.color = isDarkMode ? '#fff' : '#333';
    
    // Adicionar opção de logout (sem duplicar listeners)
    userDisplay.onclick = () => {
      const logout = confirm('Deseja fazer logout?');
      if (logout) {
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('tipo');
        openLoginBtn.style.display = 'inline';
        userDisplay.style.display = 'none';
        userDisplay.textContent = '';
        userDisplay.onclick = null;
        alert('Você foi desconectado!');
      }
    };
  }
}
