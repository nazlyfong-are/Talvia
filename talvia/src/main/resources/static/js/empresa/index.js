/* ============================================
   DASHBOARD EMPRESA — Conectado al backend real
============================================ */

let candidatosCache = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarPerfilEmpresa();
    cargarBuzon();
    cargarMisVacantes();

    document.querySelectorAll('.emp-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => cambiarSeccion(btn.dataset.target, btn));
    });

    document.getElementById('form-publicar-vacante').addEventListener('submit', publicarVacante);
    document.getElementById('btn-guardar-perfil').addEventListener('click', guardarPerfilEmpresa);
    document.getElementById('input-logo-emp').addEventListener('change', subirLogoEmpresa);
    document.getElementById('btnCerrarCV').addEventListener('click', () => {
        document.getElementById('modalVistaCV').style.display = 'none';
    });
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
});

function cambiarSeccion(idSeccion, boton) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.emp-nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(idSeccion).classList.add('active');
    boton.classList.add('active');
}

async function cerrarSesion() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    finally { window.location.href = '/public/login'; }
}

function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ============================================
   PERFIL DE EMPRESA
============================================ */

async function cargarPerfilEmpresa() {
    try {
        const resp = await fetch('/api/empresa/perfil');
        if (!resp.ok) throw new Error('No se pudo cargar el perfil.');
        const p = await resp.json();

        document.getElementById('emp-correo').value = p.correoElectronico || '';
        document.getElementById('emp-nombre').value = p.razonSocial || '';
        document.getElementById('emp-ciudad').value = p.ciudad || '';
        document.getElementById('emp-sector').value = p.sector || '';
        document.getElementById('emp-descripcion').value = p.descripcion || '';
        document.getElementById('emp-sitio-web').value = p.sitioWeb || '';
        if (p.numeroEmpleados) document.getElementById('emp-empleados').value = p.numeroEmpleados;

        if (p.logoUrl) {
            document.getElementById('logo-preview').innerHTML =
                `<img src="${p.logoUrl}" style="width:100%; height:100%; object-fit:cover;">`;
        }
    } catch (err) {
        showToast('Error cargando el perfil: ' + err.message, 'error');
    }
}

async function guardarPerfilEmpresa() {
    const body = {
        razonSocial: document.getElementById('emp-nombre').value.trim(),
        ciudad: document.getElementById('emp-ciudad').value.trim(),
        sector: document.getElementById('emp-sector').value.trim(),
        descripcion: document.getElementById('emp-descripcion').value.trim(),
        sitioWeb: document.getElementById('emp-sitio-web').value.trim(),
        numeroEmpleados: document.getElementById('emp-empleados').value
    };

    try {
        const resp = await fetch('/api/empresa/perfil', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(await resp.text());
        showToast('✓ Perfil de empresa guardado.', 'success');
    } catch (err) {
        showToast('Error al guardar: ' + err.message, 'error');
    }
}

async function subirLogoEmpresa(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const formData = new FormData();
    formData.append('archivo', archivo);
    try {
        const resp = await fetch('/api/empresa/perfil/logo', { method: 'POST', body: formData });
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        document.getElementById('logo-preview').innerHTML =
            `<img src="${data.logoUrl}" style="width:100%; height:100%; object-fit:cover;">`;
        showToast('✓ Logo actualizado.', 'success');
    } catch (err) {
        showToast('Error al subir el logo: ' + err.message, 'error');
    }
}

/* ============================================
   PUBLICAR / LISTAR / ELIMINAR VACANTES
============================================ */

async function publicarVacante(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-publicar');

    const body = {
        titulo: document.getElementById('vac-titulo').value.trim(),
        ubicacion: document.getElementById('vac-ubicacion').value.trim(),
        salarioTexto: document.getElementById('vac-salario').value.trim(),
        area: document.getElementById('vac-area').value,
        expMinimaAnios: Number(document.getElementById('vac-experiencia').value),
        modalidad: document.getElementById('vac-modalidad').value,
        nivelCargo: document.getElementById('vac-nivel').value,
        descripcion: document.getElementById('vac-descripcion').value.trim(),
        requisitosTexto: document.getElementById('vac-requisitos').value.trim(),
        beneficios: document.getElementById('vac-beneficios').value.trim()
    };

    btn.classList.add('loading');
    try {
        const resp = await fetch('/api/empresa/vacantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(await resp.text());
        showToast('✓ ¡Vacante publicada exitosamente!', 'success');
        e.target.reset();
        cargarMisVacantes();
    } catch (err) {
        showToast('Error al publicar: ' + err.message, 'error');
    } finally {
        btn.classList.remove('loading');
    }
}

async function cargarMisVacantes() {
    const cont = document.getElementById('lista-mis-vacantes');
    try {
        const resp = await fetch('/api/empresa/vacantes');
        if (!resp.ok) throw new Error('No se pudieron cargar tus vacantes.');
        const vacantes = await resp.json();

        if (vacantes.length === 0) {
            cont.innerHTML = `<p style="font-size: 13px; color: var(--slate); text-align: center; padding: 20px 0;">Aún no has publicado ninguna vacante.</p>`;
            return;
        }

        cont.innerHTML = '';
        vacantes.forEach(v => {
            const fila = document.createElement('div');
            fila.style.cssText = "display:flex; justify-content: space-between; align-items: center; gap: 12px; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; flex-wrap: wrap;";
            fila.innerHTML = `
                <div>
                    <div style="font-weight: 600; color: var(--ink); font-size: 14px;">${v.titulo || 'Sin título'}</div>
                    <div style="font-size: 12.5px; color: var(--slate);">${v.ubicacion || ''} ${v.salario ? '• ' + v.salario : ''}</div>
                </div>
                <button type="button" data-id="${v.id}" class="btn-eliminar-vacante" style="background: #fdf2f2; color: #d93838; border: 1px solid #f8d7d7; padding: 7px 14px; border-radius: 4px; font-size: 12.5px; font-weight: 600; cursor: pointer;">🗑 Eliminar</button>
            `;
            cont.appendChild(fila);
        });

        cont.querySelectorAll('.btn-eliminar-vacante').forEach(btn => {
            btn.addEventListener('click', () => eliminarVacante(btn.dataset.id, btn));
        });
    } catch (err) {
        cont.innerHTML = `<p style="color:red; font-size:13px;">Error: ${err.message}</p>`;
    }
}

async function eliminarVacante(id, boton) {
    const titulo = boton.closest('div[style*="flex"]').querySelector('div > div').textContent;
    if (!confirm(`¿Seguro que quieres eliminar la vacante "${titulo}"? Esta acción no se puede deshacer.`)) return;

    try {
        const resp = await fetch(`/api/empresa/vacantes/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error(await resp.text());
        showToast('✓ Vacante eliminada.', 'success');
        cargarMisVacantes();
    } catch (err) {
        showToast('Error al eliminar: ' + err.message, 'error');
    }
}

/* ============================================
   BUZÓN DE POSTULACIONES
============================================ */

async function cargarBuzon() {
    const cont = document.getElementById('lista-candidatos-gmail');
    const badge = document.getElementById('badge-total');

    try {
        const resp = await fetch('/api/empresa/postulaciones');
        if (!resp.ok) throw new Error('No se pudieron cargar las postulaciones.');
        candidatosCache = await resp.json();

        badge.textContent = candidatosCache.length + " Candidatos";
        cont.innerHTML = '';

        if (candidatosCache.length === 0) {
            cont.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--slate);">No tienes candidatos aún.</div>`;
            return;
        }

        candidatosCache.forEach((p) => {
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

    const cvContainer = document.getElementById('cv-archivo-completo-container');
    cvContainer.innerHTML = c.cvArchivoUrl
        ? `<a href="${c.cvArchivoUrl}" target="_blank" style="display:inline-block; background: var(--ink); color: #fff; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">📄 Descargar Hoja de Vida Completa</a>`
        : '';
}