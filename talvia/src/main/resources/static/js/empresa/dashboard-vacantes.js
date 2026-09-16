/* 
   DASHBOARD EMPRESA - Publicar / listar / eliminar vacantes
   Salario y requisitos ahora son datos estructurados,
   no texto libre - el backend arma el texto de presentacion.
 */

document.addEventListener('DOMContentLoaded', () => {
    cargarMisVacantes();
    document.getElementById('form-publicar-vacante').addEventListener('submit', publicarVacante);

    // Restringir montos a solo números
    document.getElementById('vac-monto-min').addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    document.getElementById('vac-monto-max').addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Ubicación "otra"
    const ubicacionSelect = document.getElementById('vac-ubicacion');
    const ubicacionOtraInput = document.getElementById('vac-ubicacion-otra');
    ubicacionSelect.addEventListener('change', function () {
        ubicacionOtraInput.classList.toggle('oculto', this.value !== 'otra');
        if (this.value !== 'otra') ubicacionOtraInput.value = '';
    });

    // Agregar requisito
    document.getElementById('add-requisito').addEventListener('click', () => {
        document.getElementById('requisitos-container').appendChild(crearFilaRequisito());
    });
});

/*FILAS DINAMICAS: REQUISITOS*/
function crearFilaRequisito() {
    const div = document.createElement('div');
    div.style.cssText = "display:flex; gap:8px; margin-bottom:8px;";
    div.innerHTML = `
        <input type="text" class="requisito-input" placeholder="Ej: 3+ años en React" style="flex:1;">
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

/* PUBLICAR VACANTE */
async function publicarVacante(e) {
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
        document.getElementById('vac-ubicacion-otra').classList.add('oculto');
        document.getElementById('requisitos-container').innerHTML = '';
        cargarMisVacantes();
    } catch (err) {
        showToast('Error al publicar: ' + err.message, 'error');
    } finally {
        btn.classList.remove('loading');
    }
}

/*LISTAR MIS VACANTES*/
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
                <button type="button" data-id="${v.id}" data-titulo="${v.titulo}" class="btn-eliminar-vacante" style="background: #fdf2f2; color: #d93838; border: 1px solid #f8d7d7; padding: 7px 14px; border-radius: 4px; font-size: 12.5px; font-weight: 600; cursor: pointer;">🗑 Eliminar</button>
            `;
            cont.appendChild(fila);
        });

        cont.querySelectorAll('.btn-eliminar-vacante').forEach(btn => {
            btn.addEventListener('click', () => eliminarVacante(btn.dataset.id, btn.dataset.titulo));
        });
    } catch (err) {
        cont.innerHTML = `<p style="color:red; font-size:13px;">Error: ${err.message}</p>`;
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