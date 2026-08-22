/* ============================================
   NEXUM LOGIN — JavaScript (dual mode)
   Modes: 'client' | 'admin'
============================================ */

let currentMode = 'client';

// ── AL CARGAR LA PÁGINA ──
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('error') === 'unauthorized') {
    showToast('USTED NO DEBE ACCEDER A ESTE APARTADO. SOLO TRABAJADORES.', 'error');
  }
});

// ── SWITCH MODE ──
function switchMode() {
  currentMode = currentMode === 'client' ? 'admin' : 'client';
  applyMode(currentMode);
}

function applyMode(mode) {
  const body              = document.body;
  const btnLabel          = document.getElementById('adminBtnLabel');
  const btnIcon           = document.getElementById('adminBtnIcon');
  const modePillLabel     = document.getElementById('modePillLabel');
  const formEyebrow       = document.getElementById('formEyebrow');
  const formTitle         = document.getElementById('formTitle');
  const formSubtitle      = document.getElementById('formSubtitle');
  const loginBtnText      = document.getElementById('loginBtnText');
  const clientBrand       = document.getElementById('clientBrand');
  const clientStats       = document.getElementById('clientStats');
  const adminBrand        = document.getElementById('adminBrand');
  const adminStats        = document.getElementById('adminStats');
  const securityCodeGroup = document.getElementById('securityCodeGroup');
  const rememberRow       = document.getElementById('rememberRow');
  const clientFooter      = document.getElementById('clientFooterActions');
  const pageTitle         = document.querySelector('title');

  if (mode === 'admin') {
    body.setAttribute('data-mode', 'admin');
    btnLabel.textContent = 'Clientes';
    btnIcon.innerHTML = `<path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>`;
    modePillLabel.textContent = 'Panel Administrativo';
    formEyebrow.textContent  = 'Acceso restringido';
    formTitle.textContent    = 'Admin';
    formSubtitle.textContent = 'Solo personal autorizado. Sesión auditada.';
    loginBtnText.textContent = 'Acceder al panel';
    pageTitle.textContent    = 'Panel Admin — NEXUM';
    clientBrand.classList.add('hidden');
    clientStats.classList.add('hidden');
    adminBrand.classList.remove('hidden');
    adminStats.classList.remove('hidden');
    securityCodeGroup.classList.remove('hidden');
    document.getElementById('securityCode').required = true;
    rememberRow.classList.add('hidden');
    clientFooter.classList.add('hidden');
  } else {
    body.setAttribute('data-mode', 'client');
    btnLabel.textContent = 'Admin';
    btnIcon.innerHTML = `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`;
    modePillLabel.textContent = 'Acceso Cliente';
    formEyebrow.textContent  = 'Bienvenido de nuevo';
    formTitle.textContent    = 'Iniciar sesión';
    formSubtitle.textContent = 'Ingresa tus credenciales para continuar';
    loginBtnText.textContent = 'Ingresar';
    pageTitle.textContent    = 'Iniciar Sesión — NEXUM';
    clientBrand.classList.remove('hidden');
    clientStats.classList.remove('hidden');
    adminBrand.classList.add('hidden');
    adminStats.classList.add('hidden');
    securityCodeGroup.classList.add('hidden');
    document.getElementById('securityCode').required = false;
    rememberRow.classList.remove('hidden');
    clientFooter.classList.remove('hidden');
  }

  document.getElementById('email').value        = '';
  document.getElementById('password').value     = '';
  document.getElementById('securityCode').value = '';
  resetPasswordVisibility();
}

// ── TOGGLE PASSWORD VISIBILITY ──
function togglePassword() {
  const input   = document.getElementById('password');
  const eyeOn   = document.getElementById('eyeIcon');
  const eyeOff  = document.getElementById('eyeOffIcon');
  const btn     = document.getElementById('togglePwd');
  const isHidden = input.type === 'password';
  input.type              = isHidden ? 'text' : 'password';
  eyeOn.style.display     = isHidden ? 'none'  : 'block';
  eyeOff.style.display    = isHidden ? 'block' : 'none';
  btn.setAttribute('aria-label', isHidden ? 'Ocultar contraseña' : 'Mostrar contraseña');
}

function resetPasswordVisibility() {
  const input  = document.getElementById('password');
  const eyeOn  = document.getElementById('eyeIcon');
  const eyeOff = document.getElementById('eyeOffIcon');
  input.type           = 'password';
  eyeOn.style.display  = 'block';
  eyeOff.style.display = 'none';
}

// ── SECURITY CODE FORMATTING ──
document.getElementById('securityCode').addEventListener('input', function () {
  let val = this.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4, 8);
  this.value = val;
});

// ── TOAST NOTIFICATIONS ──
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

// ── FORM SUBMISSION ──
async function handleLogin(event) {
  event.preventDefault();

  const btn      = document.getElementById('loginBtn');
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const isAdmin  = currentMode === 'admin';

  if (!email || !password) {
    showToast('Por favor completa todos los campos.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showToast('Ingresa un correo electrónico válido.', 'error');
    shakeField('email');
    return;
  }

  if (password.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
    shakeField('password');
    return;
  }

  let securityCode = null;
  if (isAdmin) {
    securityCode = document.getElementById('securityCode').value.trim();
    if (!securityCode || securityCode.length < 9) {
      showToast('Ingresa el código de seguridad completo.', 'error');
      shakeField('securityCode');
      return;
    }
  }

  btn.classList.add('loading');

  try {
    const data = await realAuth(email, password, securityCode);

   // Solo bloquear si el rol no es ADMIN ni TRABAJADOR
if (isAdmin && data.role !== 'ADMIN' && data.role !== 'TRABAJADOR' && data.role !== 'SUPER_ADMIN') {
    showToast('Acceso restringido. Solo administradores y trabajadores.', 'error');
    shakeField('email');
    shakeField('password');
    return;
}

// Admin intentando entrar por modo cliente
if (!isAdmin && (data.role === 'ADMIN' || data.role === 'TRABAJADOR')) {
    showToast('Usa el modo Admin para ingresar con este perfil.', 'error');
    shakeField('email');
    shakeField('password');
    return;
}

    showToast(
      isAdmin ? '✓ Acceso admin concedido. Cargando panel…' : '✓ Sesión iniciada. Redirigiendo…',
      'success'
    );

    setTimeout(() => {
      if (data.role === 'SUPER_ADMIN') {
    window.location.href = '/private/superadmin/dashboard';
} else if (data.role === 'ADMIN') {
    window.location.href = '/private/admin/main_admins';
} else if (data.role === 'TRABAJADOR') {
    window.location.href = '/private/worker/worker_dashboard';
} else {
    window.location.href = '/private/customers/main_customers';
}
    }, 1500);

  } catch (err) {
    showToast(err.message || 'Credenciales incorrectas. Intenta de nuevo.', 'error');
    shakeField('email');
    shakeField('password');
  } finally {
    btn.classList.remove('loading');
  }
}

// ── HELPERS ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeField(fieldId) {
  const wrapper = document.getElementById(fieldId)?.closest('.input-wrapper') ||
                  document.getElementById(fieldId)?.closest('.field-group');
  if (!wrapper) return;
  wrapper.classList.remove('shake');
  void wrapper.offsetWidth;
  wrapper.classList.add('shake');
  wrapper.addEventListener('animationend', () => wrapper.classList.remove('shake'), { once: true });
}

// ── REAL AUTH (conecta con el backend) ──
async function realAuth(email, password, securityCode) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correoElectronico: email,
      contrasena: password,
      securityCode: securityCode
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Credenciales incorrectas.');
  }

  return response.json();
}

// ── KEYBOARD ACCESSIBILITY ──
document.getElementById('togglePwd')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePassword(); }
});