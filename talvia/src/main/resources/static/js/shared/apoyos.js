/* ============================================
   PREFERENCIAS Y APOYOS DE TRABAJO (opcional)
   Catálogo y componente compartidos por:
   - registro (form.js)
   - perfil del trabajador (perfil.js)
   - modal del candidato en la empresa (dashboard-postulaciones.js)

   Los códigos son los mismos del enum ApoyoLaboral del backend.
   Para agregar, quitar o renombrar una opción: se cambia aquí y en ese enum.
============================================ */
window.Apoyos = (function () {

    const PREGUNTA = '¿Qué podemos hacer para que el proceso y el trabajo sean cómodos y accesibles para ti?';
    const AYUDA = 'Es opcional. Elige lo que te sirva; no necesitas explicar por qué. ' +
        'Las empresas a las que te postules verán lo que marques, para preparar el proceso y el puesto contigo.';
    const AUTORIZACION = 'Autorizo el tratamiento de esta información, que es sensible, y que se muestre a las ' +
        'empresas a las que me postule. Puedo cambiarla o borrarla cuando quiera desde mi perfil.';
    const MAX_NOTA = 500;

    const SALIDAS = [
        ['NINGUNO', 'No necesito ajustes por ahora'],
        ['DESPUES', 'Prefiero hablarlo más adelante']
    ];
    const CODIGOS_SALIDA = SALIDAS.map(s => s[0]);
    const CODIGOS_INTERPRETE = ['PROC_INTERPRETE_LSC', 'COM_LSC', 'COM_INTERPRETE'];

    const GRUPOS = [
        {
            id: 'proceso', titulo: 'Para la entrevista y las pruebas',
            pregunta: '¿Qué te ayudaría durante la selección?',
            opciones: [
                ['PROC_INTERPRETE_LSC', 'Intérprete de Lengua de Señas Colombiana (LSC)'],
                ['PROC_SUBTITULOS', 'Videollamada con subtítulos o transcripción'],
                ['PROC_ESCRITO', 'Preguntas por escrito (chat o correo)'],
                ['PROC_AGENDA', 'Recibir las preguntas o la agenda con anticipación'],
                ['PROC_TIEMPO', 'Tiempo adicional en las pruebas'],
                ['PROC_LUGAR', 'Un lugar accesible, si la entrevista es presencial']
            ]
        },
        {
            id: 'comunicacion', titulo: 'Comunicación',
            pregunta: '¿Cómo te gusta comunicarte?', ayuda: 'Elige todas las que te sirvan.',
            opciones: [
                ['COM_LSC', 'Me comunico en Lengua de Señas Colombiana (LSC)'],
                ['COM_INTERPRETE', 'Me ayuda tener un intérprete de LSC en reuniones'],
                ['COM_ESCRITA', 'Prefiero comunicación escrita (chat o correo) a las llamadas'],
                ['COM_SUBTITULOS', 'Subtítulos o transcripción en reuniones y videos'],
                ['COM_DE_FRENTE', 'Que me hablen de frente, con calma y buena luz'],
                ['COM_INSTRUCCIONES', 'Instrucciones por escrito y en lenguaje claro']
            ]
        },
        {
            id: 'espacio', titulo: 'El espacio de trabajo',
            pregunta: 'Si el trabajo es presencial, ¿qué te ayudaría del espacio?',
            ayuda: 'Solo aplica a trabajo presencial o híbrido.',
            opciones: [
                ['ESP_SIN_ESCALERAS', 'Accesos sin escaleras (rampa o ascensor)'],
                ['ESP_AMPLIO', 'Espacios amplios y sin obstáculos para desplazarme'],
                ['ESP_BANO', 'Baños accesibles'],
                ['ESP_PUESTO', 'Puesto de trabajo ajustable (escritorio, silla)'],
                ['ESP_DESCANSO', 'Poder sentarme o descansar con frecuencia'],
                ['ESP_PARQUEO', 'Parqueadero o acceso cercano']
            ]
        },
        {
            id: 'tecnologia', titulo: 'Pantalla y tecnología',
            pregunta: '¿Qué herramientas o configuraciones te ayudan a usar la pantalla?',
            opciones: [
                ['TEC_LECTOR', 'Lector de pantalla (NVDA, JAWS, VoiceOver u otro)'],
                ['TEC_CONTRASTE', 'Mayor contraste o modo oscuro'],
                ['TEC_TEXTO', 'Texto más grande o ampliación de pantalla'],
                ['TEC_DOCS', 'Documentos accesibles (texto seleccionable, no solo imágenes)'],
                ['TEC_TECLADO', 'Usar el teclado en lugar del mouse'],
                ['TEC_DICTADO', 'Dictado por voz u otras ayudas de escritura']
            ]
        },
        {
            id: 'organizacion', titulo: 'Cómo se organiza el trabajo',
            pregunta: '¿Qué hace que tu día a día funcione mejor?',
            opciones: [
                ['ORG_HORARIO', 'Horarios flexibles'],
                ['ORG_REMOTO', 'Trabajo remoto o híbrido'],
                ['ORG_PAUSAS', 'Pausas frecuentes'],
                ['ORG_TAREAS', 'Tareas y prioridades claras, de una en una'],
                ['ORG_AVISO', 'Aviso previo de cambios y reuniones con agenda'],
                ['ORG_TRANQUILO', 'Un ambiente tranquilo (poco ruido, luz suave)']
            ]
        }
    ];

    const ETIQUETAS = {};
    [...SALIDAS, ...GRUPOS.flatMap(g => g.opciones)].forEach(([codigo, texto]) => { ETIQUETAS[codigo] = texto; });

    const chip = (codigo, texto) =>
        `<label class="ap-chip"><input type="checkbox" value="${codigo}"><span>${texto}</span></label>`;

    /* ── Componente editable ──
       contenedor: elemento donde se dibuja. opciones.prefijo: evita ids repetidos si hay dos en la página. */
    function render(contenedor, opciones = {}) {
        const p = opciones.prefijo || 'apoyos';

        contenedor.innerHTML = `
        <div class="ap">
            <p class="ap-pregunta">${PREGUNTA}</p>
            <p class="ap-ayuda">${AYUDA}</p>

            <div class="ap-salidas">${SALIDAS.map(([c, t]) => chip(c, t)).join('')}</div>

            <div class="ap-grupos">
                ${GRUPOS.map(g => `
                <details class="ap-grupo" data-grupo="${g.id}">
                    <summary>
                        <span class="ap-grupo-titulo">${g.titulo}</span>
                        <span class="ap-contador" hidden></span>
                    </summary>
                    <div class="ap-grupo-cuerpo">
                        <p class="ap-grupo-pregunta">${g.pregunta}${g.ayuda ? ' <span class="ap-grupo-ayuda">' + g.ayuda + '</span>' : ''}</p>
                        <div class="ap-chips">${g.opciones.map(([c, t]) => chip(c, t)).join('')}</div>
                    </div>
                </details>`).join('')}
            </div>

            <p class="ap-sugerencia" hidden>Si necesitas intérprete en otros momentos (por ejemplo, en capacitaciones), cuéntalo en «Algo más que te ayude».</p>

            <div class="ap-nota">
                <label for="${p}-nota">Algo más que te ayude <span>(opcional)</span></label>
                <textarea id="${p}-nota" rows="3" maxlength="${MAX_NOTA}"
                    placeholder="Cuéntanos con tus palabras. Por ejemplo: «Prefiero reuniones con agenda previa» o «Necesito una silla con soporte lumbar»."></textarea>
                <div class="ap-nota-pie">
                    <span>No necesitas contarnos el motivo ni tu historia médica.</span>
                    <span class="ap-nota-contador">0/${MAX_NOTA}</span>
                </div>
            </div>

            <label class="ap-autoriza" hidden>
                <input type="checkbox" id="${p}-autoriza">
                <span>${AUTORIZACION}</span>
            </label>
            <p class="ap-error" role="alert" hidden></p>

            <div class="ap-pie">
                <span>Puedes cambiarlo cuando quieras desde tu perfil.</span>
                <button type="button" class="ap-quitar">Quitar todo</button>
            </div>
        </div>`;

        const raiz = contenedor.querySelector('.ap');
        const cajas = Array.from(raiz.querySelectorAll('.ap-chip input'));
        const nota = raiz.querySelector('textarea');
        const contadorNota = raiz.querySelector('.ap-nota-contador');
        const autoriza = raiz.querySelector('.ap-autoriza input');
        const filaAutoriza = raiz.querySelector('.ap-autoriza');
        const errorEl = raiz.querySelector('.ap-error');
        const sugerencia = raiz.querySelector('.ap-sugerencia');

        const marcadas = () => cajas.filter(c => c.checked).map(c => c.value);
        const hayExclusiva = () => marcadas().some(v => CODIGOS_SALIDA.includes(v));
        const concretas = () => marcadas().filter(v => !CODIGOS_SALIDA.includes(v));
        const esSensible = () => concretas().length > 0 || (!hayExclusiva() && nota.value.trim() !== '');

        function actualizar() {
            raiz.querySelectorAll('.ap-grupo').forEach(det => {
                const n = det.querySelectorAll('.ap-chips input:checked').length;
                const c = det.querySelector('.ap-contador');
                c.textContent = n;
                c.hidden = n === 0;
                c.title = n === 1 ? '1 seleccionada' : n + ' seleccionadas';
            });
            nota.disabled = hayExclusiva();
            contadorNota.textContent = nota.value.length + '/' + MAX_NOTA;
            sugerencia.hidden = !marcadas().some(v => CODIGOS_INTERPRETE.includes(v));
            filaAutoriza.hidden = !esSensible();
            errorEl.hidden = true;
        }

        raiz.addEventListener('change', (e) => {
            const caja = e.target;
            if (caja.matches('.ap-chip input')) {
                if (caja.checked) {
                    const esSalida = CODIGOS_SALIDA.includes(caja.value);
                    cajas.forEach(otra => {
                        if (otra === caja) return;
                        if (esSalida) otra.checked = false;                                   // una salida desmarca todo lo demás
                        else if (CODIGOS_SALIDA.includes(otra.value)) otra.checked = false;   // una opción concreta desmarca las salidas
                    });
                }
                actualizar();
            } else if (caja === autoriza) {
                errorEl.hidden = true;
            }
        });

        nota.addEventListener('input', actualizar);

        raiz.querySelector('.ap-quitar').addEventListener('click', () => {
            cajas.forEach(c => { c.checked = false; });
            nota.value = '';
            autoriza.checked = false;
            actualizar();
        });

        actualizar();

        return {
            /** Datos listos para mandar al servidor. */
            leer() {
                const texto = !hayExclusiva() && nota.value.trim() ? nota.value.trim() : null;
                return {
                    apoyos: marcadas(),
                    apoyosNota: texto,
                    autorizaTratamientoApoyos: autoriza.checked
                };
            },
            /** Carga lo que el servidor tiene guardado. */
            escribir(codigos, textoNota) {
                const set = new Set(codigos || []);
                cajas.forEach(c => { c.checked = set.has(c.value); });
                nota.value = textoNota || '';
                autoriza.checked = esSensible();      // si hay algo sensible guardado, ya había autorizado
                actualizar();
                raiz.querySelectorAll('.ap-grupo').forEach(det => {
                    det.open = det.querySelectorAll('.ap-chips input:checked').length > 0;
                });
            },
            /** Devuelve un mensaje de error (y lo muestra) o null si todo está bien. */
            validar() {
                if (esSensible() && !autoriza.checked) {
                    errorEl.textContent = 'Para guardar esta información debes autorizar su tratamiento.';
                    errorEl.hidden = false;
                    filaAutoriza.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    autoriza.focus({ preventScroll: true });
                    return errorEl.textContent;
                }
                return null;
            }
        };
    }

    /* ── Vista de solo lectura ── */

    // Agrupa los códigos por grupo del catálogo; las respuestas de salida no cuentan.
    function agrupar(codigos) {
        const set = new Set(codigos || []);
        return GRUPOS
            .map(g => ({ titulo: g.titulo, etiquetas: g.opciones.filter(([c]) => set.has(c)).map(([, t]) => t) }))
            .filter(g => g.etiquetas.length > 0);
    }

    // Perfil del trabajador: resumen de lo que ya guardó
    function pintarVista(contenedor, codigos, textoNota) {
        const set = new Set(codigos || []);
        const grupos = agrupar(codigos);
        contenedor.innerHTML = '';

        const parrafo = (clase, texto) => {
            const p = document.createElement('p');
            p.className = clase;
            p.textContent = texto;
            return p;
        };

        if (grupos.length === 0 && !textoNota) {
            contenedor.appendChild(parrafo('inc-texto',
                set.has('NINGUNO') ? 'Indicaste que no necesitas ajustes por ahora.'
                : set.has('DESPUES') ? 'Prefieres hablarlo más adelante.'
                : 'Aún no has indicado preferencias o apoyos.'));
            return;
        }

        grupos.forEach(g => {
            const div = document.createElement('div');
            div.className = 'ap-vista-grupo';

            const titulo = document.createElement('div');
            titulo.className = 'ap-vista-titulo';
            titulo.textContent = g.titulo;

            const chips = document.createElement('div');
            chips.className = 'ap-vista-chips';
            g.etiquetas.forEach(et => {
                const s = document.createElement('span');
                s.className = 'ap-vista-chip';
                s.textContent = et;
                chips.appendChild(s);
            });

            div.append(titulo, chips);
            contenedor.appendChild(div);
        });

        if (textoNota) contenedor.appendChild(parrafo('ap-vista-nota', 'Algo más: ' + textoNota));
        contenedor.appendChild(parrafo('inc-texto', 'Las empresas a las que te postulas pueden ver esta información.'));
    }

    return { render, pintarVista, agrupar, etiqueta: (codigo) => ETIQUETAS[codigo] || codigo };
})();