/* ============================================
   ADMIN — Vacantes de la plataforma
   Endpoints:
   GET    /api/admin/vacantes?estado=&area=&q=&page=
          → { contenido: [...], paginaActual, totalPaginas }
   PUT    /api/admin/vacantes/{id}/estado { estado: 'CERRADA' }
   DELETE /api/admin/vacantes/{id}
============================================ */

let paginaActual = 1;
let debounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarVacantes();

    document.getElementById('filtro-estado-vacante').addEventListener('change', () => { paginaActual = 1; cargarVacantes(); });
    document.getElementById('filtro-area-vacante').addEventListener('change', () => { paginaActual = 1; cargarVacantes(); });

    document.getElementById('buscar-vacante').addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => { paginaActual = 1; cargarVacantes(); }, 400);
    });

    document.getElementById('btn-limpiar-filtros-vacantes').addEventListener('click', () => {
        document.getElementById('filtro-estado-vacante').value = '';
        document.getElementById('filtro-area-vacante').value = '';
        document.getElementById('buscar-vacante').value = '';
        paginaActual = 1;
        cargarVacantes();
    });
});

async function cargarVacantes() {
    const tbody = document.getElementById('vacantes-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="admin-table-loading">Cargando vacantes...</td></tr>';

    const query = construirQueryParams({
        estado: document.getElementById('filtro-estado-vacante').value,
        area: document.getElementById('filtro-area-vacante').value,
        q: document.getElementById('buscar-vacante').value.trim(),
        page: paginaActual
    });

    try {
        const resp = await fetch(`/api/admin/vacantes?${query}`);
        if (!resp.ok) throw new Error('No se pudieron cargar las vacantes.');
        const data = await resp.json();

        if (!data.contenido || data.contenido.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="admin-table-empty">No se encontraron vacantes.</td></tr>';
        } else {
            tbody.innerHTML = '';
            data.contenido.forEach(v => tbody.appendChild(crearFilaVacante(v)));
        }

        renderizarPaginacionAdmin(document.getElementById('paginacion'), data.paginaActual || 1, data.totalPaginas || 1, (p) => {
            paginaActual = p;
            cargarVacantes();
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="admin-table-empty" style="color:#d93838;">Error: ${err.message}</td></tr>`;
    }
}

function crearFilaVacante(v) {
    const badgeClase = v.estado === 'ABIERTA' ? 'badge-abierta' : v.estado === 'PAUSADA' ? 'badge-pausada' : 'badge-cerrada';
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><b>${v.titulo || '—'}</b></td>
        <td>${v.empresa || '—'}</td>
        <td>${v.area || '—'}</td>
        <td>${v.fecha || '—'}</td>
        <td>${v.totalPostulaciones ?? 0}</td>
        <td><span class="badge-estado ${badgeClase}">${v.estado || '—'}</span></td>
        <td style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn-tabla btn-cerrar-vacante" data-id="${v.id}">Cerrar</button>
            <button class="btn-tabla btn-tabla-peligro btn-eliminar-vacante" data-id="${v.id}" data-titulo="${v.titulo}">Eliminar</button>
        </td>
    `;
    tr.querySelector('.btn-cerrar-vacante').addEventListener('click', () => cerrarVacante(v.id));
    tr.querySelector('.btn-eliminar-vacante').addEventListener('click', () => eliminarVacanteAdmin(v.id, v.titulo));
    return tr;
}

async function cerrarVacante(id) {
    try {
        const resp = await fetch(`/api/admin/vacantes/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'CERRADA' })
        });
        if (!resp.ok) throw new Error(await resp.text());
        cargarVacantes();
    } catch (err) {
        alert('Error al cerrar la vacante: ' + err.message);
    }
}

async function eliminarVacanteAdmin(id, titulo) {
    if (!confirm(`¿Eliminar permanentemente la vacante "${titulo}"?`)) return;
    try {
        const resp = await fetch(`/api/admin/vacantes/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error(await resp.text());
        cargarVacantes();
    } catch (err) {
        alert('Error al eliminar: ' + err.message);
    }
}