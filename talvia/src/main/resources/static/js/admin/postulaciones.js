/* ============================================
   ADMIN — Auditoría de postulaciones (solo lectura)
   Endpoint esperado (pendiente de implementar):
   GET /api/admin/postulaciones?estado=&desde=&hasta=&page=
       → { contenido: [...], paginaActual, totalPaginas }
============================================ */

let paginaActual = 1;

document.addEventListener('DOMContentLoaded', () => {
    cargarPostulaciones();

    ['filtro-estado-post', 'filtro-desde', 'filtro-hasta'].forEach(id => {
        document.getElementById('btn-limpiar-filtros-post').addEventListener('click', () => {
    document.getElementById('filtro-estado-post').value = '';
    document.getElementById('filtro-desde').value = '';
    document.getElementById('filtro-hasta').value = '';
    paginaActual = 1;
    cargarPostulaciones();
});
    });
});

async function cargarPostulaciones() {
    const tbody = document.getElementById('postulaciones-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="admin-table-loading">Cargando postulaciones...</td></tr>';

    const query = construirQueryParams({
        estado: document.getElementById('filtro-estado-post').value,
        desde: document.getElementById('filtro-desde').value,
        hasta: document.getElementById('filtro-hasta').value,
        page: paginaActual
    });

    try {
        const resp = await fetch(`/api/admin/postulaciones?${query}`);
        if (!resp.ok) throw new Error('No se pudieron cargar las postulaciones.');
        const data = await resp.json();

        if (!data.contenido || data.contenido.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="admin-table-empty">No se encontraron postulaciones.</td></tr>';
        } else {
            tbody.innerHTML = '';
            data.contenido.forEach(p => tbody.appendChild(crearFilaPostulacion(p)));
        }

        renderizarPaginacionAdmin(document.getElementById('paginacion'), data.paginaActual || 1, data.totalPaginas || 1, (pg) => {
            paginaActual = pg;
            cargarPostulaciones();
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="admin-table-empty" style="color:#d93838;">Error: ${err.message}</td></tr>`;
    }
}

function crearFilaPostulacion(p) {
    const badgeClase = {
        PENDIENTE: 'badge-pendiente', EN_PROCESO: 'badge-en-proceso',
        ACEPTADO: 'badge-aceptado', RECHAZADO: 'badge-rechazado'
    }[p.estado] || 'badge-pendiente';

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${p.trabajadorNombre || '—'}</td>
        <td>${p.vacanteTitulo || '—'}</td>
        <td>${p.empresaNombre || '—'}</td>
        <td>${p.fecha || '—'}</td>
        <td>${p.fechaVista || '<span style="color:var(--slate);">No vista</span>'}</td>
        <td><span class="badge-estado ${badgeClase}">${p.estado || '—'}</span></td>
    `;
    return tr;
}