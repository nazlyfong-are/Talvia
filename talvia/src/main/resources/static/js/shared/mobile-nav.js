document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('.top-nav');
    const backdrop = document.getElementById('nav-backdrop');
    if (!btn || !nav || !backdrop) return;

    // NUEVO: en celular, "Cerrar sesión" va dentro del menú lateral.
    // El botón de la barra (#logoutBtn) se oculta con CSS y este ítem hace clic sobre él,
    // así se usa la misma lógica de cierre de sesión y no se duplica.
    // Se crea ANTES de registrar los clics de abajo, para que también cierre el menú.
    const salir = document.getElementById('logoutBtn');
    if (salir && !nav.contains(salir) && !nav.querySelector('.nav-logout')) {
        const itemSalir = document.createElement('button');
        itemSalir.type = 'button';
        itemSalir.className = 'nav-logout';
        itemSalir.textContent = 'Cerrar sesión';
        itemSalir.addEventListener('click', () => salir.click());
        nav.appendChild(itemSalir);
    }

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

    // Cierra el menú automáticamente al hacer clic en cualquier link o botón de navegación
    nav.querySelectorAll('a, button').forEach(el => el.addEventListener('click', cerrarMenu));
});