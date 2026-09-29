/* ============================================
   ADMIN — Dashboard / Resumen general
   Endpoint esperado (pendiente de implementar):
   GET /api/admin/estadisticas
   → { totalTrabajadores, totalEmpresas, vacantesAbiertas,
       vacantesPausadas, totalPostulaciones, aceptadas, rechazadas,
       registrosPorSemana: [{ etiqueta: "Sem 1", total: 12 }, ...] }
============================================ */

document.addEventListener('DOMContentLoaded', cargarEstadisticas);

async function cargarEstadisticas() {
    try {
        const resp = await fetch('/api/admin/estadisticas');
        if (!resp.ok) throw new Error('No se pudieron cargar las estadísticas.');
        const data = await resp.json();
        pintarStats(data);
        pintarGrafico(data.registrosPorSemana || []);
    } catch (err) {
        document.getElementById('stats-grid').innerHTML =
            `<p style="color:#d93838;">Error: ${err.message}</p>`;
        document.getElementById('bar-chart').innerHTML =
            `<p style="color:#d93838;">Error al cargar el gráfico.</p>`;
    }
}

function pintarStats(data) {
    const totalPostulaciones = data.totalPostulaciones || 0;
    const tasaAceptacion = totalPostulaciones > 0
        ? Math.round((data.aceptadas / totalPostulaciones) * 100)
        : 0;

    document.getElementById('stats-grid').innerHTML = `
        <div class="stat-card">
            <div class="stat-card-label">Trabajadores</div>
            <div class="stat-card-value">${data.totalTrabajadores ?? 0}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-label">Empresas</div>
            <div class="stat-card-value">${data.totalEmpresas ?? 0}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-label">Vacantes abiertas / pausadas</div>
            <div class="stat-card-value">${data.vacantesAbiertas ?? 0} <span style="font-size:16px; color:var(--slate);">/ ${data.vacantesPausadas ?? 0}</span></div>
        </div>
        <div class="stat-card">
            <div class="stat-card-label">Tasa de aceptación</div>
            <div class="stat-card-value ${tasaAceptacion >= 50 ? 'accent-green' : 'accent-red'}">${tasaAceptacion}%</div>
            <div class="stat-card-sub">${data.aceptadas ?? 0} aceptadas de ${totalPostulaciones} postulaciones</div>
        </div>
    `;
}

function pintarGrafico(registros) {
    const cont = document.getElementById('bar-chart');
    cont.innerHTML = '';

    if (registros.length === 0) {
        cont.innerHTML = '<div class="admin-table-empty">Sin datos suficientes todavía.</div>';
        return;
    }

    const maxValor = Math.max(...registros.map(r => r.total), 1);

    registros.forEach(r => {
        const alturaPct = Math.max((r.total / maxValor) * 100, 3);
        const col = document.createElement('div');
        col.className = 'bar-chart-col';
        col.innerHTML = `
            <div class="bar-chart-bar" style="height:${alturaPct}%;" title="${r.total} registros"></div>
            <div class="bar-chart-label">${r.etiqueta}</div>
        `;
        cont.appendChild(col);
    });
}