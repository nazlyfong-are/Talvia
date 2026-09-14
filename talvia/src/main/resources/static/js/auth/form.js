/* ============================================
   TALVIA REGISTER — JavaScript
   Validaciones colombianas + fetch al backend
   Incluye: especialidad/ciudad/sector como select, experiencia
   con unidad meses/años, y adjuntar documentos (formación
   y certificaciones) subidos directo a Cloudinary vía multipart
============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const wrapper          = document.getElementById('register-wrapper');
    const tabNatural       = document.getElementById('tab-natural');
    const tabJuridica      = document.getElementById('tab-juridica');
    const registerTitle    = document.getElementById('register-title');
    const registerSubtitle = document.getElementById('register-subtitle');
    const modePillLabel    = document.getElementById('mode-pill-label');
    const form             = document.getElementById('registration-form');
    const registerBtn      = document.getElementById('register-btn');

    // Estado inicial
    wrapper.classList.add('mode-natural');
    toggleRequirements(false);

    // ── CAMBIO DE TABS ──
    tabNatural.addEventListener('click', () => {
        tabJuridica.classList.remove('active');
        tabNatural.classList.add('active');
        wrapper.classList.remove('mode-juridica');
        wrapper.classList.add('mode-natural');
        registerTitle.textContent    = 'Crear cuenta';
        registerSubtitle.textContent = 'Complete todos los campos para registrar su usuario.';
        modePillLabel.textContent    = 'Persona Natural';
        toggleRequirements(false);
        clearErrors();
    });

    tabJuridica.addEventListener('click', () => {
        tabNatural.classList.remove('active');
        tabJuridica.classList.add('active');
        wrapper.classList.remove('mode-natural');
        wrapper.classList.add('mode-juridica');
        registerTitle.textContent    = 'Crear cuenta empresarial';
        registerSubtitle.textContent = 'Complete todos los campos para registrar su empresa.';
        modePillLabel.textContent    = 'Persona Jurídica';
        toggleRequirements(true);
        clearErrors();
    });

    // ── FORMATO NIT EN TIEMPO REAL ──
    const nitInput = document.getElementById('nit');
    if (nitInput) {
        nitInput.addEventListener('input', function () {
            let raw = this.value.replace(/[^0-9]/g, '');
            if (raw.length > 10) raw = raw.slice(0, 10);
            if (raw.length > 9) {
                this.value = raw.slice(0, 9) + '-' + raw.slice(9);
            } else {
                this.value = raw;
            }
        });
        nitInput.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && this.value.endsWith('-')) {
                e.preventDefault();
                this.value = this.value.slice(0, -1);
            }
        });
    }

    // ── RESTRICCIÓN EN TIEMPO REAL: DOCUMENTO NATURAL ──
    const tipoDocSelect = document.getElementById('tipo-documento');
    const numDocInput   = document.getElementById('num-documento');
    if (numDocInput && tipoDocSelect) {
        tipoDocSelect.addEventListener('change', () => {
            numDocInput.value = '';
            clearFieldError('num-documento');
            actualizarPlaceholderDoc();
        });
        numDocInput.addEventListener('input', function () {
            const tipo = tipoDocSelect.value;
            if (tipo === 'CC') {
                this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
            } else if (tipo === 'CE') {
                this.value = this.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 7).toUpperCase();
            }
        });
    }

    function actualizarPlaceholderDoc() {
        if (!numDocInput || !tipoDocSelect) return;
        const tipo = tipoDocSelect.value;
        if (tipo === 'CC') numDocInput.placeholder = '6 a 10 dígitos';
        else if (tipo === 'CE') numDocInput.placeholder = '4 a 7 caracteres';
        else numDocInput.placeholder = 'Número de documento';
    }

    // ── RESTRICCIÓN TELÉFONO: solo 10 dígitos ──
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
        });
    }

    // ── RESTRICCIÓN AÑOS/MESES DE EXPERIENCIA: solo números ──
    const experienciaValorInput = document.getElementById('experiencia-valor');
    if (experienciaValorInput) {
        experienciaValorInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 2);
        });
    }

    // ── CIUDAD "OTRA" ──
    const ciudadSelect = document.getElementById('ciudad');
    const ciudadOtraInput = document.getElementById('ciudad-otra');
    if (ciudadSelect && ciudadOtraInput) {
        ciudadSelect.addEventListener('change', function () {
            ciudadOtraInput.classList.toggle('oculto', this.value !== 'otra');
            if (this.value !== 'otra') ciudadOtraInput.value = '';
        });
    }

    // ── TOGGLE CONTRASEÑAS ──
    setupPasswordToggle('password', 'togglePwd1');
    setupPasswordToggle('confirm-password', 'togglePwd2');

    // ── LIMPIAR ERROR AL EDITAR ──
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input',  () => clearFieldError(el.id));
        el.addEventListener('change', () => clearFieldError(el.id));
    });

    // ── FILAS DINÁMICAS: CV OPCIONAL ──
    document.getElementById('add-formacion')?.addEventListener('click', () => {
        document.getElementById('formaciones-container').appendChild(crearFilaFormacion());
    });
    document.getElementById('add-experiencia')?.addEventListener('click', () => {
        document.getElementById('experiencias-container').appendChild(crearFilaExperiencia());
    });
    document.getElementById('add-habilidad')?.addEventListener('click', () => {
        document.getElementById('habilidades-container').appendChild(crearFilaHabilidad());
    });
    document.getElementById('add-certificacion')?.addEventListener('click', () => {
        document.getElementById('certificaciones-container').appendChild(crearFilaCertificacion());
    });

    // ── ENVÍO DEL FORMULARIO ──
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const isJuridica = wrapper.classList.contains('mode-juridica');
        let hasError = false;

        // ── VALIDACIONES PERSONA NATURAL ──
        if (!isJuridica) {
            const nombres         = document.getElementById('nombres').value.trim();
            const primerApellido  = document.getElementById('primer-apellido').value.trim();
            const segundoApellido = document.getElementById('segundo-apellido').value.trim();
            const tipoDoc         = document.getElementById('tipo-documento').value;
            const numDoc          = document.getElementById('num-documento').value.trim();

            if (!nombres || nombres.length < 2) {
                showFieldError('nombres', 'Ingrese un nombre válido (mínimo 2 caracteres).');
                hasError = true;
            }
            if (!primerApellido) {
                showFieldError('primer-apellido', 'El primer apellido es obligatorio.');
                hasError = true;
            }
            if (!segundoApellido) {
                showFieldError('segundo-apellido', 'El segundo apellido es obligatorio.');
                hasError = true;
            }
            if (!tipoDoc) {
                showFieldError('tipo-documento', 'Seleccione el tipo de documento.');
                hasError = true;
            } else if (tipoDoc === 'CC') {
                if (!/^[0-9]{6,10}$/.test(numDoc)) {
                    showFieldError('num-documento', 'La CC debe tener entre 6 y 10 dígitos numéricos.');
                    hasError = true;
                }
            } else if (tipoDoc === 'CE') {
                if (!/^[A-Z0-9]{4,7}$/.test(numDoc)) {
                    showFieldError('num-documento', 'La CE debe tener entre 4 y 7 caracteres alfanuméricos.');
                    hasError = true;
                }
            }

            // Validar ciudad "otra"
            if (ciudadSelect.value === 'otra' && !ciudadOtraInput.value.trim()) {
                showFieldError('ciudad-otra', 'Escriba el nombre de su ciudad.');
                hasError = true;
            }
        }

        // ── VALIDACIONES EMPRESA ──
        if (isJuridica) {
            const razonSocial = document.getElementById('razon-social').value.trim();
            const figuraLegal = document.getElementById('figura-legal').value;
            const sector      = document.getElementById('sector').value;
            const nit         = document.getElementById('nit').value.trim();

            if (!razonSocial) {
                showFieldError('razon-social', 'La razón social es obligatoria.');
                hasError = true;
            }
            if (!figuraLegal) {
                showFieldError('figura-legal', 'Seleccione la figura legal.');
                hasError = true;
            }
            if (!sector) {
                showFieldError('sector', 'Seleccione un sector.');
                hasError = true;
            }
            if (!/^[0-9]{9}-[0-9]{1}$/.test(nit)) {
                showFieldError('nit', 'El NIT debe tener el formato 123456789-0.');
                hasError = true;
            }
        }

        // ── VALIDACIONES COMUNES ──
        const correo      = document.getElementById('correo').value.trim();
        const telefono    = document.getElementById('telefono').value.trim();
        const pass        = document.getElementById('password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            showFieldError('correo', 'Ingrese un correo electrónico válido.');
            hasError = true;
        }

        // Teléfono colombiano: móvil 3XXXXXXXXX (10 dígitos) o fijo 60X/1-8 + 7 dígitos
        if (!/^(3[0-9]{9}|60[1-9][0-9]{7}|[1-8][0-9]{7})$/.test(telefono)) {
            showFieldError('telefono', 'Ingrese un número colombiano válido. Ej: 3001234567 (móvil) o 6011234567 (fijo).');
            hasError = true;
        }

        if (pass.length < 8) {
            showFieldError('password', 'La contraseña debe tener al menos 8 caracteres.');
            hasError = true;
        } else if (!/[A-Z]/.test(pass)) {
            showFieldError('password', 'Debe incluir al menos una letra mayúscula.');
            hasError = true;
        } else if (!/[0-9]/.test(pass)) {
            showFieldError('password', 'Debe incluir al menos un número.');
            hasError = true;
        }

        if (!hasError && pass !== confirmPass) {
            showFieldError('confirm-password', 'Las contraseñas no coinciden.');
            hasError = true;
        }

        if (hasError) {
            showToast('Corrija los errores marcados antes de continuar.', 'error');
            const firstError = document.querySelector('.input-error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // ── VALIDAR CIUDAD "OTRA" (valor final a enviar) ──
        let ciudadFinal = '';
        if (!isJuridica) {
            ciudadFinal = document.getElementById('ciudad').value;
            if (ciudadFinal === 'otra') {
                ciudadFinal = document.getElementById('ciudad-otra').value.trim();
            }
        }

        // ── CALCULAR EXPERIENCIA (solo si se ingresó algo) ──
        let anosExperienciaTotal = null;
        if (!isJuridica) {
            const expValor  = document.getElementById('experiencia-valor').value.trim();
            const expUnidad = document.getElementById('experiencia-unidad').value;
            if (expValor) {
                const num = parseInt(expValor, 10);
                anosExperienciaTotal = expUnidad === 'MESES' ? Math.round((num / 12) * 100) / 100 : num;
            }
        }

        // ── FETCH AL BACKEND ──
        const endpoint = isJuridica ? '/api/register/empresa' : '/api/register/trabajador';

        registerBtn.classList.add('loading');

        if (isJuridica) {
            // ── EMPRESA: JSON normal, sin archivos ──
            const body = {
                razonSocial:       document.getElementById('razon-social').value.trim(),
                figuraLegal:       document.getElementById('figura-legal').value,
                sector:            document.getElementById('sector').value,
                nit:               document.getElementById('nit').value.trim(),
                correoElectronico: correo,
                numeroTelefono:    telefono,
                contrasena:        pass
            };

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Error al registrar la cuenta.');
                }

                showToast('✓ Cuenta empresarial creada exitosamente. Redirigiendo…', 'success');
                setTimeout(() => { window.location.href = '/public/login'; }, 2000);

            } catch (err) {
                showToast(err.message || 'Error al conectar con el servidor.', 'error');
            } finally {
                registerBtn.classList.remove('loading');
            }

        } else {
            // ── TRABAJADOR: multipart/form-data, con archivos adjuntos si los hay ──
            const { datos: formaciones, archivos: archivosFormacion }         = recolectarFormaciones();
            const { datos: certificaciones, archivos: archivosCertificacion } = recolectarCertificaciones();

            const datosJson = {
                nombres:           document.getElementById('nombres').value.trim(),
                primerApellido:    document.getElementById('primer-apellido').value.trim(),
                segundoApellido:   document.getElementById('segundo-apellido').value.trim(),
                tipoDocumento:     document.getElementById('tipo-documento').value,
                numeroDocumento:   document.getElementById('num-documento').value.trim(),
                correoElectronico: correo,
                numeroTelefono:    telefono,
                contrasena:        pass,

                especialidad:          document.getElementById('especialidad').value,
                resumenProfesional:    document.getElementById('resumen-profesional').value.trim(),
                ciudad:                ciudadFinal,
                anosExperienciaTotal:  anosExperienciaTotal,

                formaciones:     formaciones,
                experiencias:    recolectarExperiencias(),
                habilidades:     recolectarHabilidades(),
                certificaciones: certificaciones
            };

            const formData = new FormData();
            formData.append('datos', new Blob([JSON.stringify(datosJson)], { type: 'application/json' }));

            archivosFormacion.forEach((archivo, i) => {
                if (archivo) formData.append(`formacionDoc_${i}`, archivo);
            });
            archivosCertificacion.forEach((archivo, i) => {
                if (archivo) formData.append(`certificacionDoc_${i}`, archivo);
            });

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData
                    // Sin header Content-Type: el navegador lo arma solo con el boundary correcto para multipart
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Error al registrar la cuenta.');
                }

                showToast('✓ Cuenta creada exitosamente. Redirigiendo…', 'success');
                setTimeout(() => { window.location.href = '/public/login'; }, 2000);

            } catch (err) {
                showToast(err.message || 'Error al conectar con el servidor.', 'error');
            } finally {
                registerBtn.classList.remove('loading');
            }
        }
    });
});

// ── CONTROL DE required SEGÚN MODO ──
function toggleRequirements(isJuridica) {
    const fieldsNatural  = ['nombres', 'primer-apellido', 'segundo-apellido', 'tipo-documento', 'num-documento'];
    const fieldsJuridica = ['razon-social', 'figura-legal', 'sector', 'nit'];
    fieldsNatural.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.required = !isJuridica;
    });
    fieldsJuridica.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.required = isJuridica;
    });
}

// ── TOGGLE CONTRASEÑA ──
function setupPasswordToggle(inputId, btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
        const input  = document.getElementById(inputId);
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        const eyeOn  = btn.querySelector('.eye-on');
        const eyeOff = btn.querySelector('.eye-off');
        if (eyeOn)  eyeOn.style.display  = isHidden ? 'none'  : 'block';
        if (eyeOff) eyeOff.style.display = isHidden ? 'block' : 'none';
        btn.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
}

// ── ERRORES POR CAMPO ──
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('input-error');
    const group = field.closest('.field-group');
    if (!group) return;
    const prev = group.querySelector('.field-error-msg');
    if (prev) prev.remove();
    const msg = document.createElement('span');
    msg.className   = 'field-error-msg';
    msg.textContent = message;
    group.appendChild(msg);
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.remove('input-error');
    const group = field.closest('.field-group');
    if (group) group.querySelector('.field-error-msg')?.remove();
}

function clearErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.field-error-msg').forEach(el => el.remove());
}

// ── TOAST ──
let toastTimer;
function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className   = `toast ${type}`;
    void toast.offsetWidth;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ============================================
   CV OPCIONAL — Filas dinámicas
   (Formación, Experiencia, Habilidades, Certificaciones)
============================================ */

function crearFilaFormacion() {
    const div = document.createElement('div');
    div.className = 'dynamic-row formacion-row';
    div.innerHTML = `
        <input type="text" class="f-institucion" placeholder="Institución" />
        <input type="text" class="f-titulo" placeholder="Título obtenido" />
        <select class="f-nivel">
            <option value="">Nivel</option>
            <option value="BACHILLER">Bachiller</option>
            <option value="TECNICO">Técnico</option>
            <option value="TECNOLOGO">Tecnólogo</option>
            <option value="PROFESIONAL">Profesional</option>
            <option value="ESPECIALIZACION">Especialización</option>
            <option value="MAESTRIA">Maestría</option>
            <option value="DOCTORADO">Doctorado</option>
        </select>
        <input type="date" class="f-fecha-inicio" />
        <input type="date" class="f-fecha-fin" />
        <label><input type="checkbox" class="f-en-curso" /> En curso</label>
        <div class="file-attach-row">
            <input type="file" class="f-documento" accept=".pdf,image/*" style="display:none;" />
            <label class="btn-attach">📎 Adjuntar título</label>
            <span class="file-attach-hint">Opcional — puedes hacerlo después desde tu perfil.</span>
            <span class="file-attach-name"></span>
        </div>
        <button type="button" class="btn-remove-row">✕</button>
    `;
    const inputArchivo = div.querySelector('.f-documento');
    const labelAttach  = div.querySelector('.btn-attach');
    const nombreArchivo = div.querySelector('.file-attach-name');
    labelAttach.addEventListener('click', () => inputArchivo.click());
    inputArchivo.addEventListener('change', () => {
        nombreArchivo.textContent = inputArchivo.files[0] ? `✓ ${inputArchivo.files[0].name}` : '';
    });
    div.querySelector('.btn-remove-row').addEventListener('click', () => div.remove());
    return div;
}

function crearFilaExperiencia() {
    const div = document.createElement('div');
    div.className = 'dynamic-row experiencia-row';
    div.innerHTML = `
        <input type="text" class="e-empresa" placeholder="Nombre de la empresa" />
        <input type="text" class="e-cargo" placeholder="Cargo" />
        <input type="date" class="e-fecha-inicio" />
        <input type="date" class="e-fecha-fin" />
        <input type="text" class="e-descripcion" placeholder="Descripción breve" />
        <label><input type="checkbox" class="e-actual" /> Trabajo actual</label>
        <button type="button" class="btn-remove-row">✕</button>
    `;
    div.querySelector('.btn-remove-row').addEventListener('click', () => div.remove());
    return div;
}

function crearFilaHabilidad() {
    const div = document.createElement('div');
    div.className = 'dynamic-row habilidad-row';
    div.innerHTML = `
        <input type="text" class="h-nombre" placeholder="Ej: Java, Spring Boot" />
        <select class="h-nivel">
            <option value="">Nivel</option>
            <option value="BASICO">Básico</option>
            <option value="INTERMEDIO">Intermedio</option>
            <option value="AVANZADO">Avanzado</option>
            <option value="EXPERTO">Experto</option>
        </select>
        <select class="h-categoria">
            <option value="">Categoría</option>
            <option value="Técnica">Técnica</option>
            <option value="Blanda">Blanda</option>
            <option value="Idioma">Idioma</option>
        </select>
        <button type="button" class="btn-remove-row">✕</button>
    `;
    div.querySelector('.btn-remove-row').addEventListener('click', () => div.remove());
    return div;
}

function crearFilaCertificacion() {
    const div = document.createElement('div');
    div.className = 'dynamic-row certificacion-row';
    div.innerHTML = `
        <input type="text" class="c-nombre" placeholder="Nombre de la certificación" />
        <input type="text" class="c-entidad" placeholder="Entidad emisora" />
        <input type="date" class="c-fecha-obtencion" />
        <input type="date" class="c-fecha-vencimiento" />
        <div class="file-attach-row">
            <input type="file" class="c-documento" accept=".pdf,image/*" style="display:none;" />
            <label class="btn-attach">📎 Adjuntar certificado</label>
            <span class="file-attach-hint">Opcional — puedes hacerlo después desde tu perfil.</span>
            <span class="file-attach-name"></span>
        </div>
        <button type="button" class="btn-remove-row">✕</button>
    `;
    const inputArchivo = div.querySelector('.c-documento');
    const labelAttach  = div.querySelector('.btn-attach');
    const nombreArchivo = div.querySelector('.file-attach-name');
    labelAttach.addEventListener('click', () => inputArchivo.click());
    inputArchivo.addEventListener('change', () => {
        nombreArchivo.textContent = inputArchivo.files[0] ? `✓ ${inputArchivo.files[0].name}` : '';
    });
    div.querySelector('.btn-remove-row').addEventListener('click', () => div.remove());
    return div;
}

/* ============================================
   RECOLECCIÓN DE DATOS DE LAS FILAS DINÁMICAS
============================================ */

function recolectarFormaciones() {
    const filas = Array.from(document.querySelectorAll('#formaciones-container .formacion-row'))
        .filter(row => row.querySelector('.f-institucion').value.trim());

    const datos = filas.map(row => ({
        institucion: row.querySelector('.f-institucion').value.trim(),
        titulo: row.querySelector('.f-titulo').value.trim(),
        nivel: row.querySelector('.f-nivel').value,
        fechaInicio: row.querySelector('.f-fecha-inicio').value,
        fechaFin: row.querySelector('.f-fecha-fin').value,
        enCurso: row.querySelector('.f-en-curso').checked
    }));

    const archivos = filas.map(row => row.querySelector('.f-documento').files[0] || null);

    return { datos, archivos };
}

function recolectarExperiencias() {
    return Array.from(document.querySelectorAll('#experiencias-container .experiencia-row')).map(row => ({
        empresaNombre: row.querySelector('.e-empresa').value.trim(),
        cargo: row.querySelector('.e-cargo').value.trim(),
        fechaInicio: row.querySelector('.e-fecha-inicio').value,
        fechaFin: row.querySelector('.e-fecha-fin').value,
        descripcion: row.querySelector('.e-descripcion').value.trim(),
        trabajoActual: row.querySelector('.e-actual').checked
    })).filter(e => e.empresaNombre);
}

function recolectarHabilidades() {
    return Array.from(document.querySelectorAll('#habilidades-container .habilidad-row')).map(row => ({
        nombre: row.querySelector('.h-nombre').value.trim(),
        nivel: row.querySelector('.h-nivel').value,
        categoria: row.querySelector('.h-categoria').value
    })).filter(h => h.nombre);
}

function recolectarCertificaciones() {
    const filas = Array.from(document.querySelectorAll('#certificaciones-container .certificacion-row'))
        .filter(row => row.querySelector('.c-nombre').value.trim());

    const datos = filas.map(row => ({
        nombre: row.querySelector('.c-nombre').value.trim(),
        entidadEmisora: row.querySelector('.c-entidad').value.trim(),
        fechaObtencion: row.querySelector('.c-fecha-obtencion').value,
        fechaVencimiento: row.querySelector('.c-fecha-vencimiento').value
    }));

    const archivos = filas.map(row => row.querySelector('.c-documento').files[0] || null);

    return { datos, archivos };
}