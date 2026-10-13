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
        <td class="celda-truncada" title="${escaparHtml(v.titulo)}"><b>${escaparHtml(v.titulo) || '—'}</b></td>
        <td class="celda-truncada" title="${escaparHtml(v.empresa)}">${escaparHtml(v.empresa) || '—'}</td>
        <td>${escaparHtml(v.area) || '—'}</td>
        <td>${v.fecha || '—'}</td>
        <td>${v.totalPostulaciones ?? 0}</td>
        <td><span class="badge-estado ${badgeClase}">${v.estado || '—'}</span></td>
        <td>
            <div class="acciones-fila">
                <button class="btn-tabla btn-cerrar-vacante" ${v.estado === 'CERRADA' ? 'disabled' : ''}>Cerrar</button>
                <button class="btn-tabla btn-tabla-peligro btn-eliminar-vacante">Eliminar</button>
            </div>
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