/* ============================================
   DASHBOARD EMPRESA: Ranking de compatibilidad (pestaña de pantalla completa)
   - Se abre con abrirRanking(vacanteId), desde el menú "Ranking", desde Mis Vacantes y desde el Inicio.
   - Muestra: selector de vacante, resumen por nivel (Alta, Media, Baja), búsqueda y la lista completa.
   - No depende de cómo estén armadas las demás pestañas: oculta las secciones "sec-…" mientras está abierta
     y las vuelve a mostrar sola al cerrar o al elegir otra pestaña.
   Endpoints: GET /api/empresa/vacantes · GET /api/empresa/postulaciones · GET /api/empresa/vacantes/{id}/ranking
   Usa verCandidato(postulacionId), que expone dashboard-postulaciones.js.
============================================ */
(function () {
    const POR_PAGINA = 15;
    const ESTADOS = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', ACEPTADO: 'Aceptado', RECHAZADO: 'Rechazado' };
    const NIVELES = { ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' };
    const SIGNO = { POSITIVO: '+', NEGATIVO: '−', NEUTRO: '·' };
    const ESTADOS_VACANTE = { PAUSADA: 'pausada', CERRADA: 'cerrada' };

    let vacantes = [];
    let conteos = new Map();             // vacanteId → número de candidatos
    let datos = null;                    // respuesta del ranking de la vacante elegida
    let nivelFiltro = '';                // '', 'ALTA', 'MEDIA' o 'BAJA'
    let soloAbiertas = true;
    let texto = '';
    let visibles = POR_PAGINA;
    let turno = 0;                       // evita que una respuesta lenta pise a una más nueva
    let temporizador = null;
    let abierto = false;
    let activosPrevios = [];             // elementos del menú que estaban marcados como activos antes de abrir

    const $ = (id) => document.getElementById(id);

    function esc(valor) {
        if (valor === null || valor === undefined) return '';
        return String(valor)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Sin tildes, sin mayúsculas y con un solo espacio entre palabras
    const normalizar = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    const contieneTodas = (txt, consulta) => !consulta || consulta.split(' ').every(p => txt.includes(p));

    /* ── Dónde se pone la vista ── */
    function contenedor() {
        const ref = $('sec-mis-vacantes') || document.querySelector('[id^="sec-"]');
        return ref ? ref.parentElement : null;
    }

    /* ── Construcción de la vista (una sola vez) ── */
    function construir() {
        if ($('sec-ranking')) return true;
        const cont = contenedor();
        if (!cont) return false;

        const seccion = document.createElement('section');
        seccion.id = 'sec-ranking';
        seccion.className = 'rkp';
        seccion.setAttribute('aria-labelledby', 'rkp-titulo');
        seccion.innerHTML = `
            <div class="rkp-cabecera">
                <div class="rkp-cabecera-texto">
                    <button type="button" class="rkp-volver" id="rkp-volver">← Volver</button>
                    <p class="rkp-eyebrow">Ranking de compatibilidad</p>
                    <h2 id="rkp-titulo" class="rkp-titulo" tabindex="-1">Candidatos por compatibilidad</h2>
                    <p id="rkp-sub" class="rkp-sub"></p>
                </div>
                <div class="rkp-selector">
                    <label for="rkp-vacante">Vacante</label>
                    <select id="rkp-vacante" class="rkp-select"></select>
                </div>
            </div>
            <div id="rkp-aviso" class="rkp-aviso" hidden></div>
            <div id="rkp-resumen" class="rkp-resumen"></div>
            <div class="rkp-herramientas">
                <input type="text" id="rkp-buscar" class="rkp-buscar" placeholder="Buscar candidato…" autocomplete="off">
                <label class="rkp-check"><input type="checkbox" id="rkp-abiertas" checked><span>Solo sin decisión</span></label>
                <button type="button" id="rkp-quitar" class="rkp-quitar" hidden>Quitar filtro de nivel</button>
            </div>
            <p id="rkp-conteo" class="rkp-conteo" role="status" aria-live="polite"></p>
            <div id="rkp-lista" class="rkp-lista"></div>`;
        cont.appendChild(seccion);

        $('rkp-volver').addEventListener('click', () => cerrar(true));
        $('rkp-vacante').addEventListener('change', (e) => cargarRanking(Number(e.target.value)));
        $('rkp-buscar').addEventListener('input', (e) => {
            clearTimeout(temporizador);
            temporizador = setTimeout(() => { texto = normalizar(e.target.value); visibles = POR_PAGINA; pintarLista(); }, 200);
        });
        $('rkp-abiertas').addEventListener('change', (e) => { soloAbiertas = e.target.checked; visibles = POR_PAGINA; pintar(); });
        $('rkp-quitar').addEventListener('click', () => { nivelFiltro = ''; visibles = POR_PAGINA; pintar(); });

        $('rkp-resumen').addEventListener('click', (e) => {
            const t = e.target.closest('[data-nivel]');
            if (!t) return;
            nivelFiltro = nivelFiltro === t.dataset.nivel ? '' : t.dataset.nivel;
            visibles = POR_PAGINA;
            pintar();
        });

        $('rkp-lista').addEventListener('click', (e) => {
            if (e.target.closest('.rkp-ver')) {
                const id = Number(e.target.closest('.rkp-item').dataset.id);
                if (typeof window.verCandidato === 'function') window.verCandidato(id);
            } else if (e.target.closest('.rkp-mas')) {
                visibles += POR_PAGINA;
                pintarLista();
            } else if (e.target.closest('#rkp-todos')) {
                soloAbiertas = false;
                nivelFiltro = '';
                $('rkp-abiertas').checked = false;
                pintar();
            }
        });

        crearEntradaMenu();
        return true;
    }

    /* ── Entrada "Ranking" en el menú superior (clon de "Mis Vacantes", sin sus datos ni su enlace) ── */
    function crearEntradaMenu() {
        const nav = document.querySelector('.top-nav');
        if (!nav || $('nav-ranking')) return;
        const items = [...nav.querySelectorAll('a, button')];
        const modelo = items.find(el => /mis vacantes/.test(normalizar(el.textContent))) || items[items.length - 1];
        if (!modelo) return;

        const clon = modelo.cloneNode(true);
        [...clon.attributes].forEach(a => { if (a.name.startsWith('data-') || ['id', 'onclick', 'href'].includes(a.name)) clon.removeAttribute(a.name); });
        clon.id = 'nav-ranking';
        if (clon.tagName === 'A') clon.setAttribute('href', '#sec-ranking');
        clon.textContent = 'Ranking';
        clon.classList.remove(claseActiva(nav));
        modelo.after(clon);

        clon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const fondo = $('nav-backdrop');
            if (fondo && nav.classList.contains('nav-open')) fondo.click();      // cierra el menú lateral en el celular
            abrir();
        });

        // Si se elige cualquier otra pestaña, esta vista se retira y deja trabajar a la otra
        nav.addEventListener('click', (e) => { if (abierto && !e.target.closest('#nav-ranking')) cerrar(false); }, true);
    }

    function claseActiva(nav) {
        for (const el of (nav || document).querySelectorAll('*')) {
            for (const c of el.classList) if (/^(is-)?active$|activ[oa]$/.test(c)) return c;
        }
        return 'active';
    }

    function marcarMenu(activo) {
        const nav = document.querySelector('.top-nav');
        const mio = $('nav-ranking');
        if (!nav || !mio) return;
        const clase = claseActiva(nav);
        if (activo) {
            activosPrevios = [...nav.querySelectorAll('.' + clase)].filter(el => el !== mio);
            activosPrevios.forEach(el => el.classList.remove(clase));
            mio.classList.add(clase);
        } else {
            mio.classList.remove(clase);
        }
    }

    /* ── Abrir y cerrar ── */
    async function abrir(vacanteId) {
        if (!construir()) return;
        const yaAbierto = abierto;
        contenedor().classList.add('rkp-contenedor-activo');
        abierto = true;
        if (!yaAbierto) marcarMenu(true);                  // el menú se marca una sola vez, aunque se cambie de vacante
        window.scrollTo(0, 0);
        $('rkp-titulo').focus({ preventScroll: true });

        const mio = ++turno;
        $('rkp-lista').innerHTML = '<div class="skeleton-loader skeleton-block"></div>'.repeat(3);
        $('rkp-resumen').innerHTML = '';
        $('rkp-sub').textContent = 'Cargando…';
        try {
            await cargarVacantes();
            if (mio !== turno) return;
            const id = vacanteId || vacanteConMasCandidatos();
            poblarSelector(id);
            if (!id) {
                datos = null;
                $('rkp-sub').textContent = '';
                $('rkp-lista').innerHTML = '<div class="rkp-vacio"><strong>Aún no tienes vacantes con candidatos</strong>Cuando alguien se postule, aparecerá aquí con su porcentaje de compatibilidad.</div>';
                return;
            }
            await cargarRanking(id);
        } catch (err) {
            if (mio !== turno) return;
            $('rkp-sub').textContent = '';
            $('rkp-lista').innerHTML = `<div class="rkp-vacio"><strong>No se pudo cargar</strong>${esc(err.message)}<br>
                <button type="button" id="rkp-reintentar">Reintentar</button></div>`;
            $('rkp-reintentar').addEventListener('click', () => abrir(vacanteId));
        }
    }

    function cerrar(restaurarMenu) {
        turno++;
        abierto = false;
        const cont = contenedor();
        if (cont) cont.classList.remove('rkp-contenedor-activo');
        const nav = document.querySelector('.top-nav');
        const mio = $('nav-ranking');
        if (mio && nav) {
            mio.classList.remove(claseActiva(nav));
            if (restaurarMenu) activosPrevios.forEach(el => el.classList.add(claseActiva(nav)));
        }
        activosPrevios = [];
        window.scrollTo(0, 0);
    }

    /* ── Datos ── */
    async function cargarVacantes() {
        const [rv, rp] = await Promise.allSettled([fetch('/api/empresa/vacantes'), fetch('/api/empresa/postulaciones')]);
        if (rv.status !== 'fulfilled' || !rv.value.ok) throw new Error('No se pudieron cargar tus vacantes.');
        vacantes = await rv.value.json();
        conteos = new Map();
        if (rp.status === 'fulfilled' && rp.value.ok) {
            (await rp.value.json()).forEach(p => conteos.set(p.vacanteId, (conteos.get(p.vacanteId) || 0) + 1));
        }
    }

    function vacanteConMasCandidatos() {
        let mejor = null;
        vacantes.forEach(v => { const n = conteos.get(v.id) || 0; if (n > 0 && (!mejor || n > (conteos.get(mejor.id) || 0))) mejor = v; });
        return mejor ? mejor.id : null;
    }

    function poblarSelector(seleccion) {
        const sel = $('rkp-vacante');
        const orden = [...vacantes].sort((a, b) =>
            ((conteos.get(b.id) || 0) - (conteos.get(a.id) || 0)) || (a.titulo || '').localeCompare(b.titulo || '', 'es'));
        sel.innerHTML = orden.map(v => {
            const n = conteos.get(v.id) || 0;
            const repetido = vacantes.filter(x => x.titulo === v.titulo).length > 1;
            const estado = ESTADOS_VACANTE[v.estado] ? ` (${ESTADOS_VACANTE[v.estado]})` : '';
            return `<option value="${v.id}">${esc(v.titulo)}${repetido ? ' · #' + v.id : ''}${estado} — ${n} ${n === 1 ? 'candidato' : 'candidatos'}</option>`;
        }).join('');
        if (seleccion) sel.value = String(seleccion);
    }

    async function cargarRanking(id) {
        const mio = ++turno;
        nivelFiltro = '';
        texto = '';
        visibles = POR_PAGINA;
        $('rkp-buscar').value = '';
        $('rkp-vacante').value = String(id);
        $('rkp-lista').innerHTML = '<div class="skeleton-loader skeleton-block"></div>'.repeat(3);
        $('rkp-sub').textContent = 'Cargando candidatos…';
        try {
            const resp = await fetch(`/api/empresa/vacantes/${id}/ranking`);
            if (!resp.ok) throw new Error((await resp.text()) || 'No se pudo cargar el ranking.');
            const json = await resp.json();
            if (mio !== turno) return;
            datos = json;
            pintar();
        } catch (err) {
            if (mio !== turno) return;
            $('rkp-sub').textContent = '';
            $('rkp-resumen').innerHTML = '';
            $('rkp-lista').innerHTML = `<div class="rkp-vacio"><strong>No se pudo cargar</strong>${esc(err.message)}<br>
                <button type="button" id="rkp-reintentar">Reintentar</button></div>`;
            $('rkp-reintentar').addEventListener('click', () => cargarRanking(id));
        }
    }

    /* ── Pintado ── */
    const filtradas = () => datos.candidatos.filter(c =>
        (!soloAbiertas || c.estado === 'PENDIENTE' || c.estado === 'EN_PROCESO') &&
        (!nivelFiltro || c.nivel === nivelFiltro) &&
        contieneTodas(normalizar(c.nombre), texto));

    function pintar() {
        if (!datos) return;
        const provisional = datos.origen !== 'MODELO';
        $('rkp-titulo').textContent = datos.titulo || 'Vacante';
        $('rkp-sub').textContent = `${datos.total} ${datos.total === 1 ? 'candidato' : 'candidatos'} · ` +
            (provisional ? 'compatibilidad provisional' : 'modelo ' + (datos.version || ''));

        const aviso = $('rkp-aviso');
        aviso.hidden = false;
        aviso.textContent = (provisional
            ? 'Porcentaje provisional calculado con reglas; se reemplazará por el modelo entrenado. '
            : 'El porcentaje no usa el sueldo esperado ni los apoyos del candidato. ')
            + 'Estima qué tan compatible es cada candidato según postulaciones anteriores y orienta el orden en que los revisas; no decide ni rechaza a nadie.';

        pintarResumen();
        $('rkp-quitar').hidden = !nivelFiltro;
        pintarLista();
    }

    function pintarResumen() {
        const total = datos.candidatos.length;
        const cuenta = { ALTA: 0, MEDIA: 0, BAJA: 0 };
        datos.candidatos.forEach(c => { if (cuenta[c.nivel] !== undefined) cuenta[c.nivel]++; });
        $('rkp-resumen').innerHTML = ['ALTA', 'MEDIA', 'BAJA'].map(n => {
            const pct = total ? Math.round(100 * cuenta[n] / total) : 0;
            return `<button type="button" class="rkp-tarjeta rkp-${n.toLowerCase()}" data-nivel="${n}" aria-pressed="${nivelFiltro === n}">
                <span class="rkp-tarjeta-num">${cuenta[n]}</span>
                <span class="rkp-tarjeta-nivel">Compatibilidad ${NIVELES[n].toLowerCase()}</span>
                <span class="rkp-tarjeta-pct">${pct} % de los candidatos</span>
            </button>`;
        }).join('');
    }

    function pintarLista() {
        if (!datos) return;
        const lista = $('rkp-lista');
        const conteo = $('rkp-conteo');

        if (datos.total === 0) {
            conteo.textContent = '';
            lista.innerHTML = '<div class="rkp-vacio"><strong>Esta vacante aún no tiene candidatos</strong>Cuando alguien se postule, aparecerá aquí con su porcentaje de compatibilidad.</div>';
            return;
        }

        const resultado = filtradas();
        conteo.textContent = `Mostrando ${Math.min(visibles, resultado.length)} de ${resultado.length} ${resultado.length === 1 ? 'candidato' : 'candidatos'}`;

        if (resultado.length === 0) {
            lista.innerHTML = `<div class="rkp-vacio"><strong>Ningún candidato coincide</strong>
                ${(soloAbiertas || nivelFiltro) ? 'Hay filtros activos que ocultan candidatos.<br><button type="button" id="rkp-todos">Mostrar todos</button>' : ''}</div>`;
            return;
        }

        lista.innerHTML = resultado.slice(0, visibles).map(crearItem).join('') +
            (resultado.length > visibles
                ? `<button type="button" class="rkp-mas">Mostrar ${Math.min(POR_PAGINA, resultado.length - visibles)} más (${resultado.length - visibles} restantes)</button>`
                : '');
    }

    function crearItem(c) {
        const nivel = String(c.nivel || '').toLowerCase();
        const nivelTxt = NIVELES[c.nivel] || c.nivel;
        const meta = [
            c.ciudad,
            c.anosExperiencia != null ? c.anosExperiencia + ' años de experiencia' : null,
            c.fecha ? 'Postuló el ' + c.fecha : null
        ].filter(Boolean).map(esc).join(' · ');
        const factores = (c.factores || []).map(f =>
            `<span class="rkp-factor rkp-${String(f.efecto || '').toLowerCase()}"><b>${SIGNO[f.efecto] || '·'}</b>${esc(f.texto)}</span>`).join('');
        // Para no aparentar más precisión de la que hay, redondea de 5 en 5:
        //   Math.round((Number(c.puntaje) || 0) / 5) * 5
        const porcentaje = Math.max(0, Math.min(100, Math.round(Number(c.puntaje) || 0)));

        return `
            <article class="rkp-item" data-id="${c.postulacionId}">
                <div class="rkp-pos">#${c.posicion}</div>
                <div class="rkp-info">
                    <div class="rkp-nombre"><span translate="no">${esc(c.nombre)}</span>
                        <span class="estado-badge estado-${esc(c.estado)}">${esc(ESTADOS[c.estado] || c.estado)}</span>
                        ${c.vista ? '' : '<span class="rkp-sin-revisar">Sin revisar</span>'}
                    </div>
                    <div class="rkp-meta">${meta}</div>
                    <div class="rkp-factores">${factores}</div>
                    <button type="button" class="rkp-ver">Ver perfil y respuestas</button>
                </div>
                <div class="rkp-puntaje rkp-${nivel}">
                    <div class="rkp-medidor" style="--pct:${porcentaje}" role="img"
                         aria-label="Compatibilidad ${porcentaje} por ciento, nivel ${esc(nivelTxt)}"
                         title="Compatibilidad estimada con la vacante, calculada con postulaciones anteriores. Orienta el orden de revisión; no decide.">
                        <span class="rkp-medidor-valor">${porcentaje}<small>%</small></span>
                    </div>
                    <div class="rkp-medidor-texto">Compatibilidad</div>
                    <div class="rkp-nivel">${esc(nivelTxt)}</div>
                </div>
            </article>`;
    }

    // Se mantiene el nombre de siempre: lo usan los botones de Mis Vacantes y del Inicio
    window.abrirRanking = abrir;

    // El menú "Ranking" se crea en cuanto la página está lista, sin esperar a que alguien abra la vista
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', construir);
    else construir();
})();