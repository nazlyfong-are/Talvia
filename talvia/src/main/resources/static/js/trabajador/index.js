/* ============================================
   DASHBOARD TRABAJADOR — Carga de vacantes reales
============================================ */

window.addEventListener('load', async () => {
    const contenedorIndex = document.getElementById('jobList');

    try {
        const response = await fetch('/api/vacantes/activas');
        if (!response.ok) throw new Error('No se pudieron cargar las vacantes.');

        const vacantes = await response.json();

        document.getElementById('statVacantes').textContent = vacantes.length;
        const empresasUnicas = new Set(vacantes.map(v => v.empresa)).size;
        document.getElementById('statEmpresas').textContent = empresasUnicas;

        if (vacantes.length === 0) {
            contenedorIndex.innerHTML = `
                <div style="text-align: center; padding: 50px 20px; color: var(--slate); background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius);">
                    <p style="font-size: 16px; margin-bottom: 6px; color: var(--ink);">Aún no hay vacantes publicadas.</p>
                    <p style="font-size: 13px;">Cuando una empresa aliada publique una oferta, aparecerá aquí.</p>
                </div>`;
            document.getElementById('resultsCount').textContent = '0 resultados encontrados';
            document.getElementById('paginationContainer').style.display = 'none';
            return;
        }

        const etiquetasModalidad = { presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido' };
        const etiquetasNivel = {
            entrada: 'Nivel de entrada',
            intermedio: 'Nivel intermedio',
            avanzado: 'Avanzado',
            coordinacion: 'Coordinación',
            gerencia: 'Gerencia'
        };

        vacantes.forEach((vacante) => {
            const logoHTML = vacante.logoUrl
                ? `<img src="${vacante.logoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`
                : (vacante.empresa ? vacante.empresa.substring(0, 2).toUpperCase() : 'NV');

            const salarioNumerico = (vacante.salario || '').replace(/[^0-9]/g, '') || '0';

            const htmlVacante = `
            <div class="job-card"
                 data-id="${vacante.id}"
                 data-area="${vacante.area || ''}"
                 data-experience="${vacante.experiencia || 0}"
                 data-modality="${vacante.modalidad || ''}"
                 data-level="${vacante.nivel || ''}"
                 data-salary="${salarioNumerico}"
                 data-date="${vacante.fecha || '2026-01-01'}">
                <div class="company-logo" style="background: var(--ink); color: var(--gold); overflow: hidden;">${logoHTML}</div>
                <div class="job-main">
                    <div class="job-top-row">
                        <div class="job-title">${vacante.titulo}</div>
                        <span class="badge-new" style="background: var(--green-bg); color: var(--green);">Nueva Oferta</span>
                    </div>
                    <div class="job-company">Empresa: <b>${vacante.empresa}</b> · ${vacante.ubicacion || ''}</div>
                    <div class="tag-row">
                        ${vacante.experiencia ? `<span class="tag tag-exp">${vacante.experiencia}+ años exp.</span>` : `<span class="tag tag-exp">Sin experiencia requerida</span>`}
                        ${vacante.modalidad ? `<span class="tag">${etiquetasModalidad[vacante.modalidad] || vacante.modalidad}</span>` : ''}
                        ${vacante.nivel ? `<span class="tag">${etiquetasNivel[vacante.nivel] || vacante.nivel}</span>` : ''}
                    </div>
                </div>
                <div class="job-side">
                    <div class="job-salary">${vacante.salario}</div>
                    <button class="btn-apply" onclick="abrirDetalleVacante(${vacante.id})">Ver vacante</button>
                </div>
            </div>`;

            contenedorIndex.insertAdjacentHTML('beforeend', htmlVacante);
        });

        // Ahora sí, con las tarjetas ya en el DOM, activamos filtros/paginación
        if (typeof aplicarFiltros === 'function') aplicarFiltros();

    } catch (err) {
        contenedorIndex.innerHTML = `<p style="color:red;">Error al cargar vacantes: ${err.message}</p>`;
    }
});

function abrirDetalleVacante(id) {
    window.location.href = `/private/trabajador/vacante?id=${id}`;
}

// ── LOGOUT ──
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
        window.location.href = '/public/login';
    }
});