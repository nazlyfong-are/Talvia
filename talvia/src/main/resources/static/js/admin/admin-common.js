/* ============================================
   ADMIN COMMON — logout, se apoya en mobile-nav.js
   ya existente para el menú hamburguesa
============================================ */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        try { await fetch('/api/auth/logout', { method: 'POST' }); }
        finally { window.location.href = '/public/login'; }
    });
});

/* ── Helper reutilizable: construye query string desde un objeto, ignorando vacíos ── */
function construirQueryParams(filtros) {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
        }
    });
    return params.toString();
}

/* ── Helper reutilizable: pinta controles de paginación simples ── */
function renderizarPaginacionAdmin(container, paginaActual, totalPaginas, onCambiarPagina) {
    container.innerHTML = '';
    if (totalPaginas <= 1) return;

    const crearBtn = (texto, pagina, deshabilitado) => {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        btn.textContent = texto;
        btn.disabled = deshabilitado;
        btn.addEventListener('click', () => onCambiarPagina(pagina));
        return btn;
    };

    container.appendChild(crearBtn('« Anterior', paginaActual - 1, paginaActual <= 1));

    const numeros = document.createElement('div');
    numeros.className = 'page-numbers';
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-num' + (i === paginaActual ? ' active' : '');
        btn.textContent = i;
        btn.addEventListener('click', () => onCambiarPagina(i));
        numeros.appendChild(btn);
    }
    container.appendChild(numeros);

    container.appendChild(crearBtn('Siguiente »', paginaActual + 1, paginaActual >= totalPaginas));
}