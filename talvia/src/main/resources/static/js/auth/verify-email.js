/* ============================================
   VERIFICAR CORREO — código de activación de cuenta
============================================ */

let correoActual = '';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    correoActual = params.get('correo') || '';
    document.getElementById('correo-mostrado').textContent = correoActual || 'tu correo';

    document.getElementById('form-verificar').addEventListener('submit', verificarCodigo);
    document.getElementById('btn-reenviar-verificacion').addEventListener('click', reenviarCodigo);
});

async function verificarCodigo(e) {
    e.preventDefault();
    const codigo = document.getElementById('codigo-verificar').value.trim();
    const btn = document.getElementById('btn-verificar');
    btn.disabled = true;
    btn.textContent = 'Verificando...';

    try {
        const resp = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correoElectronico: correoActual, codigo })
        });
        if (!resp.ok) throw new Error(await resp.text());

        document.getElementById('paso-verificar').classList.add('oculto');
        document.getElementById('paso-exito').classList.remove('oculto');

    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Verificar cuenta';
    }
}

async function reenviarCodigo() {
    if (!correoActual) {
        showToast('No se encontró tu correo. Vuelve a registrarte o inicia sesión para reenviar.', 'error');
        return;
    }
    try {
        await fetch('/api/auth/resend-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correoElectronico: correoActual })
        });
        showToast('✓ Código reenviado, revisa tu correo.', 'success');
    } catch (err) {
        showToast('Error al reenviar: ' + err.message, 'error');
    }
}

function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3800);
}