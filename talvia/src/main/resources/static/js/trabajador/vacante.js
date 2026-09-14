/* ============================================
   DETALLE DE VACANTE — Carga real + postulación (con selección de CV)
============================================ */

let vacanteId = null;
let vacanteActual = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    vacanteId = params.get('id');

    if (!vacanteId) {
        document.getElementById('v-titulo').textContent = 'Vacante no encontrada';
        return;
    }

    cargarVacante();

    document.getElementById('btn-postular').addEventListener('click', abrirModalPreguntas);
    document.getElementById('btn-cancelar-postulacion').addEventListener('click', cerrarModalPreguntas);
    document.getElementById('form-postulacion').addEventListener('submit', confirmarPostulacion);
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
});

async function cerrarSesion() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    finally { window.location.href = '/public/login'; }
}

async function cargarVacante() {
    try {
        const resp = await fetch(`/api/vacantes/${vacanteId}`);
        if (!resp.ok) throw new Error('No se pudo cargar la vacante.');
        vacanteActual = await resp.json();

        document.getElementById('v-titulo').textContent = vacanteActual.titulo || 'Sin título';
        document.getElementById('v-empresa-nombre').textContent = vacanteActual.empresa || 'Empresa';
        document.getElementById('v-ubicacion').textContent = '📍 ' + (vacanteActual.ubicacion || 'No especificada');
        document.getElementById('v-salario').textContent = vacanteActual.salario || 'A convenir';
        document.getElementById('v-fecha').textContent = vacanteActual.fecha
            ? `PUBLICADO EL ${vacanteActual.fecha}` : 'PUBLICADO RECIENTEMENTE';

        if (vacanteActual.logoUrl) {
            document.getElementById('v-empresa-logo').innerHTML = `<img src="${vacanteActual.logoUrl}" alt="logo">`;
        }

        document.getElementById('v-descripcion').textContent = vacanteActual.descripcion || 'No hay información sobre el rol disponible.';

        renderizarLista('v-requisitos-lista', vacanteActual.requisitosTexto, 'No se especificaron requisitos.');
        renderizarLista('v-beneficios-lista', vacanteActual.beneficios, 'No se especificaron beneficios.');

        const tagsContainer = document.getElementById('v-tags-container');
        tagsContainer.innerHTML = '';
        if (vacanteActual.modalidad) {
            const etiquetasModalidad = { presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido' };
            tagsContainer.innerHTML += `<span class="tag-item">${etiquetasModalidad[vacanteActual.modalidad] || vacanteActual.modalidad}</span>`;
        }
        if (vacanteActual.experiencia !== undefined && vacanteActual.experiencia !== null) {
            tagsContainer.innerHTML += `<span class="tag-item">${vacanteActual.experiencia}+ años exp.</span>`;
        }
        if (vacanteActual.nivelEducativoMinimo) {
            tagsContainer.innerHTML += `<span class="tag-item">${vacanteActual.nivelEducativoMinimo}</span>`;
        }

        await verificarPostulacionPrevia();

    } catch (err) {
        document.getElementById('v-titulo').textContent = 'Error al cargar la vacante';
        console.error(err);
    }
}

function renderizarLista(idContenedor, textoPlano, mensajeVacio) {
    const cont = document.getElementById(idContenedor);
    cont.innerHTML = '';

    if (!textoPlano || !textoPlano.trim()) {
        cont.innerHTML = `<li class="section-list-empty">${mensajeVacio}</li>`;
        return;
    }

    const items = textoPlano.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 0);

    if (items.length === 0) {
        cont.innerHTML = `<li class="section-list-empty">${mensajeVacio}</li>`;
        return;
    }

    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        cont.appendChild(li);
    });
}

async function verificarPostulacionPrevia() {
    try {
        const resp = await fetch(`/api/postulaciones/verificar/${vacanteId}`);
        if (!resp.ok) return;
        const data = await resp.json();
        if (data.postulado) marcarBotonComoVerde();
    } catch (err) {
        // Si falla la verificación, dejamos el botón activo por defecto
    }
}

function marcarBotonComoVerde() {
    const btn = document.getElementById('btn-postular');
    btn.textContent = '✓ Hoja de Vida Enviada';
    btn.classList.add('postulado');
    btn.replaceWith(btn.cloneNode(true)); // elimina el listener de click
}

async function cargarCvsParaSeleccionar() {
    const select = document.getElementById('preg-cv');
    select.innerHTML = '<option value="" disabled selected>Cargando...</option>';

    try {
        const resp = await fetch('/api/trabajador/perfil/cvs');
        if (!resp.ok) throw new Error('No se pudieron cargar tus CVs.');
        const cvs = await resp.json();

        if (cvs.length === 0) {
            select.innerHTML = '<option value="" disabled selected>No tienes ningún CV subido</option>';
            return false;
        }

        select.innerHTML = '<option value="" disabled selected>Selecciona una hoja de vida</option>' +
            cvs.map(cv => `<option value="${cv.id}">${cv.nombre}</option>`).join('');
        return true;

    } catch (err) {
        select.innerHTML = '<option value="" disabled selected>Error al cargar tus CVs</option>';
        return false;
    }
}

async function abrirModalPreguntas() {
    const hayCvs = await cargarCvsParaSeleccionar();
    if (!hayCvs) {
        alert('No tienes ninguna hoja de vida subida. Ve a "Mi Perfil" y sube al menos un CV antes de postularte.');
        window.location.href = '/private/trabajador/perfil';
        return;
    }
    document.getElementById('modalPreguntas').style.display = 'flex';
}

function cerrarModalPreguntas() {
    document.getElementById('modalPreguntas').style.display = 'none';
}

async function confirmarPostulacion(event) {
    event.preventDefault();

    const cvSeleccionado = document.getElementById('preg-cv').value;
    if (!cvSeleccionado) {
        alert('Selecciona qué hoja de vida quieres enviar.');
        return;
    }

    const body = {
        vacanteId: Number(vacanteId),
        cvId: Number(cvSeleccionado),
        salarioEsperado: document.getElementById('preg-salario').value.trim(),
        disponibilidad: document.getElementById('preg-disponibilidad').value,
        expResumen: document.getElementById('preg-exp').value.trim()
    };

    const btnConfirmar = document.querySelector('.btn-modal-confirmar');
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Enviando...';

    try {
        const resp = await fetch('/api/postulaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(errorText || 'No se pudo enviar la postulación.');
        }

        cerrarModalPreguntas();
        marcarBotonComoVerde();
        alert('¡Tu hoja de vida fue enviada con éxito a ' + (vacanteActual?.empresa || 'la empresa') + '!');

    } catch (err) {
        alert('Error al postularte: ' + err.message);
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Confirmar y Enviar CV';
    }
}