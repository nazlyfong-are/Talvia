/* ============================================
   MIS FAVORITOS — Listado de vacantes guardadas
============================================ */

document.addEventListener('DOMContentLoaded', cargarFavoritos);

async function cargarFavoritos() {
    const cont = document.getElementById('favoritosList');
    try {
        const resp = await fetch('/api/trabajador/favoritos');
        if (!resp.ok) throw new Error('No se pudieron cargar tus vacantes guardadas.');
        const favoritos = await resp.json();

        document.getElementById('resultsCount').textContent =
            `${favoritos.length} ${favoritos.length === 1 ? 'vacante guardada' : 'vacantes guardadas'}`;

        if (favoritos.length === 0) {
            cont.innerHTML = `
                <div style="text-align:center; padding:50px 20px; color:var(--slate); background:var(--panel); border:1px solid var(--line); border-radius:var(--radius);">
                    <p style="font-size:16px; margin-bottom:6px; color:var(--ink);">Aún no has guardado ninguna vacante.</p>
                    <p style="font-size:13px;">Cuando encuentres una que te interese, dale clic al ☆ para guardarla aquí.</p>
                </div>`;
            return;
        }

        cont.innerHTML = '';
        favoritos.forEach(f => {
            const v = f.vacante;
            const logoHTML = v.logoUrl
                ? `<img src="${v.logoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">`
                : (v.empresa ? v.empresa.substring(0,2).toUpperCase() : 'EM');

            const html = `
            <div class="job-card">
                <div class="company-logo" style="background: var(--ink); color: var(--gold); overflow:hidden;">${logoHTML}</div>
                <div class="job-main">
                    <div class="job-top-row"><div class="job-title">${v.titulo}</div></div>
                    <div class="job-company">Empresa: <b>${v.empresa}</b> · ${v.ubicacion || ''}</div>
                </div>
                <div class="job-side">
                    <div class="job-salary">${v.salario || ''}</div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-apply" onclick="window.location.href='/private/trabajador/vacante?id=${v.id}'">Ver vacante</button>
                        <button class="btn-apply" data-vacante-id="${v.id}" style="border-color:#d93838; color:#d93838;" onclick="quitarFavorito(${v.id})">Quitar</button>
                    </div>
                </div>
            </div>`;
            cont.insertAdjacentHTML('beforeend', html);
        });

    } catch (err) {
        cont.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
}

async function quitarFavorito(vacanteId) {
    try {
        const resp = await fetch(`/api/trabajador/favoritos/${vacanteId}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error(await resp.text());
        cargarFavoritos();
    } catch (err) {
        alert('Error al quitar de favoritos: ' + err.message);
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    finally { window.location.href = '/public/login'; }
});