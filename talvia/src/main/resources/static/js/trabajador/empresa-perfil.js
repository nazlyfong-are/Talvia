/* ============================================
   PERFIL PÚBLICO DE EMPRESA — datos + sus vacantes activas
============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const empresaId = params.get('id');

    if (!empresaId) {
        document.getElementById('e-nombre').textContent = 'Empresa no encontrada';
        return;
    }

    cargarEmpresa(empresaId);
    cargarVacantesDeEmpresa(empresaId);
});

async function cargarEmpresa(id) {
    try {
        const resp = await fetch(`/api/empresas/${id}`);
        if (!resp.ok) throw new Error('No se pudo cargar la empresa.');
        const e = await resp.json();

        // Quita el efecto skeleton de los campos del encabezado
        document.querySelectorAll('.hero-skel').forEach(el => {
            el.classList.remove('skeleton-loader', 'skeleton-text');
            el.style.width = '';
            el.style.display = '';
        });

        document.getElementById('e-nombre').textContent = e.razonSocial || 'Empresa';
        document.getElementById('e-sector').textContent = e.sector || 'Sector no especificado';
        document.getElementById('e-ubicacion-info').textContent =
            `📍 ${e.ciudad || 'Ciudad no especificada'}${e.numeroEmpleados ? ' · ' + e.numeroEmpleados + ' empleados' : ''}`;
        document.getElementById('e-descripcion').textContent = e.descripcion || 'Esta empresa aún no ha agregado una descripción.';

        const logoCont = document.getElementById('e-logo');
        logoCont.innerHTML = e.logoUrl
            ? `<img src="${e.logoUrl}" alt="Logo">`
            : (e.razonSocial ? e.razonSocial.substring(0, 2).toUpperCase() : 'EM');

        if (e.sitioWeb) {
            const link = document.getElementById('e-sitio-web');
            link.href = e.sitioWeb.startsWith('http') ? e.sitioWeb : `https://${e.sitioWeb}`;
            link.classList.remove('oculto');
        }

    } catch (err) {
        document.getElementById('e-nombre').textContent = 'Error al cargar la empresa';
        console.error(err);
    }
}

async function cargarVacantesDeEmpresa(empresaId) {
    const cont = document.getElementById('e-vacantes-list');
    const countEl = document.getElementById('e-vacantes-count');

    try {
        const resp = await fetch(`/api/vacantes/empresa/${empresaId}`);
        if (!resp.ok) throw new Error('No se pudieron cargar las vacantes.');
        const vacantes = await resp.json();

        countEl.textContent = `${vacantes.length} ${vacantes.length === 1 ? 'vacante activa' : 'vacantes activas'}`;

        if (vacantes.length === 0) {
            cont.innerHTML = `
                <div style="text-align:center; padding:40px; color:var(--slate); background:var(--panel); border:1px solid var(--line); border-radius:var(--radius);">
                    Esta empresa no tiene vacantes activas en este momento.
                </div>`;
            return;
        }

        cont.innerHTML = '';
        vacantes.forEach(v => {
            const html = `
            <div class="job-card">
                <div class="company-logo" style="background: var(--ink); color: var(--gold);">
                    ${v.titulo ? v.titulo.substring(0,2).toUpperCase() : 'VA'}
                </div>
                <div class="job-main">
                    <div class="job-top-row">
                        <div class="job-title">${v.titulo}</div>
                    </div>
                    <div class="job-company">${v.ubicacion || ''}</div>
                    <div class="tag-row">
                        ${v.modalidad ? `<span class="tag">${v.modalidad}</span>` : ''}
                        ${v.experiencia !== undefined && v.experiencia !== null ? `<span class="tag tag-exp">${v.experiencia}+ años exp.</span>` : ''}
                    </div>
                </div>
                <div class="job-side">
                    <div class="job-salary">${v.salario || ''}</div>
                    <button class="btn-apply" onclick="window.location.href='/private/trabajador/vacante?id=${v.id}'">Ver vacante</button>
                </div>
            </div>`;
            cont.insertAdjacentHTML('beforeend', html);
        });

    } catch (err) {
        cont.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    finally { window.location.href = '/public/login'; }
});