/* ============================================
   EMPRESAS ALIADAS — Carga de empresas reales
============================================ */

window.addEventListener('load', async () => {
    const contenedor = document.getElementById('empresasList');
    const resultsCount = document.getElementById('resultsCount');

    try {
        const response = await fetch('/api/empresas');
        if (!response.ok) throw new Error('No se pudieron cargar las empresas.');

        const empresas = await response.json();

        if (empresas.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 50px 20px; color: var(--slate); background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius);">
                    <p style="font-size: 16px; margin-bottom: 6px; color: var(--ink);">Aún no hay empresas registradas.</p>
                </div>`;
            resultsCount.textContent = '0 organizaciones';
            return;
        }

        resultsCount.textContent = `Mostrando ${empresas.length} ${empresas.length === 1 ? 'organización' : 'organizaciones'}`;

        empresas.forEach((empresa) => {
            const iniciales = empresa.razonSocial ? empresa.razonSocial.substring(0, 2).toUpperCase() : 'EM';
            const logoHTML = empresa.logoUrl
                ? `<img src="${empresa.logoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`
                : iniciales;

            const html = `
            <div class="job-card">
                <div class="company-logo" style="background: var(--ink); color: var(--gold); overflow: hidden;">${logoHTML}</div>
                <div>
                    <div class="job-top-row">
                        <span class="job-title">${empresa.razonSocial}</span>
                        ${empresa.sector ? `<span class="badge-new">${empresa.sector}</span>` : ''}
                    </div>
                    <div class="job-company">
                        ${empresa.descripcion || 'Sin descripción disponible.'}
                        ${empresa.ciudad ? ` <b>Sede: ${empresa.ciudad}</b>` : ''}
                    </div>
                </div>
                <div class="job-side">
                    <span class="job-salary">${empresa.vacantesActivas} Vacante${empresa.vacantesActivas === 1 ? '' : 's'} Activa${empresa.vacantesActivas === 1 ? '' : 's'}</span>
                    <button class="btn-apply" onclick="verPerfilEmpresa(${empresa.id})">Ver Perfil</button>
                </div>
            </div>`;

            contenedor.insertAdjacentHTML('beforeend', html);
        });

    } catch (err) {
        contenedor.innerHTML = `<p style="color:red;">Error al cargar empresas: ${err.message}</p>`;
    }
});

function verPerfilEmpresa(id) {
    // Pendiente: página de detalle de empresa
    window.location.href = `/private/trabajador/empresa?id=${id}`;
}