/* ============================================
   PERFIL TRABAJADOR — Carga, edición y guardado real
   Incluye: datos básicos, foto, hasta 4 CVs, formación,
   experiencia, certificaciones, idiomas y habilidades
============================================ */

let perfilActual = null;
let editando = false;
const MAX_CVS = 4;

/* ── CARGA INICIAL ── */
window.addEventListener('load', async () => {
    try {
        const response = await fetch('/api/trabajador/perfil');
        if (!response.ok) throw new Error('No se pudo cargar el perfil.');
        perfilActual = await response.json();
        pintarPerfil(perfilActual);
    } catch (err) {
        alert('Error cargando el perfil: ' + err.message);
    }
    cargarCvs();
});

function pintarPerfil(p) {
    document.getElementById('campo-nombres').textContent = p.nombres || '';
    document.getElementById('campo-primer-apellido').textContent = p.primerApellido || '';
    document.getElementById('campo-segundo-apellido').textContent = p.segundoApellido || '';
    document.getElementById('campo-especialidad').textContent = p.especialidad || 'Sin especialidad definida';
    document.getElementById('campo-ciudad').textContent = p.ciudad || 'Sin ciudad';
    document.getElementById('campo-correo').textContent = p.correoElectronico || '';
    document.getElementById('campo-telefono').textContent = p.telefono || '';

    if (p.fotoUrl) document.getElementById('img-perfil').src = p.fotoUrl;

    pintarFormaciones(p.formaciones || []);
    pintarExperiencias(p.experiencias || []);
    pintarCertificaciones(p.certificaciones || []);
    pintarTags('idiomas-tags', p.idiomas || []);
    pintarTags('habilidades-tags', p.habilidadesTecnicas || []);
}

/* ── HOJAS DE VIDA (hasta 4) ── */
function pintarCvs(lista) {
    const cont = document.getElementById('cvs-container');
    const contador = document.getElementById('cvs-contador');
    cont.innerHTML = '';

    (lista || []).forEach(cv => {
        const div = document.createElement('div');
        div.className = 'cv-item';
        div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;';
        div.innerHTML = `
            <div>
                <div style="font-weight:600; font-size:14px; color:var(--ink);">${cv.nombre}</div>
                <a href="${cv.url}" target="_blank" style="font-size:12px; color:var(--green); font-weight:600;">📄 Ver documento</a>
            </div>
            <button type="button" class="btn-borrar-item btn-borrar-cv" data-id="${cv.id}">Eliminar</button>
        `;
        cont.appendChild(div);
    });

    contador.textContent = `(${(lista || []).length}/${MAX_CVS})`;

    const formSubir = document.getElementById('subir-cv-form');
    formSubir.style.display = (lista || []).length >= MAX_CVS ? 'none' : 'flex';

    cont.querySelectorAll('.btn-borrar-cv').forEach(btn => {
        btn.addEventListener('click', () => eliminarCv(btn.dataset.id));
    });
}

async function cargarCvs() {
    try {
        const resp = await fetch('/api/trabajador/perfil/cvs');
        if (!resp.ok) throw new Error('No se pudieron cargar tus CVs.');
        const cvs = await resp.json();
        pintarCvs(cvs);
    } catch (err) {
        alert('Error cargando CVs: ' + err.message);
    }
}

document.getElementById('input-nuevo-cv').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const nombreInput = document.getElementById('nuevo-cv-nombre');
    const nombre = nombreInput.value.trim();
    if (!nombre) {
        alert('Ponle un nombre a tu CV antes de subirlo (ej: "CV Desarrollador").');
        e.target.value = '';
        return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('archivo', archivo);

    try {
        const resp = await fetch('/api/trabajador/perfil/cvs', { method: 'POST', body: formData });
        if (!resp.ok) throw new Error(await resp.text());
        nombreInput.value = '';
        e.target.value = '';
        await cargarCvs();
    } catch (err) {
        alert('Error al subir el CV: ' + err.message);
    }
});

async function eliminarCv(cvId) {
    if (!confirm('¿Eliminar este CV? Esta acción no se puede deshacer.')) return;
    try {
        const resp = await fetch(`/api/trabajador/perfil/cvs/${cvId}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error(await resp.text());
        await cargarCvs();
    } catch (err) {
        alert('Error al eliminar el CV: ' + err.message);
    }
}

/* ── RENDER: FORMACIÓN ── */
function pintarFormaciones(lista) {
    const cont = document.getElementById('formaciones-container');
    cont.innerHTML = '';
    lista.forEach(f => cont.appendChild(crearFilaFormacion(f)));
}

function crearFilaFormacion(f = {}) {
    const div = document.createElement('div');
    div.className = 'cv-item formacion-item';
    div.dataset.id = f.id || '';
    div.innerHTML = `
        <div class="editable-field f-institucion" contenteditable="false" style="font-weight:600; font-size:15px; color:var(--ink);">${f.institucion || 'Institución'}</div>
        <div class="editable-field f-titulo" contenteditable="false" style="font-size:13.5px; color:var(--slate); margin-bottom:6px;">${f.titulo || 'Título obtenido'}</div>
        <div class="cv-item-row">
            <select class="f-nivel oculto-select">
                <option value="">Nivel</option>
                <option value="BACHILLER">Bachiller</option>
                <option value="TECNICO">Técnico</option>
                <option value="TECNOLOGO">Tecnólogo</option>
                <option value="PROFESIONAL">Profesional</option>
                <option value="ESPECIALIZACION">Especialización</option>
                <option value="MAESTRIA">Maestría</option>
                <option value="DOCTORADO">Doctorado</option>
            </select>
            <input type="date" class="f-fecha-inicio oculto-select" value="${f.fechaInicio || ''}">
            <input type="date" class="f-fecha-fin oculto-select" value="${f.fechaFin || ''}">
            <label class="oculto-select"><input type="checkbox" class="f-en-curso" ${f.enCurso ? 'checked' : ''}> En curso</label>
            <button type="button" class="btn-borrar-item oculto-select btn-borrar-formacion">Eliminar</button>
        </div>
        <div class="cv-item-row documento-row">
            ${f.id ? `
                <input type="file" class="input-documento oculto" accept=".pdf,image/*" data-formacion-id="${f.id}">
                <label class="btn-cambiar-foto oculto-select" style="position:static; transform:none;">📎 Adjuntar título</label>
            ` : `<span style="font-size:11px; color:var(--slate);">Guarda primero para poder adjuntar el título.</span>`}
            <span class="badge-documento">${f.documentoUrl ? `<a href="${f.documentoUrl}" target="_blank" style="color:var(--green); font-size:12px; font-weight:600;">📄 Ver título adjunto</a>` : ''}</span>
        </div>
    `;
    div.querySelector('.f-nivel').value = f.nivel || '';

    div.querySelector('.btn-borrar-formacion').addEventListener('click', () => div.remove());

    const inputDoc = div.querySelector('.input-documento');
    const labelDoc = div.querySelector('.documento-row label');
    if (inputDoc && labelDoc) {
        labelDoc.addEventListener('click', (e) => { e.preventDefault(); inputDoc.click(); });
        inputDoc.addEventListener('change', async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;
            const formacionId = inputDoc.dataset.formacionId;
            const formData = new FormData();
            formData.append('archivo', archivo);
            try {
                const resp = await fetch(`/api/trabajador/perfil/formacion/${formacionId}/documento`, {
                    method: 'POST', body: formData
                });
                if (!resp.ok) throw new Error(await resp.text());
                const data = await resp.json();
                div.querySelector('.badge-documento').innerHTML =
                    `<a href="${data.documentoUrl}" target="_blank" style="color:var(--green); font-size:12px; font-weight:600;">📄 Ver título adjunto</a>`;
            } catch (err) {
                alert('Error al subir el documento: ' + err.message);
            }
        });
    }

    return div;
}

/* ── RENDER: EXPERIENCIA ── */
function pintarExperiencias(lista) {
    const cont = document.getElementById('experiencias-container');
    cont.innerHTML = '';
    lista.forEach(e => cont.appendChild(crearFilaExperiencia(e)));
}

function crearFilaExperiencia(e = {}) {
    const div = document.createElement('div');
    div.className = 'cv-item experiencia-item';
    div.dataset.id = e.id || '';
    div.innerHTML = `
        <div class="editable-field e-cargo" contenteditable="false" style="font-weight:600; font-size:15px; color:var(--ink);">${e.cargo || 'Cargo'}</div>
        <div class="editable-field e-empresa" contenteditable="false" style="font-size:13px; color:var(--slate); margin-bottom:6px;">${e.empresaNombre || 'Empresa'}</div>
        <p class="editable-field e-descripcion" contenteditable="false" style="font-size:13.5px; color:var(--ink-soft); margin:0 0 8px;">${e.descripcion || 'Descripción breve'}</p>
        <div class="cv-item-row">
            <input type="date" class="e-fecha-inicio oculto-select" value="${e.fechaInicio || ''}">
            <input type="date" class="e-fecha-fin oculto-select" value="${e.fechaFin || ''}">
            <label class="oculto-select"><input type="checkbox" class="e-actual" ${e.trabajoActual ? 'checked' : ''}> Trabajo actual</label>
            <button type="button" class="btn-borrar-item oculto-select btn-borrar-experiencia">Eliminar</button>
        </div>
    `;
    div.querySelector('.btn-borrar-experiencia').addEventListener('click', () => div.remove());
    return div;
}

/* ── RENDER: CERTIFICACIONES ── */
function pintarCertificaciones(lista) {
    const cont = document.getElementById('certificaciones-container');
    cont.innerHTML = '';
    lista.forEach(c => cont.appendChild(crearFilaCertificacion(c)));
}

function crearFilaCertificacion(c = {}) {
    const div = document.createElement('div');
    div.className = 'cv-item certificacion-item';
    div.dataset.id = c.id || '';
    div.innerHTML = `
        <div class="editable-field c-nombre" contenteditable="false" style="font-weight:600; font-size:15px; color:var(--ink);">${c.nombre || 'Nombre de la certificación'}</div>
        <div class="editable-field c-entidad" contenteditable="false" style="font-size:13.5px; color:var(--slate); margin-bottom:6px;">${c.entidadEmisora || 'Entidad emisora'}</div>
        <div class="cv-item-row">
            <input type="date" class="c-fecha-obtencion oculto-select" value="${c.fechaObtencion || ''}">
            <input type="date" class="c-fecha-vencimiento oculto-select" value="${c.fechaVencimiento || ''}">
            <button type="button" class="btn-borrar-item oculto-select btn-borrar-certificacion">Eliminar</button>
        </div>
        <div class="cv-item-row documento-row">
            ${c.id ? `
                <input type="file" class="input-documento-cert oculto" accept=".pdf,image/*" data-certificacion-id="${c.id}">
                <label class="btn-cambiar-foto oculto-select" style="position:static; transform:none;">📎 Adjuntar certificado</label>
            ` : `<span style="font-size:11px; color:var(--slate);">Guarda primero para poder adjuntar el certificado.</span>`}
            <span class="badge-documento">${c.documentoUrl ? `<a href="${c.documentoUrl}" target="_blank" style="color:var(--green); font-size:12px; font-weight:600;">📄 Ver certificado</a>` : ''}</span>
        </div>
    `;
    div.querySelector('.btn-borrar-certificacion').addEventListener('click', () => div.remove());

    const inputDoc = div.querySelector('.input-documento-cert');
    const labelDoc = div.querySelector('.documento-row label');
    if (inputDoc && labelDoc) {
        labelDoc.addEventListener('click', (e) => { e.preventDefault(); inputDoc.click(); });
        inputDoc.addEventListener('change', async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;
            const certId = inputDoc.dataset.certificacionId;
            const formData = new FormData();
            formData.append('archivo', archivo);
            try {
                const resp = await fetch(`/api/trabajador/perfil/certificacion/${certId}/documento`, {
                    method: 'POST', body: formData
                });
                if (!resp.ok) throw new Error(await resp.text());
                const data = await resp.json();
                div.querySelector('.badge-documento').innerHTML =
                    `<a href="${data.documentoUrl}" target="_blank" style="color:var(--green); font-size:12px; font-weight:600;">📄 Ver certificado</a>`;
            } catch (err) {
                alert('Error al subir el certificado: ' + err.message);
            }
        });
    }

    return div;
}

document.getElementById('add-certificacion').addEventListener('click', () => {
    document.getElementById('certificaciones-container').appendChild(crearFilaCertificacion());
});

/* ── RENDER: TAGS (idiomas / habilidades) ── */
function pintarTags(contenedorId, lista) {
    const cont = document.getElementById(contenedorId);
    cont.innerHTML = '';
    lista.forEach(item => cont.appendChild(crearTag(item.nombre)));
}

function crearTag(nombre) {
    const span = document.createElement('span');
    span.className = 'tag tag-item';
    span.dataset.nombre = nombre;
    span.innerHTML = `${nombre} <span class="tag-remove oculto-select">✕</span>`;
    span.querySelector('.tag-remove').addEventListener('click', () => span.remove());
    return span;
}

document.getElementById('add-idioma').addEventListener('click', () => {
    const input = document.getElementById('idioma-nuevo');
    if (!input.value.trim()) return;
    document.getElementById('idiomas-tags').appendChild(crearTag(input.value.trim()));
    input.value = '';
});

document.getElementById('add-habilidad').addEventListener('click', () => {
    const input = document.getElementById('habilidad-nueva');
    if (!input.value.trim()) return;
    document.getElementById('habilidades-tags').appendChild(crearTag(input.value.trim()));
    input.value = '';
});

/* ── AGREGAR NUEVA FORMACIÓN / EXPERIENCIA ── */
document.getElementById('add-formacion').addEventListener('click', () => {
    document.getElementById('formaciones-container').appendChild(crearFilaFormacion());
});
document.getElementById('add-experiencia').addEventListener('click', () => {
    document.getElementById('experiencias-container').appendChild(crearFilaExperiencia());
});

/* ── TOGGLE MODO EDICIÓN ── */
document.getElementById('btn-editar').addEventListener('click', () => {
    editando = true;
    document.querySelectorAll('.editable-field').forEach(el => el.contentEditable = 'true');
    document.querySelectorAll('.oculto-select').forEach(el => el.classList.remove('oculto-select'));
    document.querySelector('.hero').classList.add('modo-edicion');
    document.querySelectorAll('.filters').forEach(f => f.classList.add('modo-edicion'));
    document.getElementById('btn-editar').classList.add('oculto');
    document.getElementById('btn-guardar').classList.remove('oculto');
    document.querySelectorAll('.btn-agregar').forEach(b => b.classList.remove('oculto'));
    document.getElementById('idiomas-input-row').classList.remove('oculto');
    document.getElementById('habilidades-input-row').classList.remove('oculto');
});

document.getElementById('btn-guardar').addEventListener('click', guardarCambios);

/* ── SUBIDA DE FOTO (inmediata al seleccionar) ── */
document.getElementById('input-foto').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const formData = new FormData();
    formData.append('archivo', archivo);
    try {
        const resp = await fetch('/api/trabajador/perfil/foto', { method: 'POST', body: formData });
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        document.getElementById('img-perfil').src = data.fotoUrl;
    } catch (err) {
        alert('Error al subir la foto: ' + err.message);
    }
});

/* ── GUARDAR CAMBIOS DE TEXTO/CV ── */
async function guardarCambios() {
    const body = {
        nombres: document.getElementById('campo-nombres').textContent.trim(),
        primerApellido: document.getElementById('campo-primer-apellido').textContent.trim(),
        segundoApellido: document.getElementById('campo-segundo-apellido').textContent.trim(),
        especialidad: document.getElementById('campo-especialidad').textContent.trim(),
        ciudad: document.getElementById('campo-ciudad').textContent.trim(),
        telefono: document.getElementById('campo-telefono').textContent.trim(),
        formaciones: Array.from(document.querySelectorAll('.formacion-item')).map(item => ({
            id: item.dataset.id ? Number(item.dataset.id) : null,
            institucion: item.querySelector('.f-institucion').textContent.trim(),
            titulo: item.querySelector('.f-titulo').textContent.trim(),
            nivel: item.querySelector('.f-nivel').value,
            fechaInicio: item.querySelector('.f-fecha-inicio').value,
            fechaFin: item.querySelector('.f-fecha-fin').value,
            enCurso: item.querySelector('.f-en-curso').checked
        })),
        experiencias: Array.from(document.querySelectorAll('.experiencia-item')).map(item => ({
            id: item.dataset.id ? Number(item.dataset.id) : null,
            cargo: item.querySelector('.e-cargo').textContent.trim(),
            empresaNombre: item.querySelector('.e-empresa').textContent.trim(),
            descripcion: item.querySelector('.e-descripcion').textContent.trim(),
            fechaInicio: item.querySelector('.e-fecha-inicio').value,
            fechaFin: item.querySelector('.e-fecha-fin').value,
            trabajoActual: item.querySelector('.e-actual').checked
        })),
        certificaciones: Array.from(document.querySelectorAll('.certificacion-item')).map(item => ({
            id: item.dataset.id ? Number(item.dataset.id) : null,
            nombre: item.querySelector('.c-nombre').textContent.trim(),
            entidadEmisora: item.querySelector('.c-entidad').textContent.trim(),
            fechaObtencion: item.querySelector('.c-fecha-obtencion').value,
            fechaVencimiento: item.querySelector('.c-fecha-vencimiento').value
        })),
        idiomas: Array.from(document.querySelectorAll('#idiomas-tags .tag-item')).map(t => ({ nombre: t.dataset.nombre, categoria: 'Idioma' })),
        habilidadesTecnicas: Array.from(document.querySelectorAll('#habilidades-tags .tag-item')).map(t => ({ nombre: t.dataset.nombre, categoria: 'Técnica' }))
    };

    try {
        const resp = await fetch('/api/trabajador/perfil', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(await resp.text());
        perfilActual = await resp.json();

        editando = false;
        document.querySelectorAll('.editable-field').forEach(el => el.contentEditable = 'false');
        document.querySelectorAll('.oculto-select').forEach(el => el.classList.add('oculto-select'));
        document.querySelector('.hero').classList.remove('modo-edicion');
        document.querySelectorAll('.filters').forEach(f => f.classList.remove('modo-edicion'));
        document.getElementById('btn-editar').classList.remove('oculto');
        document.getElementById('btn-guardar').classList.add('oculto');

        pintarPerfil(perfilActual);
        alert('¡Información actualizada con éxito!');
    } catch (err) {
        alert('Error al guardar: ' + err.message);
    }
}