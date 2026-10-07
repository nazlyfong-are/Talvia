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

    const irA = (pagina) => {
        onCambiarPagina(pagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const crearBtn = (texto, pagina, deshabilitado) => {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        btn.textContent = texto;
        btn.disabled = deshabilitado;
        btn.addEventListener('click', () => irA(pagina));
        return btn;
    };

    container.appendChild(crearBtn('« Anterior', paginaActual - 1, paginaActual <= 1));

    const numeros = document.createElement('div');
    numeros.className = 'page-numbers';
    rangoPaginas(paginaActual, totalPaginas).forEach(p => {
        if (p === '…') {
            const puntos = document.createElement('span');
            puntos.className = 'page-ellipsis';
            puntos.textContent = '…';
            numeros.appendChild(puntos);
        } else {
            const btn = document.createElement('button');
            btn.className = 'page-num' + (p === paginaActual ? ' active' : '');
            btn.textContent = p;
            btn.addEventListener('click', () => irA(p));
            numeros.appendChild(btn);
        }
    });
    container.appendChild(numeros);

    container.appendChild(crearBtn('Siguiente »', paginaActual + 1, paginaActual >= totalPaginas));
}

function escaparHtml(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}