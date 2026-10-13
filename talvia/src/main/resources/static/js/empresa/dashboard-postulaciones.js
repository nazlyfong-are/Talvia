(function () {
    const VACANTES_POR_PAGINA = 5;
    const CANDIDATOS_POR_PAGINA = 8;

    const ESTADOS = {
        PENDIENTE:  { texto: 'Pendiente',  corto: 'pendientes',  opcion: '⏳ Pendiente' },
        EN_PROCESO: { texto: 'En proceso', corto: 'en proceso',  opcion: '🔄 En proceso' },
        ACEPTADO:   { texto: 'Aceptado',   corto: 'aceptados',   opcion: '✅ Aceptado' },
        RECHAZADO:  { texto: 'Rechazado',  corto: 'rechazados',  opcion: '❌ Rechazado' }
    };
    const ORDEN_ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'ACEPTADO', 'RECHAZADO'];
    const FILTROS_INICIALES = { q: '', estado: 'TODOS', vacante: '', desde: '', hasta: '', orden: 'recientes', sinRevisar: false };

    let postulaciones = [];
    let soportaVista = false;          // true si el servidor ya manda fechaVista
    let filtros = { ...FILTROS_INICIALES };
    let paginaVacantes = 1;
    let ordenVacantes = [];            // orden de los acordeones, fijo hasta que cambian los filtros
    let inicializado = false;
    let temporizador = null;
    const abiertas = new Set();        // ids de vacantes con el acordeón abierto
    const paginaCand = new Map();      // vacanteId → página actual de candidatos

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

    // "José" y "jose" cuentan como lo mismo al buscar
    function normalizar(texto) {
        return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    // Convierte "2026-09-05" o "05/09/2026" en 20260905, para comparar sin importar el formato
    function claveFecha(texto) {
        if (!texto) return '';
        const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
        if (iso) return iso[1] + iso[2] + iso[3];
        const dmy = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(texto);
        if (dmy) return dmy[3] + dmy[2] + dmy[1];
        return '';
    }

    function iniciales(nombre) {
        const partes = (nombre || '').trim().split(/\s+/).filter(Boolean);
        return (partes.slice(0, 2).map(p => p[0]).join('') || '?').toUpperCase();
    }

    function hoyLocal() {
        return new Date().toLocaleDateString('en-CA');   // yyyy-mm-dd en la zona horaria local
    }

    function rangoDe(actual, total) {
        return typeof rangoPaginas === 'function'
            ? rangoPaginas(actual, total)
            : Array.from({ length: total }, (_, i) => i + 1);
    }

    /* ── Inicio ── */
    document.addEventListener('DOMContentLoaded', () => {
        if (!$('acordeon-vacantes')) return;

        // Búsqueda
        $('searchCandidatos').addEventListener('input', (e) => {
            clearTimeout(temporizador);
            temporizador = setTimeout(() => {
                filtros.q = e.target.value.trim();
                aplicarFiltros();
            }, 250);
        });

        // Chips de estado
        $('filtrosEstado').addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            filtros.estado = chip.dataset.estado;
            aplicarFiltros();
        });

        // Botón y panel de filtros
        $('btn-filtros').addEventListener('click', () => {
            const panel = $('panel-filtros');
            const abrir = panel.hidden;
            panel.hidden = !abrir;
            $('btn-filtros').setAttribute('aria-expanded', String(abrir));
        });

        $('f-vacante').addEventListener('change', (e) => { filtros.vacante = e.target.value; aplicarFiltros(); });
        $('f-orden').addEventListener('change', (e) => { filtros.orden = e.target.value; aplicarFiltros(); });
        $('f-sin-revisar').addEventListener('change', (e) => { filtros.sinRevisar = e.target.checked; aplicarFiltros(); });
        $('f-desde').addEventListener('change', (e) => {
            filtros.desde = e.target.value;
            $('f-hasta').min = e.target.value;
            aplicarFiltros();
        });
        $('f-hasta').addEventListener('change', (e) => {
            filtros.hasta = e.target.value;
            $('f-desde').max = e.target.value;
            aplicarFiltros();
        });
        $('f-limpiar').addEventListener('click', reiniciarFiltros);

        // Acciones dentro de los acordeones (un solo listener para todo)
        const acordeones = $('acordeon-vacantes');

        acordeones.addEventListener('click', (e) => {
            const cabecera = e.target.closest('.ic-ac-head');
            if (cabecera) { alternar(cabecera.closest('.ic-acordeon')); return; }

            // NUEVO: botón del ranking de compatibilidad de la vacante
            const rk = e.target.closest('[data-accion="ranking"]');
            if (rk) {
                const ac = rk.closest('.ic-acordeon');
                if (typeof abrirRanking === 'function') abrirRanking(Number(ac.dataset.id), ac.dataset.titulo);
                return;
            }

            const ver = e.target.closest('[data-accion="ver"]');
            if (ver) { verCurriculum(Number(ver.closest('.ic-fila').dataset.id)); return; }

            const pg = e.target.closest('.ic-pg');
            if (pg && !pg.disabled) {
                const vacanteId = Number(pg.dataset.vac);
                paginaCand.set(vacanteId, Number(pg.dataset.pag));
                render();
                document.querySelector(`.ic-acordeon[data-id="${vacanteId}"]`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        acordeones.addEventListener('change', (e) => {
            const select = e.target.closest('[data-accion="estado"]');
            if (select) {
                cambiarEstado(Number(select.closest('.ic-fila').dataset.id), select.value, select);
            }
        });

        // Modal del candidato
        $('btnCerrarCV')?.addEventListener('click', cerrarModal);
        $('modalVistaCV')?.addEventListener('click', (e) => { if (e.target.id === 'modalVistaCV') cerrarModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });

        cargar();
    });

    function cerrarModal() {
        const modal = $('modalVistaCV');
        if (modal) modal.style.display = 'none';
    }

    /* ── Carga ── */
    async function cargar() {
        try {
            const resp = await fetch('/api/empresa/postulaciones');
            if (!resp.ok) throw new Error('No se pudieron cargar las postulaciones.');
            postulaciones = await resp.json();

            soportaVista = postulaciones.some(p => 'fechaVista' in p);
            const check = $('f-sin-revisar');
            check.disabled = !soportaVista;
            if (!soportaVista) check.title = 'Disponible cuando el servidor envíe la fecha de vista';

            poblarVacantes();
            render({ reordenar: true });
        } catch (err) {
            $('acordeon-vacantes').innerHTML = '';
            $('acordeon-vacantes').appendChild(estadoVacio(
                `<strong>No se pudo cargar</strong>${esc(err.message)}<br>
                 <button type="button" id="ic-reintentar">Reintentar</button>`));
            $('ic-reintentar').addEventListener('click', () => {
                $('acordeon-vacantes').innerHTML = '<div class="skeleton-loader skeleton-card"></div>';
                cargar();
            });
        }
    }

    // El selector de vacantes ofrece solo las que tienen candidatos
    function poblarVacantes() {
        const select = $('f-vacante');
        const unicas = new Map();
        postulaciones.forEach(p => { if (!unicas.has(p.vacanteId)) unicas.set(p.vacanteId, p.vacanteTitulo || 'Vacante'); });

        const titulos = [...unicas.values()];
        const opciones = [...unicas.entries()]
            .sort((a, b) => a[1].localeCompare(b[1], 'es'))
            .map(([id, titulo]) => {
                const repetido = titulos.filter(t => t === titulo).length > 1;
                return `<option value="${id}">${esc(titulo)}${repetido ? ' · #' + id : ''}</option>`;
            });

        select.innerHTML = '<option value="">Todas las vacantes</option>' + opciones.join('');
        select.value = filtros.vacante;
    }

    /* ── Filtros ── */
    function filtrar(omitirEstado = false) {
        const q = normalizar(filtros.q);
        const desde = claveFecha(filtros.desde);
        const hasta = claveFecha(filtros.hasta);

        return postulaciones.filter(p => {
            const fecha = claveFecha(p.fecha);
            return (omitirEstado || filtros.estado === 'TODOS' || p.estado === filtros.estado) &&
                (!filtros.vacante || String(p.vacanteId) === filtros.vacante) &&
                (!q || normalizar(p.nombreCompleto).includes(q)) &&
                (!desde || fecha >= desde) &&
                (!hasta || (fecha !== '' && fecha <= hasta)) &&
                (!filtros.sinRevisar || !p.fechaVista);
        });
    }

    function filtrosActivos() {
        let n = 0;
        if (filtros.vacante) n++;
        if (filtros.desde) n++;
        if (filtros.hasta) n++;
        if (filtros.orden !== 'recientes') n++;
        if (filtros.sinRevisar) n++;
        return n;
    }

    function hayFiltros() {
        return filtrosActivos() > 0 || !!filtros.q || filtros.estado !== 'TODOS';
    }

    function aplicarFiltros() {
        paginaVacantes = 1;
        paginaCand.clear();
        render({ reordenar: true });
    }

    function reiniciarFiltros() {
        filtros = { ...FILTROS_INICIALES };
        $('searchCandidatos').value = '';
        $('f-vacante').value = '';
        $('f-desde').value = '';
        $('f-hasta').value = '';
        $('f-desde').max = '';
        $('f-hasta').min = '';
        $('f-orden').value = 'recientes';
        $('f-sin-revisar').checked = false;
        aplicarFiltros();
    }

    /* ── Agrupar y ordenar ── */
    function comparadorCandidatos() {
        const masReciente = (a, b) => claveFecha(b.fecha).localeCompare(claveFecha(a.fecha)) || (b.id - a.id);
        switch (filtros.orden) {
            case 'antiguas': return (a, b) => masReciente(b, a);
            case 'nombre':   return (a, b) => (a.nombreCompleto || '').localeCompare(b.nombreCompleto || '', 'es');
            default:         return masReciente;
        }
    }

    function agrupar(lista, reordenar) {
        const mapa = new Map();
        lista.forEach(p => {
            if (!mapa.has(p.vacanteId)) {
                mapa.set(p.vacanteId, { id: p.vacanteId, titulo: p.vacanteTitulo, candidatos: [], pendientes: 0 });
            }
            const g = mapa.get(p.vacanteId);
            g.candidatos.push(p);
            if (p.estado === 'PENDIENTE') g.pendientes++;
        });

        const grupos = [...mapa.values()];
        const comparador = comparadorCandidatos();
        grupos.forEach(g => g.candidatos.sort(comparador));

        const porPendientes = (a, b) =>
            (b.pendientes - a.pendientes) ||
            (b.candidatos.length - a.candidatos.length) ||
            (a.titulo || '').localeCompare(b.titulo || '', 'es');

        if (reordenar || ordenVacantes.length === 0) {
            grupos.sort(porPendientes);
            ordenVacantes = grupos.map(g => g.id);
        } else {
            // Al cambiar un estado no se reordenan los acordeones: no saltan bajo el mouse
            const posicion = new Map(ordenVacantes.map((id, i) => [id, i]));
            const pos = (g) => posicion.has(g.id) ? posicion.get(g.id) : Number.MAX_SAFE_INTEGER;
            grupos.sort((a, b) => (pos(a) - pos(b)) || porPendientes(a, b));
        }
        return grupos;
    }

    /* ── Pintado ── */
    function actualizarChips() {
        const base = filtrar(true);   // los números de cada chip respetan los demás filtros
        const conteo = { TODOS: base.length, PENDIENTE: 0, EN_PROCESO: 0, ACEPTADO: 0, RECHAZADO: 0 };
        base.forEach(p => { if (conteo[p.estado] !== undefined) conteo[p.estado]++; });

        document.querySelectorAll('#filtrosEstado .chip').forEach(chip => {
            const estado = chip.dataset.estado;
            chip.classList.toggle('active', estado === filtros.estado);
            chip.querySelector('.chip-count').textContent = conteo[estado] ?? 0;
        });
    }

    function actualizarContadorFiltros() {
        const n = filtrosActivos();
        const insignia = $('filtros-n');
        insignia.textContent = n;
        insignia.hidden = n === 0;
    }

    function estadoVacio(html) {
        const div = document.createElement('div');
        div.className = 'ic-vacio';
        div.innerHTML = html;
        return div;
    }

    function render(opciones = {}) {
        const { reordenar = false } = opciones;

        actualizarChips();
        actualizarContadorFiltros();

        const total = postulaciones.length;
        $('badge-total').textContent = `${total} ${total === 1 ? 'Candidato' : 'Candidatos'}`;

        const cont = $('acordeon-vacantes');
        $('ic-paginacion').innerHTML = '';
        cont.innerHTML = '';

        if (total === 0) {
            $('ic-resumen').textContent = '';
            cont.appendChild(estadoVacio(`<strong>Aún no has recibido postulaciones</strong>
                Cuando un candidato se postule a una de tus vacantes, aparecerá aquí.
                <br><button type="button" id="ic-ir-vacantes">Ver mis vacantes</button>`));
            $('ic-ir-vacantes').addEventListener('click', () => {
                if (typeof irASeccion === 'function') irASeccion('sec-mis-vacantes');
            });
            return;
        }

        const lista = filtrar();

        if (lista.length === 0) {
            $('ic-resumen').textContent = '';
            cont.appendChild(estadoVacio(`<strong>Ningún candidato coincide con los filtros</strong>
                <button type="button" id="ic-vacio-limpiar">Limpiar filtros</button>`));
            $('ic-vacio-limpiar').addEventListener('click', reiniciarFiltros);
            return;
        }

        const grupos = agrupar(lista, reordenar);

        if (!inicializado) {          // al entrar, el primer acordeón (el de más pendientes) ya viene abierto
            abiertas.add(grupos[0].id);
            inicializado = true;
        }

        const totalPaginas = Math.max(1, Math.ceil(grupos.length / VACANTES_POR_PAGINA));
        if (paginaVacantes > totalPaginas) paginaVacantes = totalPaginas;

        const inicio = (paginaVacantes - 1) * VACANTES_POR_PAGINA;
        const visibles = grupos.slice(inicio, inicio + VACANTES_POR_PAGINA);

        $('ic-resumen').textContent =
            `${grupos.length} ${grupos.length === 1 ? 'vacante' : 'vacantes'} · ` +
            `${lista.length} ${lista.length === 1 ? 'candidato' : 'candidatos'}` +
            (hayFiltros() ? ' (con filtros)' : '');

        const fragmento = document.createDocumentFragment();
        visibles.forEach(g => fragmento.appendChild(crearAcordeon(g)));
        cont.appendChild(fragmento);

        pintarPaginacionVacantes(totalPaginas);
    }

    function crearAcordeon(g) {
        const total = g.candidatos.length;
        const totalPag = Math.max(1, Math.ceil(total / CANDIDATOS_POR_PAGINA));
        const pag = Math.min(paginaCand.get(g.id) || 1, totalPag);
        paginaCand.set(g.id, pag);

        const inicio = (pag - 1) * CANDIDATOS_POR_PAGINA;
        const visibles = g.candidatos.slice(inicio, inicio + CANDIDATOS_POR_PAGINA);
        const abierto = abiertas.has(g.id);

        const conteo = {};
        g.candidatos.forEach(p => { conteo[p.estado] = (conteo[p.estado] || 0) + 1; });
        const resumen = ORDEN_ESTADOS
            .filter(e => conteo[e])
            .map(e => `<span class="ic-pill ic-pill-${e}">${conteo[e]} ${ESTADOS[e].corto}</span>`)
            .join('');

        const div = document.createElement('div');
        div.className = 'ic-acordeon' + (abierto ? ' abierto' : '');
        div.dataset.id = g.id;
        div.dataset.titulo = g.titulo || '';          // NUEVO: el ranking lo usa como título del panel
        div.innerHTML = `
            <button type="button" class="ic-ac-head" aria-expanded="${abierto}">
                <span class="ic-ac-titulo">${esc(g.titulo) || 'Vacante'}
                    <span class="ic-ac-count">${total}</span></span>
                <span class="ic-ac-resumen">${resumen}</span>
                <span class="ic-ac-flecha">▾</span>
            </button>
            <div class="ic-ac-body">
                <!-- NUEVO: botón del ranking de compatibilidad -->
                <div class="ic-ac-herr"><button type="button" class="ic-rank-btn" data-accion="ranking">🎯 Ver ranking de compatibilidad</button></div>
                ${visibles.map(crearFila).join('')}
                <div class="ic-ac-pie">
                    <span class="ic-ac-rango">Mostrando ${inicio + 1}–${inicio + visibles.length} de ${total}</span>
                    ${miniPaginador(g.id, pag, totalPag)}
                </div>
            </div>`;
        return div;
    }

    function crearFila(p) {
        const nombre = p.nombreCompleto || 'Candidato';

        let vista = '';
        if (soportaVista) {
            vista = p.fechaVista
                ? `<span class="ic-vista ic-vista-si" title="Hoja de vida abierta el ${esc(p.fechaVista)}">👁 Vista</span>`
                : '<span class="ic-vista ic-vista-no">Sin revisar</span>';
        }

        const opciones = ORDEN_ESTADOS
            .map(e => `<option value="${e}" ${p.estado === e ? 'selected' : ''}>${ESTADOS[e].opcion}</option>`)
            .join('');
        const estado = ESTADOS[p.estado] || ESTADOS.PENDIENTE;

        return `
            <div class="ic-fila" data-id="${p.id}">
                <div class="ic-avatar">${esc(iniciales(nombre))}</div>
                <div class="ic-info">
                    <div class="ic-nombre">${esc(nombre)} ${vista}</div>
                    <div class="ic-meta">Postuló el ${esc(p.fecha) || '—'}</div>
                    <button type="button" class="ic-ver" data-accion="ver">Ver perfil completo y respuestas</button>
                </div>
                <div class="ic-estado">
                    <span class="estado-badge estado-${esc(p.estado || 'PENDIENTE')}">${estado.texto}</span>
                    <select class="ic-select" data-accion="estado" aria-label="Cambiar estado de ${esc(nombre)}">${opciones}</select>
                </div>
            </div>`;
    }

    function miniPaginador(vacanteId, pag, totalPag) {
        if (totalPag <= 1) return '';
        const numeros = rangoDe(pag, totalPag).map(p => p === '…'
            ? '<span class="ic-pg-puntos">…</span>'
            : `<button type="button" class="ic-pg ${p === pag ? 'activo' : ''}" data-vac="${vacanteId}" data-pag="${p}">${p}</button>`
        ).join('');

        return `<div class="ic-mini-pag">
            <button type="button" class="ic-pg" data-vac="${vacanteId}" data-pag="${pag - 1}" ${pag <= 1 ? 'disabled' : ''} aria-label="Página anterior">‹</button>
            ${numeros}
            <button type="button" class="ic-pg" data-vac="${vacanteId}" data-pag="${pag + 1}" ${pag >= totalPag ? 'disabled' : ''} aria-label="Página siguiente">›</button>
        </div>`;
    }

    function pintarPaginacionVacantes(totalPaginas) {
        const cont = $('ic-paginacion');
        cont.innerHTML = '';
        if (totalPaginas <= 1) return;

        const ir = (destino) => {
            paginaVacantes = destino;
            render();
            $('sec-inicio').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

        cont.appendChild(boton('« Anterior', paginaVacantes - 1, paginaVacantes <= 1));

        const numeros = document.createElement('div');
        numeros.className = 'page-numbers';
        rangoDe(paginaVacantes, totalPaginas).forEach(p => {
            if (p === '…') {
                const puntos = document.createElement('span');
                puntos.className = 'page-ellipsis';
                puntos.textContent = '…';
                numeros.appendChild(puntos);
            } else {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'page-num' + (p === paginaVacantes ? ' active' : '');
                b.textContent = p;
                b.addEventListener('click', () => ir(p));
                numeros.appendChild(b);
            }
        });
        cont.appendChild(numeros);

        cont.appendChild(boton('Siguiente »', paginaVacantes + 1, paginaVacantes >= totalPaginas));
    }

    function alternar(acordeon) {
        const id = Number(acordeon.dataset.id);
        const abrir = !acordeon.classList.contains('abierto');
        acordeon.classList.toggle('abierto', abrir);
        acordeon.querySelector('.ic-ac-head').setAttribute('aria-expanded', String(abrir));
        if (abrir) abiertas.add(id); else abiertas.delete(id);
    }

    /* ── Cambiar estado ── */
    async function cambiarEstado(id, nuevoEstado, select) {
        const p = postulaciones.find(x => x.id === id);
        if (!p) return;
        const anterior = p.estado;

        select.disabled = true;
        try {
            const resp = await fetch(`/api/empresa/postulaciones/${id}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (!resp.ok) throw new Error((await resp.text()) || 'No se pudo actualizar.');

            p.estado = nuevoEstado;
            avisar('✓ Estado actualizado.', 'success');
            render();   // conserva los acordeones abiertos y las páginas
        } catch (err) {
            select.value = anterior;
            avisar('Error al actualizar el estado: ' + err.message, 'error');
        } finally {
            select.disabled = false;
        }
    }

    /* ── Detalle del candidato (modal) ── */
    function poner(id, valor) {
        const el = $(id);
        if (el) el.textContent = valor;
    }

    function ponerHtml(id, html) {
        const el = $(id);
        if (el) el.innerHTML = html;
    }

    async function verCurriculum(id) {
        try {
            const resp = await fetch(`/api/empresa/postulaciones/${id}`);
            if (!resp.ok) throw new Error((await resp.text()) || 'No se pudo cargar el perfil.');
            const d = await resp.json();

            poner('cv-id', d.id);
            poner('cv-vacante-titulo', d.vacanteTitulo || '');
            poner('cv-fecha', d.fecha || '');
            poner('cv-salario', d.salarioEsperado || 'No especificado');
            poner('cv-disponibilidad', d.disponibilidad || 'No especificada');
            poner('cv-experiencia-resumen', d.experienciaResumen || 'No proporcionó información adicional.');

            pintarCandidato(d.candidato);

            ponerHtml('cv-archivo-completo-container', d.cvEnviadoUrl
                ? `<a href="${esc(d.cvEnviadoUrl)}" target="_blank" rel="noopener" style="display:inline-block; background: var(--ink); color: #fff; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;">📄 Descargar "${esc(d.cvEnviadoNombre)}"</a>`
                : '<p style="font-size:13px; color:#a0aec0;">El candidato no adjuntó una hoja de vida en esta postulación.</p>');

            const modal = $('modalVistaCV');
            if (modal) modal.style.display = 'flex';

            // El servidor marca la hoja de vida como vista la primera vez: se refleja aquí sin recargar
            const p = postulaciones.find(x => x.id === id);
            if (soportaVista && p && !p.fechaVista) {
                p.fechaVista = hoyLocal();
                render();
            }
        } catch (err) {
            avisar('Error al cargar el perfil: ' + err.message, 'error');
        }
    }

    const TARJETA = 'background:#f7fafc; padding:12px 14px; border-radius:6px; border:1px solid #e2e8f0;';
    const VINCULO = 'background:#e7f3ee; color:#2f7d5c; border:1px solid #2f7d5c; padding:3px 10px; border-radius:4px; font-size:12px; font-weight:600; text-decoration:none;';
    const SIN_DATOS = '<p style="font-size:13px; color:#a0aec0;">Sin información disponible.</p>';

    // Solo aparece si el candidato marcó apoyos concretos o escribió una nota.
    // "No necesito ajustes" y "Prefiero hablarlo más adelante" no se muestran.
    function pintarPreferencias(c) {
        let bloque = $('cv-preferencias');
        if (!bloque) {
            const ancla = $('cv-contacto');
            if (!ancla) return;
            bloque = document.createElement('div');
            bloque.id = 'cv-preferencias';
            ancla.insertAdjacentElement('afterend', bloque);
        }

        const grupos = window.Apoyos ? Apoyos.agrupar(c.apoyos || []) : [];
        if (grupos.length === 0 && !c.apoyosNota) {
            bloque.style.display = 'none';
            bloque.innerHTML = '';
            return;
        }

        bloque.style.cssText = 'display:block; margin:12px 0; padding:12px 14px; border-radius:6px; ' +
            'background:#eef4f8; border:1px solid #c9dbe6; border-left:4px solid #2d5a70;';
        bloque.innerHTML = `
            <div style="font-size:12px; font-weight:700; color:#2d5a70; text-transform:uppercase; letter-spacing:.04em;">
                Preferencias de trabajo
            </div>
            ${grupos.map(g => `
                <div style="font-size:12.5px; color:#4a5568; margin-top:6px;">
                    <strong style="color:#1a202c;">${esc(g.titulo)}:</strong> ${g.etiquetas.map(esc).join(' · ')}
                </div>`).join('')}
            ${c.apoyosNota ? `
                <div style="font-size:12.5px; color:#4a5568; margin-top:8px;">
                    <strong style="color:#1a202c;">Algo más:</strong> ${esc(c.apoyosNota)}
                </div>` : ''}`;
    }

    function pintarCandidato(c) {
        if (!c) return;

        poner('cv-nombre', `${c.nombres || ''} ${c.primerApellido || ''} ${c.segundoApellido || ''}`.trim());
        poner('cv-cargo', c.especialidad || 'No especificado');
        poner('cv-contacto', [c.correoElectronico, c.telefono, c.ciudad].filter(Boolean).join(' · '));

        ponerHtml('cv-experiencia-lista', (c.experiencias || []).map(e => `
            <div style="${TARJETA}">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                    <strong style="color:#1a202c; font-size:14px;">${esc(e.cargo)}</strong>
                    <span style="color:#a37b2c; font-size:12px; font-family:'IBM Plex Mono', monospace;">${esc(e.fechaInicio)} — ${e.trabajoActual ? 'Presente' : esc(e.fechaFin)}</span>
                </div>
                <div style="color:#718096; font-size:12.5px; margin-bottom:4px;">${esc(e.empresaNombre)}</div>
                <div style="color:#4a5568; font-size:13px;">${esc(e.descripcion)}</div>
            </div>`).join('') || SIN_DATOS);

        ponerHtml('cv-educacion-lista', (c.formaciones || []).map(f => `
            <div style="${TARJETA} display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                    <div style="color:#1a202c; font-weight:600; font-size:13.5px;">${esc(f.titulo)}</div>
                    <div style="color:#718096; font-size:12.5px;">${esc(f.institucion)}</div>
                </div>
                ${f.documentoUrl
                    ? `<a href="${esc(f.documentoUrl)}" target="_blank" rel="noopener" style="${VINCULO}">⬇ Ver título</a>`
                    : '<span style="font-size:12px; color:#a0aec0;">Sin título adjunto</span>'}
            </div>`).join('') || SIN_DATOS);

        ponerHtml('cv-certificaciones-lista', (c.certificaciones || []).map(x => `
            <div style="${TARJETA} display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                    <div style="color:#1a202c; font-weight:600; font-size:13.5px;">${esc(x.nombre)}</div>
                    <div style="color:#718096; font-size:12.5px;">${esc(x.entidadEmisora)}</div>
                </div>
                ${x.documentoUrl
                    ? `<a href="${esc(x.documentoUrl)}" target="_blank" rel="noopener" style="${VINCULO}">⬇ Ver certificado</a>`
                    : '<span style="font-size:12px; color:#a0aec0;">Sin documento adjunto</span>'}
            </div>`).join('') || SIN_DATOS);

        ponerHtml('cv-idiomas', (c.idiomas || []).map(i => `<span class="cv-badge">${esc(i.nombre)}</span>`).join('') || 'No especificado');
        ponerHtml('cv-habilidades', (c.habilidadesTecnicas || []).map(h => `<span class="cv-badge">${esc(h.nombre)}</span>`).join('') || 'No especificado');

        pintarPreferencias(c);
    }

    // NUEVO: el panel del ranking abre el mismo modal del candidato
    window.verCandidato = verCurriculum;
})();