(function () {
    const POR_PAGINA = 10;
    const ESTADOS = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', ACEPTADO: 'Aceptado', RECHAZADO: 'Rechazado' };
    const NIVELES = { ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' };
    const SIGNO = { POSITIVO: '+', NEGATIVO: '−', NEUTRO: '·' };

    let datos = null;
    let visibles = POR_PAGINA;
    let soloAbiertas = true;
    let texto = '';
    let turno = 0;               // evita que una respuesta lenta pise a una más nueva
    let temporizador = null;

    const $ = (id) => document.getElementById(id);

    function esc(valor) {
        if (valor === null || valor === undefined) return '';
        return String(valor)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // "José" y "jose" cuentan como lo mismo al buscar
    function normalizar(t) {
        return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    /* ── Construcción del panel (una sola vez) ── */
    function construir() {
        if ($('rk-fondo')) return;

        const fondo = document.createElement('div');
        fondo.id = 'rk-fondo';
        fondo.className = 'rk-fondo';
        fondo.innerHTML = `
            <aside class="rk-panel" role="dialog" aria-modal="true" aria-labelledby="rk-titulo">
                <header class="rk-cab">
                    <div>
                        <div class="rk-eyebrow">Ranking de compatibilidad</div>
                        <h3 id="rk-titulo" class="rk-titulo"></h3>
                        <div id="rk-sub" class="rk-sub"></div>
                    </div>
                    <button type="button" class="rk-cerrar" id="rk-cerrar" aria-label="Cerrar el ranking">✕</button>
                </header>
                <div id="rk-aviso" class="rk-aviso" hidden></div>
                <div class="rk-barra-herr">
                    <input type="text" id="rk-buscar" class="rk-buscar" placeholder="Buscar candidato…" autocomplete="off">
                    <label class="rk-check"><input type="checkbox" id="rk-abiertas" checked><span>Solo sin decisión</span></label>
                </div>
                <div id="rk-cuerpo" class="rk-cuerpo"></div>
            </aside>`;
        document.body.appendChild(fondo);

        $('rk-cerrar').addEventListener('click', cerrar);
        fondo.addEventListener('click', (e) => { if (e.target === fondo) cerrar(); });

        // En captura, para saber si el modal del candidato sigue abierto antes de que él procese la tecla
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' || !fondo.classList.contains('abierto')) return;
            const modal = $('modalVistaCV');
            if (modal && modal.style.display === 'flex') return;
            cerrar();
        }, true);

        $('rk-buscar').addEventListener('input', (e) => {
            clearTimeout(temporizador);
            temporizador = setTimeout(() => { texto = e.target.value.trim(); visibles = POR_PAGINA; pintar(); }, 200);
        });
        $('rk-abiertas').addEventListener('change', (e) => { soloAbiertas = e.target.checked; visibles = POR_PAGINA; pintar(); });

        $('rk-cuerpo').addEventListener('click', (e) => {
            if (e.target.closest('.rk-ver')) {
                const id = Number(e.target.closest('.rk-item').dataset.id);
                if (typeof window.verCandidato === 'function') window.verCandidato(id);
            } else if (e.target.closest('.rk-mas')) {
                visibles += POR_PAGINA;
                pintar();
            } else if (e.target.closest('#rk-todos')) {
                soloAbiertas = false;
                $('rk-abiertas').checked = false;
                pintar();
            }
        });
    }

    /* ── Abrir y cerrar ── */
    async function abrir(vacanteId, titulo) {
        construir();
        datos = null;
        visibles = POR_PAGINA;
        soloAbiertas = true;
        texto = '';
        $('rk-buscar').value = '';
        $('rk-abiertas').checked = true;
        $('rk-titulo').textContent = titulo || 'Vacante';
        $('rk-sub').textContent = 'Cargando candidatos…';
        $('rk-aviso').hidden = true;
        $('rk-cuerpo').innerHTML = '<div class="skeleton-loader skeleton-block"></div>'.repeat(3);
        $('rk-fondo').classList.add('abierto');
        document.body.style.overflow = 'hidden';
        $('rk-cerrar').focus();

        const mio = ++turno;
        try {
            const resp = await fetch(`/api/empresa/vacantes/${vacanteId}/ranking`);
            if (!resp.ok) throw new Error((await resp.text()) || 'No se pudo cargar el ranking.');
            const json = await resp.json();
            if (mio !== turno) return;
            datos = json;
            pintar();
        } catch (err) {
            if (mio !== turno) return;
            $('rk-sub').textContent = '';
            $('rk-cuerpo').innerHTML = `<div class="rk-vacio"><strong>No se pudo cargar</strong>${esc(err.message)}<br>
                <button type="button" id="rk-reintentar">Reintentar</button></div>`;
            $('rk-reintentar').addEventListener('click', () => abrir(vacanteId, titulo));
        }
    }

    function cerrar() {
        turno++;
        const fondo = $('rk-fondo');
        if (fondo) fondo.classList.remove('abierto');
        document.body.style.overflow = '';
    }

    /* ── Pintado ── */
    function filtradas() {
        const q = normalizar(texto);
        return datos.candidatos.filter(c =>
            (!soloAbiertas || c.estado === 'PENDIENTE' || c.estado === 'EN_PROCESO') &&
            (!q || normalizar(c.nombre).includes(q)));
    }

    function pintar() {
        if (!datos) return;
        const cuerpo = $('rk-cuerpo');
        const provisional = datos.origen !== 'MODELO';

        // NUEVO: el texto habla de compatibilidad, no de "puntaje"
        $('rk-sub').textContent =
            `${datos.total} ${datos.total === 1 ? 'candidato' : 'candidatos'} · ` +
            (provisional ? 'compatibilidad provisional' : 'modelo ' + (datos.version || ''));

        // NUEVO: aviso con el alcance del porcentaje
        const aviso = $('rk-aviso');
        aviso.hidden = false;
        aviso.textContent = (provisional
            ? 'Porcentaje provisional calculado con reglas; se reemplazará por el modelo entrenado. '
            : 'El porcentaje no usa el sueldo esperado ni los apoyos del candidato. ')
            + 'Estima qué tan compatible es cada candidato según postulaciones anteriores y orienta el orden en que los revisas; no decide ni rechaza a nadie.';

        if (datos.total === 0) {
            cuerpo.innerHTML = '<div class="rk-vacio"><strong>Esta vacante aún no tiene candidatos</strong>Cuando alguien se postule, aparecerá aquí con su porcentaje de compatibilidad.</div>';
            return;
        }

        const lista = filtradas();
        if (lista.length === 0) {
            cuerpo.innerHTML = `<div class="rk-vacio"><strong>Ningún candidato coincide</strong>
                ${soloAbiertas ? 'Los candidatos con decisión están ocultos.<br><button type="button" id="rk-todos">Mostrar todos</button>' : ''}</div>`;
            return;
        }

        const mostrar = lista.slice(0, visibles);
        cuerpo.innerHTML = mostrar.map(crearItem).join('') +
            (lista.length > visibles
                ? `<button type="button" class="rk-mas">Mostrar ${Math.min(POR_PAGINA, lista.length - visibles)} más (${lista.length - visibles} restantes)</button>`
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
            `<span class="rk-factor rk-${String(f.efecto || '').toLowerCase()}"><b>${SIGNO[f.efecto] || '·'}</b>${esc(f.texto)}</span>`).join('');

        const porcentaje = Math.max(0, Math.min(100, Math.round(Number(c.puntaje) || 0)));

        return `
            <article class="rk-item" data-id="${c.postulacionId}">
                <div class="rk-pos">#${c.posicion}</div>
                <div class="rk-info">
                    <div class="rk-nombre">${esc(c.nombre)}
                        <span class="estado-badge estado-${esc(c.estado)}">${esc(ESTADOS[c.estado] || c.estado)}</span>
                        ${c.vista ? '' : '<span class="rk-sin-revisar">Sin revisar</span>'}
                    </div>
                    <div class="rk-meta">${meta}</div>
                    <div class="rk-factores">${factores}</div>
                    <button type="button" class="rk-ver">Ver perfil y respuestas</button>
                </div>
                <!-- NUEVO: medidor circular con el porcentaje de compatibilidad -->
                <div class="rk-puntaje rk-${nivel}">
                    <div class="rk-medidor" style="--pct:${porcentaje}" role="img"
                         aria-label="Compatibilidad ${porcentaje} por ciento, nivel ${esc(nivelTxt)}"
                         title="Compatibilidad estimada con la vacante, calculada con postulaciones anteriores. Orienta el orden de revisión; no decide.">
                        <span class="rk-medidor-valor">${porcentaje}<small>%</small></span>
                    </div>
                    <div class="rk-medidor-texto">Compatibilidad</div>
                    <div class="rk-nivel">${esc(nivelTxt)}</div>
                </div>
            </article>`;
    }

    window.abrirRanking = abrir;
})();