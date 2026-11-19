/* ============================================
   CONTROL POR VOZ (opcional)
   - Dictado: un botón de micrófono junto a los campos de búsqueda.
   - Comandos: ir a, pulsar, buscar, filtrar por, siguiente, subir, bajar, cerrar, leer pantalla…
   - Filtros: listas desplegables, botones de filtro, casillas y fechas, por el nombre que se ve en pantalla.
   - Acciones delicadas (eliminar, cerrar sesión, postularse…) piden confirmación con "sí" o "no".
   Usa SpeechRecognition del navegador: funciona en Chrome y Edge (computador y Android), exige HTTPS y permiso
   de micrófono. En Chrome el audio se envía a un servicio de Google para transcribirlo.
   Se apoya en voz.js (menú, lectura de pantalla, voz elegida). Va DESPUÉS de voz.js en el <head>.
   Depuración: window.TalviaControlVoz.ejecutar('ir a mis vacantes') ejecuta un comando escrito.
============================================ */
(function () {
    'use strict';

    const CLAVE = 'talvia-control-voz';
    const CLAVE_VOZ = 'talvia-voz';                    // voz y velocidad que eligió la persona en el menú de voz
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SOPORTADO = !!SR && window.isSecureContext !== false;
    const IDIOMA = 'es-CO';

    /* ── Preferencias ── */
    function leerJSON(clave) {
        try { return JSON.parse(localStorage.getItem(clave)) || {}; } catch (e) { return {}; }
    }
    const config = Object.assign({ activo: true, responder: true }, leerJSON(CLAVE));
    function guardarConfig() {
        try { localStorage.setItem(CLAVE, JSON.stringify(config)); } catch (e) { /* modo privado */ }
    }

    /* ── Utilidades de texto ── */
    // Minúsculas, sin tildes ni signos: "Tecnología & IT" pasa a "tecnologia it"
    const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const sing = (w) => w.replace(/s$/, '');
    const NUMEROS = { cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
        once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20 };
    const ORDINALES = { primero: 1, primera: 1, segundo: 2, segunda: 2, tercero: 3, tercera: 3, cuarto: 4, cuarta: 4, quinto: 5, quinta: 5 };
    const aNumero = (w) => (/^\d+$/.test(w) ? parseInt(w, 10) : (w in NUMEROS ? NUMEROS[w] : (w in ORDINALES ? ORDINALES[w] : null)));
    const MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, setiembre: 9,
        octubre: 10, noviembre: 11, diciembre: 12 };

    /* ── Qué elementos existen y cómo se llaman ── */
    const propio = (el) => !!el.closest('#voz-panel, #voz-boton, .voz-saltar, #vc-flotante, #vc-burbuja, .vc-mic-campo');

    function esVisible(el) {
        if (!el || el.closest('[hidden], [aria-hidden="true"]')) return false;
        if (window.__vcSinLayout) return getComputedStyle(el).display !== 'none';        // solo para pruebas sin pantalla
        if (!el.getClientRects().length) return false;
        const cs = getComputedStyle(el);
        return cs.visibility !== 'hidden' && cs.display !== 'none';
    }

    function nombreDe(el) {
        let t = el.getAttribute('aria-label') || '';
        if (!t) {
            if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type)) t = el.value;
            else t = el.innerText || el.textContent || '';
        }
        if (!t) t = el.getAttribute('title') || '';
        if (!t) { const img = el.querySelector && el.querySelector('img[alt]'); t = img ? img.alt : ''; }
        return t.replace(/[\p{Extended_Pictographic}\uFE0F\u200D▾▸›‹«»✕]/gu, ' ').replace(/\s+/g, ' ').trim();
    }

    const SEL_CLIC = 'a[href], button, [role="button"], [role="tab"], [role="link"], summary, input[type="button"], input[type="submit"]';
    function clicables() {
        return [...document.querySelectorAll(SEL_CLIC)]
            .filter(el => !el.disabled && !propio(el) && esVisible(el) && nombreDe(el));
    }

    function contexto(el) {
        const fila = el.closest('tr, article, li, .ic-fila, .job-card, .mv-fila');
        return fila ? (fila.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 45) : '';
    }

    // Cuánto se parece un nombre a lo que se dijo (0 = nada, 100 = igual)
    function puntuar(nombre, consulta) {
        const n = norm(nombre), q = norm(consulta);
        if (!n || !q) return 0;
        if (n === q) return 100;
        if (n.startsWith(q)) return 80;
        if ((' ' + n + ' ').includes(' ' + q + ' ')) return 60;
        const pn = n.split(' ').map(sing), pq = q.split(' ').map(sing);
        if (pq.every(p => pn.some(w => w === p || w.startsWith(p)))) return 45;
        return 0;
    }

    function mismoDestino(a, b) {
        if (a === b) return true;
        return a.tagName === 'A' && b.tagName === 'A' && a.getAttribute('href') === b.getAttribute('href') &&
            norm(nombreDe(a)) === norm(nombreDe(b));            // el mismo enlace repetido (por ejemplo, barra y menú lateral)
    }

    // Elige el mejor elemento. Si hay empate real, devuelve las opciones para que la persona decida.
    function elegir(lista, consulta, minimo = 45) {
        const puntuados = lista.map(el => ({ el, p: puntuar(nombreDe(el), consulta) })).filter(o => o.p >= minimo).sort((a, b) => b.p - a.p);
        if (!puntuados.length) return { tipo: 'ninguno' };
        const mejor = puntuados[0];
        const empatados = [];
        for (const o of puntuados) {
            if (o.p !== mejor.p) break;
            if (!empatados.some(e => mismoDestino(e.el, o.el))) empatados.push(o);
        }
        if (empatados.length === 1) return { tipo: 'unico', el: mejor.el };
        return { tipo: 'ambiguo', opciones: empatados.slice(0, 5).map(o => o.el) };
    }

    const RIESGO = /(elimin|borr|cerrar sesion|salir|rechaz|\bpostular(me|se)?\b|publicar|enviar|desactiv|pausar|cerrar vacante)/;
    function esRiesgoso(el) {
        const n = norm(nombreDe(el));
        return RIESGO.test(n) || (n === 'cerrar' && !!el.closest('tr, .mv-acciones, article'));
    }

    /* ── Salida: lo que se ve y lo que se dice ── */
    let burbuja = null;
    let temporizadorBurbuja = null;
    let ultimoMensaje = '';
    function mostrar(texto, ms = 4500) {
        if (!burbuja) return;
        burbuja.textContent = texto;
        burbuja.classList.add('vc-visible');
        clearTimeout(temporizadorBurbuja);
        if (ms) temporizadorBurbuja = setTimeout(() => burbuja.classList.remove('vc-visible'), ms);
    }

    function decir(texto) {
        ultimoMensaje = texto;
        return new Promise((resolve) => {
            if (!config.responder || !('speechSynthesis' in window)) return resolve();
            try {
                speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(String(texto).replace(/\s+/g, ' '));
                const pref = leerJSON(CLAVE_VOZ);
                const voces = speechSynthesis.getVoices();
                const v = (pref.voz && voces.find(x => x.name === pref.voz)) || voces.find(x => (x.lang || '').toLowerCase().startsWith('es'));
                u.lang = v ? v.lang : IDIOMA;
                if (v) u.voice = v;
                u.rate = pref.velocidad || 1;
                u.onend = u.onerror = () => resolve();
                speechSynthesis.speak(u);
            } catch (e) { resolve(); }
        });
    }

    async function responder(texto) {
        mostrar(texto);
        await decir(texto);
    }

    let ac = null;
    function bip(frecuencia = 880, ms = 110) {
        try {
            ac = ac || new (window.AudioContext || window.webkitAudioContext)();
            const o = ac.createOscillator(), g = ac.createGain();
            o.frequency.value = frecuencia; g.gain.value = 0.08;
            o.connect(g); g.connect(ac.destination);
            o.start(); o.stop(ac.currentTime + ms / 1000);
        } catch (e) { /* sin audio */ }
    }

    /* ── Reconocimiento de voz ── */
    let reconocimiento = null;
    let ocupado = false;

    function escuchar({ alActualizar = null } = {}) {
        return new Promise((resolve, reject) => {
            if (!SOPORTADO) return reject(new Error('no-soportado'));
            const rec = new SR();
            reconocimiento = rec;
            rec.lang = IDIOMA;
            rec.continuous = false;
            rec.interimResults = !!alActualizar;
            rec.maxAlternatives = 3;
            let final = null;
            rec.onresult = (e) => {
                let interino = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    const r = e.results[i];
                    if (r.isFinal) final = { texto: r[0].transcript.trim(), alternativas: [...r].map(a => a.transcript.trim()) };
                    else interino += r[0].transcript;
                }
                if (alActualizar && !final) alActualizar(interino.trim());
            };
            rec.onerror = (e) => { reconocimiento = null; reject(new Error(e.error || 'error')); };
            rec.onend = () => { reconocimiento = null; resolve(final); };
            try { rec.start(); } catch (e) { reconocimiento = null; reject(e); }
        });
    }

    function cancelarEscucha() {
        if (reconocimiento) { try { reconocimiento.abort(); } catch (e) { /* ya terminó */ } }
    }

    const ERRORES = {
        'not-allowed': 'El navegador no tiene permiso para usar el micrófono. Actívalo en el candado de la barra de direcciones.',
        'service-not-allowed': 'El navegador no permite el reconocimiento de voz en esta página.',
        'audio-capture': 'No encuentro un micrófono conectado.',
        'no-speech': 'No te escuché. Inténtalo de nuevo.',
        'network': 'No hay conexión con el servicio de voz.',
        'no-soportado': 'Este navegador no permite el reconocimiento de voz. Usa Chrome o Edge.'
    };
    const mensajeError = (e) => ERRORES[e && e.message] || 'No pude escucharte. Inténtalo de nuevo.';

    async function confirmar(pregunta) {
        if (typeof window.__vcRespuestaConfirmacion === 'function') return window.__vcRespuestaConfirmacion(pregunta);   // pruebas
        await responder(pregunta + ' Di sí o no.');
        bip(660);
        let r = null;
        try { r = await escuchar(); } catch (e) { return false; }
        return /^(si|confirmo|claro|dale|correcto|de acuerdo|adelante|hazlo|ok)\b/.test(norm(r && r.texto));
    }

    /* ── Acciones sobre la página ── */
    function activar(el) {
        window.__vcClic = true;                          // voz.js lo respeta: no intercepta este clic
        try {
            if (el.scrollIntoView) el.scrollIntoView({ block: 'center' });
            el.click();
        } finally { window.__vcClic = false; }
    }

    async function pulsar(el) {
        const nombre = nombreDe(el);
        if (esRiesgoso(el)) {
            const ok = await confirmar(`¿Confirmas pulsar ${nombre}?`);
            if (!ok) return responder('Cancelado.');
        }
        activar(el);
        return responder(`Listo: ${nombre}.`);
    }

    let ultimasOpciones = [];
    async function ofrecer(opciones, intro) {
        ultimasOpciones = opciones;
        const frases = opciones.map((el, i) => {
            const c = contexto(el);
            return `${i + 1}, ${nombreDe(el)}${c ? ', ' + c : ''}`;
        });
        return responder(`${intro} ${frases.join('. ')}. Di el número.`);
    }

    function escribirEn(input, texto) {
        input.value = texto;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        // Algunas pantallas buscan solo con un botón "Buscar" junto al campo
        const zona = input.form || (input.parentElement && input.parentElement.parentElement) || document;
        const boton = [...zona.querySelectorAll(SEL_CLIC)].find(b => !propio(b) && esVisible(b) && /^buscar/.test(norm(nombreDe(b))));
        if (boton) activar(boton);
    }

    /* ── Campos de búsqueda ── */
    const RE_BUSCADOR = /busc|search|ubicaci|ciudad|location|filtr/;
    function esBuscador(i) {
        if (i.tagName !== 'INPUT') return false;
        const tipo = (i.type || 'text').toLowerCase();
        if (tipo !== 'text' && tipo !== 'search') return false;
        if (i.dataset.vcIgnorar !== undefined || i.closest('#voz-panel')) return false;
        if (i.dataset.vozDictar !== undefined) return true;
        return RE_BUSCADOR.test(norm([i.id, i.name, i.placeholder, i.getAttribute('aria-label'), i.className].join(' ')));
    }
    const esUbicacion = (i) => /ubicaci|ciudad|location/.test(norm([i.id, i.name, i.placeholder, i.getAttribute('aria-label')].join(' ')));
    const campos = () => [...document.querySelectorAll('input')].filter(i => esBuscador(i) && !propio(i) && esVisible(i));
    const campoBusqueda = () => campos().find(i => !esUbicacion(i));
    const campoUbicacion = () => campos().find(esUbicacion);

    /* ── Listas desplegables, casillas y fechas ── */
    const listas = () => [...document.querySelectorAll('select')].filter(s => !propio(s) && !s.disabled && esVisible(s));
    function etiquetaDe(el) {
        const partes = [el.getAttribute('aria-label') || ''];
        if (el.labels) [...el.labels].forEach(l => partes.push(l.textContent));
        const grupo = el.closest('.admin-filter-group, .mv-filtro, .field-group, .ic-campo, label, div');
        const lab = grupo && grupo.querySelector('label, .admin-filter-label');
        if (lab) partes.push(lab.textContent);
        partes.push((el.id || '').replace(/^(f|mv|rk)-/, ''), el.name || '');
        return norm(partes.join(' '));
    }

    function buscarEnListas(q) {
        const palabras = q.split(' ');
        const candidatos = [];
        for (const sel of listas()) {
            const etiqueta = etiquetaDe(sel);
            const opciones = [...sel.options].filter(o => !o.disabled && o.text.trim());
            for (let k = 1; k < palabras.length && k <= 3; k++) {         // "área tecnología": el campo va primero
                const cabeza = palabras.slice(0, k).join(' ');
                const resto = palabras.slice(k).join(' ').replace(/^(por|a|en|de|el|la) /, '');
                if (!resto || !etiqueta.includes(cabeza)) continue;
                opciones.forEach(o => { const p = puntuar(o.text, resto); if (p) candidatos.push({ sel, o, p: p + 20 + k }); });
            }
            opciones.forEach(o => { const p = puntuar(o.text, q); if (p) candidatos.push({ sel, o, p }); });   // solo el valor
        }
        candidatos.sort((a, b) => b.p - a.p);
        if (!candidatos.length) return null;
        const mejor = candidatos[0];
        const iguales = candidatos.filter(c => c.p === mejor.p && !(c.sel === mejor.sel && norm(c.o.text) === norm(mejor.o.text)));
        return iguales.length ? { ambiguo: [mejor, ...iguales].slice(0, 4) } : mejor;
    }

    function aplicarLista(sel, opcion) {
        sel.value = opcion.value;
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const casillas = () => [...document.querySelectorAll('input[type="checkbox"]')].filter(c => !propio(c) && !c.disabled && esVisible(c));
    const nombreCasilla = (c) => ((c.labels && c.labels[0] ? c.labels[0].textContent : '') || (c.closest('label') ? c.closest('label').textContent : '') || c.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();

    function parseFecha(texto) {
        const t = norm(texto);
        const hoy = new Date();
        const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (t === 'hoy') return iso(hoy);
        if (t === 'ayer') { const d = new Date(hoy); d.setDate(d.getDate() - 1); return iso(d); }
        const m = t.match(/^(?:el )?(\d{1,2}|[a-z]+) de ([a-z]+)(?: de (\d{4}))?$/);
        if (!m) return null;
        const dia = aNumero(m[1]), mes = MESES[m[2]], anio = m[3] ? parseInt(m[3], 10) : hoy.getFullYear();
        if (!dia || !mes || dia > 31) return null;
        return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }

    /* ── Comandos ── */
    const AYUDA_VOZ = [
        'Puedes decir: ir a, seguido del nombre de un enlace o botón. Por ejemplo, ir a mis vacantes.',
        'Para buscar di: buscar, y lo que quieres encontrar. Por ejemplo, buscar analista en Cartagena.',
        'Para filtrar di: filtrar por, y el valor. Por ejemplo, filtrar por remoto. O: ordenar por más recientes.',
        'Para moverte di: siguiente, anterior, página tres, subir, bajar, volver, cerrar o abrir menú.',
        'Para escuchar di: leer pantalla, qué opciones hay, dónde estoy, repetir o detener.',
        'Las acciones delicadas, como eliminar o cerrar sesión, piden que confirmes con sí o no.'
    ];

    async function cmdAyuda() {
        mostrar('Comandos: ir a, pulsar, buscar, filtrar por, siguiente, subir, bajar, cerrar, leer pantalla…', 8000);
        for (const f of AYUDA_VOZ) await decir(f);
    }

    async function cmdOpciones() {
        const zona = [...document.querySelectorAll('main, .top-nav')];
        const dentro = (el) => !zona.length || zona.some(z => z.contains(el));
        const vistos = [];
        for (const el of clicables().filter(dentro)) if (!vistos.some(v => mismoDestino(v, el))) vistos.push(el);
        if (!vistos.length) return responder('No veo opciones en esta pantalla.');
        const lista = vistos.slice(0, 12);
        ultimasOpciones = lista;
        await responder(`Veo ${vistos.length} opciones. ` + lista.map((el, i) => `${i + 1}, ${nombreDe(el)}`).join('. ') + '. Di opción y el número.');
    }

    async function cmdEleccion(n) {
        const el = ultimasOpciones[n - 1];
        if (!el || !el.isConnected) return responder('No tengo esa opción. Di qué opciones hay.');
        return pulsar(el);
    }

    async function cmdPulsar(consulta) {
        const r = elegir(clicables(), consulta);
        if (r.tipo === 'unico') return pulsar(r.el);
        if (r.tipo === 'ambiguo') return ofrecer(r.opciones, `Hay ${r.opciones.length} coincidencias con ${consulta}.`);
        return responder(`No encuentro ${consulta} en esta pantalla.`);
    }

    async function cmdBuscar(texto) {
        let q = texto, lugar = '';
        const m = texto.match(/^(.+)\s+en\s+(.+)$/i);                       // "analista en Cartagena"
        if (m && campoUbicacion()) { q = m[1]; lugar = m[2]; }
        const campo = campoBusqueda();
        if (!campo) return responder('No hay un campo de búsqueda en esta pantalla.');
        escribirEn(campo, q);
        if (lugar) escribirEn(campoUbicacion(), lugar);
        return responder(lugar ? `Buscando ${q} en ${lugar}.` : `Buscando ${q}.`);
    }

    async function cmdLimpiar() {
        campos().forEach(i => { if (i.value) escribirEn(i, ''); });
        const boton = clicables().find(b => /^limpiar (los )?filtros/.test(norm(nombreDe(b))));
        if (boton) activar(boton);
        return responder('Búsqueda y filtros limpiados.');
    }

    async function cmdFiltrar(q) {
        const sel = buscarEnListas(q);
        if (sel && sel.ambiguo) {
            return responder('Hay varias coincidencias: ' + sel.ambiguo.map(c => `${etiquetaDe(c.sel).split(' ')[0] || 'lista'} ${c.o.text}`).join(', ') + '. Di el nombre del campo y el valor.');
        }
        if (sel && sel.p >= 60) {
            aplicarLista(sel.sel, sel.o);
            return responder(`${sel.o.text.trim()}.`);
        }
        const casilla = casillas().find(c => puntuar(nombreCasilla(c), q) >= 45);
        if (casilla) { if (!casilla.checked) activar(casilla); return responder(`${nombreCasilla(casilla)}: marcado.`); }
        const r = elegir(clicables(), q, 60);
        if (r.tipo === 'unico') return pulsar(r.el);
        if (r.tipo === 'ambiguo') return ofrecer(r.opciones, `Hay ${r.opciones.length} filtros con ese nombre.`);
        if (sel) { aplicarLista(sel.sel, sel.o); return responder(`${sel.o.text.trim()}.`); }
        return responder(`No encuentro un filtro llamado ${q}.`);
    }

    async function cmdCasilla(q, marcar) {
        const c = casillas().find(x => puntuar(nombreCasilla(x), q) >= 45);
        if (!c) return responder(`No encuentro la casilla ${q}.`);
        if (c.checked !== marcar) activar(c);
        return responder(`${nombreCasilla(c)}: ${marcar ? 'marcado' : 'desmarcado'}.`);
    }

    async function cmdFecha(cual, texto) {
        const iso = parseFecha(texto);
        if (!iso) return responder('No entendí la fecha. Di, por ejemplo, desde 15 de octubre.');
        const campo = [...document.querySelectorAll('input[type="date"]')].find(i => !propio(i) && esVisible(i) && etiquetaDe(i).includes(cual));
        if (!campo) return responder(`No hay un campo de fecha ${cual} en esta pantalla.`);
        campo.value = iso;
        campo.dispatchEvent(new Event('input', { bubbles: true }));
        campo.dispatchEvent(new Event('change', { bubbles: true }));
        return responder(`Fecha ${cual} puesta en ${iso}.`);
    }

    function cmdPagina(tipo, n) {
        const botones = clicables().filter(b => /page btn|page num|ic pg|pagina/.test(norm((b.className || '') + ' ' + (b.getAttribute('aria-label') || ''))));
        let el;
        if (tipo === 'numero') el = botones.find(b => norm(nombreDe(b)) === String(n));
        else el = botones.find(b => norm(nombreDe(b)).includes(tipo === 'siguiente' ? 'siguiente' : 'anterior'));
        if (!el) el = clicables().find(b => norm(nombreDe(b)).includes(tipo === 'siguiente' ? 'siguiente' : tipo === 'anterior' ? 'anterior' : '___'));
        if (!el) return responder(tipo === 'numero' ? `No veo la página ${n}.` : `No hay página ${tipo} en esta pantalla.`);
        activar(el);
        return responder(tipo === 'numero' ? `Página ${n}.` : `Página ${tipo}.`);
    }

    async function cmdCerrarSesion() {
        const boton = document.getElementById('logoutBtn') || document.querySelector('.nav-logout');
        if (!boton) return responder('No hay una sesión que cerrar aquí.');
        if (!(await confirmar('¿Confirmas cerrar la sesión?'))) return responder('Cancelado.');
        activar(boton);
    }

    function cmdTema(oscuro) {
        const boton = document.getElementById('theme-toggle');
        if (!boton) return responder('No encuentro el botón del modo oscuro.');
        const esOscuro = document.documentElement.dataset.theme === 'dark';
        if (esOscuro !== oscuro) activar(boton);
        return responder(oscuro ? 'Modo oscuro.' : 'Modo claro.');
    }

    function cmdCerrarVentana() {
        const menu = document.querySelector('.top-nav.nav-open');
        if (menu) { const fondo = document.getElementById('nav-backdrop'); if (fondo) activar(fondo); return responder('Menú cerrado.'); }
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return responder('Cerrado.');
    }

    function cmdMenu() {
        const boton = document.getElementById('mobile-menu-btn');
        if (!boton || !esVisible(boton)) return responder('En esta pantalla el menú ya está a la vista. Di ir a, y el nombre de la opción.');
        const nav = document.querySelector('.top-nav');
        if (!nav || !nav.classList.contains('nav-open')) activar(boton);
        return responder('Menú abierto. Di qué opciones hay.');
    }

    // Convierte lo dicho en una acción, o devuelve null si no lo reconoce
    function interpretar(crudo) {
        const limpio = crudo.replace(/^\s*(por favor|oye|asistente|talvia)[,\s]+/i, '').replace(/[,\s]+por favor\s*$/i, '').trim();
        const t = norm(limpio);
        const carga = (n) => limpio.split(/\s+/).slice(n).join(' ').replace(/[.,;:!?]+$/, '');
        let m;

        if (/^(ayuda|que puedo decir|comandos|lista de comandos)$/.test(t)) return cmdAyuda;
        if (/^(detener|detente|para|parar|silencio|callate|calla|basta|cancelar)$/.test(t)) {
            return async () => { const b = document.getElementById('voz-parar'); if (b) activar(b); if ('speechSynthesis' in window) speechSynthesis.cancel(); mostrar('Detenido.', 1500); };
        }
        if (/^(lee|leer|leeme|lectura)\b.*\b(pantalla|pagina)\b/.test(t)) {
            return async () => { const b = document.getElementById('voz-leer'); if (!b) return responder('No encuentro el lector de pantalla.'); activar(b); mostrar('Leyendo la pantalla.'); };
        }
        if (/^(repite|repetir|otra vez|que dijiste)$/.test(t)) return async () => (ultimoMensaje ? responder(ultimoMensaje) : responder('No hay nada que repetir.'));
        if (/^(donde estoy|que pagina es esta|en que pagina estoy)$/.test(t)) {
            return async () => { const h = document.querySelector('main h1, main h2, h1'); return responder(`Estás en ${document.title}${h ? '. ' + nombreDe(h) : ''}.`); };
        }
        if (/^(que opciones hay|opciones|que puedo hacer|que hay aqui|listar opciones|listar botones)$/.test(t)) return cmdOpciones;
        if ((m = t.match(/^(?:opcion|numero|la opcion|el numero)\s+(\w+)$/)) && aNumero(m[1])) return () => cmdEleccion(aNumero(m[1]));
        if ((m = t.match(/^(primero|primera|segundo|segunda|tercero|tercera|cuarto|cuarta|quinto|quinta)$/))) return () => cmdEleccion(ORDINALES[m[1]]);

        if (/^(baja|bajar|abajo|desplaza abajo|mas abajo)$/.test(t)) return async () => { window.scrollBy({ top: Math.round(window.innerHeight * 0.8), behavior: 'smooth' }); mostrar('Bajando.', 1200); };
        if (/^(sube|subir|arriba|desplaza arriba|mas arriba)$/.test(t)) return async () => { window.scrollBy({ top: -Math.round(window.innerHeight * 0.8), behavior: 'smooth' }); mostrar('Subiendo.', 1200); };
        if (/^(ir al inicio|ir arriba|principio|al principio)$/.test(t)) return async () => { window.scrollTo({ top: 0, behavior: 'smooth' }); mostrar('Al inicio.', 1200); };
        if (/^(ir al final|ir abajo|al final|final)$/.test(t)) return async () => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); mostrar('Al final.', 1200); };
        if (/^(volver|atras|regresar|volver atras)$/.test(t)) return async () => { await responder('Volviendo.'); history.back(); };
        if (/^(recargar|actualizar pagina|recarga)$/.test(t)) return async () => { await responder('Recargando.'); location.reload(); };

        if (/^(abrir|abre|mostrar|muestra)\s+(el\s+)?menu$/.test(t)) return async () => cmdMenu();
        if (/^(cerrar|cierra)(\s+(la|el))?(\s+(ventana|panel|ranking|modal|detalle|menu|esto))?$/.test(t)) return async () => cmdCerrarVentana();
        if ((m = t.match(/^(?:pagina|ir a la pagina|ve a la pagina)\s+(\w+)$/)) && aNumero(m[1])) return async () => cmdPagina('numero', aNumero(m[1]));
        if (/^(siguiente|pagina siguiente|adelante|siguiente pagina)$/.test(t)) return async () => cmdPagina('siguiente');
        if (/^(anterior|pagina anterior|pagina de atras|anterior pagina)$/.test(t)) return async () => cmdPagina('anterior');
        if (/^(modo|tema)\s+(oscuro|claro)$/.test(t) || /^(activar|poner|pon)\s+(el\s+)?modo\s+(oscuro|claro)$/.test(t)) return async () => cmdTema(/oscuro/.test(t));
        if (/^(cerrar sesion|salir|salir de la cuenta)$/.test(t)) return cmdCerrarSesion;

        if (/^(buscar|busca|busco|encuentra|encontrar)\s+\S/.test(t)) return () => cmdBuscar(carga(1));
        if (/^(ubicacion|ciudad|lugar)\s+\S/.test(t)) return async () => {
            const c = campoUbicacion();
            if (!c) return responder('No hay un campo de ubicación en esta pantalla.');
            const texto = carga(1);
            escribirEn(c, texto);
            return responder(`Ubicación: ${texto}.`);
        };
        if (/^(limpiar|borrar|quitar|reiniciar)\s+(la\s+|los\s+|las\s+)?(busqueda|filtros|todo)$/.test(t)) return cmdLimpiar;
        if (/^(escribir|escribe|digita|dicta)\s+\S/.test(t)) return async () => {
            const a = document.activeElement;
            if (!a || !/^(INPUT|TEXTAREA)$/.test(a.tagName) || propio(a)) return responder('Primero elige un campo de texto.');
            const texto = carga(1);
            a.value = a.value ? `${a.value} ${texto}` : texto;
            a.dispatchEvent(new Event('input', { bubbles: true }));
            a.dispatchEvent(new Event('change', { bubbles: true }));
            return responder(`Escrito: ${texto}.`);
        };
        if (/^(borrar|vaciar)\s+(el\s+)?campo$/.test(t)) return async () => {
            const a = document.activeElement;
            if (!a || !/^(INPUT|TEXTAREA)$/.test(a.tagName)) return responder('Primero elige un campo de texto.');
            a.value = '';
            a.dispatchEvent(new Event('input', { bubbles: true }));
            return responder('Campo vacío.');
        };

        if ((m = t.match(/^(?:fecha\s+|postulados\s+)?(desde|hasta)\s+(.+)$/)) && parseFecha(m[2])) return () => cmdFecha(m[1], m[2]);
        if ((m = t.match(/^(marcar|marca|activar|activa)\s+(?:solo\s+)?(.+)$/)) && casillas().some(c => puntuar(nombreCasilla(c), m[2]) >= 45)) return () => cmdCasilla(m[2], true);
        if ((m = t.match(/^(desmarcar|desmarca|desactivar|desactiva|quitar)\s+(?:solo\s+)?(.+)$/)) && casillas().some(c => puntuar(nombreCasilla(c), m[2]) >= 45)) return () => cmdCasilla(m[2], false);
        if ((m = t.match(/^(?:filtrar|filtra|filtro|mostrar solo|muestra solo|ver solo|solo)(?:\s+por)?\s+(.+)$/))) return () => cmdFiltrar(m[1]);
        if (/^(ordenar|ordena|orden)\b/.test(t)) return () => cmdFiltrar(t);

        if ((m = t.match(/^(?:ir a|ve a|vete a|llevame a|entrar a|entra a|abrir|abre|pulsar|pulsa|presionar|presiona|clic en|hacer clic en|click en|seleccionar|selecciona|elegir|elige|mostrar|muestra)\s+(?:la\s+|el\s+|las\s+|los\s+)?(.+)$/))) {
            return () => cmdPulsar(m[1]);
        }

        return null;
    }

    // Último recurso, sin verbo: puede ser una lista con su valor ("modalidad remoto") o el nombre de un botón ("mis vacantes")
    async function cmdLibre(t) {
        const sel = buscarEnListas(t);
        if (sel && !sel.ambiguo && sel.p >= 60) { aplicarLista(sel.sel, sel.o); return responder(`${sel.o.text.trim()}.`); }
        const r = elegir(clicables(), t, 80);
        if (r.tipo === 'unico') return pulsar(r.el);
        return responder('No entendí. Di ayuda para ver los comandos.');
    }

    // Prueba la transcripción principal y las alternativas hasta que una se entienda
    async function ejecutar(texto, alternativas = []) {
        const intentos = [texto, ...alternativas.filter(a => a && a !== texto)];
        for (const intento of intentos) {
            const accion = interpretar(intento);
            if (accion) { await accion(); return true; }
        }
        await cmdLibre(norm(texto));
        return false;
    }

    /* ── Turnos de escucha ── */
    function marcarEscuchando(activo) {
        document.querySelectorAll('.vc-mic-campo, #vc-flotante').forEach(b => b.classList.toggle('vc-escuchando', activo));
        const f = document.getElementById('vc-flotante');
        if (f) f.setAttribute('aria-pressed', String(activo));
    }

    async function turnoComandos() {
        if (ocupado) { cancelarEscucha(); return; }
        ocupado = true;
        marcarEscuchando(true);
        try {
            if ('speechSynthesis' in window) speechSynthesis.cancel();
            bip(880);
            mostrar('Escuchando…', 0);
            const r = await escuchar({ alActualizar: (t) => mostrar('“' + t + '”…', 0) });
            if (!r) { await responder('No te escuché.'); return; }
            mostrar('Entendí: “' + r.texto + '”', 3000);
            await ejecutar(r.texto, r.alternativas);
        } catch (e) {
            await responder(mensajeError(e));
        } finally {
            ocupado = false;
            marcarEscuchando(false);
        }
    }

    async function turnoDictado(input, boton) {
        if (ocupado) { cancelarEscucha(); return; }
        ocupado = true;
        boton.classList.add('vc-escuchando');
        const previo = input.value;
        try {
            if ('speechSynthesis' in window) speechSynthesis.cancel();
            bip(880);
            mostrar('Escuchando… habla ahora', 0);
            const r = await escuchar({ alActualizar: (t) => { input.value = t; } });
            if (!r) { input.value = previo; await responder('No te escuché.'); return; }
            escribirEn(input, r.texto.replace(/[.。]+$/, ''));
            await responder(`Escrito: ${r.texto}.`);
        } catch (e) {
            input.value = previo;
            await responder(mensajeError(e));
        } finally {
            ocupado = false;
            boton.classList.remove('vc-escuchando');
        }
    }

    /* ── Interfaz ── */
    const ICONO_MIC = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="22"/></svg>';

    function nombreCampo(input) {
        return (input.getAttribute('aria-label') || input.placeholder || (input.labels && input.labels[0] && input.labels[0].textContent) || 'búsqueda').replace(/[….]+$/, '').trim();
    }

    function montarMicrofonos() {
        if (!SOPORTADO) return;
        document.querySelectorAll('input').forEach(input => {
            if (!esBuscador(input) || input.dataset.vcMic) return;
            input.dataset.vcMic = '1';
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'vc-mic-campo';
            b.innerHTML = ICONO_MIC;
            b.title = 'Dictar por voz';
            b.setAttribute('aria-label', 'Dictar por voz en el campo: ' + nombreCampo(input));
            b.addEventListener('click', (e) => { e.preventDefault(); turnoDictado(input, b); });
            input.insertAdjacentElement('afterend', b);
        });
    }

    function aplicarActivo() {
        document.body.classList.toggle('vc-on', !!config.activo && SOPORTADO);
        const f = document.getElementById('vc-flotante');
        if (f) f.classList.toggle('vc-visible', !!config.activo && SOPORTADO);
    }

    function montarPanel() {
        const panel = document.getElementById('voz-panel');
        if (!panel || document.getElementById('vc-grupo')) return;
        const grupo = document.createElement('fieldset');
        grupo.className = 'voz-grupo';
        grupo.id = 'vc-grupo';
        grupo.innerHTML = `
            <legend>Micrófono: dictado y comandos</legend>
            <label class="voz-fila voz-interruptor"><input type="checkbox" id="vc-activo" role="switch"><span>Mostrar el micrófono (dictado y comandos)</span></label>
            <label class="voz-fila"><input type="checkbox" id="vc-responder"><span>Responder en voz alta</span></label>
            <p class="voz-nota" id="vc-nota"></p>
            <details class="vc-ayuda">
                <summary>Ver comandos</summary>
                <ul>
                    <li><b>Ir a / Pulsar</b> + nombre: «ir a mis vacantes», «pulsar publicar vacante»</li>
                    <li><b>Buscar</b> + texto: «buscar analista en Cartagena»</li>
                    <li><b>Filtrar por</b> + valor: «filtrar por remoto», «área tecnología», «ordenar por más recientes», «marcar solo sin revisar», «desde 15 de octubre»</li>
                    <li><b>Limpiar filtros</b></li>
                    <li><b>Moverse:</b> siguiente, anterior, página 3, subir, bajar, volver, cerrar, abrir menú</li>
                    <li><b>Escuchar:</b> leer pantalla, qué opciones hay, opción 2, dónde estoy, repetir, detener</li>
                    <li><b>Modo oscuro</b> / <b>modo claro</b> · <b>Cerrar sesión</b></li>
                </ul>
            </details>`;
        const acciones = panel.querySelector('.voz-acciones');
        if (acciones) acciones.before(grupo); else panel.appendChild(grupo);

        const activo = grupo.querySelector('#vc-activo'), responderCk = grupo.querySelector('#vc-responder'), nota = grupo.querySelector('#vc-nota');
        activo.checked = !!config.activo;
        responderCk.checked = !!config.responder;
        if (!SOPORTADO) {
            activo.disabled = true;
            nota.textContent = window.isSecureContext === false
                ? 'El micrófono exige una conexión segura (HTTPS).'
                : 'Este navegador no permite el reconocimiento de voz. Usa Chrome o Edge.';
        } else {
            nota.textContent = 'El micrófono de la esquina inferior izquierda (o Alt+Shift+M) recibe órdenes; el que está junto a cada buscador dicta. En Chrome, el audio se envía a un servicio de Google para transcribirlo.';
        }
        activo.addEventListener('change', async () => {
            config.activo = activo.checked;
            guardarConfig();
            aplicarActivo();
            if (config.activo) await responder('Micrófono visible. Pulsa el botón del micrófono o Alt más Shift más M, y di ayuda.');
            else { cancelarEscucha(); mostrar('Micrófono desactivado.', 2000); }
        });
        responderCk.addEventListener('change', () => { config.responder = responderCk.checked; guardarConfig(); });
    }

    function montarPanelCuandoExista() {
        if (document.getElementById('voz-panel')) { montarPanel(); return; }
        const obs = new MutationObserver(() => { if (document.getElementById('voz-panel')) { montarPanel(); obs.disconnect(); } });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 10000);
    }

    function montarBotonesGlobales() {
        burbuja = document.createElement('div');
        burbuja.id = 'vc-burbuja';
        burbuja.setAttribute('role', 'status');
        burbuja.setAttribute('aria-live', 'polite');
        document.body.appendChild(burbuja);

        const f = document.createElement('button');
        f.type = 'button';
        f.id = 'vc-flotante';
        f.innerHTML = ICONO_MIC.replace('width="18" height="18"', 'width="24" height="24"');
        f.setAttribute('aria-label', 'Hablar: dar una orden por voz. Atajo: Alt más Shift más M');
        f.title = 'Dar una orden por voz (Alt+Shift+M)';
        f.setAttribute('aria-pressed', 'false');
        f.addEventListener('click', turnoComandos);
        document.body.appendChild(f);

        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.shiftKey && e.code === 'KeyM' && config.activo && SOPORTADO) { e.preventDefault(); turnoComandos(); }
            else if (e.key === 'Escape' && ocupado) cancelarEscucha();
        });
    }

    function iniciar() {
        if (window.__vcIniciado) return;
        window.__vcIniciado = true;
        montarBotonesGlobales();
        montarPanelCuandoExista();
        montarMicrofonos();
        aplicarActivo();
        let espera = null;
        new MutationObserver(() => { clearTimeout(espera); espera = setTimeout(montarMicrofonos, 250); })
            .observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();

    window.TalviaControlVoz = { ejecutar, interpretar, norm, puntuar, parseFecha, soportado: SOPORTADO };
})();