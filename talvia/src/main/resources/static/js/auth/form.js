/* ============================================
   NEXUM REGISTER — JavaScript
   Validaciones colombianas + fetch al backend
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

    // ── TOGGLE CONTRASEÑAS ──
    setupPasswordToggle('password', 'togglePwd1');
    setupPasswordToggle('confirm-password', 'togglePwd2');

    // ── LIMPIAR ERROR AL EDITAR ──
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input',  () => clearFieldError(el.id));
        el.addEventListener('change', () => clearFieldError(el.id));
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
        }

        // ── VALIDACIONES EMPRESA ──
        if (isJuridica) {
            const razonSocial = document.getElementById('razon-social').value.trim();
            const figuraLegal = document.getElementById('figura-legal').value;
            const nit         = document.getElementById('nit').value.trim();

            if (!razonSocial) {
                showFieldError('razon-social', 'La razón social es obligatoria.');
                hasError = true;
            }
            if (!figuraLegal) {
                showFieldError('figura-legal', 'Seleccione la figura legal.');
                hasError = true;
            }
            if (!/^[0-9]{9}-[0-9]{1}$/.test(nit)) {
                showFieldError('nit', 'El NIT debe tener el formato 123456789-0.');
                hasError = true;
            }
        }

        // ── VALIDACIONES COMUNES ──
        const correo     = document.getElementById('correo').value.trim();
        const telefono   = document.getElementById('telefono').value.trim();
        const pass       = document.getElementById('password').value;
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
            // Scroll al primer error
            const firstError = document.querySelector('.input-error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // ── FETCH AL BACKEND ──
        const endpoint = isJuridica ? '/api/register/empresa' : '/api/register/natural';

        let body;
        if (isJuridica) {
            body = {
                razonSocial:       document.getElementById('razon-social').value.trim(),
                figuraLegal:       document.getElementById('figura-legal').value,
                nit:               document.getElementById('nit').value.trim(),
                correoElectronico: correo,
                numeroTelefono:    telefono,
                contrasena:        pass
            };
        } else {
            body = {
                nombres:           document.getElementById('nombres').value.trim(),
                primerApellido:    document.getElementById('primer-apellido').value.trim(),
                segundoApellido:   document.getElementById('segundo-apellido').value.trim(),
                tipoDocumento:     document.getElementById('tipo-documento').value,
                numeroDocumento:   document.getElementById('num-documento').value.trim(),
                correoElectronico: correo,
                numeroTelefono:    telefono,
                contrasena:        pass
            };
        }

        registerBtn.classList.add('loading');

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

            showToast('✓ Cuenta creada exitosamente. Redirigiendo…', 'success');
            setTimeout(() => { window.location.href = '/public/login'; }, 2000);

        } catch (err) {
            showToast(err.message || 'Error al conectar con el servidor.', 'error');
        } finally {
            registerBtn.classList.remove('loading');
        }
    });
});

// ── CONTROL DE required SEGÚN MODO ──
function toggleRequirements(isJuridica) {
    const fieldsNatural  = ['nombres', 'primer-apellido', 'segundo-apellido', 'tipo-documento', 'num-documento'];
    const fieldsJuridica = ['razon-social', 'figura-legal', 'nit'];
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