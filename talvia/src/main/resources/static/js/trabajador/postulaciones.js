/* MIS POSTULACIONES — Listado, búsqueda y orden*/

let postulacionesData = [];
let ordenActual = 'recientes';
let busquedaActual = '';

document.addEventListener('DOMContentLoaded', () => {
    cargarPostulaciones();

    document.getElementById('searchInput').addEventListener('input', (e) => {
        busquedaActual = e.target.value.toLowerCase().trim();
        renderizar();
    });

    document.getElementById('sortSelect').addEventListener('change', (e) => {
        ordenActual = e.target.value;
        renderizar();
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try { await fetch('/api/auth/logout', { method: 'POST' }); }
        finally { window.location.href = '/public/login'; }
    });
});

async function cargarPostulaciones() {
    const cont = document.getElementById('postulacionesList');
    try {
        const resp = await fetch('/api/postulaciones/mias');
        if (!resp.ok) throw new Error('No se pudieron cargar tus postulaciones.');
        postulacionesData = await resp.json();
        renderizar();
    } catch (err) {
        cont.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
}

const etiquetasEstado = {
    PENDIENTE: '⏳ Pendiente',
    EN_PROCESO: '🔄 En Proceso',
    ACEPTADO: '✅ Aceptado',
    RECHAZADO: '❌ Rechazado'
};

function renderizar() {
    const cont = document.getElementById('postulacionesList');
    const resultsCount = document.getElementById('resultsCount');

    let lista = [...postulacionesData];

    // busqueda por palabra clave (titulo o empresa)
    if (busquedaActual) {
        lista = lista.filter(p =>
            (p.titulo || '').toLowerCase().includes(busquedaActual) ||
            (p.empresa || '').toLowerCase().includes(busquedaActual)
        );
    }

    // Orden por fecha
    lista.sort((a, b) => {
        const fechaA = new Date(a.fechaIso || '2000-01-01').getTime();
        const fechaB = new Date(b.fechaIso || '2000-01-01').getTime();
        return ordenActual === 'recientes' ? fechaB - fechaA : fechaA - fechaB;
    });

    resultsCount.textContent = `${lista.length} ${lista.length === 1 ? 'postulación encontrada' : 'postulaciones encontradas'}`;

    if (lista.length === 0) {
        cont.innerHTML = `
            <div class="postulacion-empty">
                <p style="font-size:16px; margin-bottom:6px; color:var(--ink);">
                    ${postulacionesData.length === 0 ? 'Aún no te has postulado a ninguna vacante.' : 'No hay resultados para tu búsqueda.'}
                </p>
                <p style="font-size:13px;">
                    ${postulacionesData.length === 0 ? 'Explora las vacantes disponibles y envía tu hoja de vida.' : 'Prueba con otra palabra clave.'}
                </p>
            </div>`;
        return;
    }

    cont.innerHTML = '';
    lista.forEach(p => {
        const logoHTML = p.logoUrl
            ? `<img src="${p.logoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`
            : (p.empresa ? p.empresa.substring(0, 2).toUpperCase() : 'EM');

        const estadoClase = `estado-${p.estado || 'PENDIENTE'}`;
        const estadoTexto = etiquetasEstado[p.estado] || p.estado || 'Pendiente';

        const html = `
        <div class="job-card">
            <div class="company-logo" style="background: var(--ink); color: var(--gold); overflow: hidden;">${logoHTML}</div>
            <div class="job-main">
                <div class="job-top-row">
                    <div class="job-title">${p.titulo || 'Vacante'}</div>
                    <span class="estado-badge ${estadoClase}">${estadoTexto}</span>
                </div>
                <div class="job-company">Empresa: <b>${p.empresa || ''}</b> · ${p.ubicacion || ''}</div>
                <div class="tag-row">
    <span class="tag">Postulado el ${p.fechaTexto || '—'}</span>
    ${p.fechaVistaTexto
                ? `<span class="tag" style="background:var(--green-bg); color:var(--green);">👁 Vista el ${p.fechaVistaTexto}</span>`
                : `<span class="tag" style="color:var(--slate);">Aún no ha sido vista</span>`}
</div>
            </div>
            <div class="job-side">
                <div class="job-salary">${p.salario || ''}</div>
                <button class="btn-apply" onclick="verVacante(${p.vacanteId})">Ver vacante</button>
            </div>
        </div>`;

        cont.insertAdjacentHTML('beforeend', html);
    });
}

function verVacante(vacanteId) {
    window.location.href = `/private/trabajador/vacante?id=${vacanteId}`;
}