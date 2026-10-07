/* ============================================
   DASHBOARD EMPRESA: Formulario de publicar / editar vacante
   La lista de vacantes (tabla) vive en dashboard-mis-vacantes.js

   Va dentro de una función propia para que sus nombres no puedan chocar con los
   de otros scripts del dashboard (dos scripts que declaran el mismo `let` o
   `const` hacen que el segundo no se ejecute y no avise).
   Hacia afuera solo expone dos funciones: irASeccion y editarVacante.
============================================ */
(function () {
    let vacanteEditandoId = null;

    function avisar(mensaje, tipo) {
        if (typeof showToast === 'function') showToast(mensaje, tipo);
        else alert(mensaje);
    }

    /* Cambia de pestaña pulsando el mismo botón del menú. Así se ejecuta todo lo que
       ya hace un clic real (marcar la pestaña activa, cerrar el menú móvil, etc.). */
    function irASeccion(idSeccion) {
        const boton = document.querySelector(`.emp-nav-btn[data-target="${idSeccion}"]`);
        if (boton) boton.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('form-publicar-vacante');
        if (!form) return;

        form.addEventListener('submit', guardarVacante);

        document.getElementById('btn-cancelar-edicion').addEventListener('click', () => {
            cancelarEdicion();
            irASeccion('sec-mis-vacantes');
        });

        document.getElementById('btn-nueva-vacante')?.addEventListener('click', () => {
            irASeccion('sec-publicar'); // el listener de abajo limpia cualquier edición pendiente
        });

        // Si entras a "Publicar Vacante" desde el menú con una edición a medias, el formulario
        // se limpia para no terminar actualizando la vacante equivocada.
        document.querySelector('.emp-nav-btn[data-target="sec-publicar"]')?.addEventListener('click', () => {
            if (vacanteEditandoId) cancelarEdicion();
        });

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
            const fila = crearFilaRequisito();
            document.getElementById('requisitos-container').appendChild(fila);
            fila.querySelector('input').focus();
        });
    });

    /* ── FILAS DINÁMICAS: REQUISITOS ── */
    function crearFilaRequisito(valorInicial = '') {
        const div = document.createElement('div');
        div.className = 'pv-req-fila';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'pv-input requisito-input';
        input.placeholder = 'Ej: 3+ años de experiencia en ventas B2B';
        input.maxLength = 255;
        input.value = valorInicial;

        const quitar = document.createElement('button');
        quitar.type = 'button';
        quitar.className = 'pv-req-quitar';
        quitar.title = 'Quitar requisito';
        quitar.textContent = '✕';
        quitar.addEventListener('click', () => div.remove());

        div.append(input, quitar);
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
            avisar('Ingresa al menos el monto mínimo del sueldo.', 'error');
            return;
        }
        if (montoMax && Number(montoMax) < Number(montoMin)) {
            avisar('El sueldo máximo no puede ser menor que el mínimo.', 'error');
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

            avisar(esEdicion ? '✓ Vacante actualizada.' : '✓ ¡Vacante publicada exitosamente!', 'success');
            cancelarEdicion();

            // Refresca la tabla antes de cambiar de pestaña. Al publicar una nueva se quitan
            // los filtros para que se vea de inmediato.
            if (typeof recargarMisVacantes === 'function') {
                await recargarMisVacantes({ silencioso: true, reiniciar: !esEdicion });
            }
            irASeccion('sec-mis-vacantes');
        } catch (err) {
            avisar('Error al guardar: ' + err.message, 'error');
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

            // Primero se cambia de pestaña (esto limpia cualquier edición anterior)
            // y después se carga la vacante en el formulario.
            irASeccion('sec-publicar');

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
                document.getElementById('vac-ubicacion-otra').classList.add('oculto');
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

        } catch (err) {
            avisar('Error al cargar la vacante: ' + err.message, 'error');
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

    // Lo único que usan los demás archivos
    window.irASeccion = irASeccion;
    window.editarVacante = editarVacante;
})();