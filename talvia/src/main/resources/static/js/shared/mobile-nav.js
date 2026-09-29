/* ============================================
   MENÚ MÓVIL — convierte la barra superior en
   un panel lateral deslizante en pantallas chicas
============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('.top-nav');
    const backdrop = document.getElementById('nav-backdrop');
    if (!btn || !nav || !backdrop) return;

    function abrirMenu() {
        nav.classList.add('nav-open');
        backdrop.classList.add('show');
        btn.textContent = '✕';
    }

    function cerrarMenu() {
        nav.classList.remove('nav-open');
        backdrop.classList.remove('show');
        btn.textContent = '☰';
    }

    btn.addEventListener('click', () => {
        nav.classList.contains('nav-open') ? cerrarMenu() : abrirMenu();
    });

    backdrop.addEventListener('click', cerrarMenu);

    // Cierra el menú automáticamente al hacer clic en cualquier link de navegación
   nav.querySelectorAll('a, button').forEach(el => el.addEventListener('click', cerrarMenu));});