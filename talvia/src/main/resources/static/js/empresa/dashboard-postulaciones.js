/* ============================================
   DASHBOARD EMPRESA — Buzón agrupado por vacante,
   con filtros por estado y búsqueda de candidato
============================================ */

let candidatosData = [];
let filtroEstadoActual = 'TODOS';
let busquedaCandidato = '';

document.addEventListener('DOMContentLoaded', () => {
    cargarBuzon();
    document.getElementById('btnCerrarCV').addEventListener('click', () => {
        document.getElementById('modalVistaCV').style.display = 'none';
    });

    document.getElementById('searchCandidatos').addEventListener('input', (e) => {
        busquedaCandidato = e.target.value.toLowerCase().trim();
        renderizarAcordeon();
    });

    document.querySelectorAll('#filtrosEstado .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#filtrosEstado .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filtroEstadoActual = chip.dataset.estado;
            renderizarAcordeon();
        });
    });
});

async function cargarBuzon() {
    const cont = document.getElementById('acordeon-vacantes');
    const badge = document.getElementById('badge-total');

    try {
        const resp = await fetch('/api/empresa/postulaciones');
        if (!resp.ok) throw new Error('No se pudieron cargar las postulaciones.');
        candidatosData = await resp.json();

        badge.textContent = candidatosData.length + " Candidatos";
        actualizarContadoresChips();
        renderizarAcordeon();

    } catch (err) {
        cont.innerHTML = `<p style="color:red; padding:20px;">Error: ${err.message}</p>`;
    }
}

function actualizarContadoresChips() {
    const conteos = { TODOS: candidatosData.length, PENDIENTE: 0, EN_PROCESO: 0, ACEPTADO: 0, RECHAZADO: 0 };
    candidatosData.forEach(c => {
        if (conteos[c.estado] !== undefined) conteos[c.estado]++;
    });
    document.querySelectorAll('#filtrosEstado .chip').forEach(chip => {
        const estado = chip.dataset.estado;
        chip.querySelector('.chip-count').textContent = conteos[estado] || 0;
    });
}

function renderizarAcordeon() {
    const cont = document.getElementById('acordeon-vacantes');
    cont.innerHTML = '';

    let lista = [...candidatosData];

    if (filtroEstadoActual !== 'TODOS') {
        lista = lista.filter(c => c.estado === filtroEstadoActual);
    }
    if (busquedaCandidato) {
        lista = lista.filter(c => (c.nombreCompleto || '').toLowerCase().includes(busquedaCandidato));
    }

    if (lista.length === 0) {
        cont.innerHTML = `<div class="sin-candidatos">No hay candidatos que coincidan con el filtro actual.</div>`;
        return;
    }

    // Agrupar por vacante
    const grupos = {};
    lista.forEach(c => {
        const key = c.vacanteId;
        if (!grupos[key]) grupos[key] = { titulo: c.vacanteTitulo, candidatos: [] };
        grupos[key].candidatos.push(c);
    });

    Object.entries(grupos).forEach(([vacanteId, grupo]) => {
        grupo.candidatos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const acordeon = document.createElement('div');
        acordeon.className = 'vacante-acordeon';
        acordeon.innerHTML = `
            <div class="vacante-acordeon-header">
                <div class="vacante-acordeon-titulo">
                    ${grupo.titulo}
                    <span class="vacante-acordeon-count">${grupo.candidatos.length}</span>
                </div>
                <span class="vacante-acordeon-arrow">▾</span>
            </div>
            <div class="vacante-acordeon-body">
                <div class="gmail-inbox" style="border:none; border-radius:0;"></div>
            </div>
        `;

        const header = acordeon.querySelector('.vacante-acordeon-header');
        header.addEventListener('click', () => acordeon.classList.toggle('open'));

        const inboxCont = acordeon.querySelector('.gmail-inbox');
        grupo.candidatos.forEach(p => {
            const row = document.createElement('div');
            row.className = 'gmail-row';
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; background: #e2e8f0; border-radius: 50%; display: flex; align-items:center; justify-content:center; font-size: 20px;">👤</div>
                    <div>
                        <div style="color: var(--ink); font-size: 14px;"><b>${p.nombreCompleto || 'Candidato'}</b></div>
                        <div style="font-size: 12px; color: var(--slate);">Postuló el ${p.fecha}</div>
                        <button type="button" class="btn-ver-perfil" data-id="${p.id}" style="background: none; border: none; color: #3182ce; font-size: 12px; font-weight: bold; cursor: pointer; padding: 0; margin-top: 4px; text-decoration: underline;">Ver Perfil Completo y Respuestas</button>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="estado-badge estado-${p.estado || 'PENDIENTE'}">${etiquetaEstado(p.estado)}</span>
                    <select data-id="${p.id}" class="select-estado" style="padding: 6px; background: var(--bg); color: var(--ink); border: 1px solid var(--line); border-radius: 4px;">
                        <option value="PENDIENTE" ${p.estado === 'PENDIENTE' ? 'selected' : ''}>⏳ Pendiente</option>
                        <option value="EN_PROCESO" ${p.estado === 'EN_PROCESO' ? 'selected' : ''}>🔄 En Proceso</option>
                        <option value="ACEPTADO" ${p.estado === 'ACEPTADO' ? 'selected' : ''}>✅ Aceptado</option>
                        <option value="RECHAZADO" ${p.estado === 'RECHAZADO' ? 'selected' : ''}>❌ Rechazado</option>
                    </select>
                </div>
            `;
            inboxCont.appendChild(row);
        });

        cont.appendChild(acordeon);
    });

    cont.querySelectorAll('.btn-ver-perfil').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            verCurriculum(btn.dataset.id);
        });
    });
    cont.querySelectorAll('.select-estado').forEach(sel => {
        sel.addEventListener('click', (e) => e.stopPropagation());
        sel.addEventListener('change', () => actualizarEstado(sel.dataset.id, sel.value));
    });
}

function etiquetaEstado(estado) {
    const etiquetas = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En Proceso', ACEPTADO: 'Aceptado', RECHAZADO: 'Rechazado' };
    return etiquetas[estado] || estado || 'Pendiente';
}

async function actualizarEstado(id, estado) {
    try {
        const resp = await fetch(`/api/empresa/postulaciones/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
        if (!resp.ok) throw new Error(await resp.text());
        showToast('✓ Estado actualizado.', 'success');

        const candidato = candidatosData.find(c => c.id == id);
        if (candidato) candidato.estado = estado;
        actualizarContadoresChips();
        renderizarAcordeon();

    } catch (err) {
        showToast('Error al actualizar estado: ' + err.message, 'error');
    }
}

async function verCurriculum(id) {
    try {
        const resp = await fetch(`/api/empresa/postulaciones/${id}`);
        if (!resp.ok) throw new Error(await resp.text());
        const detalle = await resp.json();

        document.getElementById('cv-id').textContent = detalle.id;
        document.getElementById('cv-vacante-titulo').textContent = detalle.vacanteTitulo;
        document.getElementById('cv-fecha').textContent = detalle.fecha;
        document.getElementById('cv-salario').textContent = detalle.salarioEsperado || 'No especificado';
        document.getElementById('cv-disponibilidad').textContent = detalle.disponibilidad || 'No especificada';
        document.getElementById('cv-experiencia-resumen').textContent = detalle.experienciaResumen || 'No proporcionó información adicional.';

        renderizarCandidato(detalle.candidato);

        const cvEnviadoContainer = document.getElementById('cv-archivo-completo-container');
        cvEnviadoContainer.innerHTML = detalle.cvEnviadoUrl
            ? `<a href="${detalle.cvEnviadoUrl}" target="_blank" style="display:inline-block; background: var(--ink); color: #fff; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">📄 Descargar "${detalle.cvEnviadoNombre}"</a>`
            : '';

        document.getElementById('modalVistaCV').style.display = 'flex';
    } catch (err) {
        showToast('Error al cargar el perfil: ' + err.message, 'error');
    }
}

function renderizarCandidato(c) {
    if (!c) return;

    document.getElementById('cv-nombre').textContent = `${c.nombres || ''} ${c.primerApellido || ''} ${c.segundoApellido || ''}`.trim();
    document.getElementById('cv-cargo').textContent = c.especialidad || 'No especificado';
    document.getElementById('cv-contacto').textContent = `${c.correoElectronico || ''} · ${c.telefono || ''} · ${c.ciudad || ''}`;

    const expLista = document.getElementById('cv-experiencia-lista');
    expLista.innerHTML = '';
    (c.experiencias || []).forEach(exp => {
        expLista.innerHTML += `
            <div style="background: #f7fafc; padding: 12px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="display:flex; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                    <strong style="color:#1a202c; font-size: 14px;">${exp.cargo || ''}</strong>
                    <span style="color:#a37b2c; font-size: 12px; font-family: 'IBM Plex Mono', monospace;">${exp.fechaInicio || ''} — ${exp.trabajoActual ? 'Presente' : (exp.fechaFin || '')}</span>
                </div>
                <div style="color:#718096; font-size: 12.5px; margin-bottom: 4px;">${exp.empresaNombre || ''}</div>
                <div style="color:#4a5568; font-size: 13px;">${exp.descripcion || ''}</div>
            </div>`;
    });
    if (!expLista.innerHTML) expLista.innerHTML = '<p style="font-size: 13px; color: #a0aec0;">Sin información disponible.</p>';

    const eduLista = document.getElementById('cv-educacion-lista');
    eduLista.innerHTML = '';
    (c.formaciones || []).forEach(f => {
        const enlace = f.documentoUrl
            ? `<a href="${f.documentoUrl}" target="_blank" style="background: #e7f3ee; color: #2f7d5c; border: 1px solid #2f7d5c; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">⬇ Ver título</a>`
            : `<span style="font-size: 12px; color: #a0aec0;">Sin título adjunto</span>`;
        eduLista.innerHTML += `
            <div style="background: #f7fafc; padding: 12px 14px; border-radius: 6px; border: 1px solid #e2e8f0; display:flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                    <div style="color:#1a202c; font-weight: 600; font-size: 13.5px;">${f.titulo || ''}</div>
                    <div style="color:#718096; font-size: 12.5px;">${f.institucion || ''}</div>
                </div>
                ${enlace}
            </div>`;
    });
    if (!eduLista.innerHTML) eduLista.innerHTML = '<p style="font-size: 13px; color: #a0aec0;">Sin información disponible.</p>';

    const certLista = document.getElementById('cv-certificaciones-lista');
    certLista.innerHTML = '';
    (c.certificaciones || []).forEach(cert => {
        const enlace = cert.documentoUrl
            ? `<a href="${cert.documentoUrl}" target="_blank" style="background: #e7f3ee; color: #2f7d5c; border: 1px solid #2f7d5c; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none;">⬇ Ver certificado</a>`
            : `<span style="font-size: 12px; color: #a0aec0;">Sin documento adjunto</span>`;
        certLista.innerHTML += `
            <div style="background: #f7fafc; padding: 12px 14px; border-radius: 6px; border: 1px solid #e2e8f0; display:flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                    <div style="color:#1a202c; font-weight: 600; font-size: 13.5px;">${cert.nombre || ''}</div>
                    <div style="color:#718096; font-size: 12.5px;">${cert.entidadEmisora || ''}</div>
                </div>
                ${enlace}
            </div>`;
    });
    if (!certLista.innerHTML) certLista.innerHTML = '<p style="font-size: 13px; color: #a0aec0;">Sin información disponible.</p>';

    document.getElementById('cv-idiomas').innerHTML = (c.idiomas || [])
        .map(i => `<span class="cv-badge">${i.nombre}</span>`).join('') || 'No especificado';
    document.getElementById('cv-habilidades').innerHTML = (c.habilidadesTecnicas || [])
        .map(h => `<span class="cv-badge">${h.nombre}</span>`).join('') || 'No especificado';
}