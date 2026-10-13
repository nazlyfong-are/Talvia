(function () {
    'use strict';

    const CLAVE = 'talvia-voz';
    const SOPORTADO = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    const POR_DEFECTO = { activo: false, clic: true, foco: true, velocidad: 1, voz: '', vozEs: '' };
    const MAX_VOCES = 3;   // por idioma
    // Regiones en el orden en que se prefieren, para ofrecer voces distintas entre sí
    const REGIONES = {
        es: ['es-co', 'es-mx', 'es-419', 'es-us', 'es-es'],
        en: ['en-us', 'en-gb', 'en-au', 'en-ca', 'en-in']
    };

    function leerEstado() {
        let guardado = {};
        try { guardado = JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { /* sin almacenamiento */ }
        const e = { ...POR_DEFECTO, ...guardado };
        e.velocidad = Math.min(1.6, Math.max(0.6, Number(e.velocidad) || 1));
        return e;
    }

    function guardarEstado() {
        try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* modo privado: dura solo esta página */ }
    }

    const estado = leerEstado();
    const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const normIdioma = (l) => (l || '').toLowerCase().replace('_', '-');
    const paginaEnIngles = () => (document.documentElement.lang || '').toLowerCase().startsWith('en');

    /* ── Frases del asistente, según la voz elegida ── */
    const TEXTOS = {
        es: {
            imagen: 'Imagen', sinDescripcion: 'sin descripción', titulo: 'Título', enlace: 'Enlace', boton: 'Botón',
            desplegado: 'desplegado', plegado: 'plegado', desactivado: 'desactivado',
            casilla: 'Casilla', marcada: 'marcada', sinMarcar: 'sin marcar',
            opcion: 'Opción', seleccionada: 'seleccionada', sinSeleccionar: 'sin seleccionar',
            subirArchivo: 'Subir archivo', deslizante: 'Control deslizante', valor: 'valor',
            lista: 'Lista desplegable', seleccionado: 'seleccionado', ninguno: 'ninguno',
            contrasena: 'Campo de contraseña', conTexto: 'con texto', vacio: 'vacío',
            campo: 'Campo de texto', contiene: 'contiene', obligatorio: 'obligatorio', sinNombre: 'sin nombre',
            otraVez: 'Haz clic otra vez para activar.',
            sinTexto: 'No hay texto para leer en esta pantalla.',
            activada: 'Asistencia por voz activada. Haz clic en cualquier texto para escucharlo. Los botones y enlaces se leen con un clic y se activan con un segundo clic. Pulsa Escape para detener la voz.',
            desactivada: 'Asistencia por voz desactivada.',
            velocidad: 'Así suena esta velocidad.',
            voz: 'Esta es la voz seleccionada.'
        },
        en: {
            imagen: 'Image', sinDescripcion: 'no description', titulo: 'Heading', enlace: 'Link', boton: 'Button',
            desplegado: 'expanded', plegado: 'collapsed', desactivado: 'disabled',
            casilla: 'Checkbox', marcada: 'checked', sinMarcar: 'unchecked',
            opcion: 'Option', seleccionada: 'selected', sinSeleccionar: 'not selected',
            subirArchivo: 'Upload file', deslizante: 'Slider', valor: 'value',
            lista: 'Drop-down list', seleccionado: 'selected', ninguno: 'none',
            contrasena: 'Password field', conTexto: 'has text', vacio: 'empty',
            campo: 'Text field', contiene: 'contains', obligatorio: 'required', sinNombre: 'unnamed',
            otraVez: 'Click again to activate.',
            sinTexto: 'There is no text to read on this screen.',
            activada: 'Voice assistance on. Click any text to hear it. Buttons and links are read with one click and activated with a second click. Press Escape to stop the voice.',
            desactivada: 'Voice assistance off.',
            velocidad: 'This is how this speed sounds.',
            voz: 'This is the selected voice.'
        }
    };

    /* ── Voces: hasta 3 en español y 3 en inglés ── */
    let vocesEs = [];
    let vocesEn = [];
    let vocesListas = false;
    let alCambiarVoces = () => {};

    // Primero las que funcionan sin internet (no envían el texto de la pantalla a ningún servidor),
    // y entre ellas una por región para que las opciones sean distintas entre sí.
    function elegirVoces(todas, idioma) {
        const orden = (v) => { const i = REGIONES[idioma].indexOf(normIdioma(v.lang)); return i === -1 ? 99 : i; };
        const propias = todas
            .filter(v => normIdioma(v.lang).startsWith(idioma))
            .sort((a, b) => (Number(b.localService) - Number(a.localService)) || (orden(a) - orden(b)) || a.name.localeCompare(b.name));

        const elegidas = [];
        const regiones = new Set();
        for (const v of propias) {
            const region = normIdioma(v.lang);
            if (elegidas.length < MAX_VOCES && !regiones.has(region)) { regiones.add(region); elegidas.push(v); }
        }
        for (const v of propias) {                      // si faltan regiones, se completa con las siguientes
            if (elegidas.length >= MAX_VOCES) break;
            if (!elegidas.includes(v)) elegidas.push(v);
        }
        return elegidas;
    }

    function vozElegida() {
        const ofrecidas = [...vocesEs, ...vocesEn];
        if (!ofrecidas.length) return null;
        return ofrecidas.find(v => v.name === estado.voz) || vocesEs[0] || vocesEn[0];
    }

    // Si la página pasa a inglés (el navegador la tradujo), la voz pasa a una de inglés; al volver al
    // español, regresa a la voz en español que la persona tenía. Si eligió una voz a mano, se respeta.
    function ajustarVozAlIdioma() {
        if (!vocesEs.length && !vocesEn.length) return;
        const actual = vozElegida();
        const esIngles = !!actual && normIdioma(actual.lang).startsWith('en');
        if (paginaEnIngles()) {
            if (!esIngles && vocesEn.length) {
                if (actual) estado.vozEs = actual.name;
                estado.voz = vocesEn[0].name;
                guardarEstado();
            }
        } else if (esIngles && estado.vozEs) {
            const previa = vocesEs.find(v => v.name === estado.vozEs);
            estado.vozEs = '';
            if (previa) estado.voz = previa.name;
            guardarEstado();
        }
    }

    function cargarVoces() {
        if (!SOPORTADO) return;
        const todas = speechSynthesis.getVoices();
        vocesEs = elegirVoces(todas, 'es');
        vocesEn = elegirVoces(todas, 'en');
        ajustarVozAlIdioma();
        alCambiarVoces();
    }

    // El idioma del asistente sigue al de la voz elegida
    function idioma() {
        const v = vozElegida();
        return v && normIdioma(v.lang).startsWith('en') ? 'en' : 'es';
    }
    const t = (clave) => TEXTOS[idioma()][clave];

    if (SOPORTADO) {
        cargarVoces();
        speechSynthesis.addEventListener('voiceschanged', cargarVoces);
        setTimeout(() => { vocesListas = true; alCambiarVoces(); }, 1500);
    }

    // Cuando el navegador traduce la página suele cambiar el atributo lang de <html>
    new MutationObserver(() => { ajustarVozAlIdioma(); alCambiarVoces(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    /* ── Hablar ── */
    let turno = 0;

    function limpiar(texto) {
        return String(texto || '')
            .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, ' ')   // los emojis no se leen
            .replace(/[▾▸›‹«»•]/g, ' ')
            .replace(/\s·\s/g, ', ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Chrome corta las lecturas largas: se parte el texto en trozos de unos 180 caracteres.
    // Solo se corta en un signo de puntuación seguido de espacio, así "3.500.000" no se parte.
    function dividir(texto) {
        if (!texto) return [];
        const frases = texto.match(/.+?(?:[.!?;:]+(?=\s|$)|$)\s*/g) || [texto];
        const trozos = [];
        let actual = '';
        for (const f of frases) {
            if (actual && (actual + f).length > 180) { trozos.push(actual.trim()); actual = ''; }
            actual += f;
            while (actual.length > 220) {
                let corte = actual.lastIndexOf(' ', 200);
                if (corte < 50) corte = 200;
                trozos.push(actual.slice(0, corte).trim());
                actual = actual.slice(corte);
            }
        }
        if (actual.trim()) trozos.push(actual.trim());
        return trozos;
    }

    function hablar(texto) {
        if (!SOPORTADO) return;
        const trozos = dividir(limpiar(texto));
        const mio = ++turno;
        speechSynthesis.cancel();
        if (!trozos.length) return;
        // Chrome a veces ignora un speak() inmediato después de cancel(): se espera un instante
        setTimeout(() => {
            if (mio !== turno) return;
            const v = vozElegida();
            trozos.forEach(trozo => {
                const u = new SpeechSynthesisUtterance(trozo);
                u.lang = v ? v.lang : 'es-CO';
                if (v) u.voice = v;
                u.rate = estado.velocidad;
                speechSynthesis.speak(u);
            });
        }, 40);
    }

    function detener() {
        turno++;
        if (SOPORTADO) speechSynthesis.cancel();
    }

    /* ── Qué se lee ── */
    const visible = (el) => (el.innerText || '').replace(/\s+/g, ' ').trim();   // innerText ya omite lo oculto

    const UNIDADES = 'p, li, h1, h2, h3, h4, h5, h6, td, th, label, button, a, summary, dt, dd, legend, figcaption, blockquote, [role="button"], [role="link"], [role="tab"]';

    // El bloque de texto más cercano al clic: un párrafo, una celda, una tarjeta…
    function unidad(el) {
        const u = el.closest(UNIDADES);
        if (u && visible(u).length <= 700) return u;
        let n = el;
        for (let i = 0; n && n !== document.body && i < 6; i++, n = n.parentElement) {
            const texto = visible(n);
            if (texto && texto.length <= 500) return n;
        }
        return u || el;
    }

    function nombreDe(el) {
        const etiqueta = el.labels && el.labels[0] ? visible(el.labels[0]) : '';
        return el.getAttribute('aria-label') || etiqueta || el.getAttribute('title') || el.getAttribute('placeholder') || '';
    }

    function describirCampo(el) {
        const tipo = (el.type || '').toLowerCase();
        const nombre = nombreDe(el) || t('sinNombre');
        if (tipo === 'checkbox') return `${t('casilla')}: ${nombre}, ${el.checked ? t('marcada') : t('sinMarcar')}`;
        if (tipo === 'radio') return `${t('opcion')}: ${nombre}, ${el.checked ? t('seleccionada') : t('sinSeleccionar')}`;
        if (tipo === 'file') return `${t('subirArchivo')}: ${nombre}`;
        if (tipo === 'range') return `${t('deslizante')}: ${nombre}, ${t('valor')} ${el.value}`;
        if (el.tagName === 'SELECT') {
            const op = el.options[el.selectedIndex];
            return `${t('lista')}: ${nombre}, ${t('seleccionado')} ${op ? op.text : t('ninguno')}`;
        }
        // La contraseña nunca se lee en voz alta
        if (tipo === 'password') return `${t('contrasena')}: ${nombre}, ${el.value ? t('conTexto') : t('vacio')}`;
        return `${t('campo')}: ${nombre}${el.value ? ', ' + t('contiene') + ': ' + el.value : ', ' + t('vacio')}${el.required ? ', ' + t('obligatorio') : ''}`;
    }

    function encabezadoDeColumna(celda) {
        const tabla = celda.closest('table');
        if (!tabla) return '';
        const th = tabla.querySelectorAll('thead th')[celda.cellIndex];
        return th ? visible(th) : '';
    }

    function describir(el) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'img') return `${t('imagen')}: ${el.getAttribute('alt') || t('sinDescripcion')}`;
        if (['input', 'select', 'textarea'].includes(tag)) return describirCampo(el);

        const rol = el.getAttribute('role');
        const texto = el.getAttribute('aria-label') || visible(el) || el.getAttribute('title') || '';
        if (/^h[1-6]$/.test(tag)) return `${t('titulo')}: ${texto}`;
        if (tag === 'a' || rol === 'link') return `${t('enlace')}: ${texto}`;
        if (tag === 'button' || tag === 'summary' || rol === 'button' || rol === 'tab') {
            const apagado = el.disabled || el.getAttribute('aria-disabled') === 'true';
            const abierto = el.getAttribute('aria-expanded');
            return `${t('boton')}: ${texto}`
                + (abierto === 'true' ? `, ${t('desplegado')}` : abierto === 'false' ? `, ${t('plegado')}` : '')
                + (apagado ? `, ${t('desactivado')}` : '');
        }
        if (tag === 'td' || tag === 'th') {
            const titulo = el.dataset.label || encabezadoDeColumna(el);
            return titulo ? `${titulo}: ${texto}` : texto;
        }
        return texto;
    }

    function leerPantalla() {
        const raiz = document.querySelector('main') || document.body;
        const lineas = (raiz.innerText || '').split('\n').map(limpiar).filter(l => l.length > 1);
        if (!lineas.length) { hablar(t('sinTexto')); return; }
        hablar(limpiar(document.title) + '. ' + lineas.join('. '));
    }

    /* ── Escuchar clics y teclado ── */
    const INTERACTIVO = 'a[href], button, summary, [role="button"], [role="link"], [role="tab"]';
    const esPropio = (el) => !!el.closest('#voz-panel, #voz-boton, .voz-saltar');
    let pendiente = null;
    let pendienteHasta = 0;

    document.addEventListener('click', (e) => {
        if (!estado.activo || !estado.clic || !(e.target instanceof Element) || esPropio(e.target)) return;

        const campo = e.target.closest('input, select, textarea');
        if (campo) {
            // El campo se usa con normalidad; solo se dice cómo se llama y cómo está
            setTimeout(() => hablar(describirCampo(campo)), 0);
            return;
        }
        const etiqueta = e.target.closest('label');
        if (etiqueta && etiqueta.control) return;      // el clic llega después al campo asociado

        const accion = e.target.closest(INTERACTIVO);
        if (accion) {
            if (pendiente === accion && Date.now() < pendienteHasta) { pendiente = null; return; }   // segundo clic: se activa
            e.preventDefault();
            e.stopImmediatePropagation();
            pendiente = accion;
            pendienteHasta = Date.now() + 5000;
            hablar(describir(accion) + '. ' + t('otraVez'));
            return;
        }
        hablar(describir(unidad(e.target)));
    }, true);

    let porTeclado = false;
    document.addEventListener('keydown', (e) => {
        porTeclado = true;
        if (e.key === 'Escape' && estado.activo) detener();
    }, true);
    document.addEventListener('pointerdown', () => { porTeclado = false; }, true);

    // Al moverse con Tab se lee el elemento enfocado (no cuando el foco viene de un clic: ya lo lee el clic)
    document.addEventListener('focusin', (e) => {
        if (!estado.activo || !estado.foco || !porTeclado) return;
        if (!(e.target instanceof Element) || e.target === document.body) return;
        hablar(describir(e.target));
    });

    window.addEventListener('pagehide', detener);

    /* ── Interfaz: enlaces para saltar, botón y menú ── */
    function crearInterfaz() {
        const main = document.querySelector('main');
        if (main) { if (!main.id) main.id = 'contenido-principal'; main.tabIndex = -1; }

        const saltar = document.createElement('div');
        saltar.className = 'voz-saltar';
        saltar.innerHTML =
            (main ? `<a href="#${esc(main.id)}" id="voz-saltar-contenido">Saltar al contenido</a>` : '') +
            '<a href="#voz-boton" id="voz-saltar-menu">Menú de asistencia por voz</a>';
        document.body.insertBefore(saltar, document.body.firstChild);
        saltar.addEventListener('click', (e) => {
            const enlace = e.target.closest('a');
            if (!enlace) return;
            e.preventDefault();
            const destino = enlace.id === 'voz-saltar-menu' ? document.getElementById('voz-boton') : main;
            if (destino) destino.focus();
        });

        const boton = document.createElement('button');
        boton.type = 'button';
        boton.id = 'voz-boton';
        boton.className = 'voz-boton';
        boton.setAttribute('aria-haspopup', 'dialog');
        boton.setAttribute('aria-expanded', 'false');
        boton.setAttribute('aria-controls', 'voz-panel');
        boton.innerHTML = '<svg class="voz-icono" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';

        const barra = document.querySelector('header.top .top-inner');
        if (barra) {
            const tema = document.getElementById('theme-toggle');
            const salir = document.getElementById('logoutBtn');
            if (tema && tema.parentElement === barra) barra.insertBefore(boton, tema);
            else if (salir && salir.parentElement === barra) barra.insertBefore(boton, salir);
            else barra.appendChild(boton);
        } else {
            boton.classList.add('voz-flotante');      // páginas sin encabezado: login, registro…
            document.body.appendChild(boton);
        }

        const panel = document.createElement('div');
        panel.id = 'voz-panel';
        panel.className = 'voz-panel' + (barra ? '' : ' voz-panel-flotante');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Asistencia por voz');
        panel.hidden = true;
        panel.innerHTML = `
            <div class="voz-cab">
                <strong>Asistencia por voz</strong>
                <button type="button" class="voz-cerrar" id="voz-cerrar" aria-label="Cerrar el menú de voz"><span aria-hidden="true">✕</span></button>
            </div>
            <label class="voz-fila voz-interruptor">
                <input type="checkbox" id="voz-activo" role="switch">
                <span>Activar lectura en voz alta</span>
            </label>
            <fieldset class="voz-grupo">
                <legend>Qué se lee</legend>
                <label class="voz-fila"><input type="checkbox" id="voz-clic"><span>Lo que toco o hago clic</span></label>
                <label class="voz-fila"><input type="checkbox" id="voz-foco"><span>Lo que enfoco con el teclado (Tab)</span></label>
            </fieldset>
            <div class="voz-fila voz-campo">
                <label for="voz-velocidad">Velocidad: <output id="voz-velocidad-valor"></output></label>
                <input type="range" id="voz-velocidad" min="0.6" max="1.6" step="0.1">
            </div>
            <div class="voz-fila voz-campo">
                <label for="voz-voz">Voz (español e inglés)</label>
                <select id="voz-voz" translate="no"></select>
            </div>
            <div class="voz-acciones">
                <button type="button" class="voz-btn voz-btn-primario" id="voz-leer">Leer esta pantalla</button>
                <button type="button" class="voz-btn" id="voz-parar">Detener</button>
            </div>
            <p class="voz-nota" id="voz-nota-voz" hidden></p>
            <p class="voz-nota">Con la lectura activa, los botones y enlaces se leen con un clic y se activan con un segundo clic. <b>Esc</b> detiene la voz.</p>
            <p class="voz-nota voz-aviso">Si ya usas un lector de pantalla (NVDA, JAWS, VoiceOver o TalkBack), no actives esta lectura: la voz se duplicaría.</p>`;
        document.body.appendChild(panel);

        const $ = (id) => document.getElementById(id);
        const activo = $('voz-activo'), clic = $('voz-clic'), foco = $('voz-foco');
        const velocidad = $('voz-velocidad'), velocidadValor = $('voz-velocidad-valor');
        const selector = $('voz-voz'), nota = $('voz-nota-voz');

        function pintarEstado() {
            activo.checked = estado.activo;
            clic.checked = estado.clic;
            foco.checked = estado.foco;
            velocidad.value = estado.velocidad;
            velocidadValor.textContent = estado.velocidad.toFixed(1) + '×';
            boton.classList.toggle('voz-activa', estado.activo);
            const etiqueta = 'Asistencia por voz, ' + (estado.activo ? 'activada' : 'desactivada');
            boton.setAttribute('aria-label', etiqueta);
            boton.title = etiqueta;
            clic.disabled = foco.disabled = !estado.activo;
        }

        function avisoDeVoces() {
            const avisos = [];
            const elegida = vozElegida();
            if (!SOPORTADO) {
                avisos.push('Este navegador no permite la lectura en voz alta. Prueba con Chrome, Edge, Safari o Firefox actualizados.');
            } else {
                if (!vocesEs.length && vocesListas) avisos.push('No encontré una voz en español en este dispositivo. Instálala en los ajustes de idioma y voz del sistema.');
                if (!vocesEn.length && vocesListas) avisos.push('No hay voces en inglés instaladas en este dispositivo.');
                if (elegida && !elegida.localService) avisos.push('Esta voz funciona en línea: el navegador puede enviar el texto que se lee a un servidor externo. Elige una voz sin «en línea» si prefieres evitarlo.');
                if (elegida && normIdioma(elegida.lang).startsWith('en') && !paginaEnIngles()) {
                    avisos.push('Con una voz en inglés, los avisos del asistente se dicen en inglés, pero el texto de la página sigue en español y se pronuncia con acento inglés. Para que todo suene en inglés, traduce la página con la opción Traducir de tu navegador.');
                }
            }
            nota.textContent = avisos.join(' ');
            nota.hidden = !avisos.length;
        }

        alCambiarVoces = function () {
            const elegida = vozElegida();
            const opcion = (v) => `<option value="${esc(v.name)}">${esc(v.name.replace(/^Microsoft\s+/, ''))} (${esc(v.lang)})${v.localService ? '' : ' · en línea'}</option>`;
            selector.innerHTML =
                (vocesEs.length ? `<optgroup label="Español">${vocesEs.map(opcion).join('')}</optgroup>` : '') +
                (vocesEn.length ? `<optgroup label="English">${vocesEn.map(opcion).join('')}</optgroup>` : '');
            if (elegida) selector.value = elegida.name;
            selector.disabled = !(vocesEs.length + vocesEn.length);
            avisoDeVoces();
        };

        if (!SOPORTADO) {
            [activo, clic, foco, velocidad, selector, $('voz-leer'), $('voz-parar')].forEach(c => { c.disabled = true; });
        }
        pintarEstado();
        alCambiarVoces();

        activo.addEventListener('change', () => {
            estado.activo = activo.checked;
            guardarEstado();
            pintarEstado();
            hablar(t(estado.activo ? 'activada' : 'desactivada'));
        });
        clic.addEventListener('change', () => { estado.clic = clic.checked; guardarEstado(); });
        foco.addEventListener('change', () => { estado.foco = foco.checked; guardarEstado(); });
        velocidad.addEventListener('input', () => {
            estado.velocidad = Number(velocidad.value);
            velocidadValor.textContent = estado.velocidad.toFixed(1) + '×';
        });
        velocidad.addEventListener('change', () => { guardarEstado(); hablar(t('velocidad')); });
        selector.addEventListener('change', () => {
            estado.voz = selector.value;
            estado.vozEs = '';           // eligió a mano: ya no se vuelve sola a la anterior
            guardarEstado();
            avisoDeVoces();
            hablar(t('voz'));            // ya en el idioma de la voz recién elegida
        });
        $('voz-leer').addEventListener('click', leerPantalla);
        $('voz-parar').addEventListener('click', detener);

        const abrir = () => { panel.hidden = false; boton.setAttribute('aria-expanded', 'true'); activo.focus(); };
        const cerrar = (devolverFoco = true) => {
            panel.hidden = true;
            boton.setAttribute('aria-expanded', 'false');
            if (devolverFoco) boton.focus();
        };
        boton.addEventListener('click', () => (panel.hidden ? abrir() : cerrar()));
        $('voz-cerrar').addEventListener('click', () => cerrar());
        document.addEventListener('click', (e) => {
            if (!panel.hidden && !panel.contains(e.target) && !boton.contains(e.target)) cerrar(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !panel.hidden) cerrar();
            if (e.altKey && e.shiftKey && e.code === 'KeyV') { e.preventDefault(); panel.hidden ? abrir() : cerrar(); }
        });
        window.addEventListener('storage', (e) => {      // el estado cambió en otra pestaña
            if (e.key !== CLAVE) return;
            Object.assign(estado, leerEstado());
            pintarEstado();
            alCambiarVoces();
        });

        // Los avisos de la aplicación (toast): se anuncian a los lectores de pantalla y, con la voz activa, también se leen
        const toast = document.getElementById('toast');
        if (toast) {
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            let ultimo = '';
            new MutationObserver(() => {
                if (!toast.classList.contains('show')) { ultimo = ''; return; }
                const texto = (toast.textContent || '').trim();
                if (estado.activo && texto && texto !== ultimo) { ultimo = texto; hablar(texto); }
            }).observe(toast, { attributes: true, attributeFilter: ['class'], childList: true, characterData: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crearInterfaz);
    else crearInterfaz();
})();