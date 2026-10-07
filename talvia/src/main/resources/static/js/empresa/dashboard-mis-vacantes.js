/* ============================================
   DASHBOARD EMPRESA: Mis Vacantes (tabla)
   Filtros, orden y paginación en el navegador, sobre los datos de:
   GET /api/empresa/vacantes
   GET /api/empresa/postulaciones   (solo para contar candidatos por vacante)
   Acciones:
   PUT    /api/empresa/vacantes/{id}/estado
   DELETE /api/empresa/vacantes/{id}
   Va dentro de una función para no chocar con las variables de otros scripts.
   Usa funciones de otros archivos: editarVacante e irASeccion (dashboard-vacantes.js)
   y rangoPaginas (shared/paginacion.js, opcional).
============================================ */
(function () {
    const POR_PAGINA = 10;

    const AREAS = {
        'tecnologia': 'Tecnología & IT', 'ventas': 'Ventas y Comercial', 'logistica': 'Logística y Transporte',
        'finanzas': 'Finanzas y Contabilidad', 'salud': 'Salud y Medicina', 'administracion': 'Administración',
        'marketing': 'Marketing y Publicidad', 'ingenieria': 'Ingeniería', 'educacion': 'Educación',
        'legal': 'Legal y Jurídico', 'recursos-humanos': 'Recursos Humanos', 'construccion': 'Construcción',
        'atencion-cliente': 'Atención al cliente', 'produccion': 'Producción y Manufactura',
        'diseno': 'Diseño y Artes', 'gastronomia': 'Gastronomía y Turismo'
    };
    const MODALIDADES = { presencial: 'Presencial', remoto: 'Remoto', hibrido: 'Híbrido' };
    const ESTADOS = {
        ABIERTA: { texto: 'Abierta', clase: 'mv-badge-abierta' },
        PAUSADA: { texto: 'Pausada', clase: 'mv-badge-pausada' },
        CERRADA: { texto: 'Cerrada', clase: 'mv-badge-cerrada' }
    };
    const FILTROS_INICIALES = { q: '', estado: 'TODAS', area: '', orden: 'recientes' };

    let vacantes = [];
    let conteos = null;               // Map(vacanteId → nº de candidatos), o null si no se pudo cargar
    let filtros = { ...FILTROS_INICIALES };
    let pagina = 1;
    let temporizador = null;

    const $ = (id) => document.getElementById(id);

    /* ── Utilidades ── */
    function esc(valor) {
        if (valor === null || valor === undefined) return '';
        return String(valor)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function avisar(mensaje, tipo) {
        if (typeof showToast === 'function') showToast(mensaje, tipo);
        else alert(mensaje);
    }

    // Convierte "2026-09-05" o "05/09/2026" en 20260905, para ordenar sin importar el formato
    function claveFecha(texto) {
        if (!texto) return '';
        const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
        if (iso) return iso[1] + iso[2] + iso[3];
        const dmy = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(texto);
        if (dmy) return dmy[3] + dmy[2] + dmy[1];
        return '';
    }

    function candidatosDe(v) {
        return conteos ? (conteos.get(v.id) || 0) : null;
    }

    function hayFiltros() {
        return !!filtros.q || filtros.estado !== 'TODAS' || !!filtros.area;
    }

    /* ── Inicio ── */
    document.addEventListener('DOMContentLoaded', () => {
        if (!$('mv-tbody')) return;

        $('mv-chips').addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            filtros.estado = chip.dataset.estado;
            pagina = 1;
            render();
        });

        $('mv-buscar').addEventListener('input', (e) => {
            clearTimeout(temporizador);
            temporizador = setTimeout(() => {
                filtros.q = e.target.value.trim();
                pagina = 1;
                render();
            }, 250);
        });

        $('mv-area').addEventListener('change', (e) => { filtros.area = e.target.value; pagina = 1; render(); });
        $('mv-orden').addEventListener('change', (e) => { filtros.orden = e.target.value; pagina = 1; render(); });
        $('mv-limpiar').addEventListener('click', () => { reiniciarFiltros(); render(); });

        // Un solo listener para todas las acciones de la tabla (editar, pausar, cerrar, eliminar)
        $('mv-tbody').addEventListener('click', (e) => {
            const boton = e.target.closest('[data-accion]');
            if (!boton) return;
            const fila = boton.closest('tr');
            const v = vacantes.find(x => String(x.id) === fila.dataset.id);
            if (!v) return;

            switch (boton.dataset.accion) {
                case 'editar':
                    if (typeof editarVacante === 'function') {
                        editarVacante(v.id);
                    } else {
                        avisar('No se pudo abrir el formulario de edición. Recarga la página con Ctrl+Shift+R.', 'error');
                    }
                    break;
                case 'pausar':   ejecutar(boton, () => alternarPausa(v)); break;
                case 'cerrar':   ejecutar(boton, () => cerrar(v)); break;
                case 'eliminar': ejecutar(boton, () => eliminar(v)); break;
            }
        });

        cargar();
    });

    // Lo usa el formulario (dashboard-vacantes.js) después de publicar o editar
    window.recargarMisVacantes = (opciones) => cargar(opciones);

    /* ── Carga de datos ── */
    function mostrarCargando() {
        $('mv-tbody').innerHTML = `
            <tr><td colspan="7" class="mv-vacio">
                <div class="skeleton-loader skeleton-block"></div>
                <div class="skeleton-loader skeleton-block"></div>
                <div class="skeleton-loader skeleton-block"></div>
            </td></tr>`;
    }

    async function cargar(opciones = {}) {
        const { silencioso = false, reiniciar = false } = opciones;
        if (reiniciar) reiniciarFiltros();
        if (!silencioso) mostrarCargando();

        try {
            const [resVacantes, resPostulaciones] = await Promise.allSettled([
                fetch('/api/empresa/vacantes'),
                fetch('/api/empresa/postulaciones')
            ]);

            if (resVacantes.status !== 'fulfilled' || !resVacantes.value.ok) {
                throw new Error('No se pudieron cargar tus vacantes.');
            }
            vacantes = await resVacantes.value.json();

            conteos = null;
            if (resPostulaciones.status === 'fulfilled' && resPostulaciones.value.ok) {
                const lista = await resPostulaciones.value.json();
                conteos = new Map();
                lista.forEach(p => conteos.set(p.vacanteId, (conteos.get(p.vacanteId) || 0) + 1));
            }

            poblarAreas();
            $('mv-orden').querySelector('option[value="candidatos"]').disabled = !conteos;
            if (!conteos && filtros.orden === 'candidatos') {
                filtros.orden = 'recientes';
                $('mv-orden').value = 'recientes';
            }

            render();
        } catch (err) {
            $('mv-tbody').innerHTML = '';
            const fila = filaVacia(`<strong>No se pudo cargar</strong>${esc(err.message)}<br>
                <button type="button" class="mv-btn-nueva" id="mv-reintentar">Reintentar</button>`);
            $('mv-tbody').appendChild(fila);
            $('mv-reintentar').addEventListener('click', () => cargar());
        }
    }

    function reiniciarFiltros() {
        filtros = { ...FILTROS_INICIALES };
        pagina = 1;
        $('mv-buscar').value = '';
        $('mv-area').value = '';
        $('mv-orden').value = 'recientes';
    }

    // Solo ofrece las áreas que realmente tiene la empresa
    function poblarAreas() {
        const select = $('mv-area');
        const presentes = [...new Set(vacantes.map(v => (v.area || '').toLowerCase()).filter(Boolean))]
            .sort((a, b) => (AREAS[a] || a).localeCompare(AREAS[b] || b, 'es'));

        select.innerHTML = '<option value="">Todas las áreas</option>' +
            presentes.map(a => `<option value="${esc(a)}">${esc(AREAS[a] || a)}</option>`).join('');

        if (!presentes.includes(filtros.area)) filtros.area = '';
        select.value = filtros.area;
    }

    /* ── Filtrado y orden ── */
    function filtradas() {
        const q = filtros.q.toLowerCase();

        const lista = vacantes.filter(v =>
            (filtros.estado === 'TODAS' || v.estado === filtros.estado) &&
            (!filtros.area || (v.area || '').toLowerCase() === filtros.area) &&
            (!q || (v.titulo || '').toLowerCase().includes(q) || (v.ubicacion || '').toLowerCase().includes(q))
        );

        const masReciente = (a, b) =>
            claveFecha(b.fecha).localeCompare(claveFecha(a.fecha)) || (b.id - a.id);

        switch (filtros.orden) {
            case 'antiguas':
                lista.sort((a, b) => masReciente(b, a));
                break;
            case 'candidatos':
                lista.sort((a, b) => (candidatosDe(b) - candidatosDe(a)) || masReciente(a, b));
                break;
            case 'titulo':
                lista.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || '', 'es'));
                break;
            default:
                lista.sort(masReciente);
        }
        return lista;
    }

    /* ── Pintado ── */
    function actualizarChips() {
        const totales = { TODAS: vacantes.length, ABIERTA: 0, PAUSADA: 0, CERRADA: 0 };
        vacantes.forEach(v => { if (totales[v.estado] !== undefined) totales[v.estado]++; });

        document.querySelectorAll('#mv-chips .chip').forEach(chip => {
            const estado = chip.dataset.estado;
            chip.classList.toggle('active', estado === filtros.estado);
            chip.querySelector('.chip-count').textContent = totales[estado] ?? 0;
        });
    }

    function render() {
        actualizarChips();
        $('mv-total').textContent = vacantes.length || '';
        $('mv-limpiar').hidden = !hayFiltros();

        const lista = filtradas();
        const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
        if (pagina > totalPaginas) pagina = totalPaginas;

        const inicio = (pagina - 1) * POR_PAGINA;
        const visibles = lista.slice(inicio, inicio + POR_PAGINA);

        pintarFilas(visibles, lista.length);

        $('mv-resumen').textContent = lista.length === 0
            ? ''
            : `Mostrando ${inicio + 1}–${inicio + visibles.length} de ${lista.length} ${lista.length === 1 ? 'vacante' : 'vacantes'}`;

        pintarPaginacion(totalPaginas);
    }

    function filaVacia(html) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'mv-vacio';
        td.innerHTML = html;
        tr.appendChild(td);
        return tr;
    }

    function pintarFilas(visibles, totalFiltradas) {
        const tbody = $('mv-tbody');
        tbody.innerHTML = '';

        if (vacantes.length === 0) {
            tbody.appendChild(filaVacia(`<strong>Aún no has publicado ninguna vacante</strong>
                Publica la primera y empieza a recibir candidatos.<br>
                <button type="button" class="mv-btn-nueva" id="mv-vacio-publicar">➕ Publicar mi primera vacante</button>`));
            $('mv-vacio-publicar').addEventListener('click', () => {
                if (typeof irASeccion === 'function') irASeccion('sec-publicar');
            });
            return;
        }

        if (totalFiltradas === 0) {
            tbody.appendChild(filaVacia(`<strong>Ninguna vacante coincide con los filtros</strong>
                <button type="button" class="mv-limpiar" id="mv-vacio-limpiar">Limpiar filtros</button>`));
            $('mv-vacio-limpiar').addEventListener('click', () => { reiniciarFiltros(); render(); });
            return;
        }

        const fragmento = document.createDocumentFragment();
        visibles.forEach(v => fragmento.appendChild(crearFila(v)));
        tbody.appendChild(fragmento);
    }

    function crearFila(v) {
        const estado = ESTADOS[v.estado] || { texto: v.estado || '—', clase: '' };
        const pausada = v.estado === 'PAUSADA';
        const cerrada = v.estado === 'CERRADA';
        const n = candidatosDe(v);
        const modalidad = MODALIDADES[v.modalidad] || v.modalidad;

        const tr = document.createElement('tr');
        tr.dataset.id = v.id;
        tr.innerHTML = `
            <td data-label="Vacante" class="mv-col-titulo">
                <div class="mv-titulo" title="${esc(v.titulo)}">${esc(v.titulo) || 'Sin título'}</div>
                <div class="mv-sub">${esc(v.ubicacion) || '—'}${modalidad ? ' · ' + esc(modalidad) : ''}</div>
            </td>
            <td data-label="Área">${esc(AREAS[(v.area || '').toLowerCase()] || v.area) || '—'}</td>
            <td data-label="Publicada">${esc(v.fecha) || '—'}</td>
            <td data-label="Sueldo" class="mv-col-sueldo" title="${esc(v.salario)}">${esc(v.salario) || 'A convenir'}</td>
            <td data-label="Candidatos">${n === null ? '—' : `<span class="mv-cand ${n ? 'con' : ''}">${n}</span>`}</td>
            <td data-label="Estado"><span class="mv-badge ${estado.clase}">${esc(estado.texto)}</span></td>
            <td data-label="Acciones" class="mv-col-acc">
                <div class="mv-acciones">
                    <button type="button" class="mv-acc" data-accion="editar" title="Editar" aria-label="Editar">
                        <span>✏️</span><span class="mv-acc-txt">Editar</span>
                    </button>
                    ${!cerrada ? `
                    <button type="button" class="mv-acc ${pausada ? 'mv-acc-reactivar' : 'mv-acc-pausar'}" data-accion="pausar"
                        title="${pausada ? 'Reactivar' : 'Pausar'}" aria-label="${pausada ? 'Reactivar' : 'Pausar'}">
                        <span>${pausada ? '▶' : '⏸'}</span><span class="mv-acc-txt">${pausada ? 'Reactivar' : 'Pausar'}</span>
                    </button>
                    <button type="button" class="mv-acc mv-acc-peligro" data-accion="cerrar" title="Cerrar" aria-label="Cerrar">
                        <span>🔒</span><span class="mv-acc-txt">Cerrar</span>
                    </button>` : ''}
                    <button type="button" class="mv-acc mv-acc-peligro" data-accion="eliminar" title="Eliminar" aria-label="Eliminar">
                        <span>🗑</span><span class="mv-acc-txt">Eliminar</span>
                    </button>
                </div>
            </td>`;
        return tr;
    }

    function pintarPaginacion(totalPaginas) {
        const cont = $('mv-paginacion');
        cont.innerHTML = '';
        if (totalPaginas <= 1) return;

        const ir = (destino) => {
            pagina = destino;
            render();
            $('mv-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        const boton = (texto, destino, deshabilitado) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'page-btn';
            b.textContent = texto;
            b.disabled = deshabilitado;
            b.addEventListener('click', () => ir(destino));
            return b;
        };

        cont.appendChild(boton('« Anterior', pagina - 1, pagina <= 1));

        const numeros = document.createElement('div');
        numeros.className = 'page-numbers';
        const items = typeof rangoPaginas === 'function'
            ? rangoPaginas(pagina, totalPaginas)
            : Array.from({ length: totalPaginas }, (_, i) => i + 1);

        items.forEach(p => {
            if (p === '…') {
                const puntos = document.createElement('span');
                puntos.className = 'page-ellipsis';
                puntos.textContent = '…';
                numeros.appendChild(puntos);
            } else {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'page-num' + (p === pagina ? ' active' : '');
                b.textContent = p;
                b.addEventListener('click', () => ir(p));
                numeros.appendChild(b);
            }
        });
        cont.appendChild(numeros);

        cont.appendChild(boton('Siguiente »', pagina + 1, pagina >= totalPaginas));
    }

    /* ── Acciones ── */
    async function ejecutar(boton, tarea) {
        boton.disabled = true;
        try {
            await tarea();
        } catch (err) {
            avisar('Error: ' + err.message, 'error');
        } finally {
            boton.disabled = false;
        }
    }

    async function cambiarEstado(v, nuevoEstado, mensajeOk) {
        const resp = await fetch(`/api/empresa/vacantes/${v.id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (!resp.ok) throw new Error(await resp.text());
        avisar(mensajeOk, 'success');
        await cargar({ silencioso: true });
    }

    async function alternarPausa(v) {
        const nuevo = v.estado === 'PAUSADA' ? 'ABIERTA' : 'PAUSADA';
        await cambiarEstado(v, nuevo, nuevo === 'PAUSADA'
            ? '✓ Vacante pausada. Ya no es visible para candidatos.'
            : '✓ Vacante reactivada.');
    }

    async function cerrar(v) {
        if (!confirm(`¿Cerrar la vacante "${v.titulo}"? Se notificará a todos los candidatos que se postularon, y no podrás reabrirla desde aquí.`)) return;
        await cambiarEstado(v, 'CERRADA', '✓ Vacante cerrada. Se notificó a los candidatos.');
    }

    async function eliminar(v) {
        const cerrada = v.estado === 'CERRADA';
        const n = candidatosDe(v) || 0;

        // Una vacante abierta o pausada con candidatos no se puede borrar: se avisa sin esperar al servidor
        if (!cerrada && n > 0) {
            alert(`Esta vacante tiene ${n} candidato(s) y no se puede eliminar sin perder ese historial.\n\nCiérrala primero; una vez cerrada podrás eliminarla.`);
            return;
        }

        const mensaje = cerrada
            ? `¿Eliminar "${v.titulo}"? Como está cerrada, esto también borrará permanentemente todas sus postulaciones e historial. Esta acción no se puede deshacer.`
            : `¿Seguro que quieres eliminar la vacante "${v.titulo}"? Esta acción no se puede deshacer.`;
        if (!confirm(mensaje)) return;

        const resp = await fetch(`/api/empresa/vacantes/${v.id}`, { method: 'DELETE' });
        if (resp.status === 409) {
            alert(await resp.text());   // mensaje largo del servidor: mejor en un cuadro que en el aviso corto
            return;
        }
        if (!resp.ok) throw new Error(await resp.text());

        avisar('✓ Vacante eliminada.', 'success');
        await cargar({ silencioso: true });
    }
})();