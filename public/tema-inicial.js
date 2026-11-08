// Aplica el tema elegido por el visitante (claro u oscuro) antes de pintar la página.
try {
  var t = localStorage.getItem('atlas-tema');
  if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
