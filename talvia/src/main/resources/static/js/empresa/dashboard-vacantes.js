/* ============================================
   DASHBOARD EMPRESA — Publicar / editar / pausar / eliminar vacantes
============================================ */

let vacanteEditandoId = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarMisVacantes();
    document.getElementById('form-publicar-vacante').addEventListener('submit', guardarVacante);
    document.getElementById('btn-cancelar-edicion').addEventListener('click', cancelarEdicion);

    document.getElementById('vac-monto-min').addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    document.getElementById('vac-monto-max').addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    const ubicacionSelect = document.getElementById('vac-ubicacion');
    const ubicacionOtraInput = document.getElementById('vac-ubicacion-otra');
    ubicacionSelect.addEventListener('change', function () {
        ubicacionOtraInput.classList.toggle('oculto', this.value !== 'otra');
        if (this.value !== 'otra') ubicacionOtraInput.value = '';
    });

    document.getElementById('add-requisito').addEventListener('click', () => {
        document.getElementById('requisitos-container').appendChild(crearFilaRequisito());
    });
});

/* ── FILAS DINÁMICAS: REQUISITOS ── */
function crearFilaRequisito(valorInicial = '') {
    const div = document.createElement('div');
    div.style.cssText = "display:flex; gap:8px; margin-bottom:8px;";
    div.innerHTML = `
        <input type="text" class="requisito-input" placeholder="Ej: 3+ años en React" style="flex:1;" value="${valorInicial}">
        <button type="button" class="btn-remove-row" style="background:#fdf2f2; color:#d93838; border:1px solid #f8d7d7; padding:5px 10px; border-radius:4px; cursor:pointer;">✕</button>
    `;
    div.querySelector('.btn-remove-row').addEventListener('click', () => div.remove());
    return div;
}

function recolectarRequisitos() {
    return Array.from(document.querySelectorAll('#requisitos-container .requisito-input'))
        .map(input => input.value.trim())
        .filter(v => v);
}

/* ── CREAR O ACTUALIZAR VACANTE (mismo formulario) ── */
async function guardarVacante(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-publicar');

    let ubicacionFinal = document.getElementById('vac-ubicacion').value;
    if (ubicacionFinal === 'otra') {
        ubicacionFinal = document.getElementById('vac-ubicacion-otra').value.trim();
    }

    const montoMin = document.getElementById('vac-monto-min').value.trim();
    const montoMax = document.getElementById('vac-monto-max').value.trim();

    if (!montoMin) {
        showToast('Ingresa al menos el monto mínimo del sueldo.', 'error');
        return;
    }

    const body = {
        titulo: document.getElementById('vac-titulo').value.trim(),
        ubicacion: ubicacionFinal,
        area: document.getElementById('vac-area').value,
        expMinimaAnios: Number(document.getElementById('vac-experiencia').value),
        modalidad: document.getElementById('vac-modalidad').value,
        nivelCargo: document.getElementById('vac-nivel').value,
        descripcion: document.getElementById('vac-descripcion').value.trim(),
        beneficios: document.getElementById('vac-beneficios').value.trim(),
        montoMinimo: Number(montoMin),
        montoMaximo: montoMax ? Number(montoMax) : null,
        moneda: document.getElementById('vac-moneda').value,
        periodicidad: document.getElementById('vac-periodicidad').value,
        nivelEducativoMinimo: document.getElementById('vac-nivel-educativo').value || null,
        requisitos: recolectarRequisitos()
    };

    const esEdicion = !!vacanteEditandoId;
    const url = esEdicion ? `/api/empresa/vacantes/${vacanteEditandoId}` : '/api/empresa/vacantes';
    const metodo = esEdicion ? 'PUT' : 'POST';

    btn.classList.add('loading');
    try {
        const resp = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(await resp.text());

        showToast(esEdicion ? '✓ Vacante actualizada.' : '✓ ¡Vacante publicada exitosamente!', 'success');
        cancelarEdicion();
        cargarMisVacantes();
    } catch (err) {
        showToast('Error al guardar: ' + err.message, 'error');
    } finally {
        btn.classList.remove('loading');
    }
}

/* ── ENTRAR / SALIR DEL MODO EDICIÓN ── */
async function editarVacante(id) {
    try {
        const resp = await fetch(`/api/empresa/vacantes/${id}`);
        if (!resp.ok) throw new Error(await resp.text());
        const v = await resp.json();

        vacanteEditandoId = id;
        document.getElementById('form-vacante-titulo').textContent = '✏️ Editar Vacante';
        document.getElementById('form-vacante-subtitulo').textContent = 'Los cambios se aplican de inmediato a la oferta ya publicada.';
        document.getElementById('btn-publicar').textContent = 'Guardar Cambios';
        document.getElementById('btn-cancelar-edicion').classList.remove('oculto');

        document.getElementById('vac-titulo').value = v.titulo || '';

        const ubicacionSelect = document.getElementById('vac-ubicacion');
        const opciones = Array.from(ubicacionSelect.options).map(o => o.value);
        if (opciones.includes(v.ubicacion)) {
            ubicacionSelect.value = v.ubicacion;
        } else {
            ubicacionSelect.value = 'otra';
            document.getElementById('vac-ubicacion-otra').value = v.ubicacion || '';
            document.getElementById('vac-ubicacion-otra').classList.remove('oculto');
        }

        document.getElementById('vac-area').value = v.area || '';
        document.getElementById('vac-experiencia').value = v.expMinimaAnios ?? 0;
        document.getElementById('vac-modalidad').value = v.modalidad || 'presencial';
        document.getElementById('vac-nivel').value = v.nivelCargo || 'entrada';
        document.getElementById('vac-descripcion').value = v.descripcion || '';
        document.getElementById('vac-beneficios').value = v.beneficios || '';
        document.getElementById('vac-monto-min').value = v.montoMinimo ?? '';
        document.getElementById('vac-monto-max').value = v.montoMaximo ?? '';
        document.getElementById('vac-moneda').value = v.moneda || 'COP';
        document.getElementById('vac-periodicidad').value = v.periodicidad || 'MENSUAL';
        document.getElementById('vac-nivel-educativo').value = v.nivelEducativoMinimo || '';

        const requisitosContainer = document.getElementById('requisitos-container');
        requisitosContainer.innerHTML = '';
        (v.requisitos || []).forEach(texto => requisitosContainer.appendChild(crearFilaRequisito(texto)));

        cambiarSeccion('sec-publicar', document.querySelector('.emp-nav-btn[data-target="sec-publicar"]'));
        document.getElementById('form-publicar-vacante').scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        showToast('Error al cargar la vacante: ' + err.message, 'error');
    }
}

function cancelarEdicion() {
    vacanteEditandoId = null;
    document.getElementById('form-vacante-titulo').textContent = '➕ Publicar Nueva Oferta Laboral';
    document.getElementById('form-vacante-subtitulo').textContent = 'La oferta se publicará automáticamente con el nombre y logo actual de tu empresa.';
    document.getElementById('btn-publicar').textContent = 'Publicar Oferta Ahora';
    document.getElementById('btn-cancelar-edicion').classList.add('oculto');
    document.getElementById('form-publicar-vacante').reset();
    document.getElementById('vac-ubicacion-otra').classList.add('oculto');
    document.getElementById('requisitos-container').innerHTML = '';
}

/* ── LISTAR MIS VACANTES (con estado, editar, pausar) ── */
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
            const pausada = v.estado === 'PAUSADA';
            const fila = document.createElement('div');
            fila.style.cssText = "display:flex; justify-content: space-between; align-items: center; gap: 12px; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; flex-wrap: wrap;";
            fila.innerHTML = `
                <div>
                    <div style="font-weight: 600; color: var(--ink); font-size: 14px; display:flex; align-items:center; gap:8px;">
                        ${v.titulo || 'Sin título'}
                        ${pausada ? '<span style="font-family:\'IBM Plex Mono\',monospace; font-size:10px; background:#fbf3e3; color:var(--gold-deep); padding:2px 8px; border-radius:10px;">PAUSADA</span>' : ''}
                    </div>
                    <div style="font-size: 12.5px; color: var(--slate);">${v.ubicacion || ''} ${v.salario ? '• ' + v.salario : ''}</div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button type="button" data-id="${v.id}" class="btn-editar-vacante" style="background: var(--bg); color: var(--ink); border: 1px solid var(--line); padding: 7px 14px; border-radius: 4px; font-size: 12.5px; font-weight: 600; cursor: pointer;">✏️ Editar</button>
                    <button type="button" data-id="${v.id}" data-estado="${v.estado}" class="btn-pausar-vacante" style="background: ${pausada ? 'var(--green-bg)' : '#fbf3e3'}; color: ${pausada ? 'var(--green)' : 'var(--gold-deep)'}; border: 1px solid ${pausada ? 'var(--green)' : 'var(--gold-deep)'}; padding: 7px 14px; border-radius: 4px; font-size: 12.5px; font-weight: 600; cursor: pointer;">${pausada ? '▶ Reactivar' : '⏸ Pausar'}</button>
                    <button type="button" data-id="${v.id}" data-titulo="${v.titulo}" class="btn-eliminar-vacante" style="background: #fdf2f2; color: #d93838; border: 1px solid #f8d7d7; padding: 7px 14px; border-radius: 4px; font-size: 12.5px; font-weight: 600; cursor: pointer;">🗑 Eliminar</button>
                </div>
            `;
            cont.appendChild(fila);
        });

        cont.querySelectorAll('.btn-editar-vacante').forEach(btn => {
            btn.addEventListener('click', () => editarVacante(btn.dataset.id));
        });
        cont.querySelectorAll('.btn-pausar-vacante').forEach(btn => {
            btn.addEventListener('click', () => togglePausarVacante(btn.dataset.id, btn.dataset.estado));
        });
        cont.querySelectorAll('.btn-eliminar-vacante').forEach(btn => {
            btn.addEventListener('click', () => eliminarVacante(btn.dataset.id, btn.dataset.titulo));
        });
    } catch (err) {
        cont.innerHTML = `<p style="color:red; font-size:13px;">Error: ${err.message}</p>`;
    }
}

async function togglePausarVacante(id, estadoActual) {
    const nuevoEstado = estadoActual === 'PAUSADA' ? 'ABIERTA' : 'PAUSADA';
    try {
        const resp = await fetch(`/api/empresa/vacantes/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (!resp.ok) throw new Error(await resp.text());
        showToast(nuevoEstado === 'PAUSADA' ? '✓ Vacante pausada. Ya no es visible para candidatos.' : '✓ Vacante reactivada.', 'success');
        cargarMisVacantes();
    } catch (err) {
        showToast('Error al cambiar el estado: ' + err.message, 'error');
    }
}

async function eliminarVacante(id, titulo) {
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