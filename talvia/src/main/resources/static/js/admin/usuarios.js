/* ============================================
   ADMIN — Gestión de usuarios
   Endpoints:
   GET  /api/admin/usuarios?rol=&activo=&q=&page=
        → { contenido: [...], paginaActual, totalPaginas }
   GET  /api/admin/usuarios/{id}       → detalle completo
   PUT  /api/admin/usuarios/{id}/estado { activo: true|false }
============================================ */

let paginaActual = 1;
let debounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();

    document.getElementById('filtro-rol').addEventListener('change', () => { paginaActual = 1; cargarUsuarios(); });
    document.getElementById('filtro-estado').addEventListener('change', () => { paginaActual = 1; cargarUsuarios(); });

    document.getElementById('buscar-usuario').addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => { paginaActual = 1; cargarUsuarios(); }, 400);
    });

    document.getElementById('btn-limpiar-filtros-usuarios').addEventListener('click', () => {
        document.getElementById('filtro-rol').value = '';
        document.getElementById('filtro-estado').value = '';
        document.getElementById('buscar-usuario').value = '';
        paginaActual = 1;
        cargarUsuarios();
    });

    document.getElementById('btn-cerrar-detalle-usuario').addEventListener('click', () => {
        document.getElementById('modalDetalleUsuario').style.display = 'none';
    });

    document.getElementById('modalDetalleUsuario').addEventListener('click', (e) => {
        if (e.target.id === 'modalDetalleUsuario') {
            e.target.style.display = 'none';
        }
    });
});

async function cargarUsuarios() {
    const tbody = document.getElementById('usuarios-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="admin-table-loading">Cargando usuarios...</td></tr>';

    const query = construirQueryParams({
        rol: document.getElementById('filtro-rol').value,
        activo: document.getElementById('filtro-estado').value,
        q: document.getElementById('buscar-usuario').value.trim(),
        page: paginaActual
    });

    try {
        const resp = await fetch(`/api/admin/usuarios?${query}`);
        if (!resp.ok) throw new Error('No se pudieron cargar los usuarios.');
        const data = await resp.json();

        if (!data.contenido || data.contenido.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="admin-table-empty">No se encontraron usuarios.</td></tr>';
        } else {
            tbody.innerHTML = '';
            data.contenido.forEach(u => tbody.appendChild(crearFilaUsuario(u)));
        }

        renderizarPaginacionAdmin(document.getElementById('paginacion'), data.paginaActual || 1, data.totalPaginas || 1, (p) => {
            paginaActual = p;
            cargarUsuarios();
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="admin-table-empty" style="color:#d93838;">Error: ${err.message}</td></tr>`;
    }
}

function crearFilaUsuario(u) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><b>${u.nombre || '—'}</b></td>
        <td>${u.email || '—'}</td>
        <td>${u.rol || '—'}</td>
        <td>${u.ciudad || '—'}</td>
        <td>${u.fechaRegistro || '—'}</td>
        <td><span class="badge-estado ${u.activo ? 'badge-activo' : 'badge-inactivo'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn-tabla btn-ver-usuario" data-id="${u.id}">Ver</button>
            <button class="btn-tabla ${u.activo ? 'btn-tabla-peligro' : ''}" data-id="${u.id}" data-activo="${u.activo}">${u.activo ? 'Desactivar' : 'Activar'}</button>
        </td>
    `;
    tr.querySelector('.btn-ver-usuario').addEventListener('click', () => verDetalleUsuario(u.id));
    tr.querySelectorAll('.btn-tabla')[1].addEventListener('click', () => toggleEstadoUsuario(u.id, u.activo));
    return tr;
}

async function verDetalleUsuario(id) {
    try {
        const resp = await fetch(`/api/admin/usuarios/${id}`);
        if (!resp.ok) throw new Error('No se pudo cargar el detalle.');
        const u = await resp.json();

        document.getElementById('detalle-usuario-grid').innerHTML = `
            <div><div class="detalle-item-label">Nombre completo</div><div class="detalle-item-value">${u.nombre || '—'}</div></div>
            <div><div class="detalle-item-label">Correo</div><div class="detalle-item-value">${u.email || '—'}</div></div>
            <div><div class="detalle-item-label">Rol</div><div class="detalle-item-value">${u.rol || '—'}</div></div>
            <div><div class="detalle-item-label">Ciudad</div><div class="detalle-item-value">${u.ciudad || '—'}</div></div>
            <div><div class="detalle-item-label">Teléfono</div><div class="detalle-item-value">${u.telefono || '—'}</div></div>
            <div><div class="detalle-item-label">Fecha de registro</div><div class="detalle-item-value">${u.fechaRegistro || '—'}</div></div>
        `;
        document.getElementById('modalDetalleUsuario').style.display = 'flex';
    } catch (err) {
        showToastAdmin('Error: ' + err.message, 'error');
    }
}

async function toggleEstadoUsuario(id, activoActual) {
    try {
        const resp = await fetch(`/api/admin/usuarios/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: !activoActual })
        });
        if (!resp.ok) throw new Error(await resp.text());
        cargarUsuarios();
    } catch (err) {
        showToastAdmin('Error al actualizar: ' + err.message, 'error');
    }
}

function showToastAdmin(msg, tipo) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast ${tipo === 'error' ? 'error' : 'success'}`;
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3800);
}