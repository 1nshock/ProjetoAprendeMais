document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('loginModal');
  const openBtn = document.getElementById('openLogin');
  const closeBtn = document.getElementById('closeLogin');

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.style.display = 'flex';
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      if (modal) modal.style.display = 'none';
    }
  });
});