/* ============================================
   DASHBOARD EMPRESA — Buzón de postulaciones y modal de CV
============================================ */

document.addEventListener('DOMContentLoaded', () => {
    cargarBuzon();
    document.getElementById('btnCerrarCV').addEventListener('click', () => {
        document.getElementById('modalVistaCV').style.display = 'none';
    });
});

async function cargarBuzon() {
    const cont = document.getElementById('lista-candidatos-gmail');
    const badge = document.getElementById('badge-total');

    try {
        const resp = await fetch('/api/empresa/postulaciones');
        if (!resp.ok) throw new Error('No se pudieron cargar las postulaciones.');
        const candidatos = await resp.json();

        badge.textContent = candidatos.length + " Candidatos";
        cont.innerHTML = '';

        if (candidatos.length === 0) {
            cont.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--slate);">No tienes candidatos aún.</div>`;
            return;
        }

        candidatos.forEach((p) => {
            const row = document.createElement('div');
            row.className = 'gmail-row gmail-unread';
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; background: #e2e8f0; border-radius: 50%; display: flex; align-items:center; justify-content:center; font-size: 20px;">👤</div>
                    <div>
                        <div style="color: var(--ink); font-size: 14px;"><b>${p.nombreCompleto || 'Candidato'}</b></div>
                        <div style="font-size: 12px; color: var(--slate);">Postuló a: <span style="color: var(--gold-deep);">${p.vacanteTitulo}</span> • ${p.fecha}</div>
                        <button type="button" data-id="${p.id}" class="btn-ver-perfil" style="background: none; border: none; color: #3182ce; font-size: 12px; font-weight: bold; cursor: pointer; padding: 0; margin-top: 4px; text-decoration: underline;">Ver Perfil Completo y Respuestas</button>
                    </div>
                </div>
                <div>
                    <select data-id="${p.id}" class="select-estado" style="padding: 6px; background: var(--bg); color: var(--ink); border: 1px solid var(--line); border-radius: 4px;">
                        <option value="PENDIENTE" ${p.estado === 'PENDIENTE' ? 'selected' : ''}>⏳ Pendiente</option>
                        <option value="EN_PROCESO" ${p.estado === 'EN_PROCESO' ? 'selected' : ''}>🔄 En Proceso</option>
                        <option value="ACEPTADO" ${p.estado === 'ACEPTADO' ? 'selected' : ''}>✅ Aceptado</option>
                        <option value="RECHAZADO" ${p.estado === 'RECHAZADO' ? 'selected' : ''}>❌ Rechazado</option>
                    </select>
                </div>
            `;
            cont.appendChild(row);
        });

        cont.querySelectorAll('.btn-ver-perfil').forEach(btn => {
            btn.addEventListener('click', () => verCurriculum(btn.dataset.id));
        });
        cont.querySelectorAll('.select-estado').forEach(sel => {
            sel.addEventListener('change', () => actualizarEstado(sel.dataset.id, sel.value));
        });

    } catch (err) {
        cont.innerHTML = `<p style="color:red; padding:20px;">Error: ${err.message}</p>`;
    }
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