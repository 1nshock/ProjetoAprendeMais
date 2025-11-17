(function () {
  const btn = document.getElementById('themeToggle');
  const body = document.body;

  try {
    const saved = localStorage.getItem('site-theme');
    if (saved === 'dark') {
      body.classList.add('dark-theme');
    } else if (saved === 'light') {
      body.classList.add('light-theme');
    }
  } catch (e) {
    // ignore
  }

  function updateButton() {
    if (!btn) return;
    if (body.classList.contains('dark-theme')) {
      btn.textContent = '☀️';
      btn.title = 'Tema claro';
    } else {
      btn.textContent = '🌗';
      btn.title = 'Tema escuro';
    }
  }

  // Initialize button state if present
  if (btn) updateButton();

  if (!btn) return;

  btn.addEventListener('click', function () {
    const isDark = body.classList.toggle('dark-theme');
    // ensure light-theme class is removed when switching to dark, and added when switching to light
    if (isDark) {
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
    }
    try {
      localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
    } catch (e) {}
    updateButton();
  });
})();
